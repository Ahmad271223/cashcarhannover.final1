from fastapi import FastAPI, APIRouter, HTTPException, UploadFile, File, Depends, Form
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.staticfiles import StaticFiles
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional
import uuid
from datetime import datetime, timezone
import jwt
import bcrypt
import aiofiles
import shutil

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# JWT Settings
JWT_SECRET = os.environ.get('JWT_SECRET', 'autoverkauf-pro-secret-key-2024')
JWT_ALGORITHM = 'HS256'

# Upload directory
UPLOAD_DIR = ROOT_DIR / 'uploads'
UPLOAD_DIR.mkdir(exist_ok=True)

# Create the main app
app = FastAPI(title="AutoVerkauf Pro API")

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

security = HTTPBearer()

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# ==================== MODELS ====================

class ContactInfo(BaseModel):
    first_name: str
    last_name: str
    email: EmailStr
    phone: str
    city: str

class PriceInfo(BaseModel):
    desired_price: float
    minimum_price: float
    competitor_price: Optional[float] = None
    competitor_source: Optional[str] = None

class CarSubmission(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    # Basic Info
    brand: str
    model: str
    variant: Optional[str] = None
    first_registration: str  # Format: MM/YYYY
    mileage: int
    # Technical
    fuel_type: str  # Benzin, Diesel, Hybrid, Elektro, Gas
    transmission: str  # Schaltgetriebe, Automatik
    power_hp: Optional[int] = None
    power_kw: Optional[int] = None
    engine_size: Optional[int] = None  # ccm
    # Body
    body_type: str  # Limousine, Kombi, SUV, Cabrio, Coupe, Van, Transporter
    doors: str  # 2/3, 4/5
    color: str
    interior_color: Optional[str] = None
    # Condition
    tuv_until: Optional[str] = None  # Format: MM/YYYY
    previous_owners: int
    accident_free: bool = True
    service_history: bool = False
    # Identifiers
    vin: str  # Fahrzeug-Identifizierungsnummer (FIN)
    # Media
    photos: List[str] = []
    documents: List[str] = []
    # Contact
    contact: ContactInfo
    # Pricing
    pricing: PriceInfo
    # Features
    features: List[str] = []
    description: Optional[str] = None
    # Status
    status: str = "Neu"  # Neu, In Bearbeitung, Inseriert, Verkauft, Abgelehnt
    admin_notes: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class CarSubmissionCreate(BaseModel):
    brand: str
    model: str
    variant: Optional[str] = None
    first_registration: str
    mileage: int
    fuel_type: str
    transmission: str
    power_hp: Optional[int] = None
    power_kw: Optional[int] = None
    engine_size: Optional[int] = None
    body_type: str
    doors: str
    color: str
    interior_color: Optional[str] = None
    tuv_until: Optional[str] = None
    previous_owners: int
    accident_free: bool = True
    service_history: bool = False
    vin: str
    photos: List[str] = []
    documents: List[str] = []
    contact: ContactInfo
    pricing: PriceInfo
    features: List[str] = []
    description: Optional[str] = None

class CarStatusUpdate(BaseModel):
    status: str
    admin_notes: Optional[str] = None

class AdminLogin(BaseModel):
    username: str
    password: str

class AdminUser(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    username: str
    password_hash: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

# ==================== HELPER FUNCTIONS ====================

def create_token(user_id: str, username: str) -> str:
    payload = {
        'user_id': user_id,
        'username': username,
        'exp': datetime.now(timezone.utc).timestamp() + 86400  # 24h
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        payload = jwt.decode(credentials.credentials, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token abgelaufen")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Ungültiger Token")

async def send_notification_email(car: CarSubmission):
    """Send email notification for new car submission"""
    sendgrid_key = os.environ.get('SENDGRID_API_KEY')
    admin_email = os.environ.get('ADMIN_EMAIL')
    sender_email = os.environ.get('SENDER_EMAIL')
    
    if not all([sendgrid_key, admin_email, sender_email]):
        logger.warning("SendGrid not configured, skipping email notification")
        return
    
    try:
        from sendgrid import SendGridAPIClient
        from sendgrid.helpers.mail import Mail
        
        html_content = f"""
        <h2>Neue Fahrzeug-Einreichung!</h2>
        <p><strong>Fahrzeug:</strong> {car.brand} {car.model} ({car.first_registration})</p>
        <p><strong>Kilometerstand:</strong> {car.mileage:,} km</p>
        <p><strong>Wunschpreis:</strong> {car.pricing.desired_price:,.0f} €</p>
        <p><strong>Mindestpreis:</strong> {car.pricing.minimum_price:,.0f} €</p>
        <hr>
        <p><strong>Kontakt:</strong></p>
        <p>{car.contact.first_name} {car.contact.last_name}</p>
        <p>Tel: {car.contact.phone}</p>
        <p>E-Mail: {car.contact.email}</p>
        <p>Stadt: {car.contact.city}</p>
        <hr>
        <p><strong>FIN:</strong> <code>{car.vin}</code></p>
        <p><strong>Fotos:</strong> {len(car.photos)} Bilder hochgeladen</p>
        """
        
        message = Mail(
            from_email=sender_email,
            to_emails=admin_email,
            subject=f"Neue Fahrzeug-Einreichung: {car.brand} {car.model}",
            html_content=html_content
        )
        
        sg = SendGridAPIClient(sendgrid_key)
        sg.send(message)
        logger.info(f"Email notification sent for car {car.id}")
    except Exception as e:
        logger.error(f"Failed to send email: {e}")

# ==================== INIT ADMIN ====================

async def init_admin():
    """Create default admin if not exists"""
    admin = await db.admins.find_one({"username": "admin"})
    if not admin:
        password_hash = bcrypt.hashpw("admin123".encode(), bcrypt.gensalt()).decode()
        await db.admins.insert_one({
            "id": str(uuid.uuid4()),
            "username": "admin",
            "password_hash": password_hash,
            "created_at": datetime.now(timezone.utc).isoformat()
        })
        logger.info("Default admin created: admin / admin123")

@app.on_event("startup")
async def startup():
    await init_admin()

# ==================== PUBLIC ROUTES ====================

@api_router.get("/")
async def root():
    return {"message": "AutoVerkauf Pro API", "version": "1.0.0"}

@api_router.get("/health")
async def health():
    return {"status": "healthy"}

@api_router.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    """Upload a single file (photo or document)"""
    file_ext = Path(file.filename).suffix.lower()
    allowed_exts = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.pdf', '.doc', '.docx']
    
    if file_ext not in allowed_exts:
        raise HTTPException(status_code=400, detail="Dateityp nicht erlaubt")
    
    file_id = str(uuid.uuid4())
    filename = f"{file_id}{file_ext}"
    filepath = UPLOAD_DIR / filename
    
    async with aiofiles.open(filepath, 'wb') as f:
        content = await file.read()
        await f.write(content)
    
    return {"filename": filename, "url": f"/api/uploads/{filename}"}

@api_router.post("/cars", response_model=dict)
async def submit_car(car_data: CarSubmissionCreate):
    """Submit a new car for sale"""
    car = CarSubmission(**car_data.model_dump())
    
    doc = car.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    doc['updated_at'] = doc['updated_at'].isoformat()
    
    await db.cars.insert_one(doc)
    
    # Send email notification
    await send_notification_email(car)
    
    return {"success": True, "id": car.id, "message": "Fahrzeug erfolgreich eingereicht"}

@api_router.get("/brands")
async def get_brands():
    """Get list of popular car brands"""
    brands = [
        "Audi", "BMW", "Mercedes-Benz", "Volkswagen", "Opel", "Ford",
        "Skoda", "Seat", "Renault", "Peugeot", "Citroën", "Fiat",
        "Toyota", "Honda", "Mazda", "Nissan", "Hyundai", "Kia",
        "Volvo", "Porsche", "Mini", "Jaguar", "Land Rover", "Jeep",
        "Tesla", "Dacia", "Suzuki", "Mitsubishi", "Subaru", "Lexus",
        "Alfa Romeo", "Chevrolet", "Chrysler", "Dodge", "Smart", "Andere"
    ]
    return {"brands": sorted(brands)}

# ==================== ADMIN ROUTES ====================

@api_router.post("/admin/login")
async def admin_login(credentials: AdminLogin):
    """Admin login"""
    admin = await db.admins.find_one({"username": credentials.username}, {"_id": 0})
    
    if not admin:
        raise HTTPException(status_code=401, detail="Ungültige Anmeldedaten")
    
    if not bcrypt.checkpw(credentials.password.encode(), admin['password_hash'].encode()):
        raise HTTPException(status_code=401, detail="Ungültige Anmeldedaten")
    
    token = create_token(admin['id'], admin['username'])
    return {"token": token, "username": admin['username']}

@api_router.get("/admin/cars")
async def get_all_cars(
    status: Optional[str] = None,
    search: Optional[str] = None,
    payload: dict = Depends(verify_token)
):
    """Get all car submissions (admin only)"""
    query = {}
    
    if status and status != "Alle":
        query["status"] = status
    
    if search:
        query["$or"] = [
            {"brand": {"$regex": search, "$options": "i"}},
            {"model": {"$regex": search, "$options": "i"}},
            {"vin": {"$regex": search, "$options": "i"}},
            {"contact.last_name": {"$regex": search, "$options": "i"}},
            {"contact.email": {"$regex": search, "$options": "i"}}
        ]
    
    cars = await db.cars.find(query, {"_id": 0}).sort("created_at", -1).to_list(1000)
    
    # Parse dates
    for car in cars:
        if isinstance(car.get('created_at'), str):
            car['created_at'] = datetime.fromisoformat(car['created_at'])
        if isinstance(car.get('updated_at'), str):
            car['updated_at'] = datetime.fromisoformat(car['updated_at'])
    
    return {"cars": cars, "total": len(cars)}

@api_router.get("/admin/cars/{car_id}")
async def get_car_detail(car_id: str, payload: dict = Depends(verify_token)):
    """Get single car detail (admin only)"""
    car = await db.cars.find_one({"id": car_id}, {"_id": 0})
    
    if not car:
        raise HTTPException(status_code=404, detail="Fahrzeug nicht gefunden")
    
    return car

@api_router.put("/admin/cars/{car_id}")
async def update_car_status(
    car_id: str,
    update: CarStatusUpdate,
    payload: dict = Depends(verify_token)
):
    """Update car status (admin only)"""
    result = await db.cars.update_one(
        {"id": car_id},
        {"$set": {
            "status": update.status,
            "admin_notes": update.admin_notes,
            "updated_at": datetime.now(timezone.utc).isoformat()
        }}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Fahrzeug nicht gefunden")
    
    return {"success": True, "message": "Status aktualisiert"}

@api_router.get("/admin/stats")
async def get_stats(payload: dict = Depends(verify_token)):
    """Get dashboard statistics"""
    total = await db.cars.count_documents({})
    new = await db.cars.count_documents({"status": "Neu"})
    in_progress = await db.cars.count_documents({"status": "In Bearbeitung"})
    listed = await db.cars.count_documents({"status": "Inseriert"})
    sold = await db.cars.count_documents({"status": "Verkauft"})
    
    return {
        "total": total,
        "new": new,
        "in_progress": in_progress,
        "listed": listed,
        "sold": sold
    }

@api_router.delete("/admin/cars/{car_id}")
async def delete_car(car_id: str, payload: dict = Depends(verify_token)):
    """Delete a car submission (admin only)"""
    result = await db.cars.delete_one({"id": car_id})
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Fahrzeug nicht gefunden")
    
    return {"success": True, "message": "Fahrzeug gelöscht"}

# ==================== STATIC FILES ====================

# Serve uploaded files
app.mount("/api/uploads", StaticFiles(directory=str(UPLOAD_DIR)), name="uploads")

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()

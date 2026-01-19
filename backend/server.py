from fastapi import FastAPI, APIRouter, HTTPException, UploadFile, File, Depends, Form, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware
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
import asyncio

import hashlib
import time
import random
import string

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection with connection pooling
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(
    mongo_url,
    maxPoolSize=100,
    minPoolSize=10,
    maxIdleTimeMS=30000,
    serverSelectionTimeoutMS=5000,
    connectTimeoutMS=10000,
)
db = client[os.environ['DB_NAME']]

# JWT Settings from environment
JWT_SECRET = os.environ.get('JWT_SECRET', 'change-this-in-production')
JWT_ALGORITHM = 'HS256'

# Upload settings
UPLOAD_DIR = ROOT_DIR / 'uploads'
UPLOAD_DIR.mkdir(exist_ok=True)
MAX_UPLOAD_SIZE = int(os.environ.get('MAX_UPLOAD_SIZE_MB', 10)) * 1024 * 1024  # Default 10MB

# Rate limiter with in-memory storage
limiter = Limiter(key_func=get_remote_address, default_limits=["200/minute"])

# Create the main app
app = FastAPI(title="AutoVerkauf Pro API")
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)
app.add_middleware(SlowAPIMiddleware)

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

security = HTTPBearer()

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
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
    id: str = ""  # Will be set by generate_car_id()
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
    status: str = "Neu"
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
    # Anti-spam fields
    honeypot: Optional[str] = None  # Should be empty
    form_token: Optional[str] = None  # Time-based token
    captcha_answer: Optional[int] = None  # Math captcha answer

class CarStatusUpdate(BaseModel):
    status: str
    admin_notes: Optional[str] = None

# ==================== INVENTORY MODELS ====================

class InventoryVehicle(BaseModel):
    id: str = ""  # Will be set automatically (6 digits + 3 letters)
    # Basic Info
    brand: str
    model: str
    variant: Optional[str] = None
    title: Optional[str] = None  # Custom title for the listing
    
    # Registration & Mileage
    first_registration: str  # MM/YYYY format
    mileage: int
    
    # Technical Data
    fuel_type: str  # Benzin, Diesel, Elektro, Hybrid, etc.
    transmission: str  # Schaltgetriebe, Automatik
    power_hp: Optional[int] = None
    power_kw: Optional[int] = None
    engine_size: Optional[int] = None  # ccm
    cylinders: Optional[int] = None
    drive_type: Optional[str] = None  # Frontantrieb, Heckantrieb, Allrad
    
    # Body & Design
    body_type: str  # Limousine, Kombi, SUV, Cabrio, etc.
    doors: str  # 2/3, 4/5, 6/7
    seats: Optional[int] = None
    exterior_color: str
    interior_color: Optional[str] = None
    interior_material: Optional[str] = None  # Stoff, Teilleder, Leder
    
    # Condition & History
    tuv_until: Optional[str] = None  # MM/YYYY
    hu_au: Optional[str] = None  # HU/AU date
    accident_free: bool = True
    service_history: bool = False  # Scheckheft gepflegt
    previous_owners: Optional[int] = None
    non_smoker: bool = False
    garage_kept: bool = False
    
    # Environmental
    emission_class: Optional[str] = None  # Euro 1-6
    environmental_badge: Optional[str] = None  # Grün, Gelb, Rot
    co2_emission: Optional[int] = None  # g/km
    fuel_consumption_combined: Optional[float] = None  # l/100km
    fuel_consumption_city: Optional[float] = None
    fuel_consumption_highway: Optional[float] = None
    energy_efficiency: Optional[str] = None  # A+++ to G
    
    # Features & Equipment
    features: List[str] = []  # List of equipment features
    
    # Media
    photos: List[str] = []  # Up to 40 photos
    video_url: Optional[str] = None
    
    # Pricing
    price: float
    price_negotiable: bool = False
    vat_deductible: bool = False  # MwSt. ausweisbar
    
    # Description
    description: Optional[str] = None
    highlights: Optional[str] = None  # Short highlights text
    
    # Contact Info (customizable per listing or use defaults)
    contact_name: Optional[str] = None
    contact_phone: Optional[str] = None
    contact_email: Optional[str] = None
    contact_address: Optional[str] = None
    contact_city: Optional[str] = None
    contact_zip: Optional[str] = None
    
    # Status
    is_published: bool = True
    is_sold: bool = False
    is_reserved: bool = False
    featured: bool = False  # Featured/highlighted listing
    
    # Timestamps
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class InventoryVehicleCreate(BaseModel):
    brand: str
    model: str
    variant: Optional[str] = None
    title: Optional[str] = None
    first_registration: str
    mileage: int
    fuel_type: str
    transmission: str
    power_hp: Optional[int] = None
    power_kw: Optional[int] = None
    engine_size: Optional[int] = None
    cylinders: Optional[int] = None
    drive_type: Optional[str] = None
    body_type: str
    doors: str
    seats: Optional[int] = None
    exterior_color: str
    interior_color: Optional[str] = None
    interior_material: Optional[str] = None
    tuv_until: Optional[str] = None
    hu_au: Optional[str] = None
    accident_free: bool = True
    service_history: bool = False
    previous_owners: Optional[int] = None
    non_smoker: bool = False
    garage_kept: bool = False
    emission_class: Optional[str] = None
    environmental_badge: Optional[str] = None
    co2_emission: Optional[int] = None
    fuel_consumption_combined: Optional[float] = None
    fuel_consumption_city: Optional[float] = None
    fuel_consumption_highway: Optional[float] = None
    energy_efficiency: Optional[str] = None
    features: List[str] = []
    photos: List[str] = []
    video_url: Optional[str] = None
    price: float
    price_negotiable: bool = False
    vat_deductible: bool = False
    description: Optional[str] = None
    highlights: Optional[str] = None
    contact_name: Optional[str] = None
    contact_phone: Optional[str] = None
    contact_email: Optional[str] = None
    contact_address: Optional[str] = None
    contact_city: Optional[str] = None
    contact_zip: Optional[str] = None
    is_published: bool = True
    is_sold: bool = False
    is_reserved: bool = False
    featured: bool = False

class InventoryVehicleUpdate(BaseModel):
    brand: Optional[str] = None
    model: Optional[str] = None
    variant: Optional[str] = None
    title: Optional[str] = None
    first_registration: Optional[str] = None
    mileage: Optional[int] = None
    fuel_type: Optional[str] = None
    transmission: Optional[str] = None
    power_hp: Optional[int] = None
    power_kw: Optional[int] = None
    engine_size: Optional[int] = None
    cylinders: Optional[int] = None
    drive_type: Optional[str] = None
    body_type: Optional[str] = None
    doors: Optional[str] = None
    seats: Optional[int] = None
    exterior_color: Optional[str] = None
    interior_color: Optional[str] = None
    interior_material: Optional[str] = None
    tuv_until: Optional[str] = None
    hu_au: Optional[str] = None
    accident_free: Optional[bool] = None
    service_history: Optional[bool] = None
    previous_owners: Optional[int] = None
    non_smoker: Optional[bool] = None
    garage_kept: Optional[bool] = None
    emission_class: Optional[str] = None
    environmental_badge: Optional[str] = None
    co2_emission: Optional[int] = None
    fuel_consumption_combined: Optional[float] = None
    fuel_consumption_city: Optional[float] = None
    fuel_consumption_highway: Optional[float] = None
    energy_efficiency: Optional[str] = None
    features: Optional[List[str]] = None
    photos: Optional[List[str]] = None
    video_url: Optional[str] = None
    price: Optional[float] = None
    price_negotiable: Optional[bool] = None
    vat_deductible: Optional[bool] = None
    description: Optional[str] = None
    highlights: Optional[str] = None
    contact_name: Optional[str] = None
    contact_phone: Optional[str] = None
    contact_email: Optional[str] = None
    contact_address: Optional[str] = None
    contact_city: Optional[str] = None
    contact_zip: Optional[str] = None
    is_published: Optional[bool] = None
    is_sold: Optional[bool] = None
    is_reserved: Optional[bool] = None
    featured: Optional[bool] = None

# Settings model for default contact info
class SiteSettings(BaseModel):
    default_contact_name: Optional[str] = None
    default_contact_phone: Optional[str] = None
    default_contact_email: Optional[str] = None
    default_contact_address: Optional[str] = None
    default_contact_city: Optional[str] = None
    default_contact_zip: Optional[str] = None

class AdminLogin(BaseModel):
    username: str
    password: str

class AdminPasswordChange(BaseModel):
    current_password: str
    new_password: str

# ==================== ID GENERATOR ====================

async def generate_car_id() -> str:
    """Generate a unique car ID: 6 numbers + 4 letters (e.g., 123456ABCD)"""
    while True:
        # Generate 6 random numbers
        numbers = ''.join(random.choices(string.digits, k=6))
        # Generate 4 random uppercase letters
        letters = ''.join(random.choices(string.ascii_uppercase, k=4))
        car_id = f"{numbers}{letters}"
        
        # Check if ID already exists
        existing = await db.cars.find_one({"id": car_id})
        if not existing:
            return car_id

async def generate_inventory_id() -> str:
    """Generate a unique inventory ID: 6 numbers + 3 letters (e.g., 123456ABC)"""
    while True:
        numbers = ''.join(random.choices(string.digits, k=6))
        letters = ''.join(random.choices(string.ascii_uppercase, k=3))
        inv_id = f"{numbers}{letters}"
        
        existing = await db.inventory.find_one({"id": inv_id})
        if not existing:
            return inv_id

# ==================== CAPTCHA FUNCTIONS ====================

def generate_captcha_token(timestamp: int) -> str:
    """Generate a token based on timestamp for form validation"""
    secret = JWT_SECRET + str(timestamp)
    return hashlib.sha256(secret.encode()).hexdigest()[:16]

def verify_captcha_token(token: str, min_seconds: int = 10) -> bool:
    """Verify the token is valid and form took at least min_seconds"""
    if not token or len(token) < 20:
        return False
    
    try:
        # Token format: timestamp_hash
        parts = token.split('_')
        if len(parts) != 2:
            return False
        
        timestamp = int(parts[0])
        provided_hash = parts[1]
        
        # Check if enough time has passed
        current_time = int(time.time())
        if current_time - timestamp < min_seconds:
            logger.warning(f"Form submitted too fast: {current_time - timestamp} seconds")
            return False
        
        # Verify hash
        expected_hash = generate_captcha_token(timestamp)
        if provided_hash != expected_hash:
            return False
        
        # Token should not be older than 1 hour
        if current_time - timestamp > 3600:
            return False
        
        return True
    except Exception as e:
        logger.warning(f"Token verification failed: {e}")
        return False

@api_router.get("/captcha")
async def get_captcha():
    """Generate a math captcha and form token"""
    import random
    
    num1 = random.randint(1, 10)
    num2 = random.randint(1, 10)
    operation = random.choice(['+', '-'])
    
    if operation == '+':
        answer = num1 + num2
    else:
        # Ensure positive result
        if num1 < num2:
            num1, num2 = num2, num1
        answer = num1 - num2
    
    question = f"{num1} {operation} {num2} = ?"
    
    # Create time-based token
    timestamp = int(time.time())
    token_hash = generate_captcha_token(timestamp)
    form_token = f"{timestamp}_{token_hash}"
    
    # Store answer encrypted in token (simple approach)
    answer_hash = hashlib.sha256(f"{JWT_SECRET}{answer}{timestamp}".encode()).hexdigest()[:8]
    
    return {
        "question": question,
        "form_token": form_token,
        "answer_token": answer_hash,
        "timestamp": timestamp
    }

def verify_captcha_answer(answer: int, answer_token: str, timestamp: int) -> bool:
    """Verify the captcha answer"""
    expected_hash = hashlib.sha256(f"{JWT_SECRET}{answer}{timestamp}".encode()).hexdigest()[:8]
    return expected_hash == answer_token

# ==================== HELPER FUNCTIONS ====================

def create_token(user_id: str, username: str) -> str:
    payload = {
        'user_id': user_id,
        'username': username,
        'exp': datetime.now(timezone.utc).timestamp() + 86400
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
    """Send email notification for new car submission using Resend"""
    resend_key = os.environ.get('RESEND_API_KEY')
    admin_email = os.environ.get('ADMIN_EMAIL')
    sender_email = os.environ.get('SENDER_EMAIL', 'onboarding@resend.dev')
    
    if not all([resend_key, admin_email]):
        logger.warning("Resend not configured, skipping email notification")
        return
    
    try:
        import resend
        resend.api_key = resend_key
        
        html_content = f"""
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: #1e293b; color: white; padding: 20px; border-radius: 10px 10px 0 0;">
                <h2 style="margin: 0;">🚗 Neue Fahrzeug-Einreichung!</h2>
                <p style="margin: 5px 0 0 0; opacity: 0.8;">ID: #{car.id}</p>
            </div>
            <div style="background: #f8fafc; padding: 20px; border: 1px solid #e2e8f0;">
                <h3 style="color: #1e293b; margin-top: 0;">Fahrzeug</h3>
                <p><strong>{car.brand} {car.model}</strong> ({car.first_registration})</p>
                <p>Kilometerstand: {car.mileage:,} km</p>
                <p>Kraftstoff: {car.fuel_type} | Getriebe: {car.transmission}</p>
                <p>FIN: <code style="background: #e2e8f0; padding: 2px 6px; border-radius: 4px;">{car.vin}</code></p>
                
                <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;">
                
                <h3 style="color: #1e293b;">Preisvorstellung</h3>
                <p style="font-size: 24px; margin: 5px 0;"><strong style="color: #f97316;">Wunschpreis: {car.pricing.desired_price:,.0f} €</strong></p>
                <p style="font-size: 18px; margin: 5px 0;">Mindestpreis: {car.pricing.minimum_price:,.0f} €</p>
                
                <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;">
                
                <h3 style="color: #1e293b;">Kontakt</h3>
                <p><strong>{car.contact.first_name} {car.contact.last_name}</strong></p>
                <p>📞 <a href="tel:{car.contact.phone}">{car.contact.phone}</a></p>
                <p>✉️ <a href="mailto:{car.contact.email}">{car.contact.email}</a></p>
                <p>📍 {car.contact.city}</p>
                
                <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;">
                
                <p style="color: #64748b; font-size: 14px;">
                    📷 {len(car.photos)} Fotos hochgeladen<br>
                    📄 {len(car.documents)} Dokumente hochgeladen
                </p>
            </div>
            <div style="background: #1e293b; color: white; padding: 15px; border-radius: 0 0 10px 10px; text-align: center;">
                <p style="margin: 0; font-size: 14px;">CashCar UG - Fahrzeugvermittlung</p>
            </div>
        </div>
        """
        
        resend.Emails.send({
            "from": f"CashCar <{sender_email}>",
            "to": [admin_email],
            "subject": f"🚗 Neue Anfrage: {car.brand} {car.model} - #{car.id}",
            "html": html_content
        })
        
        logger.info(f"Email notification sent for car {car.id} to {admin_email}")
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

# Create indexes for better performance
async def create_indexes():
    """Create MongoDB indexes for better query performance"""
    try:
        await db.cars.create_index("id", unique=True)
        await db.cars.create_index("status")
        await db.cars.create_index("created_at")
        await db.cars.create_index([("brand", 1), ("model", 1)])
        await db.cars.create_index([
            ("brand", "text"),
            ("model", "text"),
            ("vin", "text"),
            ("contact.last_name", "text"),
            ("contact.email", "text")
        ])
        logger.info("MongoDB indexes created")
    except Exception as e:
        logger.warning(f"Index creation warning: {e}")

@app.on_event("startup")
async def startup():
    await init_admin()
    await create_indexes()

# ==================== ERROR HANDLERS ====================

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled error: {exc}")
    return JSONResponse(
        status_code=500,
        content={"detail": "Ein interner Fehler ist aufgetreten. Bitte versuchen Sie es später erneut."}
    )

# ==================== PUBLIC ROUTES ====================

@api_router.get("/")
async def root():
    return {"message": "AutoVerkauf Pro API", "version": "1.0.0"}

@api_router.get("/health")
async def health():
    try:
        await db.command("ping")
        return {"status": "healthy", "database": "connected"}
    except Exception:
        return JSONResponse(status_code=503, content={"status": "unhealthy", "database": "disconnected"})

@api_router.post("/upload")
@limiter.limit("30/minute")
async def upload_file(request: Request, file: UploadFile = File(...)):
    """Upload a single file (photo or document) with size validation"""
    file_ext = Path(file.filename).suffix.lower()
    allowed_exts = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.pdf', '.doc', '.docx']
    
    if file_ext not in allowed_exts:
        raise HTTPException(status_code=400, detail="Dateityp nicht erlaubt")
    
    # Check file size
    content = await file.read()
    if len(content) > MAX_UPLOAD_SIZE:
        raise HTTPException(status_code=400, detail=f"Datei zu groß. Maximum: {MAX_UPLOAD_SIZE // (1024*1024)}MB")
    
    file_id = str(uuid.uuid4())
    filename = f"{file_id}{file_ext}"
    filepath = UPLOAD_DIR / filename
    
    try:
        async with aiofiles.open(filepath, 'wb') as f:
            await f.write(content)
        
        return {"filename": filename, "url": f"/api/uploads/{filename}"}
    except Exception as e:
        logger.error(f"File upload error: {e}")
        raise HTTPException(status_code=500, detail="Fehler beim Hochladen der Datei")

@api_router.post("/cars", response_model=dict)
@limiter.limit("10/minute")
async def submit_car(request: Request, car_data: CarSubmissionCreate):
    """Submit a new car for sale with rate limiting and captcha"""
    try:
        # Anti-spam check 1: Honeypot field should be empty
        if car_data.honeypot:
            logger.warning(f"Honeypot triggered from {get_remote_address(request)}")
            # Return success to not reveal detection (but don't save)
            return {"success": True, "id": str(uuid.uuid4()), "message": "Fahrzeug erfolgreich eingereicht"}
        
        # Anti-spam check 2: Form token validation (time-based)
        if not car_data.form_token or not verify_captcha_token(car_data.form_token, min_seconds=10):
            logger.warning(f"Invalid form token from {get_remote_address(request)}")
            raise HTTPException(status_code=400, detail="Sicherheitsvalidierung fehlgeschlagen. Bitte laden Sie die Seite neu.")
        
        # Generate unique car ID (6 numbers + 4 letters)
        car_id = await generate_car_id()
        
        car = CarSubmission(**{k: v for k, v in car_data.model_dump().items() 
                               if k not in ['honeypot', 'form_token', 'captcha_answer']})
        car.id = car_id
        
        doc = car.model_dump()
        doc['created_at'] = doc['created_at'].isoformat()
        doc['updated_at'] = doc['updated_at'].isoformat()
        
        await db.cars.insert_one(doc)
        
        # Send email notification in background (non-blocking)
        asyncio.create_task(send_notification_email(car))
        
        logger.info(f"New car submission: {car.brand} {car.model} (ID: {car.id})")
        return {"success": True, "id": car.id, "message": "Fahrzeug erfolgreich eingereicht"}
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Car submission error: {e}")
        raise HTTPException(status_code=500, detail="Fehler beim Einreichen des Fahrzeugs")

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
@limiter.limit("5/minute")
async def admin_login(request: Request, credentials: AdminLogin):
    """Admin login with rate limiting to prevent brute force"""
    admin = await db.admins.find_one({"username": credentials.username}, {"_id": 0})
    
    if not admin:
        raise HTTPException(status_code=401, detail="Ungültige Anmeldedaten")
    
    if not bcrypt.checkpw(credentials.password.encode(), admin['password_hash'].encode()):
        raise HTTPException(status_code=401, detail="Ungültige Anmeldedaten")
    
    token = create_token(admin['id'], admin['username'])
    logger.info(f"Admin login successful: {admin['username']}")
    return {"token": token, "username": admin['username']}

@api_router.post("/admin/change-password")
async def change_admin_password(
    password_data: AdminPasswordChange,
    payload: dict = Depends(verify_token)
):
    """Change admin password"""
    admin = await db.admins.find_one({"username": payload['username']}, {"_id": 0})
    
    if not admin:
        raise HTTPException(status_code=404, detail="Admin nicht gefunden")
    
    if not bcrypt.checkpw(password_data.current_password.encode(), admin['password_hash'].encode()):
        raise HTTPException(status_code=401, detail="Aktuelles Passwort ist falsch")
    
    if len(password_data.new_password) < 8:
        raise HTTPException(status_code=400, detail="Neues Passwort muss mindestens 8 Zeichen haben")
    
    new_hash = bcrypt.hashpw(password_data.new_password.encode(), bcrypt.gensalt()).decode()
    
    await db.admins.update_one(
        {"username": payload['username']},
        {"$set": {"password_hash": new_hash}}
    )
    
    logger.info(f"Password changed for admin: {payload['username']}")
    return {"success": True, "message": "Passwort erfolgreich geändert"}

@api_router.get("/admin/cars")
async def get_all_cars(
    status: Optional[str] = None,
    search: Optional[str] = None,
    page: int = 1,
    limit: int = 50,
    payload: dict = Depends(verify_token)
):
    """Get all car submissions with pagination (admin only)"""
    query = {}
    
    if status and status != "Alle":
        query["status"] = status
    
    if search:
        query["$or"] = [
            {"id": {"$regex": search, "$options": "i"}},
            {"brand": {"$regex": search, "$options": "i"}},
            {"model": {"$regex": search, "$options": "i"}},
            {"vin": {"$regex": search, "$options": "i"}},
            {"contact.last_name": {"$regex": search, "$options": "i"}},
            {"contact.email": {"$regex": search, "$options": "i"}}
        ]
    
    skip = (page - 1) * limit
    
    total = await db.cars.count_documents(query)
    cars = await db.cars.find(query, {"_id": 0}).sort("created_at", -1).skip(skip).limit(limit).to_list(limit)
    
    for car in cars:
        if isinstance(car.get('created_at'), str):
            car['created_at'] = datetime.fromisoformat(car['created_at'])
        if isinstance(car.get('updated_at'), str):
            car['updated_at'] = datetime.fromisoformat(car['updated_at'])
    
    return {
        "cars": cars,
        "total": total,
        "page": page,
        "pages": (total + limit - 1) // limit
    }

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
    
    logger.info(f"Car status updated: {car_id} -> {update.status}")
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
    # Get car to delete associated files
    car = await db.cars.find_one({"id": car_id}, {"_id": 0})
    
    if not car:
        raise HTTPException(status_code=404, detail="Fahrzeug nicht gefunden")
    
    # Delete associated files
    for photo in car.get('photos', []):
        try:
            filepath = UPLOAD_DIR / photo
            if filepath.exists():
                filepath.unlink()
        except Exception as e:
            logger.warning(f"Could not delete photo {photo}: {e}")
    
    for doc in car.get('documents', []):
        try:
            filepath = UPLOAD_DIR / doc
            if filepath.exists():
                filepath.unlink()
        except Exception as e:
            logger.warning(f"Could not delete document {doc}: {e}")
    
    result = await db.cars.delete_one({"id": car_id})
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Fahrzeug nicht gefunden")
    
    logger.info(f"Car deleted: {car_id}")
    return {"success": True, "message": "Fahrzeug gelöscht"}

# ==================== STATIC FILES ====================

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

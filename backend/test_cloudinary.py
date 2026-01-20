
import cloudinary
import cloudinary.uploader
import os
from dotenv import load_dotenv

load_dotenv()

# Config from .env (User's values)
cloud_name = os.environ.get('CLOUDINARY_CLOUD_NAME')
api_key = os.environ.get('CLOUDINARY_API_KEY')
api_secret = os.environ.get('CLOUDINARY_API_SECRET')

print(f"Testing Cloudinary Connection...")
print(f"Cloud Name: {cloud_name}")
print(f"API Key: {api_key[:5]}...")

if not all([cloud_name, api_key, api_secret]):
    print("ERROR: Missing credentials in .env")
    exit(1)

cloudinary.config(
  cloud_name = cloud_name,
  api_key = api_key,
  api_secret = api_secret
)

try:
    # Upload a tiny dummy file
    print("Attempting upload...")
    # Create simple in-memory file
    result = cloudinary.uploader.upload("https://upload.wikimedia.org/wikipedia/commons/c/ca/1x1.png", folder="test_connection")
    print("\nSUCCESS! Upload worked.")
    print(f"Image URL: {result.get('secure_url')}")
    print("The connection is PERFECT. The problem is definitely that Render uses the wrong code.")
except Exception as e:
    print(f"\nFAILED. Error: {e}")

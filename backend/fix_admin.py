import asyncio
import os
import sys
from pathlib import Path
import logging
import bcrypt
import uuid
from datetime import datetime, timezone

# Add backend directory to path so we can import server
sys.path.append(str(Path(__file__).parent))

from server import db

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

async def main():
    logger.info("Checking admin users...")
    
    admins = await db.admins.find({}).to_list(None)
    
    target_email = os.environ.get('ADMIN_EMAIL', 'info@cashcarhannover.de')
    logger.info(f"Target Admin Email: {target_email}")
    
    if not admins:
        logger.info("No admins found. Creating new one.")
        password_hash = bcrypt.hashpw("admin123".encode(), bcrypt.gensalt()).decode()
        await db.admins.insert_one({
            "id": str(uuid.uuid4()),
            "username": target_email,
            "password_hash": password_hash,
            "created_at": datetime.now(timezone.utc).isoformat()
        })
        logger.info(f"Created admin: {target_email}")
    else:
        logger.info(f"Found {len(admins)} admin(s).")
        for admin in admins:
            logger.info(f"Existing admin: {admin.get('username')}")
            
            # Update to new email if it's the old 'admin'
            if admin.get('username') == 'admin':
                logger.info("Updating 'admin' user to new email...")
                await db.admins.update_one(
                    {"_id": admin["_id"]},
                    {"$set": {"username": target_email}}
                )
                logger.info(f"Updated username to {target_email}")
            elif admin.get('username') == target_email:
                logger.info("Admin already has correct username.")
            else:
                logger.warning(f"Unknown admin user found: {admin.get('username')}. Leaving as is.")

if __name__ == "__main__":
    asyncio.run(main())

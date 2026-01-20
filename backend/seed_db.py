import asyncio
import os
import sys
from pathlib import Path
import logging

# Add backend directory to path so we can import server
sys.path.append(str(Path(__file__).parent))

from server import init_admin, create_indexes, db

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

async def main():
    logger.info("Starting database seeding...")
    
    # Test connection
    try:
        await db.command("ping")
        logger.info("MongoDB connection successful!")
    except Exception as e:
        logger.error(f"MongoDB connection failed: {e}")
        return

    # Run initialization
    await create_indexes()
    await init_admin()
    
    # Verify admin exists
    admin_email = os.environ.get('ADMIN_EMAIL', 'info@cashcarhannover.de')
    admin = await db.admins.find_one({"username": admin_email})
    
    if admin:
        logger.info(f"VERIFICATION SUCCESS: Admin user '{admin['username']}' exists.")
    else:
        logger.error("VERIFICATION FAILED: Admin user was not created.")

if __name__ == "__main__":
    asyncio.run(main())

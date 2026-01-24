import asyncio
import os
import logging
from motor.motor_asyncio import AsyncIOMotorClient
from job_apis.job_aggregator import JobAggregator
from dotenv import load_dotenv

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()

async def run_aggregation():
    """
    Main function to run the daily job aggregation
    """
    logger.info("Starting daily job aggregation script...")
    
    # Get database URL
    mongo_url = os.getenv("MONGO_URL")
    if not mongo_url:
        logger.error("MONGO_URL environment variable not set")
        return

    try:
        # Connect to MongoDB
        logger.info("Connecting to MongoDB...")
        
        # Add TLS/SSL configuration for MongoDB Atlas compatibility
        try:
            import certifi
            client = AsyncIOMotorClient(
                mongo_url,
                serverSelectionTimeoutMS=15000,
                tls=True,
                tlsCAFile=certifi.where(),
                tlsAllowInvalidCertificates=True,
                tlsAllowInvalidHostnames=True
            )
        except ImportError:
            logger.warning("certifi not found, falling back to default SSL")
            client = AsyncIOMotorClient(mongo_url, serverSelectionTimeoutMS=15000)
            
        db = client[os.getenv("DB_NAME", "novaninjas")]
        logger.info(f"Connected to database: {db.name}")
        
        # Initialize Aggregator
        aggregator = JobAggregator(db)
        
        # Run aggregation
        # We can configure this to run 'full' or 'light'
        # For daily runs via GitHub Actions, we might want a balanced approach
        logger.info("Triggering aggregate_all_jobs...")
        stats = await aggregator.aggregate_all_jobs(
            use_adzuna=True,
            use_jsearch=True,     # JSearch has strict rate limits, be careful
            use_usajobs=True,     # Good free source
            use_rss=True,         # Good free source
            max_adzuna_pages=5,   # Keep it reasonable for daily updates
            max_jsearch_queries=3 # Limit JSearch queries
        )
        
        logger.info(f"Aggregation finished. Stats: {stats}")
        
    except Exception as e:
        logger.error(f"An error occurred during aggregation: {e}")
    finally:
        # Close connection
        if 'client' in locals():
            client.close()
            logger.info("Database connection closed")

if __name__ == "__main__":
    asyncio.run(run_aggregation())

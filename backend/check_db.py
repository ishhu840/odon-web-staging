from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv
from pathlib import Path
import asyncio

ROOT_DIR = Path(__file__).parent.parent
print(f"ROOT_DIR: {ROOT_DIR}")
print(f"Attempting to load .env from: {ROOT_DIR / '.env'}")
load_dotenv(ROOT_DIR / '.env')

async def check_team_members():
    mongo_url = os.environ.get('MONGO_URL')
    db_name = os.environ.get('DB_NAME')

    if not mongo_url or not db_name:
        print("Error: MONGO_URL or DB_NAME not found in .env file.")
        return

    client = AsyncIOMotorClient(mongo_url)
    db = client[db_name]

    client = None
    try:
        print(f"Attempting to connect to MongoDB at {mongo_url} and database {db_name}")
        client = AsyncIOMotorClient(mongo_url)
        print(f"Client object after instantiation: {client}")
        db = client[db_name]
        members = await db.team_members.find({}).to_list(1000)
        print("Team Members in DB:")
        for member in members:
            print(member)
    except Exception as e:
        print(f"An error occurred: {e}")
    finally:
        pass

if __name__ == "__main__":
    asyncio.run(check_team_members())
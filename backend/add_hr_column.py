import psycopg2
import os
from dotenv import load_dotenv

load_dotenv("c:/Users/vsair/Downloads/novasquar-main/novasquad-main/nova-ninjas/backend/.env")
DB_URL = os.environ.get("DATABASE_URL")

if not DB_URL:
    print("No DATABASE_URL found in .env.")
else:
    print("Connecting to Supabase Postgres...")
    try:
        conn = psycopg2.connect(DB_URL)
        conn.autocommit = True
        cur = conn.cursor()
        
        print("Executing ALTER TABLE statements...")
        cur.execute("ALTER TABLE jobs ADD COLUMN IF NOT EXISTS hr_contacts JSONB;")
        print("Successfully added hr_contacts JSONB column to jobs table!")
        
        cur.close()
        conn.close()
    except Exception as e:
        print(f"Error altering schema: {e}")

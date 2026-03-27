from supabase_service import SupabaseService
from dotenv import load_dotenv
import os

# Load .env to get credentials
load_dotenv()

def test():
    print("DEBUG: Starting tests...")
    
    # Test 1: No filters, all time
    c1 = SupabaseService.get_jobs_count(location=None, fresh_only=False)
    print(f"Count (None, All Time): {c1}")
    
    # Test 2: location='all', all time
    c2 = SupabaseService.get_jobs_count(location="all", fresh_only=False)
    print(f"Count ('all', All Time): {c2}")

    # Test 3: location='None', fresh only
    c3 = SupabaseService.get_jobs_count(location=None, fresh_only=True)
    print(f"Count (None, Fresh): {c3}")
    
    # Test 4: location='all', fresh only
    c4 = SupabaseService.get_jobs_count(location="all", fresh_only=True)
    print(f"Count ('all', Fresh): {c4}")

if __name__ == "__main__":
    test()

import sys
import os
import importlib
import inspect
from fastapi import FastAPI

# Add current directory to sys.path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

def run_checks():
    print("🔍 Starting Backend Verification...")
    
    # 1. Check for Critical Environment Variables (simulate checks)
    required_envs = ["MONGODB_URI", "JWT_SECRET_KEY"]
    missing = []
    # Note: We won't strict fail here for local dev if they aren't set, 
    # but we'll warn. In CI/CD this should fail.
    for env in required_envs:
        if not os.environ.get(env):
            # For this script, we might just warn if running locally without full env
            print(f"⚠️  Warning: {env} not set in environment")
            missing.append(env)
    
    # 2. Syntax & Import Check
    print("✅ Checking imports...")
    try:
        import server
        print("   - Successfully imported server.py")
    except ImportError as e:
        print(f"❌ FATAL: Failed to import server.py: {e}")
        sys.exit(1)
    except SyntaxError as e:
        print(f"❌ FATAL: Syntax check failed: {e}")
        sys.exit(1)
    except Exception as e:
        print(f"❌ FATAL: Error during import: {e}")
        sys.exit(1)

    # 3. App Initialization Check
    print("✅ Checking FastAPI app...")
    try:
        app = server.app
        if not isinstance(app, FastAPI):
            print(f"❌ FATAL: 'app' is not a FastAPI instance")
            sys.exit(1)
        print("   - FastAPI app instance found")
    except AttributeError:
        print(f"❌ FATAL: 'app' object not found in server.py")
        sys.exit(1)

    # 4. Critical Endpoint Check
    # We want to make sure specific critical functions exist and are registered
    print("✅ Checking critical endpoints...")
    user_defined_routes = [
        route for route in app.routes 
        if hasattr(route, "endpoint") # Removed strict isfunction check for wrapped endpoints
    ]
    
    print(f"   - Found {len(user_defined_routes)} user defined routes")
    
    route_names = [route.name for route in user_defined_routes]
    
    # List of function names (endpoints) we expect to exist
    expected_functions = [
        "health_check",
        "google_login",
        "login", # Was login_for_access_token
        "save_user_resume", 
        "generate_resume_docx" # Was download_resume
    ]
    
    # Note: route.name typically matches the function name
    missing_routes = [func for func in expected_functions if func not in route_names]
    
    if missing_routes:
        print(f"❌ FATAL: Missing expected endpoints: {missing_routes}")
        print("   Did you rename a function or forget to decorate it?")
        sys.exit(1)
    else:
        print("   - All critical endpoints detected")

    print("\n🟢 SMOKE TEST PASSED: Backend code is structurally sound.")

if __name__ == "__main__":
    run_checks()

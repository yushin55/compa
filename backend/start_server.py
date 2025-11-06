import uvicorn
import os
from pathlib import Path
from dotenv import load_dotenv

# Load .env from backend directory before starting server
env_path = Path(__file__).resolve().parent / '.env'
if env_path.exists():
    load_dotenv(dotenv_path=str(env_path), override=True)

if __name__ == "__main__":
    # Verify env vars are loaded
    if os.getenv("SUPABASE_URL") and os.getenv("SUPABASE_KEY"):
        print("✅ Environment variables loaded successfully")
    else:
        print("⚠️ WARNING: Environment variables not found")
    
    # Run without reload to avoid multiprocessing environment issues
    print("🚀 Starting FastAPI server on http://127.0.0.1:8000")
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=False, access_log=True)

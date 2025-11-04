import os
from supabase import create_client, Client
from dotenv import load_dotenv
from pathlib import Path

# Load .env from backend directory (absolute path)
backend_dir = Path(__file__).resolve().parent.parent
env_path = backend_dir / '.env'

# Try to load from .env
if env_path.exists():
    load_dotenv(dotenv_path=str(env_path), override=True)

# Get environment variables with fallback to hardcoded values (for development)
SUPABASE_URL = os.getenv("SUPABASE_URL") or "https://xyrbiuogwtmcjwqkojrb.supabase.co"
SUPABASE_KEY = os.getenv("SUPABASE_KEY") or "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh5cmJpdW9nd3RtY2p3cWtvanJiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkxOTA5NDUsImV4cCI6MjA3NDc2Njk0NX0.AFau_18T-iVIc9gIGoTbvOhq42H8VDfpJ0rKvmHfAHA"

print(f"✅ [Database] Supabase URL loaded: {SUPABASE_URL[:50]}...")
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
print(f"✅ [Database] Supabase client initialized successfully")

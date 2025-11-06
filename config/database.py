import os
from pathlib import Path
from supabase import create_client, Client
from dotenv import load_dotenv

# Custom .env loader with BOM handling
env_path = Path(__file__).parent.parent / "backend" / ".env"
if env_path.exists():
    try:
        with open(env_path, 'rb') as f:
            content = f.read()
            # Remove BOM if present
            if content.startswith(b'\xef\xbb\xbf'):
                content = content[3:]
            # Decode and load into environment
            for line in content.decode('utf-8').splitlines():
                line = line.strip()
                if line and not line.startswith('#') and '=' in line:
                    key, value = line.split('=', 1)
                    os.environ[key.strip()] = value.strip().strip('"').strip("'")
            print("[Database] Custom .env file loaded successfully")
    except Exception as e:
        print(f"[Database] Error loading .env file: {e}")
        load_dotenv()
else:
    load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    print("[Database] WARNING: SUPABASE_URL and SUPABASE_KEY environment variables are not set")
    print("[Database] Please set them in Cloudtype dashboard or .env file")
    raise ValueError("SUPABASE_URL and SUPABASE_KEY must be set")

print("[Database] Supabase client initialized successfully")
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

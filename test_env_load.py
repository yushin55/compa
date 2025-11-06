import os
from pathlib import Path

env_path = Path("./backend/.env")
print(f"Attempting to load from: {env_path.resolve()}")
print(f"File exists: {env_path.exists()}")

if env_path.exists():
    with open(env_path, 'r', encoding='utf-8') as f:
        content = f.read()
        print(f"Content length: {len(content)}")
        print(f"Content repr: {repr(content[:200])}")
        for i, line in enumerate(content.splitlines(), 1):
            line_stripped = line.strip()
            print(f"Line {i}: [{line_stripped[:80]}]")
            if line_stripped and not line_stripped.startswith('#'):
                if '=' in line_stripped:
                    key, value = line_stripped.split('=', 1)
                    key = key.strip()
                    value = value.strip()
                    print(f"  → Key: [{key}], Value length: {len(value)}")
                    os.environ[key] = value

print("\nLoaded variables:")
url = os.getenv('SUPABASE_URL')
key = os.getenv('SUPABASE_KEY')
print(f"SUPABASE_URL: {url[:50] if url else 'NOT SET'}")
print(f"SUPABASE_KEY: {key[:50] if key else 'NOT SET'}")

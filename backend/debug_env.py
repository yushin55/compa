import os
from pathlib import Path

print('cwd=', Path.cwd())
print('backend .env path=', (Path(__file__).resolve().parent / '.env'))
print('backend parent .env path=', (Path(__file__).resolve().parent.parent / '.env'))
print('root .env exists=', (Path(__file__).resolve().parent.parent / '.env').exists())
print('backend .env exists=', (Path(__file__).resolve().parent / '.env').exists())
print('SUPABASE_URL env present:', bool(os.getenv('SUPABASE_URL')))
print('SUPABASE_KEY env present:', bool(os.getenv('SUPABASE_KEY')))

#!/usr/bin/env python3
import os
import mysql.connector
from dotenv import load_dotenv
from urllib.parse import urlparse

load_dotenv()

# Get database URL from environment
database_url = os.getenv('DATABASE_URL')

if not database_url:
    print("ERROR: DATABASE_URL not set")
    exit(1)

try:
    # Parse the database URL properly
    # Format: mysql://user:password@host:port/database?ssl=...
    parsed = urlparse(database_url)
    
    user = parsed.username
    password = parsed.password
    host = parsed.hostname
    port = parsed.port or 4000
    db = parsed.path.lstrip('/')
    
    print(f"Connecting to {host}:{port}/{db} as {user}...")
    
    # Connect to database
    conn = mysql.connector.connect(
        host=host,
        port=port,
        user=user,
        password=password,
        database=db,
        ssl_disabled=False,
        autocommit=False
    )
    
    cursor = conn.cursor()
    
    # Read and execute migration SQL
    with open('/tmp/migrate.sql', 'r') as f:
        sql_content = f.read()
    
    # Split by semicolon and execute each statement
    statements = sql_content.split(';')
    for statement in statements:
        statement = statement.strip()
        if statement:
            print(f"Executing: {statement[:50]}...")
            try:
                cursor.execute(statement)
                conn.commit()
                print("✓ Success")
            except Exception as e:
                print(f"✗ Error: {e}")
                conn.rollback()
    
    cursor.close()
    conn.close()
    
    print("\nMigration completed!")
    
except Exception as e:
    print(f"ERROR: {e}")
    import traceback
    traceback.print_exc()
    exit(1)

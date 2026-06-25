import sqlite3 

DATABASE_NAME = "clients.db"

def create_database(): 
    conn = None
    try:
        conn = sqlite3.connect(DATABASE_NAME) 
        cursor = conn.cursor() 

        cursor.execute("""
        CREATE TABLE IF NOT EXISTS clients ( 
            id INTEGER PRIMARY KEY AUTOINCREMENT, 
            company_name TEXT NOT NULL, 
            vat_number TEXT UNIQUE, 
            contact_person TEXT NOT NULL, 
            contact_email TEXT NOT NULL, 
            contact_phone TEXT NOT NULL, 
            address_line1 TEXT NOT NULL, 
            address_line2 TEXT, 
            city TEXT NOT NULL, 
            postal_code TEXT NOT NULL, 
            country TEXT NOT NULL, 
            registration_date TEXT NOT NULL 
        )
        """)

        conn.commit()
        print(f"Database {DATABASE_NAME} and table clients created successfully.")

    except sqlite3.Error as e: 
        print(f"Error creating database or table: {e}") 

    finally: 
        if conn: 
            conn.close() 

if __name__ == "__main__": 
    create_database()
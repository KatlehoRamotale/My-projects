# client_view.py

import sqlite3

DATABASE_NAME = "clients.db"


def view_all_clients():
    """Connects to the database and prints all registered clients."""
    conn = None

    try:
        conn = sqlite3.connect(DATABASE_NAME)
        cursor = conn.cursor()

        cursor.execute("SELECT * FROM clients")
        clients = cursor.fetchall()

        if clients:
            print("\n--- Registered Clients ---\n")

            # Header
            print(
                f"{'ID':<4} {'Company Name':<25} {'VAT Number':<15} "
                f"{'Contact Person':<20} {'Email':<25} {'Phone':<15} "
                f"{'City':<15} {'Country':<15}"
            )
            print("-" * 150)

            # Data rows
            for client in clients:
                print(
                    f"{client[0]:<4} "
                    f"{client[1]:<25} "
                    f"{client[2] if client[2] else 'N/A':<15} "
                    f"{client[3]:<20} "
                    f"{client[4]:<25} "
                    f"{client[5]:<15} "
                    f"{client[8]:<15} "
                    f"{client[10]:<15}"
                )

        else:
            print("No clients registered yet.")

    except sqlite3.Error as e:
        print(f"Error viewing clients: {e}")

    finally:
        if conn:
            conn.close()


if __name__ == "__main__":
    view_all_clients()
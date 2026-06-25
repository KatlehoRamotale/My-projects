# main_app.py

import sys
import sqlite3
from datetime import datetime

from PyQt6.QtWidgets import QApplication, QDialog, QMessageBox
from client_registration_app import Ui_Dialog   # ✅ FIXED IMPORT

DATABASE_NAME = "clients.db"


class ClientRegistrationApp(QDialog):   # ✅ Use QDialog (matches UI)

    def __init__(self):
        super().__init__()

        self.ui = Ui_Dialog()
        self.ui.setupUi(self)
        self.setWindowTitle("Katleho's Client Registration System")

        # ✅ Connect buttons (fixed names)
        self.ui.pushButtonSave.clicked.connect(self.save_client)
        self.ui.pushButtonClear.clicked.connect(self.clear_form)

        # Init DB
        self.init_db_connection()

    def init_db_connection(self):
        """Initialize database connection"""
        try:
            self.conn = sqlite3.connect(DATABASE_NAME)
            self.cursor = self.conn.cursor()
            print("Database connection established.")
        except sqlite3.Error as e:
            QMessageBox.critical(self, "Database Error", f"Could not connect: {e}")
            sys.exit(1)

    def save_client(self):
        """Save client to database"""

        company_name = self.ui.LineEditCompanyName.text().strip()
        vat_number = self.ui.LineEditVatNumber.text().strip()
        contact_person = self.ui.LineEditContactPerson.text().strip()
        contact_email = self.ui.LineEditContactEmail.text().strip()
        contact_phone = self.ui.LineEditContactPhone.text().strip()
        address_line1 = self.ui.LineEditAddress1.text().strip()
        address_line2 = self.ui.LineEditAddress2.text().strip()
        city = self.ui.LineEditCity.text().strip()   # ✅ FIXED (your UI uses this for city)
        postal_code = self.ui.LineEditPostalCode.text().strip()
        country = self.ui.comboBoxCountry.currentText()
        registration_date = datetime.now().strftime("%Y-%m-%d")

        # Validation
        if not company_name or not contact_person or not contact_email or \
           not contact_phone or not address_line1 or not city or \
           not postal_code or not country:

            QMessageBox.warning(self, "Input Error", "Please fill in all required fields.")
            return

        try:
            self.cursor.execute("""
                INSERT INTO clients (
                    company_name, vat_number, contact_person, contact_email,
                    contact_phone, address_line1, address_line2, city,
                    postal_code, country, registration_date
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                company_name,
                vat_number if vat_number else None,
                contact_person,
                contact_email,
                contact_phone,
                address_line1,
                address_line2 if address_line2 else None,
                city,
                postal_code,
                country,
                registration_date
            ))

            self.conn.commit()

            QMessageBox.information(self, "Success", f"{company_name} saved successfully!")
            self.clear_form()

        except sqlite3.IntegrityError as e:
            if "UNIQUE constraint failed: clients.vat_number" in str(e):
                QMessageBox.critical(self, "Error", "VAT Number already exists.")
            else:
                QMessageBox.critical(self, "Error", f"Integrity error: {e}")

        except sqlite3.Error as e:
            QMessageBox.critical(self, "Error", f"Database error: {e}")

    def clear_form(self):
        """Clear all inputs"""
        self.ui.LineEditCompanyName.clear()
        self.ui.LineEditVatNumber.clear()
        self.ui.LineEditContactPerson.clear()
        self.ui.LineEditContactEmail.clear()
        self.ui.LineEditContactPhone.clear()
        self.ui.LineEditAddress1.clear()
        self.ui.LineEditAddress2.clear()
        self.ui.LineEditCity.clear()   # ✅ city field
        self.ui.LineEditPostalCode.clear()
        self.ui.comboBoxCountry.setCurrentIndex(0)

    def closeEvent(self, event):
        """Close DB on exit"""
        if hasattr(self, "conn"):
            self.conn.close()
            print("Database connection closed.")
        event.accept()


if __name__ == "__main__":
    app = QApplication(sys.argv)
    window = ClientRegistrationApp()
    window.show()
    sys.exit(app.exec())
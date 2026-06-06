import sys
import os

# Add current directory to path so models and app can be imported
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app import app
from models import db

def init_database():
    with app.app_context():
        db.create_all()
        print("Database initialized successfully.")
        
        from models import Patient
        from datetime import date
        
        if Patient.query.count() == 0:
            patients = [
                Patient(full_name="Alice Healthy", gender="Female", date_of_birth=date(1990, 5, 14), email="alice@example.com", glucose=90.0, haemoglobin=14.5, cholesterol=180.0),
                Patient(full_name="Bob Diabetic", gender="Male", date_of_birth=date(1975, 8, 22), email="bob@example.com", glucose=250.0, haemoglobin=15.0, cholesterol=240.0),
                Patient(full_name="Charlie Anemic", gender="Male", date_of_birth=date(2000, 11, 2), email="charlie@example.com", glucose=95.0, haemoglobin=9.0, cholesterol=170.0),
                Patient(full_name="Diana Cardio", gender="Female", date_of_birth=date(1965, 3, 30), email="diana@example.com", glucose=130.0, haemoglobin=13.5, cholesterol=300.0),
                Patient(full_name="Eve Multiple", gender="Female", date_of_birth=date(1980, 1, 15), email="eve@example.com", glucose=200.0, haemoglobin=10.5, cholesterol=260.0)
            ]
            db.session.add_all(patients)
            db.session.commit()
            print("Added 5 seed patients.")
        else:
            print("Database already contains patients. No seed data added.")
            
        print("Created tables for: Patient")

if __name__ == "__main__":
    init_database()

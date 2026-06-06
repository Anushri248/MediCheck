import sys
import os

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app import app
from models import db, Patient

def remove_seeded_patients():
    with app.app_context():
        names = ["Alice Healthy", "Bob Diabetic", "Charlie Anemic", "Diana Cardio", "Eve Multiple"]
        deleted = Patient.query.filter(Patient.full_name.in_(names)).delete(synchronize_session=False)
        db.session.commit()
        print(f"Deleted {deleted} seed patients.")

if __name__ == "__main__":
    remove_seeded_patients()

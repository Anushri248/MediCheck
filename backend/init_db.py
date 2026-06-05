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
        print("Created tables for: Patient")

if __name__ == "__main__":
    init_database()

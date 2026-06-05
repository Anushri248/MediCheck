import os
import json
import re
from datetime import datetime
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
from models import db, Patient
from ai_service import generate_health_report

# Load environment variables
load_dotenv()

# Initialize Flask app
app = Flask(__name__)

# Enable CORS for React frontend
CORS(app, resources={r"/api/*": {"origins": "http://localhost:3000"}})

# Configuration
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///medicheck.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SECRET_KEY'] = os.environ.get('FLASK_SECRET_KEY', 'default-dev-key')

# Initialize DB
db.init_app(app)

# Validation Helpers
def validate_patient_data(data):
    errors = {}
    
    if not data.get('full_name') or not str(data['full_name']).strip():
        errors['full_name'] = 'Full name is required and must not be empty.'
        
    gender = str(data.get('gender', '')).strip()
    if gender not in ['Male', 'Female', 'Other']:
        errors['gender'] = 'Gender must be one of "Male", "Female", or "Other".'
        
    email = str(data.get('email', '')).strip()
    email_regex = re.compile(r"^\S+@\S+\.\S+$")
    if not email_regex.match(email):
        errors['email'] = 'Valid email format is required.'
        
    try:
        dob = datetime.strptime(data.get('date_of_birth', ''), '%Y-%m-%d').date()
        if dob > datetime.today().date():
            errors['date_of_birth'] = 'Date of birth cannot be in the future.'
    except ValueError:
        errors['date_of_birth'] = 'Valid date of birth (YYYY-MM-DD) is required.'
        
    for field in ['glucose', 'haemoglobin', 'cholesterol']:
        try:
            val = float(data.get(field, 0))
            if val <= 0:
                errors[field] = f'{field.capitalize()} must be a positive numeric value.'
        except (ValueError, TypeError):
            errors[field] = f'{field.capitalize()} must be a valid number.'
            
    return errors

# Endpoints

@app.route('/api/patients', methods=['POST'])
def create_patient():
    data = request.get_json() or {}
    
    # Validate
    errors = validate_patient_data(data)
    if errors:
        return jsonify({"error": "Validation failed", "details": errors}), 400
        
    # Generate AI Report based on data
    report_dict = generate_health_report(data)
    
    try:
        # Create Patient
        dob = datetime.strptime(data['date_of_birth'], '%Y-%m-%d').date()
        new_patient = Patient(
            full_name=data['full_name'].strip(),
            gender=data['gender'].strip(),
            date_of_birth=dob,
            email=data['email'].strip(),
            glucose=float(data['glucose']),
            haemoglobin=float(data['haemoglobin']),
            cholesterol=float(data['cholesterol']),
            remarks=json.dumps(report_dict)  # Save JSON string
        )
        
        db.session.add(new_patient)
        db.session.commit()
        
        return jsonify(new_patient.to_dict()), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "Failed to create patient", "details": str(e)}), 500


@app.route('/api/patients', methods=['GET'])
def get_patients():
    patients = Patient.query.order_by(Patient.created_at.desc()).all()
    return jsonify([p.to_dict() for p in patients]), 200


@app.route('/api/patients/<int:patient_id>', methods=['GET'])
def get_patient(patient_id):
    patient = Patient.query.get(patient_id)
    if not patient:
        return jsonify({"error": "Patient not found"}), 404
        
    return jsonify(patient.to_dict()), 200


@app.route('/api/patients/<int:patient_id>', methods=['PUT'])
def update_patient(patient_id):
    patient = Patient.query.get(patient_id)
    if not patient:
        return jsonify({"error": "Patient not found"}), 404
        
    data = request.get_json() or {}
    
    # Validate
    errors = validate_patient_data(data)
    if errors:
        return jsonify({"error": "Validation failed", "details": errors}), 400
        
    # Generate new AI Report based on updated data
    report_dict = generate_health_report(data)
    
    try:
        patient.full_name = data['full_name'].strip()
        patient.gender = data['gender'].strip()
        patient.date_of_birth = datetime.strptime(data['date_of_birth'], '%Y-%m-%d').date()
        patient.email = data['email'].strip()
        patient.glucose = float(data['glucose'])
        patient.haemoglobin = float(data['haemoglobin'])
        patient.cholesterol = float(data['cholesterol'])
        patient.remarks = json.dumps(report_dict)
        
        db.session.commit()
        return jsonify(patient.to_dict()), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "Failed to update patient", "details": str(e)}), 500



@app.route('/api/patients/<int:patient_id>', methods=['DELETE'])
def delete_patient(patient_id):
    patient = Patient.query.get(patient_id)
    if not patient:
        return jsonify({"error": "Patient not found"}), 404
        
    try:
        db.session.delete(patient)
        db.session.commit()
        return jsonify({"message": "Patient deleted successfully"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "Failed to delete patient", "details": str(e)}), 500


if __name__ == '__main__':
    app.run(debug=True, port=5000)

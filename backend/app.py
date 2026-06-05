import os
import re
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
from datetime import date
from models import db, Patient

load_dotenv()

app = Flask(__name__)
CORS(app)

app.config['SECRET_KEY'] = os.environ.get('FLASK_SECRET_KEY', 'dev_secret_key')
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///medicheck.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db.init_app(app)


def validate_patient_data(data):
    errors = []

    if not data.get('full_name', '').strip():
        errors.append('full_name must not be empty.')

    email = data.get('email', '')
    if not re.match(r'^[\w\.-]+@[\w\.-]+\.\w{2,}$', email):
        errors.append('email must be a valid email address.')

    dob_str = data.get('date_of_birth', '')
    try:
        dob = date.fromisoformat(dob_str)
        if dob > date.today():
            errors.append('date_of_birth must not be a future date.')
    except ValueError:
        errors.append('date_of_birth must be a valid date in YYYY-MM-DD format.')

    for field in ('glucose', 'haemoglobin', 'cholesterol'):
        value = data.get(field)
        try:
            if float(value) <= 0:
                errors.append(f'{field} must be a positive numeric value.')
        except (TypeError, ValueError):
            errors.append(f'{field} must be a numeric value.')

    return errors


@app.route('/patients', methods=['POST'])
def create_patient():
    data = request.get_json()

    errors = validate_patient_data(data)
    if errors:
        return jsonify({'errors': errors}), 400

    if Patient.query.filter_by(email=data['email']).first():
        return jsonify({'error': 'A patient with this email already exists.'}), 400

    patient = Patient(
        full_name=data['full_name'].strip(),
        email=data['email'],
        date_of_birth=date.fromisoformat(data['date_of_birth']),
        glucose=float(data['glucose']),
        haemoglobin=float(data['haemoglobin']),
        cholesterol=float(data['cholesterol']),
        remarks=data.get('remarks')
    )

    db.session.add(patient)
    db.session.commit()

    return jsonify(patient.to_dict()), 201


@app.route('/patients', methods=['GET'])
def get_patients():
    patients = Patient.query.order_by(Patient.created_at.desc()).all()
    return jsonify([p.to_dict() for p in patients]), 200


@app.route('/patients/<int:patient_id>', methods=['GET'])
def get_patient(patient_id):
    patient = Patient.query.get(patient_id)
    if not patient:
        return jsonify({'error': f'Patient with id {patient_id} not found.'}), 404
    return jsonify(patient.to_dict()), 200


@app.route('/patients/<int:patient_id>', methods=['PUT'])
def update_patient(patient_id):
    patient = Patient.query.get(patient_id)
    if not patient:
        return jsonify({'error': f'Patient with id {patient_id} not found.'}), 404

    data = request.get_json()

    errors = validate_patient_data(data)
    if errors:
        return jsonify({'errors': errors}), 400

    # Check email uniqueness only if the email is being changed
    if data['email'] != patient.email and Patient.query.filter_by(email=data['email']).first():
        return jsonify({'error': 'A patient with this email already exists.'}), 400

    patient.full_name = data['full_name'].strip()
    patient.email = data['email']
    patient.date_of_birth = date.fromisoformat(data['date_of_birth'])
    patient.glucose = float(data['glucose'])
    patient.haemoglobin = float(data['haemoglobin'])
    patient.cholesterol = float(data['cholesterol'])

    if 'remarks' in data:
        patient.remarks = data['remarks']

    db.session.commit()

    return jsonify(patient.to_dict()), 200


@app.route('/patients/<int:patient_id>', methods=['DELETE'])
def delete_patient(patient_id):
    patient = Patient.query.get(patient_id)
    if not patient:
        return jsonify({'error': f'Patient with id {patient_id} not found.'}), 404

    db.session.delete(patient)
    db.session.commit()

    return jsonify({'message': f'Patient {patient_id} deleted successfully.'}), 200


if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True)

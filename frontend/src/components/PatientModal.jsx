import React, { useState, useEffect } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';

const PatientModal = ({ show, onHide, onSave, patientData }) => {
  const isEditMode = !!patientData;
  
  const initialFormData = {
    fullName: '',
    dob: '',
    email: '',
    glucose: '',
    haemoglobin: '',
    cholesterol: '',
    remarks: ''
  };

  const [formData, setFormData] = useState(initialFormData);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (show) {
      if (patientData) {
        setFormData({ ...patientData });
      } else {
        setFormData(initialFormData);
      }
      setErrors({});
    }
  }, [show, patientData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors({ ...errors, [name]: null });
    }
  };

  const validate = () => {
    const newErrors = {};
    const today = new Date().toISOString().split('T')[0];

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email format is invalid';
    }

    if (!formData.dob) {
      newErrors.dob = 'Date of birth is required';
    } else if (formData.dob > today) {
      newErrors.dob = 'Date of birth cannot be in the future';
    }

    if (!formData.glucose || Number(formData.glucose) <= 0) {
      newErrors.glucose = 'Glucose must be a positive number';
    }

    if (!formData.haemoglobin || Number(formData.haemoglobin) <= 0) {
      newErrors.haemoglobin = 'Haemoglobin must be a positive number';
    }

    if (!formData.cholesterol || Number(formData.cholesterol) <= 0) {
      newErrors.cholesterol = 'Cholesterol must be a positive number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      onSave(formData);
    }
  };

  return (
    <Modal show={show} onHide={onHide} backdrop="static" keyboard={false} size="lg" centered>
      <Modal.Header closeButton className="border-b border-gray-200">
        <Modal.Title className="text-xl font-semibold text-gray-800">
          {isEditMode ? 'Edit Patient' : 'Add Patient'}
        </Modal.Title>
      </Modal.Header>
      
      <Form onSubmit={handleSubmit}>
        <Modal.Body className="p-4 bg-gray-50">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white p-4 rounded-lg shadow-sm border border-gray-100">
            
            <Form.Group className="mb-3">
              <Form.Label className="text-sm font-medium text-gray-700">Full Name</Form.Label>
              <Form.Control
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                isInvalid={!!errors.fullName}
                placeholder="John Doe"
                className="rounded-md"
              />
              <Form.Control.Feedback type="invalid" className="text-xs">{errors.fullName}</Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="text-sm font-medium text-gray-700">Email Address</Form.Label>
              <Form.Control
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                isInvalid={!!errors.email}
                placeholder="john@example.com"
                className="rounded-md"
              />
              <Form.Control.Feedback type="invalid" className="text-xs">{errors.email}</Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="text-sm font-medium text-gray-700">Date of Birth</Form.Label>
              <Form.Control
                type="date"
                name="dob"
                value={formData.dob}
                onChange={handleChange}
                isInvalid={!!errors.dob}
                max={new Date().toISOString().split('T')[0]}
                className="rounded-md"
              />
              <Form.Control.Feedback type="invalid" className="text-xs">{errors.dob}</Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="text-sm font-medium text-gray-700">Glucose (mg/dL)</Form.Label>
              <Form.Control
                type="number"
                step="0.1"
                name="glucose"
                value={formData.glucose}
                onChange={handleChange}
                isInvalid={!!errors.glucose}
                placeholder="e.g. 90"
                className="rounded-md"
              />
              <Form.Control.Feedback type="invalid" className="text-xs">{errors.glucose}</Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="text-sm font-medium text-gray-700">Haemoglobin (g/dL)</Form.Label>
              <Form.Control
                type="number"
                step="0.1"
                name="haemoglobin"
                value={formData.haemoglobin}
                onChange={handleChange}
                isInvalid={!!errors.haemoglobin}
                placeholder="e.g. 14.5"
                className="rounded-md"
              />
              <Form.Control.Feedback type="invalid" className="text-xs">{errors.haemoglobin}</Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="text-sm font-medium text-gray-700">Cholesterol (mg/dL)</Form.Label>
              <Form.Control
                type="number"
                step="0.1"
                name="cholesterol"
                value={formData.cholesterol}
                onChange={handleChange}
                isInvalid={!!errors.cholesterol}
                placeholder="e.g. 180"
                className="rounded-md"
              />
              <Form.Control.Feedback type="invalid" className="text-xs">{errors.cholesterol}</Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-3 md:col-span-2">
              <Form.Label className="text-sm font-medium text-gray-700">Remarks (AI Generated)</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="remarks"
                value={formData.remarks}
                readOnly
                placeholder="Remarks will be automatically generated by the AI after saving..."
                className="bg-gray-100 rounded-md text-gray-600 text-sm italic"
              />
            </Form.Group>

          </div>
        </Modal.Body>
        
        <Modal.Footer className="bg-white border-t border-gray-200">
          <Button variant="outline-secondary" onClick={onHide} className="rounded-md font-medium px-4">
            Cancel
          </Button>
          <Button variant="primary" type="submit" className="rounded-md font-medium px-4 shadow-sm bg-blue-600 hover:bg-blue-700 border-0">
            Save
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default PatientModal;

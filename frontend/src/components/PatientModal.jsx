import React, { useState, useEffect } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';

const PatientModal = ({ show, onHide, onSave, patientData }) => {
  const isEditMode = !!patientData;
  
  const initialFormData = {
    id: null,
    fullName: '',
    gender: '',
    dob: '',
    email: '',
    glucose: '',
    haemoglobin: '',
    cholesterol: ''
  };

  const [formData, setFormData] = useState(initialFormData);
  const [errors, setErrors] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [analysisData, setAnalysisData] = useState(null);

  useEffect(() => {
    if (show) {
      if (patientData) {
        setFormData({ ...patientData, gender: patientData.gender || 'Male' });
        // If editing a patient that already has analysis, we still start at step 1
        // so they can edit. They can see analysis in table, or save again to re-analyze.
      } else {
        setFormData(initialFormData);
      }
      setErrors({});
      setIsSaving(false);
      setCurrentStep(1);
      setAnalysisData(null);
    }
  }, [show, patientData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
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

    if (!formData.gender) {
      newErrors.gender = 'Gender is required';
    }

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      newErrors.email = 'Email format is invalid';
    }

    if (!formData.dob) {
      newErrors.dob = 'Date of birth is required';
    } else if (formData.dob > today) {
      newErrors.dob = 'Date of birth cannot be in the future';
    }

    if (!formData.glucose || Number(formData.glucose) <= 0) {
      newErrors.glucose = 'Glucose must be positive';
    }

    if (!formData.haemoglobin || Number(formData.haemoglobin) <= 0) {
      newErrors.haemoglobin = 'Haemoglobin must be positive';
    }

    if (!formData.cholesterol || Number(formData.cholesterol) <= 0) {
      newErrors.cholesterol = 'Cholesterol must be positive';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validate()) {
      setIsSaving(true);
      const savedPatient = await onSave(formData);
      setIsSaving(false);
      
      if (savedPatient && savedPatient.remarks) {
        setFormData(prev => ({ ...prev, id: savedPatient.id }));
        try {
          // Remarks comes back as a JSON string from backend
          const parsedRemarks = typeof savedPatient.remarks === 'string' 
            ? JSON.parse(savedPatient.remarks) 
            : savedPatient.remarks;
            
          setAnalysisData(parsedRemarks);
          setCurrentStep(2); // Move to Analysis view
        } catch (error) {
          console.error("Failed to parse AI remarks", error);
          onHide(); // Fallback if parsing fails
        }
      } else if (savedPatient) {
        onHide();
      }
    }
  };

  const getRiskBadgeColor = (riskLevel) => {
    switch (riskLevel?.toUpperCase()) {
      case 'HIGH': return 'bg-red-100 text-red-800 border-red-200';
      case 'MODERATE': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'LOW': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <Modal show={show} onHide={onHide} backdrop="static" keyboard={false} size="lg" centered>
      <Modal.Header closeButton className="border-b border-gray-100 px-6 py-4">
        <Modal.Title className="text-xl font-bold text-gray-800">
          {currentStep === 1 
            ? (isEditMode ? 'Edit Patient' : 'Add New Patient')
            : 'AI Health Report Generated'
          }
        </Modal.Title>
      </Modal.Header>
      
      {currentStep === 1 && (
        <Form onSubmit={handleSubmit}>
          <Modal.Body className="p-6 bg-gray-50">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="mb-4">
                <h5 className="text-md font-semibold text-gray-800">Patient Details</h5>
                <p className="text-sm text-gray-500">Enter the patient's vitals to prepare for AI analysis.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                <Form.Group>
                  <Form.Label className="text-sm font-medium text-gray-700">Full Name</Form.Label>
                  <Form.Control
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    isInvalid={!!errors.fullName}
                    placeholder="e.g. Jane Doe"
                    className="rounded-lg border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                  />
                  <Form.Control.Feedback type="invalid" className="text-xs mt-1">{errors.fullName}</Form.Control.Feedback>
                </Form.Group>

                <div className="grid grid-cols-2 gap-4">
                  <Form.Group>
                    <Form.Label className="text-sm font-medium text-gray-700">Gender</Form.Label>
                    <Form.Select
                      name="gender"
                      value={formData.gender}
                      onChange={handleChange}
                      isInvalid={!!errors.gender}
                      className="rounded-lg border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </Form.Select>
                    <Form.Control.Feedback type="invalid" className="text-xs mt-1">{errors.gender}</Form.Control.Feedback>
                  </Form.Group>

                  <Form.Group>
                    <Form.Label className="text-sm font-medium text-gray-700">Date of Birth</Form.Label>
                    <Form.Control
                      type="date"
                      name="dob"
                      value={formData.dob}
                      onChange={handleChange}
                      isInvalid={!!errors.dob}
                      max={new Date().toISOString().split('T')[0]}
                      className="rounded-lg border-gray-200 focus:border-blue-500 focus:ring-blue-500 px-2"
                    />
                    <Form.Control.Feedback type="invalid" className="text-xs mt-1">{errors.dob}</Form.Control.Feedback>
                  </Form.Group>
                </div>
              </div>

              <div className="mb-4">
                <Form.Group>
                  <Form.Label className="text-sm font-medium text-gray-700">Email Address</Form.Label>
                  <Form.Control
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    isInvalid={!!errors.email}
                    placeholder="jane.doe@example.com"
                    className="rounded-lg border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                  />
                  <Form.Control.Feedback type="invalid" className="text-xs mt-1">{errors.email}</Form.Control.Feedback>
                </Form.Group>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
                <Form.Group>
                  <Form.Label className="text-sm font-medium text-gray-700">Glucose (mg/dL)</Form.Label>
                  <Form.Control
                    type="number"
                    step="0.1"
                    name="glucose"
                    value={formData.glucose}
                    onChange={handleChange}
                    isInvalid={!!errors.glucose}
                    placeholder="e.g. 90"
                    className="rounded-lg border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                  />
                  <Form.Control.Feedback type="invalid" className="text-xs mt-1">{errors.glucose}</Form.Control.Feedback>
                </Form.Group>

                <Form.Group>
                  <Form.Label className="text-sm font-medium text-gray-700">Haemoglobin (g/dL)</Form.Label>
                  <Form.Control
                    type="number"
                    step="0.1"
                    name="haemoglobin"
                    value={formData.haemoglobin}
                    onChange={handleChange}
                    isInvalid={!!errors.haemoglobin}
                    placeholder="e.g. 14.5"
                    className="rounded-lg border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                  />
                  <Form.Control.Feedback type="invalid" className="text-xs mt-1">{errors.haemoglobin}</Form.Control.Feedback>
                </Form.Group>

                <Form.Group>
                  <Form.Label className="text-sm font-medium text-gray-700">Cholesterol (mg/dL)</Form.Label>
                  <Form.Control
                    type="number"
                    step="0.1"
                    name="cholesterol"
                    value={formData.cholesterol}
                    onChange={handleChange}
                    isInvalid={!!errors.cholesterol}
                    placeholder="e.g. 180"
                    className="rounded-lg border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                  />
                  <Form.Control.Feedback type="invalid" className="text-xs mt-1">{errors.cholesterol}</Form.Control.Feedback>
                </Form.Group>
              </div>
              
              {isSaving && (
                <div className="bg-purple-50 p-4 rounded-lg flex items-center justify-center gap-3 border border-purple-100 mt-6">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-purple-600"></div>
                  <span className="text-sm font-medium text-purple-800">Saving patient and generating AI analysis...</span>
                </div>
              )}
            </div>
          </Modal.Body>
          
          <Modal.Footer className="bg-white border-t border-gray-100 px-6 py-4">
            <Button 
              variant="light" 
              onClick={onHide} 
              disabled={isSaving}
              className="rounded-lg font-medium px-5 text-gray-600 bg-gray-100 hover:bg-gray-200 border-0"
            >
              Cancel
            </Button>
            <Button 
              variant="primary" 
              type="submit" 
              disabled={isSaving}
              className="rounded-lg font-medium px-5 shadow-sm bg-purple-600 hover:bg-purple-700 border-0 ml-2 flex items-center gap-2"
            >
              {isSaving ? 'Processing...' : '✨ Save & Analyze'}
            </Button>
          </Modal.Footer>
        </Form>
      )}

      {currentStep === 2 && analysisData && (
        <>
          <Modal.Body className="p-6 bg-gray-50 max-h-[70vh] overflow-y-auto">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-6">
              
              <div className="flex items-start justify-between border-b border-gray-100 pb-4">
                <div>
                  <h4 className="text-lg font-bold text-gray-800">Analysis for {formData.fullName}</h4>
                  <p className="text-sm text-gray-500">Generated by Gemini AI</p>
                </div>
                <div className={`px-3 py-1 rounded-full border text-xs font-bold tracking-wide ${getRiskBadgeColor(analysisData.risk_level)}`}>
                  RISK: {analysisData.risk_level || 'UNKNOWN'}
                </div>
              </div>

              <div>
                <h5 className="text-sm font-bold text-gray-700 uppercase tracking-wider mb-2">Clinical Summary</h5>
                <p className="text-gray-600 text-sm leading-relaxed bg-gray-50 p-4 rounded-lg border border-gray-100">
                  {analysisData.clinical_summary}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h5 className="text-sm font-bold text-red-700 uppercase tracking-wider mb-2 flex items-center gap-2">
                    <span>🚨</span> Identified Risks
                  </h5>
                  <ul className="space-y-2">
                    {analysisData.identified_risks?.length > 0 ? (
                      analysisData.identified_risks.map((risk, i) => (
                        <li key={i} className="text-sm text-gray-600 flex items-start gap-2">
                          <span className="text-red-500 mt-0.5">•</span>
                          <span>{risk}</span>
                        </li>
                      ))
                    ) : (
                      <li className="text-sm text-gray-500 italic">No significant risks identified.</li>
                    )}
                  </ul>
                </div>

                <div>
                  <h5 className="text-sm font-bold text-green-700 uppercase tracking-wider mb-2 flex items-center gap-2">
                    <span>💡</span> Recommendations
                  </h5>
                  <ul className="space-y-2">
                    {analysisData.recommendations?.length > 0 ? (
                      analysisData.recommendations.map((rec, i) => (
                        <li key={i} className="text-sm text-gray-600 flex items-start gap-2">
                          <span className="text-green-500 mt-0.5">•</span>
                          <span>{rec}</span>
                        </li>
                      ))
                    ) : (
                      <li className="text-sm text-gray-500 italic">No specific recommendations.</li>
                    )}
                  </ul>
                </div>
              </div>

              <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                <h5 className="text-sm font-bold text-blue-800 uppercase tracking-wider mb-1 flex items-center gap-2">
                  <span>📅</span> Follow Up Plan
                </h5>
                <p className="text-sm text-blue-900">{analysisData.follow_up}</p>
              </div>

            </div>
          </Modal.Body>
          <Modal.Footer className="bg-white border-t border-gray-100 px-6 py-4 flex justify-between">
            <Button 
              variant="light" 
              onClick={() => setCurrentStep(1)} 
              className="rounded-lg font-medium px-4 text-gray-600 hover:bg-gray-100 border-0"
            >
              &larr; Back to Edit
            </Button>
            <Button 
              variant="primary" 
              onClick={onHide} 
              className="rounded-lg font-medium px-6 shadow-sm bg-gray-800 hover:bg-gray-900 border-0"
            >
              Done & Close
            </Button>
          </Modal.Footer>
        </>
      )}
    </Modal>
  );
};

export default PatientModal;

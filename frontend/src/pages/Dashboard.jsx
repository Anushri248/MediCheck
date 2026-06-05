import React, { useState } from 'react';
import { Button } from 'react-bootstrap';
import PatientTable from '../components/PatientTable';
import PatientModal from '../components/PatientModal';

const Dashboard = () => {
  const [patients, setPatients] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);

  const handleOpenModal = (patient = null) => {
    setSelectedPatient(patient);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedPatient(null);
  };

  const handleSavePatient = (patientData) => {
    if (selectedPatient) {
      // Edit mode
      setPatients(patients.map(p => p.id === selectedPatient.id ? { ...p, ...patientData } : p));
    } else {
      // Add mode
      const newPatient = {
        ...patientData,
        id: Date.now().toString(), // Simple ID generation
        remarks: 'Processing by AI...' // Empty state simulation
      };
      setPatients([...patients, newPatient]);
    }
    handleCloseModal();
  };

  const handleDeletePatient = (patientId) => {
    setPatients(patients.filter(p => p.id !== patientId));
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Patient Dashboard</h2>
          <p className="text-gray-500 text-sm mt-1">Manage and view patient medical records</p>
        </div>
        <Button 
          variant="primary" 
          className="bg-blue-600 hover:bg-blue-700 border-0 font-medium shadow-sm rounded-md px-4 py-2"
          onClick={() => handleOpenModal()}
        >
          + Add Patient
        </Button>
      </div>

      <PatientTable 
        patients={patients} 
        onEdit={handleOpenModal} 
        onDelete={handleDeletePatient} 
      />

      <PatientModal 
        show={showModal} 
        onHide={handleCloseModal} 
        onSave={handleSavePatient}
        patientData={selectedPatient}
      />
    </div>
  );
};

export default Dashboard;

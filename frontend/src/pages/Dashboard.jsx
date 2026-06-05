import React, { useState, useMemo, useEffect } from 'react';
import { Button, Form } from 'react-bootstrap';
import PatientTable from '../components/PatientTable';
import PatientModal from '../components/PatientModal';
import PatientDetailModal from '../components/PatientDetailModal';
import { reanalysePatient } from '../services/api';

const AnimatedNumber = ({ value }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = parseInt(value, 10);
    if (isNaN(end) || end === 0) {
      setCount(value);
      return;
    }
    
    // Total animation time 1 second
    const totalDuration = 1000;
    // Limit max increments to 60fps
    const steps = Math.min(end, 60);
    const stepTime = totalDuration / steps;
    const increment = end / steps;
    
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(Math.ceil(current));
      }
    }, stepTime);

    return () => clearInterval(timer);
  }, [value]);

  return <span>{count}</span>;
};

const Dashboard = () => {
  const [patients, setPatients] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [viewingPatient, setViewingPatient] = useState(null);
  
  const [activeFilter, setActiveFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      const response = await fetch('http://127.0.0.1:5000/api/patients');
      if (response.ok) {
        const data = await response.json();
        const mappedData = data.map(p => ({
          id: p.id,
          fullName: p.full_name,
          gender: p.gender,
          dob: p.date_of_birth,
          email: p.email,
          glucose: p.glucose,
          haemoglobin: p.haemoglobin,
          cholesterol: p.cholesterol,
          remarks: p.remarks,
          createdAt: p.created_at
        }));
        setPatients(mappedData);
      }
    } catch (error) {
      console.error('Failed to fetch patients:', error);
    }
  };

  const handleOpenModal = (patient = null) => {
    setSelectedPatient(patient);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedPatient(null);
  };

  const handleViewPatient = (patient) => {
    setViewingPatient(patient);
    setShowDetailModal(true);
  };

  const handleSavePatient = async (patientData) => {
    try {
      const isEdit = !!patientData.id || !!selectedPatient;
      const patientId = patientData.id || (selectedPatient ? selectedPatient.id : null);
      
      const url = isEdit 
        ? `http://127.0.0.1:5000/api/patients/${patientId}`
        : 'http://127.0.0.1:5000/api/patients';
        
      const apiPayload = {
        full_name: patientData.fullName,
        gender: patientData.gender,
        date_of_birth: patientData.dob,
        email: patientData.email,
        glucose: patientData.glucose,
        haemoglobin: patientData.haemoglobin,
        cholesterol: patientData.cholesterol
      };
        
      const response = await fetch(url, {
        method: isEdit ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(apiPayload)
      });
      
      if (response.ok) {
        await fetchPatients();
        const savedData = await response.json();
        return savedData;
      } else {
        const errorData = await response.json();
        alert('Validation Failed: ' + JSON.stringify(errorData.details || errorData.error));
        return null;
      }
    } catch (error) {
      console.error('Error saving patient:', error);
      alert('Error connecting to server.');
    }
  };

  const handleDeletePatient = async (patientId) => {
    try {
      const response = await fetch(`http://127.0.0.1:5000/api/patients/${patientId}`, {
        method: 'DELETE'
      });
      if (response.ok) {
        await fetchPatients(); // refresh data
      }
    } catch (error) {
      console.error('Error deleting patient:', error);
    }
  };

  const parseRiskLevel = (remarks) => {
    if (!remarks) return null;
    if (typeof remarks === 'object') return remarks.risk_level;
    try {
      const parsed = JSON.parse(remarks);
      return parsed.risk_level;
    } catch (e) {
      return null;
    }
  };

  const isAtRisk = (remarks) => {
    const riskLevel = parseRiskLevel(remarks);
    if (riskLevel === 'HIGH') return true;
    
    if (!remarks || typeof remarks !== 'string') return false;
    const lower = remarks.toLowerCase();
    return ['risk', 'high', 'elevated', 'danger'].some(word => lower.includes(word));
  };

  const needsMonitoring = (remarks) => {
    const riskLevel = parseRiskLevel(remarks);
    if (riskLevel === 'MODERATE') return true;
    
    if (!remarks || typeof remarks !== 'string') return false;
    const lower = remarks.toLowerCase();
    return ['moderate', 'borderline', 'monitor'].some(word => lower.includes(word));
  };

  const isThisWeek = (dateString) => {
    if (!dateString) return false;
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
    return diffDays <= 7;
  };

  // Stats for cards
  const stats = useMemo(() => {
    return {
      total: patients.length,
      atRisk: patients.filter(p => isAtRisk(p.remarks)).length,
      monitoring: patients.filter(p => needsMonitoring(p.remarks)).length,
      thisWeek: patients.filter(p => isThisWeek(p.createdAt)).length
    };
  }, [patients]);

  // Filtered and searched patients
  const displayPatients = useMemo(() => {
    let filtered = patients;

    // Apply Card Filter
    if (activeFilter === 'At Risk') {
      filtered = filtered.filter(p => isAtRisk(p.remarks));
    } else if (activeFilter === 'Needs Monitoring') {
      filtered = filtered.filter(p => needsMonitoring(p.remarks));
    } else if (activeFilter === 'This Week') {
      filtered = filtered.filter(p => isThisWeek(p.createdAt));
    }

    // Apply Search Query
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(p => 
        (p.fullName && p.fullName.toLowerCase().includes(q)) || 
        (p.email && p.email.toLowerCase().includes(q))
      );
    }

    return filtered;
  }, [patients, activeFilter, searchQuery]);

  return (
    <div className="max-w-7xl mx-auto p-5">
      <div className="mb-5">
        <h2 className="text-2xl font-bold text-gray-800">Patient Dashboard</h2>
        <p className="text-gray-500 text-sm mt-1">Manage and view patient medical records</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-5">
        <div 
          onClick={() => setActiveFilter('All')}
          className={`relative rounded-lg shadow-sm border-l-4 border-blue-500 p-3 cursor-pointer transition-colors ${activeFilter === 'All' ? 'bg-blue-100' : 'bg-blue-50 hover:bg-blue-100/50'}`}
        >
          <p className="text-xs text-blue-800/70 font-medium uppercase tracking-wide">Total Patients</p>
          <p className="text-[2rem] font-bold text-gray-800 leading-none mt-2"><AnimatedNumber value={stats.total} /></p>
          <div className="absolute top-3 right-3 text-lg opacity-80">🧑‍⚕️</div>
        </div>

        <div 
          onClick={() => setActiveFilter('At Risk')}
          className={`relative rounded-lg shadow-sm border-l-4 border-red-500 p-3 cursor-pointer transition-colors ${activeFilter === 'At Risk' ? 'bg-red-100' : 'bg-red-50 hover:bg-red-100/50'}`}
        >
          <p className="text-xs text-red-800/70 font-medium uppercase tracking-wide">At Risk</p>
          <p className="text-[2rem] font-bold text-gray-800 leading-none mt-2"><AnimatedNumber value={stats.atRisk} /></p>
          <div className="absolute top-3 right-3 text-lg opacity-80">🚨</div>
        </div>

        <div 
          onClick={() => setActiveFilter('Needs Monitoring')}
          className={`relative rounded-lg shadow-sm border-l-4 border-yellow-500 p-3 cursor-pointer transition-colors ${activeFilter === 'Needs Monitoring' ? 'bg-yellow-100' : 'bg-yellow-50 hover:bg-yellow-100/50'}`}
        >
          <p className="text-xs text-yellow-800/70 font-medium uppercase tracking-wide">Needs Monitoring</p>
          <p className="text-[2rem] font-bold text-gray-800 leading-none mt-2"><AnimatedNumber value={stats.monitoring} /></p>
          <div className="absolute top-3 right-3 text-lg opacity-80">⚠️</div>
        </div>

        <div 
          onClick={() => setActiveFilter('This Week')}
          className={`relative rounded-lg shadow-sm border-l-4 border-green-500 p-3 cursor-pointer transition-colors ${activeFilter === 'This Week' ? 'bg-green-100' : 'bg-green-50 hover:bg-green-100/50'}`}
        >
          <p className="text-xs text-green-800/70 font-medium uppercase tracking-wide">Added This Week</p>
          <p className="text-[2rem] font-bold text-gray-800 leading-none mt-2"><AnimatedNumber value={stats.thisWeek} /></p>
          <div className="absolute top-3 right-3 text-lg opacity-80">📅</div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-4 w-1/3">
          <Form.Control
            type="text"
            placeholder="Search by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="rounded-lg shadow-sm border-gray-200 text-sm py-1.5"
          />
          {activeFilter !== 'All' && (
            <button 
              onClick={() => setActiveFilter('All')} 
              className="text-sm text-blue-600 hover:text-blue-800 whitespace-nowrap"
            >
              Clear Filter
            </button>
          )}
        </div>
        <Button 
          variant="primary" 
          className="bg-blue-600 hover:bg-blue-700 border-0 font-medium shadow-sm rounded-lg px-4 py-2 text-sm"
          onClick={() => handleOpenModal()}
        >
          + Add Patient
        </Button>
      </div>

      <PatientTable 
        patients={displayPatients} 
        activeFilter={activeFilter}
        onView={handleViewPatient}
        onEdit={handleOpenModal} 
        onDelete={handleDeletePatient} 
      />

      <PatientModal 
        show={showModal} 
        onHide={handleCloseModal} 
        onSave={handleSavePatient}
        patientData={selectedPatient}
      />

      <PatientDetailModal
        show={showDetailModal}
        onHide={() => setShowDetailModal(false)}
        patient={viewingPatient}
      />
    </div>
  );
};

export default Dashboard;

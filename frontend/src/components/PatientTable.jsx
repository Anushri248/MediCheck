import React from 'react';
import { Table, Button } from 'react-bootstrap';

const PatientTable = ({ patients, activeFilter, onEdit, onDelete }) => {
  const getFilterTitle = () => {
    switch (activeFilter) {
      case 'At Risk': return 'At Risk Patients';
      case 'Needs Monitoring': return 'Patients Needing Monitoring';
      case 'This Week': return 'Patients Added This Week';
      default: return 'All Patients';
    }
  };

  const getBadgeStyle = (remarks) => {
    if (!remarks || remarks === 'Processing by AI...' || remarks.trim() === '') {
      return 'bg-gray-100 text-gray-700';
    }
    const lower = remarks.toLowerCase();
    if (['risk', 'high', 'elevated', 'danger'].some(w => lower.includes(w))) {
      return 'bg-red-100 text-red-700';
    }
    if (['moderate', 'borderline', 'monitor'].some(w => lower.includes(w))) {
      return 'bg-yellow-100 text-yellow-700';
    }
    if (['normal', 'healthy', 'good'].some(w => lower.includes(w))) {
      return 'bg-green-100 text-green-700';
    }
    return 'bg-gray-100 text-gray-700';
  };

  const truncate = (text, length = 30) => {
    if (!text) return '-';
    if (text.length <= length) return text;
    return text.substring(0, length) + '...';
  };

  if (!patients || patients.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">{getFilterTitle()}</h3>
        <div className="text-center py-12">
          <div className="text-4xl mb-4">📭</div>
          <h4 className="text-gray-500 font-medium">No patient records found</h4>
          <p className="text-gray-400 text-sm mt-2">There are no patients matching the current filter.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">{getFilterTitle()}</h3>
      
      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <Table hover className="mb-0 border-collapse w-full bg-gray-50">
          <thead>
            <tr className="bg-gray-100 text-left">
              <th className="px-4 py-3 text-gray-600 font-semibold text-sm border border-gray-200">#</th>
              <th className="px-4 py-3 text-gray-600 font-semibold text-sm border border-gray-200">Full Name</th>
              <th className="px-4 py-3 text-gray-600 font-semibold text-sm border border-gray-200">Date of Birth</th>
              <th className="px-4 py-3 text-gray-600 font-semibold text-sm border border-gray-200">Email</th>
              <th className="px-4 py-3 text-gray-600 font-semibold text-sm border border-gray-200">Glucose</th>
              <th className="px-4 py-3 text-gray-600 font-semibold text-sm border border-gray-200">Hb</th>
              <th className="px-4 py-3 text-gray-600 font-semibold text-sm border border-gray-200">Cholesterol</th>
              <th className="px-4 py-3 text-gray-600 font-semibold text-sm border border-gray-200">Remarks</th>
              <th className="px-4 py-3 text-gray-600 font-semibold text-sm border border-gray-200 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {patients.map((patient, index) => (
              <tr key={patient.id || index} className="hover:bg-blue-50/50 transition-colors bg-white">
                <td className="px-4 py-3 text-sm text-gray-500 border border-gray-200">{index + 1}</td>
                <td className="px-4 py-3 text-sm font-medium text-gray-900 border border-gray-200">{patient.fullName}</td>
                <td className="px-4 py-3 text-sm text-gray-600 border border-gray-200">{patient.dob}</td>
                <td className="px-4 py-3 text-sm text-gray-600 border border-gray-200">{patient.email}</td>
                <td className="px-4 py-3 text-sm text-gray-600 font-medium border border-gray-200">{patient.glucose}</td>
                <td className="px-4 py-3 text-sm text-gray-600 font-medium border border-gray-200">{patient.haemoglobin}</td>
                <td className="px-4 py-3 text-sm text-gray-600 font-medium border border-gray-200">{patient.cholesterol}</td>
                <td className="px-4 py-3 text-sm border border-gray-200">
                  <span 
                    className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getBadgeStyle(patient.remarks)}`}
                    title={patient.remarks}
                  >
                    {truncate(patient.remarks)}
                  </span>
                </td>
                <td className="px-4 py-3 text-right whitespace-nowrap border border-gray-200">
                  <Button 
                    variant="outline-primary" 
                    size="sm" 
                    className="mr-2 rounded border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white"
                    onClick={() => onEdit(patient)}
                  >
                    Edit
                  </Button>
                  <Button 
                    variant="outline-danger" 
                    size="sm"
                    className="rounded border-red-600 text-red-600 hover:bg-red-600 hover:text-white"
                    onClick={() => {
                      if (window.confirm('Are you sure you want to delete this patient?')) {
                        onDelete(patient.id);
                      }
                    }}
                  >
                    Delete
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>
    </div>
  );
};

export default PatientTable;

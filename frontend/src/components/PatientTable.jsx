import React from 'react';
import { Table, Button } from 'react-bootstrap';

const PatientTable = ({ patients, onEdit, onDelete }) => {
  if (!patients || patients.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-8 text-center border border-gray-100">
        <h4 className="text-gray-500 font-medium">No patient records found</h4>
        <p className="text-gray-400 text-sm mt-2">Click "Add Patient" to create a new record.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
      <Table hover responsive className="mb-0">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            <th className="px-4 py-3 text-gray-600 font-semibold text-sm border-0">#</th>
            <th className="px-4 py-3 text-gray-600 font-semibold text-sm border-0">Full Name</th>
            <th className="px-4 py-3 text-gray-600 font-semibold text-sm border-0">Date of Birth</th>
            <th className="px-4 py-3 text-gray-600 font-semibold text-sm border-0">Email</th>
            <th className="px-4 py-3 text-gray-600 font-semibold text-sm border-0">Glucose</th>
            <th className="px-4 py-3 text-gray-600 font-semibold text-sm border-0">Haemoglobin</th>
            <th className="px-4 py-3 text-gray-600 font-semibold text-sm border-0">Cholesterol</th>
            <th className="px-4 py-3 text-gray-600 font-semibold text-sm border-0">Remarks</th>
            <th className="px-4 py-3 text-gray-600 font-semibold text-sm border-0 text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {patients.map((patient, index) => (
            <tr key={patient.id || index} className="border-b border-gray-100 last:border-0 align-middle">
              <td className="px-4 py-3 text-gray-500">{index + 1}</td>
              <td className="px-4 py-3 font-medium text-gray-900">{patient.fullName}</td>
              <td className="px-4 py-3 text-gray-600">{patient.dob}</td>
              <td className="px-4 py-3 text-gray-600">{patient.email}</td>
              <td className="px-4 py-3 text-gray-600">{patient.glucose}</td>
              <td className="px-4 py-3 text-gray-600">{patient.haemoglobin}</td>
              <td className="px-4 py-3 text-gray-600">{patient.cholesterol}</td>
              <td className="px-4 py-3 text-gray-500 text-sm max-w-xs truncate" title={patient.remarks}>
                {patient.remarks || '-'}
              </td>
              <td className="px-4 py-3 text-right whitespace-nowrap">
                <Button 
                  variant="outline-primary" 
                  size="sm" 
                  className="mr-2 rounded-md hover:bg-blue-50"
                  onClick={() => onEdit(patient)}
                >
                  Edit
                </Button>
                <Button 
                  variant="outline-danger" 
                  size="sm"
                  className="rounded-md hover:bg-red-50"
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
  );
};

export default PatientTable;

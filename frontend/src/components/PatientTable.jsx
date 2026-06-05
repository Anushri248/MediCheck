import React from 'react';
import { Table, Button, Badge } from 'react-bootstrap';

const PatientTable = ({ patients, activeFilter, onView, onEdit, onDelete }) => {
  const getFilterTitle = () => {
    switch (activeFilter) {
      case 'At Risk': return 'At Risk Patients';
      case 'Needs Monitoring': return 'Patients Needing Monitoring';
      case 'This Week': return 'Patients Added This Week';
      default: return 'All Patients';
    }
  };

  const parseRemarks = (remarks) => {
    if (!remarks) return null;
    if (typeof remarks === 'object') return remarks;
    try {
      return JSON.parse(remarks);
    } catch (e) {
      return null;
    }
  };

  const getRiskLevel = (remarks) => {
    const parsed = parseRemarks(remarks);
    if (parsed && parsed.risk_level) return parsed.risk_level;
    return null;
  };

  const getBadgeStyle = (riskLevel, rawRemarks) => {
    if (riskLevel === 'HIGH') return 'bg-red-100 text-red-800 border-red-200';
    if (riskLevel === 'MODERATE') return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    if (riskLevel === 'LOW') return 'bg-green-100 text-green-800 border-green-200';

    if (!rawRemarks || typeof rawRemarks !== 'string') return 'bg-gray-100 text-gray-700 border-gray-200';
    const lower = rawRemarks.toLowerCase();
    if (['risk', 'high', 'elevated', 'danger'].some(w => lower.includes(w))) return 'bg-red-100 text-red-800 border-red-200';
    if (['moderate', 'borderline', 'monitor'].some(w => lower.includes(w))) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    if (['normal', 'healthy', 'good'].some(w => lower.includes(w))) return 'bg-green-100 text-green-800 border-green-200';
    return 'bg-gray-100 text-gray-700 border-gray-200';
  };

  const truncate = (text, length = 40) => {
    if (!text) return '-';
    if (text.length <= length) return text;
    return text.substring(0, length) + '...';
  };

  const renderRemarksColumn = (remarks) => {
    const parsed = parseRemarks(remarks);
    const riskLevel = getRiskLevel(remarks);
    const summaryText = parsed && parsed.clinical_summary 
      ? parsed.clinical_summary 
      : (typeof remarks === 'string' ? remarks : 'View for details');

    return (
      <div className="flex flex-col gap-1 max-w-xs">
        {riskLevel && (
          <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide border w-max ${getBadgeStyle(riskLevel, remarks)}`}>
            {riskLevel} RISK
          </span>
        )}
        <span className="text-gray-600 text-xs truncate" title={summaryText}>
          {summaryText}
        </span>
      </div>
    );
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
      
      <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
        <Table hover className="mb-0 border-collapse w-full bg-white table-auto min-w-max">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200 text-left">
              <th className="px-4 py-3 text-gray-500 font-semibold text-xs uppercase tracking-wider w-12">#</th>
              <th className="px-4 py-3 text-gray-500 font-semibold text-xs uppercase tracking-wider">Patient Name</th>
              <th className="px-4 py-3 text-gray-500 font-semibold text-xs uppercase tracking-wider">Vitals</th>
              <th className="px-4 py-3 text-gray-500 font-semibold text-xs uppercase tracking-wider max-w-xs">AI Remarks</th>
              <th className="px-4 py-3 text-gray-500 font-semibold text-xs uppercase tracking-wider text-right w-32">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {patients.map((patient, index) => (
              <tr key={patient.id || index} className="hover:bg-blue-50/30 transition-colors">
                <td className="px-4 py-4 text-sm text-gray-500 align-middle">
                  {index + 1}
                </td>
                <td className="px-4 py-4 align-middle">
                  <div className="font-medium text-gray-900">{patient.fullName}</div>
                  <div className="text-xs text-gray-500">{patient.email}</div>
                  <div className="text-xs text-gray-400">DOB: {patient.dob} | {patient.gender || 'Unknown'}</div>
                </td>
                <td className="px-4 py-4 align-middle">
                  <div className="flex flex-col gap-1 text-xs">
                    <span className="text-gray-700"><span className="font-medium text-gray-500 w-8 inline-block">Gluc:</span> {patient.glucose} mg/dL</span>
                    <span className="text-gray-700"><span className="font-medium text-gray-500 w-8 inline-block">Hb:</span> {patient.haemoglobin} g/dL</span>
                    <span className="text-gray-700"><span className="font-medium text-gray-500 w-8 inline-block">Chol:</span> {patient.cholesterol} mg/dL</span>
                  </div>
                </td>
                <td className="px-4 py-4 align-middle">
                  {renderRemarksColumn(patient.remarks)}
                </td>
                <td className="px-4 py-4 align-middle text-right space-x-2">
                  <button
                    onClick={() => onView(patient)}
                    className="inline-flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white border-0 font-medium px-3 py-1.5 rounded-lg text-xs shadow-sm transition-colors"
                  >
                    View
                  </button>
                  <button
                    onClick={() => onEdit(patient)}
                    className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 font-medium px-3 py-1.5 rounded-lg text-xs transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => {
                      if (window.confirm('Are you sure you want to delete this patient?')) {
                        onDelete(patient.id);
                      }
                    }}
                    className="inline-flex items-center gap-1 text-red-600 hover:text-red-800 bg-red-50 hover:bg-red-100 font-medium px-3 py-1.5 rounded-lg text-xs transition-colors"
                  >
                    Delete
                  </button>
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

import React, { useState, useEffect } from 'react';
import { Modal, Button } from 'react-bootstrap';

const PatientDetailModal = ({ show, onHide, patient }) => {
  const [parsedRemarks, setParsedRemarks] = useState(null);

  useEffect(() => {
    if (patient) {
      if (!patient.remarks) {
        setParsedRemarks(null);
      } else if (typeof patient.remarks === 'object') {
        setParsedRemarks(patient.remarks);
      } else {
        try {
          setParsedRemarks(JSON.parse(patient.remarks));
        } catch (e) {
          console.error("Failed to parse remarks JSON:", e);
          setParsedRemarks({ clinical_summary: patient.remarks });
        }
      }
    }
  }, [patient]);

  const calculateAge = (dob) => {
    if (!dob) return '-';
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const isGlucoseNormal = (val) => val >= 70 && val <= 100;
  const isHbNormal = (val) => val >= 12 && val <= 17.5;
  const isCholNormal = (val) => val < 200;

  const getRiskBadgeStyle = (riskLevel) => {
    switch (riskLevel?.toUpperCase()) {
      case 'HIGH': return 'bg-red-50 text-red-700';
      case 'MODERATE': return 'bg-yellow-50 text-yellow-700';
      case 'LOW': return 'bg-green-50 text-green-700';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  if (!patient) return null;

  return (
    <Modal show={show} onHide={onHide} size="xl" centered scrollable>
      <Modal.Body className="p-0">
        <div className="flex flex-col md:flex-row h-full min-h-[600px]">
          
          {/* Left Column - Patient Information */}
          <div className="w-full md:w-1/3 p-8 lg:p-10 bg-white">
            <h2 className="text-3xl font-bold text-gray-900 mb-1 tracking-tight">
              {patient.fullName || patient.full_name}
            </h2>
            <p className="text-gray-500 text-sm mb-8">
              {patient.gender || 'Unknown Gender'} • {calculateAge(patient.dob || patient.date_of_birth)} years old
            </p>
            
            <div className="flex flex-col space-y-6 mt-2">
              
              <div>
                <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                  Email
                </div>
                <div className="text-sm font-bold text-gray-900">
                  {patient.email}
                </div>
              </div>
              
              <div>
                <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                  Date of Birth
                </div>
                <div className="text-sm font-bold text-gray-900">
                  {patient.dob || patient.date_of_birth}
                </div>
              </div>
              
              <div>
                <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                  Glucose
                </div>
                <div className="text-sm font-bold text-gray-900 flex items-center gap-3">
                  <span>{patient.glucose} <span className="text-gray-500 font-normal text-xs ml-0.5">mg/dL</span></span>
                  {isGlucoseNormal(patient.glucose) 
                    ? <span className="text-green-600 text-[11px] font-bold flex items-center gap-1">✅ Normal</span> 
                    : <span className="text-red-600 text-[11px] font-bold flex items-center gap-1">⚠️ Abnormal</span>
                  }
                </div>
              </div>
              
              <div>
                <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                  Haemoglobin
                </div>
                <div className="text-sm font-bold text-gray-900 flex items-center gap-3">
                  <span>{patient.haemoglobin} <span className="text-gray-500 font-normal text-xs ml-0.5">g/dL</span></span>
                  {isHbNormal(patient.haemoglobin) 
                    ? <span className="text-green-600 text-[11px] font-bold flex items-center gap-1">✅ Normal</span> 
                    : <span className="text-red-600 text-[11px] font-bold flex items-center gap-1">⚠️ Abnormal</span>
                  }
                </div>
              </div>
              
              <div>
                <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                  Cholesterol
                </div>
                <div className="text-sm font-bold text-gray-900 flex items-center gap-3">
                  <span>{patient.cholesterol} <span className="text-gray-500 font-normal text-xs ml-0.5">mg/dL</span></span>
                  {isCholNormal(patient.cholesterol) 
                    ? <span className="text-green-600 text-[11px] font-bold flex items-center gap-1">✅ Normal</span> 
                    : <span className="text-red-600 text-[11px] font-bold flex items-center gap-1">⚠️ Abnormal</span>
                  }
                </div>
              </div>

              <div>
                <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                  Added On
                </div>
                <div className="text-sm font-bold text-gray-900">
                  {patient.createdAt || patient.created_at ? new Date(patient.createdAt || patient.created_at).toLocaleDateString() : 'N/A'}
                </div>
              </div>

            </div>
          </div>

          {/* Right Column - AI Health Report */}
          <div className="w-full md:w-2/3 p-8 lg:p-12 bg-[#f8f9fa] flex flex-col h-full border-l border-gray-200">
            
            <div className="flex justify-between items-start mb-10">
              <div>
                <h3 className="text-xl font-bold text-gray-900 tracking-tight">AI Health Report</h3>
                <p className="text-xs text-gray-500 mt-1">Powered by Gemini AI</p>
              </div>
              
              {parsedRemarks && (
                <div className={`px-4 py-1.5 rounded-full text-xs font-bold tracking-wider ${getRiskBadgeStyle(parsedRemarks.risk_level)}`}>
                  RISK: {parsedRemarks.risk_level || 'UNKNOWN'}
                </div>
              )}
            </div>

            <div className="flex-1 overflow-y-auto pr-2">
              {!parsedRemarks ? (
                <div className="flex flex-col items-center justify-center h-full text-center text-gray-400 space-y-3">
                  <p>No AI report generated yet.</p>
                </div>
              ) : (
                <div className="space-y-10">
                  
                  {/* Clinical Summary */}
                  <div>
                    <h5 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-3 border-l-2 border-blue-400 pl-3 leading-none">
                      Clinical Summary
                    </h5>
                    <p className="text-gray-800 text-sm leading-relaxed">
                      {parsedRemarks.clinical_summary || 'No summary available.'}
                    </p>
                  </div>

                  {/* Identified Risks */}
                  {parsedRemarks.identified_risks && parsedRemarks.identified_risks.length > 0 && (
                    <div>
                      <h5 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-3 border-l-2 border-red-400 pl-3 leading-none">
                        Identified Risks
                      </h5>
                      <ul className="space-y-3">
                        {parsedRemarks.identified_risks.map((risk, i) => (
                          <li key={i} className="text-sm text-gray-800 flex items-start gap-3">
                            <div className="w-1.5 h-1.5 rounded-full bg-red-400 mt-2 shrink-0"></div>
                            <span className="leading-relaxed">{risk}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Recommendations */}
                  {parsedRemarks.recommendations && parsedRemarks.recommendations.length > 0 && (
                    <div>
                      <h5 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-3 border-l-2 border-green-400 pl-3 leading-none">
                        Recommendations
                      </h5>
                      <ul className="space-y-3">
                        {parsedRemarks.recommendations.map((rec, i) => (
                          <li key={i} className="text-sm text-gray-800 flex items-start gap-3">
                            <div className="w-1.5 h-1.5 rounded-full bg-green-400 mt-2 shrink-0"></div>
                            <span className="leading-relaxed">{rec}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Follow Up */}
                  {parsedRemarks.follow_up && (
                    <div>
                      <h5 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-3 border-l-2 border-purple-400 pl-3 leading-none">
                        Follow Up
                      </h5>
                      <p className="text-gray-500 italic text-sm leading-relaxed">
                        {parsedRemarks.follow_up}
                      </p>
                    </div>
                  )}

                </div>
              )}
            </div>
            
          </div>
        </div>
      </Modal.Body>
      
      {/* Modal Footer */}
      <Modal.Footer className="bg-white border-t border-gray-100 px-8 py-4 flex justify-between items-center">
        <div className="text-[11px] text-gray-400 uppercase tracking-wider font-medium">
          Report generated by Google Gemini AI
        </div>
        
        <div className="flex gap-3">
          <Button 
            variant="light" 
            onClick={onHide} 
            className="rounded-lg font-medium px-6 text-gray-600 hover:bg-gray-100 border-0 text-sm"
          >
            Close
          </Button>
        </div>
      </Modal.Footer>
    </Modal>
  );
};

export default PatientDetailModal;

import React from 'react';

const Sidebar = () => {
  return (
    <div className="w-[180px] fixed top-0 left-0 h-full bg-[#1a237e] text-white flex flex-col shadow-lg z-50">
      {/* Header */}
      <div className="p-4 border-b border-[#283593]">
        <div className="flex items-center gap-2 mb-2">
          <div className="bg-white/10 rounded-lg">
            <span className="text-base">🏥</span>
          </div>
          <h1 className="text-lg font-bold tracking-wide truncate">MediCheck</h1>
        </div>
        <p className="text-blue-200 text-[11px] opacity-80 leading-tight">Healthcare Intelligence Platform</p>
      </div>

      {/* Empty space filling */}
      <div className="flex-1"></div>

      {/* Footer */}
      <div className="p-4 border-t border-[#283593]">
        <div className="flex items-center justify-center gap-2 text-xs text-blue-200/70 bg-black/20 p-2.5 rounded-lg">
          <span>✨</span>
          <span>Powered by Gemini AI</span>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;

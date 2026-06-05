import React from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';

function App() {
  return (
    <div className="min-h-screen bg-[#f4f6f9] flex">
      <Sidebar />
      <div className="flex-grow ml-[180px]">
        <Dashboard />
      </div>
    </div>
  );
}

export default App;

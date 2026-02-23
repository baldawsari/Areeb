import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import DashboardPage from './pages/DashboardPage';
import AgentsPage from './pages/AgentsPage';
import WorkflowsPage from './pages/WorkflowsPage';

function App() {
  const [sidebarOpen, setSidebarOpen] = React.useState(true);

  return (
    <BrowserRouter>
      <div className="flex h-screen overflow-hidden bg-surface-950">
        <Sidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
        <div className="flex-1 flex flex-col min-w-0">
          <Header onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
          <main className="flex-1 overflow-auto p-6">
            <Routes>
              <Route path="/" element={<DashboardPage />} />
              <Route path="/agents" element={<AgentsPage />} />
              <Route path="/workflows" element={<WorkflowsPage />} />
              <Route path="/memory" element={<MemoryPlaceholder />} />
              <Route path="/settings" element={<SettingsPlaceholder />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>
      </div>
    </BrowserRouter>
  );
}

function MemoryPlaceholder() {
  return (
    <div className="flex items-center justify-center h-full">
      <div className="text-center glass-panel p-12">
        <div className="text-4xl mb-4">🧠</div>
        <h2 className="text-xl font-semibold text-white mb-2">Shared Memory</h2>
        <p className="text-surface-400">Agent memory store and knowledge base viewer coming soon.</p>
      </div>
    </div>
  );
}

function SettingsPlaceholder() {
  return (
    <div className="flex items-center justify-center h-full">
      <div className="text-center glass-panel p-12">
        <div className="text-4xl mb-4">&#9881;&#65039;</div>
        <h2 className="text-xl font-semibold text-white mb-2">Settings</h2>
        <p className="text-surface-400">Configuration and preferences coming soon.</p>
      </div>
    </div>
  );
}

export default App;

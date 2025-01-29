import React, { useState, useEffect } from 'react';
import './App.css';
import WorkflowRuns from './components/WorkflowRuns';
import SecurityVulnerabilities from './components/SecurityVulnerabilities';

const App = () => {
  const [activeTab, setActiveTab] = useState('workflows');
  const [config, setConfig] = useState(null);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/config`);
        const data = await response.json();
        setConfig(data);
      } catch (error) {
        console.error('Error fetching config:', error);
      }
    };

    fetchConfig();
  }, []);

  if (!config) {
    return <div>Loading...</div>;
  }

  return (
    <div className="App">
      <header className="App-header">
        <h1>GitHub Repository Dashboard</h1>
        <img src="Octocat.png" className="App-logo-small" alt="logo" />
      </header>
      <main>
        <div className="tabs">
          <button className={activeTab === 'workflows' ? 'active' : ''} onClick={() => setActiveTab('workflows')}>Workflows</button>
          <button className={activeTab === 'security' ? 'active' : ''} onClick={() => setActiveTab('security')}>Security</button>
        </div>
        {activeTab === 'workflows' && (
          <WorkflowRuns config={config} />
        )}
        {activeTab === 'security' && (
          <SecurityVulnerabilities config={config} />
        )}
      </main>
    </div>
  );
};

export default App;
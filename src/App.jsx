import React, { useState, useEffect } from 'react';
import './App.css';
import RepositorySelect from './components/RepositorySelect';
import WorkflowRuns from './components/WorkflowRuns';
import SecurityVulnerabilities from './components/SecurityVulnerabilities';

const App = () => {
  const [activeTab, setActiveTab] = useState('workflows');
  const [config, setConfig] = useState(null);
  const [selectedRepo, setSelectedRepo] = useState(null);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        // Get repository configuration
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/config`);
        const data = await response.json();
        setConfig(data);

        // Set initial repository
        if (data.repos.length > 0) {
          setSelectedRepo(data.repos[0]);
        }
      } catch (error) {
        console.error('Error fetching config:', error);
      }
    };

    fetchConfig();
  }, []);

  if (!config || !selectedRepo) {
    return <div>Loading...</div>;
  }

  return (
    <div className="App">
      <header className="App-header">
        <h1>GitHub Repository Dashboard</h1>
        <img src="Octocat.png" className="App-logo-small" alt="logo" />
      </header>
      <main>
        <div className="controls-container">
          <div className="tabs">
            <button className={activeTab === 'workflows' ? 'active' : ''} onClick={() => setActiveTab('workflows')}>
              Workflows
            </button>
            <button className={activeTab === 'security' ? 'active' : ''} onClick={() => setActiveTab('security')}>
              Security
            </button>
          </div>
          <RepositorySelect repos={config.repos} selectedRepo={selectedRepo} onRepoChange={setSelectedRepo} />
        </div>
        {activeTab === 'workflows' && <WorkflowRuns selectedRepo={selectedRepo} />}
        {activeTab === 'security' && <SecurityVulnerabilities selectedRepo={selectedRepo} />}
      </main>
    </div>
  );
};

export default App;

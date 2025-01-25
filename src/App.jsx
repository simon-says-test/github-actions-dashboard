import React, { useState } from 'react';
import './App.css';
import WorkflowRuns from './components/WorkflowRuns';
import SecurityVulnerabilities from './components/SecurityVulnerabilities';

const App = () => {
  const [activeTab, setActiveTab] = useState('workflows');
  const [selectedWorkflow, setSelectedWorkflow] = useState('all');

  const handleWorkflowChange = (event) => {
    setSelectedWorkflow(event.target.value);
  };

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
          <WorkflowRuns selectedWorkflow={selectedWorkflow} handleWorkflowChange={handleWorkflowChange} />
        )}
        {activeTab === 'security' && (
          <SecurityVulnerabilities />
        )}
      </main>
    </div>
  );
};

export default App;
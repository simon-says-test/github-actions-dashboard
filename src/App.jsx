import React, { useEffect, useState } from 'react';
import './App.css';
import WorkflowRuns from './components/WorkflowRuns';
import SecurityVulnerabilities from './components/SecurityVulnerabilities';

const App = () => {
  const [workflowRuns, setWorkflowRuns] = useState([]);
  const [vulnerabilities, setVulnerabilities] = useState([]);
  const [activeTab, setActiveTab] = useState('workflows');
  const [selectedWorkflow, setSelectedWorkflow] = useState('Release'); 
  
  const handleWorkflowChange = (event) => {
    setSelectedWorkflow(event.target.value);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const workflowRunsResponse = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/workflow-runs?owner=FoodStandardsAgency&repos=register-a-food-business-front-end,register-a-food-business-service`);
        const workflowRunsData = await workflowRunsResponse.json();
        setWorkflowRuns(workflowRunsData);
      } catch (error) {
        console.error('Error fetching workflow runs:', error);
      }

      try {
        const vulnerabilitiesResponse = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/security-vulnerabilities?owner=FoodStandardsAgency&repos=register-a-food-business-front-end,register-a-food-business-service`);
        const vulnerabilitiesData = await vulnerabilitiesResponse.json();
        setVulnerabilities(vulnerabilitiesData);
      } catch (error) {
        console.error('Error fetching security vulnerabilities:', error);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        <h1>GitHub Workflow Test Results</h1>
        <img src="Octocat.png" className="App-logo-small" alt="logo" />
      </header>
      <main>
        <div className="tabs">
          <button className={activeTab === 'workflows' ? 'active' : ''} onClick={() => setActiveTab('workflows')}>Workflows</button>
          <button className={activeTab === 'security' ? 'active' : ''} onClick={() => setActiveTab('security')}>Security</button>
        </div>
        {activeTab === 'workflows' && (
          <WorkflowRuns workflowRuns={workflowRuns} selectedWorkflow={selectedWorkflow} handleWorkflowChange={handleWorkflowChange} />
        )}
        {activeTab === 'security' && (
          <SecurityVulnerabilities vulnerabilities={vulnerabilities} />
        )}
      </main>
    </div>
  );
};

export default App;
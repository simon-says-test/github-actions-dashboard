import React, { useEffect, useState } from 'react';
import './App.css';
import { fetchWorkflowRuns, fetchSecurityVulnerabilities } from './githubApi';
import WorkflowRuns from './components/WorkflowRuns';
import SecurityVulnerabilities from './components/SecurityVulnerabilities';

const App = () => {
  const [workflowRuns, setWorkflowRuns] = useState([]);
  const [vulnerabilities, setVulnerabilities] = useState([]);
  const [selectedWorkflow, setSelectedWorkflow] = useState('Release');
  const [activeTab, setActiveTab] = useState('workflows');

  useEffect(() => {
    const fetchData = async () => {
      const runs = await fetchWorkflowRuns('FoodStandardsAgency', ['register-a-food-business-front-end', 'register-a-food-business-service']);
      setWorkflowRuns(runs);
      const vulns = await fetchSecurityVulnerabilities('FoodStandardsAgency', ['register-a-food-business-front-end', 'register-a-food-business-service']);
      setVulnerabilities(vulns);
    };

    fetchData();
  }, []);

  const handleWorkflowChange = (event) => {
    setSelectedWorkflow(event.target.value);
  };

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
          <WorkflowRuns
            workflowRuns={workflowRuns}
            selectedWorkflow={selectedWorkflow}
            handleWorkflowChange={handleWorkflowChange}
          />
        )}
        {activeTab === 'security' && (
          <SecurityVulnerabilities vulnerabilities={vulnerabilities} />
        )}
      </main>
    </div>
  );
};

export default App;
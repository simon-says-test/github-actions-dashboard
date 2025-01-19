import React, { useEffect, useState } from 'react';
import './App.css';
import { fetchWorkflowRuns } from './githubApi';

const App = () => {
  const [workflowRuns, setWorkflowRuns] = useState([]);
  const [selectedWorkflow, setSelectedWorkflow] = useState('Release');

  useEffect(() => {
    const fetchData = async () => {
      const runs = await fetchWorkflowRuns('FoodStandardsAgency', ['register-a-food-business-front-end', 'register-a-food-business-service']);
      setWorkflowRuns(runs);
    };

    fetchData();
  }, []);

  const handleWorkflowChange = (event) => {
    setSelectedWorkflow(event.target.value);
  };

  const tableStyle = {
    textAlign: 'left',
    width: '100%',
    borderCollapse: 'collapse',
  };

  const thTdStyle = {
    textAlign: 'left',
    padding: '8px',
    border: '1px solid #ddd',
  };

  const filteredRuns = workflowRuns.filter(run => run.workflow === selectedWorkflow);

  return (
    <div className="App">
      <header className="App-header">
        <img src="Octocat.png" className="App-logo" alt="logo" />
        <p>
          GitHub Codespaces <span className="heart">♥️</span> React
        </p>
        <p className="small">
          Edit <code>src/App.jsx</code> and save to reload.
        </p>
        <p>
          <a
            className="App-link"
            href="https://reactjs.org"
            target="_blank"
            rel="noopener noreferrer"
          >
            Learn React
          </a>
        </p>
      </header>
      <main>
        <h2>Workflow Runs</h2>
        <label htmlFor="workflow-select">Filter by workflow:</label>
        <select id="workflow-select" value={selectedWorkflow} onChange={handleWorkflowChange}>
          {Array.from(new Set(workflowRuns.map(run => run.workflow))).map(workflow => (
            <option key={workflow} value={workflow}>{workflow}</option>
          ))}
        </select>
        {filteredRuns.length > 0 ? (
          <table style={tableStyle}>
            <thead>
              <tr>
                <th style={thTdStyle}>Repository</th>
                <th style={thTdStyle}>Badge</th>
                <th style={thTdStyle}>Workflow</th>
                <th style={thTdStyle}>Job Name</th>
                <th style={thTdStyle}>Summary</th>
              </tr>
            </thead>
            <tbody>
              {filteredRuns.map((run) => (
                run.latestRun ? (
                  run.latestRun.testResults
                    .filter(job => job.summary)
                    .map((job, index) => (
                      <tr key={`${run.repository}-${run.workflow}-${job.name}-${index}`}>
                        <td style={thTdStyle}>{run.repository}</td>
                        <td style={thTdStyle}>
                          <img src={run.badge_url} alt={`${run.workflow} badge`} />
                        </td>
                        <td style={thTdStyle}>{run.workflow}</td>
                        <td style={thTdStyle}>{job.name}</td>
                        <td style={thTdStyle}><pre>{job.summary}</pre></td>
                      </tr>
                    ))
                ) : null
              ))}
            </tbody>
          </table>
        ) : (
          <p>Loading...</p>
        )}
      </main>
    </div>
  );
};

export default App;
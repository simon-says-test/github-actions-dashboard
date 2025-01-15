import React, { useEffect, useState } from 'react';
import './App.css';
import { fetchWorkflowRuns } from './githubApi';

const App = () => {
  const [workflowRuns, setWorkflowRuns] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const runs = await fetchWorkflowRuns('FoodStandardsAgency', 'register-a-food-business-front-end');
      setWorkflowRuns(runs);
    };

    fetchData();
  }, []);

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
        {workflowRuns.length > 0 ? (
          <table>
            <thead>
              <tr>
                <th>Workflow</th>
                <th>Run ID</th>
                <th>Status</th>
                <th>Conclusion</th>
                <th>Job Name</th>
                <th>Passed</th>
                <th>Failed</th>
                <th>Not Run</th>
              </tr>
            </thead>
            <tbody>
              {workflowRuns.map((run) => (
                run.latestRun ? (
                  run.latestRun.testResults.map((job, index) => (
                    <tr key={`${run.workflow}-${job.name}-${index}`}>
                      {index === 0 && (
                        <>
                          <td rowSpan={run.latestRun.testResults.length}>{run.workflow}</td>
                          <td rowSpan={run.latestRun.testResults.length}>{run.latestRun.id}</td>
                          <td rowSpan={run.latestRun.testResults.length}>{run.latestRun.status}</td>
                          <td rowSpan={run.latestRun.testResults.length}>{run.latestRun.conclusion}</td>
                        </>
                      )}
                      <td>{job.name}</td>
                      <td>{job.passed}</td>
                      <td>{job.failed}</td>
                      <td>{job.notRun}</td>
                    </tr>
                  ))
                ) : (
                  <tr key={run.workflow}>
                    <td>{run.workflow}</td>
                    <td colSpan="7">No runs available</td>
                  </tr>
                )
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
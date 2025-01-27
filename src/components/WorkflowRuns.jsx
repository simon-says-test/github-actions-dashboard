import React, { useEffect, useState } from "react";

const WorkflowRuns = ({ config }) => {
  const [selectedRepo, setSelectedRepo] = useState('all');
  const [selectedWorkflow, setSelectedWorkflow] = useState('all');
  const [workflowRuns, setWorkflowRuns] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_BASE_URL}/api/workflow-runs?owner=${selectedRepo.owner}&repo=${selectedRepo.name}`
        );
        const data = await response.json();
        setWorkflowRuns(data);
      } catch (error) {
        console.error("Error fetching workflow runs: ", error);
      }
    };

    if (selectedRepo !== 'all') {
      fetchData();
    }
  }, [selectedRepo]);

  const handleRepositoryChange = (value) => {
    const repo = config.repos.find(repo => repo.name === value);
    setSelectedRepo(repo || 'all');
    setSelectedWorkflow('all');
  };

  const handleWorkflowChange = (event) => {
    setSelectedWorkflow(event.target.value);
  };

  const filteredRuns = workflowRuns.filter(run => {
    if (selectedRepo !== 'all' && run.repository !== selectedRepo.name) return false;
    if (selectedWorkflow !== 'all' && run.workflow !== selectedWorkflow) return false;
    return true;
  });

  console.log("Filtered workflow runs:", filteredRuns); // Debug log

  return (
    <div>
      <h2>Workflow Runs Test Results</h2>
      <div>
        <label htmlFor="repository-select">Filter by repository:</label>
        <select 
          id="repository-select" 
          value={selectedRepo.name || 'all'} 
          onChange={(e) => handleRepositoryChange(e.target.value)}
        >
          <option value="all">Select a repository</option>
          {config.repos.map(repo => (
            <option key={repo.name} value={repo.name}>{repo.owner}/{repo.name}</option>
          ))}
        </select>

        {selectedRepo !== 'all' && (
          <>
            <label htmlFor="workflow-select">Filter by workflow:</label>
            <select 
              id="workflow-select" 
              value={selectedWorkflow} 
              onChange={handleWorkflowChange}
            >
              <option value="all">All</option>
              {availableWorkflows.map((workflow) => (
                <option key={workflow} value={workflow}>{workflow}</option>
              ))}
            </select>
          </>
        )}
      </div>

      {selectedRepo !== 'all' && filteredRuns.length > 0 ? (
        <table className="tableStyle workflowTable">
          <thead>
            <tr>
              <th className="thTdStyle" style={{ width: "20%" }}>
                Repository
              </th>
              <th className="thTdStyle" style={{ width: "20%" }}>
                Job Name
              </th>
              <th className="thTdStyle">Workflow Status</th>
              <th className="thTdStyle" style={{ display: "none" }}>
                Workflow
              </th>
              <th className="thTdStyle">Summary</th>
            </tr>
          </thead>
          <tbody>
            {filteredRuns.map((run) =>
              run.latestRun
                ? run.latestRun.testResults
                    .filter((job) => job.summary)
                    .map((job, index) => (
                      <tr key={`${run.repository}-${run.workflow}-${job.name}-${index}`}>
                        <td className="thTdStyle">{run.repository}</td>
                        <td className="thTdStyle">{job.name}</td>
                        <td className="thTdStyle">
                          <img src={run.badge_url} alt={`${run.workflow} badge`} />
                        </td>
                        <td className="thTdStyle" style={{ display: "none" }}>
                          {run.workflow}
                        </td>
                        <td className="thTdStyle">
                          <pre>{job.summary}</pre>
                        </td>
                      </tr>
                    ))
                : null
            )}
          </tbody>
        </table>
      ) : (
        selectedRepo !== 'all' && <p>Loading...</p>
      )}
    </div>
  );
};

export default WorkflowRuns;

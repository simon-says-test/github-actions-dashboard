import React, { useEffect, useState } from "react";

const WorkflowRuns = ({ selectedWorkflow, handleWorkflowChange }) => {
  const [workflowRuns, setWorkflowRuns] = useState([]);
  const [filters, setFilters] = useState({
    repository: 'all',
    workflow: selectedWorkflow
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const query = new URLSearchParams({
          ...filters,
          workflow: selectedWorkflow
        }).toString();
        const response = await fetch(
          `${import.meta.env.VITE_API_BASE_URL}/api/workflow-runs?${query}`
        );
        const data = await response.json();
        setWorkflowRuns(data);
      } catch (error) {
        console.error("Error fetching workflow runs:", error);
      }
    };

    fetchData();
  }, [filters, selectedWorkflow]);

  const handleFilterChange = (column, value) => {
    setFilters(prevFilters => ({
      ...prevFilters,
      [column]: value
    }));
  };

  const filteredRuns = workflowRuns.filter(run => {
    if (filters.repository !== 'all' && run.repository !== filters.repository) return false;
    if (selectedWorkflow !== 'all' && run.workflow !== selectedWorkflow) return false;
    return true;
  });

  return (
    <div>
      <h2>Workflow Runs Test Results</h2>
      <div>
        <label htmlFor="repository-select">Filter by repository:</label>
        <select 
          id="repository-select" 
          value={filters.repository} 
          onChange={(e) => handleFilterChange('repository', e.target.value)}
        >
          <option value="all">All</option>
          {[...new Set(workflowRuns.map(run => run.repository))].map(repo => (
            <option key={repo} value={repo}>{repo}</option>
          ))}
        </select>

        <label htmlFor="workflow-select">Filter by workflow:</label>
        <select id="workflow-select" value={selectedWorkflow} onChange={handleWorkflowChange}>
          <option value="all">All</option>
          {workflowRuns
            .filter(workflowRun => workflowRun?.latestRun?.testResults?.length > 0)
            .map((workflowRun) => (
              <option key={workflowRun.repository + workflowRun.workflow} value={workflowRun.workflow}>
                {workflowRun.workflow}
              </option>
            ))}
        </select>
      </div>
      {filteredRuns.length > 0 ? (
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
        <p>Loading...</p>
      )}
    </div>
  );
};

export default WorkflowRuns;

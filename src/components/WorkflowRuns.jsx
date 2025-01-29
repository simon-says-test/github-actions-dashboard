import React, { useEffect, useState } from "react";

const WorkflowRuns = ({ config }) => {
  const sortedRepos = [...config.repos].sort((a, b) => {
    if (a.owner !== b.owner) return a.owner.localeCompare(b.owner);
    return a.name.localeCompare(b.name);
  });

  const [selectedRepo, setSelectedRepo] = useState(sortedRepos[0]);
  const [selectedWorkflow, setSelectedWorkflow] = useState('all');
  const [workflowRuns, setWorkflowRuns] = useState([]);
  const [availableWorkflows, setAvailableWorkflows] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setWorkflowRuns([]); // Clear existing data
      setAvailableWorkflows([]); // Clear workflow options

      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_BASE_URL}/api/workflow-runs?owner=${selectedRepo.owner}&repo=${selectedRepo.name}&workflow=${selectedWorkflow}`
        );
        const data = await response.json();
        
        const validWorkflows = data.filter(run => 
          run.latestRun && run.latestRun.testResults.some(result => result.summary)
        );
        
        const workflows = [...new Set(validWorkflows.map(run => run.workflow))];
        
        setAvailableWorkflows(workflows);
        setWorkflowRuns(validWorkflows);
        
        if (workflows.length > 0 && selectedWorkflow === 'all') {
          setSelectedWorkflow(workflows[0]);
        }
      } catch (error) {
        console.error("Error fetching workflow runs: ", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [selectedRepo]);

  const filteredRuns = workflowRuns.filter(run => 
    selectedWorkflow === 'all' || run.workflow === selectedWorkflow
  );

  return (
    <div>
      <h2>Workflow Runs Test Results</h2>
      <div>
        <label htmlFor="repository-select">Repository:</label>
        <select 
          id="repository-select" 
          value={`${selectedRepo.owner}/${selectedRepo.name}`}
          onChange={(e) => {
            const [owner, name] = e.target.value.split('/');
            const repo = sortedRepos.find(r => r.owner === owner && r.name === name);
            setSelectedRepo(repo);
            setSelectedWorkflow('all');
          }}
        >
          {sortedRepos.map(repo => (
            <option key={`${repo.owner}/${repo.name}`} value={`${repo.owner}/${repo.name}`}>
              {repo.owner}/{repo.name}
            </option>
          ))}
        </select>

        <label htmlFor="workflow-select">Workflow:</label>
        <select 
          id="workflow-select" 
          value={selectedWorkflow}
          onChange={(e) => setSelectedWorkflow(e.target.value)}
        >
          {availableWorkflows.length > 0 ? (
            availableWorkflows.map(workflow => (
              <option key={workflow} value={workflow}>{workflow}</option>
            ))
          ) : (
            <option value="none">None found</option>
          )}
        </select>
      </div>

      {isLoading ? (
        <p>Loading workflow data...</p>
      ) : filteredRuns.length > 0 ? (
        <table className="tableStyle workflowTable">
          <thead>
            <tr>
              <th className="thTdStyle">Repository</th>
              <th className="thTdStyle">Job Name</th>
              <th className="thTdStyle">Workflow Status</th>
              <th className="thTdStyle">Summary</th>
            </tr>
          </thead>
          <tbody>
            {filteredRuns.map((run) =>
              run.latestRun?.testResults
                .filter((job) => job.summary)
                .map((job, index) => (
                  <tr key={`${run.repository}-${run.workflow}-${job.name}-${index}`}>
                    <td className="thTdStyle">{run.repository}</td>
                    <td className="thTdStyle">{job.name}</td>
                    <td className="thTdStyle">
                      <img src={run.badge_url} alt={`${run.workflow} badge`} />
                    </td>
                    <td className="thTdStyle">
                      <pre>{job.summary}</pre>
                    </td>
                  </tr>
                ))
            )}
          </tbody>
        </table>
      ) : (
        <p>No matching workflow runs found</p>
      )}
    </div>
  );
};

export default WorkflowRuns;

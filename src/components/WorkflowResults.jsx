import React, { useEffect, useState } from 'react';

const WorkflowResults = ({ selectedRepo, selectedWorkflow }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [workflowRuns, setWorkflowRuns] = useState([]);

  useEffect(() => {
    const fetchWorkflowRuns = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_BASE_URL}/api/workflows/runs?` +
          `owner=${selectedRepo.owner}&` +
          `repo=${selectedRepo.name}&` +
          `workflow=${selectedWorkflow}`
        );
        const data = await response.json();
        setWorkflowRuns(data);
      } catch (error) {
        console.error('Error fetching workflow runs:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (selectedWorkflow !== 'all') {
      fetchWorkflowRuns();
    }
  }, [selectedRepo, selectedWorkflow]);

  if (isLoading) {
    return <p>Loading workflow data...</p>;
  }

  if (!workflowRuns.length) {
    return <p>No matching workflow runs found</p>;
  }

  return (
    <div className="results workflowTable">
      <table>
        <thead>
          <tr>
            <th>Repository</th>
            <th>Workflow</th>
            <th>Status</th>
            <th>Test Results</th>
          </tr>
        </thead>
        <tbody>
          {workflowRuns.map((run, index) => (
            run.testResults
              .filter(test => test.summary)
              .map((test, testIndex) => (
                <tr key={`${run.repository}-${run.workflow}-${index}-${testIndex}`}>
                  <td>{run.repository}</td>
                  <td>{run.workflow}</td>
                  <td>
                    <img src={run.badge_url} alt={`${run.workflow} status`} />
                  </td>
                  <td>
                    <pre>{test.summary}</pre>
                  </td>
                </tr>
              ))
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default WorkflowResults;

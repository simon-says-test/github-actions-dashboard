import React, { useEffect, useState } from 'react';
import { apiService } from '../../services/api';
import styles from './WorkflowResults.module.css'; // added CSS module import

const WorkflowResults = ({ selectedRepo, selectedWorkflow, mockData }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [workflowRuns, setWorkflowRuns] = useState([]);

  useEffect(() => {
    const fetchWorkflowRuns = async () => {
      setIsLoading(true);
      try {
        if (mockData) {
          setWorkflowRuns(mockData);
        } else {
          const data = await apiService.fetchWorkflowRuns(selectedRepo.owner, selectedRepo.name, selectedWorkflow);
          setWorkflowRuns(data);
        }
      } catch (error) {
        console.error('Error fetching workflow runs:', error);
        setWorkflowRuns([]);
      } finally {
        setIsLoading(false);
      }
    };

    if (selectedWorkflow !== 'all') {
      fetchWorkflowRuns();
    }
  }, [selectedRepo, selectedWorkflow, mockData]);

  if (isLoading) {
    return <p>Loading workflow data...</p>;
  }

  if (!workflowRuns.length) {
    return <p>No matching workflow runs found</p>;
  }

  return (
    <div>
      <table className={styles.workflowTable}>
        <thead>
          <tr>
            <th>Repository</th>
            <th>Stage</th>
            <th>Status</th>
            <th>Test Results</th>
          </tr>
        </thead>
        <tbody>
          {workflowRuns.map((run, index) =>
            run.testResults
              .filter(test => test.summary)
              .map((test, testIndex) => (
                <tr key={`${run.repository}-${run.workflow}-${index}-${testIndex}`}>
                  <td>{run.repository}</td>
                  <td>{test.name}</td>
                  <td>
                    <img src={run.badge_url} alt={`${run.workflow} status`} />
                  </td>
                  <td>
                    <pre>{test.summary}</pre>
                  </td>
                </tr>
              ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default WorkflowResults;

import React, { useEffect, useState } from 'react';
import { apiService } from '../../services/api';
import styles from './WorkflowResults.module.css';

const badgeUrls = {
  success: 'https://img.shields.io/badge/status-success-green',
  failure: 'https://img.shields.io/badge/status-fail-red',
  notFound: 'https://img.shields.io/badge/404-Not%20Found-blue',
};

const WorkflowResults = ({ selectedRepo, selectedWorkflow }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [workflowRuns, setWorkflowRuns] = useState([]);

  useEffect(() => {
    const fetchWorkflowRuns = async () => {
      setIsLoading(true);
      try {
        const data = await apiService.fetchWorkflowRuns(selectedRepo.owner, selectedRepo.name, selectedWorkflow);
        setWorkflowRuns(data);
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
  }, [selectedRepo, selectedWorkflow]);

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
          {workflowRuns.map((result, index) => (
            <tr key={`${result.repository}-${result.workflow}-${result.name}-${index}`}>
              <td>{result.repository}</td>
              <td>{result.name}</td>
              <td>
                <img src={badgeUrls[result.conclusion] || badgeUrls['notFound']} alt={`${result.workflow} status`} />
              </td>
              <td>
                <pre>{result.summary}</pre>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default WorkflowResults;

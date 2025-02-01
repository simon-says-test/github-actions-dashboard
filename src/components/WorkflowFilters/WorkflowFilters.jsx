import React, { useEffect, useState } from 'react';
import { apiService } from '../../services/api';
import styles from './/WorkflowFilters.module.css'; // added CSS module import

const WorkflowFilters = ({ selectedRepo, onWorkflowChange }) => {
  const [workflows, setWorkflows] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedWorkflowId, setSelectedWorkflowId] = useState('all');

  useEffect(() => {
    const fetchWorkflows = async () => {
      setIsLoading(true);
      try {
        const data = await apiService.fetchWorkflows(selectedRepo.owner, selectedRepo.name);
        setWorkflows(data);

        // Set first workflow as default if available
        if (data.length > 0) {
          const firstWorkflow = data[0];
          setSelectedWorkflowId(firstWorkflow.id);
          onWorkflowChange(firstWorkflow.id);
        }
      } catch (error) {
        console.error('Error fetching workflows:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchWorkflows();
  }, [selectedRepo, onWorkflowChange]);

  const handleWorkflowChange = event => {
    const newWorkflowId = event.target.value;
    setSelectedWorkflowId(newWorkflowId);
    onWorkflowChange(newWorkflowId);
  };

  return (
    <div className={styles.filters}>
      <div className={styles.filterGroup}>
        <label htmlFor="workflow-select">Workflow:</label>
        <select
          id="workflow-select"
          value={selectedWorkflowId}
          onChange={handleWorkflowChange}
          disabled={isLoading || workflows.length === 0}
        >
          {isLoading ? (
            <option value="">Loading workflows...</option>
          ) : workflows.length > 0 ? (
            workflows.map(workflow => (
              <option key={workflow.id} value={workflow.id}>
                {workflow.name}
              </option>
            ))
          ) : (
            <option value="">None found</option>
          )}
        </select>
      </div>
    </div>
  );
};

export default WorkflowFilters;

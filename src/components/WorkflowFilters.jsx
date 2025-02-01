import React, { useEffect, useState } from 'react';

const WorkflowFilters = ({ selectedRepo, onWorkflowChange }) => {
  const [workflows, setWorkflows] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedWorkflowId, setSelectedWorkflowId] = useState('all');

  useEffect(() => {
    const fetchWorkflows = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_BASE_URL}/api/workflows/names?` +
            `owner=${selectedRepo.owner}&repo=${selectedRepo.name}`
        );
        const data = await response.json();
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
    <div className="filters">
      <div className="filter-group">
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

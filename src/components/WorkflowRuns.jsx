import React, { useState } from 'react';
import WorkflowFilters from './WorkflowFilters';
import WorkflowResults from './WorkflowResults';
import styles from '../styles/WorkflowRuns.module.css';

const WorkflowRuns = ({ selectedRepo }) => {
  const [selectedWorkflow, setSelectedWorkflow] = useState('all');

  return (
    <div className={styles.workflowRuns}>
      <WorkflowFilters selectedRepo={selectedRepo} onWorkflowChange={setSelectedWorkflow} />
      <WorkflowResults selectedRepo={selectedRepo} selectedWorkflow={selectedWorkflow} />
    </div>
  );
};

export default WorkflowRuns;

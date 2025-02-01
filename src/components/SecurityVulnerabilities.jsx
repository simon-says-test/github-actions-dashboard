import React, { useState } from 'react';
import SecurityFilters from './SecurityFilters';
import SecurityResults from './SecurityResults';
import styles from '../styles/SecurityVulnerabilities.module.css';

const SecurityVulnerabilities = ({ selectedRepo }) => {
  const [filters, setFilters] = useState({
    severity: 'All',
    status: 'Open',
  });

  return (
    <div className={styles.container}>
      <SecurityFilters onFilterChange={setFilters} />
      <SecurityResults selectedRepo={selectedRepo} filters={filters} />
    </div>
  );
};

export default SecurityVulnerabilities;

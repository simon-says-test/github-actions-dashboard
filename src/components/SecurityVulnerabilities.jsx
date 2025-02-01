import React, { useState } from 'react';
import SecurityFilters from './SecurityFilters';
import SecurityResults from './SecurityResults';
import '../styles/SecurityVulnerabilities.css';

const SecurityVulnerabilities = ({ selectedRepo }) => {
  const [filters, setFilters] = useState({
    severity: 'All',
    status: 'Open'
  });

  return (
    <div className="security-vulnerabilities">
      <h2>Security Vulnerabilities</h2>
      <SecurityFilters
        onFilterChange={setFilters}
      />
      <SecurityResults
        selectedRepo={selectedRepo}
        filters={filters}
      />
    </div>
  );
};

export default SecurityVulnerabilities;

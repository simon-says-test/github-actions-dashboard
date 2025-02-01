import React, { useState } from 'react';

const SecurityFilters = ({ onFilterChange }) => {
  const severityOptions = ['All', 'Critical', 'High', 'Medium', 'Low'];
  const statusOptions = ['All', 'Open', 'Fixed'];

  const [filters, setFilters] = useState({
    severity: 'All',
    status: 'Open'
  });

  const handleFilterChange = (type, value) => {
    const newFilters = { ...filters, [type]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  return (
    <div className="filters">
      <div className="filter-group">
        <label htmlFor="severity-select">Severity:</label>
        <select
          id="severity-select"
          value={filters.severity}
          onChange={(e) => handleFilterChange('severity', e.target.value)}
        >
          {severityOptions.map(severity => (
            <option key={severity} value={severity}>
              {severity}
            </option>
          ))}
        </select>
      </div>

      <div className="filter-group">
        <label htmlFor="status-select">Status:</label>
        <select
          id="status-select"
          value={filters.status}
          onChange={(e) => handleFilterChange('status', e.target.value)}
        >
          {statusOptions.map(status => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default SecurityFilters;

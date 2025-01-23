import React, { useState } from 'react';

const SecurityVulnerabilities = ({ vulnerabilities }) => {
  const [filters, setFilters] = useState({
    repository: 'all',
    severity: 'all',
    status: 'all'
  });
  const [expandedVulns, setExpandedVulns] = useState({});

  const handleFilterChange = (column, value) => {
    setFilters(prevFilters => ({
      ...prevFilters,
      [column]: value
    }));
  };

  const handleToggleExpand = (repo, vulnNumber) => {
    setExpandedVulns(prevState => ({
      ...prevState,
      [`${repo}-${vulnNumber}`]: !prevState[`${repo}-${vulnNumber}`]
    }));
  };

  const filteredVulnerabilities = vulnerabilities
    .map(repo => ({
      ...repo,
      vulnerabilities: repo.vulnerabilities.filter(vuln => {
        if (filters.repository !== 'all' && repo.repository !== filters.repository) return false;
        if (filters.severity !== 'all' && vuln.security_vulnerability.severity !== filters.severity) return false;
        if (filters.status !== 'all') {
          if (filters.status === 'fixed' && !vuln.fixed_at) return false;
          if (filters.status === 'unfixed' && vuln.fixed_at) return false;
        }
        return true;
      })
    }))
    .filter(repo => repo.vulnerabilities.length > 0);

  return (
    <div>
      <h2>Security Vulnerabilities</h2>
      <div>
        <label htmlFor="repository-select">Filter by repository:</label>
        <select id="repository-select" onChange={(e) => handleFilterChange('repository', e.target.value)} value={filters.repository}>
          <option value="all">All</option>
          {vulnerabilities.map(repo => (
            <option key={repo.repository} value={repo.repository}>{repo.repository}</option>
          ))}
        </select>
        <label htmlFor="severity-select">Filter by severity:</label>
        <select id="severity-select" onChange={(e) => handleFilterChange('severity', e.target.value)} value={filters.severity}>
          <option value="all">All</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
        <label htmlFor="status-select">Filter by status:</label>
        <select id="status-select" onChange={(e) => handleFilterChange('status', e.target.value)} value={filters.status}>
          <option value="all">All</option>
          <option value="fixed">Fixed</option>
          <option value="unfixed">Unfixed</option>
        </select>
      </div>
      {filteredVulnerabilities.length > 0 ? (
        <table className="tableStyle securityTable">
          <thead>
            <tr>
              <th className="thTdStyle">Repository</th>
              <th className="thTdStyle">Vulnerability</th>
              <th className="thTdStyle">Severity</th>
              <th className="thTdStyle">Status</th>
              <th className="thTdStyle">Date Raised</th>
              <th className="thTdStyle">Date Fixed</th>
            </tr>
          </thead>
          <tbody>
            {filteredVulnerabilities.map((repo) => (
              repo.vulnerabilities.map((vuln, index) => (
                <tr key={`${repo.repository}-${vuln.number}-${index}`} className={vuln.fixed_at ? 'fixed' : 'unfixed'}>
                  <td className="thTdStyle">{repo.repository}</td>
                  <td className="thTdStyle">
                    <div><strong>Dependency:</strong> {vuln.dependency.package.name}</div>
                    <div className="description">
                      <strong>Description:</strong> 
                      {expandedVulns[`${repo.repository}-${vuln.number}`] ? (
                        vuln.security_advisory.description
                      ) : (
                        `${vuln.security_advisory.description.substring(0, 100)}...`
                      )}
                      <button className="toggleButton" onClick={() => handleToggleExpand(repo.repository, vuln.number)}>
                        {expandedVulns[`${repo.repository}-${vuln.number}`] ? '▲' : '▼'}
                      </button>
                    </div>
                    <div><strong>URL:</strong> <a href={vuln.html_url} target="_blank" rel="noopener noreferrer">Details</a></div>
                  </td>
                  <td className="thTdStyle">{vuln.security_vulnerability.severity}</td>
                  <td className="thTdStyle">{vuln.fixed_at ? 'Fixed' : 'Unfixed'}</td>
                  <td className="thTdStyle">{new Date(vuln.created_at).toLocaleDateString()}</td>
                  <td className="thTdStyle">{vuln.fixed_at ? new Date(vuln.fixed_at).toLocaleDateString() : 'N/A'}</td>
                </tr>
              ))
            ))}
          </tbody>
        </table>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
};

export default SecurityVulnerabilities;

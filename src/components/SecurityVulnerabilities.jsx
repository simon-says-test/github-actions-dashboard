import React, { useEffect, useState } from 'react';

const SecurityVulnerabilities = ({ config }) => {
  const [vulnerabilities, setVulnerabilities] = useState([]);
  const [selectedRepo, setSelectedRepo] = useState('all');
  const [filters, setFilters] = useState({
    severity: 'all',
    status: 'all'
  });
  const [expandedVulns, setExpandedVulns] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_BASE_URL}/api/security-vulnerabilities?owner=${selectedRepo.owner}&repo=${selectedRepo.name}`
        );
        const data = await response.json();
        console.log("Fetched vulnerabilities:", data); // Debug log
        setVulnerabilities(data);
      } catch (error) {
        console.error('Error fetching security vulnerabilities:', error);
      }
    };

    if (selectedRepo !== 'all') {
      fetchData();
    }
  }, [selectedRepo]);

  const handleFilterChange = (column, value) => {
    setFilters(prevFilters => ({
      ...prevFilters,
      [column]: value
    }));
  };

  const handleRepositoryChange = (value) => {
    const repo = config.repos.find(repo => repo.name === value);
    setSelectedRepo(repo || 'all');
    setFilters({ severity: 'all', status: 'all' });
  };

  const handleToggleExpand = (repo, vulnNumber) => {
    setExpandedVulns(prevState => ({
      ...prevState,
      [`${repo}-${vulnNumber}`]: !prevState[`${repo}-${vulnNumber}`]
    }));
  };

  const filteredVulnerabilities = vulnerabilities
    .filter(repo => selectedRepo === 'all' || repo.repository === selectedRepo.name)
    .map(repo => ({
      ...repo,
      vulnerabilities: repo.vulnerabilities.filter(vuln => {
        if (filters.severity !== 'all' && vuln.security_vulnerability.severity !== filters.severity) return false;
        if (filters.status !== 'all') {
          if (filters.status === 'fixed' && !vuln.fixed_at) return false;
          if (filters.status === 'unfixed' && vuln.fixed_at) return false;
        }
        return true;
      })
    }))
    .filter(repo => repo.vulnerabilities.length > 0);

  console.log("Filtered vulnerabilities:", filteredVulnerabilities); // Debug log

  return (
    <div>
      <h2>Security Vulnerabilities</h2>
      <div>
        <label htmlFor="repository-select">Filter by repository:</label>
        <select 
          id="repository-select" 
          value={selectedRepo.name || 'all'} 
          onChange={(e) => handleRepositoryChange(e.target.value)}
        >
          <option value="all">Select a repository</option>
          {config.repos.map(repo => (
            <option key={repo.name} value={repo.name}>{repo.owner}/{repo.name}</option>
          ))}
        </select>

        {selectedRepo !== 'all' && (
          <>
            <label htmlFor="severity-select">Filter by severity:</label>
            <select 
              id="severity-select" 
              value={filters.severity} 
              onChange={(e) => handleFilterChange('severity', e.target.value)}
            >
              <option value="all">All</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>

            <label htmlFor="status-select">Filter by status:</label>
            <select 
              id="status-select" 
              value={filters.status} 
              onChange={(e) => handleFilterChange('status', e.target.value)}
            >
              <option value="all">All</option>
              <option value="fixed">Fixed</option>
              <option value="unfixed">Unfixed</option>
            </select>
          </>
        )}
      </div>

      {selectedRepo !== 'all' && filteredVulnerabilities.length > 0 ? (
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
        selectedRepo !== 'all' && <p>Loading...</p>
      )}
    </div>
  );
};

export default SecurityVulnerabilities;

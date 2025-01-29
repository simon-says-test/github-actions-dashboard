import React, { useEffect, useState } from 'react';

const SecurityVulnerabilities = ({ config }) => {
  const sortedRepos = [...config.repos].sort((a, b) => {
    if (a.owner !== b.owner) return a.owner.localeCompare(b.owner);
    return a.name.localeCompare(b.name);
  });

  const [selectedRepo, setSelectedRepo] = useState(sortedRepos[0]);
  const [vulnerabilities, setVulnerabilities] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState({
    severity: 'all',
    status: 'open'  // Default to "open" as per requirements
  });
  const [availableSeverities, setAvailableSeverities] = useState([]);
  const [expandedVulns, setExpandedVulns] = useState({});

  // Constant status options as per requirements
  const statusOptions = ['all', 'open', 'fixed'];

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setVulnerabilities([]);
      
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_BASE_URL}/api/security-vulnerabilities?` +
          `owner=${selectedRepo.owner}&` +
          `repo=${selectedRepo.name}&` +
          `severity=${filters.severity}&` +
          `status=${filters.status}`
        );
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Fetched vulnerabilities:', data); // Debug log
        
        // Extract unique severities from actual vulnerability data
        const severities = [...new Set(
          data.flatMap(repo => 
            repo.vulnerabilities
              .filter(v => v.security_vulnerability?.severity)
              .map(v => v.security_vulnerability.severity)
          )
        )].sort();

        setAvailableSeverities(severities);
        setVulnerabilities(data);
      } catch (error) {
        console.error('Error fetching security vulnerabilities:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [selectedRepo, filters.severity, filters.status]);

  const handleRepositoryChange = (event) => {
    const [owner, name] = event.target.value.split('/');
    const repo = sortedRepos.find(r => r.owner === owner && r.name === name);
    setSelectedRepo(repo);
    setFilters({ severity: 'all', status: 'open' }); // Reset to default filters
  };

  // Updated filtering logic
  const filteredVulnerabilities = vulnerabilities
    .map(repo => ({
      ...repo,
      vulnerabilities: repo.vulnerabilities.filter(vuln => {
        if (filters.severity !== 'all' && 
            vuln.security_vulnerability?.severity !== filters.severity) return false;
        if (filters.status === 'open' && vuln.fixed_at) return false;
        if (filters.status === 'fixed' && !vuln.fixed_at) return false;
        return true;
      })
    }))
    .filter(repo => repo.vulnerabilities.length > 0);

  return (
    <div>
      <h2>Security Vulnerabilities</h2>
      <div className="filters">
        <label htmlFor="repository-select">Repository:</label>
        <select 
          id="repository-select" 
          value={`${selectedRepo.owner}/${selectedRepo.name}`}
          onChange={handleRepositoryChange}
        >
          {sortedRepos.map(repo => (
            <option key={`${repo.owner}/${repo.name}`} value={`${repo.owner}/${repo.name}`}>
              {repo.owner}/{repo.name}
            </option>
          ))}
        </select>

        <label htmlFor="severity-select">Severity:</label>
        <select 
          id="severity-select" 
          value={filters.severity}
          onChange={(e) => setFilters(prev => ({ ...prev, severity: e.target.value }))}
        >
          <option value="all">All</option>
          {availableSeverities.length > 0 ? (
            availableSeverities.map(severity => (
              <option key={severity} value={severity}>{severity}</option>
            ))
          ) : (
            <option value="none" disabled>None found</option>
          )}
        </select>

        <label htmlFor="status-select">Status:</label>
        <select 
          id="status-select" 
          value={filters.status}
          onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
        >
          {statusOptions.map(status => (
            <option key={status} value={status}>
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </option>
          ))}
        </select>
      </div>

      {isLoading ? (
        <p>Loading vulnerability data...</p>
      ) : filteredVulnerabilities.length > 0 ? (
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
        <p>No matching vulnerabilities found</p>
      )}
    </div>
  );
};

export default SecurityVulnerabilities;

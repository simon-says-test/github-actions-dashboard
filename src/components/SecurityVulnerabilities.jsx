import React, { useState } from 'react';

const SecurityVulnerabilities = ({ vulnerabilities }) => {
  const [filterStatus, setFilterStatus] = useState('all');
  const [expandedVulns, setExpandedVulns] = useState({});

  const handleStatusChange = (event) => {
    setFilterStatus(event.target.value);
  };

  const handleToggleExpand = (repo, vulnNumber) => {
    setExpandedVulns(prevState => ({
      ...prevState,
      [`${repo}-${vulnNumber}`]: !prevState[`${repo}-${vulnNumber}`]
    }));
  };

  const filteredVulnerabilities = vulnerabilities.map(repo => ({
    ...repo,
    vulnerabilities: repo.vulnerabilities.filter(vuln => {
      if (filterStatus === 'all') return true;
      if (filterStatus === 'fixed') return vuln.fixed_at;
      if (filterStatus === 'unfixed') return !vuln.fixed_at;
      return true;
    })
  }));

  return (
    <div>
      <h2>Security Vulnerabilities</h2>
      <label htmlFor="status-select">Filter by status:</label>
      <select id="status-select" value={filterStatus} onChange={handleStatusChange}>
        <option value="all">All</option>
        <option value="fixed">Fixed</option>
        <option value="unfixed">Unfixed</option>
      </select>
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
              repo.vulnerabilities.length > 0 ? (
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
              ) : (
                <tr key={repo.repository}>
                  <td className="thTdStyle">{repo.repository}</td>
                  <td className="thTdStyle" colSpan="5">No vulnerabilities</td>
                </tr>
              )
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

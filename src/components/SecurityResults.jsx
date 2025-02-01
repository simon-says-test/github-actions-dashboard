import React, { useState, useEffect } from 'react';
import { apiService } from '../services/api';
import styles from '../styles/SecurityResults.module.css';

const SecurityResults = ({ selectedRepo, filters }) => {
  const [vulnerabilities, setVulnerabilities] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedVulnerabilities, setExpandedVulnerabilities] = useState({});

  useEffect(() => {
    const fetchVulnerabilities = async () => {
      setIsLoading(true);
      try {
        const data = await apiService.fetchVulnerabilities(
          selectedRepo.owner,
          selectedRepo.name,
          filters.severity,
          filters.status
        );
        setVulnerabilities(data.vulnerabilities || []);
      } catch (error) {
        console.error('Error fetching vulnerabilities:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchVulnerabilities();
  }, [selectedRepo, filters]);

  const toggleExpand = vulnNumber => {
    setExpandedVulnerabilities(prev => ({
      ...prev,
      [vulnNumber]: !prev[vulnNumber],
    }));
  };

  if (isLoading) return <p>Loading vulnerability data...</p>;
  if (!vulnerabilities.length) return <p>No matching vulnerabilities found</p>;

  return (
    <div>
      <table className={styles.securityTable}>
        <thead>
          <tr>
            <th>Severity</th>
            <th>Status</th>
            <th>Description</th>
            <th>Created</th>
            <th>Fixed</th>
          </tr>
        </thead>
        <tbody>
          {vulnerabilities.map((vuln, index) => (
            <tr key={`${vuln.number}-${index}`} className={vuln.fixed_at ? styles.fixed : styles.unfixed}>
              <td>{vuln.security_vulnerability.severity}</td>
              <td>{vuln.state}</td>
              <td>
                <div>
                  <strong>Dependency:</strong> {vuln.dependency.package.name}
                </div>
                <strong>Description:</strong>
                <div className={styles.description}>
                  {expandedVulnerabilities[vuln.number]
                    ? vuln.security_advisory.description
                    : `${vuln.security_advisory.description.substring(0, 100)}...`}
                  <button onClick={() => toggleExpand(vuln.number)}>
                    {expandedVulnerabilities[vuln.number] ? '▲' : '▼'}
                  </button>
                </div>
                <a href={vuln.html_url} target="_blank" rel="noopener noreferrer">
                  Details
                </a>
              </td>
              <td>{new Date(vuln.created_at).toLocaleDateString()}</td>
              <td>{vuln.fixed_at ? new Date(vuln.fixed_at).toLocaleDateString() : 'N/A'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default SecurityResults;

import React, { useState, useEffect } from "react";

const SecurityResults = ({ selectedRepo, filters }) => {
  const [vulnerabilities, setVulnerabilities] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedVulns, setExpandedVulns] = useState({});

  useEffect(() => {
    const fetchVulnerabilities = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_BASE_URL}/api/security-vulnerabilities?` +
            `owner=${selectedRepo.owner}&` +
            `repo=${selectedRepo.name}&` +
            `severity=${filters.severity}&` +
            `status=${filters.status}`
        );
        const data = await response.json();
        setVulnerabilities(data.vulnerabilities || []);
      } catch (error) {
        console.error("Error fetching vulnerabilities:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchVulnerabilities();
  }, [selectedRepo, filters]);

  const toggleExpand = (vulnNumber) => {
    setExpandedVulns((prev) => ({
      ...prev,
      [vulnNumber]: !prev[vulnNumber],
    }));
  };

  if (isLoading) return <p>Loading vulnerability data...</p>;
  if (!vulnerabilities.length) return <p>No matching vulnerabilities found</p>;

  return (
    <div className="results">
      <table className="securityTable">
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
            <tr key={`${vuln.number}-${index}`} className={vuln.fixed_at ? "fixed" : "unfixed"}>
              <td>{vuln.security_vulnerability.severity}</td>
              <td>{vuln.state}</td>
              <td>
                <div>
                  <strong>Dependency:</strong> {vuln.dependency.package.name}
                </div>
                <strong>Description:</strong>
                <div className="description">
                  {expandedVulns[vuln.number]
                    ? vuln.security_advisory.description
                    : `${vuln.security_advisory.description.substring(0, 100)}...`}
                  <button onClick={() => toggleExpand(vuln.number)}>{expandedVulns[vuln.number] ? "▲" : "▼"}</button>
                </div>
                <a href={vuln.html_url} target="_blank" rel="noopener noreferrer">
                  Details
                </a>
              </td>
              <td>{new Date(vuln.created_at).toLocaleDateString()}</td>
              <td>{vuln.fixed_at ? new Date(vuln.fixed_at).toLocaleDateString() : "N/A"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default SecurityResults;

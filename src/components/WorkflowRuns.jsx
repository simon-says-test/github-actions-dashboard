import React, { useEffect, useState } from "react";

const WorkflowRuns = ({ selectedWorkflow, handleWorkflowChange }) => {
  const [workflowRuns, setWorkflowRuns] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_BASE_URL}/api/workflow-runs?workflow=${selectedWorkflow}`
        );
        const data = await response.json();
        setWorkflowRuns(data);
      } catch (error) {
        console.error("Error fetching workflow runs:", error);
      }
    };

    fetchData();
  }, [selectedWorkflow]);

  const filteredRuns =
    selectedWorkflow === "all" ? workflowRuns : workflowRuns.filter((run) => run.workflow === selectedWorkflow);

  return (
    <div>
      <h2>Workflow Runs Test Results</h2>
      <label htmlFor="workflow-select">Filter by workflow:</label>
      <select id="workflow-select" value={selectedWorkflow} onChange={handleWorkflowChange}>
        <option value="all">All</option>
        {workflowRuns
          .filter((workflowRun) => {
            console.log("workflow: " + workflowRun);
            console.log("latest: " + workflowRun?.latestRun);
            console.log("test res: " + workflowRun?.latestRun?.testResults);
            console.log(workflowRun.workflow + " length: " + workflowRun?.latestRun?.testResults?.length);
            return workflowRun?.latestRun?.testResults?.length > 0;
          })
          .map((workflowRun) => (
            <option key={workflowRun.repository + workflowRun.workflow} value={workflowRun.workflow}>
              {workflowRun.workflow}
            </option>
          ))}
      </select>
      {filteredRuns.length > 0 ? (
        <table className="tableStyle workflowTable">
          <thead>
            <tr>
              <th className="thTdStyle" style={{ width: "20%" }}>
                Repository
              </th>
              <th className="thTdStyle" style={{ width: "20%" }}>
                Job Name
              </th>
              <th className="thTdStyle">Workflow Status</th>
              <th className="thTdStyle" style={{ display: "none" }}>
                Workflow
              </th>
              <th className="thTdStyle">Summary</th>
            </tr>
          </thead>
          <tbody>
            {filteredRuns.map((run) =>
              run.latestRun
                ? run.latestRun.testResults
                    .filter((job) => job.summary)
                    .map((job, index) => (
                      <tr key={`${run.repository}-${run.workflow}-${job.name}-${index}`}>
                        <td className="thTdStyle">{run.repository}</td>
                        <td className="thTdStyle">{job.name}</td>
                        <td className="thTdStyle">
                          <img src={run.badge_url} alt={`${run.workflow} badge`} />
                        </td>
                        <td className="thTdStyle" style={{ display: "none" }}>
                          {run.workflow}
                        </td>
                        <td className="thTdStyle">
                          <pre>{job.summary}</pre>
                        </td>
                      </tr>
                    ))
                : null
            )}
          </tbody>
        </table>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
};

export default WorkflowRuns;

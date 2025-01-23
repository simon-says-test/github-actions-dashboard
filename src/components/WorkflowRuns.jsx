import React from 'react';

const WorkflowRuns = ({ workflowRuns, selectedWorkflow, handleWorkflowChange }) => {
  const filteredRuns = selectedWorkflow === 'all' ? workflowRuns : workflowRuns.filter(run => run.workflow === selectedWorkflow);

  return (
    <div>
      <h2>Workflow Runs Test Results</h2>
      <label htmlFor="workflow-select">Filter by workflow:</label>
      <select id="workflow-select" value={selectedWorkflow} onChange={handleWorkflowChange}>
        <option value="all">All</option>
        {Array.from(new Set(workflowRuns.map(run => run.workflow))).map(workflow => (
          <option key={workflow} value={workflow}>{workflow}</option>
        ))}
      </select>
      {filteredRuns.length > 0 ? (
        <table className="tableStyle workflowTable">
          <thead>
            <tr>
              <th className="thTdStyle" style={{ width: '20%' }}>Repository</th>
              <th className="thTdStyle" style={{ width: '20%' }}>Job Name</th>
              <th className="thTdStyle">Workflow Status</th>
              <th className="thTdStyle" style={{ display: 'none' }}>Workflow</th>
              <th className="thTdStyle">Summary</th>
            </tr>
          </thead>
          <tbody>
            {filteredRuns.map((run) => (
              run.latestRun ? (
                run.latestRun.testResults
                  .filter(job => job.summary)
                  .map((job, index) => (
                    <tr key={`${run.repository}-${run.workflow}-${job.name}-${index}`}>
                      <td className="thTdStyle">{run.repository}</td>
                      <td className="thTdStyle">{job.name}</td>
                      <td className="thTdStyle">
                        <img src={run.badge_url} alt={`${run.workflow} badge`} />
                      </td>
                      <td className="thTdStyle" style={{ display: 'none' }}>{run.workflow}</td>
                      <td className="thTdStyle"><pre>{job.summary}</pre></td>
                    </tr>
                  ))
              ) : null
            ))}
          </tbody>
        </table>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
};

export default WorkflowRuns;

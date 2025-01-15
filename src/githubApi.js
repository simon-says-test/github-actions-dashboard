import { Octokit } from "@octokit/rest";

const octokit = new Octokit({
  auth: import.meta.env.VITE_ACTIONS_TOKEN,
});

export const fetchWorkflowRuns = async (owner, repo) => {
  try {
    const workflowsResponse = await octokit.actions.listRepoWorkflows({
      owner,
      repo,
    });

    const workflows = workflowsResponse.data.workflows;

    const workflowRuns = await Promise.all(
      workflows.map(async (workflow) => {
        const runsResponse = await octokit.actions.listWorkflowRuns({
          owner,
          repo,
          workflow_id: workflow.id,
          per_page: 1,
        });

        const latestRun = runsResponse.data.workflow_runs[0];

        if (latestRun) {
          const jobsResponse = await octokit.actions.listJobsForWorkflowRun({
            owner,
            repo,
            run_id: latestRun.id,
          });

          const testResults = await Promise.all(
            jobsResponse.data.jobs.map(async (job) => {
              const steps = job.steps || [];
              const testStep = steps.find(step => step.name.toUpperCase().includes('TEST'));

              let passed = 0;
              let failed = 0;
              let notRun = 0;

              if (testStep) {
                const logsResponse = await octokit.actions.downloadJobLogsForWorkflowRun({
                  owner,
                  repo,
                  job_id: job.id,
                });

                const logs = logsResponse.data;
                const passedMatch = logs.match(/(\d+) passed/);
                const failedMatch = logs.match(/(\d+) failed/);
                const notRunMatch = logs.match(/(\d+) not run/);

                passed = passedMatch ? parseInt(passedMatch[1], 10) : 0;
                failed = failedMatch ? parseInt(failedMatch[1], 10) : 0;
                notRun = notRunMatch ? parseInt(notRunMatch[1], 10) : 0;
              }

              return {
                name: job.name,
                status: job.status,
                conclusion: job.conclusion,
                passed,
                failed,
                notRun,
              };
            })
          );

          return {
            workflow: workflow.name,
            latestRun: {
              id: latestRun.id,
              status: latestRun.status,
              conclusion: latestRun.conclusion,
              testResults,
            },
          };
        }

        return {
          workflow: workflow.name,
          latestRun: null,
        };
      })
    );

    return workflowRuns;
  } catch (error) {
    console.error("Error fetching workflow runs:", error);
    return [];
  }
};
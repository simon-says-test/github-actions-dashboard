import { Octokit } from "@octokit/rest";

const octokit = new Octokit({
  auth: import.meta.env.VITE_ACTIONS_TOKEN,
});

export const fetchWorkflowRuns = async (owner, repos) => {
  try {
    const workflowRuns = await Promise.all(
      repos.map(async (repo) => {
        const workflowsResponse = await octokit.actions.listRepoWorkflows({
          owner,
          repo,
        });

        const workflows = workflowsResponse.data.workflows;

        const repoWorkflowRuns = await Promise.all(
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

              const checkRunsResponse = await octokit.checks.listForRef({
                owner,
                repo,
                ref: latestRun.head_sha,
              });

              const testResults = await Promise.all(
                jobsResponse.data.jobs.map(async (job) => {
                  const checkRun = checkRunsResponse.data.check_runs.find(run => run.name === job.name);

                  let summary = '';

                  if (checkRun && checkRun.output && checkRun.output.summary) {
                    summary = checkRun.output.summary.split('Results for commit')[0].trim();
                  }

                  return {
                    name: job.name,
                    summary,
                  };
                })
              );

              return {
                repository: repo,
                workflow: workflow.name,
                badge_url: workflow.badge_url,
                latestRun: {
                  id: latestRun.id,
                  status: latestRun.status,
                  conclusion: latestRun.conclusion,
                  testResults,
                },
              };
            }

            return {
              repository: repo,
              workflow: workflow.name,
              latestRun: null,
            };
          })
        );

        return repoWorkflowRuns;
      })
    );

    return workflowRuns.flat();
  } catch (error) {
    console.error("Error fetching workflow runs:", error);
    return [];
  }
};
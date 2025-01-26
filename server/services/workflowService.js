const genericFailBadgeUrl = "https://img.shields.io/badge/status-fail-red";

class WorkflowService {
    constructor(githubService) {
        this.githubService = githubService;
    }

    async processWorkflowRun(owner, name, workflow) {
        const runsResponse = await this.githubService.getWorkflowRuns(owner, name, workflow.id);
        const latestRun = runsResponse.data.workflow_runs[0];

        if (!latestRun) {
            return { repository: name, workflow: workflow.name, latestRun: null };
        }

        try {
            const checkRunsResponse = await this.githubService.getCheckRuns(owner, name, latestRun.head_sha);
            const testResults = checkRunsResponse.data.check_runs.map(checkRun => ({
                name: checkRun.name,
                summary: checkRun.output.summary ? checkRun.output.summary.split("Results for commit")[0].trim() : ""
            }));

            return {
                repository: name,
                workflow: workflow.name,
                badge_url: workflow.badge_url,
                latestRun: { id: latestRun.id, status: latestRun.status, conclusion: latestRun.conclusion, testResults }
            };
        } catch (error) {
            return this.createErrorWorkflowRun(name, workflow, latestRun, error);
        }
    }

    createErrorWorkflowRun(name, workflow, latestRun, error) {
        return {
            repository: name,
            workflow: workflow.name,
            badge_url: genericFailBadgeUrl,
            latestRun: {
                id: latestRun.id,
                status: latestRun.status,
                conclusion: latestRun.conclusion,
                testResults: [{ name: "N/A", summary: `Error fetching check runs: ${error.message}` }]
            }
        };
    }
}

module.exports = WorkflowService;

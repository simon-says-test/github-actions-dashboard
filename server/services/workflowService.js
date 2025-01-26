import config from '../../src/config.js';

const genericFailBadgeUrl = "https://img.shields.io/badge/status-fail-red";

class WorkflowService {
    constructor(githubService) {
        this.githubService = githubService;
        this.genericFailBadgeUrl = "https://img.shields.io/badge/status-fail-red";
    }

    async getAllWorkflowRuns(workflowName) {
        const workflowRuns = await Promise.all(
            config.repos.map(({ owner, name }) => 
                this.getRepoWorkflows(owner, name, workflowName)
            )
        );
        return workflowRuns.flat();
    }

    async getRepoWorkflows(owner, name, workflowName) {
        try {
            const workflowsResponse = await this.githubService.getWorkflows(owner, name);
            const workflows = workflowsResponse.data.workflows
                .filter(wf => workflowName === "all" || wf.name === workflowName);

            if (workflows.length === 0) {
                return [this.createEmptyWorkflowRun(name)];
            }

            return Promise.all(
                workflows.map(workflow => this.processWorkflowRun(owner, name, workflow))
            );
        } catch (error) {
            console.error(`Error fetching workflows for ${name}:`, error);
            return [this.createEmptyWorkflowRun(name, `Error: ${error.message}`)];
        }
    }

    createEmptyWorkflowRun(name, message = "No workflows") {
        return {
            repository: name,
            workflow: "Error",
            badge_url: this.genericFailBadgeUrl,
            latestRun: {
                id: 0,
                status: "N/A",
                conclusion: "N/A",
                testResults: [{ name: "Error", summary: message }]
            }
        };
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
            console.error(`Error processing workflow run for ${name}:`, error);
            return this.createErrorWorkflowRun(name, workflow, latestRun, error);
        }
    }

    createErrorWorkflowRun(name, workflow, latestRun, error) {
        return {
            repository: name,
            workflow: workflow.name,
            badge_url: this.genericFailBadgeUrl,
            latestRun: {
                id: latestRun.id,
                status: latestRun.status,
                conclusion: latestRun.conclusion,
                testResults: [{ name: "N/A", summary: `Error fetching check runs: ${error.message}` }]
            }
        };
    }
}

export default WorkflowService;

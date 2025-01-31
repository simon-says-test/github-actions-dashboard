import config from '../../src/config.js';

class WorkflowService {
    constructor(githubService) {
        this.githubService = githubService;
        this.genericFailBadgeUrl = "https://img.shields.io/badge/status-fail-red";
        this.genericSuccessBadgeUrl = "https://img.shields.io/badge/status-success-green";
        this.notFoundBadgeUrl = "https://img.shields.io/badge/404-Not%20Found-blue";
    }

    async getWorkflowNames(owner, name) {
        try {
            const workflowsResponse = await this.githubService.getWorkflows(owner, name);
            const workflows = workflowsResponse.data.workflows.map(workflow => ({ name: workflow.name, id: workflow.id }));

            if (workflows.length === 0) {
                return [{ name: "No workflow found", id: 0 }];
            }

            return workflows;
        } catch (error) {
            console.error(`Error fetching workflow names for ${name}:`, error);
            return [{ name: "Error getting workflow names", id: 0 }];
        }
    }

    async getWorkflows(owner, repository, workflowId) {
        try {
            const workflowsRunsResponse = await this.githubService.getWorkflowRuns(owner, repository, workflowId);
            const workflows = workflowsRunsResponse.data.workflow_runs;

            if (workflows.length === 0) {
                return [this.createErrorWorkflowRun(repository, { name: "Error" }, "No workflow runs found")];
            }

            const workflowRuns = await Promise.all(
                workflows.map(workflow => this.getWorkflowRunDetails(owner, repository, workflow))
            );

            return workflowRuns.filter(run => run.testResults.length > 0);
        } catch (error) {
            console.error(`Error fetching workflows for ${repository}:`, error);
            return [this.createErrorWorkflowRun(repository, { name: "Error" }, error.message)];
        }
    }

    async getWorkflowRunDetails(owner, name, run) {
        try {
            const checkRunsResponse = await this.githubService.getCheckRuns(owner, name, run.head_sha);
            const testResults = checkRunsResponse.data.check_runs.map(checkRun => ({
                name: checkRun.name,
                summary: checkRun.output.summary ? checkRun.output.summary.split("Results for commit")[0].trim() : ""
            }));

            return {
                repository: name,
                workflow: run.name,
                badge_url: run.conclusion === "success" ? this.genericSuccessBadgeUrl : this.genericFailBadgeUrl,
                conclusion: run.conclusion,
                testResults,
            };
        } catch (error) {
            console.error(`Error processing workflow run for ${name}:`, error);
            return this.createErrorWorkflowRun(name, workflow, error.message);
        }
    }

    createErrorWorkflowRun(name, workflow, error) {
        return {
            repository: name,
            workflow: workflow.name,
            badge_url: this.notFoundBadgeUrl,
            status: "error",
            conclusion: "failed",
            testResults: [{ 
                name: "N/A", 
                summary: `Error fetching workflow runs: ${error}` 
            }]
        };
    }
}

export default WorkflowService;

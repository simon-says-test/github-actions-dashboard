import config from '../../src/config.js';

class WorkflowService {
    constructor(githubService) {
        this.githubService = githubService;
        this.genericFailBadgeUrl = "https://img.shields.io/badge/status-fail-red";
        this.genericSuccessBadgeUrl = "https://img.shields.io/badge/status-success-green";
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

    async getWorkflows(owner, name, workflowId) {
        try {
            const workflowsRunsResponse = await this.githubService.getWorkflowRuns(owner, name, workflowId);
            const workflows = workflowsRunsResponse.data.workflow_runs;

            if (workflows.length === 0) {
                return [this.createEmptyWorkflowRun(name)];
            }

            const workflowRuns = await Promise.all(
                workflows.map(workflow => this.processWorkflowRun(owner, name, workflow))
            );

            return workflowRuns.filter(run => run.testResults.length > 0);
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
            testResults: [{ 
                name: "Error", 
                summary: message 
            }]
        };
    }

    async processWorkflowRun(owner, name, run) {
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
            return this.createErrorWorkflowRun(name, workflow, latestRun, error);
        }
    }

    createErrorWorkflowRun(name, workflow, latestRun, error) {
        return {
            repository: name,
            workflow: workflow.name,
            badge_url: this.genericFailBadgeUrl,
            status: "error",
            conclusion: "failed",
            testResults: [{ 
                name: "N/A", 
                summary: `Error fetching check runs: ${error.message}` 
            }]
        };
    }
}

export default WorkflowService;

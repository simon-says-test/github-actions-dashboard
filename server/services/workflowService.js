import config from '../../src/config.js';

class WorkflowService {
  constructor(githubService) {
    this.githubService = githubService;
  }

  async getWorkflowNames(owner, name) {
    try {
      const workflowsResponse = await this.githubService.getWorkflows(owner, name);
      const workflows = workflowsResponse.data.workflows.map(workflow => ({ name: workflow.name, id: workflow.id }));

      if (workflows.length === 0) {
        return [{ name: 'No workflow found', id: 0 }];
      }

      return workflows;
    } catch (error) {
      console.error(`Error fetching workflow names for ${name}:`, error);
      return [{ name: 'Error getting workflow names', id: 0 }];
    }
  }

  async getWorkflows(owner, repository, workflowId) {
    try {
      const workflowsRunsResponse = await this.githubService.getWorkflowRuns(owner, repository, workflowId);
      const workflows = workflowsRunsResponse.data.workflow_runs;

      if (workflows.length === 0) {
        return [this.createErrorWorkflowRun(repository, { name: 'Error' }, 'No workflow runs found')];
      }

      const workflowRuns = await Promise.all(
        workflows.map(workflow => this.getWorkflowRunDetails(owner, repository, workflow))
      );

      return workflowRuns.flat();
    } catch (error) {
      console.error(`Error fetching workflows for ${repository}:`, error);
      return [this.createErrorWorkflowRun(repository, { name: 'Error' }, error.message)];
    }
  }

  async getWorkflowRunDetails(owner, repository, run) {
    try {
      const checkRunsResponse = await this.githubService.getCheckRuns(owner, repository, run.head_sha);
      return checkRunsResponse.data.check_runs
        .filter(checkRun => checkRun.output.summary?.length > 0)
        .map(checkRun => ({
          repository: repository,
          workflow: run.name,
          name: checkRun.name,
          conclusion: checkRun.conclusion,
          summary: checkRun.output.summary ? checkRun.output.summary.split('Results for commit')[0].trim() : '',
        }));
    } catch (error) {
      console.error(`Error processing workflow run for ${repository}:`, error);
      return [this.createErrorWorkflowRun(repository, workflow, error.message)];
    }
  }

  createErrorWorkflowRun(name, workflow, error) {
    return {
      repository: name,
      workflow: workflow.name,
      name: 'N/A',
      conclusion: 'error',
      summary: `Error fetching workflow runs: ${error}`,
    };
  }
}

export default WorkflowService;

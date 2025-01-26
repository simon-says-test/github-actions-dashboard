const axios = require("axios");

class GithubService {
    constructor(token) {
        this.api = axios.create({
            baseURL: "https://api.github.com",
            headers: { Authorization: `token ${token}` }
        });
    }

    async getWorkflows(owner, name) {
        return this.api.get(`/repos/${owner}/${name}/actions/workflows`);
    }

    async getWorkflowRuns(owner, name, workflowId) {
        return this.api.get(`/repos/${owner}/${name}/actions/workflows/${workflowId}/runs?per_page=1`);
    }

    async getCheckRuns(owner, name, commitSha) {
        return this.api.get(`/repos/${owner}/${name}/commits/${commitSha}/check-runs`);
    }

    async getSecurityVulnerabilities(owner, name) {
        return this.api.get(`/repos/${owner}/${name}/dependabot/alerts`);
    }
}

module.exports = GithubService;

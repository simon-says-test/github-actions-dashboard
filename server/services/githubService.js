import { Octokit } from '@octokit/core';
import { retry } from '@octokit/plugin-retry';
import { throttling } from '@octokit/plugin-throttling';

class GithubService {
    constructor(token, options = {}) {
        this.token = token;
        this.options = {
            retries: 3,
            timeout: 5000,
            ...options
        };
        this.client = null;
    }

    initialize() {
        if (this.client) return;

        // Initialize the Octokit client with plugins
        this.client = new Octokit({
            auth: this.token,
            plugins: [retry, throttling],
            retry: {
                enabled: true,
                retries: this.options.retries
            },
            throttle: {
                onRateLimit: (retryAfter) => {
                    console.warn(`Rate limit hit, retrying after ${retryAfter} seconds`);
                    return true;
                },
                onSecondaryRateLimit: (retryAfter) => {
                    console.warn(`Secondary rate limit hit, retrying after ${retryAfter} seconds`);
                    return true;
                }
            }
        });
    }

    async ensureInitialized() {
        if (!this.client) {
            await this.initialize();
        }
    }

    async request(url, params = {}) {
        await this.ensureInitialized();
        try {
            const { data } = await this.client.request(url, {
                ...params,
                headers: {
                    'x-github-api-version': '2022-11-28'
                }
            });
            return { data };
        } catch (error) {
            console.error(`GitHub API Error: ${error.message}`);
            throw error;
        }
    }

    async getWorkflows(owner, repo) {
        return this.request('GET /repos/{owner}/{repo}/actions/workflows', {
            owner, repo
        });
    }

    async getWorkflowRuns(owner, repo, workflowId) {
        const response = await this.request('GET /repos/{owner}/{repo}/actions/workflows/{workflow_id}/runs', {
            owner, repo, workflow_id: workflowId, per_page: 1
        });
        return { data: { workflow_runs: response.data.workflow_runs } };
    }

    async getCheckRuns(owner, repo, commitSha) {
        const response = await this.request('GET /repos/{owner}/{repo}/commits/{ref}/check-runs', {
            owner, repo, ref: commitSha
        });
        return { data: { check_runs: response.data.check_runs } };
    }

    async getAllSecurityVulnerabilities(owner, repo) {
        return this.request('GET /repos/{owner}/{repo}/dependabot/alerts', {
            owner, repo
        });
    }

    async getSecurityVulnerabilities(owner, repo, state) {
        const endpoint = state 
            ? `/repos/${owner}/${repo}/dependabot/alerts?state=${state}`
            : `/repos/${owner}/${repo}/dependabot/alerts`;

        return this.request(`GET ${endpoint}`, {
            owner,
            repo,
            per_page: 100,
            headers: {
                accept: 'application/vnd.github.v3+json'
            }
        });
    }
}

export default GithubService;

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const apiService = {
  async fetchWorkflowRuns(owner, repo, workflow) {
    const response = await fetch(`${BASE_URL}/api/workflows/runs?owner=${owner}&repo=${repo}&workflow=${workflow}`);
    return response.json();
  },

  async fetchWorkflows(owner, repo) {
    const response = await fetch(`${BASE_URL}/api/workflows/names?owner=${owner}&repo=${repo}`);
    return response.json();
  },

  async fetchVulnerabilities(owner, repo, severity, status) {
    const response = await fetch(
      `${BASE_URL}/api/security-vulnerabilities?owner=${owner}&repo=${repo}&severity=${severity}&status=${status}`
    );
    return response.json();
  },

  async fetchConfig() {
    const response = await fetch(`${BASE_URL}/api/config`);
    return response.json();
  },
};

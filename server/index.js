const express = require('express');
const axios = require('axios');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const actionsToken = process.env.ACTIONS_TOKEN

const githubApi = axios.create({
  baseURL: 'https://api.github.com',
  headers: {
    Authorization: `token ${actionsToken}`,
  },
});

app.get('/api/workflow-runs', async (req, res) => {
  const { owner, repos } = req.query;
  console.log('Fetching workflow runs for owner:', owner, 'repos:', repos);
  try {
    const workflowRuns = await Promise.all(
      repos.split(',').map(async (repo) => {
        console.log('Fetching workflows for repo:', repo);
        const workflowsResponse = await githubApi.get(`/repos/${owner}/${repo}/actions/workflows`);
        const workflows = workflowsResponse.data.workflows;
        console.log('Workflows fetched:', workflows); 

        const repoWorkflowRuns = await Promise.all(
          workflows.map(async (workflow) => {
            console.log('Fetching runs for workflow:', workflow.name); 
            const runsResponse = await githubApi.get(`/repos/${owner}/${repo}/actions/workflows/${workflow.id}/runs?per_page=1`);
            const latestRun = runsResponse.data.workflow_runs[0];
            console.log('Latest run:', latestRun); 

            if (latestRun) {
              const checkRunsResponse = await githubApi.get(`/repos/${owner}/${repo}/commits/${latestRun.head_sha}/check-runs`);
              const testResults = checkRunsResponse.data.check_runs.map((checkRun) => ({
                name: checkRun.name,
                summary: checkRun.output.summary ? checkRun.output.summary.split('Results for commit')[0].trim() : '',
              }));
              // console.log('Test results:', testResults); 

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

    res.json(workflowRuns.flat());
  } catch (error) {
    console.error('Error fetching workflow runs:', error);
    res.status(500).json({ error: 'Error fetching workflow runs' });
  }
});

app.get('/api/security-vulnerabilities', async (req, res) => {
  const { owner, repos } = req.query;
  try {
    const vulnerabilities = await Promise.all(
      repos.split(',').map(async (repo) => {
        const response = await githubApi.get(`/repos/${owner}/${repo}/dependabot/alerts`);
        return {
          repository: repo,
          vulnerabilities: response.data,
        };
      })
    );

    res.json(vulnerabilities);
  } catch (error) {
    console.error('Error fetching security vulnerabilities:', error.response ? error.response.data : error.message);
    res.status(500).json({ error: 'Error fetching security vulnerabilities' });
  }
});

// Serve static files from the React app
app.use(express.static(path.join(__dirname, '../build')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../build', 'index.html'));
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

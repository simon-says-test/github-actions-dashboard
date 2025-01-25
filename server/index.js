const express = require("express");
const axios = require("axios");
const cors = require("cors");
const path = require("path");
const helmet = require("helmet");
const config = require("../src/config.js");
const { query, validationResult } = require("express-validator");
const NodeCache = require("node-cache");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(helmet());

const actionsToken = process.env.ACTIONS_TOKEN;

const githubApi = axios.create({
  baseURL: "https://api.github.com",
  headers: {
    Authorization: `token ${actionsToken}`,
  },
});

const genericFailBadgeUrl = "https://img.shields.io/badge/status-fail-red";
const cache = new NodeCache({ stdTTL: 600 });

app.get(
  "/api/workflow-runs",
  [
    query("workflow").isString().trim().escape(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { workflow } = req.query;
    console.log("Fetching workflow runs for workflow:", workflow);

    const cacheKey = `workflow-runs-${workflow}`;
    const cachedData = cache.get(cacheKey);
    if (cachedData) {
      return res.json(cachedData);
    }

    try {
      const workflowRuns = await Promise.all(
        config.repos.map(async ({ owner, name }) => {
          console.log("Fetching workflows for repo:", name);
          const workflowsResponse = await githubApi.get(`/repos/${owner}/${name}/actions/workflows`);
          const workflows = workflowsResponse.data.workflows.filter((wf) => workflow === "all" || wf.name === workflow);
          console.log("Workflows fetched:", workflows);

          if (workflows.length === 0) {
            return {
              repository: name,
              workflow: "Error",
              badge_url: genericFailBadgeUrl,
              latestRun: {
                id: 0,
                status: "N/A",
                conclusion: "N/A",
                testResults: [
                  {
                    name: "Error",
                    summary: `No workflows`,
                  },
                ],
              },
            };
          }

          const repoWorkflowRuns = await Promise.all(
            workflows.map(async (workflow) => {
              console.log("Fetching runs for workflow:", workflow.name);
              const runsResponse = await githubApi.get(
                `/repos/${owner}/${name}/actions/workflows/${workflow.id}/runs?per_page=1`
              );
              const latestRun = runsResponse.data.workflow_runs[0];
              console.log("Latest run:", latestRun);

              if (latestRun) {
                try {
                  const checkRunsResponse = await githubApi.get(
                    `/repos/${owner}/${name}/commits/${latestRun.head_sha}/check-runs`
                  );
                  const testResults = checkRunsResponse.data.check_runs.map((checkRun) => ({
                    name: checkRun.name,
                    summary: checkRun.output.summary ? checkRun.output.summary.split("Results for commit")[0].trim() : "",
                  }));
                  // console.log('Test results:', testResults);

                  return {
                    repository: name,
                    workflow: workflow.name,
                    badge_url: workflow.badge_url,
                    latestRun: {
                      id: latestRun.id,
                      status: latestRun.status,
                      conclusion: latestRun.conclusion,
                      testResults,
                    },
                  };
                } catch (error) {
                  return {
                    repository: name,
                    workflow: workflow.name,
                    badge_url: genericFailBadgeUrl,
                    latestRun: {
                      id: latestRun.id,
                      status: latestRun.status,
                      conclusion: latestRun.conclusion,
                      testResults: [
                        {
                          name: "N/A",
                          summary: `Error fetching check runs: ${error.message}`,
                        },
                      ],
                    },
                  };
                }
              }

              return {
                repository: name,
                workflow: workflow.name,
                latestRun: null,
              };
            })
          );

          return repoWorkflowRuns;
        })
      );

      cache.set(cacheKey, workflowRuns.flat());
      res.json(workflowRuns.flat());
    } catch (error) {
      console.error("Error fetching workflow runs:", error);
      res.status(500).json({ error: "Error fetching workflow runs" });
    }
  }
);

app.get(
  "/api/security-vulnerabilities",
  [
    query("severity").isString().trim().escape(),
    query("status").isString().trim().escape(),
    query("repository").isString().trim().escape(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { severity, status, repository } = req.query;
    console.log("Fetching security vulnerabilities");

    const cacheKey = `security-vulnerabilities-${severity}-${status}-${repository}`;
    const cachedData = cache.get(cacheKey);
    if (cachedData) {
      return res.json(cachedData);
    }

    try {
      const vulnerabilities = await Promise.all(
        config.repos.map(async ({ owner, name }) => {
          if (repository !== "all" && name !== repository) return null;
          try {
            const response = await githubApi.get(`/repos/${owner}/${name}/dependabot/alerts`);
            const filteredVulnerabilities = response.data.filter((vuln) => {
              if (severity !== "all" && vuln.security_vulnerability.severity !== severity) return false;
              if (status !== "all") {
                if (status === "fixed" && !vuln.fixed_at) return false;
                if (status === "unfixed" && vuln.fixed_at) return false;
              }
              return true;
            });

            if (filteredVulnerabilities.length === 0) {
              return {
                repository: name,
                vulnerabilities: [
                  {
                    number: "Error",
                    dependency: { package: { name: "N/A" } },
                    security_advisory: {
                      description: `No vulnerabilities found`,
                    },
                    security_vulnerability: { severity: "N/A" },
                    fixed_at: null,
                    created_at: new Date().toISOString(),
                    html_url: "#",
                  },
                ],
              };
            }

            return {
              repository: name,
              vulnerabilities: filteredVulnerabilities,
            };
          } catch (error) {
            return {
              repository: name,
              vulnerabilities: [
                {
                  number: "Error",
                  dependency: { package: { name: "N/A" } },
                  security_advisory: {
                    description: `Error fetching vulnerabilities: ${error.message}`,
                  },
                  security_vulnerability: { severity: "N/A" },
                  fixed_at: null,
                  created_at: new Date().toISOString(),
                  html_url: "#",
                },
              ],
            };
          }
        })
      );

      const filteredVulnerabilities = vulnerabilities.filter(Boolean);
      cache.set(cacheKey, filteredVulnerabilities);
      res.json(filteredVulnerabilities);
    } catch (error) {
      console.error("Error fetching security vulnerabilities:", error.response ? error.response.data : error.message);
      res.status(500).json({ error: "Error fetching security vulnerabilities" });
    }
  }
);

// Serve static files from the React app
app.use(express.static(path.join(__dirname, "../build")));

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../build", "index.html"));
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

const express = require('express');
const { query, validationResult } = require('express-validator');
const config = require('../../src/config.js');
const router = express.Router();

const createWorkflowRoutes = (workflowService, cache, disableCache) => {
    router.get('/',
        [query('workflow').isString().trim().escape()],
        async (req, res) => {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const { workflow } = req.query;
            console.log("Fetching workflow runs for workflow:", workflow);
            const cacheKey = `workflow-runs-${workflow}`;
            
            if (!disableCache) {
                const cachedData = cache.get(cacheKey);
                if (cachedData) return res.json(cachedData);
            }

            try {
                const workflowRuns = await Promise.all(
                    config.repos.map(async ({ owner, name }) => {
                        console.log("Fetching workflows for repo:", name);
                        const workflowsResponse = await workflowService.githubService.getWorkflows(owner, name);
                        const workflows = workflowsResponse.data.workflows
                            .filter(wf => workflow === "all" || wf.name === workflow);

                        if (workflows.length === 0) {
                            return [{
                                repository: name,
                                workflow: "Error",
                                badge_url: "https://img.shields.io/badge/status-fail-red",
                                latestRun: {
                                    id: 0,
                                    status: "N/A",
                                    conclusion: "N/A",
                                    testResults: [{ name: "Error", summary: "No workflows" }]
                                }
                            }];
                        }

                        return Promise.all(
                            workflows.map(workflow => 
                                workflowService.processWorkflowRun(owner, name, workflow)
                            )
                        );
                    })
                );

                const flattenedRuns = workflowRuns.flat();
                if (!disableCache) {
                    cache.set(cacheKey, flattenedRuns);
                }
                res.json(flattenedRuns);
            } catch (error) {
                console.error("Error fetching workflow runs:", error);
                res.status(500).json({ error: "Error fetching workflow runs" });
            }
        });

    return router;
};

module.exports = createWorkflowRoutes;

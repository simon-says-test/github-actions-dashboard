const express = require('express');
const { query, validationResult } = require('express-validator');
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
            const cacheKey = `workflow-runs-${workflow}`;
            
            if (!disableCache) {
                const cachedData = cache.get(cacheKey);
                if (cachedData) return res.json(cachedData);
            }

            try {
                const workflowRuns = await workflowService.getAllWorkflowRuns(workflow);
                
                if (!disableCache) {
                    cache.set(cacheKey, workflowRuns);
                }
                res.json(workflowRuns);
            } catch (error) {
                console.error("Error fetching workflow runs:", error);
                res.status(500).json({ error: "Error fetching workflow runs" });
            }
        });

    return router;
};

module.exports = createWorkflowRoutes;

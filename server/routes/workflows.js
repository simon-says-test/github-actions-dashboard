import express from 'express';

const createWorkflowRoutes = (workflowService, cache, disableCache) => {
    const router = express.Router();

    router.get('/names', async (req, res) => {
        const { owner, repo } = req.query;

        try {
            const cacheKey = `workflows-${owner}-${repo}`;
            if (!disableCache && cache.has(cacheKey)) {
                return res.json(cache.get(cacheKey));
            }

            const workflowNames = await workflowService.getWorkflowNames(owner, repo);
            if (!disableCache) {
                cache.set(cacheKey, workflowNames);
            }

            res.json(workflowNames);
        } catch (error) {
            console.error('Error fetching workflow names:', error);
            res.status(500).json({ error: 'Failed to fetch workflow names' });
        }
    });

    router.get('/runs', async (req, res) => {
        const { workflow, owner, repo } = req.query;

        try {
            const cacheKey = `workflows-${owner}-${repo}-${workflow}`;
            if (!disableCache && cache.has(cacheKey)) {
                return res.json(cache.get(cacheKey));
            }

            const workflowRuns = await workflowService.getWorkflows(owner, repo, workflow);
            if (!disableCache) {
                cache.set(cacheKey, workflowRuns);
            }

            res.json(workflowRuns);
        } catch (error) {
            console.error('Error fetching workflow runs:', error);
            res.status(500).json({ error: 'Failed to fetch workflow runs' });
        }
    });

    return router;
};

export default createWorkflowRoutes;

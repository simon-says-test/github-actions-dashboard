import express from 'express';

const createWorkflowRoutes = (workflowService, cache, disableCache) => {
    const router = express.Router();

    router.get('/', async (req, res) => {
        const { workflow } = req.query;

        try {
            const cacheKey = `workflow-runs-${workflow}`;
            if (!disableCache && cache.has(cacheKey)) {
                return res.json(cache.get(cacheKey));
            }

            const workflowRuns = await workflowService.getAllWorkflowRuns(workflow);
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

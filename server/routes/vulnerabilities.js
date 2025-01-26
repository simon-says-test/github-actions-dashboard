import express from 'express';

const createVulnerabilityRoutes = (vulnerabilityService, cache, disableCache) => {
    const router = express.Router();

    router.get('/', async (req, res) => {
        const { severity, status, repository } = req.query;

        try {
            const cacheKey = `vulnerabilities-${severity}-${status}-${repository}`;
            if (!disableCache && cache.has(cacheKey)) {
                return res.json(cache.get(cacheKey));
            }

            const vulnerabilities = await vulnerabilityService.getAllVulnerabilities(severity, status, repository);
            if (!disableCache) {
                cache.set(cacheKey, vulnerabilities);
            }

            res.json(vulnerabilities);
        } catch (error) {
            console.error('Error fetching vulnerabilities:', error);
            res.status(500).json({ error: 'Failed to fetch vulnerabilities' });
        }
    });

    return router;
};

export default createVulnerabilityRoutes;

import express from 'express';

const createVulnerabilityRoutes = (vulnerabilityService, cache, disableCache) => {
    const router = express.Router();

    router.get('/', async (req, res) => {
        const { owner, repo, severity = 'all', status = 'open' } = req.query;

        try {
            const cacheKey = `vulnerabilities-${owner}-${repo}-${severity}-${status}`;
            if (!disableCache && cache.has(cacheKey)) {
                return res.json(cache.get(cacheKey));
            }

            const vulnerabilities = await vulnerabilityService.getRepoVulnerabilities(owner, repo, severity, status);
            
            if (!disableCache) {
                cache.set(cacheKey, vulnerabilities);
            }

            res.json([vulnerabilities]); // Wrap in array to match expected format
        } catch (error) {
            console.error('Error fetching vulnerabilities:', error);
            res.status(500).json({ error: 'Failed to fetch vulnerabilities' });
        }
    });

    return router;
};

export default createVulnerabilityRoutes;

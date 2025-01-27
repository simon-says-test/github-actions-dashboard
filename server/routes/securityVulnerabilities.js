import express from 'express';

const createSecurityVulnerabilitiesRoutes = (vulnerabilityService, cache, disableCache) => {
    const router = express.Router();

    router.get('/', async (req, res) => {
        const { severity, status, owner, repo } = req.query;

        try {
            const cacheKey = `security-vulnerabilities-${owner}-${repo}-${severity}-${status}`;
            if (!disableCache && cache.has(cacheKey)) {
                return res.json(cache.get(cacheKey));
            }

            const vulnerabilities = await vulnerabilityService.getRepoVulnerabilities(owner, repo, severity, status);
            if (!disableCache) {
                cache.set(cacheKey, vulnerabilities);
            }

            res.json(vulnerabilities);
        } catch (error) {
            console.error('Error fetching security vulnerabilities:', error);
            res.status(500).json({ error: 'Failed to fetch security vulnerabilities' });
        }
    });

    return router;
};

export default createSecurityVulnerabilitiesRoutes;

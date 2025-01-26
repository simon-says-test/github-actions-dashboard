const express = require('express');
const { query, validationResult } = require('express-validator');
const router = express.Router();

const createVulnerabilityRoutes = (vulnerabilityService, cache, disableCache) => {
    router.get('/',
        [
            query('severity').isString().trim().escape(),
            query('status').isString().trim().escape(),
            query('repository').isString().trim().escape(),
        ],
        async (req, res) => {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const { severity, status, repository } = req.query;
            const cacheKey = `security-vulnerabilities-${severity}-${status}-${repository}`;
            
            if (!disableCache) {
                const cachedData = cache.get(cacheKey);
                if (cachedData) return res.json(cachedData);
            }

            try {
                const vulnerabilities = await vulnerabilityService
                    .getAllVulnerabilities(severity, status, repository);
                
                if (!disableCache) {
                    cache.set(cacheKey, vulnerabilities);
                }
                res.json(vulnerabilities);
            } catch (error) {
                console.error("Error fetching vulnerabilities:", error);
                res.status(500).json({ error: "Error fetching security vulnerabilities" });
            }
        });

    return router;
};

module.exports = createVulnerabilityRoutes;

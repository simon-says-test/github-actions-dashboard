const express = require('express');
const { query, validationResult } = require('express-validator');
const config = require('../../src/config.js');
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
            console.log("Fetching security vulnerabilities");

            const cacheKey = `security-vulnerabilities-${severity}-${status}-${repository}`;
            if (!disableCache) {
                const cachedData = cache.get(cacheKey);
                if (cachedData) return res.json(cachedData);
            }

            try {
                const vulnerabilities = await Promise.all(
                    config.repos.map(async ({ owner, name }) => {
                        if (repository !== "all" && name !== repository) return null;

                        try {
                            const response = await vulnerabilityService.githubService
                                .getSecurityVulnerabilities(owner, name);
                            
                            const filteredVulnerabilities = vulnerabilityService
                                .processVulnerabilities(response.data, severity, status);

                            if (filteredVulnerabilities.length === 0) {
                                return vulnerabilityService
                                    .createEmptyVulnerabilityResult(name, "No vulnerabilities found");
                            }

                            return {
                                repository: name,
                                vulnerabilities: filteredVulnerabilities
                            };
                        } catch (error) {
                            return vulnerabilityService
                                .createEmptyVulnerabilityResult(
                                    name, 
                                    `Error fetching vulnerabilities: ${error.message}`
                                );
                        }
                    })
                );

                const filteredVulnerabilities = vulnerabilities.filter(Boolean);
                if (!disableCache) {
                    cache.set(cacheKey, filteredVulnerabilities);
                }
                res.json(filteredVulnerabilities);
            } catch (error) {
                console.error("Error fetching security vulnerabilities:", 
                    error.response ? error.response.data : error.message);
                res.status(500).json({ error: "Error fetching security vulnerabilities" });
            }
        });

    return router;
};

module.exports = createVulnerabilityRoutes;

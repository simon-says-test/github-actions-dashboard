const express = require("express");
const cors = require("cors");
const path = require("path");
const helmet = require("helmet");
const NodeCache = require("node-cache");
require("dotenv").config();

const GithubService = require("./services/githubService");
const WorkflowService = require("./services/workflowService");
const VulnerabilityService = require("./services/vulnerabilityService");
const createWorkflowRoutes = require("./routes/workflows");
const createVulnerabilityRoutes = require("./routes/vulnerabilities");

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(helmet());

// Services setup
const cache = new NodeCache({ stdTTL: 600 });
const disableCache = process.env.NODE_ENV === "development";
const githubService = new GithubService(process.env.ACTIONS_TOKEN);
const workflowService = new WorkflowService(githubService);
const vulnerabilityService = new VulnerabilityService(githubService);

// Routes
app.use('/api/workflow-runs', createWorkflowRoutes(workflowService, cache, disableCache));
app.use('/api/security-vulnerabilities', createVulnerabilityRoutes(vulnerabilityService, cache, disableCache));

// Static files
app.use(express.static(path.join(__dirname, "../build")));
app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../build", "index.html"));
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

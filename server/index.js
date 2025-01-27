import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import helmet from "helmet";
import NodeCache from "node-cache";
import dotenv from "dotenv";
import GithubService from "./services/githubService.js";
import WorkflowService from "./services/workflowService.js";
import VulnerabilityService from "./services/vulnerabilityService.js";
import createWorkflowRoutes from "./routes/workflows.js";
import createVulnerabilityRoutes from "./routes/vulnerabilities.js";
import createConfigRoutes from "./routes/config.js";

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(helmet());

// Services setup
const cache = new NodeCache({ stdTTL: 600 });
const disableCache = process.env.NODE_ENV === "development";
const githubService = new GithubService(process.env.ACTIONS_TOKEN, {
  retries: 3,
  timeout: 5000,
});

// Resolve __dirname in ES6 modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function initializeApp() {
  // Initialize GitHub service
  await githubService.initialize();

  const workflowService = new WorkflowService(githubService);
  const vulnerabilityService = new VulnerabilityService(githubService);

  // Routes
  app.use("/api/workflow-runs", createWorkflowRoutes(workflowService, cache, disableCache));
  app.use("/api/security-vulnerabilities", createVulnerabilityRoutes(vulnerabilityService, cache, disableCache));
  app.use("/api/config", createConfigRoutes());

  // Static files
  if (process.env.NODE_ENV === "production") {
    const buildPath = path.join(__dirname, "../build");
    app.use(express.static(buildPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(buildPath, "index.html"));
    });
  }

  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
}

// Start the application
initializeApp().catch((error) => {
  console.error("Failed to initialize app:", error);
  process.exit(1);
});

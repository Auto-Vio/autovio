import express from "express";
import cors from "cors";
import analyzeRouter from "./routes/analyze.js";
import scenarioRouter from "./routes/scenario.js";
import generateRouter from "./routes/generate.js";
import providersRouter from "./routes/providers.js";
import projectsRouter from "./routes/projects.js";
import worksRouter from "./routes/works.js";
import exportRouter from "./routes/export.js";
import { errorHandler } from "./middleware/error.js";
import { requestLogger } from "./middleware/logger.js";

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: "100mb" }));
app.use(requestLogger);

// Health check
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Routes
app.use("/api/analyze", analyzeRouter);
app.use("/api/scenario", scenarioRouter);
app.use("/api/generate", generateRouter);
app.use("/api/providers", providersRouter);
app.use("/api/projects", projectsRouter);
app.use("/api/projects/:projectId/works", worksRouter);
app.use("/api/export", exportRouter);

// Error handling
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`[backend] Server running on http://localhost:${PORT}`);
});

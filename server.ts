/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import "dotenv/config";
import express, { Request, Response } from "express";
import path from "path";
import apiRoutes from "./backend/routes/apiRoutes";
import { requestLogger } from "./backend/middlewares/logger";
import { errorHandler } from "./backend/middlewares/errorHandler";

const app = express();
const PORT = 3000;

// Apply Middlewares
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.use(requestLogger);

// API Routes
app.use("/api", apiRoutes);

// Global Error Handler
app.use(errorHandler);

// -------------------------------------------------------------
// Static File Middleware (Production)
// -------------------------------------------------------------
if (process.env.NODE_ENV === "production" || process.env.VERCEL) {
  const distPath = path.join(process.cwd(), "dist");
  app.use(express.static(distPath));
  app.get("*", (req: Request, res: Response) => {
    res.sendFile(path.join(distPath, "index.html"));
  });
  console.log("Production static files serving from: " + distPath);
}

export default app;

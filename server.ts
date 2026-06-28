/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import "dotenv/config";
import express, { Request, Response } from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
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
// Vite and Static File Middleware
// -------------------------------------------------------------

import http from "http";

async function startServer() {
  let vite: any;
  const server = http.createServer(app);

  if (process.env.NODE_ENV !== "production") {
    vite = await createViteServer({
      server: { 
        middlewareMode: true,
        hmr: { server }
      },
      appType: "spa",
    });
    app.use(vite.middlewares);
    console.log("Vite development server mounted as middleware.");
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
    console.log("Production static files serving from: " + distPath);
  }

  server.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

if (!process.env.VERCEL) {
  startServer();
}

export default app;

import http from "http";
import app from "./server";
import { createServer as createViteServer } from "vite";

const PORT = 3000;

async function startDevServer() {
  const server = http.createServer(app);
  
  const vite = await createViteServer({
    server: { 
      middlewareMode: true,
      hmr: { server },
      allowedHosts: true
    },
    appType: "spa",
  });
  
  app.use(vite.middlewares);
  console.log("Vite development server mounted as middleware.");

  server.listen(PORT, "0.0.0.0", () => {
    console.log(`Development server running on http://localhost:${PORT}`);
  });
}

startDevServer();

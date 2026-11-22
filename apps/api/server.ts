import helmet from "helmet";
import connectDB from "./config/db.js";
import express from 'express'
import compression from "compression";
import cors from 'cors'
import { env } from "./config/env.js";
import { requestId } from "./middleware/requestId.js";
import { readinessGate, requestTimeout } from "./middleware/readiness.js";
import mongoose from "mongoose";
import { errorHandler, notFoundHandler } from "./middleware/error.js";



connectDB()
const app = express()

app.set("trust proxy", 1)
app.use(helmet())
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }))
app.use(compression())

app.use(
  cors({
    origin: [env.adminUrl, env.clientUrl],
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
  })
)

app.use(express.json({ limit: "2mb" }))
app.use(express.urlencoded({ limit: "2mb", extended: true }))

app.use(requestId)
app.use("/api", readinessGate)
app.use(requestTimeout())


app.get("/api/health", (_req: express.Request, res: express.Response) => {
  const db = mongoose.connection.readyState === 1 ? "connected" : "disconnected"
  res.status(db === "connected" ? 200 : 503).json({
    ok: db === "connected",
    status: db === "connected" ? "healthy" : "degraded",
    db,
    uptime: Math.round(process.uptime()),
    environment: process.env.NODE_ENV,
    timestamp: new Date().toLocaleString()
  })

})

app.use("/api", notFoundHandler)
app.use(errorHandler)

const PORT = process.env.PORT || 8000
const server = app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`)
})

server.keepAliveTimeout = 65_000
server.headersTimeout = 66_000


process.on("unhandledRejection", (reason) => {
  console.error("[api] unhandled rejection:", reason instanceof Error ? reason.stack ?? reason.message : reason);
});
process.on("uncaughtException", (error) => {
  console.error("[api] uncaught exception — shutting down:", error.stack ?? error.message);
  shutdown("uncaughtException", 1);
});

let closing = false;
function shutdown(signal: string, exitCode = 0) {
  if (closing) return;
  closing = true;
  console.log(`[api] ${signal} received — closing connections`);
  const force = setTimeout(() => process.exit(exitCode), 10_000);
  force.unref();
  server.close(() => {
    mongoose
      .disconnect()
      .catch(() => undefined)
      .finally(() => process.exit(exitCode));
  });
}
process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));


export default app;
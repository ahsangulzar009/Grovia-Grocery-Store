import type { NextFunction, Request, Response } from "express";
import mongoose from "mongoose"

const OPEN_PATHS = ["/api/health", "/api/docs", "/api/docs.json", "/api/docs/info"]
const CONNECTING_WAIT_MS = 8_000

function waitForConnection(ms: number): Promise<boolean> {
  return new Promise((resolve) => {
    const timer = setTimeout(() => resolve(false), ms)
    timer.unref();
    mongoose.connection
      .asPromise()
      .then(() => resolve(true), () => resolve(false))
      .finally(() => clearTimeout(timer))
  })
}

function unavailable(req: Request, res: Response) {
  res.status(503).json({
    success: false,
    code: "db_unavailable",
    message: "The database is not connected yet. Try again in a moment.",
    path: req.originalUrl,
    retryAfterSeconds: 5
  })
}


export function readinessGate(req: Request, res: Response, next: NextFunction) {
  const { readyState } = mongoose.connection;
  if (readyState === 1) return next();
  const path = req.originalUrl.split("?")[0] ?? ""
  if (OPEN_PATHS.some((p) => path === p || path.startsWith(`${p}/`))) return next()

  if (readyState === 2) {
    void waitForConnection(CONNECTING_WAIT_MS).then((ok) => (ok ? next() : unavailable(req, res)))
    return
  }

  return unavailable(req, res)
}

const DEFAULT_TIMEOUT_MS=60_000
export function requestTimeout(ms: number = DEFAULT_TIMEOUT_MS){
  return (req: Request, res:Response, next:NextFunction)=>{
    res.setTimeout(ms, () =>{
      if(res.headersSent) return
      res.status(503).json({
        success: false,
        code: "timeout",
        message: `The request took longer than ${Math.round(ms/1000)} s and was stopped`,
        path: req.originalUrl
      })
    })

    next()
  }
}
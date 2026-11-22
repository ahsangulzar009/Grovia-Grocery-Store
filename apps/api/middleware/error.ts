import type { NextFunction, Request, Response } from "express";
import { requestIdOf } from "./requestId.js";


type CustomError = Error & {
  kind?: string;
  code?: number | string;
  status?: number;
  statusCode?: number;
  type?: string;
  keyValue?: Record<string, unknown>;
  errors?: Record<string, { message: string }>
}

export function errorHandler(err: CustomError, req: Request, res: Response, _next: NextFunction) {
  let statusCode = res.statusCode && res.statusCode !== 200 ? res.statusCode : (err.statusCode ?? err.status ?? 500)
  let message = err.message || "Something went wrong"
  let code = "error";
  let hint: string | undefined = undefined

  if (err.name === "CastError" && err.kind==="ObjectId"){
    statusCode = 404
    code = "not_found"
    message = "Resource not found"
  }else if(err.code === 11000){
    statusCode = 409
    code = "duplicate"
    const field = Object.keys(err.keyValue || {})[0] || "field"
    message = `A record with that ${field} already exists.`
  }else if(err.name === "ValidationError"){
    statusCode = 400
    code  = "validation"
    message = Object.values(err.errors || {}).map((v)=>v.message).join(", ") || message
  }else if(err.name==="JsonWebTokenError" || err.name==="TokenExpiredError"){
    statusCode = 401
    code="unauthorized"
    message = err.name === "TokenExpiredError" ? "Your session has expired. Sign in again" : "Invalid token"
  }else if (err.type === "entity.parse.failed"){
    statusCode = 400
    code = "bad_json"
    message = "The request body is not valid json"
  }else if(err.type==="entity.too.large"){
    statusCode = 413
    code="too_large"
    message = "The request body is too large (limit 2mb)"
  }else if(
    err.name === "MongooseServerSelectionError" ||
    err.name==="MongoNetworkError" ||
    (err.name === "MongooseError" && /buffering timed out/i.test(err.message))
  ){
    statusCode = 503
    code = "db_unavailable"
    message = "The database is not reachable right now. Try again in a moment"
    hint = "Check MONGO_URI in .env"
  }else if(statusCode === 500){
    code = "server_error"
  }else if(statusCode===401){
    code = "unauthorized"
  }else if(statusCode===403){
    code = "forbidden"
  }else if(statusCode===404){
    code ="not_found"
  }else if(statusCode===400){
    code = "bad_request"
  }else if(statusCode===409){
    code ="conflict"
  }else if(statusCode===429){
    code ="rate_limit"
  }

  const requestId = requestIdOf(res)

  if(statusCode >= 500){
    console.error(`[api] ${req.method} ${req.originalUrl} → ${statusCode} (request ${requestId}):`, err);
    if (statusCode === 500 && process.env.NODE_ENV === "production") {
      message = `Something went wrong on our side. The team has been notified — quote request ${requestId}.`;
    }
  }

  if (res.headersSent) return;
  res.status(statusCode).json({
    success: false,
    code,
    message,
    path: req.originalUrl,
    ...(requestId ? { requestId } : {}),
    ...(hint ? { hint } : {}),
    ...(process.env.NODE_ENV === "development" ? { stack: err.stack } : {}),
  });

}

export function notFoundHandler(req: Request, res: Response) {
  res.status(404).json({
    success: false,
    code: "not_found",
    message: `No route for ${req.method} ${req.originalUrl}`,
    path: req.originalUrl,
    requestId: requestIdOf(res),
  });
}
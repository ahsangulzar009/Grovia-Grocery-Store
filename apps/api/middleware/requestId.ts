import type { NextFunction, Request, Response } from "express";
import { randomUUID } from "node:crypto";


const SAFE_ID = /^[A-Za-z0-9-]{8,64}$/

export function requestId(req: Request, res: Response, next: NextFunction){
  const supplied = req.get('X-Request-Id') ?? ""
  const id = SAFE_ID.test(supplied) ? supplied : randomUUID();

  res.locals.requestId = id;
  res.setHeader('X-Request-Id', id)

  next()
}

export function requestIdOf(res: Response){
  return typeof res.locals.requestId === 'string' ? res.locals.requestId : ''
}
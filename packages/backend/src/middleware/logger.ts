import type { Request, Response, NextFunction } from "express";

export function requestLogger(req: Request, res: Response, next: NextFunction) {
  const start = Date.now();

  // Log request
  const provider = req.headers["x-vision-provider"] ||
    req.headers["x-llm-provider"] ||
    req.headers["x-image-provider"] ||
    req.headers["x-video-provider"] || "-";
  const modelId = req.headers["x-model-id"] || "-";

  console.log(`[req] ${req.method} ${req.originalUrl} | provider=${provider} model=${modelId}`);

  // Log response
  const originalJson = res.json.bind(res);
  res.json = (body: any) => {
    const duration = Date.now() - start;
    const status = res.statusCode;
    const icon = status >= 400 ? "✗" : "✓";
    console.log(`[res] ${icon} ${req.method} ${req.originalUrl} | ${status} | ${duration}ms`);
    if (status >= 400 && body?.error) {
      console.log(`[res]   error: ${body.error}`);
    }
    return originalJson(body);
  };

  next();
}

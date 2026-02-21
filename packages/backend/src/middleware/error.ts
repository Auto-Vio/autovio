import type { Request, Response, NextFunction } from "express";

export function errorHandler(err: Error, req: Request, res: Response, _next: NextFunction) {
  // Full error logging
  console.error("\n╔══════════════════════════════════════");
  console.error(`║ ERROR: ${req.method} ${req.originalUrl}`);
  console.error("╠══════════════════════════════════════");
  console.error(`║ Message: ${err.message}`);
  if (err.stack) {
    const stackLines = err.stack.split("\n").slice(1, 4);
    for (const line of stackLines) {
      console.error(`║ ${line.trim()}`);
    }
  }
  console.error("╚══════════════════════════════════════\n");

  if (err.message.startsWith("Unsupported file type")) {
    res.status(400).json({ error: err.message });
    return;
  }

  // Zod validation errors
  if (err.name === "ZodError") {
    res.status(400).json({ error: "Validation error", details: (err as any).issues });
    return;
  }

  res.status(500).json({ error: err.message || "Internal server error" });
}

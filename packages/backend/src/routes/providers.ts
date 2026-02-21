import { Router } from "express";
import { listProviders } from "../providers/registry.js";

const router = Router();

router.get("/", (_req, res) => {
  res.json(listProviders());
});

export default router;

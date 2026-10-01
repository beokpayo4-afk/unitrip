import { Router } from "express";
import { runIntegration } from "../controllers/integrationController.js";

const router = Router();

router.post("/:service/:action", runIntegration);

export default router;

import { Router } from "express";
import { generateMetadata } from "../controllers/ai.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(verifyJWT);

router.route("/generate-metadata").post(generateMetadata);

export default router;
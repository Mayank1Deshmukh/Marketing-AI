import { Router, type IRouter } from "express";
import healthRouter from "./health";
import marketingRouter from "./marketing/index";
import profileRouter from "./profile";
import { requireAuth } from "../middlewares/requireAuth";

const router: IRouter = Router();

router.use(healthRouter);
router.use(requireAuth, marketingRouter);
router.use(requireAuth, profileRouter);

export default router;

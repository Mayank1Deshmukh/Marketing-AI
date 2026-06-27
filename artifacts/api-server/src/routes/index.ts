import { Router, type IRouter } from "express";
import healthRouter from "./health";
import marketingRouter from "./marketing/index";
import profileRouter from "./profile";

const router: IRouter = Router();

router.use(healthRouter);
router.use(marketingRouter);
router.use(profileRouter);

export default router;

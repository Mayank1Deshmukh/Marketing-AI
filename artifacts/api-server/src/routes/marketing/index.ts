import { Router } from "express";
import gmbRouter from "./gmb";
import reviewRouter from "./review";
import socialRouter from "./social";
import regenerateRouter from "./regenerate";

const router = Router();

router.use("/marketing", gmbRouter);
router.use("/marketing", reviewRouter);
router.use("/marketing", socialRouter);
router.use("/marketing", regenerateRouter);

export default router;

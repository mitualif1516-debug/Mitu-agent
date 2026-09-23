import { Router, type IRouter } from "express";
import healthRouter from "./health";
import dashboardRouter from "./dashboard";
import configRouter from "./config";
import mobileRouter from "./mobile";

const router: IRouter = Router();

router.use(healthRouter);
router.use(dashboardRouter);
router.use(configRouter);
router.use(mobileRouter);

export default router;

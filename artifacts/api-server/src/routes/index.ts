import { Router, type IRouter } from "express";
import healthRouter from "./health";
import usersRouter from "./users";
import modulesRouter from "./modules";
import quizzesRouter from "./quizzes";
import quizResultsRouter from "./quiz-results";
import alertsRouter from "./alerts";
import incidentsRouter from "./incidents";
import emergencyContactsRouter from "./emergency-contacts";
import dashboardRouter from "./dashboard";

const router: IRouter = Router();

router.use(healthRouter);
router.use(usersRouter);
router.use(modulesRouter);
router.use(quizzesRouter);
router.use(quizResultsRouter);
router.use(alertsRouter);
router.use(incidentsRouter);
router.use(emergencyContactsRouter);
router.use(dashboardRouter);

export default router;

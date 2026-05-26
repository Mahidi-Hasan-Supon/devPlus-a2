import { Router } from "express";
import { issuesController } from "./issues.controller";
import auth from "../../middleware/auth";

const router = Router();
router.post(
  "/",
  auth("contributor", "maintainer"),
  issuesController.issuesUerCreate,
);
router.get("/", issuesController.issueAllUser);
router.get("/:id", issuesController.singleIssues);
router.patch(
  "/:id",
  auth("contributor", "maintainer"),
  issuesController.updateIssues,
);
router.delete("/:id", auth("maintainer"), issuesController.deleteIssues);
export const issuesRouter = router;

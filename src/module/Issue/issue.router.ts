import { Router } from "express";
import { issueController } from "./issue.controller";
import authMiddleware from "../../midleware/authMidleware";

const router = Router();

router.post("/", issueController.createIssue);
router.get("/", issueController.getAllIssues);
router.get("/:id", issueController.getSingleIssue);
router.patch("/:id", authMiddleware("maintainer"), issueController.updateIssue);
router.delete(
  "/:id",
  authMiddleware("maintainer"),
  issueController.deleteIssue,
);

export const issueRoute = router;

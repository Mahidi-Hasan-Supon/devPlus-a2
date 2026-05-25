import { Router } from "express"
import { issuesController } from "./issues.controller"
import auth from "../../middleware/auth"

const router = Router() 
router.post("/", auth,issuesController.issuesUerCreate)
router.get("/" , issuesController.issueAllUser)
router.get('/:id' , issuesController.singleIssues)
router.patch("/:id" , issuesController.updateIssues)
export const issuesRouter = router

import { Router } from "express";
import { signupController } from "./signup.controller";

const router = Router()
router.post("/signup" , signupController.signUpUser)


export const signupRoute = router

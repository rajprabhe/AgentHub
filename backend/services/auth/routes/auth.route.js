import express from 'express'
import { currentDeductDetails, deductCredits, login, logOut, updateUserPayment } from '../controller/auth.controller.js'

const router = express.Router()

router.post("/login", login)
router.get("/logout", logOut)
router.post("/update-plan", updateUserPayment)
router.post("/deduct-credits", deductCredits)
router.post("/current-credits", currentDeductDetails)




export default router
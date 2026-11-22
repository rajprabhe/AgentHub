import express from 'express'
import { createOrder, verifyPayments } from '../controller/billing.controller.js'


const router = express.Router()
router.post("/create", createOrder)
router.post("/verify", verifyPayments)




export default router
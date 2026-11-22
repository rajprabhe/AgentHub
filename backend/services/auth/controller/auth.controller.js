import { getAuth } from "firebase-admin/auth"
import User from "../models/user.model.js"
import { app } from '../config/firebase.js'
import redis from "../../../shared/redis/redis.js"

export const login = async (req, res) => {
    try {
        const { token } = req.body
        const decoded = await getAuth(app).verifyIdToken(token)
        if (!decoded) {
            return res.status(401).json({
                message: "Invalid token"
            });
        }

        let user = await User.findOne({
            firebaseUid: decoded.uid
        })

        if (!user) {
            user = await User.create({
                firebaseUid: decoded.uid,
                name: decoded.name,
                email: decoded.email,
                avatar: decoded.picture
            })
        }

        const sessionId = crypto.randomUUID()

        await redis.set(`user-session-${user?._id}`,
            sessionId
            , "EX", 7 * 24 * 60 * 60)

        await redis.set(`session-${sessionId}`, JSON.stringify({
            userId: user._id,
            name: user.name,
            email: user.email,
            avatar: user.avatar,
            plan: user.plan,
            credits: user.credits,
            totalCredits: user.totalCredits,
            planExpriresAt: user.planExpriresAt
        }), "EX", 7 * 24 * 60 * 60)

        res.cookie("session", sessionId, {
            httpOnly: true,
            secure: false,
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000
        })

        return res.status(200).json(user)

    } catch (error) {
        return res.status(500).json({
            message: `login error ${error}`
        })
    }
}


export const logOut = async (req, res) => {
    try {
        const sessionId = req.cookies?.session
        await redis.del(`session-${sessionId}`)

        res.clearCookie("session")
        return res.status(200).json({
            message: "logout successfully"
        })
    } catch (error) {
        return res.status(500).json({
            message: `logout error ${error}`
        })
    }
}



export const updateUserPayment = async (req, res) => {
    try {
        const { plan, credits, userId } = req.body
        const user = await User.findById(userId)
        if (!user) {
            return res.status(404).json({
                message: "User not found"
            })
        }

        user.plan = plan
        user.credits += credits
        user.totalCredits += credits
        user.planExpriresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        await user.save()

        // const sessionId =  req.cookies?.session
        const sessionId = await redis.get(`user-session-${user?._id}`)

        await redis.set(`session-${sessionId}`, JSON.stringify({
            userId: user._id,
            name: user.name,
            email: user.email,
            avatar: user.avatar,
            plan: user.plan,
            credits: user.credits,
            totalCredits: user.totalCredits,
            planExpriresAt: user.planExpriresAt
        }), "EX", 7 * 24 * 60 * 60)

        return res.status(200).json({
            user,
            success: true
        })

    } catch (error) {
        return res.status(200).json({ message: `update user payments error ${error}` })
    }
}



export const deductCredits = async (req, res) => {
    try {
        const { userId, agent } = req.body
        console.log("deduct credits")
        


        if (!userId || !agent) {
            return res.status(400).json({
                message: "userId and agent not found"
            })
        }

        const COST = {
            chat: 1,
            search: 5,
            coding: 10,
            pdf: 10,
            ppt: 10,
            vision: 10
        }

        const user = await User.findById(userId)

        if (!user) {
            return res.status(400).json({
                message: "user not found"
            })
        }


        const requiredCredits = COST[agent] || 1
        if (user.credits < requiredCredits) {
            return res.status(400).json({
                message: "Not enough credits"
            })
        }

        user.credits -= requiredCredits
        await user.save()

        const sessionId = await redis.get(`user-session-${user?._id}`)

        await redis.set(`session-${sessionId}`, JSON.stringify({
            userId: user._id,
            name: user.name,
            email: user.email,
            avatar: user.avatar,
            plan: user.plan,
            credits: user.credits,
            totalCredits: user.totalCredits,
            planExpriresAt: user.planExpriresAt
        }), "EX", 7 * 24 * 60 * 60)

        return res.status(200).json({
            user,
            credits:user.credits,
            success: true
        })

    } catch (error) {

        return res.status(500).json({
            message: `deduct credits error ${error}`
        })

    }
}



export const currentDeductDetails = async (req, res) => {

    try {
        const { userId } = req.body
        if(!userId){
            return res.status(400).json({
                message:"UserId not found"
            })
        }

        const user = await User.findById(userId)
        if(!user){
            return res.status(400).json({
                message:"User not found"
            }) 
        }

        console.log("Current Deduct details", user)

        return res.status(200).json({
            user
        })
        
    } catch (error) {

        return res.status(200).json({
            message:`user error ${error}`
        })
        
    }
    


}




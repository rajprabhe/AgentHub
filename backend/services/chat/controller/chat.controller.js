import Conversation from "../models/conversation.model.js"
import Message from "../models/message.model.js"

export const createConversation = async (req, res) => {
    try {
        const userId = req.headers["x-user-id"]
        // console.log("userId", userId)
        if(!userId){
            return res.status(400).json({
                message: "userId are required"
            })
        }

        const conversation = await Conversation.create({
            userId: userId
        })

        return res.status(200).json(conversation)
    } catch (error) {
        return res.status(500).json(
            { message: `create conversation error ${error}` }
        )
    }
}



export const getConversations = async (req, res) => {
    try {
        const userId = req.headers["x-user-id"]
        // console.log("userId", userId)
        if(!userId){
            return res.status(400).json({
                message: "userId are required"
            })
        }

        const conversations = await Conversation.find({
            userId: userId
        }).sort({ updatedAt: -1 })

        return res.status(200).json(conversations)
    } catch (error) {
        return res.status(500).json(
            { message: `get conversation error ${error}` }
        )
    }
}


export const updateConversation = async (req, res) => {
    try {
        const { id , title } = req.body
        if(!id || !title){
            return res.status(400).json({
                message: "id and title are required"
            })
        }
        const conversation = await Conversation.findByIdAndUpdate(id,{
            title
        })

        return res.status(200).json(conversation)
    } catch (error) {
        return res.status(500).json(
            { message: `update conversation error ${error}` }
        )
    }
}


export const saveMessage = async (req, res) => {
    try {
        const { conversationId, role, content, images, artifacts } = req.body
        console.log("conv",conversationId)
        console.log("role",role)
        console.log("content",content)

        if (!conversationId || !role || !content) {
            return res.status(400).json({
                message: "conversationId, role and content are required"
            })
        }
        const message = await Message.create({
            conversationId,
            content,
            role,
            images,
            artifacts
        })

        return res.status(200).json(message)
    } catch (error) {
        return res.status(500).json(
            { message: `save message error ${error}` }
        )
    }
}


export const getMessages = async (req, res) => {
    try {
        const conversationId = req.params
        if(!conversationId) {
            return res.status(400).json({
                message: "conversationId are required"
            })
        }
        const messages = await Message.find({
            conversationId:req.params.conversationId
        })

        return res.status(200).json(messages)
    } catch (error) {
        return res.status(500).json(
            { message: `get message error ${error}` }
        )
    }
}
import axios from 'axios'
import { graph } from "../graph/graph.js"
import { addMessages } from '../config/memory.js'

export const agent = async (req, res, next) => {
    try {
        const { prompt, conversationId, agent} = req.body
        // multer create file inside req object and provide your frontend file --> req.file
        const file = req.file
        console.log("File", file)
        const userId = req.headers["x-user-id"]
        console.log("userId",userId)

        console.log("agent",agent)

        // console.log("prompt user",prompt)
        console.log("Step 1: Saving user message")

        await axios.post(`${process.env.CHAT_SERVICE}/save-message`, {
            conversationId,
            content: prompt,
            role: "user"
        })

        console.log("Step 2: Invoking graph")

        // every nodes has state to access
        // prompt, conversationId to state directly to graph
        const result = await graph.invoke({
            prompt,
            conversationId,
            agent,
            userId,
            file
        })

        // graph return all state value but we need only aiResponse
        const response = result?.aiResponse
         
        console.log("Step 3: Saving messages to Redis")

        // store messages in redis
        await addMessages(conversationId, "user", prompt)
        await addMessages(conversationId, "assistant", response)

        // console.log("prompt ai agent", response)

        console.log("Step 4: Saving assistant message")

        await axios.post(`${process.env.CHAT_SERVICE}/save-message`, {
            conversationId,
            content: response,
            role: "assistant",
            images:result?.images,
            artifacts:result?.artifacts
        })

        const resultData = await axios.post(`${process.env.AUTH_SERVICE}/current-credits`, {userId})

        console.log(resultData, resultData.data.user)





        console.log("Step 5: Success")

        return res.status(200).json({
            user:resultData.data.user,
            answer:response,
            images:result?.images,
            artifacts:result?.artifacts
        })

        

    } catch (error) {
        // console.error("Stack:", error.stack)
        // console.error("Agent error:", error.message);
        // console.error("Status:", error.response?.status);
        // console.error("Response:", error.response?.data);
        // return res.status(500).json({ message: `agent error ${error.message}` })

        next(error)
    }
}
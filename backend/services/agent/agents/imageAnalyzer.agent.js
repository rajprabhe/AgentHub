import fs from "fs/promises"
import { getModel } from "../config/llmModel.js"
import { HumanMessage, SystemMessage } from "@langchain/core/messages"
import { deductCredits } from "../utils/deductcredits.js"
import { checkAgentLimits } from "../config/agentLimit.js"




export const imageAnalyzer = async (state) => {
    try {
        await checkAgentLimits(state.userId, "vision")
        
        console.log("working")
        const llm = await getModel("imageAnalyzer")

        const imageBuffer = await fs.readFile(state.file.path)
        const base64image = imageBuffer.toString("base64")

        const messages = [
            new SystemMessage(
                `You are CortexAI image analyzer Agent.

                Rules:

                - Analyze only the uploaded image.
                - Answer the user's question accurately.
                - If text exists in the image, extract it.
                - If charts or tables exist, explain them.
                - If something is unclear, say so.
                - Use Markdown when helpful.
                - Do not hallucinate.`),

            new HumanMessage(
                {
                    content:[
                        {
                            type:"text",
                            text: state.prompt || "analyze the image"
                        },
                        {
                            type:"image_url",
                            image_url:{
                                url:`data:${state.file.mimetype};base64,${base64image}`
                            }
                        }
                    ]
                }
            )
        ]


        const response = await llm.invoke(messages)
        await deductCredits(state.userId, "vision")
        console.log("Ending")
        
        return {
            ...state,
            aiResponse:response.content
        }


    } catch (error) {
        console.log(error)
        return {
        ...state,
        aiResponse:error?.data?.message || "failed to analyze images"
      }

    }finally{
        // file delete after image upload on server
        await fs.unlink(state.file.path)
    }

}

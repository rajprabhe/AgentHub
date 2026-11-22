import { getModel } from "../config/llmModel.js"
import axios from "axios"
import { uploadToS3 } from "../utils/uploadToS3.js"
import { getFromS3 } from "../utils/getFromS3.js"
import { deductCredits } from "../utils/deductcredits.js"
import { checkAgentLimits } from "../config/agentLimit.js"

export const visionAgent = async (state) => {
    console.log("i am vision agent 1 ")


    try {
        await checkAgentLimits(state.userId, "vision")

        const llm = await getModel("image")
        const res = await llm.invoke(`
       You are an elite AI image prompt engineer.

Convert the user request into a highly detailed image generation prompt.

Requirements:

- Cinematic lighting
- Professional composition
- Ultra realistic
- High detail
- Beautiful color palette
- Sharp focus
- 8K quality
- Photorealistic
- Depth of field
- Professional photography
- Stunning visuals

Return only the image prompt.

User Request:${state.prompt}

    `)



        const prompt = res.content.trim()
        console.log(prompt)
        const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}`

        const imageRes = await axios.get(imageUrl, { responseType: "arraybuffer" })
        console.log(imageRes)

         // deduct user credits
        await deductCredits(state.userId, "vision")

        const buffer = Buffer.from(imageRes.data)
        const filename = `image-${Date.now()}.png`

        await uploadToS3(filename, buffer, "image/png")
        const downloadUrl = await getFromS3(filename, 24*60)
        console.log("download url", downloadUrl)

        return {
            ...state,
            aiResponse: [
                "# 🖼️ Image Generated Successfully",
                "",
                `![Generated Image](${downloadUrl})`,
                "",
                "⌛ Link expires in 24 hours."
            ].join("\n")
        }
    } catch (error) {
        console.log(error)
        console.log(error.message)

       return {
        ...state,
        aiResponse:error?.data?.message || "failed to generate images"
      }

    }



}
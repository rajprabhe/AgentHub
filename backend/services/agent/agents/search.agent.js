import { checkAgentLimits } from "../config/agentLimit.js"
import { searchTool } from "../config/tavily.js"
import { deductCredits } from "../utils/deductcredits.js"

export const searchAgent = async (state) => {
    try {
        await checkAgentLimits(state.userId, "search")
        const results = await searchTool.invoke({
            query:state.prompt
        })

         // deduct user credits
        await deductCredits(state.userId, "search")
        // console.log(results)
        return {
            ...state,
            searchResult:results,
            images:results.images
        }
    } catch (error) {
        return {
            ...state,
            aiResponse:error?.data?.message || "failed to search",
            searchResult:[],
            images:[]
        } 
    }

}
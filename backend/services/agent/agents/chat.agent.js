import { AIMessage, HumanMessage, SystemMessage } from "@langchain/core/messages"
import { getModel } from "../config/llmModel.js"
import { getMemory } from "../config/memory.js"
import { deductCredits } from "../utils/deductcredits.js"
import { checkAgentLimits } from "../config/agentLimit.js"

export const chatAgent = async (state) => {

    try{
    await checkAgentLimits(state.userId, "chat")
    const llm = await getModel("chat")
    const history = await getMemory(state.conversationId)

    const searchContext = state.searchResult ? `
    Web Search Results:
    ${JSON.stringify(state.searchResult)}
    Answer the user using only the above search results
    `:''

    const systemPrompt = `You are AgentHub, an intelligent AI assistant

    ${searchContext}

    If searchContext exists:
    - Use search results to answer.
    - Do not mention internal tools.


    Rules:
    - For simple questions, greetings, and short queries, respond naturally in plain text.
    - For technical, educational, coding, or detailed topics, use clean Markdown.
    
    Formatting:
    - Use # for titles and ## for sections.
    - Leave a blank line after headings.
    - Use bullet points for lists.
    - Use numbered lists for steps.
    - Use fenced code blocks with language tags for code.
    - Keep paragraphs short and readable.
    - Never write headings and content on the same line.
    - Never generate large walls of text.
    `
    const messages = [
        // SystemMessage provide by langchain
        new SystemMessage(systemPrompt)

    ]

    history.forEach(msg => {

        if(msg.role == "user"){
             // HumanMessage provide by langchain
            messages.push(new HumanMessage(msg.content))
        }

        if(msg.role == "assistant"){
             // AIMessage provide by langchain
            messages.push(new AIMessage(msg.content))
        }
    })


    
    // const response = await llm.invoke([
    //     {
    //         "role":"system",
    //         "content":systemPrompt
    //     },
    //     {
    //         "role":"human",
    //         "content":state.prompt
    //     }
    // ])


    messages.push(new HumanMessage(state.prompt))
    // console.log(messages)

    const response = await llm.invoke(messages)


    // deduct user credits
    await deductCredits(state.userId, "chat")




    return{
        ...state,
        aiResponse:response.content
    }
    }catch(error){
        return {
        ...state,
        aiResponse:error?.data?.message || "failed to generate chat"
      }
    }
}
import { checkAgentLimits } from "../config/agentLimit.js"
import { getModel } from "../config/llmModel.js"
import { deductCredits } from "../utils/deductcredits.js"

export const codingAgent = async (state) => {

    try{
    await checkAgentLimits(state.userId, "coding")
    
    console.log("hello from coding agent")
    const intentLLm = await getModel("intent")
    const llm = await getModel('coding')

    const intentRes = await intentLLm.invoke(`
    You are an intent classifier
    Return ONLY one of these values.
    CODE_GENERATION
    CODE REVIEW
    CODE EXPLANATION
    DEBUGGING
    OPTIMIZATION
    CONVERSION
    DOCUMENTATION
    User Request:${state.prompt}   
    `)

    const intent = intentRes.content
    console.log(intent)

    if(intent == "CODE_GENERATION"){
        const prompt = `
        You are AgentHub Coding Agent

        Generate the requested project
        default stack:
        - HTML 
        - CSS
        - Javascipt


        use React / Netx.js only if Explicity requested.

        Rules:
        - Responsive
        - Modern UI
        - CSS Variables
        - Flexbox/Grid
        - Smooth Scroll
        - Hover Effects
        - Beautiful spacing
        - Single page unless user asks otherwise.

        - IMAGES
        Always use real Unsplash images.
        Never use placeholders.

        Return ONLY valid JSON.
        Schema:
        {
       "files":[
        {
        "name": "index.html",
        "content":" ... "

        },
        {
        "name":"style.css",
        "content":" ... "

        },
        {
        "name":"script.js",
        "content":" ... "

        }
        ]
        }

        Rules:

        - Output must start with {
        - Output must end with }
        - No markdown
        - No explanation
        - No extra text
        - No \`\`\`
        - Never mention intent

        User Request:${state.prompt}
        `

        const res = await llm.invoke(prompt)
        // console.log(JSON.parse(res.content))
        const data = JSON.parse(res.content)

        // deduct user credits
        await deductCredits(state.userId, "coding")

        return {
            ...state,
            aiResponse:"Code Generated Successfully",
            artifacts:[
                {
                    id:Date.now(),
                    type:"Project",
                    files:data.files || [],
                    title:state.prompt
                }
            ]
        }

    }


    const res = await llm.invoke(`
        The user's request is
        ${intent}
        Return Markdown only.
        Never generate project files.
        Use headings like:
        # Overview
        ## Explanation
        ## Problems
        ## Improvements
        ## Best Practices
        ## Optimized Code ( if needed)
        User Request: ${state.prompt} 
    `)

     // deduct user credits
    await deductCredits(state.userId, "coding")

    const data = res.content
    return {
        ...state,
        aiResponse:data,
        artifacts:[]
    }

}catch(error){
    return {
        ...state,
        aiResponse:error?.data?.message || "failed to generate code",
        artifacts:[]
      }
}
    
}
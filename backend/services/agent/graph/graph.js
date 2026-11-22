import { StateGraph } from "@langchain/langgraph";
import { agenetState } from "./state.js";
import { router } from "./router.js";
import { chatAgent } from "../agents/chat.agent.js";
import { searchAgent } from "../agents/search.agent.js";
import { codingAgent } from "../agents/codingAgent.js";
import { pdfAgent } from "../agents/pdf.agent.js";
import { pptAgent } from "../agents/ppt.agent.js";
import { visionAgent } from "../agents/vision.agent.js";
import { pdfRag } from "../agents/pdfRag.agent.js";
import { imageAnalyzer } from "../agents/imageAnalyzer.agent.js";

const workflow = new StateGraph(agenetState)

// Nodes
// every nodes has state to access
workflow.addNode("router",router)
workflow.addNode("chat",chatAgent)
workflow.addNode("search",searchAgent)
workflow.addNode("coding",codingAgent)
workflow.addNode("pdf",pdfAgent)
workflow.addNode("ppt",pptAgent)
workflow.addNode("vision",visionAgent)
workflow.addNode("pdfRag",pdfRag)
workflow.addNode("imageAnalyzer", imageAnalyzer)



/**
case "chat":
    return "chat";

when a particular case match go to that node
here above example case mathc with chat node than goto chat node for excuation
 */

// connected Edges
workflow.addEdge("__start__","router")
workflow.addConditionalEdges("router", (state)=>{
    switch(state.agent){
        case "chat":
            return "chat";
        case "search":
            return "search";
        case "coding":
            return "coding";
        case "pdf":
            return "pdf";
        case "ppt":
            return "ppt";
        case "vision":
            return "vision";  
        case "pdfRag":
            return "pdfRag";
        case "imageAnalyzer":
            return "imageAnalyzer";
        default:
            return "chat"    
    }
},{
    // map to node
    chat:"chat",
    search:"search",
    coding:"coding",
    vision:"vision",
    ppt:"ppt",
    pdf:"pdf",
    pdfRag:"pdfRag",
    imageAnalyzer:"imageAnalyzer"
})

workflow.addEdge("search", "chat")
workflow.addEdge("chat", "__end__")
workflow.addEdge("coding", "__end__")
workflow.addEdge("vision", "__end__")
workflow.addEdge("pdf", "__end__")
workflow.addEdge("ppt", "__end__")
workflow.addEdge("pdfRag", "__end__")
workflow.addEdge("imageAnalyzer", "__end__")




export const graph = workflow.compile()










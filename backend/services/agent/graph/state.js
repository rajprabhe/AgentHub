import { Annotation } from "@langchain/langgraph"


// build custom state
export const agenetState = Annotation.Root({
    prompt:Annotation(),
    aiResponse:Annotation(),
    agent:Annotation(),
    conversationId:Annotation(),
    searchResult:Annotation(),
    images:Annotation(),
    artifacts:Annotation(),
    userId:Annotation(),
    file:Annotation()
})



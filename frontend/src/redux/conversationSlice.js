import { createSlice } from "@reduxjs/toolkit";

const conversationSlice = createSlice({
    name: "conversation",
    initialState: {
        conversation: [],
        selectedConversation:null
    },
    reducers: {
        setConversations: (state, action) => {
            state.conversation = action.payload
        },
        addConversation: (state, action) => {
            /** 
            (method) Array<never>.unshift(...items: never[]): number
            Inserts new elements at the start of an array, and returns the new length of the array.
            Elements to insert at the start of the array.
             */
            state.conversation.unshift(action.payload)
        },
        setselecetedConversation:(state,action)=>{
            state.selectedConversation = action.payload
        },
        setConvTitle:(state, action) => {
            const { conversationId, title } = action.payload
            state.conversation = state.conversation.map((conv)=>(
                // if conv._id match conversationId only update title and if not match return all conversation
                conv._id == conversationId ? ({...conv,title}) : conv
            ))
        }

    }
})


export const { setConversations, addConversation, setselecetedConversation, setConvTitle } = conversationSlice.actions
export default conversationSlice.reducer
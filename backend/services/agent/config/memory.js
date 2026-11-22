import redis from "../../../shared/redis/redis.js"
import { getMessages } from "../utils/getMessages.js"


// create memory for Agent to store messages
// store old messages in redis
export const getMemory = async (conversationId) => {
    const key = `messages-${conversationId}`
    const cached = await redis.get(key)
    if(cached){
        return JSON.parse(cached)
    }

    const messages = await getMessages(conversationId)
    await redis.set(key, JSON.stringify(messages) , "EX", 24*60*60)

    return messages
}

// store new messages in redis
export const addMessages = async (conversationId, role, content) => {
    const key = `messages-${conversationId}`
    const rawMessages = await redis.get(key)
    const messages = rawMessages?JSON.parse(rawMessages):[]
    messages.push({
        role,content
    })

    // we only store 20 message in redis because redis have limited memory
    if(messages.length > 20){
        // shift is method that remove first element from array
        messages.shift()
    }

    // store 20 messages in redis
    await redis.set(key, JSON.stringify(messages))
 
}
import axios from "axios"
import dotenv from 'dotenv'
const result = dotenv.config()

console.log("Env file error:", result.error);
console.log("Auth URL:", process.env.AUTH_SERVICE);

export const deductCredits = async (userId , agent) =>{
    try {
        console.log("Auth service", process.env.AUTH_SERVICE)
        const { data } = await axios.post(`${process.env.AUTH_SERVICE}/deduct-credits`, {userId, agent})
        console.log(data)
        return data
    } catch (error) {
        console.log(error)      
        return null
    }
}
import api from "../../utils/axios.js"

export const verifyPayments = async (payload) =>{
    try {
        const { data } = await api.post("/api/billing/verify", payload)
        console.log(data)
        return data
    } catch (error) {
        console.log(error)      
       
    }
}
import api from "../../utils/axios.js"

const getCurrentUser = async (req, res) =>{
    try {
        // console.log("working")
        const { data } = await api.get("/api/me")
        
        return data
    } catch (error) {
        console.log(error)
        // console.log(error.response.status)
        // console.log(error.response.data.message)
        return null
    }
}

export default getCurrentUser


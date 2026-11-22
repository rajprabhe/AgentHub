import { signInWithPopup } from 'firebase/auth'
import { auth, googleProvider } from '../utils/firebase.js'
import api from '../utils/axios.js'
import Home from './pages/Home.jsx'
import { useEffect } from 'react'
import getCurrentUser from './features/getCurrentUser.js'
import { useDispatch } from 'react-redux'
import { setUserdata } from './redux/userSlice.js'

function App() { 


  const dispatch = useDispatch()
  useEffect(()=>{
    const getUser = async ()=>{
      const data = await getCurrentUser()
      dispatch(setUserdata(data))
    }
    getUser()
  },[])

 

  return (
    <>
    <Home/>
    </>
  )
}

export default App
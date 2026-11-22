import { Code2, FileText, Globe, ImageIcon, MessageSquare, Mic, Paperclip, Presentation, Send, X, Zap } from 'lucide-react'
import  { useState } from 'react'
import sendMessage from '../features/sendMessage'
import { useDispatch, useSelector } from 'react-redux'
import { addMessages, setArtifacts, setIsLoading, setMessages  } from '../redux/messageSlice'
import { createConversation } from '../features/createConversation'
import { addConversation, setConvTitle, setselecetedConversation } from '../redux/conversationSlice'
import { updateConversation } from '../features/updateConversation'
import { setUserdata } from '../redux/userSlice'
import { useRef } from 'react'

const ChatInput = () => {

  const [values, setValue] = useState("")
  const [selectedAgent, setSelectedAgent] = useState("Auto")
  const { selectedConversation } = useSelector(state => state.conversation)
  const { messages, isLoading} = useSelector(state => state.message)
  const [selectedFile, setSelectedFile] = useState(null)
  const fileRef = useRef(null)

  console.log(selectedAgent)
  console.log(selectedFile)

  
  const dispatch = useDispatch()
  

  const handleSendMessage = async () => {

    dispatch(setIsLoading(true))

    let conversation = selectedConversation
    if(!conversation){
      const conv = await createConversation()
      // update selected conversation
      dispatch(setselecetedConversation(conv))
      dispatch(addConversation(conv))
      conversation = conv
    }

    if(conversation.title == "New Chat"){
      const conv = await updateConversation({id:conversation?._id, title:values.trim()})
      dispatch(setConvTitle({conversationId:conversation?._id, title:values.slice(0,40)}))
    }


    // const payload ={
    //   prompt:values.trim(),
    //   conversationId:conversation?._id,
    //   agent:selectedAgent.toLowerCase()
    // }

    const formData = new FormData()
    formData.append("prompt",values.trim())
    formData.append("conversationId",conversation?._id)
    formData.append("agent", selectedAgent.toLowerCase())
    if(selectedFile){
      formData.append("file", selectedFile)
    }
   



    // state change entire component re-render show update data
    dispatch(addMessages({role:"user", content:values.trim()}))
    setValue("")

    const data = await sendMessage(formData)
    dispatch(setIsLoading(false))
    setSelectedFile(null)
    console.log(data)
    dispatch(setUserdata(data.user))
    dispatch(setArtifacts(data.artifacts || []))
    dispatch(addMessages({role:"assistant", content:data?.answer, images:data?.images}))
    console.log(data)
  }

  const agents = [
    {
      id:"auto",
      icon:Zap,
      label:"Auto"
    },
    {
      id:"chat",
      icon:MessageSquare,
      label:"Chat"
    },
    {
      id:"coding",
      icon:Code2,
      label:"Coding"
    },
    {
      id:"pdf",
      icon:FileText,
      label:"PDF"
    },
    {
      id:"ppt",
      icon:Presentation,
      label:"PPT"
    },
    {
      id:"vision",
      icon:ImageIcon,
      label:"Vision"
    },
    {
      id:"search",
      icon:Globe,
      label:"Search"
    }
  ]

 
  return (
    <div className='w-full overflow-hidden px-3 md:px-5 py-4 border-t
    border-white/[0.06] bg-[#0d0f14]'>
      <div className='flex flex-col gap-2 bg-white/[0.03] border border-white/[0.07]
      rounded-2xl px-4 pt-3.5 pb-3'>

        <div className='flex w-[80%] gap-2 pr-2 flex-wrap'>
          {agents.map((agent,i) => {
            const isActive = selectedAgent === agent.label
            const Icon = agent.icon
            return (
              <div 
              key={i}
              onClick={()=>setSelectedAgent(agent.label)}
              className={` cursor-pointer flex-shrink-0 inline-flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-medium border transition-all
              ${isActive ?
                "bg-linear-to-r from-indigo-500 to-violet-600 text-white shadow-[0_1px_8px_rgba(99,102,241,.35)]"
                :"text-slate-400 bg-white/[0.03] text-slate-400 border-white/[0.06] hover:bg-white/[0.07]"
                }
              `}>
                <Icon size={14} 
                className={
                  isActive ? "text-white" :"text-slate-500"
                }
                />

                {agent.label}

              </div>
            )
          })}

        </div>

          {/* pdf and images selected show */}
        {selectedFile && <div className='my-3'>

          <div className='inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2'>
            {
              selectedFile?.type === "application/pdf" ? <FileText size={16} className='text-red-400'/>
              : selectedFile.type.startsWith("image/") && <img src={URL.createObjectURL(selectedFile)} className='h-10 w-10 rounded-xl object-cover mt-3'/>
            }

            <div >
              <p className='text-xs text-white'>
                {selectedFile?.name}
              </p>
              <p className='text-[10px] text-slate-500'>
                {Math.ceil(selectedFile.size/ 1024).toFixed(2)}KB
              </p>
            </div>

          <button className='ml-2 cursor-pointer' onClick={()=>{setSelectedFile(null); fileRef.current.value = ""}}> <X size={14} className='text-slate-500 hover:text-white'/> </button>
          
          </div>

         
        </div>}


        <textarea
        onChange={(e)=>setValue(e.target.value)}
        value={values}
        placeholder='Ask Anything...'
        className="w-full bg-transparent outline-none resize-none text-[14px] text-slate-200 
        placeholder : text-white leading-relaxed [scrollbar-width:none] [&::-webkit-scrollbar]:hidden
        disabled:opacity-50"
        rows={3}
        />


        <div className='flex items-center justify-between'>
          {/* start div */}
          <div className='flex items-center gap-1'>


            {/* pdf and image select input */}
            <input type='file' accept='.pdf, image/*' 
            hidden 
            ref={fileRef}
            onChange={(e)=>{
              const file = e.target.files[0]
              if(file){
                setSelectedFile(file) 
              }
              
            }}
            />

            <button className='flex items-center justify-center w-8 h-8 rounded-1g text-slate-600
             hover:text-slate-400 hover:bg-white/[0.05] border border-transparent hover:border-white/[0.06]
             transition-all duration-150 bg-transparent cursor-pointer'
             onClick={()=>fileRef.current.click()}
             >
              <Paperclip size={16}/>
            </button>

            <button className='flex items-center justify-center w-8 h-8 rounded-1g text-slate-600
             hover:text-slate-400 hover:bg-white/[0.05] border border-transparent hover:border-white/[0.06]
             transition-all duration-150 bg-transparent cursor-pointer'>
              <Mic size={16}/>
            </button>
          </div>

          {/* end div */}
          <div>
            <button 
            disabled={!values && isLoading}
            onClick={handleSendMessage}
            className={`flex items-center justify-center w-8 h-8 rounded-lg border-none cursor-pointer
            transition-all duration-150  ${values.trim() ? "bg-linear-to-br from-indigo-500 to-violet-700 hover:opacity-90 text-white"
            :"bg-white/[0.05] text-slate-600 cursor-not-allowed"}`}
            >
              <Send size={15}/>
            </button>
          </div>
        </div>


      </div>
    </div>
  )
}

export default ChatInput
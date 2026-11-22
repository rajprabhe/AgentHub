import proxy from "express-http-proxy"

export const proxyWithHeader = (serviceUrl) =>{
    //  sending custom header for chat service because we not access cookie in directly for security reason 
    // chat service directly access data so this problems solve by sending header 
    // we user protect middleware so that why need this process
    // cookies also pass direclty all service ex: auth, agent for security purpose we all send userId for chat service
    return proxy(serviceUrl, {
        proxyReqOptDecorator: (proxyReqOpts, srcReq) => {
            if(srcReq.user){
                // srcReq.user --> this provide by protect middeleware in req object as filed name is user
                proxyReqOpts.headers["x-user-id"] = srcReq.user.userId
                return proxyReqOpts
            }
        }

    })
}
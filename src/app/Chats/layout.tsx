import React from "react";

const page = ({children} :  {children : React.ReactNode}) => {  
    return(
        <div className="flex flex-row w-full h-full bg-[#262524]">
            {children}
        </div>
    )
}

export default page
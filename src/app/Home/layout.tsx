import React from 'react'

const page = ({children} : {children : React.ReactNode}) => {
    return(<div className="flex flex-col gap-8 justify-center w-full h-full bg-gradient-to-r from-orange-800 to-blue-900 text-center">
        {children}
    </div>)
}

export default page
'use client'
import { useAtom } from "jotai";
import { userAtom, selectedChatAtom } from '../../jotaiConfigs/user_atom'
import { useEffect, useState, useRef } from "react";
import { doc, collection, setDoc, getDocs, getDoc, query, where, onSnapshot, Firestore } from "firebase/firestore"
import { db, auth, firebase } from '../../../../firebase'
import React from "react";
import { onAuthStateChanged } from "firebase/auth";

export const ChatDisplay = () => {

    const [userSession, setUserSession] = useAtom(userAtom)
    const [selectedChat, setSelectedChat] = useAtom(selectedChatAtom)
    const [message, setMessage] = useState("")
    const [chatList, setChatList] = useState<any[]>([])
    const [recipientStatus, setRecepientStatus] = useState("")
    const inputRef = useRef<HTMLTextAreaElement>(null)
    const containerRef = useRef<HTMLObjectElement>(null)
    const chatContainerRef = useRef<HTMLObjectElement>(null)

    const resizeTextArea = () => {
        if (inputRef.current != null && containerRef.current != null) {
            // Reset height to auto to calculate new height based on content
            inputRef.current.style.height = 'auto';
            // Set the height to the scrollHeight (the height of the content)
            inputRef.current.style.height = `${inputRef.current.scrollHeight}px`;

            // Limit height to max height (300px in this case)
            if (inputRef.current.scrollHeight > 150) {
                inputRef.current.style.height = '150px';
            }
            else {
                containerRef.current.style.height = 'auto';
                containerRef.current.style.height = `${inputRef.current.scrollHeight + 40}px`;
            }
        }
    }

    const unsubscribeChats = onSnapshot(doc(db, 'chats', selectedChat.chatID == "" ? "dummy" : selectedChat.chatID), (doc) => {
        if (doc.exists()) {
            if (doc.data().chatList == null) return
            if (chatList.length == doc.data().chatList.length) return
            setChatList(doc.data().chatList)
        }
    })

    const unsubscribeUsers = onSnapshot(doc(db, 'users', selectedChat.userRecipientID == "" ? "dummy" : selectedChat.userRecipientID), (doc) => {
                                if(doc.exists()) {
                                    setRecepientStatus(doc.data().status)
                                }
                            })

    onAuthStateChanged(auth, (user) => {
        if (!user) {
            unsubscribeChats()
            unsubscribeUsers()
        }
    })
    
    const sendMessage = () => {
        if (message != "") {
            const docRef = doc(db, "chats", selectedChat.chatID == "" ? "dummy" : selectedChat.chatID)
            const date = new Date()
            getDoc(docRef).then(async (result) => {
                if (result.exists()) {
                    if (result.data().chatList == undefined || result.data().chatList == null) {
                        await setDoc(docRef, {chatList: [{no: 1 ,message: message, senderID: userSession.uid, date: date}]}, {merge: true})
                    }
                    else {
                        await setDoc(docRef, {chatList: [...result.data().chatList, {no: result.data().chatList.length + 1,message: message, senderID: userSession.uid, date: date}]}, {merge: true})
                    }
                    chatContainerRef.current?.scrollTo(0, chatContainerRef.current?.scrollHeight)
                    setMessage("")
                }
            })
        }
    }
    
    useEffect(()=> {
        if (selectedChat.chatID == "") return
        const docRef = doc(db, "chats", selectedChat.chatID == "" ? "dummy" : selectedChat.chatID)
        const docRef2 = doc(db, "users", selectedChat.userRecipientID == "" ? "dummy" : selectedChat.userRecipientID)
        getDoc(docRef).then((result) => {
            if (result.exists()) {
                if(result.data().chatList != undefined && result.data().chatList != null) {
                    setChatList(result.data().chatList)
                }
            }
        })
        
        getDoc(docRef2).then((result) => {
            if (result.exists()) {
                setRecepientStatus(result.data().status)
            }
        })

    },[selectedChat])

    useEffect(() => {
        window.addEventListener('beforeunload', () => {
            setDoc(doc(db, 'users', userSession.uid),{status: 'offline'}, {merge: true}).then(() => {
                unsubscribeChats()
                unsubscribeUsers()
            })
        })
    }, [])

    return(
        <div className="w-full bg-[#0b2d39] flex flex-col">
            {
                (selectedChat.chatID == "")
                ?  (<></>)
                :  (
                    <>
                        <div className="h-18 w-full flex flex-row bg-[#171f24] p-2 border-b-2 border-b-gray-800">
                            <img src="/DefaultProfilePic.png" className="w-12 h-12 ml-3" />
                            <div className="flex flex-col ml-5">
                                <span className="text-white font-bold text-lg">{selectedChat.userRecipientName}</span>
                                {
                                    (recipientStatus == 'online')
                                    ?
                                    <div id="userStatus" className="flex flex-row mt-1">
                                        <div className="rounded-full w-2 h-2 bg-green-500 self-center"></div>
                                        <span className="text-green-500 text-sm ml-2">Online</span>
                                    </div>
                                    :
                                    <div id="userStatus" className="flex flex-row mt-1">
                                        <div className="rounded-full w-2 h-2 bg-red-500 self-center"></div>
                                        <span className="text-red-500 text-sm ml-2">Offline</span>
                                    </div>
                                }
                            </div> 
                        </div>
                        <div ref={chatContainerRef} className="grow flex flex-col p-2 overflow-auto">
                            {
                                chatList.length > 0 ?
                                chatList.map((chat, index) => { 
                                    if (chat.senderID == "") return
                                    
                                    const date = chat.date.toDate().getDate()
                                    const month = chat.date.toDate().getMonth() + 1
                                    const year = chat.date.toDate().getFullYear()
                                    const hour = chat.date.toDate().getHours()
                                    const minute = chat.date.toDate().getMinutes()

                                    if (chat.senderID == userSession.uid) {
                                        return (
                                            <div key={chat.no} className="flex flex-col max-w-96 self-end bg-green-900 rounded-lg p-3 m-2">
                                                <span className="text-white">{chat.message}</span>
                                                <div className="self-end"><span className="text-gray-400 text-sm">{date + '/' + month + '/' + year + ' ' + hour + ':' + minute}</span></div>
                                            </div>
                                        )
                                    }
                                    else {
                                        return (
                                            <div key={chat.no} className="flex flex-col max-w-96 self-start bg-[#171f24] rounded-lg p-3 m-2">
                                                <span className="text-white">{chat.message}</span>
                                                <div className="self-end"><span className="text-gray-400 text-sm">{date + '/' + month + '/' + year + ' ' + hour + ':' + minute}</span></div>
                                            </div>
                                        )
                                    }   
                                })
                                :
                                (<></>)
                            }
                        </div>
                        <div ref={containerRef} className="h-20 p-3 w-full flex flex-row bg-[#171f24]">
                            <textarea ref={inputRef} value={message} onChange={(e) => setMessage(e.target.value)} itemType="text" placeholder="Type a message" className="p-1 resize-none h-auto m-auto ml-2 mr-2 w-full rounded-lg pl-5 bg-[#202c33] text-white focus:outline-none" onInput={() => resizeTextArea()}></textarea>
                            <div className="m-auto rounded-full bg-gray-700 z-10 h-10 w-10 pt-1 mr-2 cursor-pointer hover:bg-gray-400" onClick={() => sendMessage()}>
                                <svg viewBox="0 0 24 24" fill="#ffffff" className="w-7 h-7 m-auto" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" strokeWidth="0"></g><g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M11.5003 12H5.41872M5.24634 12.7972L4.24158 15.7986C3.69128 17.4424 3.41613 18.2643 3.61359 18.7704C3.78506 19.21 4.15335 19.5432 4.6078 19.6701C5.13111 19.8161 5.92151 19.4604 7.50231 18.7491L17.6367 14.1886C19.1797 13.4942 19.9512 13.1471 20.1896 12.6648C20.3968 12.2458 20.3968 11.7541 20.1896 11.3351C19.9512 10.8529 19.1797 10.5057 17.6367 9.81135L7.48483 5.24303C5.90879 4.53382 5.12078 4.17921 4.59799 4.32468C4.14397 4.45101 3.77572 4.78336 3.60365 5.22209C3.40551 5.72728 3.67772 6.54741 4.22215 8.18767L5.24829 11.2793C5.34179 11.561 5.38855 11.7019 5.407 11.8459C5.42338 11.9738 5.42321 12.1032 5.40651 12.231C5.38768 12.375 5.34057 12.5157 5.24634 12.7972Z" stroke="#000000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path></g></svg>
                            </div>
                        </div>
                    </> 
                )
            }
            
        </div>
    )
}


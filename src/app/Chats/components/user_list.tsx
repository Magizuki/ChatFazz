'use client'
import { useAtom } from "jotai";
import { userAtom, selectedChatAtom } from '../../jotaiConfigs/user_atom'
import { doc, collection, setDoc, getDocs, getDoc, query, where } from "firebase/firestore"
import { db } from '../../../../firebase'
import { useEffect, useState } from "react";

const UserList = () => {

    const [userSession, setUserSession] = useAtom(userAtom)
    const [selectedChat, setSelectedChat] = useAtom(selectedChatAtom)
    const [userList, setUserList] = useState<any[]>([])

    useEffect(() => {
        setUserList([])
        const docRef = query(collection(db, "users"), where('uid', '!=', userSession.uid))
        getDocs(docRef).then((result) => {
            result.forEach((element) => {
                //console.log(element.id)
                // console.log(userSession.uid)
                if (userList.find((val) => val.uid == element.id) == null) {
                    getDocs(query(collection(db, "chats"), where("User1_ID", "in", [element.id, userSession.uid]), where("User2_ID", "in", [element.id, userSession.uid]))).then(async(result2) => {
                        if (!result2.empty) {
                            result2.forEach((element2) => {
                                if (element2.data().chatList != null) {
                                    setUserList((prev) => ([...prev, {email: element.data().email, name: element.data().name, status: element.data().status, uid: element.data().uid, lastMessage: element2.data().chatList[element2.data().chatList.length - 1].message}]))
                                }
                            })
                        }
                        else {
                            setUserList((prev) => ([...prev, {email: element.data().email, name: element.data().name, status: element.data().status, uid: element.data().uid, lastMessage: ""}]))
                        }
                    })
                }
            })
            
        })
    }, [])

    const changeRecipientChat = async (userRecipientID : string, userRecipientName : string) => {
        console.log(userRecipientID)
        getDocs(query(collection(db, "chats"), where("User1_ID", "in", [userRecipientID, userSession.uid]), where("User2_ID", "in", [userRecipientID, userSession.uid]))).then(async(result) => {
            if (result.empty) {
                const docRef = doc(collection(db, "chats"))
                await setDoc(docRef, {User1_ID: userSession.uid, User1_Name: userSession.username, User2_ID: userRecipientID, User2_Name: userRecipientName})
                const chat = await getDocs(query(collection(db, "chats"), where("User1_ID", "in", [userRecipientID, userSession.uid]), where("User2_ID", "in", [userRecipientID, userSession.uid])))
                if (!chat.empty) {
                    setSelectedChat({chatID: chat.docs[0].id, userSenderID: userSession.uid, userRecipientID: userRecipientID, userRecipientName: userRecipientName})
                }
            }
            else {
                setSelectedChat({chatID: result.docs[0].id, userSenderID: userSession.uid, userRecipientID: userRecipientID, userRecipientName: userRecipientName})
            }
        }) 
    }

    return(
        <div className="bg-[#071e26] w-96 border-r-2 border-r-gray-800">
            <div className="flex flex-col h-full p-5">
                <div className="flex flex-row justify-between h-6">
                    <div>
                        <span className="text-white font-bold text-2xl">Chats</span>
                    </div>
                    <div>
                        <svg fill="#ffffff" className="m-auto w-5 h-5 mt-2" viewBox="0 0 32 32" enableBackground="new 0 0 32 32" id="Glyph" version="1.1" xmlSpace="preserve" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink"><g id="SVGRepo_bgCarrier" strokeWidth="0"></g><g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g><g id="SVGRepo_iconCarrier"><path d="M13,16c0,1.654,1.346,3,3,3s3-1.346,3-3s-1.346-3-3-3S13,14.346,13,16z" id="XMLID_294_"></path><path d="M13,26c0,1.654,1.346,3,3,3s3-1.346,3-3s-1.346-3-3-3S13,24.346,13,26z" id="XMLID_295_"></path><path d="M13,6c0,1.654,1.346,3,3,3s3-1.346,3-3s-1.346-3-3-3S13,4.346,13,6z" id="XMLID_297_"></path></g></svg>
                    </div>
                </div>
                <div className="pt-5 h-16">
                    <input type="text" placeholder="Search" className="w-full h-10 rounded-lg pl-5 bg-[#202c33] text-white focus:outline-none" />
                </div>
                <div className="flex flex-row justify-between mt-1 h-12">
                    <div className="rounded-3xl m-1 bg-[#202c33] p-2 pl-4 pr-4 text-gray-300">
                        <span>All</span>
                    </div>
                    <div className="rounded-3xl m-1 bg-[#202c33] p-2 pl-4 pr-4 text-gray-300">
                        <span>Unread</span>
                    </div>
                    <div className="rounded-3xl m-1 bg-[#202c33] p-2 pl-4 pr-4 text-gray-300">
                        <span>Favorites</span>
                    </div>
                    <div className="rounded-3xl m-1 bg-[#202c33] p-2 pl-4 pr-4 text-gray-300">
                        <span>Groups</span>
                    </div>
                </div>
                <div className="w-full overflow-auto p-3 grow">
                    {
                        userList.map((item) => {
                            return(
                                <div key={item.uid} id={item.uid} className="flex flex-row mb-5 cursor-pointer hover:border hover:border-gray-100 p-3" onClick={() => changeRecipientChat(item.uid, item.name)}>
                                    <img src="/DefaultProfilePic.png" className="m-auto w-12 h-12" />
                                    <div className="flex flex-col grow ml-4">
                                        <span className="text-white text-xl">{item.name}</span>
                                        <span className="text-gray-400 text-sm mt-1">
                                            {
                                                item.lastMessage != "" 
                                                ? (
                                                    item.lastMessage.length > 20 
                                                    ? item.lastMessage.substring(20) + "..."
                                                    : item.lastMessage
                                                ) 
                                                : <></>
                                            }
                                        </span>
                                        <hr className="mt-2 border-gray-500" />
                                    </div>
                                </div>
                            )
                        })
                    }
                </div>
                <div className="h-1"></div>
            </div>
        </div>
    )
}

export default UserList
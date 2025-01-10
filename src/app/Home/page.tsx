'use client'
//import {  } from 'firebase/auth/cordova';
import {auth, GoogleAuthProvider, signInWithPopup, db} from '../../../firebase'
import { useAtom } from "jotai";
import { userAtom } from '../jotaiConfigs/user_atom'
import { useRouter } from "next/navigation";
import { doc, collection, setDoc } from "firebase/firestore"

const page = () => {

    const [userSession, setUserSession] = useAtom(userAtom)
    const router = useRouter()

    const signInWithGoogle = () => {
        const provider = new GoogleAuthProvider();
        console.log(userSession)
        if (userSession.uid != "") {
            const docRef = doc(db, "users", userSession.uid)
            setDoc(docRef, {status: 'online'}, {merge: true}).then(() => {
                router.replace("/Chats")
            })
        }
        else {
            //await signOut(auth)
            signInWithPopup(auth, provider).then(async (result) => {
                console.log('tes login')
                setUserSession({uid : result.user.uid, username : result.user.displayName ? result.user.displayName : ""})
                const docRef = doc(db, "users", result.user.uid)
                await setDoc(docRef, {uid: result.user.uid,name: result.user.displayName ? result.user.displayName : "", email: result.user.email, status: 'online'}, {merge: true})
                // const user = result.user.displayName
                // console.log('User Info:', user)
                router.replace("/Chats")
            }).catch((error) => {
                console.error('Error during Google sign-in:', error.message)
            })
        }
    }

    return (
        <>
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-sky-400 font-extrabold text-5xl">ChatFazz</span>
            <span className="text-white text-3xl font-bold">Your <span className="text-yellow-600">Reliable</span> and <span className="text-purple-500">Simple</span>  Messaging System</span>
            <div className="self-center"><button className="flex bg-blue-800 rounded-lg text-xl text-white font-extrabold text-center p-5 hover:bg-blue-600 cursor-pointer" onClick={signInWithGoogle}>
                <img src="/icons8-google.png" className="mr-5" width={'30'} height={'30'} />Sign In With Google</button>
            </div>
        </>
    )
}

export default page
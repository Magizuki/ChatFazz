import { atom } from "jotai";

export const userAtom = atom({uid:"", username:""});
export const selectedChatAtom = atom({chatID:"", userSenderID: "", userRecipientID: "", userRecipientName: ""});
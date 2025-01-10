import { ChatDisplay } from "./components/chat_display"
import Sidebar from "./components/sidebar"
import UserList from "./components/user_list"

const page = () => {

    return(
        <>
            <Sidebar />
            <UserList />
            <ChatDisplay />
        </>
    )

}

export default page
import { useState} from 'react'
import axios from 'axios'
import { BASE_URL } from '../helper';

const MsgInput = ({ user, selectedUser, getUserMessages, getSelectedUsersMessages }) => {
    const BASEURL = `${BASE_URL}` || 'http://localhost:8000';
    const [textArea, setTextArea] = useState("")
    const userId = user?.user_id
    const selectedUserId = selectedUser?.user_id

    const addMessage = async () => {
        const message = {
            timestamp: new Date().toISOString(),
            from_userId: userId,
            to_userId: selectedUserId,
            message: textArea
        }

        console.log(" this is message:" , message);

        try {
            await axios.post(`${BASEURL}/message`, { message })
            getUserMessages()
            getSelectedUsersMessages()
            setTextArea("")
        } catch (error) {
            console.log(error)
        }
    }

    
    return (
        <div className="msg-input">
            <textarea value={textArea} onChange={(e) => setTextArea(e.target.value)}/>
            <button className="form-submit-btn " onClick={addMessage}>Submit</button>
        </div>
    )
  
}

export default MsgInput
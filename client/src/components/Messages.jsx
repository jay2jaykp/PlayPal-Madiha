import { BASE_URL } from '../helper';

const Messages = ({ descendingOrderMessages }) => {
  const BASEURL = `${BASE_URL}` || 'http://localhost:8000';
  return (
    <>
      <div className="msgDisplay">
        {descendingOrderMessages.map((message, _index) => (
          <div key={_index}>
            <div className="chat-message-header">
              <div className="img-container">
            <img src={`${BASEURL}/${message.img} `} alt={message.name + ' profile'} />
                <p>{message.name}</p>
              </div>
            </div>
            <p className="messages">{message.message}</p>
          </div>
        ))}
      </div>
    </>
  )

}

export default Messages
import './App.css';
import io from 'socket.io-client';
import Chat from './Chat';
const { useState, useEffect } = require('react');
const socket = io.connect('http://localhost:5000');

function App() {
  const [username, setUsername] = useState("");
  const [room, setRoom] = useState("");
  const [joined, setJoined] = useState(false);

  const joinRoom = () => {
    if (username !== "" && room !== "") {
      socket.emit('join-room', room);
      setJoined(true);
    }
  }

  return (
    <div className="App">
      {!joined ? (
        <>
          <div className='userDetails'>
            <h1 className='welcome'>Welcome to chat application</h1>
            <div className='userHeader'>
              <p>Enter your details</p>
            </div>
            <div className='userInput'>
              <input type="text" id="username" placeholder="Enter username" onChange={(e) => { setUsername(e.target.value); }} />
            </div>
            <div className='userrRoomid'>
              <input type="text" id="roomid" placeholder="Enter room" onChange={(e) => { setRoom(e.target.value); }} />
            </div>
            <button className='btn-submit' onClick={joinRoom}>Join Room</button>
          </div>
        </>
      ) : (
      <Chat socket={socket} username={username} room={room} />
      )}
    </div>
  );
}

export default App;

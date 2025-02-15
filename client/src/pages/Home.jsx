import React, { useState } from 'react'
import {v4 as uuidV4} from 'uuid';
import { useNavigate } from 'react-router-dom';
const Home = () => {

  const navigate = useNavigate();
  const [roomId,  setRoomId] = useState('');
  const [username, setUsername] = useState('');
  const createNewRoom = (e) => {
    const id = uuidV4();
    setRoomId(id);
    console.log(id);
  }
  const joinRoom = () => {
    if (!roomId || !username) {
        toast.error('ROOM ID & username is required');
        return;
    }

    // Redirect
    navigate(`/room/${roomId}`, {
        state: {
            username,
        },
    });
};

const handleInputEnter = (e) => {
    if (e.code === 'Enter') {
        joinRoom();
    }
};

  // createNewRoom();
  return (
    <div className='flex bg-black flex-col w-full h-screen align-center items-center justify-center'>
      <div className="bg-blue-900 flex flex-col w-3/6 h-56 justify-center items-center">
         <div className="flex flex-col justify-center items-center">
            <input type="text" className='gap-5px mb-4 h-10 text-black' placeholder='Room ID' onChange={(e) => setRoomId(e.target.value)} value={roomId}/>
            <input type="text" className='gap-5px mb-4 h-10 text-black' placeholder='UserName' onChange={(e) => setUsername(e.target.value)} value={username}/>
            <button className='bg-green-400 rounded-xl w-20 h-9' onClick={joinRoom}>Join</button>

            <span className="createInfo">
                        If you don't have an invite then create &nbsp;
                        <a
                            onClick={createNewRoom}
                            href=""
                            className="createNewBtn"
                        >
                            new room
                        </a>
                    </span>
         </div>
      </div>
    </div>
  )
}

export default Home
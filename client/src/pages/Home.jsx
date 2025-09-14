import React, { useState, useEffect } from 'react'
import {v4 as uuidV4} from 'uuid';
import { useNavigate } from 'react-router-dom';
import { useSocket } from '../context/SocketContext';
const Home = () => {


  const { initSocket } = useSocket();
  const navigate = useNavigate();
  const [roomId,  setRoomId] = useState('');
  const [username, setUsername] = useState('');

  // Pre-warm the socket connection on component mount
  useEffect(() => {
    initSocket();
  }, [initSocket]);

  const createNewRoom = (e) => {
    e.preventDefault();
    const id = uuidV4();
    setRoomId(id);
    console.log(id);
  }

  const joinRoom = () => {
    if (!roomId || !username) {
        // toast.error('ROOM ID & username is required'); // You'll need to import toast
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
      <div className="flex bg-black flex-col w-full h-screen align-center items-center justify-center">
  <div className="relative p-8 rounded-2xl w-full max-w-md border border-white/10 bg-gray-900/20 backdrop-blur-lg shadow-xl shadow-black/30 hover:shadow-white/10 transition-shadow duration-300">
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-cyan-400">
        Code Collab
      </h1>
      
      <div className="flex flex-col gap-4">
        <input 
          type="text" 
          className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 focus:border-cyan-400/50 focus:outline-none focus:bg-white/10 transition-all duration-200 placeholder:text-gray-400 text-white"
          placeholder="Room ID"
          onChange={(e) => setRoomId(e.target.value)}
          value={roomId}
          onKeyUp={handleInputEnter}
        />
        
        <input 
          type="text" 
          className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 focus:border-cyan-400/50 focus:outline-none focus:bg-white/10 transition-all duration-200 placeholder:text-gray-400 text-white"
          placeholder="Username"
          onChange={(e) => setUsername(e.target.value)}
          value={username}
          onKeyUp={handleInputEnter}
        />
        
        <button 
          className="w-full py-3 px-6 bg-gradient-to-r from-green-400 to-cyan-500 rounded-lg font-semibold text-gray-900 hover:scale-[1.02] transition-transform duration-200 active:scale-95 shadow-md hover:shadow-lg shadow-green-400/20 hover:shadow-cyan-400/30"
          onClick={joinRoom}
        >
          Join Room
        </button>
      </div>

      <p className="text-center text-gray-400 text-sm">
        Don't have an ID? {' '}
        <button 
          onClick={createNewRoom}
          className="text-cyan-400 hover:text-cyan-300 underline underline-offset-2 transition-colors duration-200"
        >
          Create New Room
        </button>
      </p>
    </div>

    {/* Subtle glowing effect */}
    <div className="absolute inset-0 -z-10 rounded-2xl bg-radial-gradient from-green-400/20 to-transparent opacity-20" />
  </div>
   </div>
    </div>
  )
}

export default Home
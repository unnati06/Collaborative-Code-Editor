import React, { useEffect, useRef, useState } from 'react';
import { useSocket } from '../context/SocketContext';
import { useParams, useLocation, useNavigate, Navigate } from "react-router-dom";
import toast from 'react-hot-toast';
import Editor from '../components/Editor';
import Clients from '../components/Clients';

const EditorPage = () => {
    const { socket, connectionStatus, isConnected } = useSocket();
    const { roomId } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const [clients, setClients] = useState([]);
    const [code, setCode] = useState(''); // Replace codeRef with state

    useEffect(() => {
        if (connectionStatus === 'error') {
            toast.error('Connection failed. Reconnecting...');
            navigate('/');
        }
    }, [connectionStatus, navigate]);

    useEffect(() => {
        if (!socket || !isConnected) return;

        const handleJoined = ({ clients, username, socketId }) => {
            const currentUser = location.state?.username || 'Guest';
            if (username !== currentUser) {
                toast.success(`${username} joined`);
            }
            setClients(clients);
            if (currentUser === clients[0]?.username) { // Host syncs
                socket.emit('code-sync', { socketId, code });
            }
        };

        const handleCodeSync = ({ code }) => {
            setCode(code); // Update code state
        };

        const handleCodeUpdate = ({ code }) => {
            setCode(code); // Update code state
        };

        const handleUserLeft = ({ username }) => {
            toast.success(`${username} left`);
            setClients(prev => prev.filter(c => c.username !== username));
        };

        socket.emit('join-room', {
            roomId,
            username: location.state?.username || 'Guest'
        });

        socket.on('joined', handleJoined);
        socket.on('code-sync', handleCodeSync);
        socket.on('code-update', handleCodeUpdate);
        socket.on('user-left', handleUserLeft);

        return () => {
            socket.off('joined', handleJoined);
            socket.off('code-sync', handleCodeSync);
            socket.off('code-update', handleCodeUpdate);
            socket.off('user-left', handleUserLeft);
            socket.emit('leave-room', { roomId });
        };
    }, [socket, isConnected, roomId, location.state]);

    if (!isConnected) {
        return <div className="loading">Connecting to collaborative session...</div>;
    }

    return (
        <div className="editor-page flex bg-pink-950 w-full h-screen">
            <div className="flex flex-row w-full h-screen bg-[#282C34]">
                <aside className="sidebar flex flex-col w-56 h-screen bg-gray-800">
                    <div className="header flex flex-col mt-10">
                        <h2 className='font-sans text-3xl mb-4'>Code Collab</h2>
                        <p className='font-sans text-lg mb-4'>Room ID: {roomId}</p>
                    </div>
                    <Clients clients={clients} />
                    <div className="flex flex-col h-full">
                        <div className="action-button flex flex-col mt-auto mb-0">
                            <button onClick={() => navigator.clipboard.writeText(roomId)} className="copy-btn w-full h-10 bg-blue-900">
                                Copy Room ID
                            </button>
                            <button onClick={() => navigate('/')} className="leave-btn w-full h-10 bg-blue-700">
                                Leave Room
                            </button>
                        </div>
                    </div>
                </aside>
                <main className="editor-container">
                    <Editor
                        roomId={roomId}
                        onCodeChange={(newCode) => {
                            setCode(newCode);
                            socket.emit('code-change', { roomId, code: newCode });
                        }}
                        initialCode={code}
                    />
                </main>
            </div>
        </div>
    );
};

export default EditorPage;
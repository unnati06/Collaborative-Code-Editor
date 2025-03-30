import React, { useEffect, useState } from 'react';
import { useSocket } from '../context/SocketContext';
import { useParams, useLocation, useNavigate } from "react-router-dom";
import toast from 'react-hot-toast';
import Editor from '../components/Editor';
import Clients from '../components/Clients';

const EditorPage = () => {
    const { socket, connectionStatus, isConnected } = useSocket();
    const { roomId } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const [clients, setClients] = useState([]);
    const [code, setCode] = useState('');
    const [output, setOutput] = useState(''); // Store execution output/errors

    useEffect(() => {
        if (connectionStatus === 'error') {
            toast.error('Connection failed. Reconnecting...');
            navigate('/');
        }
    }, [connectionStatus, navigate]);

    useEffect(() => {
        if (!socket || !isConnected) return;

        const handleJoined = ({ clients, username, socketId }) => {
            console.log("Clients received:", clients); // Debug here
            const currentUser = location.state?.username || 'Guest';
            if (username !== currentUser) toast.success(`${username} joined`);
            setClients(clients);
            if (currentUser === clients[0]?.username) {
                socket.emit('code-sync', { socketId, code });
            }
        };

        socket.on('code-sync', ({ code }) => setCode(code));
        socket.on('code-update', ({ code }) => setCode(code));
        socket.on('joined', handleJoined);
        socket.on('user-left', ({ username }) => {
            toast.success(`${username} left`);
            setClients(prev => prev.filter(c => c.username !== username));
        });

        socket.emit('join-room', { roomId, username: location.state?.username || 'Guest' });

        return () => {
            socket.off('joined');
            socket.off('code-sync');
            socket.off('code-update');
            socket.off('user-left');
            socket.emit('leave-room', { roomId });
        };
    }, [socket, isConnected, roomId, location.state]);

    // Function to run the code
    const runCode = () => {
        setOutput(''); // Clear previous output
        try {
            // Redirect console.log to capture output
            const logs = [];
            const originalConsoleLog = console.log;
            console.log = (...args) => logs.push(args.join(' '));

            // Execute the code in a safe sandbox
            const result = new Function(code)();
            console.log = originalConsoleLog; // Restore console.log

            // Display output
            const outputText = logs.length > 0 ? logs.join('\n') : 
                             result !== undefined ? String(result) : 'No output';
            setOutput(outputText);
        } catch (error) {
            setOutput(`Error: ${error.message}`); // Display errors for debugging
        }
    };

    if (!isConnected) return <div className="loading">Connecting...</div>;

    return (
        <div className="editor-page flex bg-pink-950 w-full h-screen">
            <div className="flex flex-row w-full h-screen bg-[#282C34]">
                <aside className="sidebar flex flex-col w-56 h-screen bg-gray-800">
                    <div className="header flex flex-col mt-10">
                        <h2 className="font-sans text-3xl mb-4">Code Collab</h2>
                        <p className="font-sans text-lg mb-4">Room ID: {roomId}</p>
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
                <main className="flex flex-col flex-1">
                    <div className="editor-container flex-1">
                        <Editor
                            roomId={roomId}
                            onCodeChange={(newCode) => {
                                setCode(newCode);
                                socket.emit('code-change', { roomId, code: newCode });
                            }}
                            initialCode={code}
                        />
                    </div>
                    <div className="controls flex justify-end p-2 bg-gray-900">
                        <button onClick={runCode} className="run-btn h-10 px-4 bg-green-600 text-white">
                            Run Code
                        </button>
                    </div>
                    <div className="output-container p-2 bg-gray-800 text-white h-1/4 overflow-auto">
                        <pre>{output || 'Output will appear here...'}</pre>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default EditorPage;
import React, { useEffect, useState } from 'react';
import axios from 'axios'; // + Add axios
import { useSocket } from '../context/SocketContext';
import { useParams, useLocation, useNavigate } from "react-router-dom";
import toast from 'react-hot-toast';
import Editor from '../components/Editor';
import Clients from '../components/Clients';

// A simple language selector component
const LanguageSelector = ({ language, onSelect }) => {
    const languages = ['javascript', 'python', 'cpp', 'java'];
    return (
        <div className="language-selector text-white p-2 bg-gray-900 flex items-center gap-2">
            <label htmlFor="language">Language:</label>
            <select
                id="language"
                value={language}
                onChange={(e) => onSelect(e.target.value)}
                className="bg-gray-700 p-1 rounded"
            >
                {languages.map(lang => (
                    <option key={lang} value={lang}>{lang}</option>
                ))}
            </select>
        </div>
    );
};

const EditorPage = () => {
    const { socket, connectionStatus, isConnected } = useSocket();
    const { roomId } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const [clients, setClients] = useState([]);
    const [code, setCode] = useState('');
    const [language, setLanguage] = useState('javascript'); // + Add language state
    const [output, setOutput] = useState(''); // Store execution output/errors

    useEffect(() => {
        if (connectionStatus === 'error') {
            toast.error('Connection failed. Reconnecting...');
            navigate('/');
        }
    }, [connectionStatus, navigate]);

    useEffect(() => {
        if (!socket || !isConnected) return;

        // + Listen for language updates from others
        const handleLanguageUpdate = ({ language: newLanguage }) => {
            setLanguage(newLanguage);
        };

        // + When we get the initial code, also get the language
        const handleCodeSync = ({ code: initialCode, language: initialLanguage }) => {
            setCode(initialCode || '');
            setLanguage(initialLanguage || 'javascript');
        };

        const handleJoined = ({ clients, username, socketId }) => {
            console.log("Clients received:", clients); // Debug here
            const currentUser = location.state?.username || 'Guest';
            if (username !== currentUser) toast.success(`${username} joined`);
            setClients(clients);
            if (currentUser === clients[0]?.username) {
                socket.emit('code-sync', { socketId, code, language });
            }
        };

        socket.on('language-update', handleLanguageUpdate);
        socket.on('code-sync', handleCodeSync);
        socket.on('code-update', ({ code }) => setCode(code));
        socket.on('joined', handleJoined);
        socket.on('user-left', ({ username }) => {
            toast.success(`${username} left`);
            setClients(prev => prev.filter(c => c.username !== username));
        });

        socket.emit('join-room', { roomId, username: location.state?.username || 'Guest' });

        return () => {
            socket.off('language-update', handleLanguageUpdate);
            socket.off('code-sync', handleCodeSync);
            socket.off('code-update');
            socket.off('joined');
            socket.off('user-left');
            socket.emit('leave-room', { roomId });
        };
    }, [socket, isConnected, roomId, location.state, code, language]);


    // + Handler to change language and notify others
    const handleLanguageChange = (newLanguage) => {
        setLanguage(newLanguage);
        socket.emit('language-change', { roomId, language: newLanguage });
    };

    // Function to run the code securely via backend
    const runCode = async () => {
        setOutput('Executing...');
        try {
            const { data } = await axios.post('https://collaborative-code-editor-2jnc.onrender.com/execute', {
                language,
                code,
            });

            let result = '';
            if (data.stdout) {
                result = data.stdout;
            } else if (data.stderr) {
                result = `Error: ${data.stderr}`;
            } else if (data.compile_output) {
                result = `Compile Error: ${data.compile_output}`;
            } else {
                result = 'Execution finished with no output.';
            }
            setOutput(result);
        } catch (error) {
            setOutput(`Error: ${error.response?.data?.error || error.message}`);
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
                    {/* + Add the language selector */}
                    <LanguageSelector language={language} onSelect={handleLanguageChange} />
                    <div className="editor-container flex-1">
                        <Editor
                            roomId={roomId}
                            language={language} // + Pass language as a prop
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
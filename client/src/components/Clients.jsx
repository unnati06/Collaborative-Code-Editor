import React from 'react';
import Avatar, { genConfig } from 'react-nice-avatar';

const Clients = ({ clients }) => {
    return (
        <div className="clients-list">
            {clients.map((client) => {
                const config = genConfig(); // Unique avatar config for each client
                return (
                    <div key={client.socketId} className="client flex items-center mb-2">
                        <Avatar className="w-12 h-12 ml-3" {...config} />
                        <span className="username ml-3 text-white">{client.username}</span>
                    </div>
                );
            })}
        </div>
    );
};

export default Clients;
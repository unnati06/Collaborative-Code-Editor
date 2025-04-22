import React, { useMemo } from 'react';
import Avatar, { genConfig } from 'react-nice-avatar';

const Clients = ({ username }) => {
    // Memoize the config based on username
    const config = useMemo(() => genConfig(username), [username]);

    return (
        <div className="client flex flex-col items-center gap-2">
            <Avatar 
                className="w-16 h-16 rounded-full border-2 border-white shadow-lg transition-all hover:scale-110"
                {...config} 
            />
            <span className="text-gray-200 font-medium text-sm">
                {username}
            </span>
        </div>
    );
};

export default Clients;
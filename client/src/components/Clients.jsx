import React from 'react';
import Avatar, { genConfig } from 'react-nice-avatar'

const Clients = ({ username }) => {
    const config = genConfig() 
    console.log(username);
    return (
        <div className="client">
           <Avatar className="w-16 h-16 ml-3" {...config} />
            {/* <img src="" alt="user" /> */}
            <span className="userName">{username}</span>
        </div>
    );
};

export default Clients;
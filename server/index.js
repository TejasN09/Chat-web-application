const express = require('express');
const app = express();
const port = process.env.PORT || 5000;
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');
// import stringifyObject from 'stringify-object';
// require = require('esm')(module)

// const stringifyObject = require('stringify-object');
// import stringifyObject from 'stringify-object'


app.use(cors());
const sever = http.createServer(app);
const io = new Server(sever, {
    cors: {
        origin: 'http://localhost:3000',
        methods: ['GET', 'POST']
    }
});

io.on('connection', (socket) => {
    console.log(`user connected : ${socket.id}`);

    socket.on('join-room', (roomId) => {
        socket.join(roomId);
        console.log(`User joined roomid ${roomId}`);
    })

    socket.on('send-message', (message) => {
        socket.to(message.room).emit('receive-message', message);
    });

    socket.on('receive-message', (message) => {
        setMessageList((list) => [...list, message]);
    });

    socket.on('disconnect', () => {
        console.log('User disconnected');
    });
});


sever.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});


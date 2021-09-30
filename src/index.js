const express = require('express');
const path = require('path');
const http = require('http');
const socketio = require('socket.io');
const Filter = require('bad-words');

const { generateMessage, generateLocationMessage } = require('./utils/messages');
const { addUser, removeUser, getUser, getUserInRoom } = require('./utils/users');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

const port = process.env.PORT || 3000;

const publicRoute = path.join(__dirname, '../public');

app.use(express.static(publicRoute));

// Example 1
/*let count = 0;

// Server(emit) -> client (receive) - countUpdated
// client(emit) -> server (receive) - increment 

io.on('connection', (socket) => {
    console.log('New WebSocket connection');

    socket.emit('countUpdated', count);

    socket.on('increment', () => {
        count++;
        // Informa solo a la conexión que generó el evento
        //socket.emit('countUpdated', count);

        // Informa a todas las conexiones
        io.emit('countUpdated', count);
    })
})*/

io.on('connection', (socket) => {
    //socket.emit('message', 'Welcome!');
    /* socket.emit('message', generateMessage('Welcome!'));
    socket.broadcast.emit('message', generateMessage('A new user has joined')); */

    socket.on('join', (options, callback) => {
        const { error, user } = addUser({ id: socket.id, ...options })

        if (error) {
            return callback(error)
        }

        // Para conectarse a una sala en especifico
        socket.join(user.room);

        socket.emit('message', generateMessage('Admin', 'Welcome!'));
        socket.broadcast.to(user.room).emit('message', generateMessage(`${user.username} has joined!`));
        io.to(user.room).emit('roomData', {
            room: user.room,
            users: getUserInRoom(user.room)
        })

        callback()
    })

    socket.on('sendMessage', (message, callback) => {
        const filter = new Filter();
        const user = getUser(socket.id)


        if (filter.isProfane(message)) {
            return callback(null, 'Profanity is not allowed');
        }

        if (user) {
            io.to(user.room).emit('message', generateMessage(user.username, message))
        }

        //io.emit('message', generateMessage(message))
        callback('Siuuuuu', null);
    })

    socket.on('sendLocation', (data, callback) => {
        const user = getUser(socket.id)

        if (user) {
            io.to(user.room).emit('locationMessage', generateLocationMessage(user.username, `https://google.com/maps?q=${data.latitude},${data.longitude}`))
        }

        //io.emit('locationMessage', generateLocationMessage(`https://google.com/maps?q=${data.latitude},${data.longitude}`));
        callback();
    })

    socket.on('disconnect', () => {
        const user = removeUser(socket.id)

        if (user) {
            io.to(user.room).emit('message', generateMessage('Admin', `${user.username} has left!`))
            io.to(user.room).emit('roomData', {
                room: user.room,
                users: getUserInRoom(user.room)
            })
        }
        //io.emit('message', generateMessage('A user has left!'));
    })
})

server.listen(port, () => {
    console.log(`App listen on port ${port}`)
})
const path = require('path')
const http = require('http')
const express = require('express')
const socketio = require('socket.io')
const Filter = require('bad-words')
const { generateMessage, generateLocationMessage } = require('./utils/messages')
const { addUser, getUser, getUsersInRoom, removeUser } = require('./utils/users')
const public = path.join(__dirname, '../public')

const app = express()
const port = process.env.PORT || 3000
const server = http.createServer(app)
const io = socketio(server)

io.on('connection', (socket) => {
    console.log('new websocket connection')
    socket.emit('message', generateMessage('Admin', 'Welcome!'))
    socket.on('join', (options, callback) => {
        const { error, user } = addUser({ id: socket.id, ...options })
        if (error) {
            return callback(error)
        }

        socket.join(user.room)
        socket.broadcast.to(user.room).emit('message', generateMessage(user.username, `${user.username} has joined!`))
        io.to(user.room).emit('roomData', {
            room: user.room,
            users: getUsersInRoom(user.room)
        })
        callback()
    })
    socket.on('message', (message, callback) => {
        const user = getUser(socket.id)
        const filter = new Filter()

        if (filter.isProfane(message)) {
            return callback('Profanity is not allowed')
        }

        io.to(user.room).emit('message', generateMessage(user.username, message))
        callback('')
    })
    socket.on('disconnect', () => {
        const user = removeUser(socket.id)

        if (user) {
            io.to(user.room).emit('message', generateMessage('Admin', `${user.username} has gone!`))
            io.to(user.room).emit('roomData', {
                room: user.room,
                users: getUsersInRoom(user.room)
            })
        }

    })
    socket.on('sendLocation', (position, callback) => {
        const user = getUser(socket.id)

        const url = `https://www.openstreetmap.org/#map=18/${position.lat}/${position.lng}`
        io.to(user.room).emit('locationMessage', generateLocationMessage(user.username, url))
        callback('Location received.')
    })
})

app.use(express.static(public))

app.get('*', (req, res) => {
    res.render(public)
})

server.listen(port, () => {
    console.log(`Running on localhost:${port} 🦁 ` )
})

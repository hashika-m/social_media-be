// // socket io is used to create a custom server for http req and res
// // to become bidirectional server

import http from "http"
import express from "express"
import { Server } from "socket.io"

const app = express()
const server = http.createServer(app)

const io = new Server(server, {
    cors: {
        origin:"https://cerulean-tulumba-a25f72.netlify.app",
        methods: ["GET", "POST"],
        credentials:true
    }
})
const userSocketMap = {}  //userId:socketId

export const getSocketId=(receiverId)=>{
    return userSocketMap[receiverId]
}

io.on('connection', (socket) => {
    const userId = socket.handshake.query.userId
    console.log('USer connected',userId)
    if (userId != undefined) {
        userSocketMap[userId] = socket.id
    }
    // getting all onlie users
    io.emit('getOnlineUsers', Object.keys(userSocketMap))

    socket.on('disconnect', () => {
        delete userSocketMap[userId]
        io.emit('getOnlineUsers', Object.keys(userSocketMap))

    })
})

export { app, io, server }
// ---------------------------------------------old fiexd part
// socket io is used to create a custom server for http req and res
// to become bidirectional server

// import http from "http"
// import express from "express"
// import { Server } from "socket.io"

// const app = express()
// const server = http.createServer(app)

// const io = new Server(server, {
//     cors: {
//         origin: "http://localhost:5173",
//         methods: ["GET", "POST"]
//     }
// })
// const userSocketMap = {}  //userId:socketId
// io.on('connection', (socket) => {
//     const userId = socket.handshake.query.userId
//     if (userId != undefined) {
//         userSocketMap[userId] = socket.id
//     }
//     // getting all onlie users
//     io.emit('getOnlineUsers', Object.keys(userSocketMap))

//     socket.on('disconnect', () => {
//         delete userSocketMap[userId]
//         io.emit('getOnlineUsers', Object.keys(userSocketMap))

//     })
// })

// export { app, io, server }


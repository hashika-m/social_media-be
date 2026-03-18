import express from 'express'
import dotenv from 'dotenv'
import connectDB from './config/db.js'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import authRouter from './routes/authRoute.js'
import userRouter from './routes/userRoute.js'
import postRouter from './routes/postRoute.js'
import loopRouter from './routes/loopRoute.js'
import storyRouter from './routes/storyRoute.js'
import messageRouter from './routes/messageRoute.js'



// mongodb atlas connection
import dns from 'node:dns/promises'
import { app, server } from './socket.js'





dotenv.config()
// mongodb atlas connection 
dns.setServers(['8.8.8.8', '8.8.4.4']);
 connectDB()
// const app=express()
// socket io app


const PORT=process.env.PORT ||8000


// // middleware
// app.use(cors())
// app.use(cors({
//     origin:process.env.FRONTEND_URL,
//     credentials:true
// }))

// allow frontend URL with credentials
const corsOptions = {
    origin: process.env.FRONTEND_URL, // Netlify URL
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
};

app.use(cors(corsOptions));

// handle preflight requests for all routes
app.options("*", cors(corsOptions));
app.use(express.json())
app.use(cookieParser())




// api endpints
app.use('/api/auth',authRouter)
app.use('/api/user',userRouter)
app.use('/api/post',postRouter)
app.use('/api/loop',loopRouter)
app.use('/api/story',storyRouter)
app.use('/api/message',messageRouter)


app.get('/',(req,res)=>{
    console.log('api endpoint from index.js')
    res.send('Api enpoint from index.js')
})

server.listen(PORT,(req,res)=>{
   
    console.log(`Server is listening from ${PORT}`)
})
// --------------------------------------------------------without socket
// import express from 'express'
// import dotenv from 'dotenv'
// import connectDB from './config/db.js'
// import cookieParser from 'cookie-parser'
// import cors from 'cors'
// import authRouter from './routes/authRoute.js'
// import userRouter from './routes/userRoute.js'
// import postRouter from './routes/postRoute.js'
// import loopRouter from './routes/loopRoute.js'
// import storyRouter from './routes/storyRoute.js'
// import messageRouter from './routes/messageRoute.js'



// // mongodb atlas connection
// import dns from 'node:dns/promises'
// import { app, server } from './socket.js'

// dotenv.config()
// // mongodb atlas connection 
// dns.setServers(['8.8.8.8', '8.8.4.4']);
//  connectDB()
// // const app=express()
// // socket io app


// const PORT=process.env.PORT ||8000


// // // middleware
// // app.use(cors())
// app.use(cors({
//     origin:'http://localhost:5173',
//     credentials:true
// }))
// app.use(express.json())
// app.use(cookieParser())




// // api endpints
// app.use('/api/auth',authRouter)
// app.use('/api/user',userRouter)
// app.use('/api/post',postRouter)
// app.use('/api/loop',loopRouter)
// app.use('/api/story',storyRouter)
// app.use('/api/message',messageRouter)


// app.get('/',(req,res)=>{
//     console.log('api endpoint from index.js')
//     res.send('Api enpoint from index.js')
// })

// app.listen(PORT,(req,res)=>{
   
//     console.log(`Server is listening from ${PORT}`)
// })


const express = require('express')
const app = express();
require('dotenv').config();
const cookieParser = require('cookie-parser')
const jwt = require('jsonwebtoken')
const websocketConnection = require('./websockets/webSocketConnection')
//websocket
const ws = require('ws');

//setting cors
const cors = require('cors');
app.use(cors({
  credentials: true,
  origin: process.env.CLIENT_URL,
}))

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use('/uploads', express.static(__dirname + '/uploads'))


app.get("/", function (req, res) {
  res.send("Server working!")
})


const userRoutes = require('./routes/userRoutes')
const messageRoutes = require('./routes/messageRoutes')
app.use('/api/users', userRoutes)
app.use('/api', messageRoutes)



//database connection
const { dbConnection } = require('./database/dbConnection');


const port = process.env.PORT;
function startServer() {
  return app.listen(port, function () {
    console.log(`Server running at port :: ${port}`);
  })
}


(async function () {
  try {
    await dbConnection();
    const server = startServer();


    //this is the websocket part..
    websocketConnection(server);


    // const wss = new ws.WebSocketServer({ server });
    // wss.on('connection', (connection, req) => {
    //   const cookies = req.headers.cookie;
    //   if (cookies) {
    //     //there can be many cookies
    //     const tokenString = cookies.split(',').find(str => str.startsWith("jwtToken="))
    //     if (tokenString) {
    //       const token = tokenString.split('=')[1];
    //       if (token) {
    //         jwt.verify(token, process.env.JWT_SECRET, {}, (error, data) => {
    //           if (error) throw error;
    //           const { userId, username } = data;
    //           connection.userId = userId;
    //           connection.username = username;
    //         });

    //       }
    //     }
    //   }

    //   [...wss.clients].forEach(client => {
    //     client.send(JSON.stringify(
    //       { online: [...wss.clients].map(c => ({ userId: c.userId, username: c.username })) }
    //     ))
    //   })
    // })



  }
  catch (error) {
    console.log(`Failed to connect to database :: ${error}`)
  }
})();







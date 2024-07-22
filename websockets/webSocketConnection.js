const ws = require('ws');
const jwt = require('jsonwebtoken')
const messageModel = require('../models/messageModel')
const fs = require('fs')
const path = require('path');
const { log } = require('console');

function websocketConnection(server) {
    const wss = new ws.WebSocketServer({ server });
    wss.on('connection', (connection, req) => {

        //notify everyone about active people
        function notifyAboutOnlinePeople() {
            [...wss.clients].forEach(client => {
                client.send(JSON.stringify(
                    { online: [...wss.clients].map(c => ({ userId: c.userId, username: c.username })) }
                ))
            })
        }

        connection.isAlive = true;
        connection.timer = setInterval(() => {
            connection.ping();
            connection.deathTimer = setTimeout(() => {
                connection.isAlive = false;
                clearInterval(connection.timer)
                connection.terminate();
                notifyAboutOnlinePeople();
                console.log("dead");

            }, 1000)
        }, 5000)

        connection.on('pong', () => {
            clearTimeout(connection.deathTimer)
        })


        //read username and id from cookie
        const cookies = req.headers.cookie;
        if (cookies) {
            //there can be many cookies
            const tokenString = cookies.split(',').find(str => str.startsWith("jwtToken="))
            if (tokenString) {
                const token = tokenString.split('=')[1];
                if (token) {
                    jwt.verify(token, process.env.JWT_SECRET, {}, (error, data) => {
                        if (error) throw error;
                        const { userId, username } = data;
                        connection.userId = userId;
                        connection.username = username;
                    });

                }
            }
        }



        //when a client sends a message to the web socket server, 'message' event gets triggered and the callback function gets invoked.
        connection.on('message', async (message) => {
            const messageData = JSON.parse(message.toString());
            const { recipient, text, file } = messageData;
            
            let filename = null;

            if (file) {
                console.log('size', file.data.length);
                const parts = file.name.split('.');
                const ext = parts[parts.length - 1];
                filename = Date.now() + '.'+ext;
                const filepath = path.join(__dirname, '..', 'uploads', filename);

                const bufferData = Buffer.from(file.data.split(',')[1], 'base64');

                fs.writeFile(filepath, bufferData, (err) => {
                    if(err){
                        console.log("File save error :: ", err)
                    }
                    else{
                        console.log("File save successful :: ", filepath)
                    }
                })
            }
            if (recipient && (text || file)) {

                //adding to db
                const messageDocument = await messageModel.create({
                    sender: connection.userId,
                    recipient,
                    text,
                    file: file ? filename : null 
                });
                
                console.log("file created")

                //find the recipient client from websocket clients..
                //find returns one value, and it is possible that a user is logged in both phone and laptop which means for the same user there will be two clients in web socket server, hence we use filter to get multiple clients.


                const recipientClients = [...wss.clients].filter((client) => client.userId === recipient);
                recipientClients.forEach((client) => client.send(
                    JSON.stringify(
                        {
                            text: messageData.text,
                            sender: connection.userId,
                            recipient: recipient,
                            file: file ? filename : null,
                            id: messageDocument._id,

                        }
                    )
                ))
            }
        });





        //sending each client a message, this message contains the list of all the online users(their userId and username)
        notifyAboutOnlinePeople();

        /* The code iterates through all connected clients.
        It sends a message to each client with a list of all online users, including their userId and username.
*/

    })

    wss.on('close', (data) => {
        console.log("Disconnected", data)
    })


}



module.exports = websocketConnection;
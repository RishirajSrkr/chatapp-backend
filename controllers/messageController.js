const messageModel = require('../models/messageModel')
const jwt = require('jsonwebtoken')
const token_secret = process.env.JWT_SECRET


async function getMessage(req, res) {
    //req.params contains the selected UserId
    const { userId } = req.params;
    //fetch logged in user's id from the cookies
    const token = req.cookies.jwtToken;
    if (token) {
        jwt.verify(token, token_secret, {}, async (error, data) => {
            if (error) {
                return res.status(401).json({ message: "Cannot fetch user data from cookies." })
            }

            //else if we have the token
            const { userId: loggedInUserId } = data;
            const selectedUserId = userId;

            //we will fetch those messages that are send by us or send by the selected user.
            const messages = await messageModel.find({
                $or: [
                    { sender: loggedInUserId, recipient: selectedUserId },
                    { sender: selectedUserId, recipient: loggedInUserId }
                ]
            }).sort({ createdAt: 1 });
            
            res.status(200).json(messages)
        })
    }
}


module.exports = {
    getMessage,
}
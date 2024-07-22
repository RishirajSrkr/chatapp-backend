const mongoose = require('mongoose');
const messageSchema = mongoose.Schema({
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user"
    },
    recipient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user"
    },
    text: String,
    file: String,

}, { timestamps: true })

const messageModel = mongoose.model('message', messageSchema)

module.exports = messageModel;
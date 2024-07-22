const express = require('express')
const router = express.Router();

const {getMessage} = require('../controllers/messageController')

router.get("/messages/:userId", getMessage);


module.exports = router;
const express = require('express')
const router = express.Router();

const { registerUser, getProfile, loginUser,getAllUsers,logout } = require('../controllers/userController')

//register user
router.post("/register", registerUser)

router.get("/profile", getProfile)

router.post("/login", loginUser)

//get all the users
router.get("/allusers", getAllUsers);

//logout
router.post("/logout", logout)


module.exports = router;
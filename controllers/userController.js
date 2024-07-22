const userModel = require('../models/userModel')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')

const token_secret = process.env.JWT_SECRET

async function registerUser(req, res) {

    try {

        const { username, password } = req.body;

        //hashing the password
        const salt = bcrypt.genSaltSync(10);
        const hashedPassword = bcrypt.hashSync(password, salt);

        const new_user = await userModel.create({
            username: username,
            password: hashedPassword,
        })


        //once user registers, we want to login the user automatically
        const token_payload = {
            id: new_user._id,
            username: new_user.username,
        }

        const jwt_token = jwt.sign(token_payload, token_secret, { expiresIn: "1d" })

        if (jwt_token) {
            res.cookie('jwtToken', jwt_token, { sameSite: "none", secure: true }).status(201).json({
                message: "User registered and logged in",
                id: new_user._id,
            })
        }
    }
    catch (error) {
        return res.status(422).json({
            message: error.message || error,
            error: true
        })
    }
}

async function getProfile(req, res) {

    const token = req.cookies?.jwtToken;
    if (token) {
        jwt.verify(token, token_secret, {}, (error, data) => {
            if (error) {
                return res.status(401).json({ message: "Cannot fetch user profile." })
            }
            return res.status(200).json(data);
        })
    }



}

async function loginUser(req, res) {
    const { username, password } = req.body;

    const user = await userModel.findOne({ username: username });

    if (user) {
        //user exists for the given username,
        //check if the password matches.
        const passwordMatch = bcrypt.compareSync(password, user.password);

        if (passwordMatch) {
            //generate a token and store in the cookie.
            jwt.sign({ userId: user._id, username: user.username }, token_secret, {}, (error, token) => {
                if (error) {
                    return res.status(401).json({
                        message: "Failed to login."
                    })
                }
                return res.cookie("jwtToken", token, { sameSite: "none", secure: true }).status(200).json({
                    message: "Login Successful",
                    id: user._id,
                })

            })
        }

    }


}

async function getAllUsers(req, res) {
    try {
        const allUsers = await userModel.find({}, {'_id':1, 'username':1});
        //{'_id':1, 'username':1}) -> we want the id and username to be returned only
        return res.status(200).json(allUsers);
    }
    catch (error) {
        return res.status(400).json({
            message: "Error while fetching users from Database."
        })
    }

}


async function logout(req, res){
    //set the cookie to empty
    res.cookie('jwtToken', "").json("OK");
}


module.exports = { registerUser, getProfile, loginUser, getAllUsers,logout }
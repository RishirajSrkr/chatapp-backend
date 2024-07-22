const mongoose = require('mongoose')

async function dbConnection(){
    try{
        // await mongoose.connect(process.env.DB_URL)
        await mongoose.connect(process.env.DB_URL);
    }
    catch(error){
        console.log(`Error while connecting to mongodb :: ${error}`)
    }
}

module.exports = {dbConnection};
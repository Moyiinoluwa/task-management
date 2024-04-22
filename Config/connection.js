const mongoose = require('mongoose')


const connectDb = async () => {
    try {
        const connect = await mongoose.connect(process.env.CONNECTION_DB)
        console.log('connected to database')
    } catch (error) {
        throw error
    }
}


module.exports = connectDb;
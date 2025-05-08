const mongoose = require('mongoose')

const connectDB = async () => {
    try {
        await mongoose.connect("mongodb+srv://comneuyh:Comneyuh2004Comneyuh22004@cluster0.vwhgkgy.mongodb.net/HnGshop?retryWrites=true&w=majority&appName=Cluster0")
        console.log('kết nối db thành công')
    } catch (error) {
        console.log(error.message)
    }
}

module.exports = connectDB;
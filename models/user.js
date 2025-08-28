const mongoose = require ('mongoose');

mongoose.connect("mongodb://127.0.0.1:27017/mini-backend-project");

const userSchema = mongoose.Schema({
    username:String,
    name:String,
    age:Number,
    email:String,
    password:String
});

module.exports = mongoose.model('user', userSchema);
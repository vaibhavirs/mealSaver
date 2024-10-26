const mongoose = require('mongoose');

mongoose.connect(`mongodb://127.0.0.1:27017/mealsaver`);

const userSchema = new mongoose.Schema({
    registrationid : Number ,
    name: String,
    age: Number,
    email: String,
    mobile: Number,
    password: String,
    year: String,
    branch: String
});



module.exports = mongoose.model("useregistration", userSchema);

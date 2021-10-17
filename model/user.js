const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// create student schema & model
const UserSchema = new Schema({
    id: {
        type: Number,
    },
    email: {
        type: String,
    },
    password: {
        type: Number,
    }
});


const User = mongoose.model('user', UserSchema);

module.exports = User;

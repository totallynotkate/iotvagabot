var mongoose = require('mongoose');
var Account = require('../data/accounts');

var Schema = mongoose.Schema;

var userSchema = new Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    account: {
        type: Schema.Types.ObjectId,
        ref: 'Account',
        required: true
    }
});

var userModel = mongoose.model('User', userSchema);

module.exports = userModel;
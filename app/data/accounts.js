var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var accountSchema = new Schema({
    balance: {
        type: Number,
        default: 0
    }
});

var accountsModel = mongoose.model('Account', accountSchema);

module.exports = accountsModel;
var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var gameSchema = new Schema({
    totalPlayers: {
        type: Number,
        required: true,
        min: 1,
        max: 8
    },
    teamPlayers: {
        type: [Schema.Types.ObjectId],
        ref: 'User'
    },
    calculated: {
        type: Boolean,
        default: false
    },
    price: {
        type: Number,
        required: true,
        default: 0
    },
    name: {
        type: String,
        default: 'Неназванная игра'
    },
    date: {
        type: Date,
        required: true,
        default: new Date().setDate(new Date().getDate() + 7)
    }
});

var gameModel = mongoose.model('Game', gameSchema);

module.exports = gameModel;
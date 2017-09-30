var games = require('../data/games');
var _ = require('lodash')

function gameRoutes(app) {
    app.route('/games')
        .get(function (req, res) {
            var {calculated, totalPlayers} = req.query;
            calculated = calculated !== undefined ? JSON.parse(calculated) : undefined;
            totalPlayers = totalPlayers !== undefined ? JSON.parse(totalPlayers) : undefined;
            res.send(_.filter(games, _.omitBy({calculated, totalPlayers}, _.isUndefined)));
        })
        .post(function (req, res) {
            games.push(req.body);
            res.send(games);
        });
}

/**
 game = {
    "totalPlayers": int,
    "teamPlayers": [ids],
    "calculated": bool,
    "price": int,
    "name": string
}
 */

module.exports = gameRoutes;
var games = require('../data/games');
var users = require('../data/users');
var accounts = require('../data/accounts');
var _ = require('lodash');

function gameRoutes(app) {
    app.route('/games')
        .get(function (req, res) {
            var {calculated, totalPlayers} = req.query;
            calculated = calculated !== undefined ? JSON.parse(calculated) : undefined;
            totalPlayers = totalPlayers !== undefined ? JSON.parse(totalPlayers) : undefined;
            res.send(_.filter(games, _.omitBy({calculated, totalPlayers}, _.isUndefined)));
        })
        .post(function (req, res) {
            var calculated = JSON.parse(req.body.calculated);
            if (calculated) {
                calculateGame(req.body);
            }
            games.push(Object.assign({id: games.length + 1}, req.body)); //todo validate
            res.send(games[games.length - 1]);
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

function calculatePerson(game) {
    var {totalPlayers, price} = game;
    return price / totalPlayers;
}

function calculateGame(game) {
    var price = calculatePerson(game);
    var teamPlayers = game.teamPlayers;
    _.forEach(teamPlayers, function (id) {
        var user = _.find(users, {id});
        _.find(accounts, {id: user.accountId}).balance -= price;
    })
}

module.exports = gameRoutes;
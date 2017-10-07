var Game = require('../data/games');
var User = require('../data/users');
var _ = require('lodash');

function gameRoutes(app) {
    app.route('/games')
        .get(function (req, res) {
            var {calculated, totalPlayers, from, to} = req.query;
            var params = _.omitBy({calculated, totalPlayers}, _.isUndefined);

            from && _.set(params, 'date.$gt', from);
            to && _.set(params, 'date.$lt', to);

            Game
                .find(params)
                .exec()
                .then(function (games) {
                    res.send(games)
                })
                .catch(function (err) {
                    res.status(500).send(err);
                })
        })
        .post(function (req, res) {
            var game = new Game(req.body);
            if (game.calculated) {
                var price = game.price / game.totalPlayers;
                User
                    .find({_id: {$in: game.teamPlayers}})
                    .populate('account')
                    .then(function (users) {
                        var savePromises = users.map(function (user) {
                            user.account.balance -= price;
                            return user.account.save();
                        });
                        return Promise.all(savePromises);
                    })
                    .then(function () {
                        return game.save();
                    })
                    .then(function (game) {
                        res.send(game)
                    })
                    .catch(function (err) {
                        res.status(500).send(err);
                    });
            }
            else {
                game.save()
                    .then(function (game) {
                        res.send(game)
                    })
                    .catch(function (err) {
                        res.status(500).send(err)
                    });
            }
        });
}

//todo patch game: calculated: false <-> true

module.exports = gameRoutes;
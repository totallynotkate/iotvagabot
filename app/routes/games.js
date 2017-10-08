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
                calculateAndSaveGame(game, res);
            }
            else {
                saveGame(game, res);
            }
        });

    app.route('/games/:id')
        .get(function (req, res) {
            Game
                .findById(req.params.id)
                .then(function (game) {
                    if (_.isEmpty(game)) {
                        throw new Error(`Game ${req.params.id} not found`)
                    }
                    res.send(game);
                })
                .catch(function (err) {
                    res.status(400).send(err.message);
                })
        })
        .patch(function (req, res) {
            Game
                .findById(req.params.id)
                .then(function (game) {
                    if (_.isEmpty(game)) {
                        res.status(400).send('Invalid id');
                        return;
                    }
                    var shouldCalculate = game.calculated !== req.body.calculated;

                    _.assign(game, req.body);

                    if (shouldCalculate) {
                        var multiplier = req.body.calculated ? -1 : 1;
                        calculateAndSaveGame(game, res, multiplier);
                    } else {
                        saveGame(game, res);
                    }
                })
                .catch(function (err) {
                    res.status(500).send(err);
                });
        });
}


function saveGame(game, res) {
    game.save()
        .then(function (game) {
            res.send(game)
        })
        .catch(function (err) {
            res.status(500).send(err)
        });
}

function calculateAndSaveGame(game, res, multiplier = -1) {
    var price = game.price / game.totalPlayers;
    User
        .find({_id: {$in: game.teamPlayers}})
        .populate('account')
        .then(function (users) {
            var savePromises = users.map(function (user) {
                user.account.balance += price * multiplier;
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

module.exports = gameRoutes;
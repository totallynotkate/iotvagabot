var games = require('../data/games');

function gameRoutes(app) {
    app.route('/game')
        .get(function (req, res) {
            res.send(games);
        })
        .post(function (req, res) {
            games.push(req.body);
            res.send(games);
        });
}

module.exports = gameRoutes;
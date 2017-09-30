var _ = require('lodash');
var validate = require('validate.js');

var users = require('../data/users');
var accounts = require('../data/accounts');

function usersRoutes(app) {
    app.route('/users')
        .get(function (req, res) {
            res.send(users);
        })
        .post(function (req, res) {
            //todo: добавлять пользователей с уникальными именами? или не туду, подумать еще. зависит от того, по имени
            // или по айдишнику мы с пользователями работаем. сейчас по айдишнику, теоретически имена могут совпадать.
            // но это не особо удобно для клиента
            var user = req.body;
            var error = validate(user, constraints.postUser);
            if (error) {
                res.status(400).send({
                    code: 400,
                    message: 'invalid data',
                    details: error
                });
            }
            else {
                users.push(Object.assign(user, {id: users.length + 1}));
                res.send(users[user.name])
            }
        });

    app.route('/users/:id')
        .get(function (req, res) {
            var error = validate(req.params, constraints.getUser);
            if (error) {
                res.status(400).send({
                    code: 400,
                    message: 'invalid data',
                    details: error
                });
            }
            else {
                var user = getUser(req.params.id);
                if (_.isEmpty(user)) {
                    res.status(400).send('User not found');
                } else {
                    res.json(user);
                }
            }
        })
        .patch(function (req, res) {
            var user = getUser(req.params.id);
            if (_.isEmpty(user)) {
                res.status(400).send('User not found');
            } else {
                var patch = req.body;
                if (_.isEmpty(patch)) {
                    res.status(400).send('You should send something to patch');
                } else if (patch.id) {
                    res.status(400).send('Id is immutable')
                } else {
                    Object.assign(user, patch)
                }
                res.json(user);
            }
        });

    app.route('/users/:id/balance')
        .all(function (req, res, next) {
            var user = getUser(req.params.id);
            if (_.isEmpty(user)) {
                res.status(400).send('User not found');
                return;
            }
            if (user.accountId === null) {
                res.status(400).send('User does not have an account');
                return;
            }
            next()
        })
        .get(function (req, res) {
            var user = getUser(req.params.id);
            res.send(accounts[user.accountId].balance.toString());
        })
        .post(function (req, res) {
            var user = getUser(req.params.id);
            var sum = req.body;
            if (_.isEmpty(sum)) {
                res.status(400).send('Sum can not be null');
            }
            accounts[user.accountId] = +sum;
        });
}

var getUser = _.memoize(_getUser);

function _getUser(id) {
    return _.find(users, function (user) {
        return user.id === Number(id);
    })
}

var constraints = {
    postUser: {
        name: {
            presence: true,
            format: {pattern: "[a-Zа-ЯёЁ]+"}
        },
        accountId: {
            numericality: {
                onlyInteger: true
            }
        }
    },
    getUser: {
        id: {
            numericality: {
                onlyInteger: true
            }
        }
    }
};

module.exports = usersRoutes;
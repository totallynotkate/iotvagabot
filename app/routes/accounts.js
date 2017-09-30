var accounts = require('../data/accounts');
var _ = require('lodash');

function accountRoutes(app) {
    app.route('/accounts')
        .get(function (req, res) {
            res.json(accounts)
        })
        .post(function (req, res) {
            var id = accounts.length + 1;
            accounts.push({
                balance: 0,
                id: id
            });
            res.json(accounts[id - 1])
        });

    app.route('/accounts/sum')
        .get(function (req, res) {
            var sum = _.sumBy(accounts, 'balance');
            res.send(sum.toString())
        });

    app.route('/accounts/:id')
        .all(function (req, res, next) {
            var account = getAccount(req.params.id);
            if (_.isEmpty(account)) {
                res.status(400).send('Account not found');
            }
            next()
        })
        .get(function (req, res) {
            res.json(getAccount(req.params.id));
        })
        .put(function (req, res) {
            var sum = req.body;
            if (_.isEmpty(sum)) {
                res.status(400).send('You should send a change to the balance')
            } else {
                var account = getAccount(req.params.id);
                account.balance = +sum.balance;
                res.json(account);
            }
        });
}

var getAccount = _.memoize(_getAccount);

function _getAccount(id) {
    return _.find(accounts, function (account) {
        return account.id === Number(id);
    })
}

module.exports=accountRoutes;
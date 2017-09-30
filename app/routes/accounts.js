var Account = require('../data/accounts');
var _ = require('lodash');

//todo список балансов
function accountRoutes(app) {
    app.route('/accounts')
        .get(function (req, res) {
            Account.find().lean().exec(function (err, accounts) {
                if (err) {
                    res.status(500);
                    return;
                }
                res.json(accounts)
            });
        })
        .post(function (req, res) {
            var account = new Account();
            account.save(function (err) {
                if (err) {
                    res.status(500);
                    return;
                }
                res.send(account);
            })
        });

    app.route('/accounts/sum')
        .get(function (req, res) {
            Account.find().select('balance').exec(function (err, balances) {
                if (err){
                    res.status(500);
                    return;
                }
                res.send(_.sumBy(balances, 'balance').toString());
            });
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

module.exports = accountRoutes;
var Account = require('../data/accounts');
var _ = require('lodash');
var validate = require('validate.js');

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
                if (err) {
                    res.status(500);
                    return;
                }
                res.send(_.sumBy(balances, 'balance').toString());
            });
        });

    app.route('/accounts/:id')
        .get(function (req, res) {
            Account.findById(req.params.id, function (err, account) {
                console.log(account);
                if (err) {
                    res.status(500).send(err);
                    return;
                }
                account ? res.send(account) : res.status(400).send({message: 'Account not found'});
            });
        })
        .patch(function (req, res) {
            var err = validate(req.body, constraints.patchAccount);
            if (err) {
                res.status(400).send({
                    code: 400,
                    type: 'validation error',
                    message: 'invalid data',
                    details: err
                });
                return;
            }

            var delta = req.body.sum;
            Account.findById(req.params.id, function (err, account) {
                console.log(account);
                if (err) {
                    res.status(500).send(err);
                    return;
                }
                if (!account) {
                    res.status(400).send({
                        code: 400,
                        message: 'Account not found'
                    });
                    return;
                }
                account.balance = account.balance + delta;
                account.save(function (err) {
                    if (err) {
                        res.status(500)
                            .send({error: err});
                        return;
                    }
                    res.send(account);
                })
            });
        });
}

var constraints = {
    patchAccount: {
        sum: {
            presence: true,
            numericality: {
                onlyInteger: true,
                greaterThan: 0
            }
        }
    }
};

module.exports = accountRoutes;
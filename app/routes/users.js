var _ = require('lodash');
var validate = require('validate.js');
var User = require('../data/users');
var Account = require('../data/accounts');

function usersRoutes(app) {
    app.route('/users')
        .get(function (req, res) {
            User.find().lean().exec(function (err, users) {
                if (err) {
                    res.status(500);
                    return;
                }
                res.send(users);
            })
        })
        .post(function (req, res) {
            var accountPromise;
            var {name, accountId} = req.body;

            if (!accountId) {
                accountPromise = new Account().save();
            } else {
                accountPromise = Account.findById(accountId);
            }

            accountPromise
                .then(function (account) {
                    var user = new User({name, account});
                    user.save(function (err) {
                        if (err) {
                            res.status(400).send({details: err});
                            return;
                        }
                        res.send(user);
                    });
                })
                .catch(function (error) {
                    res.status(400).send({details: error});
                })
        });

    app.route('/users/:id')
        .get(function (req, res) {
            User.findById(req.params.id)
                .then(function (user) {
                    res.send(user);
                })
                .catch(function (err) {
                    res.status(400).send(err);
                })
        })
        .patch(function (req, res) {
            User.findByIdAndUpdate(req.params.id, _.omitBy(req.body, _.isUndefined)).exec()
                .then(function (user) {
                    res.send(user);
                })
                .catch(function (err) {
                    res.status(400).send(err);
                });
        });

    app.route('/users/:id/balance')
        .get(function (req, res) {
            User.findById(req.params.id)
                .populate('account')
                .exec()
                .then(function (user) {
                    res.send({balance: user.account.balance})
                })
                .catch(function (err) {
                    res.status(400).send(err);
                });
        })
        .post(function (req, res) {
            var err = validate(req.body, constraints.patchAccount);
            if (err){
                res.status(400)
                    .send({
                        code: 400,
                        type: 'validation error',
                        message: 'illegal sum',
                        details: err
                    });
                return;
            }

            var sum = req.body.sum;

            User.findById(req.params.id)
                .populate('account')
                .exec()
                .then(function (user) {
                    user.account.balance += sum;
                    return user.account
                        .save()
                        .then(function () {
                            return Promise.resolve(user.account.balance);
                        });
                })
                .then(function (balance) {
                    res.send({balance})
                })
                .catch(function (err) {
                    res.status(400).send(err);
                });
        });
}

var constraints = {
    postBalance: {
        sum: {
            required: true,
            type: Number
        }
    }
};

module.exports = usersRoutes;
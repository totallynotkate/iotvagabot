var app = require('express')();
var bodyParser = require('body-parser');
var _ = require('lodash');

app.use(bodyParser.json());

var users = [
    {
        name: "admin",
        id: 1,
        accountId: null,  //потому что у нескольких пользователей может быть один счет
    },
    {
        name: "vasya",
        id: 2,
        accountId: null,
    },
    {
        name: "petya",
        id: 3,
        accountId: null,
    }
];

var accounts = [
    {
        balance: 0,
        id: 1
    },
    {
        balance: 0,
        id: 2
    },
    {
        balance: 0,
        id: 3
    }
];

app.route('/users')
    .get(function (req, res) {
        res.send(JSON.stringify(users))
    })
    .post(function (req, res) {
        //todo: добавлять пользователей с уникальными именами? или не туду, подумать еще. зависит от того, по имени
        // или по айдишнику мы с пользователями работаем. сейчас по айдишнику, теоретически имена могут совпадать.
        // но это не особо удобно для клиента
        var user = req.body;
        try {
            var name = user.name;
            if (typeof name !== "string") throw new Error('User has no name');
            users.push(Object.assign(user, {id: users.length + 1}))
        } catch (e) {
            console.log(e);
            res.status(400).send('User should have a name');
        }
        res.send(users[user.name])
    });

app.route('/users/:id')
    .get(function (req, res) {
        var user = _.find(users, function (user) {
            return user.id == req.params.id;
        });
        if (_.isEmpty(user)) {
            res.status(400).send('User not found');
        } else {
            res.json(user);
        }
    })
    .patch(function (req, res) {
        var user = _.find(users, function (user) {
            return user.id == req.params.id;
        });
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
        }
        if (user.accountId === null){
            res.status(400).send('User does not have an account')
        }
        next() //todo с этой штукой функция продолжает выполняться, в консоли ошибки. Без нее - не переходит к get/post
    })
    .get(function (req, res) {
        var user = getUser(req.params.id);
        res.send(accounts[user.accountId].balance.toString());
    })
    .post(function (req, res) {
        var user = getUser(req.params.id);
        var sum = req.body;
        if(_.isEmpty(sum)){
            res.status(400).send('Sum can not be null');
        }
        accounts[user.accountId] =+ sum;
    });

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
        var sum = _.reduce(accounts, function (result, account){
            return result += account.balance;
        }, 0);
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
        if (_.isEmpty(sum)){
            res.status(400).send('You should send a change to the balance')
        } else {
            var account = getAccount(req.params.id);
            account.balance =+ sum.balance;
            res.json(account);
        }
    });

var getAccount = _.memoize(_getAccount);

function _getAccount(id) {
    return _.find(accounts, function (account) {
        return account.id === Number(id);
    })
}

var getUser = _.memoize(_getUser);

function _getUser(id) {
    return _.find(users, function (user) {
        return user.id === Number(id);
    })
}

app.listen(3000);
var app = require('express')();
var bodyParser = require('body-parser');
var _ = require('lodash');

app.use(bodyParser.json());
require('./routes/users')(app);
require('./routes/accounts')(app);
require('./routes/games')(app);

app.listen(3000);
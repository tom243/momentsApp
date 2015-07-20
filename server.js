var express = require('express');
var app = express();
app.use('/', express.static('./public')).listen(8080);
console.log('Listening to port 8080');
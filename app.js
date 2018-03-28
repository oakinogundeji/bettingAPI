'use strict';
//=============================================================================
if(process.env.NODE_ENV != 'production') {
  require('dotenv').config();
}
// dependencies
const
  express = require('express'),
  Promise = require('bluebird'),
  http = require('http');

// variables
let {PORT, ENV} = process.env;

if(!ENV) {
  ENV = 'development';
}

// config

const app = express();
app.disable('x-powered-by');
app.set('port', PORT);
app.set('env', ENV);

if(ENV != 'production') {
    app.use(require('morgan')('dev'));
    require('clarify');
}

const server = http.createServer(app);
// routes
app.get('/test', (req, res) => res.status(200).json('OK!'));

// listen for connections
server.listen(PORT, () => console.log(`BETTING API Server up on port:${server.address().port} in ${ENV} mode`));

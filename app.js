'use strict';
const _ = require('lodash');
const path = require('path');
const config = require('./config.sample.js');

let express = require('express');
let app = express();
let server = require('http').Server(app);
let io = require('socket.io')(server);
const bodyParser = require('body-parser');
const favicon = require('serve-favicon');

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
// body Parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
// static files
app.use(express.static(path.join(__dirname, 'bower_components')));

server.listen(3000);
console.log('server listening');


app.get('/ko', function (req, res) {
  res.render('knockout', {content: 'hi'});
});
app.get('/yumli', function (req, res) {
  res.render('yumli', {content: 'hi'});
});


io.on('connection', function (socket) {
  socket.emit('news', { hello: 'world' });
  socket.on('my other event', function (data) {
    console.log(data);
  });
});

setInterval( function() {
  io.emit('newMessage', '  @message "juhuuu", "JUMLY"');
}, 10*1000);
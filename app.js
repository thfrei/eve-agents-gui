'use strict';
const _ = require('lodash');
const path = require('path');
const config = require('./config.sample.js');
let mqttP = require('mqtt');
let mqtt = mqttP.connect(config.mqtt);

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

server.listen(config.port);
console.log('server listening');

app.get('/', function(req, res) {
  res.render('index', {});
});
app.get('/ko', function (req, res) {
  res.render('knockout', {content: 'hi'});
});
app.get('/yumli', function (req, res) {
  res.render('yumli', {content: 'hi'});
});

mqtt.subscribe('#');
mqtt.on('message', function(topic, message){
  //console.log(topic, JSON.parse(message.toString()));
  let msg = JSON.parse(message.toString());

  //tP.newMessage();
  //tP.setMain(msg.from);
  //tP.setFrom(msg.from);
  //tP.setTo(msg.to);
  //tP.setContent(msg.type);
  //
  //console.log(tP.parse());

  //console.log(msg.from.substr(0,9), '\t', msg.to.substr(0,9), '\t', msg.type);

  io.emit('mqttSniffer', msg);
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

function topologyParser() {
  this.agents = [];
  this.main = '';
  this.message = {};
  this.output = '';

  this.setMain = function(main) {
    if( _.isEmpty(this.main) ) {
      this.main = main;
      this.output += '@found "'+main+'"\n';
    }
  };

  this.newMessage = function() {
    this.message = {};
    this.output = '';
  };

  this.setFrom = function(from) {
    this.message.from = from;
  };
  this.setTo = function(to) {
    this.message.to = to;
  };
  this.setContent = function(content) {
    this.message.content = content;
  };

  this.update = function(agent) {
    if( ! _.find(this.agents, agent) ) {
      this.agents.push(agent);
    }
  };

  this.parse = function() {
    if (this.message.from == this.main) {
      this.output += '  @message "' + this.message.content + '", "' + this.message.to + '"';
    }
    else if (this.message.to == this.main) {

    }
    else {
      this.output += '  "' + this.message.content + '", to: "' + this.message.to + '" from: "' + this.message.from + '"';
    }


    return this.output;
  }
}
let tP = new topologyParser();


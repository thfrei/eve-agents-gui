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

var guiParser = new Parser();
mqtt.on('message', function(topic, message){
  if (topic == 'sniffer') {
    let msg = JSON.parse(message.toString());

    guiParser.parse(msg);

    io.emit('line', guiParser.renderMessage(msg));
    io.emit('header', guiParser.renderHeader());
  }
});

var mock = [
  { to: 'DFUID',
  from: 'Order1',
  type: 'rpc',
  method: 'search',
  params: { skill: 'cfp-bottleInput' } },{ to: 'DFUID',
  from: 'Order1',
  type: 'rpc',
  method: 'search',
  params: { skill: 'cfp-fill' } },{ to: 'DFUID',
  from: 'Order1',
  type: 'rpc',
  method: 'search',
  params: { skill: 'cfp-bottleOutput' } },{ to: 'BottleInput',
  from: 'Order1',
  type: 'CAcfp',
  conversation: 'cfp-bottleInput',
  objective: { bottleType: 'longneck', size: 300 } }
,
  { to: 'Filler',
  from: 'Order1',
  type: 'CArequest',
  conversation: 'request-execute',
  objective: { taskId: 'fill-5d094b4d-dac0-479e-bb94-e3542de2b354' } }
];
var gui = new Parser();
mock.forEach(function(msg){
  gui.parse(msg);
  console.log(gui.renderMessage(msg));
});
console.log(gui.renderHeader());
console.log(gui.agents);

function Parser() {
  this.agents = [];
  this.size = 10; // 10 dashes per agent

  this.parse = function(msg) {
    // Check if agent is known
    this.updateAgent(msg.from);
    this.updateAgent(msg.to);
  };

  this.renderMessage = function(msg) {
    var distance  = this.calculateDistance(msg.from, msg.to);
    var beginning = this.findBeginning(msg.from, msg.to);

    var out = '  ';
    var start = '';
    var end = '';
    if(this.findDirection(msg.from, msg.to) == 'right') {
      start = 'x';
      end = '>';
    } else {
      start = '<';
      end = 'x';
    }
    out += this.drawNTimes(' ', beginning * this.size);
    out += start;
    out += this.drawNTimes('-', distance * this.size);
    out += end;
    return out;
  };

  this.renderHeader = function() {
    var self = this;
    var out = '';
    this.agents.forEach(function(agent) {
      agent = agent.substr(0,9);
      var diff = 10 - agent.length;
      if(diff) {
        agent += self.drawNTimes('.',diff);
      }
      out += agent;
    });
    return out;
  };

  this.drawNTimes = function(letter, times) {
    var out = '';
    for(var i=0; i<times; i++) {
      out += letter;
    }
    return out;
  };

  this.updateAgent = function(agent) {
    if(_.indexOf(this.agents, agent) == -1){
      this.agents.push(agent);
    }
  };

  this.calculateDistance = function(agent1, agent2) {
    var a1Pos = _.indexOf(this.agents, agent1);
    var a2Pos = _.indexOf(this.agents, agent2);

    return Math.abs(a1Pos-a2Pos);
  };

  this.findBeginning = function(agent1, agent2) {
    var a1Pos = _.indexOf(this.agents, agent1);
    var a2Pos = _.indexOf(this.agents, agent2);

    return (a1Pos<a2Pos)?a1Pos:a2Pos;
  };

  this.findDirection = function(agent1, agent2) {
    var a1Pos = _.indexOf(this.agents, agent1);
    var a2Pos = _.indexOf(this.agents, agent2);

    return (a2Pos>a1Pos)?'right':'left';
  }

}



/**
 * Created by Matthew on 3/30/2017.
 */

//import required libraries
require(__dirname + "/Resources/config.js");
var fs = require('fs');
var net = require('net');
require('./packet.js');

//console.log(config.database); -> debug

/*
1. Load the initializers
2. Load data models
3. Load game maps data
4. Initiate the server and listen to the internets
 */

//Load Initializers:
var init_files = fs.readdirSync(__dirname + "/Initializers");
init_files.forEach(function(initFile){
    console.log('Loading Initializers: ' + initFile);
    require(__dirname + "/Initializers/" + initFile);
});

//Load Models:
var model_files = fs.readdirSync(__dirname + "/Models");
model_files.forEach(function(modelFile){
    console.log('Loading Model: ' + modelFile);
    require(__dirname + "/Models/" + modelFile);
});

//Load model_files maps:
maps = {};

var map_files = fs.readdirSync(config.data_paths.maps);
map_files.forEach(function(mapFile){
    console.log('Loading Map: ' + mapFile);
    var map = require(config.data_paths.maps + mapFile);
    maps[map.room] = map;
});

//console.log(maps); -> debug

//4: Initiate the server - server logic
net.createServer(function(socket){ // fires every time a socket is connected

    console.log("socket connected");
    var c_inst = new require('./client.js'); // reference instance of client on connection
    var thisClient = new c_inst(); // create proper instance of reference

    thisClient.socket = socket;
    thisClient.initiate(); // establish handshake

    // fire off on client connections, and reference client functions
    socket.on('error', thisClient.error);
    socket.on('end', thisClient.end);
    socket.on('data', thisClient.data);

}).listen(config.port);

console.log("Initialize Completed, Server running on port: " + config.port + "; for environment: " + config.environment);
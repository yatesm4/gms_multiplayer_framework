// Used to represent the client whom connected to the server

var now = require('performance-now'); //get miliseconds and exact performance results
var _ = require('underscore'); //great for filtering through data

module.exports = function(){ // function to represent client

    var client = this;

    //These objects will be added at runtime...
    //this.socket = {}
    //this.user = {}

    //Initialization
    this.initiate = function(){

        // send connection handshake to client
        client.socket.write(packet.build(["HELLO", now().toString()]));

        console.log('Client initiated');
    };

    //Client Methods
    this.enterroom = function(selected_room){
        maps[selected_room].clients.forEach(function(otherClient){
            otherClient.socket.write(packet.build(["ENTER", client.user.username, client.user.pos_x, client.user.pos_y]))
        })

        maps[selected_room].clients.push(client);
    };

    this.broadcastroom = function(packetData){
        maps[client.user.current_room].clients.forEach(function(otherClient){
            if(otherClient.user.username != client.user.username){
                otherClient.socket.write(packetData);
            };
        })
    };

    //Socket Actions
    this.data = function(data){
        console.log("Client data: " + data.toString());
        packet.parse(client, data);
    };

    this.error = function(err){
        console.log("Client error: " + err.toString());
    };

    this.end = function(){
        console.log("Client closed");
    };

};

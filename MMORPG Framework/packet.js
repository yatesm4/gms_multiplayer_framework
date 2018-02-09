var zeroBuffer = new Buffer('00', 'hex'); // means nothing in hex language lol

module.exports = packet = {

    //params: an array of javascript objects to be turned into buffers (data sent to client)
    build: function(params){
        var packetParts = [];
        var packetSize = 0;
        params.forEach(function(param){
            var buffer;
            if(typeof param === 'string'){
                buffer = new Buffer(param, 'utf8');
                //a number will end the string
                buffer = Buffer.concat([buffer, zeroBuffer], buffer.length + 1);
            }else if (typeof param === 'number'){
                buffer = new Buffer(2); //allows use of unsigned int
                buffer.writeUInt16LE(param, 0);
            }else{
                //packet wasn't a string or number
                console.log("WARNING: A foreign packet type detected in packet builder!!!");
            }

            packetSize += buffer.length;
            packetParts.push(buffer);
        });

        var dataBuffer = Buffer.concat(packetParts, packetSize);

        // SIZE -> DATA, Packets that stick together upon receive will split based upon number basis
        // ex. 4MATT4LIKES4FOOD
        //     ^    ^    ^       - every number is a start for the character packet, like the # 4 represents a 4 character string
        //     |    |    |         and then when the next number is hit, it signals a new packet. Each string will be added to an array,
        //    MATT|LIKES|FOOD       the length identifier (int) will automatically be stripped.

        var size = new Buffer(1);
        size.writeUInt8(dataBuffer.length + 1, 0);

        //5HELLO <- 6 BYTES LONG

        var finalPacket = Buffer.concat([size, dataBuffer], size.length + dataBuffer.length);

        return finalPacket; // send the final, modified packet
    },

    //Parse a packet to be handled for a client
    parse: function(c, data){
        var idx = 0; // index in buffer
        while(idx < data.length){
            var packetSize = data.readUInt8(idx);
            var extractedPacket = new Buffer(packetSize);
            data.copy(extractedPacket, 0, idx, idx + packetSize);
            this.interpret(c, extractedPacket);
            idx += packetSize;
        }
    },

    interpret: function(c, datapacket){
        //take data packet, compare against header, and header will tell what the command of the packet is
        var header = PacketModels.header.parse(datapacket); //compared with binary-parser
        console.log("Interpret: " + header.command);

        switch (header.command.toUpperCase()){
            case "LOGIN":
                var data = PacketModels.login.parse(datapacket);
                User.login(data.username, data.password, function(result, user){
                    console.log('Login Result: ' + result.toString().toUpperCase());
                    if(result){
                        c.user = user;
                        c.enterroom(c.user.current_room);
                        c.socket.write(packet.build(["LOGIN", "TRUE", c.user.current_room, c.user.pos_x, c.user.pos_y, c.user.username]));
                    }else{
                        c.socket.write(packet.build(["LOGIN", "FALSE"]));
                    }
                });
                break;
            case "REGISTER":
                var data = PacketModels.register.parse(datapacket);
                User.register(data.username, data.password, function(result){
                   if(result){
                       c.socket.write(packet.build(["REGISTER", "TRUE"]));
                   }else{
                       c.socket.write(packet.build(["REGISTER", "FALSE"]));
                   }
                });
                break;

            case "POS":
                var data = PacketModels.pos.parse(datapacket);
                c.user.pos_x = data.target_x;
                c.user.pos_y = data.target_y;
                c.user.save(); // Save user location in database, not efficient - should be done once clients ends || this.end
                c.broadcastroom(packet.build(["POS", c.user.username, data.target_x, data.target_y])); // send other clients the player position
                console.log(data);
                break;
        }
    }

};

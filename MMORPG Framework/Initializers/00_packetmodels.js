var Parser = require('binary-parser').Parser;

// FF F0 E7 AA BC 00 <- end of string '00'
var StringOptions = {length: 99, zeroTerminated:true};

module.exports = PacketModels = {
    header: new Parser().skip(1)
        .string('command', StringOptions),

    login: new Parser().skip(1)
        .string("command", StringOptions)
        .string("username", StringOptions)
        .string("password", StringOptions),

    register: new Parser().skip(1)
        .string("command", StringOptions)
        .string("username", StringOptions)
        .string("password", StringOptions),
    pos: new Parser().skip(1)
        .string("command", StringOptions)
        .int32le("target_x", StringOptions)
        .int32le("target_y", StringOptions)
};

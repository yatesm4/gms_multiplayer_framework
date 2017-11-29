/* Import required libraries */
var args = require('minimist')(process.argv.slice(2));
var extend = require('extend');

/* Store env variable */
var environment = args.env || "test";

/* Common config... names, version, max player, etc */
var common_conf = {
    name: "yates mmo game server",
    version: "0.0.1",
    environment: environment,
    max_player: 100,
    data_paths: {
        items: __dirname + "\\Game Data\\" + "Items\\",
        maps: __dirname + "\\Game Data\\" + "Maps\\"
    },
    starting_zone: "rm_map_home"
};

/* Environment Specific Config */
var conf = {
    test: {
        ip: args.ip || "0.0.0.0",
        port: args.port || 8081,
        database: "mongodb://127.0.0.1/mmo_test"
    }
};

extend(false, conf.test, common_conf);

module.exports = config = conf[environment];


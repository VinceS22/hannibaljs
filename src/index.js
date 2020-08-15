"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
var Discord = __importStar(require("discord.js"));
var https = require('https');
var client = new Discord.Client();
var settings = require('./settings.json');
client.once('ready', function () {
    client.on('message', function (message) {
        console.log(message.content);
        if (message.content === "!help") {
            message.channel.send('This is the help. Im helping! :)');
            getWebPage(settings.baseUrl);
        }
    });
});
client.login(settings.token);
//  Get method implementation:
function getWebPage(url, data) {
    if (url === void 0) { url = ''; }
    if (data === void 0) { data = {}; }
    https.get(url, function (response) {
        var data = '';
        response.on('data', function (chunk) {
            data += chunk;
        });
        response.on('end', function () {
            console.log(data);
        });
    }).on('error', function (err) { console.log("Error: " + err.message); });
}

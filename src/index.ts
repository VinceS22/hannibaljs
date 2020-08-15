import * as Discord from 'discord.js'
import {IncomingMessage} from "http";
const https = require('https');
const client = new Discord.Client();

const settings = require('./settings.json');

client.once('ready', () => {
    client.on('message', (message) => {
        console.log(message.content)

        if(message.content === "!help"){
            message.channel.send('This is the help. Im helping! :)')
            getWebPage(settings.baseUrl);
        }
    });
});

client.login(settings.token);


//  Get method implementation:
function getWebPage(url = '', data = {}) {
    https.get(url, (response: IncomingMessage) => {
        let data = '';
        response.on('data', (chunk) => {
            data += chunk;
        });

        response.on('end', () => {
            console.log(data)
        });
    }).on('error', (err:Error) => {console.log("Error: " + err.message)});
}

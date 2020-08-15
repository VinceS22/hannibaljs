import * as Discord from 'discord.js'

const client = new Discord.Client();


client.once('ready', () => {
    client.on('message', (message) => {
        console.log(message.content)
    });
});

client.login('');

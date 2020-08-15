'use strict';
const Discord = require('discord.js');
const client = new Discord.Client();
client.once('ready', function() {
	client.on('message', function(message) {
		console.log(message.content);
	});
});
client.login('');

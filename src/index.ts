import * as Discord from "discord.js";
import {IncomingMessage} from "http";
const https = require("https");
const client = new Discord.Client();

const settings = require("./settings.json");
const domParser = new DOMParser();
client.once("ready", () => {
    client.on("message", (message) => {
        console.log(message.content);

        if (message.content === "!help") {
            message.channel.send("This is the help. Im helping! :)");
            getWebPage(settings.baseUrl + ",goto,112").then((data) => {
                console.log(data);
                const doc = domParser.parseFromString(data, "text/html");
            });
        }
    });
});

client.login(settings.token);

//  Get method implementation:
async function getWebPage(url = "", data = {}): Promise<string> {
    return https.get(url, (response: IncomingMessage) => {
        let responseData = "";
        response.on("data", (chunk) => {
            responseData += chunk;
        });

        response.on("end", () => {
            return responseData;
        });
    }).on("error", (err: Error) => {
        console.log("Error: " + err.message);
        return err.message;
    });
}

import * as Discord from "discord.js";
import {IncomingMessage} from "http";

import cheerio from "cheerio";
import https from "https";
import settings from "./settings.json";

const client = new Discord.Client();

client.once("ready", () => {
    client.on("message", (message) => {

        if (message.content === "a") {
            message.channel.send("This is the help. Im helping! :)");
            getWebPage(settings.baseUrl + ",goto,112").then((data) => {
                const webPage = cheerio.load(data);
                webPage("article.forum-post").map((index: number, element: CheerioElement) => {
                    const userName = webPage("h3", element).data("displayname");
                    const postContent = webPage(".forum-post__body", element).eq(0).contents();
                    let resultString = "";
                    postContent.each((i, elem) => {
                        if (elem.type === "text") {
                            resultString += elem.data;
                        } else if (elem.type === "tag" && elem.name === "br") {
                            resultString += "/n";
                        }

                    });

                    console.log("Username: " + userName);
                    console.log("Post content: " + resultString);
                });
            });
        }
    });
});

client.login(settings.token);

//  Get method implementation:
async function getWebPage(url = "", data = {}): Promise<string>  {
    return new Promise((resolve, reject) => {
        https.get(url, (response: IncomingMessage) => {
            let responseData = "";
            response.on("data", (chunk) => {
                responseData += chunk;
            });

            response.on("end", () => {
                resolve(responseData);
            });
        }).on("error", (err: Error) => {
            console.log("Error: " + err.message);
            reject(err.message);
        });
    });

}

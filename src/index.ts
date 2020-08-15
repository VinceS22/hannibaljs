import * as Discord from "discord.js";
import {IncomingMessage} from "http";

import cheerio from "cheerio";
import https from "https";
import settings from "./settings.json";

const client = new Discord.Client();

client.once("ready", () => {
    let results = "";
    client.on("message", (message) => {
        if (message.content === "a") {
            message.channel.send("This is the help. Im helping! :)");
            getWebPage(settings.baseUrl + ",goto,112").then((data) => {
                const webPage = cheerio.load(data);
                webPage("article.forum-post").map((index: number, element: CheerioElement) => {
                    const userName = webPage("h3", element).data("displayname");
                    const postContent = webPage(".forum-post__body", element).eq(0).contents();
                    let resultString = "";
                    let newlineCount = 0;
                    postContent.each((i, elem) => {
                        if (elem.type === "text") {
                            resultString += elem.data;
                        } else if (elem.type === "tag" && elem.name === "br") {
                            if (newlineCount < 1) {
                                resultString += "\n";
                                newlineCount = 0;
                            }
                            newlineCount++;
                        }
                        else{
                            console.log(elem.data);
                        }

                    });

                    console.log("Username: " + userName);
                    console.log("Post content: " + resultString);
                    results += userName + " \n " + resultString + "\n";
                    console.log(results);
                    if(results.length > 1000){
                        message.channel.send(results);
                        results = "";
                    }
                });

                message.channel.send(results);
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

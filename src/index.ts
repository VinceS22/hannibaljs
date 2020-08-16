import * as Discord from "discord.js";
import {IncomingMessage} from "http";

import cheerio from "cheerio";
import https from "https";
import settings from "./settings.json";

const client = new Discord.Client();

client.once("ready", () => {
    let results = "";
    const currentPage = 100;
    client.on("message", (message) => {
        if (message.content === "a") {
            message.channel.send("This is the help. Im helping! :)");
            getWebPage(settings.baseUrl + ",goto," + currentPage).then((data) => {
                const $ = cheerio.load(data);
                $("article.forum-post").map((index: number, element: CheerioElement) => {
                    const userName = $("h3", element).data("displayname").replace("%A0", " ");
                    const postContent = $(".forum-post__body", element).eq(0).contents();
                    let resultString = "";
                    postContent.each((i, elem) => {
                        resultString += renderElement(elem);
                    });

                    console.log("Username: " + userName);
                    console.log("Post content: " + resultString);
                    results += "Current Username: " + userName + " \n " + "-------------------------------" + "\n" +
                        resultString + "\n\n";
                    if (results.length > 1000) {
                        message.channel.send(results);
                        results = "";
                    }
                });

                if (results.length > 0) {
                    message.channel.send(results);
                }
                results = "";
                // currentPage++;
            });
        }
    });
});

client.login(settings.token);

const renderElement = (elem: CheerioElement): string => {
    let resultString = "";
    if (elem.type === "text" && elem.data) { // Line with actual text in it
        resultString += elem.data;
    } else if (elem.type === "tag" && elem.name === "br") { // Standard linebreak
        resultString += "\n";
    } else if (elem.type === "tag" && elem.name === "span") { // This is a quoted post
        let spanContents = "";
        spanContents = elem.children.map((nestedElement) => {
            return renderElement(nestedElement);
        }).join("");
        resultString += "-----START QUOTE-----\n" + spanContents + "\n-----END QUOTE-----";
    } else if (elem.type === "tag" && elem.name === "div") { // A div with more elements in it
        resultString += elem.children.map((nestedElement) => {
            return renderElement(nestedElement);
        }).join("");
    } else {
        console.log(elem.data);
    }
    return resultString;

};

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

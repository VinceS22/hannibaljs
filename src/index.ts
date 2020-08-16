import * as Discord from "discord.js";
import {IncomingMessage} from "http";

import cheerio from "cheerio";
import https from "https";
import settings from "./settings.json";

const client = new Discord.Client();

client.once("ready", () => {
    let results = "";
    let currentPage = 100;
    client.on("message", (message) => {
        if (message.content === "a") {
            message.channel.send("This is the help. Im helping! :)");
            getWebPage(settings.baseUrl + ",goto," + currentPage).then((data) => {
                const webPage = cheerio.load(data);
                webPage("article.forum-post").map((index: number, element: CheerioElement) => {
                    const userName = webPage("h3", element).data("displayname").replace("%A0", " ");
                    const postContent = webPage(".forum-post__body", element).eq(0).contents();
                    const quotedPost = postContent.children();
                    let resultString = "";
                    let isQuotedApplication = false;
                    let applicantUsername = "";
                    postContent.each((i, elem) => {
                        if (elem.type === "text" && elem.data) {
                            if (isQuotedApplication) {
                                if(elem.data.includes("Username")) {
                                    const splitData = elem.data.split(" ");
                                    if (splitData.length > 0) {
                                        applicantUsername = splitData[1];
                                    }
                                }
                            } else {
                                resultString += elem.data;
                            }
                        } else if (elem.type === "tag" && elem.name === "br") {
                            if (!isQuotedApplication) {
                                resultString += "\n";
                            }
                        } else if (elem.type === "tag" && elem.name === "span") {
                            isQuotedApplication = !isQuotedApplication;
                        }
                        else{
                            console.log(elem.data);
                        }

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
                //currentPage++;
            });
        }
    });
});

client.login(settings.token);

interface IRenderedElement {
    data: string;

}

const renderElement = (i: number, elem: CheerioElement) => {
    let resultString = "";
    let isQuotedApplication = false;
    let applicantUsername = "";
    if (elem.type === "text" && elem.data) {
        if (isQuotedApplication) {
            if(elem.data.includes("Username")) {
                const splitData = elem.data.split(" ");
                if (splitData.length > 0) {
                    applicantUsername = splitData[1];
                }
            }
        } else {
            resultString += elem.data;
        }
    } else if (elem.type === "tag" && elem.name === "br") {
        if (!isQuotedApplication) {
            resultString += "\n";
        }
    } else if (elem.type === "tag" && elem.name === "span") {
        isQuotedApplication = !isQuotedApplication;
    }
    else{
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

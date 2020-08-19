import * as Discord from "discord.js";
import {IncomingMessage} from "http";

import cheerio from "cheerio";
import https from "https";
import settings from "./settings.json";

const client = new Discord.Client();

client.once("ready", () => {
    let results = "";
    let currentPage = 110;
    client.on("message", (message) => {
        if (message.content === "a") {
            message.channel.send("This is the help. Im helping! :)");
            getWebPage(settings.baseUrl + ",goto," + currentPage).then((data) => {
                const $ = cheerio.load(data);

                $("article.forum-post").map((index: number, element: CheerioElement) => {
                    const userName = $("h3", element).data("displayname").replace("%A0", " ");
                    const postContent = $(".forum-post__body", element).eq(0).contents();
                    let resultString = "";
                    let appUsername = "";
                    let purpose = postPurpose.Bump;
                    postContent.each((i, elem) => {
                        const renderedElement = renderElement(elem);
                        resultString += renderedElement.postText;
                        if (renderedElement.purpose !== postPurpose.Bump) {
                            purpose = renderedElement.purpose;
                        }
                        if(renderedElement.appUsername) {
                            appUsername = renderedElement.appUsername;
                        }
                    });

                    // @ts-ignore
                    if (purpose === postPurpose.Acceptance) {
                        results += userName + " has accepted " + appUsername + "\n";
                    } else { // @ts-ignore
                        if (purpose === postPurpose.Rejection) {
                            results += userName + " has rejected " + appUsername + "\n";
                        } else if(appUsername.length > 0) {
                            purpose = postPurpose.Application;
                        }
                    }

                    console.log("Username: " + userName);
                    console.log("Post Purpose: " + purpose.toString());
                    console.log("Post content: " + resultString);
                    results += "Current Poster's Username: " + userName + "\n" + "Post purpose: " + purpose + "\n" ;

                    if (results.length > 1000) {
                        message.channel.send(results);
                        results = "";
                    }

                    results += "-------------------------------" + "\n";
                });

                if (results.length > 0) {
                    message.channel.send(results);
                }
                results = "";
                currentPage++;
            });
        }
    });
});

client.login(settings.token);

enum postPurpose {
    Bump="Bump",
    Application="Application",
    Acceptance="Acceptance",
    Rejection="Rejection",
}
interface IPostResults {
    postText: string;
    purpose: postPurpose;
    appUsername: string;
}
// Takes a line in a post, determines what it is, then sends a string back depending on what it is.
const renderElement = (elem: CheerioElement): IPostResults => {
    let postText = "";
    let purpose: postPurpose = postPurpose.Bump;
    let appUsername = "";
    if (elem.type === "text" && elem.data) { // Line with actual text in it
        postText += elem.data;

        if (elem.data.includes("Username:")) {
            appUsername = elem.data.split(":")[1].trim();
            purpose = postPurpose.Application;
        } else if(elem.data.includes(settings.acceptanceString)) {
            purpose = postPurpose.Acceptance;
        } else if(elem.data.includes(settings.rejectionString)) {
            purpose = postPurpose.Rejection;
        }

    } else if (elem.type === "tag" && elem.name === "br") { // Standard linebreak
        postText += "\n";
    } else if (elem.type === "tag" && elem.name === "span") { // This is a quoted post
        let spanContents = "";
        spanContents = elem.children.map((nestedElement) => {
            const elementContent = renderElement(nestedElement);
            // Yank the username from the quoted text and set it if we have it.
            if (elementContent.appUsername) {
                appUsername = elementContent.appUsername;
            }
            return elementContent.postText;
        }).join("");
        postText += "-----START QUOTE-----\n" + spanContents + "\n-----END QUOTE-----";
    } else if (elem.type === "tag" && elem.name === "div") { // A div with more elements in it
        elem.children.forEach((nestedElement) => {
            const element = renderElement(nestedElement);
            postText += element.postText;
            if(element.purpose === postPurpose.Acceptance || element.purpose === postPurpose.Rejection) {
                purpose = element.purpose;
            }
        });


    } else {
        console.log(elem.data);
    }
    return {appUsername, purpose, postText };
};

//  HTTP Get method implementation:
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

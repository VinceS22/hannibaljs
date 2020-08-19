import * as Discord from "discord.js";
import {IncomingMessage} from "http";

import cheerio from "cheerio";
import https from "https";
import settings from "./settings.json";
import {Message} from "discord.js";

const client = new Discord.Client();

client.once("ready", () => {
    let results = "";
    let currentPage = -1;
    let lastPage = -1;
    const debug = false;
    let bumpers: {[poster: string]: number} = {};
    let priorBumpers: {[poster: string]: number} = {};
    let applicants: {[poster: string]: boolean} = {};
    let priorApplicants: {[poster: string]: boolean} = {};
    let shouldPollForums: boolean = false;
    let hasNewPost: boolean = false;

    const promises: any[] = [];

    function checkForums(message: Message, notifyMeOnNoNewPosts: boolean = true) {
        // True if the user has a corresponding accept/reject
        promises.push(getWebPage(settings.baseUrl).then((pageNumData) => {
            let $ = cheerio.load(pageNumData);
            lastPage = parseInt($("input[title='Page Number']").prop("max") ?? -1);
            currentPage = lastPage - 1;
            results += "Checking page " + currentPage + " and " + lastPage + "...\n";
            for (currentPage; currentPage <= lastPage; currentPage++) {
                getWebPage(settings.baseUrl + ",goto," + currentPage).then((data) => {
                    console.log('Web call');
                    $ = cheerio.load(data);
                    lastPage = parseInt($("input[title='Page Number']").prop("max") ?? -1);
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
                            if (renderedElement.appUsername) {
                                appUsername = renderedElement.appUsername;
                            }
                        });

                        // @ts-ignore
                        if (purpose === postPurpose.Acceptance || purpose === postPurpose.Rejection) {
                            applicants[appUsername] = true;
                        } else if (appUsername.length > 0) {
                            purpose = postPurpose.Application;
                        }
                        if (debug) {
                            results += "Current Poster's Username: " + userName + "\n" + "Post purpose: " +
                              purpose + "\n";
                        }
                        switch (purpose) {
                            case postPurpose.Bump:
                                if (bumpers[userName]) {
                                    bumpers[userName]++;
                                } else {
                                    bumpers[userName] = 1;
                                }
                                break;
                          // @ts-ignore
                            case postPurpose.Acceptance: // @ts-ignore
                                applicants[appUsername] = true;
                                break;
                          // @ts-ignore
                            case postPurpose.Rejection: // @ts-ignore
                                applicants[appUsername] = true;
                                break;
                            case postPurpose.Application:
                                if (!applicants[appUsername]) {
                                    applicants[appUsername] = false;
                                }
                                break;
                        }
                    });

                });
            }
        }));
        // This is using a timeout. It's gross and I hate it.
        // TODO: Figure out how to incorporate promises correctly for this.
        setTimeout(() => {
            for (const [key, value] of Object.entries(bumpers)) {
                if (bumpers[key] !== priorBumpers[key]) {
                    results += key + " has bumped the thread " + value + " times\n";
                    hasNewPost = true;
                }
            }
            for (const [key, value] of Object.entries(applicants)) {
                if (priorApplicants[key] !== applicants[key]) {
                    results += key + " has applied";
                    if (value) {
                        results += " and has been processed \n";
                    } else {
                        results += " and needs to have their app looked at here: " + settings.baseUrl +
                          ",goto," + currentPage + "\n";
                        results += " Here\'s your command: !rw " + key + "\n";
                    }
                    hasNewPost = true;
                }
            }
            if(hasNewPost || debug) {
                message.channel.send(results);
            } else {
                message.channel.send("Nothing new!");
            }
            priorBumpers = bumpers;
            priorApplicants = applicants;
            bumpers = {};
            applicants = {};
            results = "";
            hasNewPost = false;
        }, 10 * 1000); // * 1000 makes it seconds
    }

    client.on("message", async (message) => {
        if (message.content === "!forums") {
            message.channel.send("Checking forums now.");
            checkForums(message);
        } else if (message.content === "!pollforums") {
            message.channel.send("Activating poll mode.");
            shouldPollForums = true;
            while (shouldPollForums) {
                checkForums(message);
                setInterval(() => {
                    checkForums(message);
                }, 1000 * 20);
            }
        } else if (message.content === "!stoppollforums") {
            message.channel.send("Deactivating poll mode.");
            shouldPollForums = false;
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
            if (appUsername.length > 0) {
                purpose = postPurpose.Application;
            }
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

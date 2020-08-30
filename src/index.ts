import * as Discord from "discord.js";
import {IncomingMessage} from "http";

import cheerio from "cheerio";
import {Message} from "discord.js";
import https from "https";
import settings from "./settings.json";

const client = new Discord.Client();

client.once("ready", () => {
    let results = "";
    let currentPage = -1;
    let lastPage = -1;
    const debug = false;
    let bumpers: {[poster: string]: number} = {};
    let priorBumpers: {[poster: string]: number} = {};
    let applicants: {[poster: string]: IApplicant} = {};
    let priorApplicants: {[poster: string]: IApplicant} = {};
    let hasNewPost: boolean = false;

    const promises: Array<Promise<string | void>> = new Array <Promise<string | void>>();

    function checkForums(message: Message, notifyMeOnNoNewPosts: boolean = true) {
        // True if the user has a corresponding accept/reject
        getWebPage(settings.baseUrl).then((pageNumData) => {
            let $ = cheerio.load(pageNumData);
            //lastPage = parseInt($("input[title='Page Number']").prop("max") ?? -1);
            lastPage = 122;
            currentPage = lastPage - 1;
            results += "Checking page " + currentPage + " and " + lastPage + "...\n";
            for (currentPage; currentPage <= lastPage; currentPage++) {
                const url = settings.baseUrl + ",goto," + currentPage;
                const p: Promise<string | void > =
                  getWebPage(url).then((data) => {
                    $ = cheerio.load(data);
                    // tslint:disable-next-line:radix
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
                            applicants[appUsername] = {url, username: appUsername, hasBeenReviewed: true};
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
                                    applicants[appUsername] = {url, username: appUsername, hasBeenReviewed: false};
                                }
                                break;
                        }
                    });

                });
                if (p) { promises.push(p); }
            }
            Promise.all(promises).then((promise) => {
                for (const [key, value] of Object.entries(bumpers)) {
                    if (bumpers[key] !== priorBumpers[key]) {
                        results += key + " has bumped the thread " + value + " times\n";
                        hasNewPost = true;
                    }
                }
                for (const [key, value] of Object.entries(applicants)) {
                    if (priorApplicants[key]?.hasBeenReviewed !== applicants[key]?.hasBeenReviewed) {
                        results += key + " has applied";
                        if (value.hasBeenReviewed) {
                            results += " and has been reviewed \n";
                        } else {
                            results += " and needs to have their app looked at here: " + value.url;
                            results += " Here\'s your command: !rw " + key + "\n";
                        }
                        hasNewPost = true;
                    } else if (!applicants[key]) {
                        results += key + " still needs to be reviewed\n";
                        hasNewPost = true;
                    }
                }
                if (hasNewPost || debug) {
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
            });
        });
    }

    client.on("message", async (message) => {
        if (message.content === "!forums") {
            message.channel.send("Checking forums now.");
            checkForums(message);
        } else if (message.content === "!") {

        } else if (message.content === "!reset") {
            message.channel.send("Resetting data");
            bumpers = {};
            applicants = {};
            priorApplicants = {};
            priorBumpers = {};
            results = "";
            hasNewPost = false;
        }
        // I can't be assed to throw this on another branch right now, but it's here. I need to get polling working.
        // TODO: Actually implement !pollforums and !pollforums properly
        // else if (message.content === "!pollforums") {
        //     message.channel.send("Activating poll mode.");
        //     shouldPollForums = true;
        //     while (shouldPollForums) {
        //         checkForums(message);
        //         setInterval(() => {
        //             checkForums(message);
        //         }, 1000 * 20);
        //     }
        // } else if (message.content === "!stoppollforums") {
        // } else if (message.content === "!stoppollforums") {
        //     message.channel.send("Deactivating poll mode.");
        //     shouldPollForums = false;
        // }
    });
});

client.login(settings.token);

enum postPurpose {
    Bump= "Bump",
    Application= "Application",
    Acceptance= "Acceptance",
    Rejection= "Rejection",
}
interface IPostResults {
    postText: string;
    purpose: postPurpose;
    appUsername: string;
}
interface IApplicant {
    hasBeenReviewed: boolean;
    url: string;
    username: string;
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
        } else if (elem.data.includes(settings.acceptanceString)) {
            purpose = postPurpose.Acceptance;
        } else if (elem.data.includes(settings.rejectionString)) {
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
            if (element.purpose === postPurpose.Acceptance || element.purpose === postPurpose.Rejection) {
                purpose = element.purpose;
            }
        });
    }
    return {appUsername, purpose, postText };
};

//  HTTP Get method implementation:
async function getWebPage(url = "", data = {}): Promise<string>  {
    return new Promise<string>((resolve, reject) => {
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

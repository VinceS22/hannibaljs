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

    function reset() {
        bumpers = {};
        applicants = {};
        priorApplicants = {};
        priorBumpers = {};
        results = "";
        hasNewPost = false;
    }
    function checkForums(message: Message, notifyMeOnNoNewPosts: boolean = true) {
        // True if the user has a corresponding accept/reject
        getWebPage(settings.baseUrl).then((pageNumData) => {
            let $ = cheerio.load(pageNumData);
            lastPage = parseInt($("input[title='Page Number']").prop("max") ?? -1);
            currentPage = lastPage - 1;
            for (currentPage; currentPage <= lastPage; currentPage++) {
                const url = settings.baseUrl + ",goto," + currentPage;
                const p: Promise<string | void > =
                  getWebPage(url).then((data) => { // Scope: Page
                    $ = cheerio.load(data);
                    // tslint:disable-next-line:radix
                    lastPage = parseInt($("input[title='Page Number']").prop("max") ?? -1);
                    $("article.forum-post").map((index: number, element: CheerioElement) => {
                        const userName = $("h3", element).data("displayname").replace("%A0", " ");
                        const postContent = $(".forum-post__body", element).eq(0).contents();
                        let resultString = "";
                        let appUsername = "";
                        let purpose = postPurpose.Bump;
                        const purposeArr: postPurpose[] = new Array<postPurpose>();
                        postContent.each((i, elem) => { // Scope: Post Content "Node"
                            const renderedElement = renderElement(elem);
                            resultString += renderedElement.postText;
                            if (renderedElement.purpose !== postPurpose.Bump) {
                                purpose = renderedElement.purpose;
                            }
                            if (renderedElement.appUsername) {
                                appUsername = renderedElement.appUsername;
                            }
                            purposeArr.push(purpose);
                        });
                        console.log(purposeArr);
                        // @ts-ignore
                        if (purpose === postPurpose.Acceptance || purpose === postPurpose.Rejection) {
                            applicants[appUsername] = {url, username: appUsername, hasBeenReviewed: true};
                        } else if(purpose === postPurpose.Bump) {
                            if (bumpers[userName]) {
                                bumpers[userName]++;
                            } else {
                                bumpers[userName] = 1;
                            }
                        } else if (purpose === postPurpose.Application) {
                            if (!applicants[appUsername]) {
                                applicants[appUsername] = {url, username: appUsername, hasBeenReviewed: false};
                            }
                        }
                        if (debug) {
                            results += "Current Poster's Username: " + userName + "\n" + "Post purpose: " +
                              purpose + "\n";
                            console.log("page: " + currentPage + results);
                        }
                    });

                });
                if (p) { promises.push(p); }
            }
            Promise.all(promises).then((promise) => {
                results += "Bumps: ";
                for (const [key, value] of Object.entries(bumpers)) {
                    if (bumpers[key] !== priorBumpers[key]) {
                        results += key + " x " + value + " | ";
                        hasNewPost = true;
                    }
                }
                results = results.slice(0, -2);
                results += "\n";
                for (const [key, value] of Object.entries(applicants)) {
                    if (priorApplicants[key]?.hasBeenReviewed !== applicants[key]?.hasBeenReviewed) {
                        results += key + " has applied";
                        if (value.hasBeenReviewed) {
                            results += " and has been reviewed \n";
                        } else {
                            results += " and needs to have their app looked at here: <" + value.url + ">";
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
                reset();
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
            reset();
        }
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
        } else if (elem.data.includes("is your favorite thing to do in-")) {
            purpose = postPurpose.Application;
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

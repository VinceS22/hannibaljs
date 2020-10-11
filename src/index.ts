import cheerio from "cheerio";
import * as Discord from "discord.js";
import {Message} from "discord.js";
const fetch = require('node-fetch');
import userSettings from "./settings.json";

const client = new Discord.Client();
let results = "";

const debug = false;
let priorBumpers: {[poster: string]: number} = {};
let priorApplicants: {[poster: string]: IApplicant} = {};

export interface ISettings {
    prefix: string;
    token: string;
    baseUrl: string;
    acceptanceString: string;
    rejectionString: string;
}

export interface ICheckForumsResults {
    currentPage: number;
    lastPage: number;
    bumpers: { [poster: string]: number };
    applicants: {[poster: string]: IApplicant};
    hasNewBumps: boolean;
    hasNewApplicantResults: boolean;
}
export async function  checkForums(message: Message, settings: ISettings): Promise<ICheckForumsResults> {
    let currentPage = -1;
    let lastPage = -1;
    let bumpers: {[poster: string]: number} = {};
    let applicants: {[poster: string]: IApplicant} = {};
    let hasNewBumps: boolean = false;
    let hasNewApplicantResults: boolean = false;
    const promises: Array<Promise<string | void>> = new Array <Promise<string | void>>();
    // True if the user has a corresponding accept/reject
    await fetch(settings.baseUrl).then((res: any) => res.text()).then(async (pageNumData: any) => {
        const data = pageNumData;
        let $ = cheerio.load(data);
        lastPage = parseInt($("input[title='Page Number']").prop("max") ?? -1);
        currentPage = lastPage - 1;
        for (currentPage; currentPage <= lastPage; currentPage++) {
            const url = settings.baseUrl + ",goto," + currentPage;
            const p: Promise<string | void > =
              await fetch(settings.baseUrl).then((res: any) => res.text()).then((d: any) => { // Scope: Page
                  $ = cheerio.load(d);
                  // tslint:disable-next-line:radix
                  $("article.forum-post").map((index: number, element: CheerioElement) => {
                      const userName = $("h3", element).data("displayname").replace(/%A0/g, " ");
                      const postContent = $(".forum-post__body", element).eq(0).contents();
                      let resultString = "";
                      let appUsername = "";
                      let purpose = postPurpose.Bump;
                      postContent.each((i, elem) => { // Scope: Post Content "Node"
                          const renderedElement = renderElement(elem, settings);
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
                      }
                  });

              });
            if (p) { promises.push(p); }
        }
    });
    return Promise.all(promises).then((promise) => {
        const forumResults: ICheckForumsResults = {applicants, bumpers, currentPage, hasNewApplicantResults,
            hasNewBumps, lastPage};
        results += "Results for pages " + (lastPage - 1) + " and " + lastPage + "\n";
        results += "Bumps: ";
        for (const [key, value] of Object.entries(bumpers)) {
            if (bumpers[key] !== priorBumpers[key]) {
                results += key + " x " + value + " | ";
                hasNewBumps = true;
            }
        }
        results = results.slice(0, -2);
        results += "\n";

        let processedApplicantsStr = "";
        let unprocessedApplicantsStr = "";
        for (const [key, value] of Object.entries(applicants)) {
            if (!priorApplicants[key] ||
              priorApplicants[key].hasBeenReviewed !== applicants[key].hasBeenReviewed) {
                if (value.hasBeenReviewed) {
                    processedApplicantsStr +=  key + "\n";
                } else {
                    unprocessedApplicantsStr += key + " - Link: <" + value.url + ">\n";
                }
                hasNewApplicantResults = true;
            } else if (!applicants[key]) {
                results += key + " still needs to be reviewed\n";
                hasNewApplicantResults = true;
            }
        }
        if (hasNewApplicantResults) {
            if (processedApplicantsStr.length > 0) {
                results += "**Processed Applicants:**\n";
                results += processedApplicantsStr;
            }
            if (unprocessedApplicantsStr.length > 0) {
                results += "**Unprocessed Applicants:**\n";
                results += unprocessedApplicantsStr;
            }
        }
        if (hasNewApplicantResults || hasNewBumps || debug) {
            hasNewApplicantResults = false;
            hasNewBumps = false;
            message.channel.send(results);
        } else {
            message.channel.send("Nothing new!");
        }
        priorBumpers = deepCopy(bumpers);
        priorApplicants = deepCopy(applicants);
        bumpers = {};
        applicants = {};
        hasNewApplicantResults = false;
        hasNewBumps = false;
        results = "";
        return forumResults;
    });
}

client.once("ready", () => {

    function reset() {
        priorApplicants = {};
        priorBumpers = {};
        results = "";
    }


    client.on("message", async (message) => {
        if (message.content === "!forums") {
            message.channel.send("Checking forums now.");
            checkForums(message, userSettings);
        } else if (message.content === "!reset") {
            message.channel.send("Resetting data");
            reset();
        }
    });
});

client.login(userSettings.token);

enum postPurpose {
    Bump= "Bump",
    Application= "Application",
    Acceptance= "Acceptance",
    Rejection= "Rejection",
}
export interface IPostResults {
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
export const renderElement = (elem: CheerioElement, settings: ISettings): IPostResults => {
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
            const elementContent = renderElement(nestedElement, settings);
            // Yank the username from the quoted text and set it if we have it.
            if (elementContent.appUsername) {
                appUsername = elementContent.appUsername;
            }
            return elementContent.postText;
        }).join("");
        postText += "-----START QUOTE-----\n" + spanContents + "\n-----END QUOTE-----";
    } else if (elem.type === "tag" && elem.name === "div") { // A div with more elements in it
        elem.children.forEach((nestedElement) => {
            const element = renderElement(nestedElement, settings);
            postText += element.postText;
            if (element.purpose === postPurpose.Acceptance || element.purpose === postPurpose.Rejection) {
                purpose = element.purpose;
            }
        });
    }
    return {appUsername, purpose, postText };
};

/**
 * Deep copy function for TypeScript.
 * @param T Generic type of target/copied value.
 * @param target Target value to be copied.
 * @see Source project, ts-deepcopy https://github.com/ykdr2017/ts-deepcopy
 * @see Code pen https://codepen.io/erikvullings/pen/ejyBYg
 */
export const deepCopy = <T>(target: T): T => {
    if (target === null) {
        return target;
    }
    if (target instanceof Date) {
        return new Date(target.getTime()) as any;
    }
    if (target instanceof Array) {
        const cp = [] as any[];
        (target as any[]).forEach((v) => { cp.push(v); });
        return cp.map((n: any) => deepCopy<any>(n)) as any;
    }
    if (typeof target === 'object' && target !== {}) {
        const cp = { ...(target as { [key: string]: any }) } as { [key: string]: any };
        Object.keys(cp).forEach(k => {
            cp[k] = deepCopy<any>(cp[k]);
        });
        return cp as T;
    }
    return target;
};
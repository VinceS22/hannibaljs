"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deepCopy = void 0;
var Discord = __importStar(require("discord.js"));
var cheerio_1 = __importDefault(require("cheerio"));
var https_1 = __importDefault(require("https"));
var settings_json_1 = __importDefault(require("./settings.json"));
var client = new Discord.Client();
client.once("ready", function () {
    var results = "";
    var currentPage = -1;
    var lastPage = -1;
    var debug = false;
    var bumpers = {};
    var priorBumpers = {};
    var applicants = {};
    var priorApplicants = {};
    var hasNewApplicantResults = false;
    var hasNewBumps = false;
    function reset() {
        bumpers = {};
        applicants = {};
        priorApplicants = {};
        priorBumpers = {};
        results = "";
        hasNewApplicantResults = false;
        hasNewBumps = false;
    }
    function checkForums(message, notifyMeOnNoNewPosts) {
        if (notifyMeOnNoNewPosts === void 0) { notifyMeOnNoNewPosts = true; }
        var promises = new Array();
        // True if the user has a corresponding accept/reject
        getWebPage(settings_json_1.default.baseUrl).then(function (pageNumData) {
            var _a;
            var $ = cheerio_1.default.load(pageNumData);
            lastPage = parseInt((_a = $("input[title='Page Number']").prop("max")) !== null && _a !== void 0 ? _a : -1);
            currentPage = lastPage - 1;
            var _loop_1 = function () {
                var url = settings_json_1.default.baseUrl + ",goto," + currentPage;
                var p = getWebPage(url).then(function (data) {
                    $ = cheerio_1.default.load(data);
                    // tslint:disable-next-line:radix
                    $("article.forum-post").map(function (index, element) {
                        var userName = $("h3", element).data("displayname").replace(/%A0/g, " ");
                        var postContent = $(".forum-post__body", element).eq(0).contents();
                        var resultString = "";
                        var appUsername = "";
                        var purpose = postPurpose.Bump;
                        postContent.each(function (i, elem) {
                            var renderedElement = renderElement(elem);
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
                            applicants[appUsername] = { url: url, username: appUsername, hasBeenReviewed: true };
                        }
                        else if (purpose === postPurpose.Bump) {
                            if (bumpers[userName]) {
                                bumpers[userName]++;
                            }
                            else {
                                bumpers[userName] = 1;
                            }
                        }
                        else if (purpose === postPurpose.Application) {
                            if (!applicants[appUsername]) {
                                applicants[appUsername] = { url: url, username: appUsername, hasBeenReviewed: false };
                            }
                        }
                        if (debug) {
                            results += "Current Poster's Username: " + userName + "\n" + "Post purpose: " +
                                purpose + "\n";
                            console.log("page: " + currentPage + results);
                        }
                    });
                });
                if (p) {
                    promises.push(p);
                }
            };
            for (currentPage; currentPage <= lastPage; currentPage++) {
                _loop_1();
            }
            Promise.all(promises).then(function (promise) {
                results += "Results for pages " + (lastPage - 1) + " and " + lastPage + "\n";
                results += "Bumps: ";
                for (var _i = 0, _a = Object.entries(bumpers); _i < _a.length; _i++) {
                    var _b = _a[_i], key = _b[0], value = _b[1];
                    if (bumpers[key] !== priorBumpers[key]) {
                        results += key + " x " + value + " | ";
                        hasNewBumps = true;
                    }
                }
                results = results.slice(0, -2);
                results += "\n";
                var processedApplicantsStr = "";
                var unprocessedApplicantsStr = "";
                for (var _c = 0, _d = Object.entries(applicants); _c < _d.length; _c++) {
                    var _e = _d[_c], key = _e[0], value = _e[1];
                    if (!priorApplicants[key] ||
                        priorApplicants[key].hasBeenReviewed !== applicants[key].hasBeenReviewed) {
                        if (value.hasBeenReviewed) {
                            processedApplicantsStr += key + "\n";
                        }
                        else {
                            unprocessedApplicantsStr += key + " - Link: <" + value.url + ">\n";
                        }
                        hasNewApplicantResults = true;
                    }
                    else if (!applicants[key]) {
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
                }
                else {
                    message.channel.send("Nothing new!");
                }
                priorBumpers = exports.deepCopy(bumpers);
                priorApplicants = exports.deepCopy(applicants);
                bumpers = {};
                applicants = {};
                hasNewApplicantResults = false;
                hasNewBumps = false;
                results = "";
            });
        });
    }
    client.on("message", function (message) { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            if (message.content === "!forums") {
                message.channel.send("Checking forums now.");
                checkForums(message);
            }
            else if (message.content === "!inc") {
                lastPage++;
                message.channel.send("Last Page: " + lastPage);
            }
            else if (message.content === "!reset") {
                message.channel.send("Resetting data");
                reset();
            }
            return [2 /*return*/];
        });
    }); });
});
client.login(settings_json_1.default.token);
var postPurpose;
(function (postPurpose) {
    postPurpose["Bump"] = "Bump";
    postPurpose["Application"] = "Application";
    postPurpose["Acceptance"] = "Acceptance";
    postPurpose["Rejection"] = "Rejection";
})(postPurpose || (postPurpose = {}));
// Takes a line in a post, determines what it is, then sends a string back depending on what it is.
var renderElement = function (elem) {
    var postText = "";
    var purpose = postPurpose.Bump;
    var appUsername = "";
    if (elem.type === "text" && elem.data) { // Line with actual text in it
        postText += elem.data;
        if (elem.data.includes("Username:")) {
            appUsername = elem.data.split(":")[1].trim();
            if (appUsername.length > 0) {
                purpose = postPurpose.Application;
            }
        }
        else if (elem.data.includes(settings_json_1.default.acceptanceString)) {
            purpose = postPurpose.Acceptance;
        }
        else if (elem.data.includes(settings_json_1.default.rejectionString)) {
            purpose = postPurpose.Rejection;
        }
        else if (elem.data.includes("is your favorite thing to do in-")) {
            purpose = postPurpose.Application;
        }
    }
    else if (elem.type === "tag" && elem.name === "br") { // Standard linebreak
        postText += "\n";
    }
    else if (elem.type === "tag" && elem.name === "span") { // This is a quoted post
        var spanContents = "";
        spanContents = elem.children.map(function (nestedElement) {
            var elementContent = renderElement(nestedElement);
            // Yank the username from the quoted text and set it if we have it.
            if (elementContent.appUsername) {
                appUsername = elementContent.appUsername;
            }
            return elementContent.postText;
        }).join("");
        postText += "-----START QUOTE-----\n" + spanContents + "\n-----END QUOTE-----";
    }
    else if (elem.type === "tag" && elem.name === "div") { // A div with more elements in it
        elem.children.forEach(function (nestedElement) {
            var element = renderElement(nestedElement);
            postText += element.postText;
            if (element.purpose === postPurpose.Acceptance || element.purpose === postPurpose.Rejection) {
                purpose = element.purpose;
            }
        });
    }
    return { appUsername: appUsername, purpose: purpose, postText: postText };
};
//  HTTP Get method implementation:
function getWebPage(url, data) {
    if (url === void 0) { url = ""; }
    if (data === void 0) { data = {}; }
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, new Promise(function (resolve, reject) {
                    https_1.default.get(url, function (response) {
                        var responseData = "";
                        response.on("data", function (chunk) {
                            responseData += chunk;
                        });
                        response.on("end", function () {
                            resolve(responseData);
                        });
                    }).on("error", function (err) {
                        console.log("Error: " + err.message);
                        reject(err.message);
                    });
                })];
        });
    });
}
/**
 * Deep copy function for TypeScript.
 * @param T Generic type of target/copied value.
 * @param target Target value to be copied.
 * @see Source project, ts-deepcopy https://github.com/ykdr2017/ts-deepcopy
 * @see Code pen https://codepen.io/erikvullings/pen/ejyBYg
 */
exports.deepCopy = function (target) {
    if (target === null) {
        return target;
    }
    if (target instanceof Date) {
        return new Date(target.getTime());
    }
    if (target instanceof Array) {
        var cp_1 = [];
        target.forEach(function (v) { cp_1.push(v); });
        return cp_1.map(function (n) { return exports.deepCopy(n); });
    }
    if (typeof target === 'object' && target !== {}) {
        var cp_2 = __assign({}, target);
        Object.keys(cp_2).forEach(function (k) {
            cp_2[k] = exports.deepCopy(cp_2[k]);
        });
        return cp_2;
    }
    return target;
};

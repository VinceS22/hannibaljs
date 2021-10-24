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
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.deepCopy = exports.renderElement = exports.resolveAllApplicants = exports.checkForums = exports.generateBumpReport = void 0;
var cheerio_1 = __importDefault(require("cheerio"));
var Discord = __importStar(require("discord.js"));
var fs_1 = __importDefault(require("fs"));
var node_fetch_1 = __importDefault(require("node-fetch"));
var path_1 = __importDefault(require("path"));
var settings_json_1 = __importDefault(require("./settings.json"));
var client = new Discord.Client();
var results = "";
var debug = false;
var priorBumpers = {};
var priorApplicants = {};
var dateSinceLastReset = new Date();
var file = JSON.parse((_a = fs_1.default.readFileSync(path_1.default.resolve(__dirname, "../data.json"))) === null || _a === void 0 ? void 0 : _a.toString());
if (file) {
    priorBumpers = file.priorBumpers;
    priorApplicants = file.priorApplicants;
    dateSinceLastReset = dateSinceLastReset;
}
client.once("ready", function () {
    var helpMessage = "Available commands: \n!forums : Returns the summary of Vox's last two forum pages" +
        "\n!reset : Resets all data about prior people who applied and bumped. This will reset the !bump report date as well" +
        "\n!bump : Returns a list of all unique people who bumped. Will be reset with !reset " +
        "\n!process: Will process all applicants as reviewed. Useful for situations we don't actually need to review the application";
    function reset() {
        priorApplicants = {};
        priorBumpers = {};
        results = "";
        dateSinceLastReset = new Date();
    }
    client.on("message", function (message) { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!(message.content === "!forums")) return [3 /*break*/, 3];
                    return [4 /*yield*/, message.channel.send("Checking forums now.")];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, checkForums(message, settings_json_1.default)];
                case 2:
                    _a.sent();
                    return [3 /*break*/, 11];
                case 3:
                    if (!(message.content === "!reset")) return [3 /*break*/, 5];
                    return [4 /*yield*/, message.channel.send("Resetting data")];
                case 4:
                    _a.sent();
                    reset();
                    return [3 /*break*/, 11];
                case 5:
                    if (!(message.content === "!process")) return [3 /*break*/, 7];
                    priorApplicants = resolveAllApplicants(priorApplicants);
                    return [4 /*yield*/, message.channel.send("All applicants are processed")];
                case 6:
                    _a.sent();
                    return [3 /*break*/, 11];
                case 7:
                    if (!(message.content === "!bump")) return [3 /*break*/, 9];
                    return [4 /*yield*/, message.channel.send(generateBumpReport(priorBumpers, dateSinceLastReset.toDateString()))];
                case 8:
                    _a.sent();
                    return [3 /*break*/, 11];
                case 9:
                    if (!(message.content === "!help")) return [3 /*break*/, 11];
                    return [4 /*yield*/, message.channel.send(helpMessage)];
                case 10:
                    _a.sent();
                    _a.label = 11;
                case 11: return [2 /*return*/];
            }
        });
    }); });
});
client.login(settings_json_1.default.token);
function generateBumpReport(bumpers, date) {
    var bumperNames = [];
    var bumperString = "";
    var returnValue = "";
    for (var _i = 0, _a = Object.entries(bumpers); _i < _a.length; _i++) {
        var _b = _a[_i], key = _b[0], value = _b[1];
        bumperNames.push(key);
    }
    if (bumperNames.length === 0) {
        returnValue = "No bumpers found";
    }
    else {
        bumperNames.sort();
        bumperNames.forEach(function (name) {
            bumperString += name + ", ";
        });
        returnValue = "Bumpers as of " + date + ": " + bumperString;
        returnValue = returnValue.substring(0, returnValue.length - 2); // Probably a better way, but I'm lazy. :(
    }
    return returnValue;
}
exports.generateBumpReport = generateBumpReport;
function checkForums(message, settings) {
    var _a, _b;
    return __awaiter(this, void 0, void 0, function () {
        var currentPage, lastPage, bumpers, applicants, hasNewBumps, hasNewApplicantResults, options, forumResults, addedBumpsStr, _i, _c, _d, key, value, processedApplicantsStr, unprocessedApplicantsStr, stillNeedsReviewing, _e, _f, _g, key, value, jsonData;
        var _this = this;
        return __generator(this, function (_h) {
            switch (_h.label) {
                case 0:
                    currentPage = -1;
                    lastPage = -1;
                    bumpers = {};
                    applicants = {};
                    hasNewBumps = false;
                    hasNewApplicantResults = false;
                    options = {
                        headers: {
                            "User-Agent": settings.userAgent,
                        },
                        insecureHTTPParser: true,
                    };
                    // True if the user has a corresponding accept/reject
                    return [4 /*yield*/, node_fetch_1.default(settings.baseUrl, options).then(function (res) { return res.text(); }).then(function (pageNumData) { return __awaiter(_this, void 0, void 0, function () {
                            var data, $, _loop_1;
                            var _a;
                            return __generator(this, function (_b) {
                                switch (_b.label) {
                                    case 0:
                                        data = pageNumData;
                                        $ = cheerio_1.default.load(data);
                                        // tslint:disable-next-line:radix
                                        lastPage = parseInt((_a = $("input[title='Page Number']").prop("max")) !== null && _a !== void 0 ? _a : -1);
                                        currentPage = lastPage - 1;
                                        _loop_1 = function () {
                                            var url;
                                            return __generator(this, function (_a) {
                                                switch (_a.label) {
                                                    case 0:
                                                        url = settings.baseUrl + ",goto," + currentPage;
                                                        return [4 /*yield*/, node_fetch_1.default(url, options).then(function (res) { return res.text(); }).then(function (d) {
                                                                $ = cheerio_1.default.load(d);
                                                                // tslint:disable-next-line:radix
                                                                $("article.forum-post").map(function (index, element) {
                                                                    var userName = $("h3", element).data("displayname").replace(/%A0/g, " ");
                                                                    var postContent = $(".forum-post__body", element).eq(0).contents();
                                                                    var resultString = "";
                                                                    var appUsername = "";
                                                                    var purpose = postPurpose.Bump;
                                                                    postContent.each(function (i, elem) {
                                                                        var renderedElement = exports.renderElement(elem, settings);
                                                                        resultString += renderedElement.postText;
                                                                        if (renderedElement.purpose !== postPurpose.Bump) {
                                                                            purpose = renderedElement.purpose;
                                                                        }
                                                                        if (renderedElement.appUsername) {
                                                                            appUsername = renderedElement.appUsername;
                                                                        }
                                                                    });
                                                                    if (appUsername.length > 0 &&
                                                                        // @ts-ignore
                                                                        (purpose === postPurpose.Acceptance || purpose === postPurpose.Rejection)) {
                                                                        applicants[appUsername] = { url: url, username: appUsername, hasBeenReviewed: true,
                                                                            manuallyProcessed: false };
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
                                                                        if (appUsername.length === 0) {
                                                                            appUsername = userName;
                                                                        }
                                                                        if (!applicants[appUsername]) {
                                                                            applicants[appUsername] = { url: url, username: appUsername, hasBeenReviewed: false,
                                                                                manuallyProcessed: false };
                                                                        }
                                                                    }
                                                                    if (debug) {
                                                                        results += "Current Poster's Username: " + userName + "\n" + "Post purpose: " +
                                                                            purpose + "\n";
                                                                    }
                                                                });
                                                            })];
                                                    case 1:
                                                        _a.sent();
                                                        return [2 /*return*/];
                                                }
                                            });
                                        };
                                        currentPage;
                                        _b.label = 1;
                                    case 1:
                                        if (!(currentPage <= lastPage)) return [3 /*break*/, 4];
                                        return [5 /*yield**/, _loop_1()];
                                    case 2:
                                        _b.sent();
                                        _b.label = 3;
                                    case 3:
                                        currentPage++;
                                        return [3 /*break*/, 1];
                                    case 4: return [2 /*return*/];
                                }
                            });
                        }); })];
                case 1:
                    // True if the user has a corresponding accept/reject
                    _h.sent();
                    forumResults = { applicants: applicants, bumpers: bumpers, currentPage: currentPage, hasNewApplicantResults: hasNewApplicantResults,
                        hasNewBumps: hasNewBumps, lastPage: lastPage };
                    results += "Results for pages " + (lastPage - 1) + " and " + lastPage + "\n";
                    addedBumpsStr = false;
                    for (_i = 0, _c = Object.entries(bumpers); _i < _c.length; _i++) {
                        _d = _c[_i], key = _d[0], value = _d[1];
                        if (bumpers[key] !== priorBumpers[key]) {
                            if (!addedBumpsStr) {
                                results += "Bumps: ";
                                addedBumpsStr = true;
                            }
                            results += key + " x " + value + " | ";
                            hasNewBumps = true;
                        }
                    }
                    results = results.slice(0, -2);
                    results += "\n";
                    processedApplicantsStr = "";
                    unprocessedApplicantsStr = "";
                    stillNeedsReviewing = "";
                    for (_e = 0, _f = Object.entries(applicants); _e < _f.length; _e++) {
                        _g = _f[_e], key = _g[0], value = _g[1];
                        if (!priorApplicants[key] ||
                            priorApplicants[key].hasBeenReviewed !== applicants[key].hasBeenReviewed ||
                            debug) {
                            if (applicants[key].hasBeenReviewed || applicants[key].manuallyProcessed) {
                                processedApplicantsStr += key + "\n";
                            }
                            else {
                                unprocessedApplicantsStr += key + " - Link: <" + value.url + ">\n";
                            }
                            hasNewApplicantResults = true;
                        }
                        else if (!((_a = applicants[key]) === null || _a === void 0 ? void 0 : _a.hasBeenReviewed) && !priorApplicants[key].manuallyProcessed) {
                            stillNeedsReviewing += key + " still needs to be reviewed - Link: <" + value.url + ">\n";
                            hasNewApplicantResults = true;
                        }
                        applicants[key].manuallyProcessed = (_b = priorApplicants[key]) === null || _b === void 0 ? void 0 : _b.manuallyProcessed;
                    }
                    if (hasNewApplicantResults || debug) {
                        if (processedApplicantsStr.length > 0) {
                            results += "**Processed Applicants:**\n";
                            results += processedApplicantsStr;
                        }
                        if (unprocessedApplicantsStr.length > 0 || stillNeedsReviewing.length > 0) {
                            results += "**Unprocessed Applicants:**\n";
                            results += unprocessedApplicantsStr;
                            results += stillNeedsReviewing;
                        }
                    }
                    if (!(hasNewApplicantResults || hasNewBumps || debug)) return [3 /*break*/, 3];
                    return [4 /*yield*/, message.channel.send(results)];
                case 2:
                    _h.sent();
                    return [3 /*break*/, 5];
                case 3: return [4 /*yield*/, message.channel.send("Nothing new!")];
                case 4:
                    _h.sent();
                    _h.label = 5;
                case 5:
                    priorBumpers = exports.deepCopy(bumpers);
                    priorApplicants = exports.deepCopy(applicants);
                    jsonData = {
                        dateSinceLastReset: dateSinceLastReset,
                        priorApplicants: priorApplicants,
                        priorBumpers: priorBumpers,
                    };
                    fs_1.default.writeFile("../data.json", JSON.stringify(jsonData), function (err) {
                        if (err) {
                            // tslint:disable-next-line:no-console
                            console.log(err);
                        }
                    });
                    bumpers = {};
                    applicants = {};
                    results = "";
                    return [2 /*return*/, forumResults];
            }
        });
    });
}
exports.checkForums = checkForums;
function resolveAllApplicants(orig) {
    for (var _i = 0, _a = Object.entries(orig); _i < _a.length; _i++) {
        var _b = _a[_i], key = _b[0], value = _b[1];
        orig[key].manuallyProcessed = true;
    }
    return orig;
}
exports.resolveAllApplicants = resolveAllApplicants;
var postPurpose;
(function (postPurpose) {
    postPurpose["Bump"] = "Bump";
    postPurpose["Application"] = "Application";
    postPurpose["Acceptance"] = "Acceptance";
    postPurpose["Rejection"] = "Rejection";
})(postPurpose || (postPurpose = {}));
// Takes a line in a post, determines what it is, then sends a string back depending on what it is.
exports.renderElement = function (elem, settings) {
    var _a, _b, _c;
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
            else {
                appUsername = (_b = (_a = elem.nextSibling.children[0]) === null || _a === void 0 ? void 0 : _a.data) !== null && _b !== void 0 ? _b : "";
                if (appUsername.length === 0) {
                    if (elem.nextSibling.name === "br") {
                        while (elem.nextSibling && elem.nextSibling.name === "br") {
                            elem = elem.nextSibling;
                        }
                        elem = elem.nextSibling;
                    }
                    appUsername = (_c = elem.data) !== null && _c !== void 0 ? _c : "";
                }
            }
        }
        else if (elem.data.includes(settings.acceptanceString)) {
            purpose = postPurpose.Acceptance;
        }
        else if (elem.data.includes(settings.rejectionString)) {
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
            var elementContent = exports.renderElement(nestedElement, settings);
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
            var element = exports.renderElement(nestedElement, settings);
            postText += element.postText;
            if (element.purpose === postPurpose.Acceptance || element.purpose === postPurpose.Rejection) {
                purpose = element.purpose;
            }
        });
    }
    return { appUsername: appUsername, purpose: purpose, postText: postText };
};
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
    if (typeof target === "object" && target !== {}) {
        var cp_2 = __assign({}, target);
        Object.keys(cp_2).forEach(function (k) {
            cp_2[k] = exports.deepCopy(cp_2[k]);
        });
        return cp_2;
    }
    return target;
};
//# sourceMappingURL=index.js.map
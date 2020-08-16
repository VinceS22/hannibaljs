"use strict";
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
var Discord = __importStar(require("discord.js"));
var cheerio_1 = __importDefault(require("cheerio"));
var https_1 = __importDefault(require("https"));
var settings_json_1 = __importDefault(require("./settings.json"));
var client = new Discord.Client();
client.once("ready", function () {
    var results = "";
    var currentPage = 100;
    client.on("message", function (message) {
        if (message.content === "a") {
            message.channel.send("This is the help. Im helping! :)");
            getWebPage(settings_json_1.default.baseUrl + ",goto," + currentPage).then(function (data) {
                var webPage = cheerio_1.default.load(data);
                webPage("article.forum-post").map(function (index, element) {
                    var userName = webPage("h3", element).data("displayname").replace("%A0", " ");
                    var postContent = webPage(".forum-post__body", element).eq(0).contents();
                    var resultString = "";
                    var isQuotedApplication = false;
                    var applicantUsername = "";
                    postContent.each(function (i, elem) {
                        if (elem.type === "text" && elem.data) {
                            if (isQuotedApplication) {
                                if (elem.data.includes("Username")) {
                                    var splitData = elem.data.split(" ");
                                    if (splitData.length > 0) {
                                        applicantUsername = splitData[1];
                                    }
                                }
                            }
                            else {
                                resultString += elem.data;
                            }
                        }
                        else if (elem.type === "tag" && elem.name === "br") {
                            if (!isQuotedApplication) {
                                resultString += "\n";
                            }
                        }
                        else if (elem.type === "tag" && elem.name === "span") {
                            isQuotedApplication = !isQuotedApplication;
                        }
                        else {
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
                currentPage++;
            });
        }
    });
});
client.login(settings_json_1.default.token);
//  Get method implementation:
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

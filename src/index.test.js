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
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
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
jest.mock("discord.js");
var fs_1 = require("fs");
var jest_discordjs_mocks_1 = require("jest-discordjs-mocks");
var jest_fetch_mock_1 = __importDefault(require("jest-fetch-mock"));
jest.unmock("./index");
var fs = __importStar(require("fs"));
var index_1 = require("./index");
var settings_json_1 = __importDefault(require("./settings.json"));
settings_json_1.default.rejectionString = "you have been accepted";
settings_json_1.default.acceptanceString = "your application has been rejected";
var loadedPages = [];
for (var i = 1; i < 8; i++) {
    var d = (0, fs_1.readFileSync)("./mocks/" + i + ".html").toString();
    loadedPages.push(d);
}
// jest.mock("fs");
// const mockFS: jest.Mocked<typeof fs> = fs as jest.Mocked<typeof fs>;
describe("Parsing tests for Hannibal bot", function () {
    // beforeAll(() => {
    //   // clear any previous calls
    //   mockFS.writeFileSync.mockClear();
    //
    //   // since you're using fs.readFileSync
    //   // set some retun data to be used in your implementation
    //   mockFS.readFileSync.mockReturnValue("");
    // });
    //
    // it("should match snapshot of calls", () => {
    //   expect(mockFS.writeFileSync.mock.calls).toMatchSnapshot();
    // });
    //
    // it("should have called 3 times", () => {
    //   expect(mockFS.writeFileSync).toHaveBeenCalledTimes(3);
    // });
    //
    // it("should have called with...", () => {
    //   expect(mockFS.writeFileSync).toHaveBeenCalledWith(
    //     "/root/test/path/tslint.json",
    //     "X", // <- this is the mock return value from above
    //   );
    // });
    test("General purpose parsing", function () { return __awaiter(void 0, void 0, void 0, function () {
        var message, results;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    message = new jest_discordjs_mocks_1.MockMessage();
                    message.channel = new jest_discordjs_mocks_1.MockTextChannel();
                    // Two of the first one because we call once first to get the page number
                    jest_fetch_mock_1.default.once(loadedPages[0]).once(loadedPages[0]).once(loadedPages[1]);
                    return [4 /*yield*/, (0, index_1.checkForums)(message, settings_json_1.default)];
                case 1:
                    results = _a.sent();
                    expect(results.bumpers["dingus prime"]).toBe(2);
                    expect(results.bumpers.birdup).toBe(13);
                    expect(results.bumpers.ladygodiva).toBe(1);
                    expect(results.lastPage).toBe(138);
                    expect(results.currentPage).toBe(139);
                    expect(results.hasNewApplicantResults).toBe(false);
                    return [2 /*return*/];
            }
        });
    }); });
    test("Special purpose parsing", function () { return __awaiter(void 0, void 0, void 0, function () {
        var message, results;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    message = new jest_discordjs_mocks_1.MockMessage();
                    message.channel = new jest_discordjs_mocks_1.MockTextChannel();
                    // Two of the first one because we call once first to get the page number
                    jest_fetch_mock_1.default.once(loadedPages[1]).once(loadedPages[1]).once(loadedPages[2]);
                    return [4 /*yield*/, (0, index_1.checkForums)(message, settings_json_1.default)];
                case 1:
                    results = _a.sent();
                    expect(results.bumpers["dingus prime"]).toBe(2);
                    expect(results.bumpers.birdup).toBe(9);
                    expect(results.bumpers.ladygodiva).toBe(1);
                    expect(results.lastPage).toBe(138);
                    expect(results.currentPage).toBe(139);
                    expect(results.hasNewApplicantResults).toBe(false);
                    return [2 /*return*/];
            }
        });
    }); });
    test("Big posts", function () { return __awaiter(void 0, void 0, void 0, function () {
        var message, results;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    message = new jest_discordjs_mocks_1.MockMessage();
                    message.channel = new jest_discordjs_mocks_1.MockTextChannel();
                    // Two of the first one because we call once first to get the page number
                    jest_fetch_mock_1.default.once(loadedPages[2]).once(loadedPages[2]).once(loadedPages[3]);
                    return [4 /*yield*/, (0, index_1.checkForums)(message, settings_json_1.default)];
                case 1:
                    results = _a.sent();
                    expect(results.bumpers["dingus prime"]).toBeUndefined();
                    expect(results.bumpers.ladygodiva).toBeUndefined();
                    expect(results.bumpers.birdup).toBe(12);
                    expect(results.applicants.THRILLHOUSE.hasBeenReviewed).toBe(true);
                    expect(results.applicants["Borth Sompson"].hasBeenReviewed).toBe(true);
                    expect(results.applicants["360noscopepraisehim"].hasBeenReviewed).toBe(true);
                    expect(results.applicants.Jabroni.hasBeenReviewed).toBe(true);
                    expect(results.lastPage).toBe(138);
                    expect(results.currentPage).toBe(139);
                    expect(results.hasNewApplicantResults).toBe(false);
                    return [2 /*return*/];
            }
        });
    }); });
    test("Nested quotes does should be recognized as bumps", function () { return __awaiter(void 0, void 0, void 0, function () {
        var message, results;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    message = new jest_discordjs_mocks_1.MockMessage();
                    message.channel = new jest_discordjs_mocks_1.MockTextChannel();
                    jest_fetch_mock_1.default.mockResponse(loadedPages[4]);
                    return [4 /*yield*/, (0, index_1.checkForums)(message, settings_json_1.default)];
                case 1:
                    results = _a.sent();
                    expect(results.applicants.Jabroni).toBeUndefined();
                    expect(results.bumpers.Jabroni).toBe(2);
                    return [2 /*return*/];
            }
        });
    }); });
    test("Special formatting in Username portion should not cause the results to break.", function () { return __awaiter(void 0, void 0, void 0, function () {
        var message, results;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    message = new jest_discordjs_mocks_1.MockMessage();
                    message.channel = new jest_discordjs_mocks_1.MockTextChannel();
                    jest_fetch_mock_1.default.mockResponse(loadedPages[5]);
                    return [4 /*yield*/, (0, index_1.checkForums)(message, settings_json_1.default)];
                case 1:
                    results = _a.sent();
                    expect(results.applicants.formatfanatic).toBeDefined();
                    expect(results.applicants.formatfanatic.hasBeenReviewed).toBe(false);
                    return [2 /*return*/];
            }
        });
    }); });
    test("process should properly resolve all applicants to reviewed", function () { return __awaiter(void 0, void 0, void 0, function () {
        var message, results;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    message = new jest_discordjs_mocks_1.MockMessage();
                    message.channel = new jest_discordjs_mocks_1.MockTextChannel();
                    jest_fetch_mock_1.default.mockResponse(loadedPages[5]);
                    return [4 /*yield*/, (0, index_1.checkForums)(message, settings_json_1.default)];
                case 1:
                    results = _a.sent();
                    expect(results.applicants.formatfanatic).toBeDefined();
                    expect(results.applicants.formatfanatic.hasBeenReviewed).toBe(false);
                    results.applicants = (0, index_1.resolveAllApplicants)(results.applicants);
                    expect(results.applicants.formatfanatic.manuallyProcessed).toBe(true);
                    return [2 /*return*/];
            }
        });
    }); });
    test("If the mod has styled the name of the applicant, we shall strip the formatting.", function () { return __awaiter(void 0, void 0, void 0, function () {
        var message, results;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    message = new jest_discordjs_mocks_1.MockMessage();
                    message.channel = new jest_discordjs_mocks_1.MockTextChannel();
                    jest_fetch_mock_1.default.mockResponse(loadedPages[5]);
                    return [4 /*yield*/, (0, index_1.checkForums)(message, settings_json_1.default)];
                case 1:
                    results = _a.sent();
                    expect(results.applicants.gregthegreenguy).toBeDefined();
                    expect(results.applicants.gregthegreenguy.hasBeenReviewed).toBe(true);
                    return [2 /*return*/];
            }
        });
    }); });
    test("If the mod has styled the name of the applicant with br tags, we shall strip the brs.", function () { return __awaiter(void 0, void 0, void 0, function () {
        var message, results;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    message = new jest_discordjs_mocks_1.MockMessage();
                    message.channel = new jest_discordjs_mocks_1.MockTextChannel();
                    jest_fetch_mock_1.default.mockResponse(loadedPages[6]);
                    return [4 /*yield*/, (0, index_1.checkForums)(message, settings_json_1.default)];
                case 1:
                    results = _a.sent();
                    expect(results.applicants.Dredd).toBeDefined();
                    expect(results.applicants.Dredd.hasBeenReviewed).toBe(true);
                    return [2 /*return*/];
            }
        });
    }); });
    test("Should properly generate a bump report", function () { return __awaiter(void 0, void 0, void 0, function () {
        var message, results, expectedReportResults;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    message = new jest_discordjs_mocks_1.MockMessage();
                    message.channel = new jest_discordjs_mocks_1.MockTextChannel();
                    // Two of the first one because we call once first to get the page number
                    jest_fetch_mock_1.default.once(loadedPages[1]).once(loadedPages[1]).once(loadedPages[2]);
                    return [4 /*yield*/, (0, index_1.checkForums)(message, settings_json_1.default)];
                case 1:
                    results = _a.sent();
                    expectedReportResults = "Bumpers as of {dateEstablished}: birdup, dingus prime, ladygodiva";
                    expect((0, index_1.generateBumpReport)(results.bumpers, "{dateEstablished}")).toBe(expectedReportResults);
                    return [2 /*return*/];
            }
        });
    }); });
    test("When hannibal starts, a file will exist containing prior results or it will be created", function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            jest.spyOn(fs, "mkdirSync");
            return [2 /*return*/];
        });
    }); });
});
//# sourceMappingURL=index.test.js.map
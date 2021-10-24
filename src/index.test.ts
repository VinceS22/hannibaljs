
jest.mock("discord.js");
import {readFileSync} from "fs";
import {MockMessage, MockTextChannel} from "jest-discordjs-mocks";
import fetch from "jest-fetch-mock";

jest.unmock("./index");
import * as fs from "fs";
import {checkForums, generateBumpReport, resolveAllApplicants} from "./index";
import settings from "./settings.json";
settings.rejectionString = "you have been accepted";
settings.acceptanceString = "your application has been rejected";
const loadedPages: string[] = [];
for (let i = 1; i < 8; i++) {
  const d = readFileSync("./mocks/" + i + ".html").toString();
  loadedPages.push(d);
}
// jest.mock("fs");

// const mockFS: jest.Mocked<typeof fs> = fs as jest.Mocked<typeof fs>;

describe("Parsing tests for Hannibal bot", () => {
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
  test("General purpose parsing", async () => {
    const message = new MockMessage();
    message.channel = new MockTextChannel();
    // Two of the first one because we call once first to get the page number
    fetch.once(loadedPages[0]).once(loadedPages[0]).once(loadedPages[1]);
    const results = await checkForums(message, settings);
    expect(results.bumpers["dingus prime"]).toBe(2);
    expect(results.bumpers.birdup).toBe(13);
    expect(results.bumpers.ladygodiva).toBe(1);
    expect(results.lastPage).toBe(138);
    expect(results.currentPage).toBe(139);
    expect(results.hasNewApplicantResults).toBe(false);
  });
  test("Special purpose parsing", async () => {
    const message = new MockMessage();
    message.channel = new MockTextChannel();
    // Two of the first one because we call once first to get the page number
    fetch.once(loadedPages[1]).once(loadedPages[1]).once(loadedPages[2]);
    const results = await checkForums(message, settings);
    expect(results.bumpers["dingus prime"]).toBe(2);
    expect(results.bumpers.birdup).toBe(9);
    expect(results.bumpers.ladygodiva).toBe(1);
    expect(results.lastPage).toBe(138);
    expect(results.currentPage).toBe(139);
    expect(results.hasNewApplicantResults).toBe(false);
  });
  test("Big posts", async () => {
    const message = new MockMessage();
    message.channel = new MockTextChannel();
    // Two of the first one because we call once first to get the page number
    fetch.once(loadedPages[2]).once(loadedPages[2]).once(loadedPages[3]);
    const results = await checkForums(message, settings);
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
  });
  test("Nested quotes does should be recognized as bumps", async () => {
    const message = new MockMessage();
    message.channel = new MockTextChannel();
    fetch.mockResponse(loadedPages[4]);
    const results = await checkForums(message, settings);
    expect(results.applicants.Jabroni).toBeUndefined();
    expect(results.bumpers.Jabroni).toBe(2);
  });

  test("Special formatting in Username portion should not cause the results to break.", async () => {
    const message = new MockMessage();
    message.channel = new MockTextChannel();
    fetch.mockResponse(loadedPages[5]);
    const results = await checkForums(message, settings);
    expect(results.applicants.formatfanatic).toBeDefined();
    expect(results.applicants.formatfanatic.hasBeenReviewed).toBe(false);
  });

  test("process should properly resolve all applicants to reviewed", async () => {
    const message = new MockMessage();
    message.channel = new MockTextChannel();
    fetch.mockResponse(loadedPages[5]);
    const results = await checkForums(message, settings);
    expect(results.applicants.formatfanatic).toBeDefined();
    expect(results.applicants.formatfanatic.hasBeenReviewed).toBe(false);
    results.applicants = resolveAllApplicants(results.applicants);
    expect(results.applicants.formatfanatic.manuallyProcessed).toBe(true);
  });

  test("If the mod has styled the name of the applicant, we shall strip the formatting.", async () => {
    const message = new MockMessage();
    message.channel = new MockTextChannel();
    fetch.mockResponse(loadedPages[5]);
    const results = await checkForums(message, settings);
    expect(results.applicants.gregthegreenguy).toBeDefined();
    expect(results.applicants.gregthegreenguy.hasBeenReviewed).toBe(true);
  });

  test("If the mod has styled the name of the applicant with br tags, we shall strip the brs.", async () => {
    const message = new MockMessage();
    message.channel = new MockTextChannel();
    fetch.mockResponse(loadedPages[6]);
    const results = await checkForums(message, settings);
    expect(results.applicants.Dredd).toBeDefined();
    expect(results.applicants.Dredd.hasBeenReviewed).toBe(true);
  });

  test("Should properly generate a bump report", async () => {
    const message = new MockMessage();
    message.channel = new MockTextChannel();
    // Two of the first one because we call once first to get the page number
    fetch.once(loadedPages[1]).once(loadedPages[1]).once(loadedPages[2]);
    const results = await checkForums(message, settings);
    const expectedReportResults = "Bumpers as of {dateEstablished}: birdup, dingus prime, ladygodiva";
    expect(generateBumpReport(results.bumpers, "{dateEstablished}")).toBe(expectedReportResults);
  });

  test("When hannibal starts, a file will exist containing prior results or it will be created", async () => {
    jest.spyOn(fs, "mkdirSync");
  });

});

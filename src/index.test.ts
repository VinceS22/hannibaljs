import {enableFetchMocks, MockParams, MockResponseInitFunction} from "jest-fetch-mock";
jest.unmock("fs");
jest.mock("discord.js");
import {readFileSync} from "fs";
import {MockMessage, MockTextChannel} from "jest-discordjs-mocks";
import fetch from "jest-fetch-mock";
jest.unmock("./index");
import {checkForums, generateBumpReport, resolveAllApplicants,get1bars,get2bars} from "./index";
import settings from "./settings.json";
settings.rejectionString = "you have been accepted";
settings.acceptanceString = "your application has been rejected";
const loadedPages: string[] = [];
for (let i = 1; i < 7; i++) {
  const d = readFileSync("./mocks/" + i + ".html").toString();
  loadedPages.push(d);
}

describe("Parsing tests for Hannibal bot", () => {

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
    expect(results.applicants.formatfanatic.hasBeenReviewed).toBe(true);
  });

  test("If the mod has styled the name of the applicant, we shall strip the formatting.", async () => {
    const message = new MockMessage();
    message.channel = new MockTextChannel();
    fetch.mockResponse(loadedPages[5]);
    const results = await checkForums(message, settings);
    expect(results.applicants.gregthegreenguy).toBeDefined();
    expect(results.applicants.gregthegreenguy.hasBeenReviewed).toBe(true);
    results.applicants = resolveAllApplicants(results.applicants);
    expect(results.applicants.formatfanatic.hasBeenReviewed).toBe(true);
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

});

describe("Discord role command tests", () => {
  test("We are able to fetch the audit logs and see how long a user has had a role for", () => {

  });
  test("When a 1 bar has been a 1 bar for a month, return as a result", () => {
    //expect(get1bars(new MockMessage())[0]).toBe(["test1", "1/1/2020"]);
  });
  test("When a 2 bar has been a 2 bar for a month, return as a result",() => {
    expect(get2bars()[0]).toBe(["test1", "1/1/2020"]);
  });
  test("",() => {

  });

});
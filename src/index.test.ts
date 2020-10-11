import {enableFetchMocks} from "jest-fetch-mock";
jest.unmock("fs");
jest.mock("discord.js");
import {readFileSync} from "fs";
import {MockMessage, MockTextChannel} from "jest-discordjs-mocks";
import fetch from "jest-fetch-mock";
import { mocked } from "ts-jest/utils";
import {checkForums} from "./index";
import settings from "./settings.json";
settings.rejectionString = "you have been accepted";
settings.acceptanceString = "your application has been rejected";
const loadedPages: string[] = [];
for (let i = 1; i < 6; i++) {
  const d = readFileSync("./mocks/" + i + ".html").toString();
  loadedPages.push(d);
}

describe("General tests for Hannibal bot", () => {

  test("Mock test", async () => {
  const message = new MockMessage();
  message.channel = new MockTextChannel();

  fetch.mockResponse(loadedPages[0]);
  const results = await checkForums(message, {acceptanceString: "you have been accepted",
    baseUrl: "https://runescape", prefix: "", rejectionString: "your application has been rejected", token: ""});
  console.log(results);
  });
});

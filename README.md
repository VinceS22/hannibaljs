# hannibaljs
A script with a webhook through DiscordJS to gather information on RuneScape forum threads. The main intent of this was  to aid moderators in assistance of accepting group applications. 
# Requirements
- Node (Minimum v12. Requirement from DiscordJS as of 8/15/2020) https://github.com/nodejs/node#download
- A discord bot token. You can get one here: https://discord.com/developers/applications/

# How to run
Go to `src/settings.json` and edit the `token` property with your bot token. You will also need to supply the base URL. This is the forum thread. 

Afterwards, you should have everything set up! Now run the following in the root of this project whereever you want to run node from. 

````
npm install
npm run start
````
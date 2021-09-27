
//Import discord.js library
const Discord = require('discord.js');
//Import token file
const token = require("./token.json");
//Import config file
const config = require("./config.json")

const bot = new Discord.Client({ intents: ["GUILDS", "GUILD_MESSAGES"] });

//Starting bot
bot.login(token.token);
bot.on("ready", async () =>{
    console.log(config.logMessage);
    bot.user.setStatus(config.status);
    bot.user.setActivity(config.activity, {type: config.activityType});
});
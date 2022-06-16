
//Import discord.js library
const Discord = require('discord.js');
//Import token file
const token = require("./token.json");
//Import config file
const config = require("./config.json");
// create discord Client
const client = new Discord.Client({ intents: ["GUILDS", "GUILD_MESSAGES"] });
//import inventory management functions
const rolePlayManagementBot = require("./rolePlayManagementBot.js");
const toss = require("./tossCoin.js");
//import FileSystem library
const fs = require('fs');



client.login(token.token);
client.on("ready", async () =>{
    console.log(config.logMessage);
    client.user.setStatus(config.status);
    client.user.setActivity(config.activity, {type: config.activityType});
});

// #
client.on('messageCreate', async(message) => {

    if(!message.author.bot && message.content.startsWith(config.commandPrefix)){
        toss.tossCoin(message);
        rolePlayManagementBot.proccessMessage(message, client)
    }
;            
});


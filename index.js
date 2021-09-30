
//Import discord.js library
const Discord = require('discord.js');
//Import token file
const token = require("./token.json");
//Import config file
const config = require("./config.json");
const client = new Discord.Client({ intents: ["GUILDS", "GUILD_MESSAGES"] });


const levelSystem = require("./level.js");
const coinFlip = require("./coinFlip.js");


//Starting bot
client.login(token.token);
client.on("ready", async () =>{
    console.log(config.logMessage);
    client.user.setStatus(config.status);
    client.user.setActivity(config.activity, {type: config.activityType});
});

client.on('messageCreate', async(message) => {

    if(!message.author.bot){

        //Appel à la fonction qui gère l'xp
        levelSystem.addXp(message.author.id, message.guild.id);

        if(message.content.startsWith("!coin")){
            coinFlip.coinFlip(message.channel);
        }
        if(message.content.startsWith("!xp")){
            levelSystem.showXp(message.author, message.guild.id, message.channel);
        }
    }

});
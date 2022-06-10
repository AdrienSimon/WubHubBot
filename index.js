
//Import discord.js library
const Discord = require('discord.js');
//Import token file
const token = require("./token.json");
//Import config file
const config = require("./config.json");
// create discord Client
const client = new Discord.Client({ intents: ["GUILDS", "GUILD_MESSAGES"] });
//import inventory management functions
const inventorySystem = require("./userProfile.js");
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

    toss.tossCoin(message);
    
    if(!message.author.bot){   

        if(message.channel.parentId === config.authorizedChannelcategoryId){

            if(message.content.startsWith(config.commandPrefix)){

                let command = message.content.toLowerCase().split(' ');

                let hasEventAdminAuthorization = false;
                for(const roleId of config.authorizedAdminRolesId){
                    if(message.member.roles.cache.some(role => role.id === roleId)){
                        hasEventAdminAuthorization = true;
                        break;
                    }
                    
                }

                let userMentionned = null;

                switch(command[0]){

                    // ############################################################### AddItemToPlayer
                    case config.commands.addItemToPlayer.usage.toLowerCase():

                        if(config.commands.addItemToPlayer.eventAdmin && !hasEventAdminAuthorization){
                            break;
                        }

                        userMentionned = getUserFromMention(command[1]);
                        if(userMentionned == null){
                            message.channel.send("Utilisateur introuvable");
                            break;
                        }

                        if(command.length === 3){
                            inventorySystem.addItem(client, message.guildId, userMentionned.id, command[2], 1, userMentionned, false, message.channel);
                        }
                        else if(command.length === 4){
                            inventorySystem.addItem(client, message.guildId, userMentionned.id, command[2], command[3], userMentionned, false, message.channel);
                        }
                        break;


                    // ############################################################### removeItemFromPlayer
                    case config.commands.removeItemFromPlayer.usage.toLowerCase():

                        if(config.commands.removeItemFromPlayer.eventAdmin && !hasEventAdminAuthorization){
                            break;
                        }
                        
                          userMentionned = getUserFromMention(command[1]);
                          if(userMentionned == null){
                              message.channel.send("Utilisateur introuvable");
                              break;
                          }
            
                          if(command.length === 3){
                              inventorySystem.removeItem(client, message.guildId, userMentionned.id, command[2], 1, false, userMentionned, false, message.channel);
                          }
                          
                          else if(command.length === 4){
                              inventorySystem.removeItem(client, message.guildId, userMentionned.id, command[2], command[3], false, userMentionned, false, message.channel);
                          }
                          break;

                    // ############################################################### showInventory
                    case config.commands.showInventory.usage.toLowerCase():

                        if(config.commands.showInventory.eventAdmin && !hasEventAdminAuthorization){
                            break;
                        }
                    

                        if(command.length === 1){
                            inventorySystem.showInventory(client, message.author.id, message.guildId, message.author, message.channel);
                        }
                        else if(command.length === 2){
                            userMentionned = getUserFromMention(command[1]);
                            if(userMentionned == null){
                                message.channel.send("Utilisateur introuvable");
                                break;
                            }
                            inventorySystem.showInventory(client, userMentionned.id, message.guildId, userMentionned, message.channel);
                        }
                        break;

                    
                    // ############################################################### Roll 
                    case config.commands.roll.usage.toLowerCase():

                        if(config.commands.roll.eventAdmin && !hasEventAdminAuthorization){
                            break;
                        }

                        if(command.length === 1){
                            message.channel.send("Résultat pour 1D6 de <@" + message.author.id + "> : " + getRandomInt(1,7));
                        }
                        else if(command.length === 2){
                            let diceType = command[1].split('d');
                            if(diceType.length === 2){
                                diceType[0] = parseInt(diceType[0]);
                                diceType[1] = parseInt(diceType[1]);
                                if(Number.isInteger(diceType[0]) && Number.isInteger(diceType[1])){
                                    if(diceType[0] > 0  && diceType[1] > 0 && diceType[0] <= 50 && diceType[1] <= 1000){

                                        let str = "Résultat pour " + command[1] + " de <@" + message.author.id + "> : \n";
                                        let total = 0;
                                        for(i=0; i<diceType[0]; i++){
                                            let result = getRandomInt(1, diceType[1] + 1);
                                            total += result;
                                            str +=  "n°" + (i + 1) + " => " + result + "\n";
                                        }
                                        str += "Total: " + total;
                                        message.channel.send(str);
                                        break;
                                    }
                                }
                            }
                            message.channel.send("valeurs de dés invalides <@" + message.author.id + ">");
                        }
                        break;

                    // ############################################################### emptyInventory
                    case config.commands.emptyInventory.usage.toLowerCase():
                        if(config.commands.emptyInventory.eventAdmin && !hasEventAdminAuthorization){
                            break;
                        }

                        if(command.length === 1){
                            inventorySystem.emptyInventory(client, message.author.id, message.guildId, message.channel);
                        }
                        else if(command.length === 2){
                            userMentionned = getUserFromMention(command[1]);
                            if(userMentionned == null){
                                break;
                            }
                            inventorySystem.emptyInventory(client, userMentionned.id, message.guildId, message.channel);
                        }

                    
                        break;

                    // ############################################################### Help
                    case config.commands.help.usage.toLowerCase():

                    if(config.commands.help.eventAdmin && !hasEventAdminAuthorization){
                        break;
                    }
                        fs.readFile('./config.json', (err, data) => {
                            if (err) throw err;
                            const embedMessage = new Discord.MessageEmbed();
                            embedMessage.setColor(config.embedColor);
                            embedMessage.setTitle("*Commandes disponibles :*");
                            embedMessage.setAuthor({name: config.embedAuthor, iconURL: config.embedIcon});
                            let str = "";
                            let parsedConfig = JSON.parse(data);
                            if(config.hasOwnProperty("commands")){
                                let commands = config["commands"];
                                if(commands.hasOwnProperty("commandList")){
                                    let commandList = commands["commandList"];                              
                                    for(const command of commandList){
                                        if(commands[command]["eventAdmin"]){
                                            if(hasEventAdminAuthorization){
                                                str += "`" + commands[command]["usage"] + " " + commands[command]["argument"] + "`\n" + " - " + commands[command]["description"] +"\n\n";
                                            }
                                            
                                        } else{
                                            str += "`" + commands[command]["usage"] + " " + commands[command]["argument"] + "`\n" + " - " + commands[command]["description"] +"\n\n";
                                        }   
                                    }
                                    embedMessage.setDescription(str);
                                    message.channel.send({embeds : [embedMessage]});
                                }
                            }
                        });
                        break;
                    // ############################################################### Use
                    case config.commands.use.usage.toLowerCase():

                        if(config.commands.use.eventAdmin && !hasEventAdminAuthorization){
                            break;
                        }
                        if(command.length === 3){
                            inventorySystem.removeItem(client, message.guildId, message.author.id, command[1], command[2], true, message.author, false, message.channel);
                            
                        }
                        if(command.length === 2){
                            inventorySystem.removeItem(client, message.guildId, message.author.id, command[1], 1, true, message.author, false, message.channel);
                            
                            
                        }
                        break;
                }
            }
        }       
    }
            
});

function getUserFromMention(mention) {
	if (!mention) return null;
	if (mention.startsWith('<@') && mention.endsWith('>')) {
		mention = mention.slice(2, -1);
		if (mention.startsWith('!')) {
			mention = mention.slice(1);
		}
		return client.users.cache.get(mention);
	}
}

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min;
  }


//Import discord.js library
const Discord = require('discord.js');
//Import config file
const config = require("./config.json");
const items = require("./items.json");
const fs = require('fs');
const { Console } = require('console');
const { exit } = require('process');
const { Channel, channel } = require('diagnostics_channel');
const levelIncreaseCoef = 1.5;
const requiredXp = 1000;

const proccessMessage = async(message, client) =>{
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
                    case config.commandPrefix + config.commands.addItemToPlayer.usage.toLowerCase():

                        if(config.commands.addItemToPlayer.eventAdmin && !hasEventAdminAuthorization){
                            break;
                        }

                        userMentionned = getUserFromMention(command[1], client);
                        if(userMentionned == null){
                            message.channel.send("Utilisateur introuvable");
                            break;
                        }

                        if(command.length === 3){
                            addItem(client, message.guildId, userMentionned.id, command[2], 1, userMentionned, false, message.channel);
                        }
                        else if(command.length === 4 && !isNaN(command[3])){
                            addItem(client, message.guildId, userMentionned.id, command[2], command[3], userMentionned, false, message.channel);
                        }
                        else if(command.length > 4){
                            if(!isNaN(command[(command.length - 1)])){
                                let itemName = command.slice(2, command.length - 1).join(' ');
                                addItem(client, message.guildId, userMentionned.id, itemName, command[command.length - 1], userMentionned, false, message.channel);
                            }
                            else{
                                let itemName = command.slice(2).join(' ');
                                addItem(client, message.guildId, userMentionned.id, itemName, 1, userMentionned, false, message.channel);
                            }
                        }
                        break;


                    // ############################################################### removeItemFromPlayer
                    case config.commandPrefix + config.commands.removeItemFromPlayer.usage.toLowerCase():

                        if(config.commands.removeItemFromPlayer.eventAdmin && !hasEventAdminAuthorization){
                            break;
                        }
                        
                          userMentionned = getUserFromMention(command[1], client);
                          if(userMentionned == null){
                              message.channel.send("Utilisateur introuvable");
                              break;
                          }
            
                          if(command.length === 3){
                              removeItem(client, message.guildId, userMentionned.id, command[2], 1, false, userMentionned, false, message.channel);
                          }
                          
                          else if(command.length === 4 && !isNaN(command[3])){
                              removeItem(client, message.guildId, userMentionned.id, command[2], command[3], false, userMentionned, false, message.channel);
                          }
                          else if(command.length > 4){
                            if(!isNaN(command[command.length - 1])){
                                let itemName = command.slice(2, command.length - 1).join(' ');
                                removeItem(client, message.guildId, userMentionned.id, itemName, command[command.length -1], false, userMentionned, false, message.channel);
                            }
                            else{
                                let itemName = command.slice(2).join(' ');
                                removeItem(client, message.guildId, userMentionned.id, itemName, 1, false, userMentionned, false, message.channel);
                            }
                           
                        }
                          break;

                    // ############################################################### showInventory
                    case config.commandPrefix + config.commands.showInventory.usage.toLowerCase():

                        if(config.commands.showInventory.eventAdmin && !hasEventAdminAuthorization){
                            break;
                        }
                    

                        if(command.length === 1){
                            showInventory(client, message.author.id, message.guildId, message.author, message.channel);
                        }
                        else if(command.length === 2){
                            userMentionned = getUserFromMention(command[1], client);
                            if(userMentionned == null){
                                message.channel.send("Utilisateur introuvable");
                                break;
                            }
                            showInventory(client, userMentionned.id, message.guildId, userMentionned, message.channel);
                        }
                        break;

                    
                    // ############################################################### Roll 
                    case config.commandPrefix + config.commands.roll.usage.toLowerCase():

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
                    case config.commandPrefix + config.commands.emptyInventory.usage.toLowerCase():
                        if(config.commands.emptyInventory.eventAdmin && !hasEventAdminAuthorization){
                            break;
                        }

                        if(command.length === 1){
                            emptyInventory(client, message.author.id, message.guildId, message.channel);
                        }
                        else if(command.length === 2){
                            userMentionned = getUserFromMention(command[1], client);
                            if(userMentionned == null){
                                break;
                            }
                            emptyInventory(client, userMentionned.id, message.guildId, message.channel);
                        }

                    
                        break;

                    // ############################################################### Help
                    case config.commandPrefix + config.commands.help.usage.toLowerCase():

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
                                                str += "`" + config.commandPrefix + commands[command]["usage"] + " " + commands[command]["argument"] + "`\n" + " - " + commands[command]["description"] +"\n\n";
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
                    case config.commandPrefix + config.commands.use.usage.toLowerCase():

                        if(config.commands.use.eventAdmin && !hasEventAdminAuthorization){
                            break;
                        }
                        if(command.length === 3 && !isNaN(command[2])){
                            removeItem(client, message.guildId, message.author.id, command[1], command[2], true, message.author, false, message.channel);
                            
                        }
                        if(command.length === 2){

                    
                            removeItem(client, message.guildId, message.author.id, command[1], 1, true, message.author, false, message.channel);
                            
                            
                        }
                        if(command.length > 3){
                            if(!isNaN(command[command.length - 1])){
                                itemName = command.slice(1, command.length - 1).join(' ');
                                removeItem(client, message.guildId, message.author.id, itemName, command[command.length - 1], true, message.author, false, message.channel);
                            }
                            else{
                                itemName = command.slice(1).join(' ');
                                removeItem(client, message.guildId, message.author.id, itemName, 1, true, message.author, false, message.channel);
                            }
                        }
                        break;

                    // #################################################### info
                    case config.commandPrefix + config.commands.info.usage.toLowerCase():

                        if(command.length === 2){
                            showItemInformation(command[1], message.channel);
                        }
                        else if(command.length > 2){
                            itemName = command.slice(1).join(' ');
                            showItemInformation(itemName, message.channel);
                        }
                        break;
                }
            }
        }       
    }
}


const showInventory  = async (client, userId, guildId, user, channel) => {

    var profiles = fs.readFileSync('./userProfile.json', 'utf8');
    profiles = JSON.parse(profiles);

        // Si l'utilisateur a un profil enregistré
        if(profiles.hasOwnProperty(userId)){

            let userProfile = profiles[userId];

            // Si l'utilisateur a un profil enregistré pour ce serveur
            if(userProfile.hasOwnProperty(guildId)){
                var str = JSON.stringify(profiles[userId][guildId]["inventory"], null, 2); // spacing level = 2
                str = "";
                
                const embedMessage = new Discord.MessageEmbed();
                embedMessage.setColor(config.embedColor);
                embedMessage.setTitle("*Inventaire de  " + user.username + "*");
                embedMessage.setAuthor({name: config.embedAuthor, iconURL: config.embedIcon});
                embedMessage.setThumbnail(user.avatarURL());

                for(var item in profiles[userId][guildId]["inventory"]){
                    str +=  "**" + profiles[userId][guildId]["inventory"][item] + "** `" + item + "`\n\n";
                }
                embedMessage.setDescription(str);
                channel.send({embeds: [embedMessage]});
            }
            else{
                channel.send("<@" + userId + "> n'a pas encore d'inventaire ! ");
            }

        }else{
            channel.send("<@" + userId + "> n'a pas encore d'inventaire ! ");
        }  
}

const showItemInformation = async(itemName, channel) => {
    let item = null;
    for(const element of items.items){
        if(element.name.toLowerCase() == itemName.toLowerCase()){
            item = element;
            break;
        }
    }
    if(item === null){
        channel.send("Item inconnu");
        return;
    }    
    description = "";
    const embedMessage = new Discord.MessageEmbed();
        embedMessage.setTitle(item.name);
        embedMessage.setColor(config.embedColor);
        embedMessage.setAuthor({name: config.embedAuthor, iconURL: config.embedIcon});
    if(item.hasOwnProperty("description")){
        description = item.description;
    }
    else{
        description = config.defaultItemDescription;
    }
    embedMessage.setDescription(description);
    if(item.hasOwnProperty("image")){
        embedMessage.setThumbnail("attachment://"+ item.image);
        channel.send({embeds: [embedMessage], files: [new Discord.MessageAttachment("./images/" + item.image)] });
    }
    else{
        channel.send({embeds: [embedMessage]});
    }
}


const removeItem = async (client, guildId, userId, itemName, quantity, isUsed, user, silentMode=false, channel) =>{ 
    quantity = parseInt(quantity);
    if(!Number.isInteger(quantity)){
        channel.send("Quantité invalide");
        return;
    }

    var profiles = fs.readFileSync('./userProfile.json', 'utf8');
    profiles = JSON.parse(profiles);

    let item = null;
    for(const element of items.items){
        if(element.name.toLowerCase() == itemName.toLowerCase()){
            item = element;
            break;
        }
    }
    if(item === null){
        channel.send("Item inconnu");
        return;
    }
  
    let canRemoveItem = false;
    // Si l'utilisateur a un profil enregistré
    if(profiles.hasOwnProperty(userId)){
        //Variable: object JSON représentant le profil de l'utilisateur qui a écrit le message
        let userProfile = profiles[userId];

        // Si l'utilisateur a un profil enregistré pour ce serveur
        if(userProfile.hasOwnProperty(guildId)){

            let userGuildProfile = userProfile[guildId];

            let inventory = userGuildProfile.inventory;
            //check if user has already this item
            if(inventory.hasOwnProperty(itemName)){

                if(inventory[itemName] > 0){
                    if(inventory[itemName] >= quantity){
                        inventory[itemName] -= quantity;
                        canRemoveItem = true;
                    }
                    else{
                        quantity = inventory[itemName];
                        inventory[itemName] = 0;
                        canRemoveItem = true;                 
                    }
                }
                else{
                    channel.send("<@" + userId + "> ne possède pas cet Objet !");
                    
                }                               
            }
            else{
                channel.send("<@" + userId + "> ne possède pas cet Objet !");
                
            }
        }
    }
    if(canRemoveItem){       
        fs.writeFileSync('./userProfile.json', JSON.stringify(profiles, null, 4));
        if(isUsed){
            channel.send(" <@" + userId + "> a utilisé " + quantity + " " + itemName);
            if(item.hasOwnProperty("effect")){
                if(item.effect === "openChest"){
                    totalChestRecapMessage = "";
                    totalChestRecap = {};
                    for(var i = 0; i < quantity; i++){
                        let chestRecap = openChest(item);
                        for (var key in chestRecap) {
                            if(totalChestRecap.hasOwnProperty(key)){
                                totalChestRecap[key] += chestRecap[key];
                            }
                            else{
                                totalChestRecap[key] = chestRecap[key];
                            }
                        }
                    }
                    for(var key in totalChestRecap){
                        totalChestRecapMessage += " - " + totalChestRecap[key] + " " + key + "\n";
                        addItem(client, guildId, userId, key, totalChestRecap[key], user, true, channel, true);
                    }
                    channel.send(" <@" + userId + "> a reçu : \n" + totalChestRecapMessage);
                    showInventory(client, userId, guildId, user, channel);
                    
                }               
            }
            else if(!silentMode){
                showInventory(client, userId, guildId, user, channel);
            }   
        }
        else{
            channel.send(" <@" + userId + "> a perdu " + quantity + " " + itemName);
            if(!silentMode){
                showInventory(client, userId, guildId, user, channel);
            }
            
        }   
    }        
}

function openChest(chest){
    let chestTier = null;
    if(chest.hasOwnProperty("tier")){
        chestTier = chest.tier;
    }else{
        return;
    }

    if(chest.hasOwnProperty("minLootNumber")){
        var minItemNumber = chest.minLootNumber;
    }else{
        return;
    }
    if(chest.hasOwnProperty("maxLootNumber")){
        var maxItemNumber = chest.maxLootNumber;
    }else{
        return;
    }

    let possibleItemList = [];
    for(const element of items.items){
        if(element.tier == chestTier && !element.hasOwnProperty("effect")){
            possibleItemList.push(element);
        }
    }
    if(possibleItemList.length >= 1){
        let chestRecap = {};
        let itemNumber = getRandomInt(minItemNumber, maxItemNumber + 1);
        for(let i = 0; i < itemNumber; i++) {
            let randomItem = possibleItemList[getRandomInt(0, possibleItemList.length)];
            if(chestRecap.hasOwnProperty(randomItem.name)){
                chestRecap[randomItem.name] += 1;
            }
            else{
                chestRecap[randomItem.name] = 1;
            }
        }
        return chestRecap;
    }
    return;

}

const emptyInventory = async (client, userId, guildId, channel) =>{


    var profiles = fs.readFileSync('./userProfile.json', 'utf8');
    profiles = JSON.parse(profiles);

    // Si l'utilisateur a un profil enregistré
    if(profiles.hasOwnProperty(userId)){
        //Variable: object JSON représentant le profil de l'utilisateur qui a écrit le message
        let userProfile = profiles[userId];
        // Si l'utilisateur a un profil enregistré pour ce serveur
        if(userProfile.hasOwnProperty(guildId)){

            let userGuildProfile = userProfile[guildId];
            userGuildProfile["inventory"] = {};
            fs.writeFileSync('./userProfile.json', JSON.stringify(profiles, null, 4));  
            channel.send(" <@" + userId + "> a perdu tout son inventaire !");
        }
        else{
            channel.send("<@" + userId + "> n'a pas encore d'inventaire ! ");
        }

    }else{
        channel.send("<@" + userId + "> n'a pas encore d'inventaire ! ");
    }
}

const addItem = async (client, guildId, userId, itemName, quantity, user, silentMode=false, channel, silentInventory=false) =>{

    quantity = parseInt(quantity);
    if(!Number.isInteger(quantity)){
        channel.send("Quantité invalide");
        return;
    }

    var profiles = fs.readFileSync('./userProfile.json', 'utf8');
    profiles = JSON.parse(profiles);

    let item = null;
    for(const element of items.items){
        if(element.name.toLowerCase() == itemName.toLowerCase()){
            item = element;
            break;
        }
    }
    if(item === null){
        channel.send("Item inconnu");
        return;
    }
    // Si l'utilisateur a un profil enregistré
    if(profiles.hasOwnProperty(userId)){
        //Variable: object JSON représentant le profil de l'utilisateur qui a écrit le message
        let userProfile = profiles[userId];

        // Si l'utilisateur a un profil enregistré pour ce serveur
        if(userProfile.hasOwnProperty(guildId)){
            let userGuildProfile = userProfile[guildId];
            let inventory = userGuildProfile.inventory;
            //check if user has already this item
            if(inventory.hasOwnProperty(itemName)){
                inventory[itemName] += quantity;   
            }
            else{
                inventory[itemName] = quantity;
            }
        }

        //L'utilisateur n'a pas de profil pour ce serveur
        else{

            //Création du profil de serveur
            profiles[userId][guildId] = {};
            profiles[userId][guildId]["inventory"] = {};
            profiles[userId][guildId]["inventory"][itemName] = quantity;
        }
    }
    //L'utilisateur n'a pas de profil dutout
    else{
        //Création du profil
        profiles[userId] = {};
        profiles[userId][guildId] = {};
        profiles[userId][guildId]["inventory"] = {};
        profiles[userId][guildId]["inventory"][itemName] = quantity;
    }

    //écriture de l'objet JSON modifié dans userProfile.json pour sauvegarder les changements
    fs.writeFileSync('./userProfile.json', JSON.stringify(profiles, null, 4));
    if(!silentMode){
        channel.send(" <@" + userId + "> a reçu " + quantity + " " + itemName);
    }

    if(!silentInventory){
        showInventory(client, userId, guildId, user, channel);
    }
}

function getUserFromMention(mention, client) {
	if (!mention) return null;
	if (mention.startsWith('<@') && mention.endsWith('>')) {
		mention = mention.slice(2, -1);
		if (mention.startsWith('!')) {
			mention = mention.slice(1);
		}
		return client.users.cache.get(mention);
	}
}

function getRandomInt(mini, maxi) {
    mini = Math.ceil(mini);
    maxi = Math.floor(maxi);
    return Math.floor(Math.random() * (maxi - mini)) + mini;
}

module.exports.proccessMessage = proccessMessage;
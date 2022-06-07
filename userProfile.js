
//Import discord.js library
const Discord = require('discord.js');
//Import config file
const config = require("./config.json");
const items = require("./items.json");
const fs = require('fs');
const { Console } = require('console');
const { exit } = require('process');
const { Channel } = require('diagnostics_channel');
const levelIncreaseCoef = 1.5;
const requiredXp = 1000;

/**
 * 
 * @param {*} client 
 * @param {*} userId 
 * @param {*} guildId 
 * @param {*} user 
 */
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

/**
 * 
 * @param {*} client discord Client
 * @param {*} guildId Server ID
 * @param {*} userId user ID
 * @param {*} itemName name of the item
 * @param {*} quantity item quantity
 * @param {*} isUsed if item is used by player or removed by an admin
 * @param {*} user the user concerned by the command
 * @returns 
 */
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
                    for(var i = 0; i < quantity; i++){
                        openChest(client, guildId, userId, user, item, channel);
                    }
                    
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

function openChest(client, guildId, userId, user, item, channel){

    let chestTier = null;
    if(item.hasOwnProperty("tier")){
        chestTier = item.tier;
    }else{
        return;
    }

    if(item.hasOwnProperty("minLootNumber")){
        var minItemNumber = item.minLootNumber;
    }else{
        return;
    }
    if(item.hasOwnProperty("maxLootNumber")){
        var maxItemNumber = item.maxLootNumber;
    }else{
        return;
    }
    let possibleItemList = [];
    for(const element of items.items){
        if(element.tier == chestTier && !element.hasOwnProperty("effect")){
            possibleItemList.push(element);
        }
    }
    let itemsToAdd = [];
    let itemNumber = getRandomInt(minItemNumber, maxItemNumber + 1);
    for(let i = 0; i < itemNumber; i++) {
        let randomItem = possibleItemList[getRandomInt(0, possibleItemList.length)];
        itemsToAdd.push(randomItem.name);
    }
    for(let i = 0; i < itemsToAdd.length; i++) {
        if(i < itemsToAdd.length - 1 ){
            addItem(client, guildId, userId, itemsToAdd[i], 1, user, true, channel);
        }
        else{
            addItem(client, guildId, userId, itemsToAdd[i], 1, user, false, channel);
        }
    }
}

/**
 * 
 * @param {*} client 
 * @param {*} userId 
 * @param {*} guildId 
 */
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

/**
 * 
 * @param {*} client 
 * @param {*} guildId 
 * @param {*} userId 
 * @param {*} itemName 
 * @param {*} quantity 
 * @param {*} user 
 * @returns 
 */
const addItem = async (client, guildId, userId, itemName, quantity, user, silentMode=false, channel) =>{

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
    channel.send(" <@" + userId + "> a reçu " + quantity + " " + itemName);
    if(!silentMode){
        showInventory(client, userId, guildId, user, channel);
    }  
}

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min;
}

module.exports.showInventory = showInventory;
module.exports.removeItem = removeItem;
module.exports.emptyInventory = emptyInventory;
module.exports.addItem = addItem;
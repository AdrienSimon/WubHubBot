
//Import discord.js library
//Import discord.js library
const Discord = require('discord.js');

const config = require("./config.json");

const head_image = config.coin.coinHeadImage;
const tail_image = config.coin.coinTailImage;



const tossedRecently = new Set();


/**
 * Does a full message check before calling the "tossCoin" function 
 * @param {*Discord.Message, message received on discord} message 
 */
function toss_a_coin_to_your_witcher(message) {

    if(!message.author.bot){
        let isOnAuthorizedChanel = false;        
        for(const channelId of config.coin.authorizedChannelsId){
            if(channelId === message.channelId){
                isOnAuthorizedChanel = true;
                break;
            }
        }

        if(!isOnAuthorizedChanel){
            for(const categorieId of config.coin.authorizedCategoriesId){
                if(categorieId === message.channel.parentId){
                    isOnAuthorizedChanel = true;
                    break;
                }
            }
        }
        
        if(isOnAuthorizedChanel){

            let command = message.content.toLowerCase();
            if(command === config.coin.commandName ){

                let isAdmin = false;
                for(const roleId of config.coin.adminRolesId){
                    if(message.member.roles.cache.some(role => role.id === roleId)){
                        isAdmin = true;
                        break;
                    }
                }
                if(isAdmin){
                    tossCoin(message.author, message.channel, true);
                }
                else{
                    tossCoin(message.author, message.channel, false)
                }
            }
        }
    }
}

/**
 * the actual toss coin function
 * @param {*Discord.User, user to mention the result to} user 
 * @param {*Discord.Channel, channel to send the result} channel 
 * @param {*boolean, if command cooldown is to be bypassed } isAdmin 
 * @returns 
 */
function tossCoin(user, channel, isAdmin){

    
    if (!isAdmin && tossedRecently.has(user.id)) {
       return;
    } 
    else {

        const embedMessage = new Discord.MessageEmbed();
        let result = "";
        if(Math.floor(Math.random() * 2) === 1){
            result = head_image;
            embedMessage.setTitle(  user.username + " a jeté une pièce ! \n\n Face !");
        }
        else{
            result = tail_image;
            embedMessage.setTitle(  user.username + " a jeté une pièce ! \n\n Pile !");
        }
        
        embedMessage.setColor(config.embedColor);
        
        embedMessage.setAuthor({name: config.embedAuthor, iconURL: config.embedIcon});
        embedMessage.setThumbnail(user.avatarURL());
        embedMessage.setImage("attachment://"+ result);
        
        if(!isAdmin){
            embedMessage.setDescription("prochain lancé possible dans  " + config.coin.cooldownInMs / 60000  + " minutes.");
        }
        channel.send({embeds: [embedMessage], files: [new Discord.MessageAttachment("./images/" + result)] });

        if(!isAdmin){
            tossedRecently.add(user.id);
            setTimeout( () => {tossedRecently.delete(user.id);}, config.coin.cooldownInMs);   
        }

    }
}




  module.exports.tossCoin = toss_a_coin_to_your_witcher;
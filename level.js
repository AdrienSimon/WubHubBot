
//Import discord.js library
const Discord = require('discord.js');
//Import config file
const config = require("./config.json");
const fs = require('fs');
const levelIncreaseCoef = 1.5;
const requiredXp = 1000;

const addXp = async (authorId, guildId) =>{

    //Lecture du fichier des profils utilisateurs
    fs.readFile('./userProfile.json', (err, data) => {

        if (err) throw err;

        //Conversion en objet Json
        let profiles = JSON.parse(data);

        //date d'aujourd'hui (dd/mm/yyyy)
        let currentDate = (new Date()).toLocaleDateString('en-GB');
       
        // Si l'utilisateur a un profil enregistré
        if(profiles.hasOwnProperty(authorId)){

            //Variable: object JSON représentant le profil de l'utilisateur qui a écrit le message
            let userProfile = profiles[authorId];

            // Si l'utilisateur a un profil enregistré pour ce serveur
            if(userProfile.hasOwnProperty(guildId)){

                //Variable: object JSON représentant le profil de l'utilisateur sur ce serveur
                let userGuild = userProfile[guildId];

                //Variable: nombre de point d'xp gagné par l'utilisateur
                let xpGain = 0;

                //Variable: nombre de points actuel de l'utilisateur
                let currentXp = userGuild["xp"];

                //Variable: niveau actuel de l'utilisateur
                let currentLevel = userGuild["level"];

                //Variable: nombre de points d'xp nécessaire pour que l'utilisateur monte de niveau
                let neededXp = requiredXp + ((currentLevel -1) * levelIncreaseCoef * requiredXp);
                
                //Si la date actuelle ne correspond pas à la dernière date de passage de l'utilisateur
                if(userGuild["lastSeen"] != currentDate){

                    //on met à jour la date de dernier passge sur son profil
                    profiles[authorId][guildId]["lastSeen"] = currentDate;
                    console.log("New message of the day !");
                    //l'xp gagné est de 100
                    xpGain = 100;
                }
                else{

                    //l'xp gagné est de 1
                    xpGain = 1;
                }

                //Si l'xp actuelle dépasse l'xp requise pour monter de niveau
                if(currentXp >= neededXp){
                    //la valeur level du profil de l'utilisateur pour ce serveur monte de 1
                    profiles[authorId][guildId]["level"] = currentLevel + 1;
                }

                //l'xp du profil de l'utilisateur pour ce serveur est mise à jour
                profiles[authorId][guildId]["xp"] = currentXp + xpGain;
                console.log("gaining xp!");
            }

            //L'utilisateur n'a pas de profil pour ce serveur
            else{

                //Création du profil de serveur
                profiles[authorId][guildId] = {};
                profiles[authorId][guildId]["xp"] = 0;
                profiles[authorId][guildId]["level"] = 1;
                profiles[authorId][guildId]["lastSeen"] = currentDate;
                profiles[authorId][guildId]["inventory"] = {};

                console.log("Creating user guild profile");
            }
        }
        //L'utilisateur n'a pas de profil
        else{

            //Création du profil
            profiles[authorId] = {};
            profiles[authorId][guildId] = {};
            profiles[authorId][guildId]["xp"] = 0;
            profiles[authorId][guildId]["level"] = 1;
            profiles[authorId][guildId]["lastSeen"] = currentDate;
            profiles[authorId][guildId]["inventory"] = {};

            console.log("Creating user profile");
        }

        //écriture de l'objet JSON modifié dans userProfile.json pour sauvegarder les changements
        fs.writeFile('./userProfile.json', JSON.stringify(profiles, null, 4), (err) => {
            if (err) throw err;
            console.log("done");
        });        
    });
}

const showXp = async (user, guildId, channel) => {

    fs.readFile('./userProfile.json', (err, data) => {

        if (err) throw err;
        let profiles = JSON.parse(data);

        if(profiles.hasOwnProperty(user.id)){
            if(profiles[user.id].hasOwnProperty(guildId)){
                channel.send(user.username + " est niveau " + profiles[user.id][guildId]["level"] + " avec " + profiles[user.id][guildId]["xp"] + " d'xp !");
                console.log("Showing user's xp and level");
            }
        }

    });

}

module.exports.addXp = addXp;
module.exports.showXp = showXp;
//Import discord.js library
const Discord = require('discord.js');
//Import config file
const config = require("./config.json");


const coinFlip = async (channel) =>{
    x = (Math.floor(Math.random() * 2) == 0);

    if(x){

        channel.send("Face !");

    }
    else{
        channel.send("Pile !");
    }
}

module.exports.coinFlip = coinFlip


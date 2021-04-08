//Invite Bot : https://discordapp.com/oauth2/authorize?client_id=692734199857152022&scope=bot&permissions=8

const entries = require("./entry");
const wordDAO = require("./wordDAO");
const gameDAO = require("./gameDAO");
const map = require("./map");
const game = require("./game");

secretToken = "NjkyNzM0MTk5ODU3MTUyMDIy.XnzBdg.OPbSQVemDjUGLysiwHaJmD9Qtdw";
const prefix = "/cd";

const Discord = require("discord.js")

const client = new Discord.Client()

client.on("ready", () => {
  console.log(`Logged in as ${client.user.tag}!`)
})

client.on("message", message => {

    if (!message.guild) {
        return 0;
    };

    content = message.content.split(' ');
    if (content[0] == prefix) {
        param = {
            bot : client,
            tab : content,
            msg : message,
            wDAO : wordDAO,
            gDAO : gameDAO,
            g : game,
            map : map
        }
        if (content[1] !== undefined)  {
            if (entries[content[1].toLowerCase()] != undefined) {
                condition = entries[content[1].toLowerCase()].condition;
                action = entries[content[1].toLowerCase()].action;
                execute(condition, action, param).catch(err => message.channel.send(err));
            } else
                message.channel.send("Mmh je ne connais pas ce nom de code...");
        } else message.channel.send("Il faut me préciser une commande.");
            
    }
})

client.login(secretToken)

execute = function (condition, action, param) {
    return new Promise(function(resolve, reject) {
        try {
            can = true;
            if (condition != undefined) {
                condition.forEach(cond => {
                    if (!cond.fun(param)) {
                        reject(cond.msg)
                        can = false
                    }
                });
            }

            if (can)
                action(param);
            resolve();
        } catch (error) {
            reject("Mayday mayday ! Nous avons une erreur : " + error);
            console.log(error)
        }
    })

}
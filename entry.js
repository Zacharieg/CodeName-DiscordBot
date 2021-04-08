var entries = {

    "ping" : {
        "condition" : [],
        "action" : function(param) {
            param.msg.channel.send("Pong!")
        }
    },

    "help" : {
        "condition" : [],
        "action" : function(param) {
            const fs = require('fs');
            fs.readFile("help.txt", 'utf8',(err, data) => {
                if (err) throw err;
                    param.msg.channel.send(data);
            });
        }
    },

    "rules" : {
        "condition" : [],
        "action" : function(param) {
            const fs = require('fs');
            fs.readFile("rules.txt", 'utf8',(err, data) => {
                if (err) throw err;
                    tab = data.split('^')
                    tab.forEach(elem => param.msg.channel.send(elem))
            });
        }
    },

    //#region Word
    "addw" : {
        "condition" : [
            {
                "fun" : function(param) { return param.tab[2] != undefined},
                "msg" : "Vous n'avez pas saisi de mot !"
            }, 
            {
                "fun" : function(param) { return param.tab[2].length >= 4},
                "msg" : "Votre mot doit faire plus de trois lettre"
            },
            {
                "fun" : function(param) { return param.wDAO.isWord(param.tab[2])},
                "msg" : "Votre mot est déjà dans la base"
            }
        ],
        "action" : function(param) {   
            param.wDAO.addWord(param.tab[2].toLowerCase());
            param.msg.channel.send("Votre mot à été ajouté");
        }
    },

    "delw" : { 
        "condition" : [
            {
                "fun" : function(param) { return param.tab[2] != undefined},
                "msg" : "Vous n'avez pas saisi de mot !"
            },
            {
                "fun" : function(param) { return !param.wDAO.isWord(param.tab[2].toLowerCase())},
                "msg" : "Votre mot n'est pas dans la base"
            }
        ],
        "action" : function(param) {
            param.wDAO.delWord(param.tab[2].toLowerCase());
            param.msg.channel.send("Votre mot à été enlevé");
        }
    },

    "w" : { 
        "action" : function(param) {
            tabWord = param.wDAO.get();
            if (tabWord.lenght != 0) {
                string = "Voici les mots que je connais : "
                tabWord.forEach(element => {
                    string += element + ", ";
                });
                string = string.substring(0, string.length - 2);
                param.msg.channel.send(string);
            } else param.msg.channel.send("Il n'y a pas de mots dans la base");
        }
    },

    //#endregion

    //#region Setup
    "setup" : { 
        "condition" : [
            {
                "fun" : function(param) { return !param.g.isSetup(param.msg.guild)},
                "msg" : "Le terrain est déjà mis en place"
            }
        ], 
        "action" : function(param){
            param.msg.channel.send("Mise en place du terrain...");
            param.g.setupRoles(param.msg.guild).then(roles => {
                param.g.setupChannels(param.msg.guild, roles).then(chan => {
                    param.gDAO.setup(param.msg.guild, chan, roles);
                    param.msg.channel.send("Le terrain est mis en place ! Commencez une mission avec /cd start");
                })
            }).catch( err => {
                param.msg.channel.send("Une erreur est survenue : " + err.message);
            })
        }
    },

    "unsetup" : { 
        "condition" : [
            {
                "fun" : function(param) { return param.gDAO.isSetup(param.msg.guild)},
                "msg" : "Le terrain n'est pas mis en place"
            }
        ], 
        "action" : function(param){
            param.msg.channel.send("Désinstallation du terrain...");
            param.g.unsetup(param.bot, param.msg.guild,param.gDAO.getChannels(param.msg.guild), param.gDAO.getRoles(param.msg.guild)).then(a => {
                param.gDAO.unsetup(param.msg.guild);
                param.msg.channel.send("Aurevoir, agents. Vous nous manquerez...");
            }).catch( err => {
                param.msg.channel.send("Une erreur est survenue : " + err.message);
            })
        }
    },

    //#endregion

    //#region Prepare
    "start" : {
        "condition" : [
            
            {
                "fun" : function(param) { return param.gDAO.isSetup(param.msg.guild)},
                "msg" : "Le terrain n'est pas mis en place ! Uttilisez /cd setup"
            },
            {
                "fun" : function(param) { return !param.gDAO.hasGame(param.msg.guild)},
                "msg" : "Une mission est déjà en cours... Êtes vous un espion ?"
            },
            {
                "fun" : function(param) {
                    if (param.tab[2] != undefined)
                        return !isNaN(parseInt(param.tab[2]));
                    return true
                },
                "msg" : "Le nombre de point doit être valide"
            }
        ], 
        "action" : function(param){
            pt = 6;
            if (param.tab[2] != undefined)
                pt = parseInt(param.tab[2])
            param.gDAO.startGame(param.msg.guild, pt);
            param.msg.channel.send("Préparez vous espions, rentrez dans la mission avec */cd join*, et commencez avec */cd begin*");
        }
    },

    "join" : {
        "condition" : [
            {
                "fun" : function(param) { return param.gDAO.hasGame(param.msg.guild)},
                "msg" : "De quoi voulez vous parler ? Il n'y a pas de mission en cours..."
            }, 
            {
                "fun" : function(param) { return !param.gDAO.hasBegin(param.msg.guild)},
                "msg" : "La mission à déjà commencée ! Revenez plus tard..."
            }, 
            {
                "fun" : function(param) { return !param.gDAO.hasPlayer(param.msg.guild, param.msg.author)},
                "msg" : "Vous êtes déjà dans la mission !"
            }
        ],
        "action" :function(param){
            param.gDAO.join(param.msg.guild, param.msg.author)
            param.msg.reply("vous avez rejoint la mission !")
        }
    },

    "leave" : {
        "condition" : [
            {
                "fun" : function(param) { return param.gDAO.hasGame(param.msg.guild)},
                "msg" : "De quoi voulez vous parler ? Il n'y a pas de mission en cours..."
            }, 
            {
                "fun" : function(param) { return !param.gDAO.hasBegin(param.msg.guild)},
                "msg" : "La mission à déjà commencée ! Vous ne pouvez pas partir maintenant..."
            }, 
            {
                "fun" : function(param) { return param.gDAO.hasPlayer(param.msg.guild, param.msg.author)},
                "msg" : "Vous n'êtes pas dans la mission !"
            }
        ],
        "action" :function(param){
            param.gDAO.leave(param.msg.guild, param.msg.author)
            param.msg.reply("vous avez quitté la mission !")
        }
    },

    "players" : {
        "condition" : [
            {
                "fun" : function(param) { return param.gDAO.hasGame(param.msg.guild)},
                "msg" : "De quoi voulez vous parler ? Il n'y a pas de mission en cours..."
            },
            {
                "fun" : function(param) { return param.gDAO.getGame(param.msg.guild).players.lenght != 0},
                "msg" : "Il n'y a actuellement aucun joueur"
            }
        ],
        "action" :function(param){
            string = "Voici les joueurs actuellement dans la mission : ";
            param.gDAO.getPlayers(param.msg.guild, param.bot.users).then(names => {
                names.forEach(user => {
                    string += user.username + ", ";
                });
                param.msg.channel.send(string.substring(0, string.length -2))
            })
        }
    },

    //#endregion 
    
    //#region Game 

    "begin" : {
        "condition" : [
            {
                "fun" : function(param) { return param.gDAO.isSetup(param.msg.guild)},
                "msg" : "Le terrain n'est pas mis en place, faites */cd setup* pour commencer."
            },
            {
                "fun" : function(param) { return param.gDAO.hasGame(param.msg.guild)},
                "msg" : "De quoi voulez vous parler ? Il n'y a pas de mission en cours..."
            },
            {
                "fun" : function(param) { return param.gDAO.getGame(param.msg.guild).players.length >= 4},
                "msg" : "Il faut au minimum 4 joueurs..."
            },
            {
                "fun" : function(param) { return !param.gDAO.hasBegin(param.msg.guild)},
                "msg" : "La mission a déjà commencé !"
            },
            {
                "fun" : function(param) { 
                    game = param.gDAO.getGame(param.msg.guild);
                    return param.wDAO.nbWords() >= (game.nbrPoints * 2 + game.nbrNull + 1);
                },
                "msg" : "Il n'y a pas assez des mots ! Rajoutez en avec */cd addw*"
            },
        ],
        "action" : function() { 
            game = param.gDAO.getGame(param.msg.guild);
            map = param.map.generate(game.nbrPoints, game.nbrNull, param.wDAO.get());
            stringSpyMap = param.map.toStringSpy(map);
            stringMasterMap = param.map.toStringMaster(map);
            param.g.setRole(game.players, param.msg.guild.members, param.gDAO.getRoles(param.msg.guild))
                .then(v => {
                    param.g.setMap(stringMasterMap, stringSpyMap, param.gDAO.getChannels(param.msg.guild), param.bot)
                        .then(messagesID => {
                            blue = param.gDAO.getMentionRole(param.msg.guild, "blue");
                            red = param.gDAO.getMentionRole(param.msg.guild, "red");
                            param.msg.channel.send("**Espions, "+ blue + ", "+ red + ", la partie a commencé**\n"
                                + "Maitres espions, jouez avec */cd hint*, Apprentis, jouez avec */cd guess*")
                            param.gDAO.beginGame(param.msg.guild, map, messagesID)
                        })
                });
        }
    },

    "mission" : {
        "condition" : [
            {
                "fun" : function(param) { return param.gDAO.isSetup(param.msg.guild)},
                "msg" : "Le terrain n'est pas mis en place, faites */cd setup* pour commencer."
            }
        ], 
        "action" : function(param) {
            if (!param.gDAO.hasGame(param.msg.guild)) {
                param.msg.channel.send("Aucune mission n'est en cours ou en préparation... Faites */cd start* pour en commencer une !");
            } else if (!param.gDAO.hasBegin(param.msg.guild)) {
                string = "Une mission est en préparation avec les joueurs suivants : ";
                param.gDAO.getPlayers(param.msg.guild, param.bot.users).then(names => {
                    if (names.length == 0) 
                        string = "Une partie est en cours de préparation mais aucun joueurs n'y participent..";
                    else names.forEach(user => {
                        string += user.username + ", ";
                        });
                    param.msg.channel.send(string.substring(0, string.length -2))
                })
                
            } else {
                game = param.gDAO.getGame(param.msg.guild);
                str = "**Une partie est en cours** \n";
                str += "Les scores sont " + game.blue + " pour les Bleus et " + game.red + " pour les rouges (partie en " + game.nbrPoints + ")\n";

                tab = [["Equipe Bleue : ", game.bWToFind, game.bLastHint],["Equipe Rouge : ", game.rWToFind, game.rLastHint]];

                tab.forEach(t => {
                    str += t[0];
                    if (t[1] == -1) 
                        str += "Attente de l'indication du maitre espion \n";
                    else if (t[1] == 0)
                        str += " Tour Fini\n";
                    else 
                        str += " Il reste " + t[1] + " mots à deviner aux apprentis espions pour l'indice : " + t[2] + "\n";
                })
                param.msg.channel.send(str);
                
            }
        }
    },


    "hint" : {
        "condition" : [
            {
                "fun" : function(param) { return param.gDAO.isSetup(param.msg.guild)},
                "msg" : "Le terrain n'est pas mis en place, faites */cd setup* pour commencer."
            },
            {
                "fun" : function(param) { return param.gDAO.hasGame(param.msg.guild)},
                "msg" : "De quoi voulez vous parler ? Il n'y a pas de mission en cours..."
            },
            {
                "fun" : function(param) { return param.gDAO.hasBegin(param.msg.guild)},
                "msg" : "La mission n'a pas encore commencée, faites */cd begin*"
            },
            {
                "fun" : function(param) { return param.g.isMaster(param.gDAO.getRoles(param.msg.guild)["master"], param.msg.member)},
                "msg" : "Vous devez être un maitre espion pour faire cette commande"
            },
            {
                "fun" : function(param) { 
                    team = param.g.getTeam(param.gDAO.getRoles(param.msg.guild), param.msg.member);
                    if (team != -1) return param.gDAO.canHint(param.msg.guild, team) 
                    else return false;
                },
                "msg" : "Vous ne pouvez pas jouer pour le moment, attendez que les espions trouvent tous leurs mots"
            },
            {
                "fun" : function(param) { return (param.tab[2] !== undefined && param.tab[3] !== undefined)},
                "msg" : "La commande hint doit être dans ce format : */cd hint <l'indice> <le nombre de mot à trouver>*"
            },
            {
                "fun" : function(param) { return !isNaN(parseInt(param.tab[3]))},
                "msg" : "Le deuxième paramètre doit être un nombre valide"
            }
        ],
        "action" : function(param) {
            team = param.g.getTeam(param.gDAO.getRoles(param.msg.guild), param.msg.member);
            if (team == 0) strTeam = "blue"
            else strTeam =  "red";

            mention = param.gDAO.getMentionRole(param.msg.guild, strTeam);
            str = mention + ", votre maitre espion vous a indiqué l'indice **" + param.tab[2] + "** pour " + param.tab[3] + " mots"
            param.bot.channels.fetch(param.gDAO.getChannels(param.msg.guild)["jeu"])
                .then(ch => ch.send(str));
            param.gDAO.setHint(param.msg.guild, team, parseInt(param.tab[3]), param.tab[2]);
        }
    },


    "guess" : {
        "condition" : [
            {
                "fun" : function(param) { return param.gDAO.isSetup(param.msg.guild)},
                "msg" : "Le terrain n'est pas mis en place, faites */cd setup* pour commencer."
            },
            {
                "fun" : function(param) { return param.gDAO.hasGame(param.msg.guild)},
                "msg" : "De quoi voulez vous parler ? Il n'y a pas de mission en cours..."
            },
            {
                "fun" : function(param) { return param.gDAO.hasBegin(param.msg.guild)},
                "msg" : "La mission n'a pas encore commencée, faites */cd begin*"
            },
            {
                "fun" : function(param) {return param.g.getTeam(param.gDAO.getRoles(param.msg.guild), param.msg.member) != -1;},
                "msg" : "Vous ne faites pas partie du jeu, revenez plus tard !"
            },
            {
                "fun" : function(param) { return ! param.g.isMaster(param.gDAO.getRoles(param.msg.guild)["master"], param.msg.member)},
                "msg" : "Vous devez être un apprenti espion pour faire cette commande"
            },
            {
                "fun" : function(param) { 
                    team = param.g.getTeam(param.gDAO.getRoles(param.msg.guild), param.msg.member);
                    if (team != -1) return param.gDAO.canGuess(param.msg.guild, team) 
                    else return false;
                },
                "msg" : "Vous n'avez aucun mots à deviner"
            },
            {
                "fun" : function(param) { return (param.tab[2] !== undefined)},
                "msg" : "Vous devez spécifier un mot à choisir"
            },
            {
                "fun" : function(param) { return param.gDAO.hasWord(param.msg.guild, param.tab[2])},
                "msg" : "Votre mot doit être dans la liste des mots du jeu"
            }
        ],
        "action" : function(param) {
            team = param.g.getTeam(param.gDAO.getRoles(param.msg.guild), param.msg.member);
            if (team == 0) strTeam = "blue"
            else strTeam =  "red";

            game = param.gDAO.getGame(param.msg.guild);

            roles = param.gDAO.getRoles(param.msg.guild);

            mentionTeam = param.gDAO.getMentionRole(param.msg.guild, strTeam);

            mentionBlue = param.gDAO.getMentionRole(param.msg.guild, "blue");
            mentionRed = param.gDAO.getMentionRole(param.msg.guild, "red");
            mentionMaster = param.gDAO.getMentionRole(param.msg.guild, "master");

            channels = param.gDAO.getChannels(param.msg.guild);
            messagesID = param.gDAO.getGame(param.msg.guild).messagesID;

            tabRes = param.gDAO.guessWord(param.msg.guild, param.tab[2], team);
            map = tabRes[1];
            val = tabRes[0];
            event = tabRes[2];

            stringSpyMap = param.map.toStringSpy(map);
            stringMasterMap = param.map.toStringMaster(map);
            param.g.setMap(stringMasterMap, 
                stringSpyMap, 
                channels, 
                param.bot,
                messagesID);
            
            if (val == 0 || val == 1) {
                if (team == val)
                    str = " vous avez révélé "+ param.tab[2] +" et vous avez trouvé un de vos agents !"
                else str = " vous avez révélé "+ param.tab[2] +", dommage, vous êtes tombé sur un agent de l'équipe adverse ! Votre tour s'arrête ici...";
            } else if (val == 2) 
                str = " vous avez révélé "+ param.tab[2] +", vous avez découvert un témoin ! Votre tour s'arrête ici...";
            else if (val == 3) str = ", vous avez découvert le traitre ("+param.tab[2]+") ! Vos adversaire gagnent la mission...";
            console.log(event);
            param.bot.channels.fetch(channels["jeu"])
                .then(ch => {
                    ch.send(mentionTeam + str);
                    if (event == 0) {
                        ch.send(mentionBlue + mentionRed + " l'équipe Bleue à réeussi la mission ! Une coupe de chamapgne ? 🥂");
                        param.g.unsetRole(game.players, param.msg.guild.members, roles);
                    } else if (event == 1) {
                        ch.send(mentionBlue + mentionRed + " l'équipe Rouge à réeussi la mission ! Une coupe de chamapgne ? 🥂");
                        param.g.unsetRole(game.players, param.msg.guild.members, roles);
                    } else if (event == 2) {
                        ch.send(mentionMaster + " le tour est fini, donnez donc un nouvel indice...");
                    }
                });
        }
    },
    

    "finish" : { 
        "condition" : [
            {
                "fun" : function(param) { return param.gDAO.isSetup(param.msg.guild)},
                "msg" : "Le terrain n'est pas mis en place, faites */cd setup* pour commencer."
            },
            {
                "fun" : function(param) { return param.gDAO.hasGame(param.msg.guild)},
                "msg" : "De quoi voulez vous parler ? Il n'y a pas de mission en cours..."
            }
        ],
        "action" :function(param){
            game = param.gDAO.getGame(param.msg.guild);
            param.g.unsetRole(game.players, param.msg.guild.members, param.gDAO.getRoles(param.msg.guild))
                .then(param.gDAO.finishGame(param.msg.guild));
            param.msg.channel.send("Annulez la mission ! Nous sommes découverts !");
        }
    },

    "score" : {
        "condition" : [
            {
                "fun" : function(param) { return param.gDAO.hasGame(param.msg.guild)},
                "msg" : "De quoi voulez vous parler ? Il n'y a pas de mission en cours..."
            }
        ],
        "action" :function(param){
            game = param.gDAO.getGame(param.msg.guild);
            param.msg.channel.send("Voici le score : **Bleu " + game.blue + "** et **Rouge " + game.red +"** (pour rappel, cest une partie en "+ game.nbrPoints + ")");
        }
    }

    //#endregion
}

module.exports = entries;
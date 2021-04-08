var Game = {

    setupChannels(serveur, roles) {
        return new Promise(function (resolve, reject) {
            channels = {};
            serveur.channels.create('CodeName', {
                type : "category",
            }).then(cat => {
                channels["cat"] = cat.id;
                Promise.all([
                    serveur.channels.create('📜-mots', {
                        topic : "Ici se trouvent les noms de codes à deviner",
                        parent : cat,
                        permissionOverwrites: [
                            {
                                id: serveur.id,
                                deny: ['SEND_MESSAGES'],
                            }
                        ]
                    }),
                    serveur.channels.create('🎲-jeu', {
                        topic : "Essayez de démasquer les agents...",
                        parent : cat
                    }),
                    serveur.channels.create('🔵-bleu', {
                        topic : "Montrez patte bleue pour entrer...",
                        parent : cat,
                        permissionOverwrites: [
                            {
                                type: 'role',
                                id: roles["red"],
                                deny: ['VIEW_CHANNEL'],
                            }
                        ]
                    }),
                    serveur.channels.create('🔴-rouge', {
                        topic : "Montrez patte rouge pour entrer...",
                        parent : cat,
                        permissionOverwrites: [
                            {
                                type: 'role',
                                id: roles["blue"],
                                deny: ['VIEW_CHANNEL'],
                            }
                        ]
                    }),
                    serveur.channels.create('🤐-espions', {
                        topic : "Ici sont révélés les espions... Réservé aux maitres !",
                        parent : cat,
                        permissionOverwrites: [
                            {
                                type: 'role',
                                id: roles["master"],
                                allow: ['VIEW_CHANNEL'],
                            },
                            {
                                id: serveur.id,
                                deny: ['VIEW_CHANNEL'],
                            }
                        ]
                    }),
                    serveur.channels.create('😆 Autour de la table', {
                        topic : "Venez parler librement !",
                        parent : cat,
                        type : "voice"
                    }),
                    serveur.channels.create('🕵️ Maitres Espions', {
                        topic : "Venez parler librement !",
                        parent : cat,
                        type : "voice",
                        permissionOverwrites: [
                            {
                                type: 'role',
                                id: roles["master"],
                                allow: ['CONNECT'],
                            },
                            {
                                id: serveur.id,
                                deny: ['CONNECT'],
                            }
                        ]
                    })
                ]).then(v => {
                    channels["cat"] = cat.id;
                    channels["mots"] = v[0].id;
                    channels["jeu"] = v[1].id;
                    channels["bleu"] = v[2].id;
                    channels["rouge"] = v[3].id;
                    channels["espions"] = v[4].id;
                    channels["voiceGeneral"] = v[5].id;
                    channels["voiceEspion"] = v[6].id;

                    resolve(channels);
                });
            }).catch(err => reject(err))
        })
    },

    setupRoles(serveur) {
        return new Promise(function (resolve, reject) {
            roles = {};
            Promise.all([
                serveur.roles.create({
                    data: {
                      name: 'Equipe Bleue',
                      color: 'BLUE',
                    }
                }),
                serveur.roles.create({
                    data: {
                      name: 'Equipe Rouge',
                      color: 'RED',
                    }
                }),
                serveur.roles.create({
                    data: {
                      name: 'Maitres espions',
                      hoist: true
                    }
                })
            ]).then(v => {
                roles["blue"] = v[0].id;
                roles["red"] = v[1].id;
                roles["master"] = v[2].id;

                resolve(roles);
            })
        })

    },

    unsetup(client, serveur, channels, roles) {
        chanNames = ["mots", "jeu", "bleu", "rouge", "espions", "voiceGeneral", "voiceEspion", "cat"]
        rolesNames = ["blue", "red", "master"];
        promises = [];
        chanNames.forEach(id => {
            promises.push(client.channels.fetch(channels[id])
                .then(channel => {
                    channel.delete()
                }))
        });
        rolesNames.forEach(id => {
            promises.push(serveur.roles.fetch(roles[id])
                .then(role => {
                    role.delete()
                }))
        });
        return Promise.all(promises);
    },

    isSetup(serveur) {
        return (serveur.channels.cache.find(ch => ch.name === 'CodeName') !== undefined);
    },

    setRole(players, memberManager, roles) {
        team = this.generateTeam(players.length);
        masters = this.generateMaster(team);
        return new Promise(function(resolve, reject) {
            promises = [];
            players.forEach(id => {
                promises.push(memberManager.fetch(id))
            })
            Promise.all(promises).then(arr => {
                for (i=0; i<players.length; i++) {
                    if (team[i] == 0)
                        arr[i].roles.add(roles["blue"]);
                    else
                        arr[i].roles.add(roles["red"]);
                    if (i == masters[0] || i == masters[1])
                        arr[i].roles.add(roles["master"]);
                }
                resolve();
            });
        })
        
    },

    unsetRole(players, memberManager, roles) {
        return new Promise(function(resolve, reject) {
            promises = [];
            players.forEach(id => {
                promises.push(memberManager.fetch(id))
            })
            Promise.all(promises).then(arr => {
                for (i=0; i<players.length; i++) {
                    arr[i].roles.remove(roles["blue"]);
                    arr[i].roles.remove(roles["red"]);
                    arr[i].roles.remove(roles["master"]);
                }
                resolve();
            });
        });
    },

    generateTeam(size) {
        if (size%2 == 0) tab=[size/2, size/2];
        else tab=[(size-1)/2, (size+1)/2];
        team = [];
        while (team.length < size) {
            value = Math.floor(Math.random() * tab.length);
            if (tab[value] > 0) {
                tab[value] -= 1;
                team.push(value)
            }
        }
        return team;
    },

    generateMaster(team) {
        blueVal = -1;
        redVal = -1;
        blue = false;
        red = false;
        while (!blue || !red) {
            val = Math.floor(Math.random() * team.length)
            if (team[val] == 0 && !blue) {
                blue = true;
                blueVal = val;
            } else if (team[val] == 1 && !red) {
                red = true;
                redVal = val;
            }
        }
        return [blueVal, redVal];
    },

    setMap(stringMasterMap, stringSpyMap, channels, bot) {
        return new Promise(function(resolve, reject){
            Promise.all([
                bot.channels.fetch(channels["mots"]),
                bot.channels.fetch(channels["espions"])
            ]).then(arr => {
                arr[0].send(stringSpyMap);
                arr[1].send(stringMasterMap);
                resolve([arr[0].id, arr[1].id])
            })
        })
    },

    updateMap(stringMasterMap, stringSpyMap, channels, bot, messagesId) {
        return new Promise(function(resolve, reject){
            Promise.all([
                bot.channels.fetch(channels["mots"]),
                bot.channels.fetch(channels["espions"])
            ]).then(arr => {
                arr[0].messages.fetch(messagesId[0]).then(msg => {
                    msg.edit(stringSpyMap);
                })
                arr[1].messages.fetch(messagesId[1]).then(msg => {
                    msg.edit(stringMasterMap);
                })
                resolve()
            })
        })
    },

    isMaster(roleId, member) {
        return member.roles.cache.has(roleId);
    },

    getTeam(roles, member) {
        if (member.roles.cache.has(roles["blue"]))
            return 0;
        else if (member.roles.cache.has(roles["red"]))
            return 1;
        else return -1;
    }
}

module.exports = Game;
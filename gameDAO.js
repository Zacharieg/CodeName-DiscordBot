var gameDAO = {

    fileName : "games.json",

    startGame : function(serv, nbrP) {
        data = this.get();
        data[serv.id].game = {
            red : 0,
            blue : 0,
            players : [],
            hasBegin : false,
            nbrPoints : nbrP,
            nbrNull : 3
        };
        this.save(data);
    },

    finishGame : function(serv) {
        data = this.get();
        delete data[serv.id].game;
        this.save(data);
    },

    beginGame : function(serv, map, messagesId) {
        data = this.get();
        data[serv.id].game.hasBegin = true;
        data[serv.id].game.bWToFind = -1;
        data[serv.id].game.rWToFind = -1;
        data[serv.id].game.map = map;
        data[serv.id].game.messagesId = messagesId;
        data[serv.id].game.bLastHint = "";
        data[serv.id].game.rLastHint = "";
        this.save(data);
    },

    setup : function(serv, channels, roles) {
        data = this.get();
        data[serv.id] = {};
        data[serv.id].channels = channels;
        data[serv.id].roles = roles;
        this.save(data);
    },

    unsetup : function(serv) {
        data = this.get();
        delete data[serv.id];
        this.save(data);
    },

    getGame : function(serv) {
        data = this.get();
        return data[serv.id].game;
    },

    getChannels : function(serv) {
        data = this.get();
        return data[serv.id].channels;
    },

    getRoles : function(serv) {
        data = this.get();
        return data[serv.id].roles;
    },

    addPointGame : function(serv, team) {
        data = this.get()
        if (team == 0)
            data[serv.id].game.blue += 1;
        else data[serv.id].game.red += 1;
        this.save(data)
    },

    hasGame : function(serv){
        data = this.get()[serv.id];
        return (data !== undefined)? (data.game !== undefined):false;
    },

    hasBegin : function(serv){
        data = this.get();
        
        return (data[serv.id] !== undefined)? data[serv.id].game.hasBegin:false;
    },

    isSetup : function(serv){
        data = this.get();
        return (data[serv.id] !== undefined);
    },

    join : function(serv, player){
        data = this.get();
        data[serv.id].game.players.push(player.id)
        this.save(data)
    },

    leave : function(serv, player){
        data = this.get();
        data[serv.id].game.players.filter(id => id != player.id);
        this.save(data)
    },

    hasPlayer : function(serv, player){
        return (this.get()[serv.id].game.players.includes(player.id));
    },

    getPlayers : function(serv, users_manager) {
        data = this.get();
        return new Promise(function (resolve, reject) {
            users = []
            promises = [];
            data[serv.id].game.players.forEach(id => promises.push(users_manager.fetch(id)))
            Promise.all(promises).then(arr => {
                arr.forEach(user => users.push(user));
                resolve(users);
            }).catch(err => reject(err));
        })
    },

    getMentionRole : function(serv, role) {
        data = this.get()[serv.id];
        return "<@&"+data.roles[role]+">";
    },

    canHint(serv, team) {
        data = this.get()[serv.id];
        if (team == 0)
            return data.game.bWToFind == -1;
        else 
            return data.game.rWToFind == -1;
    },

    canGuess(serv, team) {
        data = this.get()[serv.id];
        if (team == 0)
            return data.game.bWToFind > 0;
        else 
            return data.game.rWToFind > 0;
    },

    haveWords(serv, team) {
        data = this.get()[serv.id];
        if (team == 0)
            return data.game.bWToFind > 0;
        else 
            return data.game.rWToFind > 0;
    },

    setHint(serv, team, nbW, hint) {
        data = this.get();
        if (team == 0) {
            data[serv.id].game.bWToFind = nbW;
            data[serv.id].game.bLastHint = hint;
        } else {
            data[serv.id].game.rWToFind = nbW;
            data[serv.id].game.rLastHint = hint;
        }
        this.save(data);
    },

    guessWord(serv, word, team) {
        data = this.get();
        result = -1;

        //-1 : Nothing, 0 : Blue Win, 1 : Red Win, 2 : End Turn
        event = -1;

        data[serv.id].game.map.forEach(tab => {
            if (tab[0] === word) {
                tab[2] = true;
                result = tab[1];
            }
        })

        map = data[serv.id].game.map;

        if (team != result) {
            if (team == 0)
                data[serv.id].game.bWToFind = 0;
            else data[serv.id].game.rWToFind = 0;
        } else {
            if (team == 0)
                data[serv.id].game.bWToFind -= 1;
            else data[serv.id].game.rWToFind -= 1;
        }

        if (data[serv.id].game.bWToFind == 0 && data[serv.id].game.rWToFind == 0) {
            data[serv.id].game.bWToFind = -1;
            data[serv.id].game.rWToFind = -1;
            event = 2
        }

        if (result == 0) {
            data[serv.id].game.blue += 1;
        } else if (result == 1)
            data[serv.id].game.red += 1;

        if (data[serv.id].game.blue == data[serv.id].game.nbrPoints) {
            event = 0;
            this.finishGame(serv);
        } else if (data[serv.id].game.red == data[serv.id].game.nbrPoints) {
            event = 1;
            this.finishGame(serv);
        } else if (result == 3) {
            if (team == 0)
                event = 1
            else
                event = 0
            this.finishGame(serv);
        }
            

        this.save(data);
        return [result, map, event]
    },

    hasWord(serv, word) {
        map = this.get()[serv.id].game.map;
        isHere = false;
        map.forEach(tab => {if (tab[0] === word && !tab[2]) isHere = true})
        return isHere
    },


    save : function(data) {
        var fs = require('fs'); 

        var content = JSON.stringify(data, null, "\t");;

        fs.writeFile(this.fileName, content, 'utf8', function (err) {
            if (err) {
                console.log("An error occured while writing JSON Object to File.");
                return console.log(err);
            }
        }); 
    },

    get : function() {
        const fs = require('fs');

        let rawdata = fs.readFileSync(this.fileName);
        let words = JSON.parse(rawdata);
        return words;
    }
}

module.exports = gameDAO
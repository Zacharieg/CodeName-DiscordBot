let wordDAO = {

    fileName : "words.json",

    isWord : function(word) {
        data = this.get();
        return (data.indexOf(word) === -1);
    },

    addWord : function(word) {
        data = this.get();
        data.push(word);
        this.save(data);
    },

    delWord : function(word) {
        data = this.get();
        data = data.filter(w => w !== word)
        this.save(data);
    },

    addWords : function(words) {
        this.save(this.get().concat(words));
    },

    nbWords : function() {
        data = this.get();
        return (data.length);
    },

    save : function(data) {
        var fs = require('fs'); 

        var content = JSON.stringify(data);

        fs.writeFile(this.fileName, content, 'utf8', function (err) {
            if (err) {
                console.log("An error occured while writing JSON Object to File.");
                return console.log(err);
            }
         
            console.log("Mots Sauvegardés !");
        }); 
    },

    get : function() {
        const fs = require('fs');

        let rawdata = fs.readFileSync(this.fileName);
        let words = JSON.parse(rawdata);
        return words;
    }
}

module.exports = wordDAO;
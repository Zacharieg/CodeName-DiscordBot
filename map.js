var map = {
    generate(nbPoints, nbNull, data_words) {
        size = nbPoints * 2 + nbNull + 1;
        words = this.pickWords(size, data_words);
        values = this.pickValue(nbPoints, nbNull, size);
        map = []
        for(i = 0; i < size; i++) {
            map.push([words[i], values[i], false]);
        }
        return map;
    },

    pickWords(size, data_words) {
        
        words = [];
        while (words.length < size) {
            word = data_words[Math.floor(Math.random() * data_words.length)];
            data_words = data_words.filter(w => w !== word);
            words.push(word);
        }
        return words;
    },

    pickValue(nbPoints, nbNull, size) {
        tab=[nbPoints, nbPoints, nbNull, 1];
        values = [];
        while (values.length < size) {
            value = Math.floor(Math.random() * tab.length);
            if (tab[value] > 0) {
                tab[value] -= 1;
                values.push(value)
            }
        }
        return values;
    },


    toStringMaster(map) {
        d = new Date();
        date = d.getDate()+"/"+d.getMonth();
        string = "**Partie du "+ date + "** \n";
        map = map.sort((a,b) => a[1] - b[1]);
        for(i = 0; i < map.length; i ++) {
            if (map[i][1] == 0) valeur = "Bleu";
            else if (map[i][1] == 1) valeur = "Rouge";
            else if (map[i][1] == 3) valeur = "Traitre";
            else valeur = "Témoins";
            strW = map[i][0] + " -> __" + valeur + "__";
            if (map[i][2])
                strW = "~~"+strW+"~~";
            string += strW + "\n";
        }
        return string;
    },

    toStringSpy(map) {
        d = new Date();
        date = d.getDate()+"/"+d.getMonth();
        string = "**Partie du "+ date + "** \n";
        for(i = 0; i < map.length; i ++) {
            strW = map[i][0];
            if (map[i][2])
                strW = "~~"+strW+"~~";
            string += strW + "\n";
        }
        return string;
    }
}

module.exports = map;
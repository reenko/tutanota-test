const XXHash = require('xxhash'); // https://softwareengineering.stackexchange.com/questions/49550/which-hashing-algorithm-is-best-for-uniqueness-and-speed

const SEED = 10;

class WShingling {
    constructor(shingleLength) {
        this.shingleLength = shingleLength || 4;

        this.cache = {} // or use lib with ttl https://www.npmjs.com/package/node-cache
    }

    _escapeRegExp(string) {
        // https://github.com/sindresorhus/escape-string-regexp
        return string
            .replace(/[|\\{}()[\]^$+*?.]/g, '\\$&')
            .replace(/-/g, '\\x2d');
    }

    _strCharacterRemove(text, ch) {
        const regex = new RegExp(this._escapeRegExp(ch), 'g');
        return text.replace(regex, '');
    }

    _removeWordFromText(text, word) {
        // we can't remove 'in' in 'in-app' string
        const regex = new RegExp(`(^|\\s)${this._escapeRegExp(word)}(?=\\s|$)`, 'g');
        return text.replace(regex, '');
    }

    _textCanonization(text) {
        // TODO: Clean HTML tags, at this moment we work only with plain text

        const notImportantWords = ['a', 'the', 'on', 'are', 'it', 'in', 'by', 'of', 'to', 'and', 'is', 'but', 'hi', 'hello'];
        notImportantWords.forEach((word) => {
            text = this._removeWordFromText(text, word);
        });

        // remove all spec symbols
        const specialSymbols = ['”', '“', "\n", '\r', ',', '.', ':', '$', '#', '"', '(', ')', '[', ']', ';', '{', '}', '\'', '%', '&', '!'];
        specialSymbols.forEach((ch) => {
            text = this._strCharacterRemove(text, ch);
        });

        // TODO: replace all plural nouns to single ones
        // https://code.google.com/archive/p/jspos/

        // Remove multiple spaces
        text = text.replace(/\s{2,}/g, ' ');
        text = text.trim();

        return text;
    }

    _makeShingles (text) {
        const shingles = [];
        let words = text.split(' ');
        const wordsLength = words.length;

        if (wordsLength < this.shingleLength) {
            shingles.push(words.join(' '));
        } else {
            while (shingles.length !== (wordsLength - this.shingleLength + 1)) {
                shingles.push(words.slice(0, this.shingleLength).join(' '));
                words = words.slice(1);
            }
        }

        return shingles;
    };

    _hashingShingles (shingles) {
        const hashes = [];

        for (let i = 0, k = shingles.length; i < k; i++) {
            hashes.push(XXHash.hash(Buffer.from(shingles[i]), SEED));
        }

        return hashes;
    };

    compareShingles(firstHashes, secondHashes) {
        let count = 0;

        // intersection = firstHashes.filter(hash => secondHashes.includes(hash));
        firstHashes.forEach(function (item) {
            if (secondHashes.includes(item)) {
                count++;
            }
        });

        return count * 2 / (firstHashes.length + secondHashes.length);
    };

    convertTextToShingles(text) {
        const hash = 'h' + XXHash.hash(Buffer.from(text), SEED); // m.b it's reasonable to use md5
        if (this.cache[hash]) {
            return this.cache[hash];
        }

        const preparedText = this._textCanonization(text);
        const shingles = this._makeShingles(preparedText);
        let hashes = this._hashingShingles(shingles);
        this.cache[hash] = [...hashes];
        return hashes;
    }

    compare(firstText, secondText) {
        const firstHashes = this.convertTextToShingles(firstText);
        const secondHashes = this.convertTextToShingles(secondText);

        return this.compareShingles(firstHashes, secondHashes);
    }

}

module.exports = WShingling;

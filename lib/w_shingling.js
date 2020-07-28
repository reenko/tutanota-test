class WShingling {
    constructor({ shingleLength, hashFunction }) {
        if (shingleLength && typeof shingleLength !== 'number') {
            throw new Error('Wrong type for shingleLength');
        }

        if (!hashFunction || typeof hashFunction !== 'function') {
            throw new Error('hashFunction should be a function');
        }

        this._shingleLength = shingleLength || 4;
        this._hashFunction = hashFunction;

        this._cache = {} // or use lib with ttl https://www.npmjs.com/package/node-cache
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

    _removeAllSpecSymbols(text) {
        const specialSymbols = ['”', '“', "\n", '\r', ',', '.', ':', '$', '#', '"', '(', ')', '[', ']', ';', '{', '}', '\'', '%', '&', '!', '?', '/'];
        specialSymbols.forEach((ch) => {
            text = this._strCharacterRemove(text, ch);
        });
        return text;
    }

    _removeShortWords(text) {
        return text.replace(/(\b(\w{1,2})\b(\s|$))/g, '');
    }

    _removeUselessSpaces(text) {
        return text.replace(/\s{2,}/g, ' ').trim();
    }

    _advanceCanonization(text) {
        // TODO: Raise quality of canonization
        // Step 1: Detect lang of text (Eng, Ger, Rus, Ita...)
        // Step 2: Base on lang: replace all plural nouns to single
        // Step 3: Base on lang: clean text from not important words (preposition or from dictonary) e.x. https://code.google.com/archive/p/jspos/

        // do nothing at this moment
        return text;
    }

    _textCanonization(text) {
        // TODO: Clean HTML tags, at this moment we work only with plain text

        text = this._removeAllSpecSymbols(text);

        text = this._removeShortWords(text);

        text = this._removeUselessSpaces(text);

        text = text.toLowerCase();

        text = this._advanceCanonization(text);

        return text;
    }

    _makeShingles (text) {
        const shingles = [];
        let words = (text || '').split(' ');
        const wordsLength = words.length;

        if (wordsLength < this._shingleLength) {
            shingles.push(words.join(' '));
        } else {
            while (shingles.length !== (wordsLength - this._shingleLength + 1)) {
                shingles.push(words.slice(0, this._shingleLength).join(' '));
                words = words.slice(1);
            }
        }

        return shingles;
    };

    _hashingShingles (shingles) {
        return shingles.map((shingle) => this._hashFunction(shingle));
    };

    compareShingles(firstHashes, secondHashes) {
        let count = 0;

        if (!firstHashes && !secondHashes) {
            return 1; // null === null
        }

        if  (!firstHashes || !secondHashes) {
            return 0; // [data] !== null
        }

        if (firstHashes.length === 0 && secondHashes.length === 0) {
            return 1; // [] === []
        }

        // intersection = firstHashes.filter(hash => secondHashes.includes(hash));
        firstHashes.forEach(function (item) {
            if (secondHashes.includes(item)) {
                count++;
            }
        });

        return count * 2 / (firstHashes.length + secondHashes.length);
    };

    convertTextToShingles(text) {
        const hash = this._hashFunction(text);
        if (this._cache[hash]) {
            return this._cache[hash];
        }

        const preparedText = this._textCanonization(text);
        const shingles = this._makeShingles(preparedText);
        let hashes = this._hashingShingles(shingles);
        this._cache[hash] = [...hashes];
        return hashes;
    }

    compare(firstText, secondText) {
        const firstHashes = this.convertTextToShingles(firstText);
        const secondHashes = this.convertTextToShingles(secondText);

        return this.compareShingles(firstHashes, secondHashes);
    }

}

module.exports = WShingling;

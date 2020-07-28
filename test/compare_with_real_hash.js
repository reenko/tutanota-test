const fs = require('fs');
const XXHash = require('xxhash');
const WShingling = require('../lib/w_shingling');

const elephant = fs.readFileSync('./testFiles/elephant.txt', 'utf8');
const raccoon = fs.readFileSync('./testFiles/raccoon.txt', 'utf8');
const mix = fs.readFileSync('./testFiles/elephant(half)_raccoon(half).txt', 'utf8');

describe('Compare test files (real hash function)', () => {
  const SEED = 10;

  const wShingling = new WShingling({
    shingleLength: 4,
    hashFunction: (text) => XXHash.hash(Buffer.from(text), SEED)
  });

  it('file1 vs file1, should be more than 0.99', async function () {
    const result = await wShingling.compare(elephant, elephant);
    if (result < 0.99) {
      throw new Error('Result: ' + result)
    }
  });
  it('file1 vs mix, should be more than 0.4', async function() {
    const result = await wShingling.compare(elephant, mix);
    if (result < 0.4) {
      throw new Error('Result: ' + result)
    }
  });
  it('file2 vs mix, should be more than 0.4', async function() {
    const result = await wShingling.compare(raccoon, mix);
    if (result < 0.4) {
      throw new Error('Result: ' + result)
    }
  });
  it('file1 vs file2, should be less than 0.05', async function () {
    const result = await wShingling.compare(raccoon, elephant);
    if (result > 0.05) {
      throw new Error('Result: ' + result)
    }
  });
});

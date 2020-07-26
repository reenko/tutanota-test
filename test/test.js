const fs = require('fs');
const WShingling = require('../lib/w_shingling');

const elephant = fs.readFileSync('./testFiles/elephant.txt', 'utf8');
const raccoon = fs.readFileSync('./testFiles/raccoon.txt', 'utf8');
const mix = fs.readFileSync('./testFiles/elephant(half)_raccoon(half).txt', 'utf8');

const wShingling = new WShingling(4);

describe('List of files', () => {
  it('should be more than 0.99', async function () {
    const result = await wShingling.compare(elephant, elephant);
    if (result < 0.99) {
      throw new Error('Result: ' + result)
    }
  });
  it('should be more than 0.4', async function() {
    const result = await wShingling.compare(elephant, mix);
    if (result < 0.4) {
      throw new Error('Result: ' + result)
    }
  });
  it('should be more than 0.4', async function() {
    const result = await wShingling.compare(raccoon, mix);
    if (result < 0.4) {
      throw new Error('Result: ' + result)
    }
  });
  it('should be less than 0.05', async function () {
    const result = await wShingling.compare(raccoon, elephant);
    if (result > 0.05) {
      throw new Error('Result: ' + result)
    }
  });
});

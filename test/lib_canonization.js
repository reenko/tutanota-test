const assert = require('assert');
const WShingling = require('../lib/w_shingling');

describe('Text canonization', () => {
  const wShingling = new WShingling({
    hashFunction: (text) => text,
  });

  it('_strCharacterRemove, nothing for deleting', function () {
    const result = wShingling._strCharacterRemove('text', '$');
    assert.equal(result, 'text');
  });

  it('_strCharacterRemove, right side', function () {
    const result = wShingling._strCharacterRemove('text$', '$');
    assert.equal(result, 'text');
  });

  it('_strCharacterRemove, left side', function () {
    const result = wShingling._strCharacterRemove('$text', '$');
    assert.equal(result, 'text');
  });

  it('_strCharacterRemove, in word', function () {
    const result = wShingling._strCharacterRemove('aa$bb', '$');
    assert.equal(result, 'aabb');
  });

  it('_strCharacterRemove, full case', function () {
    const result = wShingling._strCharacterRemove('$one two$ $ thr$ee$ # $', '$');
    assert.equal(result, 'one two  three # '); // two spaces - it's okay for this step
  });

  it('_removeAllSpecSymbols, nothing for deleting', function () {
    const result = wShingling._removeAllSpecSymbols('one two three');
    assert.equal(result, 'one two three');
  });

  it('_removeAllSpecSymbols, full case', function () {
    const result = wShingling._removeAllSpecSymbols('one# & $two? /three! (no)');
    assert.equal(result, 'one  two three no'); // two spaces - it's okay for this step
  });

  it('_removeShortWords, nothing for deleting', function () {
    const result = wShingling._removeShortWords('Some text with long words');
    assert.equal(result, 'Some text with long words');
  });

  it('_removeShortWords, remove words with one ch', function () {
    const result = wShingling._removeShortWords('I have a word');
    assert.equal(result, 'have word');
  });

  it('_removeShortWords, remove words with two ch', function () {
    const result = wShingling._removeShortWords('My car is red');
    assert.equal(result, 'car red');
  });

  it('_removeShortWords, full case', function () {
    const result = wShingling._removeShortWords('My name is Bob, I have a red car');
    assert.equal(result, 'name Bob, have red car');
  });

  it('_removeUselessSpaces, full case', function () {
    const result = wShingling._removeUselessSpaces('  My name  is Bob,   I have a red car  ');
    assert.equal(result, 'My name is Bob, I have a red car');
  });

  it('_textCanonization, case #1', function () {
    const result = wShingling._textCanonization('  My name  is Bob%, $  I have a (red) car  ');
    assert.equal(result, 'name bob have red car');
  });

  it('_textCanonization, case #2', function () {
    const result1 = wShingling._textCanonization('  My name  is Bob%, $  I have a (red) car  ');
    const result2 = wShingling._textCanonization('  My nAmE  is BOB%, $  I hA#vE a red CAR  !!!!');
    assert.equal(result1, result2);
  });
  
});

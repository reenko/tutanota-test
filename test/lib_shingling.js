const assert = require('assert');
const WShingling = require('../lib/w_shingling');

describe('Shingling', () => {
  it('_makeShingles, text less than shingleLength', function () {
    const wShingling = new WShingling({
      shingleLength: 4,
      hashFunction: (text) => text,
    });

    const result = wShingling._makeShingles('one');
    assert.equal(result.length, 1);
    assert.equal(result[0], 'one');
  });

  it('_makeShingles, text equal shingleLength', function () {
    const wShingling = new WShingling({
      shingleLength: 2,
      hashFunction: (text) => text,
    });

    const result = wShingling._makeShingles('one two');
    assert.equal(result.length, 1);
    assert.equal(result[0], 'one two');
  });

  it('_makeShingles, text more than shingleLength', function () {
    const wShingling = new WShingling({
      shingleLength: 2,
      hashFunction: (text) => text,
    });

    const result = wShingling._makeShingles('one two three');
    assert.equal(result.length, 2);
    assert.equal(result[0], 'one two');
    assert.equal(result[1], 'two three');
  });

  it('_makeShingles, advance case', function () {
    const wShingling = new WShingling({
      shingleLength: 3,
      hashFunction: (text) => text,
    });

    const result = wShingling._makeShingles('one two three four five six');
    
    const expectedResult = [
      'one two three',
      'two three four',
      'three four five',
      'four five six'
    ];
    expectedResult.map((line, i) => assert.equal(line, result[i]));
  });

  it('_hashingShingles, direct hash function', function () {
    const wShingling = new WShingling({
      shingleLength: 3,
      hashFunction: (text) => text,
    });

    const shingles = [
      'one two three',
      'two three four',
      'three four five',
      'four five six'
    ];

    const result = wShingling._hashingShingles(shingles);

    const expectedResult = shingles; // one to one
    expectedResult.map((line, i) => assert.equal(line, result[i]));
  });

  it('_hashingShingles, static hash function', function () {
    const wShingling = new WShingling({
      shingleLength: 3,
      hashFunction: (text) => 100,
    });

    const shingles = [
      'one two three',
      'two three four',
      'three four five',
      'four five six'
    ];

    const result = wShingling._hashingShingles(shingles);

    const expectedResult = [100, 100, 100, 100];
    expectedResult.map((line, i) => assert.equal(line, result[i]));
  });

  it('_hashingShingles, random hash function', function () {
    const wShingling = new WShingling({
      shingleLength: 3,
      hashFunction: (text) => Math.random(),
    });

    const shingles = [
      'one two three',
      'two three four',
      'three four five',
      'four five six'
    ];

    const result1 = wShingling._hashingShingles(shingles);
    const result2 = wShingling._hashingShingles(shingles);

    result1.map((line, i) => assert.notEqual(line, result2[i]));
  });

  it('compareShingles, empty array', function () {
    const wShingling = new WShingling({
      shingleLength: 3,
      hashFunction: () => null,
    });

    const hashes = [];

    const result = wShingling.compareShingles(hashes, hashes);

    assert.equal(result, 1);
  });

  it('compareShingles, null vs null', function () {
    const wShingling = new WShingling({
      shingleLength: 3,
      hashFunction: () => null,
    });

    const result = wShingling.compareShingles(null, null);

    assert.equal(result, 1);
  });

  it('compareShingles, null vs obj', function () {
    const wShingling = new WShingling({
      shingleLength: 3,
      hashFunction: () => null,
    });

    const result = wShingling.compareShingles(null, [100]);

    assert.equal(result, 0);
  });


  it('compareShingles, empty vs not empty', function () {
    const wShingling = new WShingling({
      shingleLength: 3,
      hashFunction: () => null,
    });

    const hashes1 = [];
    const hashes2 = [100, 200, 300];

    const result1 = wShingling.compareShingles(hashes1, hashes2);
    const result2 = wShingling.compareShingles(hashes2, hashes1);

    assert.equal(result1, 0);
    assert.equal(result1, result2);
  });

  it('compareShingles, 1/1 unique', function () {
    const wShingling = new WShingling({
      shingleLength: 3,
      hashFunction: () => null,
    });

    const hashes1 = [100, 200, 300, 400];
    const hashes2 = ['aaa', 'bbb', 'ccc', 'ddd'];

    const result1 = wShingling.compareShingles(hashes1, hashes2);
    const result2 = wShingling.compareShingles(hashes2, hashes1);

    assert.equal(result1, 0);
    assert.equal(result1, result2);
  });

  it('compareShingles, 3/4 unique', function () {
    const wShingling = new WShingling({
      shingleLength: 3,
      hashFunction: () => null,
    });

    const hashes1 = [100, 200, 300, 'bbb'];
    const hashes2 = ['aaa', 'bbb', 'ccc', 'ddd'];

    const result1 = wShingling.compareShingles(hashes1, hashes2);
    const result2 = wShingling.compareShingles(hashes2, hashes1);

    assert.equal(result1, 0.25);
    assert.equal(result1, result2);
  });

  it('compareShingles, 1/2 unique', function () {
    const wShingling = new WShingling({
      shingleLength: 3,
      hashFunction: () => null,
    });

    const hashes1 = [100, 200, 'aaa', 'bbb'];
    const hashes2 = ['aaa', 'bbb', 'ccc', 'ddd'];

    const result1 = wShingling.compareShingles(hashes1, hashes2);
    const result2 = wShingling.compareShingles(hashes2, hashes1);

    assert.equal(result1, 0.5);
    assert.equal(result1, result2);
  });


  it('compareShingles, 100% duplicates', function () {
    const wShingling = new WShingling({
      shingleLength: 3,
      hashFunction: () => null,
    });

    const hashes = [100, 200, 300, 400];

    const result = wShingling.compareShingles(hashes, hashes);

    assert.equal(result, 1);
  });

  it('compareShingles, check order of hashes', function () {
    const wShingling = new WShingling({
      shingleLength: 3,
      hashFunction: () => null,
    });

    const hashes1 = [100, 200, 'aaa', 'bbb'];
    const hashes2 = ['aaa', 'bbb', 'ccc', 'ddd'];
    const hashes3 = ['bbb', 'ddd', 'aaa', 'ccc'];
    const hashes4 = ['ddd', 'ccc', 'aaa', 'bbb'];

    const result1 = wShingling.compareShingles(hashes1, hashes2);
    const result2 = wShingling.compareShingles(hashes1, hashes3);
    const result3 = wShingling.compareShingles(hashes1, hashes4);

    assert.equal(result1, 0.5);
    assert.equal(result1, result2);
    assert.equal(result2, result3);
  });

  it('convertTextToShingles, empty case', function () {
    const wShingling = new WShingling({
      shingleLength: 3,
      hashFunction: (text) => `===${text.toUpperCase()}===`,
    });
    const result = wShingling.convertTextToShingles('');

    const expectedResult = ['======']
    expectedResult.map((line, i) => assert.equal(line, result[i]));
  });

  it('convertTextToShingles, full case', function () {
    const wShingling = new WShingling({
      shingleLength: 3,
      hashFunction: (text) => `===${text.toUpperCase()}===`,
    });
    const result = wShingling.convertTextToShingles('  My nAmE  is BOB%, $  I hA#vE a red CAR  !!!!');

    const expectedResult = [
      '===NAME BOB HAVE===',
      '===BOB HAVE RED===',
      '===HAVE RED CAR==='
    ]
    expectedResult.map((line, i) => assert.equal(line, result[i]));
  });

  it('WShingling constructor, wrong shingleLength', function () {
    try {
      const wShingling = new WShingling({
        shingleLength: 'not-number',
        hashFunction: () => null,
      });

      assert.fail('expected exception not thrown');
    } catch (e) {
      assert.equal(e.message, 'Wrong type for shingleLength');
    }
  });

  it('WShingling constructor, wrong hashFunction', function () {
    try {
      const wShingling = new WShingling({
        hashFunction: null,
      });

      assert.fail('expected exception not thrown');
    } catch (e) {
      assert.equal(e.message, 'hashFunction should be a function');
    }
  });
});



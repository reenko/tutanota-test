const program = require('commander');
const process = require('process');
const path = require('path');
const fs = require('fs');
const XXHash = require('xxhash'); // https://softwareengineering.stackexchange.com/questions/49550/which-hashing-algorithm-is-best-for-uniqueness-and-speed
const WShingling = require('./lib/w_shingling');

const SEED = 10;

 const main = async function (dir, index = 0.5, maxDuplicates = 3, shingleLength = 4) {
  const wShingling = new WShingling({
    shingleLength,
    hashFunction: (text) => XXHash.hash(Buffer.from(text), SEED)
  });

  const directoryPath = path.join(dir);
  let files = await new Promise((resolve, reject) => {
    fs.readdir(directoryPath, (error, files) => {
      if (error) {
        console.log('Unable to scan directory: ' + error);
        reject(error);
      }

      resolve(files);
    });
  });

   if (!files) {
     console.log('No files for comparison');
     return process.exit(0);
   }

  const countOfFiles = files.length;
  console.log('Files to comparison:\t', countOfFiles);

  const countOfCombinations = (countOfFiles * countOfFiles - countOfFiles) / 2;
  console.log('Count of unique combinations:\t', countOfCombinations);

   if (countOfFiles === 0) {
     return process.exit(0);
   }

  let matrix = Array(countOfFiles).fill(null).map(() => Array(countOfFiles).fill(0));

   for (let i = 0; i < countOfFiles; i++) {
     for (let j = i + 1; j < countOfFiles; j++) {
      matrix[i][j] = matrix[j][i] = await wShingling.compare(
        fs.readFileSync(`${directoryPath}/${files[i]}`, 'utf8'),
        fs.readFileSync(`${directoryPath}/${files[j]}`, 'utf8'),
      );
    }
    matrix[i][i] = 0;
  }

  // Calc count of duplicates, if line[i] > index (e.x. 0.5) than +1
  const countOfDuplicates = matrix.map((line, i) => ({
      file: files[i],
      count: line.reduce((accumulator, currentValue) => accumulator + (currentValue >= index ? 1 : 0), 0)
    }));
  const notUniqeFiles = countOfDuplicates.filter((obj) => obj.count >= maxDuplicates);

   console.log('List of not uniq files', notUniqeFiles);
};

program
  .requiredOption('-p, --path <path>', 'Path to files')
  .option('-i, --index <index>', 'Similarity index [0..1], 0.5 by default')
  .option('-c, --copies <copies>', 'Min number of duplicates to mark as a not unique, 3 by default')
  .option('-l, --length <length>', 'Length of one shingle in words, 4 by default, min 3')
  .action(async (options) => {
    const index = options.index && !isNaN(Number(options.index)) ? Number(options.index) : null;
    const copies = options.copies && !isNaN(Number(options.copies)) ? Number(options.copies) : null;
    const length = options.length && !isNaN(Number(options.length)) ? Number(options.length) : null;

    await main(options.path, index, copies, length);
  });

program.parse(process.argv);

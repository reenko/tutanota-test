const program = require('commander');
const process = require('process');
const path = require('path');
const fs = require('fs');
const WShingling = require('./lib/w_shingling');

 const main = async function (dir, index = 0.5, maxDuplicates = 3, shingleLength = 4) {
  const wShingling = new WShingling(shingleLength);

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
  console.log('Count of uniqe combinations:\t', countOfCombinations);

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
  .option('-i, --index <index>', 'Similarity index (0..1), 0.5 by default')
  .option('-c, --copies <copies>', 'Min number of duplicates to mark as a not uniqe, 3 by default')
  .option('-l, --length <length>', 'Length of one shingle in words, 4 by default, min 3')
  .action(async (options) => {
    await main(options.path, options.index, options.copies, options.length);
  });

program.parse(process.argv);

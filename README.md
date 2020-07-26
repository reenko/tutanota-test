# Test task

Write a routine that gets a set of email body texts and assigns a spam probability to each of them depending on the similarity to the other emails in the set. The more similar it is to the other emails, the more likely it is a spam email.

## Realization

Compare similarity in texts with W-shingling algorithm.

Information about algorithm: http://en.wikipedia.org/wiki/W-shingling

## How to use

Help `node index.js --help`

Cli `node index.js -p ./testFiles/`

There are 4 options for cli command

1. Path to dir with textes

2. Similarity index [0..1], 0.5 by default. What we shoud mark as the same? 1 == full copy

3. Min number of duplicates to mark as a not uniqe, 3 by default

4. Length of one shingle in words, 4 by default, min 3

## How to test

1. `npm run test` for run tests

2. There are 4 scenario for quick testing `npm run one`, `npm run two`, `npm run three`, `npm run four`

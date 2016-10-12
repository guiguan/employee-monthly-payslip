/**
 * @Author: Guan Gui <guiguan>
 * @Date:   2016-10-12T15:48:21+11:00
 * @Email:  root@guiguan.net
 * @Last modified by:   guiguan
 * @Last modified time: 2016-10-12T21:48:23+11:00
 */

import fs from 'fs';
import csv from 'fast-csv';
import {inputParams, genPayslip} from './payslip';

const USAGE_MSG = 'Usage: node ./lib/driver.js PATH_TO_INPUT_CSV_FILE PATH_TO_OUTPUT_CSV_FILE';

try {
  const inputCsvPath = process.argv[2];
  const outputCsvPath = process.argv[3];
  if (process.argv.length === 4 && fs.statSync(inputCsvPath).isFile()) {
    csv
      .fromPath(inputCsvPath, {
      headers: inputParams,
      ignoreEmpty: true
    })
      .transform((data, next) => {
        genPayslip(data).then((result) => {
          next(null, result);
        }).catch((err) => {
          console.error(`${err.toString()} for input data ${JSON.stringify(data)}`);
          next();
        });
      })
      .pipe(csv.createWriteStream({headers: false}))
      .pipe(fs.createWriteStream(outputCsvPath, {encoding: 'utf8'}));
  } else {
    console.log(USAGE_MSG);
  }
} catch (err) {
  console.log('Error: %s\n%s', err.message, USAGE_MSG);
}

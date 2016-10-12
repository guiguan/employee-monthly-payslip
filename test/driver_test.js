/**
 * @Author: Guan Gui <guiguan>
 * @Date:   2016-10-13T02:39:22+11:00
 * @Email:  root@guiguan.net
 * @Last modified by:   guiguan
 * @Last modified time: 2016-10-13T06:12:25+11:00
 */

import 'babel-polyfill';
import {exec} from 'child_process';
import {expect} from 'chai';
import crypto from 'crypto';
import fs from 'fs';

describe('driver', () => {
  it('should show usage when invalid input csv path is provided', (done) => {
    exec('node ./lib/driver.js nonExistDir/nonExistInput.csv test/output.csv', (err, stdout, _stderr) => {
      if (err) {
        console.error(err);
        done();
        return;
      }
      expect(stdout)
        .to
        .have
        .string('Usage:');
      done();
    });
  });

  it('should show usage when output csv path is not provided', (done) => {
    exec('node ./lib/driver.js test/sample_input.csv', (err, stdout, _stderr) => {
      if (err) {
        console.error(err);
        done();
        return;
      }
      expect(stdout)
        .to
        .have
        .string('Usage:');
      done();
    });
  });

  it('should read test/sample_input.csv, generate identical result to test/sample_outp' +
      'ut.csv and emit inaccurate calculation warning',
  (done) => {
    exec('node ./lib/driver.js test/sample_input.csv test/output.csv', (err, _stdout, stderr) => {
      if (err) {
        console.error(err);
        done();
        return;
      }
      const outputCsvBuf = fs.readFileSync('test/output.csv');
      const sampleOutputCsvBuf = fs.readFileSync('test/sample_output.csv');
      const outputCsvBufHash = crypto
        .createHash('sha256')
        .update(outputCsvBuf)
        .digest();
      const sampleOutputCsvBufHash = crypto
        .createHash('sha256')
        .update(sampleOutputCsvBuf)
        .digest();
      expect(outputCsvBufHash)
        .to
        .eql(sampleOutputCsvBufHash);
      expect(stderr)
        .to
        .have
        .string('inaccurate results for input data');
      done();
    });
  });
});

/**
 * @Author: Guan Gui <guiguan>
 * @Date:   2016-10-12T15:58:37+11:00
 * @Email:  root@guiguan.net
 * @Last modified by:   guiguan
 * @Last modified time: 2016-10-13T06:00:26+11:00
 */

import 'babel-polyfill';
import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import {genPayslip} from '../lib/payslip';

chai.use(chaiAsPromised);
chai.should();

describe('genPayslip', () => {
  it('should reject non-alphabetic names with error', () => {
    return Promise.all([
      genPayslip({firstName: '_a'})
        .should
        .be
        .rejectedWith(Error, 'Invalid first name'),
      genPayslip({firstName: '汉字'})
        .should
        .be
        .rejectedWith(Error, 'Invalid first name'),
      genPayslip({firstName: 'Lena', lastName: 'KK KK'})
        .should
        .be
        .rejectedWith(Error, 'Invalid last name'),
      genPayslip({firstName: 'Lena', lastName: 'のコンサDavid'})
        .should
        .be
        .rejectedWith(Error, 'Invalid last name')
    ]);
  });

  it('should only accept non-negative integer as annualSalary', () => {
    return Promise.all([
      genPayslip({firstName: 'Lena', lastName: 'Michell', annualSalary: '-2'}).should.be.rejected,
      genPayslip({firstName: 'Lena', lastName: 'Michell', annualSalary: '1.22'}).should.be.rejected,
      genPayslip({firstName: 'Lena', lastName: 'Michell', annualSalary: '0', superRate: '12%', payPeriod: '3/2013-3/2013'}).should.be.fullfilled
    ]);
  });

  it('should only accept superRate with % in percentage and in range 0% to 50% inclusi' +
      've',
  () => {
    return Promise.all([
      genPayslip({firstName: 'Lena', lastName: 'Michell', annualSalary: '50000', superRate: '12'}).should.be.rejected,
      genPayslip({firstName: 'Lena', lastName: 'Michell', annualSalary: '50000', superRate: '-1%'}).should.be.rejected,
      genPayslip({firstName: 'Lena', lastName: 'Michell', annualSalary: '50000', superRate: '51%'}).should.be.rejected,
      genPayslip({firstName: 'Lena', lastName: 'Michell', annualSalary: '0', superRate: '11.5%', payPeriod: '3/2013-3/2013'}).should.be.fulfilled
    ]);
  });

  it('should only accept payPeriod in MM/YYYY-MM/YYYY format and start date is not aft' +
      'er end date',
  () => {
    return Promise.all([
      genPayslip({firstName: 'Lena', lastName: 'Michell', annualSalary: '0', superRate: '11.5%', payPeriod: '1/3/2013-3/2013'}).should.be.rejected,
      genPayslip({firstName: 'Lena', lastName: 'Michell', annualSalary: '0', superRate: '11.5%', payPeriod: '4/2013-3/2013'}).should.be.rejected,
      genPayslip({firstName: 'Lena', lastName: 'Michell', annualSalary: '0', superRate: '11.5%', payPeriod: '8/2012-3/2013'}).should.be.fulfilled
    ]);
  });

  {
    const inputs = {
      firstName: 'Lena',
      lastName: 'Michell',
      annualSalary: '0',
      superRate: '11.5%',
      payPeriod: '3/2013-3/2013'
    };
    const outputs = {
      name: 'Lena Michell',
      payPeriod: '01/03/2013-31/03/2013',
      grossIncome: '0',
      incomeTax: '0',
      netIncome: '0',
      super: '0'
    };
    it(`should generate output ${JSON.stringify(outputs)} for input ${JSON.stringify(inputs)}`, () => {
      return genPayslip(inputs)
        .should
        .become(outputs);
    });
  }

  {
    const inputs = {
      firstName: 'Malcolm',
      lastName: 'Robie',
      annualSalary: '37000',
      superRate: '50%',
      payPeriod: '3/2013-2/2015'
    };
    const outputs = {
      name: 'Malcolm Robie',
      payPeriod: '01/03/2013-28/02/2015',
      grossIncome: '74000',
      incomeTax: '7144',
      netIncome: '66856',
      super: '37000'
    };
    it(`should generate output ${JSON.stringify(outputs)} for input ${JSON.stringify(inputs)}`, () => {
      return genPayslip(inputs)
        .should
        .become(outputs);
    });
  }

  {
    const inputs = {
      firstName: 'Blaine',
      lastName: 'Matis',
      annualSalary: '10000000',
      superRate: '8.88%',
      payPeriod: '1/2012-12/2012'
    };
    const outputs = {
      name: 'Blaine Matis',
      payPeriod: '01/01/2012-31/12/2012',
      grossIncome: '10000000',
      incomeTax: '4473547',
      netIncome: '5526453',
      super: '888000'
    };
    it(`should generate output ${JSON.stringify(outputs)} for input ${JSON.stringify(inputs)}`, () => {
      return genPayslip(inputs)
        .should
        .become(outputs);
    });
  }
});

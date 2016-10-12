/**
 * @Author: Guan Gui <guiguan>
 * @Date:   2016-10-12T15:43:47+11:00
 * @Email:  root@guiguan.net
 * @Last modified by:   guiguan
 * @Last modified time: 2016-10-13T05:28:20+11:00
 */

import _ from 'lodash';
import moment from 'moment';

const INPUT_DATE_FORMAT = 'MM/YYYY';
const OUTPUT_DATE_FORMAT = 'DD/MM/YYYY';
const TAX_RATES_VALID_START_DATE = moment('7/2012', INPUT_DATE_FORMAT);
const TAX_RATES_VALID_END_DATE = moment('6/2013', INPUT_DATE_FORMAT);
const MONTHS_PER_YEAR = 12;

// for internal cache and lazy init purpose only
const inputParamsRegexes = {};

const nameRegex = /^[a-zA-Z]+$/;
const nameParser = (namePart, v) => {
  if (!inputParamsRegexes[namePart]) {
    inputParamsRegexes[namePart] = nameRegex;
  }
  const m = inputParamsRegexes[namePart].exec(v);
  if (m) {
    return m[0];
  }
  throw new Error(`Invalid ${namePart} name`);
};

const momentInputDateFormatter = m => m.format(INPUT_DATE_FORMAT);
const momentOutputDateFormatter = m => m.format(OUTPUT_DATE_FORMAT);

const inputParamParsers = {
  firstName: {
    parser: _.bind(nameParser, null, 'first'),
    order: 0 // define an order here, bcuz we should not rely on the order returned by Object.keys or _.keys
  },
  lastName: {
    parser: _.bind(nameParser, null, 'last'),
    order: 1
  },
  annualSalary: {
    parser(v) {
      if (!inputParamsRegexes.annualSalary) {
        inputParamsRegexes.annualSalary = /^\d+$/;
      }
      const m = inputParamsRegexes
        .annualSalary
        .exec(v);
      if (m) {
        return Number.parseInt(m[0], 10);
      }
      throw new Error('Annual salary must be non-negative integer');
    },
    order: 2
  },
  superRate: {
    parser(v) {
      if (!inputParamsRegexes.superRate) {
        inputParamsRegexes.superRate = /^(\d+(?:\.\d+)?)%$/;
      }
      const m = inputParamsRegexes
        .superRate
        .exec(v);
      if (m && m[1]) {
        const superRate = Number.parseFloat(m[1], 10);
        if (superRate >= 0 && superRate <= 50) {
          return superRate * 0.01;
        }
      }
      throw new Error('Super rate must be expressed in percentage and in range 0% to 50% inclusive');
    },
    order: 3
  },
  payPeriod: {
    parser(v, inputs) {
      if (!inputParamsRegexes.payPeriod) {
        inputParamsRegexes.payPeriod = /^(\d{1,2}\/\d{4})-(\d{1,2}\/\d{4})$/;
      }
      const m = inputParamsRegexes
        .payPeriod
        .exec(v);
      if (m && m[1] && m[2]) {
        const startDate = moment(m[1], INPUT_DATE_FORMAT);
        const endDate = moment(m[2], INPUT_DATE_FORMAT);
        if (startDate.isValid() && endDate.isValid()) {
          if (startDate.isSameOrBefore(endDate)) {
            if (startDate.isBefore(TAX_RATES_VALID_START_DATE) || endDate.isAfter(TAX_RATES_VALID_END_DATE)) {
              // display a possible inaccurate calc warning
              console.warn(`Warning: specifying payment period out of ${momentInputDateFormatter(TAX_RATES_VALID_START_DATE)}-${momentInputDateFormatter(TAX_RATES_VALID_END_DATE)} may result in inaccurate results for input data ${JSON.stringify(inputs)}`);
            }
            const numOfMonths = endDate.diff(startDate, 'months') + 1;
            return {startDate, endDate, numOfMonths};
          }
          throw new Error('Payment start date must be before or equal to its end date');
        }
      }
      throw new Error(`Payment period must be expressed in ${INPUT_DATE_FORMAT}-${INPUT_DATE_FORMAT} format`);
    },
    order: 4
  }
};

const numberFormatter = v => v.toFixed();

const outputParamFormatters = {
  name: {
    formatter: v => v,
    order: 0
  },
  payPeriod: {
    formatter: v => v,
    order: 1
  },
  grossIncome: {
    formatter: numberFormatter,
    order: 2
  },
  incomeTax: {
    formatter: numberFormatter,
    order: 3
  },
  netIncome: {
    formatter: numberFormatter,
    order: 4
  },
  super: {
    formatter: numberFormatter,
    order: 5
  }
};

export const inputParams = _.reduce(inputParamParsers, (r, v, k) => {
  r[v.order] = k;
  return r;
}, []);

export const outputParams = _.reduce(outputParamFormatters, (r, v, k) => {
  r[v.order] = k;
  return r;
}, []);

export function genPayslip(inputs) {
  return Promise.resolve(inputs)
  // validate and parse inputs. Iterate over inputParams instead of
  // inputParamParsers, because the former has defiend order
    .then(inputs => _.reduce(inputParams, (r, k) => {
    if (inputs[k] === undefined) {
      throw new Error(`Input param ${k} is missing`);
    }
    r[k] = inputParamParsers[k].parser(inputs[k], inputs);
    return r;
  }, {}))
  // carry out calculation and generate outputs
    .then(({
    firstName,
    lastName,
    annualSalary,
    superRate,
    payPeriod: {
      startDate,
      endDate,
      numOfMonths
    }
  }) => {
    const outputs = {};
    outputs.name = `${firstName} ${lastName}`;
    outputs.payPeriod = `${momentOutputDateFormatter(startDate.startOf('month'))}-${momentOutputDateFormatter(endDate.endOf('month'))}`;
    outputs.grossIncome = Math.round((annualSalary / MONTHS_PER_YEAR) * numOfMonths);

    // tax rate
    let taxBase;
    let taxRate;
    let taxRateBase;
    if (annualSalary <= 18200) {
      taxBase = 0;
      taxRate = 0;
      taxRateBase = 0;
    } else if (annualSalary <= 37000) {
      taxBase = 0;
      taxRate = 0.19;
      taxRateBase = 18200;
    } else if (annualSalary <= 80000) {
      taxBase = 3572;
      taxRate = 0.325;
      taxRateBase = 37000;
    } else if (annualSalary <= 180000) {
      taxBase = 17547;
      taxRate = 0.37;
      taxRateBase = 80000;
    } else {
      taxBase = 54547;
      taxRate = 0.45;
      taxRateBase = 180000;
    }

    outputs.incomeTax = Math.round(((taxBase + ((annualSalary - taxRateBase) * taxRate)) / MONTHS_PER_YEAR) * numOfMonths);
    outputs.netIncome = outputs.grossIncome - outputs.incomeTax;
    outputs.super = Math.round(outputs.grossIncome * superRate);
    return _.reduce(outputParams, (r, k) => {
      r[k] = outputParamFormatters[k].formatter(outputs[k]);
      return r;
    }, outputs);
  });
}

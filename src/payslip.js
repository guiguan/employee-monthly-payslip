/**
 * @Author: Guan Gui <guiguan>
 * @Date:   2016-10-12T15:43:47+11:00
 * @Email:  root@guiguan.net
 * @Last modified by:   guiguan
 * @Last modified time: 2016-10-12T21:03:11+11:00
 */

import _ from 'lodash';

const nameRegex = /^[a-zA-Z]+$/;

const inputParamsRegexes = {};

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

const inputParamParsers = {
  firstName: {
    parser: _.bind(nameParser, this, 'first'),
    order: 0 // define an order here, bcuz we should not rely on the order returned by Object.keys or _.keys
  },
  lastName: {
    parser: _.bind(nameParser, this, 'last'),
    order: 1
  },
  annualSalary: {
    parser(v) {
      return v;
    },
    order: 3
  },
  superRate: {
    parser(v) {
      return v;
    },
    order: 2
  },
  paymentStartDate: {
    parser(v) {
      return v;
    },
    order: 4
  },
  paymentEndDate: {
    parser(v) {
      return v;
    },
    order: 5
  }
};

export const inputParams = _.reduce(inputParamParsers, (r, v, k) => {
  r[v.order] = k;
  return r;
}, []);

export function genPayslip(inputs) {
  return Promise
    .resolve(inputs)
    // validate inputs
    .then(inputs => _.reduce(inputParamParsers, (r, v, k) => {
      r[k] = v.parser(inputs[k]);
      return r;
    }, {}));
}

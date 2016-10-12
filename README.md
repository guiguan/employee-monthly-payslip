<!--
@Author: Guan Gui <guiguan>
@Date:   2016-10-12T15:05:15+11:00
@Email:  root@guiguan.net
@Last modified by:   guiguan
@Last modified time: 2016-10-13T01:40:18+11:00
-->

# Installation & Usage

1. make sure the latest node and npm version is installed. You can use `nvm install node` to install them.
2. `npm install`
3. `npm run compile`
4. `npm start PATH_TO_INPUT_CSV_FILE PATH_TO_OUTPUT_CSV_FILE` (you can use `sample_input.csv` in `test` directory)

# Running Test Cases

`npm test`

# Assumptions

* Employee first and last names are all in English alphabet. International names can be easily supported by adding unicode point ranges to `nameRegex`
* User will specify a payment period with a start and an end date, using format MM/YYYY (month and year). The end month is inclusive. For example, 8/2012-1/2013 means from 1 August of 2012 to 31 January of 2013.
* Payment calculation is performed on month level using the methodology illustrated in the problem description
* Each row of input csv file is processed individually. If an error happens when processing a row, that row is skipped in the output csv, and the error is reported to stderr
* The output csv file will contain a header
* User of this code is aware that tax rate data is valid only from 1 July 2012 to 30 June of 2013 (the 2012-2013 financial year). To calculate payment periods out of that time period may result in inaccurate results, and a warning will be displayed. User should update the tax rate data accordingly to support wider time range.

# Building and testing environment

* node v6.7.0
* npm v3.10.3

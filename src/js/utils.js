/**
 *
 * @param date
 * @returns {boolean|boolean}
 */
const isDate = date => {
  return (new Date(date) !== 'Invalid Date') && !isNaN(new Date(date))
}

/**
 *
 * @param object
 * @returns {{[p: string]: *}}
 */
const getDatesFromTimeSeriesObject = object => Object.keys(object)
  .filter((key) => isDate(key))
  .reduce((newObj, key) => Object.assign(newObj, {[key]: object[key]}), {})

/**
 * Formats a date string into us style dates
 * @param dateStr the date
 * @returns {string} the formatted date
 */
const formatDate = dateStr => {
  const date = new Date(dateStr)
  const day = date.getDate()
  const month = date.getMonth()
  const year = String(date.getFullYear()).substr(-2)
  return `${month}/${day}/${year}`
}

/**
 *
 * @param country
 * @param cases
 * @returns {*}
 */
const getByCountry = (country, cases) => cases.filter(item => item['Country/Region'].toLowerCase() === country.toLowerCase())

/**
 *
 * @param object
 * @param date
 * @returns {number}
 */
const collapseByDate = (object, date) => object.map(item => item[date]).reduce((prev, next) => Number(prev) + Number(next), 0)

/**
 * Returns the number of confirmed cases across all countries on a single day.
 * @param cases
 * @param dateStr
 * @returns {bigint}
 */
const getCasesOnDay = (cases, dateStr) => cases.map(country => Number(country[dateStr])).reduce((prev, next) => prev + next, 0)

/**
 * Returns a sorted Array with all the dates found in the data.
 * @param dates
 * @returns {[]}
 */
const buildDatesArr = (dates) => d3.timeDay.range(new Date(dates[0]), new Date(dates[dates.length - 1]))

/**
 * Returns the latest date.
 * @param cases
 * @returns {string}
 */
const getCurrentDate = (cases) => Object.keys(getDatesFromTimeSeriesObject(cases[0])).sort((a, b) => new Date(b) - new Date(a))[0]

/**
 * Prettify large numbers by adding commas. Converts an integer value to a String.
 * @param number
 * @returns {string}
 */
const numberWithCommas = (number) => number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")

/**
 * Return list of dates.
 * @param cases
 * @returns {string[]}
 */
const getDates = (cases) => Object.keys(getDatesFromTimeSeriesObject(cases[0]))

export {
  isDate,
  getDatesFromTimeSeriesObject,
  getByCountry,
  collapseByDate,
  getCasesOnDay,
  buildDatesArr,
  getCurrentDate,
  numberWithCommas,
  getDates,
  formatDate
}

const isDate = date => {
  return (new Date(date) !== 'Invalid Date') && !isNaN(new Date(date))
}

const getDatesFromTimeSeriesObject = object => Object.keys(object)
  .filter((key) => isDate(key))
  .reduce((newObj, key) => Object.assign(newObj, { [key]: object[key] }), {})

const getByCountry = (country, cases) => cases.filter(item => item['Country/Region'].toLowerCase() === country.toLowerCase())

const collapseByDate = (object, date) => object.map(item => item[date]).reduce((prev, next) => Number(prev) + Number(next), 0)

/**
 * Returns the number of confirmed cases across all countries on a single day.
 * @param cases
 * @param dateStr
 * @returns {bigint}
 */
const getCasesOnDay = (cases, dateStr) => cases.map(country => Number(country[dateStr])).reduce((prev, next) => prev + next)

export {
  isDate,
  getDatesFromTimeSeriesObject,
  getByCountry,
  collapseByDate,
  getCasesOnDay
}

const isDate = date => {
  return (new Date(date) !== 'Invalid Date') && !isNaN(new Date(date))
}

const getDatesFromTimeSeriesObject = object => Object.keys(object)
  .filter((key) => isDate(key))
  .reduce((newObj, key) => Object.assign(newObj, { [key]: object[key] }), {})

const getByCountry = (country, cases) => cases.filter(item => item['Country/Region'].toLowerCase() === country.toLowerCase())

const collapseByDate = (object, date) => object.map(item => item[date]).reduce((prev, next) => Number(prev) + Number(next), 0)

export {
  isDate,
  getDatesFromTimeSeriesObject,
  getByCountry,
  collapseByDate,
}

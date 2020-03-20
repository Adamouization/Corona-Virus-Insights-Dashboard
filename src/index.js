// import url from './data/covid_timeline.csv'

// const csv = Papa.parse(url)
// console.log(csv)
d3.csv('https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_19-covid-Confirmed.csv')
  .then((data) => {
    window.cases = data
  })

window.getByCountry = country => window.cases.filter(item => item['Country/Region'].toLowerCase() === country.toLowerCase())

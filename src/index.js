// import url from './data/covid_timeline.csv'

// const csv = Papa.parse(url)
// console.log(csv)
d3.csv('./data/covid_timeline.csv').then((data) => {
  window.cases = data
})

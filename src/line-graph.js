const getCasesOnDay = (cases, dateStr) => cases.map(country => Number(country[dateStr])).reduce((prev, next) => prev + next)

const populateLineGraph = async (cases) => {

}

export {
  populateLineGraph
}

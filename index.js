const express = require('express')
const path = require('path')

const app = express()
const PORT = process.env.PORT || 3000

app.use(express.static(`${__dirname}/src`))

app.get('/', (req, res) => res.sendFile(path.join(`${__dirname}/src/index.html`)))

app.get('/all', (req, res) => {})

app.listen(PORT, () => console.log(`Visualisation listening on port ${PORT}!`))

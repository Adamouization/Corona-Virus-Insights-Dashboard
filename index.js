const express = require('express')
const path = require('path')

const app = express()
const port = 3000

app.use(express.static(`${__dirname}/src`))

app.get('/', (req, res) => res.sendFile(path.join(`${__dirname}/src/index.html`)))

app.get('/all', (req, res) => {})

app.listen(port, () => console.log(`Visualisation listening on port ${port}!`))

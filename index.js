// const http = require('http')
// const fs = require('fs')

// const app = http.createServer((request, response) => {
//   response.writeHead(200, { 'Content-Type': 'text/html' })
//   fs.createReadStream('./src/index.html').pipe(response)
//   response.end()
// })

// app.listen(8000)

const express = require('express')
const path = require('path')

const app = express()
const port = 3000

app.use(express.static(`${__dirname}/src`))

app.get('/', (req, res) => res.sendFile(path.join(`${__dirname}/src/index.html`)))

app.listen(port, () => console.log(`Visualisation listening on port ${port}!`))

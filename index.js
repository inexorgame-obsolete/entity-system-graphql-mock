const { mockServer, makeExecutableSchema } = require('graphql-tools')
const fs = require('fs')
const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser')

const schemaQGL = fs.readFileSync('./entities.graphql').toString()
const schema = makeExecutableSchema({ typeDefs: schemaQGL })

const mock = mockServer(schema, {
    any: () => ['String', 'Integer', 'Vec3'][(Math.random() * 3 | 0)],
    entity_type: () => ({
        name: () => ['AND', 'OR', 'TIMER', 'DELAY', 'BOOL'][Math.random() * 5 | 0] + '_' + (Math.random() * 10000 | 0)
    })
})

const port = process.env.PORT || 8080;

const app = express()
app.use(bodyParser.json())
app.use(cors())
app.use((req, res, next) => {
    console.log(req.connection.remoteAddress, req.url)
    console.log(req.body)
    next()
})
app.use('/playground', express.static('./playground'))
app.post('/graphql', async ({body: {query = '{}', variables = {} }}, res) => {
    const result = await mock.query(query, variables)
    res.send(result)
})
app.get('/graphql', async ({body: {query = '{}', variables = {} }}, res) => {
    const result = await mock.query(query, variables)
    res.send(result)
})
app.listen(port, () => console.log(`connected on port ${port}`))


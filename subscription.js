const { mockServer, makeExecutableSchema } = require('graphql-tools')
const fs = require('fs')
const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser')
const { SubscriptionServer } = require('subscriptions-transport-ws')

const schemaQGL = fs.readFileSync('./entities.graphql').toString()
const schema = makeExecutableSchema({ typeDefs: schemaQGL })

const mock = mockServer(schema, {
    any: () => ['String', 'Integer', 'Vec3'][(Math.random() * 3 | 0)],
    entity_type: () => ({
        name: () => 'NameMitRandom' + (Math.random() * 10000 | 0)
    })
})

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
app.listen(9998, () => console.log('connected'))

SubscriptionServer.create(
    {
      schema,
      execute,
      subscribe,
    },
    {
      server: app,
      path: '/subscriptions',
    },
  );
  



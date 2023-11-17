/* eslint-disable no-unused-vars */
require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const app = express()

app.use(express.json())
app.use(cors())
app.use(express.static('dist'))

morgan.token('data', function (req, _res) { return JSON.stringify(req.body)})

app.use(morgan(':method :url :status :res[content-length] - :response-time ms :data'))

const errorHandler = (error, _request, response, next) => {
    console.error(error.message)

    if (error.name === 'CastError') {
        return response.status(400).send({ error: 'malformatted id' })
    }

    next(error)
}

const unknownEndpoint = (_request, response) => {
    response.status(404).send({ error: 'unknown endpoint' })
}

const Person = require('./models/person')

app.get('/api/persons', (_request, response) => {
    Person.find({}).then(result => {
        response.json(result)
    })
})

app.get('/api/persons/:id', (request, response, next) => {

    Person.findById(request.params.id)
        .then(person => {
            if (person) {
                response.json(person)
            } else {
                response.status(404).end()
            }
        })
        .catch(error => next(error))
})

app.delete('/api/persons/:id', (request, response, next) => {
    Person.findByIdAndRemove(request.params.id)
        .then(_result => {
            response.status(204).end
        })
        .catch(error => next(error))
})

app.post('/api/persons', (request, response) => {

    const body = request.body

    if (body.name === undefined || body.number === undefined) {
        return response.status(400).json({
            error: 'The name or number is missing'
        })
    }

    const person = new Person({
        name: body.name,
        number: body.number
    })

    person.save().then(savedContact => {
        response.json(savedContact)
    })

})

app.put('/api/persons/:id', (request, response, next) => {

    const body = request.body

    const person = {
        name: body.name,
        number: body.number
    }

    Person.findByIdAndUpdate(request.params.id, person, { new: true, runValidators: true, context: 'query' })
        .then(updatePerson => {
            response.json(updatePerson)
        })
        .catch(error => next(error))
})

app.get('/info', (_request, response) => {
    let numEntries = 0
    Person.find({}).then(result => {
        numEntries = result.length
    })
    const currDate = new Date()
    response.send(`
    <div>
     <p>Phonebook has info for ${numEntries} people</p>
     <p>${currDate}</p>
    </div>`
    )
})

app.use(unknownEndpoint)
app.use(errorHandler)
const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const app = express()

app.use(express.json())
app.use(cors())
app.use(express.static('dist'))

morgan.token('data', function (req, res) { return JSON.stringify(req.body)})

app.use(morgan(':method :url :status :res[content-length] - :response-time ms :data'))

let persons = [
    { 
      "id": 1,
      "name": "Arto Hellas", 
      "number": "040-123456"
    },
    { 
      "id": 2,
      "name": "Ada Lovelace", 
      "number": "39-44-5323523"
    },
    { 
      "id": 3,
      "name": "Dan Abramov", 
      "number": "12-43-234345"
    },
    { 
      "id": 4,
      "name": "Mary Poppendieck", 
      "number": "39-23-6423122"
    }
]

app.get("/api/persons", (request, response) => {
    response.json(persons);
})

app.get("/api/persons/:id", (request, response) => {
    const id = Number(request.params.id);

    const person = persons.find(person => person.id === id);

    if (person) {
        response.json(person)
    } else {
        response.status(404).end();
    }
})

app.delete("/api/persons/:id", (request, response) => {
    const id = Number(request.params.id);

    persons = persons.filter(person => person.id !== id);
    console.log(JSON.stringify(persons))
    response.status(204).end();
})

function getRandomInt(max) {
    return Math.floor(Math.random() * max);
  }
  

app.post("/api/persons", (request, response) => {
   
   const name = request.body.name;
   const number = request.body.number;

   if (!name || !number) {
    return response.status(400).json({
        error: 'The name or number is missing'
    })
   }

   const existingContact = persons.filter(person => person.name === name);

   console.log(existingContact);

   if (existingContact.length > 0) {
    return response.status(400).json({
        error: 'The name already exists in the phonebook'
    })
   }
  
   const newContact = {
    name,
    number,
    id: getRandomInt(1000)
   }

   persons = persons.concat(newContact);

   response.json(newContact)
})

app.get("/info", (request, response) => {
    const numEntries = persons.length;
    const currDate = new Date();
    response.send(`
    <div>
     <p>Phonebook has info for ${numEntries} people</p>
     <p>${currDate}</p>
    </div>`
    )
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
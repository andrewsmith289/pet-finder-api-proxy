// packages import
const express = require('express')
const app = express()
const cors = require('cors')
const axios = require('axios')

// enable CORS
app.use(cors())

// set the port on which our app wil run
// important to read from environment variable if deploying
const port = process.env.PORT || 5000

const PETFINDER_URL = process.env.EXPRESS_APP_PETFINDER_URL
const PETFINDER_CLIENT_ID = process.env.EXPRESS_APP_CLIENT_ID
const PETFINDER_CLIENT_SECRET = process.env.EXPRESS_APP_CLIENT_SECRET

const petfinder = axios.create({
  baseURL: PETFINDER_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

petfinder.interceptors.response.use(
  (response) => {
    return response
  },
  async function (error) {
    const originalRequest = error.config
    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true
      const access_token = await refreshAccessToken()
      petfinder.defaults.headers.common['Authorization'] =
        'Bearer ' + access_token

      return petfinder(originalRequest)
    }

    return Promise.reject(error)
  }
)

const refreshAccessToken = async () => {
  const data = await petfinder.post(`oauth2/token`, {
    grant_type: 'client_credentials',
    client_id: PETFINDER_CLIENT_ID,
    client_secret: PETFINDER_CLIENT_SECRET,
  })

  return data.data.access_token
}

const getTypes = async () => {
  const res = await petfinder.get('types')

  return res.data
}

const searchPets = async ({ name, type }) => {
  const params = new URLSearchParams()
  name && params.append('name', name)
  type && params.append('type', type)

  const res = await petfinder.get(`animals?${params}`)

  return res.data
}

const getPet = async (id) => {
  const res = await petfinder.get(`animals/${id}`)

  return res.data
}

// basic string route to prevent Glitch error
app.get('/', (req, res) => {
  res.send('')
})

app.get('/types', async (req, res) => {
  const data = await getTypes()

  res.send(data)
})

// the route we're working with
app.get('/pets', async (req, res) => {
  const name = req.query.name
  const type = req.query.type

  const payload = {
    name,
    type,
  }

  const data = await searchPets(payload)

  res.send(data)
})

app.get('/pet/:id', async (req, res) => {
  const id = req.params.id

  // if (!id) {
  //   res.statusMessage = "Required parmeter 'id' not provided"
  //   res.status(400).send({
  //     error: "Required parameter 'id' not provided.",
  //   })
  //   return
  // }

  const data = await getPet(id)

  res.send(data)
})

// console text when app is running
app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`)
})

// packages import
const express = require("express");
const app = express();
const cors = require("cors");
const axios = require("axios");

// enable CORS
app.use(cors());

// set the port on which our app wil run
// important to read from environment variable if deploying
const port = process.env.PORT || 5000;

const PETFINDER_URL = process.env.EXPRESS_APP_PETFINDER_URL
const PETFINDER_CLIENT_ID = process.env.EXPRESS_APP_CLIENT_ID
const PETFINDER_CLIENT_SECRET = process.env.EXPRESS_APP_CLIENT_KEY

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

const searchPets = async (text) => {
  const params = new URLSearchParams({
    name: text,
  })

  const res = await petfinder.get(`animals?${params}`)

  return res.data
}



// basic string route to prevent Glitch error
app.get("/", (req, res) => {
    res.send("Hello World!");
});

// the route we're working with
app.get("/pets", async (req, res) =>  {
  const query = req.query.name
  
  if (!query) {
    res.statusMessage = "Query not provided";
    res.status(400).send('Required parameter \'query\' not provided.');
    return
  }
  const data = await searchPets(query)
  
  
  console.log(data)
    // replace with a custom URL as required
    //const backendUrl = "https://jsonplaceholder.typicode.com/users";
    // return the data without modification
    //axios.get(backendUrl).then(response => res.send(response.data));
  res.send(data)
});

// console text when app is running
app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
});
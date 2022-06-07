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

// basic string route to prevent Glitch error
app.get("/", (req, res) => {
    res.send("Hello World!");
});

// the route we're working with
app.get("/pets", (req, res) => {
  console.log(process.env.EXPRESS_APP_CLIENT_ID)
    // replace with a custom URL as required
    const backendUrl = "https://jsonplaceholder.typicode.com/users";
    // return the data without modification
    //axios.get(backendUrl).then(response => res.send(response.data));
});

// console text when app is running
app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
});
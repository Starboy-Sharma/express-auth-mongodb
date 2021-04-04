const express = require("express");
const app = express();
require("dotenv").config();
require("./database/connection.js");

// Recognize incoming request as a JSON object
express.json();

app.post("/login", (req, res) => {
  console.log("Login is now in work");
});

app.get("/logout", (req, res) => {});

app.post("/register", (req, res) => {});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server is running on ${PORT}`));

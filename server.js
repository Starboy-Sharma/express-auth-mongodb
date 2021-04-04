const express = require("express");
const app = express();
require("dotenv").config();
require("./database/connection.js");
const User = require("./models/user.model");

// Recognize incoming request as a JSON object
app.use(express.json());

app.post("/login", (req, res) => {
  console.log("Login is now in work");

  try {
    const { username, password, email } = req.body;

    const newUser = new User({
      username,
      password,
      email,
    });

    // https://medium.com/createdd-notes/starting-with-authentication-a-tutorial-with-node-js-and-mongodb-25d524ca0359

    // save user in database
    newUser
      .save()
      .then((user) => res.status(200).json(user))
      .catch((error) => {
        const errors = error.errors;
        const humanReadableError = [];
        const response = { status: 400 };

        for (err in errors) {
          humanReadableError.push({ error: errors[err].message });
        }

        response.errors = humanReadableError;
        response.completeErrorLog = errors;

        res.status(400);
        res.json(response);
      });
  } catch (err) {
    res.status(500);
    res.json(err);
  }
});

app.get("/logout", (req, res) => {
  res.send("You fucker go and login first");
});

app.post("/register", (req, res) => {});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server is running on ${PORT}`));

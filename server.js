const express = require("express");
const session = require("express-session");
const { generatePassword } = require("./utility/utility");
const app = express();
require("dotenv").config();
require("./database/connection.js");
const User = require("./models/user.model");

// Recognize incoming request as a JSON object
app.use(express.json());

app.post("/logout", (req, res) => {
  console.log("Login is now in work");
});

app.get("/login", async (req, res) => {
  // if email exists match user password

  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).send("Email or pasword is not correct");
  }

  // Check email exists in db or not
  const user = await User.findOne({ email: email });

  if (!user) {
    res.status(404).send("Oops User is not found!");
  }

  // Check password is valid or not
  if (await comparePassword(password, user.password)) {
    res.status(200).send("Login Successfully!").end();
  }

  res.status(400).send("password is not correct!").end();
});

app.post("/register", async (req, res) => {
  const response = { status: 400 };

  try {
    let { username, password, email } = req.body;

    // Make hash of the register user password
    password = await generatePassword(password);

    const newUser = new User({
      username,
      password,
      email,
    });

    // https://medium.com/createdd-notes/starting-with-authentication-a-tutorial-with-node-js-and-mongodb-25d524ca0359

    // check email is already exists or not
    const isEmailExists = await User.findOne({ email: email });

    if (isEmailExists) {
      response.error = `${email} is already in use.`;
      res.json(response).end();
    }

    // save user in database
    newUser
      .save()
      .then((user) => res.status(200).json(user))
      .catch((error) => {
        const errors = error.errors;
        const humanReadableError = [];

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

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server is running on ${PORT}`));

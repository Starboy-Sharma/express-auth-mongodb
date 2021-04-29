const express = require("express");
const Joi = require("@hapi/joi");
const jwt = require("jsonwebtoken");
require("dotenv").config();
require("./database/connection.js");
const cookieParser = require("cookie-parser");
const app = express();
app.use(cookieParser());
const User = require("./models/user.model");
const { generatePassword, comparePassword } = require("./utility/utility");

const registerSchema = Joi.object({
  username: Joi.string().min(3).max(255).required(),
  email: Joi.string().min(6).max(255).required().email(),
  password: Joi.string().min(8).max(1024).required(),
});

const loginSchema = Joi.object({
  email: Joi.string().min(6).max(255).required().email(),
  password: Joi.string().min(8).max(1024).required(),
});

// Recognize incoming request as a JSON object
app.use(express.json());

app.get("/logout", (req, res) => {
  // clear jwt token from the user cookie
  // res.clearCookie("nToken");
  // res.redirect("/");
});

app.post("/login", async (req, res) => {
  // validate the post data

  try {
    const { error } = loginSchema.validate(req.body);

    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { email, password } = req.body;
    // Check email exists in db or not
    const user = await User.findOne({ email: email });

    if (!user) {
      res.status(404).send("Oops User is not found!");
    }

    // Check password is valid or not
    if (await comparePassword(password, user.password)) {
      // Send JWT
      let payload = { id: user._id };
      const accessToken = jwt.sign(payload, process.env.JWT_SECRET);

      // save token in the cookie for the browser
      res.cookie("nToken", accessToken, { maxAge: 900000, httpOnly: true });

      return res.status(200).send({ accessToken }).end();
    }

    res.status(400).send("password is not correct!").end();
  } catch (error) {
    console.log(error);
    res.status(500).send("Server is not responding");
  }
});

app.post("/register", async (req, res) => {
  const response = { status: 400 };

  try {
    // validate the post data
    const { error } = registerSchema.validate(req.body);

    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

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
      .then((user) => res.status(201).json(user))
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

/**
 * Posts are only accessible for the login users
 */
app.post("/dashboard", authenticateToken, async (req, res) => {
  console.log("User", req.user);

  try {
    const user = await User.findOne({ _id: req.user.name });

    res.status(200).send({ user });
  } catch (error) {
    res.status(500).json({ error: error });
  }
});

function authenticateToken(req, res, next) {
  try {
    const authHeader = req.headers["authorization"];
    // Bearer TOKEN
    const token = authHeader && authHeader.split(" ")[1];

    if (token == null) return res.status(401);

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
      if (err) {
        return res.status(401).send("You are not authorized");
      }
      req.user = user;
      next();
    });
  } catch (error) {
    console.log(error);
    res.send(500);
  }
}

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server is running on ${PORT}`));

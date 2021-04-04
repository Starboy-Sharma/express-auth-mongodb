const mongoose = require("mongoose");

// Database Connection URL
const db = process.env.MongoURI;

class Database {
  constructor() {
    this._connect();
  }

  _connect() {
    // Connect to MongoDB
    mongoose
      .connect(db, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useCreateIndex: true,
      })
      .then(() => console.log(`MongoDB is conencted! Woohuuuu`))
      .catch((err) => console.error(err));
  }
}

module.exports = new Database();

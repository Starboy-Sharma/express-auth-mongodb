const bcrypt = require("bcrypt");
const saltRounds = 10;

const generatePassword = (password) => {
  return bcrypt
    .hash(password, saltRounds)
    .then((hashpwd) => {
      return hashpwd;
    })
    .catch((err) => console.error(err));
};

const comparePassword = async (password, dbPassword) => {
  if (await bcrypt.compare(password, dbPassword)) {
    return true;
  }

  return false;
};

module.exports = {
  generatePassword,
  comparePassword,
};

const { open } = require("sqlite");
const express = require("express");
const sqlite3 = require("sqlite3");
const path = require("path");
const bcrypt = require("bcrypt");

const app = express();

app.use(express.json());
var db = null;

const connectToDb = async () => {
  const fPath = path.join(__dirname, "userData.db");
  try {
    db = await open({
      filename: fPath,
      driver: sqlite3.Database,
    });

    app.listen(3001, () => {
      console.log("listening at http://localhost:3000/");
    });
  } catch (e) {
    console.log("Error:", e.message);
  }
};

connectToDb();

app.post("/register", async (req, res) => {
  const { username, name, password, gender, location } = req.body;

  const hashedPass = await bcrypt.hash(password, 10);

  const getUsername = `select * from user where username like "${username}"`;
  const result1 = await db.get(getUsername);

  if (result1 === undefined) {
    const setUser = `insert into user values("${username}","${name}","${hashedPass}","${gender}","${location}") `;

    if (password.length < 5) {
      res.status(400);
      res.send("Password is too short");
    } else {
      await db.run(setUser);
      res.status(200);
      res.send("User created successfully");
    }
  } else {
    res.status(400);
    res.send("User already exists");
  }
});

app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  const getUsername = `select * from user where username like "${username}"`;
  const result1 = await db.get(getUsername);

  if (result1 === undefined) {
    res.status(400);
    res.send("Invalid user");
  } else {
    const isValidPassword = await bcrypt.compare(password, result1.password);
    if (isValidPassword) {
      res.status(200);
      res.send("Login success!");
    } else {
      res.status(400);
      res.send("Invalid password");
    }
  }
});

app.put("/change-password", async (req, res) => {
  const { username, oldPassword, newPassword } = req.body;

  const hashedNewPass = await bcrypt.hash(newPassword, 10);
  const getUsername = `select * from user where username like "${username}"`;
  const result1 = await db.get(getUsername);

  const isValid = await bcrypt.compare(oldPassword, result1.password);

  if (isValid) {
    const updateQuery = `update user set password="${hashedNewPass}" where username="${username}"`;

    if (newPassword.length < 5) {
      res.status(400);
      res.send("Password is too short");
    } else {
      await db.run(updateQuery);
      res.status(200);
      res.send("Password updated");
    }
  } else {
    res.status(400);
    res.send("Invalid current password");
  }
});

module.exports = app;

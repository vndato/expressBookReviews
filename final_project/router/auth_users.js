const express = require('express');
const jwt = require('jsonwebtoken');
const { restart } = require('nodemon');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username) => { //returns boolean
  let usernameWithSameName = users.filter((user) => user.username === username);
  if (usernameWithSameName.length > 0) {
    return false;
  }
  else {
    return true;
  }
}

const authenticatedUser = (username, password) => {
  let validusers = users.filter((user) => {
    return (user.username === username && user.password === password)
  });
  if (validusers.length > 0) {
    return true;
  } else {
    return false;
  }
}

//only registered users can login
regd_users.post("/login", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (!username || !password) {
    return res.status(404).json({ message: "Error logging in" });
  }

  if (authenticatedUser(username, password)) {
    let accessToken = jwt.sign({
      data: password
    }, 'access', { expiresIn: 60 * 60 });

    req.session.authorization = {
      accessToken, username
    }
    return res.status(200).send("User successfully logged in");
  } else {
    return res.status(208).json({ message: "Invalid Login. Check username and password" });
  }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  let isbn = parseInt(req.params.isbn);
  let review = req.body.review;
  let username = req.session.authorization.username;
  if (review) {
    books[isbn]['reviews'][username] = review;
    res.status(200).send("Review added successfully");
  }
  else {
    res.status(404).send("Review could not be added");
  }
});

// Delete a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
  let isbn = parseInt(req.params.isbn);
  let username = req.session.authorization.username;
  if (books[isbn]['reviews'][username]) {
    delete books[isbn]['reviews'][username];
    res.send(`Book review by ${username} has been deleted`);
  } else {
    res.status(404).send("Review not found");
  }
})

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;

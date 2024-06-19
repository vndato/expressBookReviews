const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

public_users.post("/register", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (username && password) {
    if (isValid(username)) {
      users.push({ 'username': username, 'password': password })
      return res.status(200).json({ message: "User successfully registred. Now you can login" });
    }
    else {
      return res.status(404).json({ message: "User already exists!" });
    }
  }
  return res.status(404).json({ message: "Unable to register user." });
});

// Get the book list available in the shop
public_users.get('/', function (req, res) {
  let bookPromise = new Promise((resolve, reject) => {
    resolve(books);
  });

  bookPromise.then((books) => {
    res.send(JSON.stringify(books, null, 4));
  }).catch((err) => {
    res.status(404).send({ message: 'No books found' })
  });
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn', function (req, res) {
  let isbn = parseInt(req.params.isbn);
  let isbnPromise = new Promise((resolve, reject) => {
    if (books[isbn]) {
      resolve(books[isbn]);
    } else {
      reject("Book not found");
    }
  });

  isbnPromise.then((book) => {
    res.send(JSON.stringify(book));
  }).catch((error) => {
    res.status(404).send({ message: 'Book not found' });
  });
});

// Get book details based on author
public_users.get('/author/:author', function (req, res) {
  let author = req.params.author;
  let authorPromise = new Promise((resolve, reject) => {
    let result = [];
    if (author) {
      let bookArray = Object.values(books);
      result = bookArray.filter((book) => { return book.author === author });
      if (result.length > 0) {
        resolve(result);
      } else {
        reject("No books found by this author");
      }
    } else {
      reject("Not valid");
    }
  });

  authorPromise.then((bookResults) => {
    res.send(JSON.stringify(bookResults, null, 4));
  }).catch((error) => {
    res.status(404).send({ message: 'Author not found' });
  });
});

// Get all books based on title
public_users.get('/title/:title', function (req, res) {
  let title = req.params.title;
  let str = title.replace(/-/g, ' ').trim();

  let titlePromise = new Promise((resolve, reject) => {
    let result = [];
    if (str) {
      let bookArray = Object.values(books);
      result = bookArray.filter((book) => {
        return book.title.toLowerCase().includes(str.toLowerCase());
      });
      if (result.length > 0) {
        resolve(result);
      } else {
        reject("No books found with this title");
      }
    } else {
      reject("Not valid");
    }
  })

  titlePromise.then((bookResults) => {
    res.send(JSON.stringify(bookResults, null, 4));
  }).catch((error) => {
    res.status(404).send({ message: 'No books found' });
  })
});

//  Get book review
public_users.get('/review/:isbn', function (req, res) {
  let isbn = parseInt(req.params.isbn);
  if (books[isbn]) {
    res.send(books[isbn]['reviews']);
  }
});

module.exports.general = public_users;

const express = require("express");

const multerErrorHandler = require("../utils/multerErrorHandler");

const app = express();

// app.set('view engine', 'ejs')
// static file
app.get('/', (req, res) => {
    res.render('login')
})
app.get('/signup', (req, res) => {
    res.render('signup')
})

const port = 5000;

app.listen(port, () => {
  console.log("listening on port");
});

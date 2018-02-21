const express = require('express');
const app = express();
const cookieParser = require('cookie-parser')();
const path = require('path');
const server = require('http').Server(app);

const checkAuth = (req, res, next) => {
  let password = req.cookies.__session;
  if (!password || password !== process.env.PASSWORD) {
    console.log('user not authenticated');
    return res.sendFile('/public/login/');
  } else {
    console.log('user is authenticated');
    return next();
  }
};

app.use(express.static(path.join(__dirname, "public")));
app.use(cookieParser);
app.use(checkAuth);

app.post('/api/login', (req, res, next) => {
  if (req.headers.password === process.env.PASSWORD) {
    console.log('correct password');
    res.cookie('__session', process.env.PASSWORD, { maxAge: 86400000, secure: true });
    res.sendFile('/public/');
  } else {
    console.log('incorrect password');
    res.sendFile('/public/login/');
  }
});

const PORT = process.env.PORT || 3001;

server.listen(PORT, function() {
  console.log('listening on port ' + PORT);
});

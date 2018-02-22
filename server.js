const express = require('express');
const app = express();
const cookieParser = require('cookie-parser')();
const path = require('path');
const server = require('http').Server(app);

const checkAuth = (req, res, next) => {

  // only check authentication for GET requests
  if (req.method === 'GET') {
    // serve static js and css files without authentication
    let filepath = req.path;
    let fileType = filepath.substring(filepath.length - 4);
    if (fileType === '.css') {
      return next();
    }
    fileType = filepath.substring(filepath.length - 3);
    if (fileType === '.js') {
      return next();
    }

    // cookie will include password if user is authenticated
    let password = req.cookies.__session;
    if (!password || password !== process.env.PASSWORD) {
      // user is not authenticated, redirect them to login page
      console.log('user not authenticated');
      res.setHeader("Content-Type", "text/html");
      return res.sendFile(path.join(__dirname, "public/login/"));
    } else {
      // user is authenticated, send requested resource
      console.log('user is authenticated');
      return next();
    }
  } else {
    return next();
  }
  
};

app.use(cookieParser);
app.use(checkAuth);
app.use(express.static(path.join(__dirname, "public")));

app.post('/api/login', (req, res, next) => {
  if (req.headers.password === process.env.PASSWORD) {
    // password is correct, set cookie
    console.log('correct password');
    res.cookie('__session', process.env.PASSWORD, { maxAge: 86400000, secure: process.env.NODE_ENV !== 'development' }); // cookie expires after 1 day
    res.status(200).send('correct password');
  } else {
    // password is incorrect
    console.log('incorrect password');
    res.clearCookie('__session');
    res.status(401).send('incorrect password');
  }
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, function() {
  console.log('listening on port ' + PORT);
});

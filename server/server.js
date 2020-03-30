require('dotenv').config();


const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const utils = require('./utils');

const app = express();
const port = process.env.PORT|| 4000;

// static user details
const userData = {
    userId: "789789",
    password: "admin",
    name: "Aymeric",
    username: "admin",
    isAdmin: true
  };

// enable CORS
app.use(cors());

// parse application/json
app.use(bodyParser.json());

//parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true}));


app.listen(port, () => {
    console.log('Server started on' + port);
});
app.put('/users/update', function(req, res) {
    const name = req.body.name;

    if (!name) {
        return res.status(400).json({
            error:true,
            message:"No name provided"
        });
    }

    userData.name = name;


    const userObj = utils.getCleanUser(userData);
    //return the token along with user details
    return res.json({ user: userObj});
    
})


// Validate user credentials
app.post('/users/signin', function (req, res) {
    const user = req.body.username;
    const pwd = req.body.password;



    //return 400 status if username/password is not exist
    if (!user || !pwd) {
        return res.status(400).json({
            error:true,
            message: "Username or password required"
        });
    }

    //return 401 status if the username and password don't match
    if (user !== userData.username || pwd !== userData.password){
        return res.status(401).json({
            error:true,
            message: "Username or password is wrong"
        });
    }


    //generate token
    const token = utils.generateToken(userData);
    //get basic user details
    const userObj = utils.getCleanUser(userData);
    //return the token along with user details
    return res.json({ user: userObj, token });

});

//verify token and return it if valid
app.get('/verifyToken', function (req,res) {
    // check header or url parameters or post parameters for token
    var token = req.body.token || req.query.token;
    if (!token) {
        return res.status(400).json({
            error:true,
            message: "Token is required"
        })
    }


    // check token that was passed by decoding token using secret
    jwt.verify(token, process.env.JWT_SECRET, function (err, user) {
        if (err) return res.status(401).json({
            error: true,
            message: "Invalid token"
        });

        //return 401 status if the userId does not match.
        if (user.userId !== userData.userId) {
            return res.status(401).json({
                error: true,
                message: "Invalid User"
            });
        }

        // get basic user details
        var userObj = utils.getCleanUser(userData);
        return res.json({ user: userObj, token});
    });
})


// in all future routes, this helps to know if the request is authenticated or not
app.use(function (req, res, next) {
    // check header or url parameters or post parameters for token
    var token = req.headers['authorization'];
    if (!token) return next(); // if no token continue

    token = token.replace('Bearer ', '');
    jwt.verify(token, process.env.JWT_SECRET, function (err, user) {
        if (err) {
            return res.status(401).json({
                error:true,
                message: "Invalid user."
            });
        } else {
            req.user = user; // set the user to req so other routes can use it
            next();
        }
    });
});

//request handlers
app.get('/', (req, res) => {
    if (!req.user) return res.status(401).json({ success: false, message: 'Invalid user to access it.'});
    res.send('Welcome to the first Node.js Tutorial! - ' + req.user.name);
});


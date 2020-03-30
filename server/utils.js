//generate token using scerter from process.env.JWT_SECRET
var jwt = require('jsonwebtoken');

//generate token and return it
function generateToken(user) {
     if (!user) return null;

     var U = {
         userId: user.userId,
         name: user.name,
         username: user.username,
         isAdmin: user.isAdmin
     };

    //return a  user with a signed token
     return jwt.sign(U, process.env.JWT_SECRET, {
         expiresIn: 60 * 60 * 24 // expires in 24 hours
     });
}

// retrun basic user details
function getCleanUser(user){
    if (!user) return null;

    return {
        userId: user.userId,
        name: user.name,
        username: user.username,
        isAdmin: user.isAdmin
    };
}

module.exports = {
    generateToken,
    getCleanUser
}
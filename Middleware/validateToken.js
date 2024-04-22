const asyncHandler = require('express-async-handler')
const jsonwebtoken = require('jsonwebtoken')

const validate = asyncHandler(async(req, res, next) => {
     let token
     let authHeader = req.headers.authorization
     if(authHeader && authHeader.startsWith('Bearer')){
        token = authHeader.split(' ') [1]

        jwt.verify(token, process.env.ACCESS_KEY, (err, user) => {
            if(err) {
                res.status(401).json({ message: 'Unauthorized, please log in'})
            }
            req.use = user
            next()
         })   
    } else {
        res.status(401).json({ message: 'User is not authorized'})
    }  
});

const isAdmin = asyncHandler(async (req, res, next) => {
    try {
        if (req.user.role === 'admin') {
            next(); 
        } else {
            res.status(403).json({ message: 'User not allowed' });
        }
    } catch (error) {
        throw error
    }
});


module.exports = {
    validate,
    isAdmin
}
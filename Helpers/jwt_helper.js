const jwt = require("jsonwebtoken");
const createError = require("http-errors");


module.exports = {
    signAccessToken: (userId)=>{
        return new Promise((resolve, reject)=>{
            const secret = process.env.ACCESS_TOKEN_SECRET;
            const options= {
                expiresIn: 60 * 60,
            }
            jwt.sign({name:userId}, secret, options, (err, token)=>{
                if(err) {
                    console.log(err.message);
                    reject(createError.InternalServerError())
                }
                resolve(token);
            })
            
        })
    }
}
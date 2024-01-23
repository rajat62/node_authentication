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
    },

    verifyAccessToken: (req, res, next)=>{
        
        if(!req.headers['authorization']) return next(createError.Unauthorized())
        
        const authHeader = req.headers['authorization'];
        const bearerToken = authHeader.split(" ");
        const token = bearerToken[1];

        jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, payload)=>{

            if(err){
                if(err.name === "JsonWenTokenError"){
                    return next(createError.Unauthorized())
                }else{
                    return next(createError.Unauthorized(err.message));
                }
            }
            req.payload = payload;
            next();
        })
    },
    signRefreshToken: (userId)=>{
        return new Promise((resolve, reject)=>{
            const secret = process.env.REFRESH_TOKEN_SECRET;
            const options= {
                expiresIn:'1y',
            }
            jwt.sign({name:userId}, secret, options, (err, token)=>{
                if(err) {
                    console.log(err.message);
                    reject(createError.InternalServerError())
                }
                resolve(token);
            })
            
        })
    },
    verifyRefreshToken: (refreshToken)=>{
        
        return new Promise((resolve, reject)=>{
            jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, payload)=>{
                if(err){
                    return reject(createError.Unauthorized());
                }
                const userId = payload.name;
                resolve(userId);
                
            });
        })
        
    }
}
const jwt = require("jsonwebtoken");

let authentication = async function(req, res, next){
    try{
        let token = req.headers[`x-api-key`]
        if(!token) return res.status(400).send({status: false, msg: "Token must be present in Headers"});
        let decodedToken = jwt.verify(token, "project-blog");
        if(!decodedToken) return  res.status(400).send({ status: false, msg: "Please enter a valid Token"});
        req.authorId = decodedToken.userId
        next();
    }
    catch(err){
        res.status(500).send({status: false, msg: err.message})
    }
}

module.exports = {authentication};
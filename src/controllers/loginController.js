const JWT = require("jsonwebtoken");
const { sendError } = require("../middleware/error");
const authorModel = require("../models/authorModel");

const logInUser = async function (req, res) {
    let userName = req.body.email;
    let password = req.body.password;

    if (!userName || !userName.trim())
        return sendError(res, "user Name is required");
    if (!password || !password.trim())
        return sendError(res, "password is required");

    const check = await authorModel.findOne({
        email: userName,
        password: password,
    });

    if (!check) return sendError(res, "userName or password is wrong");
    let token = JWT.sign(
        {
            userId: check._id.toString(),
        },
        "project-blog"
    );

    res.setHeader("x-api-key", token);
    res.status(200).send({ status: true, data: { token: token } });
};

module.exports = { logInUser };

const { sendError } = require("../middleware/error");
const authorModel = require("../models/authorModel");

const createAuthor = async function (req, res) {
    const details = req.body;

    const letters = /^[A-Za-z]+$/;

    if (!details.fname)
        return sendError(res, 'First name is required')
    if (!details.fname.match(letters)) {
        return sendError(res, "First name should contain only alphabets");
    }

    if (!details.lname)
        return sendError(res, "Last name is required" );
    if (!details.lname.match(letters)) {
        return sendError(res, "Last name should contain only alphabets");
    }

    if (!details.title)
        return sendError(res, "Title is required" );

    let word = ["Mr", "Mrs", "Miss"];
    if (!word.includes(details.title)) {
        return sendError(res, "Title can accept only Mr/Mrs/Miss!" );
    }

    if (!details.email)
        return sendError(res, "Email is required" );

    const validateEmail = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/.test(details.email);
    if (!validateEmail)
        return sendError(res, "Invalid Email ID, Please check" );

    let isUnique = await authorModel.findOne({ email: details.email });
    if (isUnique) 
      return sendError(res, "Enter a unique email id!" );

    if (!details.password)
        return sendError(res, "Password is required" );

    const data = await authorModel.create(details);
    res.status(201).send({ status: true, data: data });
};

module.exports = { createAuthor };

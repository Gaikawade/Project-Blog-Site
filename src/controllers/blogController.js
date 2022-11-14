const blogModel = require("../models/blogModel");
const authorModel = require("../models/authorModel");
const authorController = require("../models/authorModel");
const blogController = require("../models/blogModel");
const validator = require("validator");
const { sendError } = require("../middleware/error");

const createBlog = async function (req, res) {
    const details = req.body;
    let { title, body, authorId, category } = details;

    if (!title) {
        return sendError(res, "Title of the blog is required");
    }
    if (!validator.isLength(title, { min: 5, max: 30 })) {
        return sendError(
            res,
            "The length of the title should contain minium 5 and maximum 30 charactors!"
        );
    }

    if (!body) {
        return sendError(res, "Body of the blog is required");
    }
    if (!validator.isLength(body, { min: 10 })) {
        return sendError(
            res,
            "The length of body should have atleast 10 letters."
        );
    }

    if (!authorId) {
        return sendError(res, "Author_Id of the blog is required");
    }

    let authorDetails = await authorModel.findOne({ _id: authorId });
    if (!authorDetails) {
        return sendError(
            res,
            "The Author with the given author id doesn't exist",
            404
        );
    }

    if (!category) {
        return sendError(res, "Category of the blog is required");
    }

    const validate = await authorController.findById(details.authorId);
    if (!validate) {
        return sendError(res, "You have entered a invalid Author_Id");
    }

    const data = await blogController.create(details);
    res.status(201).send({ status: true, data: data });
};

const getBlog = async function (req, res) {
    let q = req.query;
    let filter = {
        isDeleted: false,
        isPublished: true,
        ...q,
    };
    if (q.authorId) {
        const validate = await authorController.findById(q.authorId);
        if (!validate) {
            return sendError(res, "AuthorId not Found", 404);
        }
    }

    const data = await blogModel.find(filter);
    if (data.length == 0) {
        return sendError(res, "No blog is found", 404);
    }

    res.status(200).send({ status: true, data: data });
};

const updateBlog = async function (req, res) {
    const blogId = req.params.blogId;
    const details = req.body;
    const authorFromToken = req.authorId;

    if (!authorFromToken) {
        return sendError(res, "It is not a valid token");
    }

    const validId = await blogModel.findById(blogId);
    if (!validId) {
        return sendError(res, "Blog Id is invalid", 404);
    }

    if (validId.authorId.toString() !== authorFromToken) {
        return sendError(res, "Your are not authorised");
    }

    if (validId.isDeleted == true) {
        return sendError(res, "No blog found", 404);
    }

    const updatedDetails = await blogModel.findOneAndUpdate(
        { _id: blogId },
        {
            $push: { tags: details.tags, subcategory: details.subcategory },
            $set: {
                title: details.title,
                body: details.body,
                isPublished: true,
                publishedAt: new Date(),
            },
        },
        { new: true }
    );
    res.status(201).send({
        status: true,
        message: "Your blog is updated",
        data: updatedDetails,
    });
};

const deleteBlogById = async function (req, res) {
    const blogId = req.params.blogId;
    const authorFromToken = req.authorId;

    if (!authorFromToken) {
        return sendError(res, "It is not a valid token");
    }
    if (!blogId) {
        return sendError(res, "BlogId not found", 404);
    }

    const check = await blogModel.findById({ _id: blogId });

    if (check.authorId.toString() !== authorFromToken) {
        return sendError(res, "Your are not authorised");
    }

    if (check.isDeleted == true) {
        return sendError(res, "Blog not found", 404);
    }

    await blogModel.findOneAndUpdate(
        { _id: blogId },
        { isDeleted: true, deletedAt: new Date() },
        { new: true }
    );
    res.status(201).send({ status: true, msg: "Blog deleted sucessufully" });
};

const deleteBlogByQuery = async function (req, res) {
    let data = req.query;
    let authorFromToken = req.authorId;
    if (!authorFromToken) {
        return sendError(res, "It is not a valid token");
    }

    let valid = await authorModel.findById(authorFromToken);
    if (valid._id.toString() !== authorFromToken) {
        return sendError(res, "Unauthorized access! user doesn't match");
    }

    const deleteByQuery = await blogModel.updateMany(
        { $and: [data, { authorId: valid._id, isDeleted: false }] },
        { $set: { isDeleted: true, DeletedAt: new Date() } },
        { new: true }
    );
    if (deleteByQuery.modifiedCount == 0) {
        return sendError(res, "Blog not found", 404);
    }

    res.status(201).send({ status: true, msg: "Blog deleted Sucessufully" });
};

module.exports = {
    createBlog,
    getBlog,
    updateBlog,
    deleteBlogById,
    deleteBlogByQuery,
};

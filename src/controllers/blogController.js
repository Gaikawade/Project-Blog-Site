const blogModel = require("../models/blogModel");
const authorModel = require ("../models/authorModel");
const authorController = require("../models/authorModel");
const blogController = require("../models/blogModel");
const validator = require("validator");

const createBlog = async function(req, res){
    try{
        const details = req.body;
        let {title, body, authorId, category} = details;

        if(!title) return res.status(400).send({status: false, msg: "Title of the blog is required"});
        if(!validator.isLength(title, {min: 5, max: 30})){return res.status(400).send({status: false, msg: 'The length of the title should contain minium 5 and maximum 30 charactors!'})};
        
        if(!body) return res.status(400).send({status: false, msg: "Body of the blog is required"});
        if(!validator.isLength(body, {min: 10})){return res.status(400).send({status: false, msg: 'The length of body should have atleast 10 letters.'})};
        
        if(!authorId) return res.status(400).send({status: false, msg: "Author_Id of the blog is required"});
        let authorDetails = await authorModel.findOne({_id: authorId});
        if(!authorDetails){res.status(400).send({status: false, msg: "The Author with the given author id doesn't exist"})};
        
        if(!category) return res.status(400).send({status: false, msg: "Category of the blog is required"});

        const validate = await authorController.findById(details.authorId);
        if(!validate) return res.status(400).send({status: false, msg: "You have entered a invalid Author_Id"});

        const data = await blogController.create(details)
        res.status(200).send({status: true, data: data})
    }
    catch(err){
        res.status(500).send({status: false, msg: err.message});
    }
}

const getBlog = async function(req, res){
    try{
        let q = req.query;
        let filter = {
            isDeleted: false,
            isPublished: true,
            ...q
        };
        if(q.authorId){
            const validate = await authorController.findById(q.authorId);
            if(!validate) return res.status(404).send({status:false, msg: "AuthorId is not valid"});
        }

        const data = await blogModel.find(filter);
        if(data.length == 0) return res.status(404).send({status:false, msg: "No blog is found"});

        res.status(201).send({status: true, data: data})
    }catch(err){
        res.status(500).send({status: false, msg: err.message});
    }
}

const updateBlog = async function(req, res){
    try{
        const blogId = req.params.blogId
        const details = req.body
        const validId = await blogModel.findById(blogId)
        if (!validId) return res.status(400).send({status:false, msg:"Blog Id is invalid"});

        if(validId.isDeleted == true) return res.status(404).send({status: false, msg: "The blog is already deleted"});
       
        const updatedDetails = await blogModel.findOneAndUpdate(
            {_id : blogId},
            {title : details.title, body : details.body, tags : details.tags,
            subcategory : details.subcategory, isPublished : true, publishedAt : new Date()},
            {new : true, upsert : true}
        );
        res.status(201).send({status:true, data:updatedDetails})
    }
    catch(err) {
        console.log(err)
        res.status(500).send({status:false, msg: err.message})
    }
}

const deleteBlogById = async function(req, res){
    try{
        const blogId = req.params.blogId;
        if(!blogId) return res.status(404).send({status: false, msg: "BlogId is invalid"});

        const check = await blogModel.findById({_id: blogId});
        if(check.isDeleted == true) return res.status(404).send({status: false, msg: "The blog is already deleted"});

        const deleteDetails = await blogModel.findOneAndUpdate(
            {_id: blogId },
            {isDeleted: true, deletedAt: new Date()},
            {new: true}
        );
        res.status(200).send({status: true, data: deleteDetails});
    }catch(err){
        res.status(404).send({msg: err.message});
    }
}

const deleteBlogByQuery = async function(req, res){
    try{
        const data = req.query;
        const { authorId, category, subcategory, tags } = data
        
        if (category) {
            let verifyCategory = await blogModel.findOne({ category: category })
            if (!verifyCategory) return res.status(400).send({ status: false, msg: 'No blogs in this category exist' });
        }

        if (tags) {
            let verifytags = await blogModel.findOne({ tags: tags })
            if (!verifytags) return res.status(400).send({ status: false, msg: 'no blog with this tags exist' });
        }

        if (subcategory) {
            let verifysubcategory = await blogModel.findOne({ subcategory: subcategory })
            if (!verifysubcategory) return res.status(400).send({ status: false, msg: 'no blog with this subcategory exist'});
        }

        let findBlog = await blogModel.find({$and :[data, {isdeleted : false}, {authorId : authorId} ]});
        if(!findBlog) return res.status(400).send({status :false, msg : "no blogs are present with this query"});

        const deleteByQuery = await blogModel.updateMany(
            data,
            {isDeleted: true, deletedAt: new Date()},
            {new: true}
        );
        if (deleteByQuery) res.status(200).send({ status: true, msg : "Your blogs have been deleted", data: deleteByQuery });

    }catch(err){
        res.status(500).send({status: false, msg: err.message})
    }
}

module.exports = {createBlog, getBlog, updateBlog, deleteBlogById, deleteBlogByQuery};
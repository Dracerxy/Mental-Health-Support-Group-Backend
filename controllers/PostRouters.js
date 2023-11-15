const express=require("express");
const post_routes= new express.Router();
const PostSchema=require('../schema/PostSchema')
const mongoose =require('mongoose');

post_routes.get("/",async(req, res) => {
    PostSchema.find((err,data)=>{
        if(err){
            console.log(err)
        }else{
            return res.json(data)
        }
    });
  });
post_routes.get('/user-post/:id',async(req,res)=>{
    const { _id } = req.params;

    try {
        const posts = await PostSchema.findById({ _id });

        res.json({ data: posts });
    } catch (error) {    
        res.status(404).json({ message: error.message });
    }
})
post_routes.post("/new-post",async(req,res)=>{
    const post = req.body;
    const newPostMessage = new PostSchema({ ...post, createdAt: new Date().toISOString() })

    try {
        await newPostMessage.save();

        res.status(201).json(newPostMessage);
    } catch (error) {
        res.status(409).json({ message: error.message });
    }
})
post_routes.post("/update-post/:id",async(req,res)=>{
    const { id } = req.params;
    console.log(id)
    const { title, message, creator, selectedFile, tags } = req.body;
    
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(404).send(`No post with id: ${id}`);

    const updatedPost = { creator, title, message, tags, selectedFile, _id: id };

    await PostSchema.findByIdAndUpdate(id, updatedPost, { new: true });

    res.json(updatedPost);
})
post_routes.delete("/delete-post/:id",async(req,res)=>{
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(404).send(`No post with id: ${id}`);

    await PostSchema.findByIdAndRemove(id);

    res.json({ message: "Post deleted successfully." });
})

post_routes.post("/like-post",async (req, res) => {
    const { _id, email } = req.body;
    console.log(_id,email)
    if (req.email==="") {
        return res.json({ message: "Unauthenticated" });
      }

    if (!mongoose.Types.ObjectId.isValid(_id)) return res.status(404).send(`No post with id: ${_id}`);
    
    const post = await PostSchema.findById(_id);

    const index = post.likes.findIndex((mail) => mail===String(email));

    if (index === -1) {
      post.likes.push(email);
    } else {
      post.likes = post.likes.filter((mail) => mail !== String(email));
    }

    const updatedPost = await PostSchema.findByIdAndUpdate(_id, post, { new: true });

    res.status(200).json(updatedPost);
})

post_routes.put("/comment-post/:id",async (req, res) => {
    const { id } = req.params;
    const { value } = req.body;
    console.log(id)
    const post = await PostSchema.findById(id);

    post.comments.push(value);

    const updatedPost = await PostSchema.findByIdAndUpdate(id, post, { new: true });

    res.json(updatedPost);
});



module.exports = post_routes;
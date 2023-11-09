const express=require("express");
const post_routes= new express.Router();
const PostSchema=require('../schema/PostSchema')

post_routes.get("/post",async(req, res) => {
    const { page } = req.query;
    
    try {
        const LIMIT = 8;
        const startIndex = (Number(page) - 1) * LIMIT; // get the starting index of every page
    
        const total = await PostSchema.countDocuments({});
        const posts = await PostSchema.find().sort({ _id: -1 }).limit(LIMIT).skip(startIndex);

        res.json({ data: posts, currentPage: Number(page), numberOfPages: Math.ceil(total / LIMIT)});
    } catch (error) {    
        res.status(404).json({ message: error.message });
    }
  });
post_routes.get('/user-post/:_id',async(req,res)=>{
    const { _id } = req.query;

    try {
        const posts = await PostSchema.findById({ _id });

        res.json({ data: posts });
    } catch (error) {    
        res.status(404).json({ message: error.message });
    }
})
post_routes.post("/new-post",async(req,res)=>{
    const post = req.body;

    const newPostMessage = new PostSchema({ ...post, creator: req.userId, createdAt: new Date().toISOString() })

    try {
        await newPostMessage.save();

        res.status(201).json(newPostMessage);
    } catch (error) {
        res.status(409).json({ message: error.message });
    }
})
post_routes.post("/update-post/:id",async(req,res)=>{
    const { id } = req.params;
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

post_routes.post("/like-post/:id",async (req, res) => {
    const { id } = req.params;

    if (!req.userId) {
        return res.json({ message: "Unauthenticated" });
      }

    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(404).send(`No post with id: ${id}`);
    
    const post = await PostSchema.findById(id);

    const index = post.likes.findIndex((id) => id ===String(req.userId));

    if (index === -1) {
      post.likes.push(req.userId);
    } else {
      post.likes = post.likes.filter((id) => id !== String(req.userId));
    }

    const updatedPost = await PostSchema.findByIdAndUpdate(id, post, { new: true });

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
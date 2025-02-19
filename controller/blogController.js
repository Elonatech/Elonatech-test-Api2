const Blog = require('../models/blogModel');
const cloudinary = require('../lib/cloudinary');


const createBlog = async (req, res) =>{
   try {

     const { title, description, author, category} = req.body
     if (!req.file) {
        return res.status(400).send('Image Path is Undefined')
      } 
     let result = await cloudinary.uploader.upload(req.file.path, {folder: "Blog"});
     let  newBlog = await Blog.create({ title, description, author, category,  cloudinary_id: result.secure_url })
     
    return res.status(201).send("Blog Created Successfully")

   } catch (error) {
    console.log(error)
   }
}

// Get All Blogs 
const getBlogs =  async (req , res) =>{
const getAllBlogs = await Blog.find()
if(!getAllBlogs){
   return res.status(400).send('Bad request')
}
return res.status(200).json({ getAllBlogs })
}


// Get Blog By Id 
const getBlogId  = async (req , res) =>{
     // Find Blog by Id
    const getId = await Blog.findById(req.params.id)
    if(!getId){
       return res.status(404).send({message:'Blog Not Found'})
    } 
    const getBlogById = await Blog.findById(getId);
    return res.status(200).json({getBlogById})
}


const updateBlogId = async (req , res) =>{
        let user = await Blog.findById(req.params.id);
        // Check if the user is found
        if (!user) {
          return res.status(404).json({ success: false, message: "User not found" });
        }
        await cloudinary.uploader.destroy(user.cloudinary_id);
        let result;
        if (req.file) {
          result =  await cloudinary.uploader.upload(req.file.path);
        } else {
            return res.send('cloudinary path is undefined')
        }
        const data = {
            title: req.body.title,
            description: req.body.description,
            author: req.body.author,
            category: req.body.category,
            cloudinary_id: result.secure_url,
        };
        user = await Blog.findByIdAndUpdate(req.params.id, data, { new: true });
        res.json(user);
}


const deleteBlogId = async (req , res) =>{
    // Find Blog by Id
    let blog = await Blog.findById(req.params.id);
    // Delete image from cloudinary
    await cloudinary.uploader.destroy(blog.cloudinary_id);
   // Delete user from db
   await blog.deleteOne();
   return res.status(200).send('Blog Successfully Deleted');
}


module.exports = { createBlog, getBlogs, getBlogId, updateBlogId, deleteBlogId }
const express = require('express');
const router = express.Router();
const Post = require('../models/Post')
const Comment = require('../models/Comment')

const { body, validationResult } = require('express-validator');

// GET HOME
router.get('', async (req, res) => {
    try {
        const locals = {
            title: "Blog Task",
            description: "Serhat Zirhli Blog Task"
        }

        let perPage = 5;
        let page = req.query.page || 1;

        const data = await Post.aggregate([{ $sort: { createdAt: -1 } }])
            .skip(perPage * page - perPage)
            .limit(perPage)
            .exec();

        const count = await Post.countDocuments();
        const nextPage = parseInt(page) + 1;
        const hasNextPage = nextPage <= Math.ceil(count / perPage);

        res.render('index', {
            locals,
            data,
            current: page,
            nextPage: hasNextPage ? nextPage : null,
            currentRoute: '/'
        });
    } catch (error) {
        console.log(error)
    }

});


/* GET / Post :id */
router.get('/post/:id', async (req, res) => {


    try {
        let slug = req.params.id;

        const data = await Post.findById({ _id: slug }).populate('comments').exec();
        //data.populate('comments').then(p=>console.log(p)).catch(error=>console.log(error));

        res.set('Content-Type', 'text/html');
        const locals = {
            title: data.title,
            description: "Serhat Zirhli Blog Task"

        }
        res.render('post', { locals, data, currentRoute: `/post/${slug}` });
    } catch (error) {
        console.log(error)
    }

});

/* Post / Post - searchTerm */


router.post('/search', async (req, res) => {


    try {
        const locals = {
            title: "Search",
            description: "Serhat Zirhli Blog Task"

        }

        let searchTerm = req.body.searchTerm;
        const searchNoSpecialChar = searchTerm.replace(/[^a-zA-Z0-9 ]/g, "");

        const data = await Post.find({
            $or: [
                { title: { $regex: new RegExp(searchNoSpecialChar, 'i') } },
                { body: { $regex: new RegExp(searchNoSpecialChar, 'i') } }
            ]
        });
        res.render("search", {
            data,
            locals
        });
    } catch (error) {
        console.log(error)
    }

});

// POST Comment Post
router.post('/post/:id/comments', [
    body('author').not().isEmpty().withMessage('The author cannot be empty'),
    body('email').not().isEmpty().withMessage('Invalid Mail'),
    body('comment').not().isEmpty().withMessage('The comment cannot be empty'),
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const alert = errors.array();
        const data = await Post.findById(req.params.id).exec();
        const locals = {
            title: data.title,
            description: "Serhat Zirhli Blog Task"
        }

        res.render('post', {
           locals, alert, data
        })
    } else {
        try {
            let slug = req.params.id;
            const newComment = new Comment({
                author: req.body.author,
                email: req.body.email,
                comment: req.body.comment,
            });
            await newComment.save();

            const post = await Post.findById(req.params.id).exec();
            post.comments.push(newComment);
            await post.save();
            res.redirect(`/post/${slug}`)

        } catch (error) {
            console.log("Error on adding comment : ", error);
        }
    }

});




/*
router.get('', async (req, res) => {
    const locals = {
        title: "Blog Task",
        description: "Serhat Zirhli Blog Task"

    }

    try {
        const data = await Post.find();
        res.render('index', { locals, data });
    } catch (error) {
        console.log(error)
    }
    
});
*/

/* 
function insertPostData() {
    Post.insertMany([
        {
            title: "Raygun Tools for Performance and Error Monitoring",
            body: "Building web applications is hard. You need to design, debug, and deliver a fast application: on both the client and server side! "
        },{
            title: "Google Flutter From Scratch",
            body: "Flutter is fast becoming one of the most popular frameworks for developing cross-platform mobile apps."
        },{
            title: "Web Accessibility: the Complete Learning Guide",
            body: "Web accessibility (often referred to by its abbreviated “a11y” form) is something many internet users don’t think about,"
        },{
            title: "Web Accessibility With ARIA",
            body: "Using standard HTML alone, modern web apps can lock out users with accessibility needs. "
        },{
            title: "Code Your First API With Node.js and Express",
            body: "If you've spent any amount of time with modern web development, you will have come across terms like REST and API."
        },{
            title: "Get Started With Pusher",
            body: "Real-time communication is a holy grail of web development, and we finally have the ability to incorporate it in our applications, thanks to the Web Sockets API. "
        },{
            title: "WordPress Gutenberg Block API",
            body: "The new WordPress editor (codenamed Gutenberg) is due for release in version 5.0."
        },{
            title: "Regular Expressions With Go",
            body: "In this two-part series  you'll learn what regular expressions are and how to use regular expressions effectively in Go to accomplish many common tasks."
        },{
            title: "Creating an Image Editor Using CamanJS",
            body: "This tutorial will teach you how to create a canvas based image editor using a JavaScript library called CamanJS."
        }
    ])
}
insertPostData();
*/














router.get('/about', (req, res) => {
    res.render('about', {
        currentRoute: '/about'
    });
});

module.exports = router;
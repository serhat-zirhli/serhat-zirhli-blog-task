const express = require('express');
const router = express.Router();
const Post = require('../models/Post');
const User = require('../models/User');
const bcrypt = require('bcrypt')
const jwt = require("jsonwebtoken")

const { body, validationResult } = require('express-validator');

const adminLayout = "../views/layouts/admin";
const jwtSecret = process.env.JWT_SECRET;



//Check Login
const authMiddleware = (req, res, next) => {
    const token = req.cookies.token;
    if (!token) {
        return res.status(401).json({ message: "Unauthorized" })
    }

    try {
        const decoded = jwt.verify(token, jwtSecret);
        req.userId = decoded.userId;
        next();
    } catch (error) {
        res.status(401).json({ message: "Unauthorized" })
    }
}

// GET Admin - Login Page
router.get('/admin', async (req, res) => {


    try {
        const locals = {
            title: "Admin",
            description: "Serhat Zirhli Blog Task"

        }

        res.render('admin/index', { locals });
    } catch (error) {
        console.log(error)
    }

});


// Post Admin - Check Login
router.post('/admin', [
    body('username').not().isEmpty().withMessage('The username cannot be empty'),
    body('password').not().isEmpty().withMessage('The password cannot be empty')
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const alert = errors.array();
        res.render('admin', {
            alert
        })
    } else {

        try {
            const { username, password } = req.body;

            const user = await User.findOne({ username });
            if (!user) {
                return res.status(401).json({ message: "Invalid credentials" });
            }

            const isPasswordvalid = await bcrypt.compare(password, user.password);
            if (!isPasswordvalid) {
                return res.status(401).json({ message: "Invalid Password" })
            }

            const token = jwt.sign({ userId: user._id }, jwtSecret);
            res.cookie('token', token, { httpOnly: true });

            res.redirect('/dashboard');

        } catch (error) {
            console.log(error)
        }
    }

});

// Get Admin - Dashboard
router.get('/dashboard', authMiddleware, async (req, res) => {
    try {
        const locals = {
            title: "Dashboard",
            description: "Serhat Zirhli Blog Task"

        }

        const data = await Post.find();
        res.render('admin/dashboard', {
            locals,
            data,
            layout: adminLayout
        })

    } catch (error) {

    }
});

// Get Admin - Create New Post
router.get('/add-post', authMiddleware, async (req, res) => {
    try {
        const locals = {
            title: "Add Post",
            description: "Serhat Zirhli Blog Task"

        }

        res.render('admin/add-post', {
            locals,
            layout: adminLayout
        })

    } catch (error) {
        console.log(error)
    }
});

// POST Admin - Create New Post
router.post('/add-post', authMiddleware, async (req, res) => {
    
    try {
        try {
            const newPost = new Post({
                title: req.body.title,
                body: req.body.body,
            });

            await Post.create(newPost);
            res.redirect("/dashboard")

        } catch (error) {
            console.log("Error on adding post : ", error);
        }

    } catch (error) {

    }
});

// Get Admin - Bring Edit Post Infos
router.get('/edit-post/:id', authMiddleware, async (req, res) => {
    try {
        const locals = {
            title: "Edit Post",
            description: "Serhat Zirhli Blog Task"

        }

        const data = await Post.findOne({ _id: req.params.id })
        res.render('admin/edit-post', {
            data,
            locals,
            layout: adminLayout
        })

    } catch (error) {
        console.log(error)
    }
});

// Put Admin - Edit Post
router.put('/edit-post/:id', authMiddleware, async (req, res) => {
    try {
        await Post.findByIdAndUpdate(req.params.id, {
            title: req.body.title,
            body: req.body.body,
            updatedAt: Date.now()
        })

        res.redirect(`/dashboard`)

    } catch (error) {
        console.log(error)
    }
});

// Delete Admin - Delete Post
router.delete('/delete-post/:id', authMiddleware, async (req, res) => {
    try {
        await Post.deleteOne({ _id: req.params.id })
        res.redirect('/dashboard')
    } catch (error) {
        console.log(error)
    }
});

// GET Admin - Log Out
router.get('/logout', (req, res) => {
    res.clearCookie('token');
    res.redirect("/")
})

module.exports = router
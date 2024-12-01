// exported
const express = require('express');
const bcrypt = require('bcryptjs');
const { body, validationResult } = require('express-validator');
const router = express.Router();
const userModel = require('../models/UsersModel.js');

// User signup 
router.post('/signup',async(req, res) => {
    // Validate request
    await Promise.all([
        validate_input('username',req),validate_input('email',req),validate_input('password',req)
    ]);
    // validation errors
    const errors = validationResult(req)
    if(!errors.isEmpty()){return res.status(400).json({errors: errors.array()});}

    const { username, email, password } = req.body;
    // Check the username or email already exists
    if(await userModel.findOne({ username: username })){
        return res.status(409).json({ status: false, message: 'Username is already registered.' });
    };
    if (await userModel.findOne({ email: email })) {
        return res.status(409).json({ status: false, message: 'Email is already registered.' });
    };

    // Create user to mongodb 
    try{
        // hash the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash( password, salt);

        const user = new userModel({
            username: username,
            email: email,
            password: hashedPassword,
            created_at: new Date(),
            updated_at: new Date()
        });
        await user.save();
        console.log("created new account");
        return res.status(201).send({ 
            message: "User created successfully.",
            user_id: user._id
         });
    }catch(err){
        console.error('Error during signup:', err);
        return res.status(500).send({
            status: false,
            message: "Invalid Username and password"
        });
    }
});

// User login 
router.post('/login',async(req, res) => {
    try{
        const { username, email, password } = req.body;
        // defind user ac
        const user = await userModel.findOne({ $or: [{ username }, { email }] });
        if (!user){
            return res.status(409).json({ status: false, message: "Username or Email haven't register" });
        };
        // check user password
        const isMatch = await bcrypt.compare(password, user.password);
        if(!isMatch){return res.status(400).json({ status: false, message: "Password is not correct" });}
        res.status(200).send({
            message: "Login successful."
        });
    }catch(err){
        console.error('Error login:', err);
        return res.status(500).send({
            status: false,
            message: "Error logging in"
        });
    }
});

// Export the router
module.exports = router;

// function for check requests
function validate_input(input, req){
    switch (input) {
        case 'username':
            return body('username').notEmpty().withMessage('Username is required').run(req);
        case 'email':
            return body('email').isEmail().withMessage('Please provide a valid email address').run(req);
        case 'password':
            return body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long').run(req);
        default:
            break;
    } 
}
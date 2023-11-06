const express=require("express");
const application_routes= new express.Router();
const passport = require('passport');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const User = require('../schema/UserDataSchema');  
const nodemailer = require('nodemailer');
const crypto = require('crypto');

//_________________________________________________________________________google authentication_______________________________________________________________________________________
application_routes.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
application_routes.get('/auth/google/callback', passport.authenticate('google', { failureRedirect: 'http://localhost:3000' }),//here to the replacement of the failure redirect
  (req, res) => {
    //redirect url has to be updated after frontend development
    res.redirect('http://localhost:3000/#/home');
  });


  application_routes.get("/login/success", (req, res) => {
    if (req.user) {
      res.status(200).json({
        success: true,
        message: "successfull",
        user: req.user,
        cookies: req.cookies
      });
    }
  });
  
  application_routes.get("/login/failed", (req, res) => {
    res.status(401).json({
      success: false,
      message: "failure",
    });
  });
  

application_routes.get("/logout", (req, res) => {
    req.logout(function(err) {
      if (err) {
        console.error(err);
      }
      // Redirect to the login page or another page after logout change this link after deployment of frontend
      res.redirect("http://localhost:3000/login");
    });
  });

//__________________________________________________________________________signin/signup__________________________________________________________________

  application_routes.post('/login', async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
  
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
  
    const isPasswordValid = await bcrypt.compare(password, user.password);
  
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid password' });
    }
  
    const token = jwt.sign({ id: user._id, email: user.email }, '6211eb3e330b634779d6cdc24db7b0e90a17d9');
    res.status(200).json({ token });
  });
  
  application_routes.post('/signup', async (req, res) => {
    try {
      const { name, email, password } = req.body;
      const existingUser = await User.findOne({ email });
  
      if (existingUser) {
        // res.redirect("http://localhost:3000/login");
        return res.status(400).json({ error: 'User already exists' });
      }
      const hashedPassword = await bcrypt.hash(password, 10);
      const user = new User({ name, email, password: hashedPassword });
      await user.save();
  
      const token = jwt.sign({ id: user._id, email: user.email }, '6211eb3e330b634779d6cdc24db7b0e90a17d9');
      res.status(201).json({ token });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  
//__________________________________________________________________________forgot_password_____________________________________________________________________________________________________________
const tokenDatabase = {};

// Function to generate a unique reset token
function generateResetToken() {
  return crypto.randomBytes(20).toString('hex');
}
const transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: 'mntlhlthcrspprt@gmail.com',
    pass: 'hmmk rsnm spuc aynq',
  },
});
// Route to request a password reset
application_routes.post('/api/forgot-password', async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });

  if (!user) {
    return res.status(400).json({ error: 'User not found' });
  }

  // Generate a unique reset token and store it in the tokenDatabase
  const resetToken = generateResetToken();
  tokenDatabase[email] = resetToken;

  // Send a password reset email to the user (configure nodemailer)
  const resetLink = `http://localhost:3000/#/reset-password?token=${resetToken}`;
  const mailOptions = {
    from: 'mntIhIthcrspprt@gmail.com',
    to: email,
    subject: 'Password Reset Request',
    text: `Click the following link to reset your password: ${resetLink}`,
  };
  
  // Send the email
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to send password reset email' });
    } else {
      console.log('Password reset email sent');
      res.status(200).json({ message: 'Password reset email sent successfully' ,token_:resetToken});
    }
  });

  res.status(200).json({ message: 'Password reset email sent successfully',token_:resetToken });
});

// Route to reset the password
application_routes.post('/api/reset-password', async (req, res) => {
  const { email, token, newPassword } = req.body;
  console.log(email+token+newPassword);
  const storedToken = tokenDatabase[email];

  if (!storedToken || storedToken !== token) {
    return res.status(400).json({ error: 'Invalid token' });
  }

  const user = await User.findOne({ email });

  if (!user) {
    return res.status(400).json({ error: 'User not found' });
  }

  // Update the user's password (you should hash the newPassword before saving it)
  user.password = newPassword;
  await user.save();

  // Remove the used reset token from the tokenDatabase
  delete tokenDatabase[email];

  res.status(200).json({ message: 'Password reset successfully' });
});

//______________________________________________________________________________________________________________________________________________________________________________________________________

module.exports = application_routes;
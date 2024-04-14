const express=require("express");
const application_routes= new express.Router();
const passport = require('passport');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const User = require('../schema/UserDataSchema');  
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const axios = require('axios');
//_________________________________________________________________________google authentication_______________________________________________________________________________________


//__________________________________________________________________________signin/signup__________________________________________________________________

  application_routes.post('/login', async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
  
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
  
    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if(user.googleauth){
      return res.status(402).json({ error: 'User May Used Google Authentication For Login in!!' });
    }
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid password' });
    }
  
    const token = jwt.sign({ id: user._id, email: user.email }, '6211eb3e330b634779d6cdc24db7b0e90a17d9');
    res.status(200).json({ token,username: user.name,email:user.email });
  });
  
  application_routes.post('/signup', async (req, res) => {
    try {
      const { name, email, password,googleauth,profilePicture } = req.body;
      const existingUser = await User.findOne({ email });
  
      if (existingUser) {
        // res.redirect("http://localhost:3000/login");
        return res.status(400).json({ error: 'User already exists' });
      }
      const response = await axios.get('https://blockchain-server-4s4u.onrender.com/contract/get-wallet');
      const { address, key } = response.data;
      const hashedPassword = await bcrypt.hash(password, 10);
      const user = new User({ name, email, password: hashedPassword,googleauth,profilePicture,wallet_address:address,private_key:key });
      await user.save();
  
      const token = jwt.sign({ id: user._id, email: user.email }, '6211eb3e330b634779d6cdc24db7b0e90a17d9');
      res.status(201).json({ token,profilePicture });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  application_routes.put('/updateDappAddress', async (req, res) => {
    try {
      const { token, dapp_address } = req.body;
  
      if (!token || !dapp_address) {
        return res.status(400).json({ error: 'Token and dapp_address are required in the request body' });
      }
  
      // Verify the token
      const decoded = jwt.verify(token, '6211eb3e330b634779d6cdc24db7b0e90a17d9'); 
  
      const user = await User.findOne({ email: decoded.email });
  
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      // Update the dapp_address for the user
      user.dapp_address = dapp_address;
      await user.save();
  
      res.status(200).json({ message: 'Dapp address updated successfully' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  
   application_routes.post('/generateToken', async (req, res) => {
    try {
      const { email } = req.body;
  
      if (!email) {
        return res.status(400).json({ error: 'Email is required in the request body' });
      }
  
      const user = await User.findOne({ email });
  
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
  
      // Generate a unique token for the user
      const token = jwt.sign({ email: user.email }, '6211eb3e330b634779d6cdc24db7b0e90a17d9'); 
  
      res.status(200).json({ token });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

 application_routes.get('/users/:email', async (req, res) => {
  try {
    const { email } = req.params;
    const user = await User.find({ email: email }); 
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
  // Update user data
  application_routes.put('/update-users/:email', async (req, res) => {
    try {
      const {email} = req.params;
      const { name, expert, bioData,profilePicture } = req.body;
      const updatedUser = await User.findOneAndUpdate(
        { email: email },
        { $set: { name, expert, bioData ,profilePicture,MFA} },
        { new: true }
      );
  
      if (!updatedUser) {
        return res.status(404).json({ error: 'User not found' });
      }
  
      res.json(updatedUser);
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
  if(user.googleauth){
    return res.status(402).json({ error: 'User May Used Google Authentication For Login in!!' });
  }
  if (!user) {
    return res.status(400).json({ error: 'User not found' });
  }

  // Generate a unique reset token and store it in the tokenDatabase
  const resetToken = generateResetToken();
  tokenDatabase[email] = resetToken;

  // Send a password reset email to the user (configure nodemailer)
  const resetLink = `https://mindwell-connect-frontend.vercel.app/reset-password/token=${resetToken}/email=${email}`;
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
      res.status(200).json({ message: 'Password reset email sent successfully' ,token_:resetToken});
    }
  });

  res.status(200).json({ message: 'Password reset email sent successfully',token_:resetToken });
});

// Route to reset the password
application_routes.post('/api/reset-password', async (req, res) => {
  const { femail,ftoken,newPassword } = req.body;
  const storedToken = tokenDatabase[femail];
  if (!storedToken || storedToken !== ftoken) {
    return res.status(401).json({ error: 'Invalid token' });
  }

  const user = await User.findOne({ femail });

  if (!user) {
    return res.status(400).json({ error: 'User not found' });
  }

  // Update the user's password (you should hash the newPassword before saving it)
  
  const hashedPassword = await bcrypt.hash(newPassword, 10);
  user.password = hashedPassword;
  await user.save();

  // Remove the used reset token from the tokenDatabase
  delete tokenDatabase[femail];

  res.status(200).json({ message: 'Password reset successfully' });
});

//______________________________________________________________________________________________________________________________________________________________________________________________________

module.exports = application_routes;
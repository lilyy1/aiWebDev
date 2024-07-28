const e = require('express');
const { User } = require('../models');
require('dotenv').config({ path: '.env' });

// fucntion to get user profile by requesting user id from the api endpoint
const getUserProfile = async (req, res) => {
  const {id} = req.params;
  try{
    const user = await User.findOne({ where: { userid: id }});
    res.json(user);
  }catch(err){
    res.status(500).json({error: err.message});
  }
};

// function to update user profile by requesting user id from the api endpoint
const updateUserProfile = async (req, res) => {
  const { id } = req.params;
  const { firstname, lastname, email } = req.body;
  try {
    const user = await User.findOne({ where: { userid: id } });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    user.firstname = firstname || user.firstname;
    user.lastname = lastname || user.lastname;
    user.email = email || user.email;

    await user.save();

    res.json(user);
  } catch (err) {
    console.error('Retrieved object is not an instance of User');
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  getUserProfile,
  updateUserProfile
};


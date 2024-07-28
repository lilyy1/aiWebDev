const { Role } = require('../models');

const getAllRoles = async (req, res) => {
  try {
    const roles = await Role.findAll();
    console.log("roles", roles);
    res.status(200).json(roles);
  } catch (error) {
    console.error('Error fetching roles:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  getAllRoles,
};

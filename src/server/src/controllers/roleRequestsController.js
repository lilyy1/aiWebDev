const { RoleRequests, User }  = require('../models');

const getRoleRequests = async (req, res) => {
  try {
    const requests = await RoleRequests.findAll({
      where: { status: 'Pending' },
      include: [
        {
          model: User,
          attributes: ['firstname', 'lastname'],
        },
      ],
    });
    res.json(requests);
  } catch (error) {
    console.error('Error fetching role requests:', error);
    res.status(500).json({ error: 'Error fetching role requests' });
  }
};

const createRoleRequest = async (req, res) => {
  try {
    const { userid } = req.body;
    const newRequest = await RoleRequests.create({ userid });
    res.status(201).json(newRequest);
  } catch (error) {
    console.error('Error creating role request:', error);
    res.status(500).json({ error: 'Error creating role request' });
  }
};

const updateRoleRequest = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  try {
    const request = await RoleRequests.findByPk(id);
    if (request) {
      request.status = status;
      await request.save();

      if (status === 'Approved') {
        const user = await User.findByPk(request.userid); 
        if (user) {
          user.roleid = 3; // Update to the correct role ID
          await user.save();
        }
      }
      res.json(request);
    } else {
      res.status(404).json({ error: 'Role request not found' });
    }
  } catch (error) {
    console.error('Error updating role request:', error);
    res.status(500).json({ error: 'Error updating role request' });
  }
};

module.exports = { getRoleRequests, updateRoleRequest , createRoleRequest};

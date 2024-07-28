const express = require('express');
const { registerUser, loginUser, getCourseIDForUser, getAllStudents , getUserById, updateUser, deleteUser , getAllUsers} = require('../controllers/userController');

const router = express.Router();

router.get('/register', (req, res) => {
    res.send('Register');
});
router.post('/register', registerUser);

router.get('/login', (req, res) => {
    res.send('Login');

});
router.post('/login', loginUser);

router.get('/courseid/:userid', getCourseIDForUser)

router.get('/students', getAllStudents);

router.get('/users/:userid', getUserById);

router.put('/users/:userid', updateUser);

router.delete('/users/:userid', deleteUser);

router.get('/users', getAllUsers);
module.exports = router;
const express = require('express');
const {
    getUsers,
    addUser,
    getUserByID,
    updateUser,
    deleteUser,
} = require('../controllers/users.controller');
// const { deleteUserTodos } = require('../scripts/middleware/deleteTodosByUserId');

const router = express.Router();

/* GET users listing. */
router.get('/users', getUsers);

/* POST Add user. */
router.post('/users', addUser);

/* GET user by ID. */
router.get('/users/:_id', getUserByID);

/* PUT(update) user by ID. */
router.put('/users/:_id', updateUser);

/* DELETE user by ID. */
router.delete('/users/:_id', deleteUser);

router.get('/me', (req, res) => {
    const user = req.user; // This should be populated by the JWT middleware
    if (user) {
      res.json(user);
    } else {
      res.status(401).json({ message: 'Unauthorized' });
    }
  });  

module.exports = router;

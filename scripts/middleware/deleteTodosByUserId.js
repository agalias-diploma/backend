// const Todo = require('../../models/todos');

// const deleteUserTodos = async (req, res, next) => {
//     const { _id } = req.params;
//     console.log(_id);

//     const todos = await Todo.find({ user_id: _id });
//     await Todo.deleteMany({ user_id: _id });
//     console.log(`Quantity of deleted todos: ${todos.length}`);
//     next();
// };

// module.exports = {
//     deleteUserTodos,
// };

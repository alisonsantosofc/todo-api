const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const user = users.find((findUser) => findUser.username === username);

  if (!user) {
    return response.status(400).json({ error: 'There is no user registered with this username' });
  }

  // forward the data
  request.user = user;

  return next();
}

app.post('/users', (request, response) => {
  const { name, username } = request.body;

  const userAlreadyExists = users.some((user) => user.username === username);

  if (!userAlreadyExists) {
    const user = {
      id: uuidv4(),
      name,
      username,
      todos: [],
    };

    users.push(user);

    return response.status(201).json(user);
  } else {
    return response
      .status(400)
      .json({ error: 'There is already a user registered with this username.' });
  }
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request;

  return response.json(user.todos);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { title, deadline } = request.body;

  const todo = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date(),
  };

  user.todos.push(todo);

  return response.status(201).json(todo);
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;
  const { title, deadline } = request.body;

  const todoAlreadyExists = user.todos.some((todo) => todo.id === id);

  if (todoAlreadyExists) {
    const todoIndex = user.todos.findIndex((todo) => todo.id === id);
    user.todos[todoIndex].title = title;
    user.todos[todoIndex].deadline = new Date(deadline);

    return response.status(201).json(user.todos[todoIndex]);
  } else {
    return response.status(404).json({ error: 'Todo does not exists.' });
  }
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;

  const todoAlreadyExists = user.todos.some((todo) => todo.id === id);

  if (todoAlreadyExists) {
    const todoIndex = user.todos.findIndex((todo) => todo.id === id);
    user.todos[todoIndex].done = true;

    return response.status(201).json(user.todos[todoIndex]);
  } else {
    return response.status(404).json({ error: 'Todo does not exists.' });
  }
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;

  const todoAlreadyExists = user.todos.some((todo) => todo.id === id);

  if (todoAlreadyExists) {
    const todoIndex = user.todos.findIndex((todo) => todo.id === id);
    user.todos.splice(todoIndex, 1);

    return response.status(204).send();
  } else {
    return response.status(404).json({ error: 'Todo does not exists.' });
  }
});

module.exports = app;

const express = require('express');
const app = express();
const userModel = require('./models/user');
const cookieParser = require('cookie-parser');
const bcrypt = require('bcrypt');

app.set('view engine', 'ejs');
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.get('/', (req, res) => {
  res.render('index', { message: null, error: null });
});

app.post('/register', async (req, res) => {
  try {
    const { name, username, age, email, password } = req.body;

    if (!email || !password || !username) {
      return res.render('index', { message: null, error: 'Please fill required fields' });
    }

    const existing = await userModel.findOne({ email });
    if (existing) {
      return res.render('index', { message: null, error: 'User already registered' });
    }

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    await userModel.create({
      name,
      username,
      age,
      email,
      password: hash
    });

    return res.render('index', { message: 'User registered successfully', error: null });
  } catch (err) {
    console.error(err);
    return res.render('index', { message: null, error: 'Registration failed' });
  }
});

app.get('/users-count', async (req, res) => {
  try {
    const count = await userModel.countDocuments({});
    const latest = await userModel.find({}, 'username email name age').sort({ _id: -1 }).limit(3);
    res.json({ count, latest });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch users count' });
  }
});

app.get('/users', async (req, res) => {
  try {
    const users = await userModel.find({}, 'username email name age').sort({ _id: -1 });
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Convenience: delete via GET (useful when curl/clients struggle with DELETE/POST)
app.get('/users/delete/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await userModel.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ error: 'User not found' });
    res.json({ message: 'User deleted (GET)', id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

// Delete a user by Mongo _id
app.delete('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await userModel.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ error: 'User not found' });
    res.json({ message: 'User deleted', id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

// Delete a user by email (form-friendly)
app.post('/users/delete', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email required' });
    const result = await userModel.deleteOne({ email });
    if (result.deletedCount === 0) return res.status(404).json({ error: 'User not found' });
    res.json({ message: 'User deleted', email });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

app.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});



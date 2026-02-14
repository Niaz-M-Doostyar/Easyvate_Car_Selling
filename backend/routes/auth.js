const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const config = require('../src/config');
const { verifyToken } = require('../src/middleware/auth');

router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ where: { username, isActive: true } });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });
    
    const isValidPassword = await user.comparePassword(password);
    if (!isValidPassword) return res.status(401).json({ error: 'Invalid credentials' });
    
    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      config.JWT.SECRET,
      { expiresIn: config.JWT.EXPIRES_IN }
    );
    
    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/me', verifyToken, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: ['id', 'username', 'fullName', 'email', 'role', 'isActive'],
    });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/register', verifyToken, async (req, res) => {
  try {
    const { fullName, email, password, role, phoneNumber } = req.body;
    
    // Check if user with email already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: { message: 'User with this email already exists' } });
    }
    
    // Create username from email
    const username = email.split('@')[0];
    
    const user = await User.create({
      fullName,
      email,
      username,
      password,
      role: role || 'Sales',
      phoneNumber,
      isActive: true
    });
    
    res.json({
      success: true,
      data: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        username: user.username,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ error: { message: error.message } });
  }
});

router.put('/users/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { fullName, email, role, isActive, password, phoneNumber } = req.body;
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ error: { message: 'User not found' } });
    }
    const updates = {};
    if (fullName !== undefined) updates.fullName = fullName;
    if (email !== undefined) updates.email = email;
    if (role !== undefined) updates.role = role;
    if (isActive !== undefined) updates.isActive = isActive;
    if (phoneNumber !== undefined) updates.phoneNumber = phoneNumber;
    if (password) updates.password = password;
    await user.update(updates);
    res.json({ success: true, data: { id: user.id, fullName: user.fullName, email: user.email, username: user.username, role: user.role, phoneNumber: user.phoneNumber, isActive: user.isActive } });
  } catch (error) {
    res.status(500).json({ error: { message: error.message } });
  }
});

router.get('/users', verifyToken, async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: ['id', 'username', 'fullName', 'email', 'phoneNumber', 'role', 'isActive', 'createdAt'],
      order: [['createdAt', 'DESC']]
    });
    res.json({ success: true, data: users });
  } catch (error) {
    res.status(500).json({ error: { message: error.message } });
  }
});

router.delete('/users/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Prevent deleting own account
    if (parseInt(id) === req.user.id) {
      return res.status(400).json({ error: { message: 'Cannot delete your own account' } });
    }
    
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ error: { message: 'User not found' } });
    }
    
    await user.destroy();
    res.json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: { message: error.message } });
  }
});

module.exports = { router };

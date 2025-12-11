require('dotenv').config();
const express = require('express');
const path = require('path');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

// ==========================================
// MONGODB CONNECTION
// ==========================================
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('✅ Connected to MongoDB Atlas'))
    .catch(err => console.error('❌ MongoDB Connection Error:', err));

// ==========================================
// USER MODEL
// ==========================================
const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }, // In production, hash this!
    role: { type: String, required: true, enum: ['admin', 'customer', 'rider'] },
    phone: String,
    address: String,
    city: String,
    state: String,
    createdAt: { type: Date, default: Date.now }
});

// Explicitly setting `id` to match the frontend expectations (which uses `id` string)
// MongoDB uses `_id` (ObjectId). We can add a virtual or just use `_id` and map it.
// For simplicity with existing frontend code, let's map `_id` to `id` in toJSON.
userSchema.set('toJSON', {
    virtuals: true,
    versionKey: false,
    transform: function (doc, ret) {
        ret.id = ret._id.toString(); // Ensure ID is a string
        delete ret._id;
        delete ret.password; // Never return password
    }
});

const User = mongoose.model('User', userSchema);

// ==========================================
// ROUTES
// ==========================================

// Login Endpoint
app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        // Find user by email
        const user = await User.findOne({ email }); // Get user WITH password for checking
        
        if (!user || user.password !== password) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        // Return user without password (handled by toJSON transform)
        res.json(user);
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Register Endpoint
// NOTE: Vercel serverless functions have a timeout. MongoDB Atlas is usually fast enough.
app.post('/api/accounts', async (req, res) => {
    try {
        const { email } = req.body;

        // Check availability
        const existing = await User.findOne({ email });
        if (existing) {
            return res.status(409).json({ error: 'Email already registered' });
        }

        // Create new user
        const newUser = new User(req.body);
        await newUser.save();

        res.status(201).json(newUser);
    } catch (err) {
        console.error('Registration error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Get All Users (for Admin/Dashboard)
app.get('/api/accounts', async (req, res) => {
    try {
        const users = await User.find().sort({ createdAt: -1 });
        res.json(users);
    } catch (err) {
        console.error('Fetch users error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// ==========================================
// SERVER START
// ==========================================
const PORT = process.env.PORT || 3000;

// For local development
if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => {
        console.log(`AF Logistics API running on port ${PORT}`);
    });
}

// Export for Vercel serverless
module.exports = app;

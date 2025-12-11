require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');

// ==========================================
// MONGODB CONNECTION
// ==========================================
let cachedDb = null;

async function connectToDatabase() {
    if (cachedDb) {
        return cachedDb;
    }

    const connection = await mongoose.connect(process.env.MONGO_URI);
    cachedDb = connection;
    return cachedDb;
}

// ==========================================
// USER MODEL
// ==========================================
const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, required: true, enum: ['admin', 'customer', 'rider'] },
    phone: String,
    address: String,
    city: String,
    state: String,
    createdAt: { type: Date, default: Date.now }
});

userSchema.set('toJSON', {
    virtuals: true,
    versionKey: false,
    transform: function (doc, ret) {
        ret.id = ret._id.toString();
        delete ret._id;
        delete ret.password;
    }
});

const User = mongoose.models.User || mongoose.model('User', userSchema);

// ==========================================
// SERVERLESS HANDLER
// ==========================================
module.exports = async (req, res) => {
    await connectToDatabase();

    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    const { method, url } = req;

    try {
        // POST /api/login
        if (method === 'POST' && url.includes('/login')) {
            const { email, password } = req.body;
            const user = await User.findOne({ email });

            if (!user || user.password !== password) {
                return res.status(401).json({ error: 'Invalid email or password' });
            }

            return res.json(user);
        }

        // POST /api/accounts (Register)
        if (method === 'POST' && (url === '/api' || url.includes('/accounts'))) {
            const { email } = req.body;
            const existing = await User.findOne({ email });

            if (existing) {
                return res.status(409).json({ error: 'Email already registered' });
            }

            const newUser = new User(req.body);
            await newUser.save();

            return res.status(201).json(newUser);
        }

        // GET /api/accounts
        if (method === 'GET' && (url === '/api' || url.includes('/accounts'))) {
            const users = await User.find().sort({ createdAt: -1 });
            return res.json(users);
        }

        // Default 404
        return res.status(404).json({ error: 'Not found' });
    } catch (error) {
        console.error('API Error:', error);
        return res.status(500).json({ error: 'Server error' });
    }
};

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
// ACCOUNTS ENDPOINT (GET/POST)
// ==========================================
module.exports = async (req, res) => {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    try {
        await connectToDatabase();

        // GET - Return all users
        if (req.method === 'GET') {
            const users = await User.find().sort({ createdAt: -1 });
            return res.json(users);
        }

        // POST - Register new user
        if (req.method === 'POST') {
            const { email, name } = req.body;

            if (!email || !name) {
                return res.status(400).json({ error: 'Email and name required' });
            }

            const existing = await User.findOne({ email });

            if (existing) {
                return res.status(409).json({ error: 'Email already registered' });
            }

            const newUser = new User(req.body);
            await newUser.save();

            return res.status(201).json(newUser);
        }

        return res.status(405).json({ error: 'Method not allowed' });
    } catch (error) {
        console.error('Accounts error:', error);
        return res.status(500).json({ error: 'Server error' });
    }
};

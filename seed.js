require('dotenv').config();
const mongoose = require('mongoose');

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('✅ Connected to MongoDB'))
    .catch(err => {
        console.error('❌ Connection Error:', err);
        process.exit(1);
    });

// User Schema (same as in server.js)
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

const User = mongoose.model('User', userSchema);

// Sample accounts to seed
const sampleAccounts = [
    {
        name: 'Admin User',
        email: 'admin@aflogistics.com',
        password: 'admin123',
        role: 'admin',
        phone: '+234 800 000 0001',
        createdAt: new Date('2025-01-01')
    },
    {
        name: 'John Customer',
        email: 'customer@example.com',
        password: 'customer123',
        role: 'customer',
        phone: '+234 800 000 0002',
        createdAt: new Date('2025-01-02')
    },
    {
        name: 'Mike Rider',
        email: 'rider@example.com',
        password: 'rider123',
        role: 'rider',
        phone: '+234 800 000 0003',
        address: '12 Delivery Lane',
        city: 'Lagos',
        state: 'Lagos',
        createdAt: new Date('2025-01-03')
    }
];

async function seedDatabase() {
    try {
        // Check if accounts already exist
        for (const account of sampleAccounts) {
            const existing = await User.findOne({ email: account.email });
            
            if (existing) {
                console.log(`⚠️  User ${account.email} already exists, skipping...`);
            } else {
                await User.create(account);
                console.log(`✅ Created user: ${account.name} (${account.email})`);
            }
        }
        
        console.log('\n🎉 Database seeding completed!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Seeding error:', error);
        process.exit(1);
    }
}

seedDatabase();

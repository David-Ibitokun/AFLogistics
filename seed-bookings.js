const mongoose = require('mongoose');

// ==========================================
// MONGODB CONNECTION
// ==========================================
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => {
        console.error('MongoDB Connection Error:', err);
        process.exit(1);
    });

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

const User = mongoose.model('User', userSchema);

// ==========================================
// BOOKING MODEL
// ==========================================
const bookingSchema = new mongoose.Schema({
    trackingId: { type: String, required: true, unique: true },
    customerId: { type: String, required: true },
    customerName: { type: String, required: true },
    riderId: { type: String, default: null },
    riderName: { type: String, default: null },
    status: { 
        type: String, 
        required: true,
        enum: ['Pending', 'Confirmed', 'In Transit', 'Delivered', 'Cancelled'],
        default: 'Pending'
    },
    packageType: String,
    packageWeight: Number,
    packageSize: String,
    packageValue: { type: Number, default: 0 },
    packageDescription: String,
    pickupAddress: String,
    pickupCity: String,
    pickupState: String,
    pickupDate: String,
    pickupTime: String,
    deliveryAddress: String,
    deliveryCity: String,
    deliveryState: String,
    deliveryType: { type: String, enum: ['express', 'standard', 'economy'] },
    senderName: String,
    senderPhone: String,
    senderEmail: String,
    receiverName: String,
    receiverPhone: String,
    receiverEmail: String,
    specialInstructions: String,
    price: Number,
    statusHistory: [{ status: String, timestamp: Date, note: String }],
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

const Booking = mongoose.model('Booking', bookingSchema);

// ==========================================
// SEED DEMO BOOKINGS
// ==========================================
async function seedBookings() {
    try {
        // Clear existing bookings
        await Booking.deleteMany({});
        console.log('Cleared existing bookings');

        // Get demo users
        const admin = await User.findOne({ email: 'admin@aflogistics.com' });
        const customer = await User.findOne({ email: 'customer@example.com' });
        const rider = await User.findOne({ email: 'rider@example.com' });

        if (!admin || !customer || !rider) {
            console.error('Demo users not found. Please run seed.js first.');
            process.exit(1);
        }

        const demoBookings = [
            // Recent completed delivery
            {
                trackingId: 'AFL' + Date.now() + '001',
                customerId: customer.id.toString(),
                customerName: customer.name,
                riderId: rider.id.toString(),
                riderName: rider.name,
                status: 'Delivered',
                packageType: 'document',
                packageWeight: 0.5,
                packageSize: 'small',
                packageDescription: 'Legal documents',
                pickupAddress: '15 Marina Road',
                pickupCity: 'Lagos',
                pickupState: 'Lagos',
                pickupDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                pickupTime: '09:00',
                deliveryAddress: '45 Awolowo Road',
                deliveryCity: 'Ikoyi',
                deliveryState: 'Lagos',
                deliveryType: 'express',
                senderName: customer.name,
                senderPhone: '+234 801 234 5678',
                senderEmail: customer.email,
                receiverName: 'John Doe',
                receiverPhone: '+234 802 345 6789',
                price: 3500,
                statusHistory: [
                    { status: 'Pending', timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), note: 'Booking created' },
                    { status: 'Confirmed', timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 3600000), note: `Assigned to rider ${rider.name}` },
                    { status: 'In Transit', timestamp: new Date(Date.now() - 1.5 * 24 * 60 * 60 * 1000), note: 'Package picked up' },
                    { status: 'Delivered', timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), note: 'Delivered successfully' }
                ],
                createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
                updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
            },
            
            // Active delivery in transit
            {
                trackingId: 'AFL' + Date.now() + '002',
                customerId: customer.id.toString(),
                customerName: customer.name,
                riderId: rider.id.toString(),
                riderName: rider.name,
                status: 'In Transit',
                packageType: 'parcel',
                packageWeight: 3,
                packageSize: 'medium',
                packageDescription: 'Electronics',
                pickupAddress: '88 Opebi Road',
                pickupCity: 'Ikeja',
                pickupState: 'Lagos',
                pickupDate: new Date().toISOString().split('T')[0],
                pickupTime: '10:30',
                deliveryAddress: '12 Admiralty Way',
                deliveryCity: 'Lekki',
                deliveryState: 'Lagos',
                deliveryType: 'standard',
                senderName: customer.name,
                senderPhone: '+234 801 234 5678',
                senderEmail: customer.email,
                receiverName: 'Jane Smith',
                receiverPhone: '+234 803 456 7890',
                price: 2000,
                statusHistory: [
                    { status: 'Pending', timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000), note: 'Booking created' },
                    { status: 'Confirmed', timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000), note: `Assigned to rider ${rider.name}` },
                    { status: 'In Transit', timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000), note: 'Package picked up' }
                ],
                createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
                updatedAt: new Date(Date.now() - 1 * 60 * 60 * 1000)
            },

            // Pending booking
            {
                trackingId: 'AFL' + Date.now() + '003',
                customerId: customer.id.toString(),
                customerName: customer.name,
                status: 'Pending',
                packageType: 'package',
                packageWeight: 2,
                packageSize: 'small',
                packageDescription: 'Books',
                pickupAddress: '34 Allen Avenue',
                pickupCity: 'Ikeja',
                pickupState: 'Lagos',
                pickupDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                pickupTime: '14:00',
                deliveryAddress: '56 Ajose Adeogun',
                deliveryCity: 'Victoria Island',
                deliveryState: 'Lagos',
                deliveryType: 'economy',
                senderName: customer.name,
                senderPhone: '+234 801 234 5678',
                senderEmail: customer.email,
                receiverName: 'Mike Johnson',
                receiverPhone: '+234 804 567 8901',
                price: 1200,
                statusHistory: [
                    { status: 'Pending', timestamp: new Date(), note: 'Booking created' }
                ],
                createdAt: new Date(),
                updatedAt: new Date()
            }
        ];

        // Insert bookings
        const savedBookings = await Booking.insertMany(demoBookings);
        console.log(`✅ Successfully seeded ${savedBookings.length} demo bookings`);
        
        process.exit(0);
    } catch (error) {
        console.error('Error seeding bookings:', error);
        process.exit(1);
    }
}

// Run seeding
seedBookings();

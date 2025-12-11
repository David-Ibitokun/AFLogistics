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
    
    // Package Details
    packageType: { type: String, required: true },
    packageWeight: { type: Number, required: true },
    packageSize: { type: String, required: true },
    packageValue: { type: Number, default: 0 },
    packageDescription: { type: String, required: true },
    
    // Pickup Details
    pickupAddress: { type: String, required: true },
    pickupCity: { type: String, required: true },
    pickupState: { type: String, required: true },
    pickupDate: { type: String, required: true },
    pickupTime: { type: String, required: true },
    
    // Delivery Details
    deliveryAddress: { type: String, required: true },
    deliveryCity: { type: String, required: true },
    deliveryState: { type: String, required: true },
    deliveryType: { 
        type: String, 
        required: true,
        enum: ['express', 'standard', 'economy']
    },
    
    // Contact Details
    senderName: { type: String, required: true },
    senderPhone: { type: String, required: true },
    senderEmail: { type: String },
    receiverName: { type: String, required: true },
    receiverPhone: { type: String, required: true },
    receiverEmail: { type: String },
    
    specialInstructions: { type: String, default: '' },
    price: { type: Number, required: true },
    
    statusHistory: [{
        status: String,
        timestamp: Date,
        note: String
    }],
    
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

bookingSchema.set('toJSON', {
    virtuals: true,
    versionKey: false,
    transform: function (doc, ret) {
        ret.id = ret._id.toString();
        delete ret._id;
    }
});

const Booking = mongoose.models.Booking || mongoose.model('Booking', bookingSchema);

// ==========================================
// BOOKINGS API ENDPOINT
// ==========================================
module.exports = async (req, res) => {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    try {
        await connectToDatabase();

        // GET - Fetch bookings (with optional filters)
        if (req.method === 'GET') {
            const { customerId, riderId, trackingId, status } = req.query;
            
            let query = {};
            
            if (customerId) query.customerId = customerId;
            if (riderId) query.riderId = riderId;
            if (trackingId) query.trackingId = trackingId;
            if (status) query.status = status;
            
            const bookings = await Booking.find(query).sort({ createdAt: -1 });
            return res.json(bookings);
        }

        // POST - Create new booking
        if (req.method === 'POST') {
            const bookingData = req.body;
            
            // Ensure tracking ID is unique
            if (bookingData.trackingId) {
                const existing = await Booking.findOne({ trackingId: bookingData.trackingId });
                if (existing) {
                    return res.status(409).json({ error: 'Tracking ID already exists' });
                }
            }
            
            const newBooking = new Booking(bookingData);
            await newBooking.save();
            
            return res.status(201).json(newBooking);
        }

        // PATCH - Update booking (status, assign rider, etc.)
        if (req.method === 'PATCH') {
            const { id } = req.query;
            const updates = req.body;
            
            if (!id) {
                return res.status(400).json({ error: 'Booking ID required' });
            }
            
            // Update the updatedAt timestamp
            updates.updatedAt = new Date();
            
            // If status is being updated, add to history
            if (updates.status) {
                const booking = await Booking.findById(id);
                if (booking) {
                    if (!updates.statusHistory) {
                        updates.statusHistory = booking.statusHistory || [];
                    }
                    updates.statusHistory.push({
                        status: updates.status,
                        timestamp: new Date(),
                        note: updates.statusNote || `Status updated to ${updates.status}`
                    });
                    delete updates.statusNote;
                }
            }
            
            const updatedBooking = await Booking.findByIdAndUpdate(
                id,
                { $set: updates },
                { new: true, runValidators: true }
            );
            
            if (!updatedBooking) {
                return res.status(404).json({ error: 'Booking not found' });
            }
            
            return res.json(updatedBooking);
        }

        return res.status(405).json({ error: 'Method not allowed' });
        
    } catch (error) {
        console.error('Bookings API Error:', error);
        return res.status(500).json({ error: 'Server error', details: error.message });
    }
};

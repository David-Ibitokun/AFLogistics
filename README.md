# AF Logistics 🚚

A modern, full-stack logistics management system with role-based dashboards, real-time tracking, and MongoDB Atlas integration for seamless package delivery management.

## ✨ Features

### Multi-Role Dashboard System

- **Admin Dashboard**: Complete system oversight with user management, booking management, rider assignment, and analytics
- **Customer Dashboard**: Book deliveries, track packages, view booking history, and manage account
- **Rider Dashboard**: View assigned deliveries, update delivery status, manage routes, and track earnings

### Package Management

- **Smart Booking System**: Comprehensive booking form with package details, pickup/delivery information, and pricing
- **Real-time Tracking**: Track packages using unique tracking IDs with status history
- **Status Management**: Track delivery progress through multiple states (Pending, Confirmed, In Transit, Delivered, Cancelled)
- **Rider Assignment**: Admin can assign riders to bookings dynamically

### User Authentication & Security

- Role-based access control (Admin, Customer, Rider)
- Secure login and registration system
- MongoDB-backed user management
- Session persistence with localStorage

### Database Integration

- MongoDB Atlas cloud database
- Mongoose ODM for data modeling
- RESTful API architecture
- Automatic schema validation

## 🛠️ Tech Stack

### Frontend

- **HTML5**: Semantic markup
- **CSS3**: Modern styling with animations and responsive design
- **JavaScript (ES6+)**: Vanilla JavaScript for dynamic interactions
- **Font Awesome 6.4.0**: Icon library

### Backend

- **Node.js**: Runtime environment
- **Express.js 5.2.1**: Web framework
- **MongoDB**: NoSQL database
- **Mongoose 9.0.1**: MongoDB ODM

### Additional Libraries

- **CORS 2.8.5**: Cross-Origin Resource Sharing
- **dotenv 17.2.3**: Environment variable management

## 📦 Installation

### Prerequisites

- Node.js (v14 or higher)
- MongoDB Atlas account
- npm or yarn package manager

### Setup Instructions

1. **Clone the repository**

   ```bash
   git clone https://github.com/David-Ibitokun/AFLogistics.git
   cd AFLogistics
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Environment Configuration**

   Create a `.env` file in the root directory with the following:

   ```env
   MONGO_URI=your_mongodb_atlas_connection_string
   PORT=3000
   ```

   **MongoDB Atlas Setup:**

   - Create a free account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
   - Create a new cluster
   - Get your connection string and replace `your_mongodb_atlas_connection_string`
   - Ensure your IP address is whitelisted in MongoDB Atlas Network Access

4. **Seed the Database** (Optional)

   Populate with sample accounts:

   ```bash
   node seed.js
   ```

   Add sample bookings:

   ```bash
   node seed-bookings.js
   ```

5. **Start the Server**

   ```bash
   npm start
   # or
   node server.js
   ```

6. **Access the Application**

   Open your browser and navigate to:

   ```
   http://localhost:3000
   ```

## 👥 Demo Accounts

Use these credentials to test different user roles:

| Role     | Email                 | Password    |
| -------- | --------------------- | ----------- |
| Admin    | admin@aflogistics.com | admin123    |
| Customer | customer@example.com  | customer123 |
| Rider    | rider@example.com     | rider123    |

## 📁 Project Structure

```
AFLogistics/
├── api/                          # API endpoints
│   ├── accounts.js              # User management API
│   ├── bookings.js              # Booking management API
│   ├── index.js                 # API index/router
│   └── login.js                 # Login API
├── node_modules/                # Dependencies
├── .env                         # Environment variables (create this)
├── .gitignore                   # Git ignore rules
├── accounts.json                # Sample accounts data
├── admin-dashboard.html         # Admin interface
├── admin-dashboard.js           # Admin dashboard logic
├── auth.css                     # Authentication page styles
├── auth.js                      # Authentication logic
├── booking.css                  # Booking page styles
├── booking.html                 # Booking interface
├── booking.js                   # Booking form logic
├── customer-dashboard.html      # Customer interface
├── customer-dashboard.js        # Customer dashboard logic
├── dashboard.css                # Dashboard styles
├── favicon.png                  # Site favicon
├── home.css                     # Homepage styles
├── home.js                      # Homepage logic
├── index.html                   # Landing page
├── login.html                   # Login page
├── package.json                 # Project dependencies
├── package-lock.json            # Dependency lock file
├── README.md                    # This file
├── register.html                # Registration page
├── rider-dashboard.html         # Rider interface
├── rider-dashboard.js           # Rider dashboard logic
├── seed.js                      # Database seeding (accounts)
├── seed-bookings.js             # Database seeding (bookings)
├── server.js                    # Express server & main routes
├── test_auth.js                 # Authentication testing
├── tracking.css                 # Tracking page styles
├── tracking.html                # Package tracking interface
└── tracking.js                  # Tracking logic
```

## 🔌 API Documentation

### Authentication

#### Login

```http
POST /api/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:** User object (without password)

### User Management

#### Get All Users

```http
GET /api/accounts
```

**Response:** Array of user objects

#### Register New User

```http
POST /api/accounts
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "customer",
  "phone": "+1234567890",
  "address": "123 Main St",
  "city": "Lagos",
  "state": "Lagos"
}
```

**Response:** Created user object (201)

### Booking Management

#### Get Bookings

```http
GET /api/bookings?customerId={id}&riderId={id}&trackingId={id}&status={status}
```

**Query Parameters:**

- `customerId` (optional): Filter by customer
- `riderId` (optional): Filter by assigned rider
- `trackingId` (optional): Get specific booking
- `status` (optional): Filter by status

**Response:** Array of booking objects

#### Create Booking

```http
POST /api/bookings
Content-Type: application/json

{
  "trackingId": "AF-2024-001234",
  "customerId": "user_id",
  "customerName": "John Doe",
  "packageType": "Electronics",
  "packageWeight": 2.5,
  "packageSize": "medium",
  "packageDescription": "Laptop",
  "pickupAddress": "123 Main St",
  "pickupCity": "Lagos",
  "pickupState": "Lagos",
  "pickupDate": "2024-12-15",
  "pickupTime": "10:00",
  "deliveryAddress": "456 Park Ave",
  "deliveryCity": "Abuja",
  "deliveryState": "FCT",
  "deliveryType": "express",
  "senderName": "John Doe",
  "senderPhone": "+234800000000",
  "receiverName": "Jane Smith",
  "receiverPhone": "+234800000001",
  "price": 5000
}
```

**Response:** Created booking object (201)

#### Update Booking

```http
PATCH /api/bookings?id={booking_id}
Content-Type: application/json

{
  "status": "In Transit",
  "riderId": "rider_id",
  "riderName": "Mike Wilson"
}
```

**Response:** Updated booking object

## 🌐 Deployment

### Deploy to Vercel

1. **Push to GitHub**

   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. **Import to Vercel**

   - Go to [Vercel](https://vercel.com)
   - Import your GitHub repository
   - Configure project settings

3. **Environment Variables**

   Add in Vercel dashboard:

   - `MONGO_URI`: Your MongoDB Atlas connection string
   - `PORT`: 3000 (optional)

4. **Deploy**

   Vercel will automatically deploy your application

## 🎯 Usage

### For Customers

1. Register an account or login
2. Navigate to "Book Now" to create a delivery
3. Fill in package details and delivery information
4. Submit and receive a tracking ID
5. Use "Track Order" to monitor your delivery

### For Riders

1. Login with rider credentials
2. View assigned deliveries in the dashboard
3. Update delivery status as you progress
4. Complete deliveries and manage your schedule

### For Admins

1. Login with admin credentials
2. View all bookings and users
3. Assign riders to pending bookings
4. Monitor system-wide statistics
5. Manage user accounts

## 🔒 Security

- Environment variables for sensitive configuration
- CORS enabled for API security
- Role-based access control
- MongoDB Atlas built-in security features
- Password validation (Note: In production, implement password hashing)

## 🚀 Future Enhancements

- [ ] Password hashing (bcrypt)
- [ ] JWT-based authentication
- [ ] Email notifications
- [ ] SMS notifications for delivery updates
- [ ] Payment gateway integration
- [ ] Advanced analytics dashboard
- [ ] Mobile application
- [ ] Geolocation tracking for real-time rider position

## 📄 License

This project is licensed under the ISC License.

## 👨‍💻 Author

**David Ibitokun**

- GitHub: [@David-Ibitokun](https://github.com/David-Ibitokun)
- Project Repository: [AFLogistics](https://github.com/David-Ibitokun/AFLogistics)

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📞 Support

For support and inquiries:

- **Email**: support@aflogistics.com
- **Phone**: +234 800 123 4567
- **Address**: 123 Logistics Street, Lagos, Nigeria

---

**Built with ❤️ for seamless logistics management**

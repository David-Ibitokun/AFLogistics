# AF Logistics - Technical Documentation

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Database Schema](#database-schema)
3. [API Reference](#api-reference)
4. [Frontend Architecture](#frontend-architecture)
5. [Authentication Flow](#authentication-flow)
6. [Booking Workflow](#booking-workflow)
7. [Development Guidelines](#development-guidelines)
8. [Testing](#testing)
9. [Deployment](#deployment)
10. [Troubleshooting](#troubleshooting)

---

## Architecture Overview

### System Architecture

AF Logistics follows a **client-server architecture** with the following components:

```
┌─────────────────────────────────────────────────────────┐
│                     Client Layer                         │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐              │
│  │  Admin   │  │ Customer │  │  Rider   │              │
│  │Dashboard │  │Dashboard │  │Dashboard │              │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘              │
└───────┼─────────────┼─────────────┼────────────────────┘
        │             │             │
        └─────────────┼─────────────┘
                      │
        ┌─────────────▼─────────────┐
        │    Express.js Server      │
        │   (Node.js Runtime)       │
        │                           │
        │  ┌──────────────────┐    │
        │  │  API Routes      │    │
        │  │  - /api/login    │    │
        │  │  - /api/accounts │    │
        │  │  - /api/bookings │    │
        │  └──────────────────┘    │
        └─────────────┬─────────────┘
                      │
        ┌─────────────▼─────────────┐
        │    MongoDB Atlas          │
        │   (Cloud Database)        │
        │                           │
        │  ┌──────────────────┐    │
        │  │  Collections:    │    │
        │  │  - users         │    │
        │  │  - bookings      │    │
        │  └──────────────────┘    │
        └───────────────────────────┘
```

### Technology Stack

| Layer        | Technology                   | Purpose                         |
| ------------ | ---------------------------- | ------------------------------- |
| **Frontend** | HTML5, CSS3, JavaScript ES6+ | User interface and interactions |
| **Backend**  | Node.js + Express.js 5.2.1   | Server and API endpoints        |
| **Database** | MongoDB Atlas                | Cloud-based NoSQL database      |
| **ODM**      | Mongoose 9.0.1               | Object-Document Mapping         |
| **CORS**     | cors 2.8.5                   | Cross-Origin Resource Sharing   |
| **Config**   | dotenv 17.2.3                | Environment variable management |

---

## Database Schema

### User Collection

**Collection Name:** `users`

**Schema:**

```javascript
{
  _id: ObjectId,           // MongoDB auto-generated ID
  name: String,            // Required
  email: String,           // Required, Unique index
  password: String,        // Required (plaintext - should be hashed in production)
  role: String,            // Required, enum: ['admin', 'customer', 'rider']
  phone: String,           // Optional
  address: String,         // Optional
  city: String,            // Optional
  state: String,           // Optional
  createdAt: Date          // Default: Date.now
}
```

**Indexes:**

- `email`: Unique index for fast lookup and duplicate prevention

**toJSON Transform:**

- Maps `_id` to `id` (string)
- Removes `password` field from responses
- Removes `_id` and `__v` fields

**Example Document:**

```json
{
  "id": "507f1f77bcf86cd799439011",
  "name": "John Doe",
  "email": "john.doe@example.com",
  "role": "customer",
  "phone": "+2348012345678",
  "address": "123 Main Street",
  "city": "Lagos",
  "state": "Lagos",
  "createdAt": "2024-12-11T09:00:00.000Z"
}
```

---

### Booking Collection

**Collection Name:** `bookings`

**Schema:**

```javascript
{
  _id: ObjectId,                    // MongoDB auto-generated ID
  trackingId: String,               // Required, Unique (e.g., "AF-2024-001234")
  customerId: String,               // Required (user._id)
  customerName: String,             // Required
  riderId: String,                  // Optional (user._id of assigned rider)
  riderName: String,                // Optional

  // Status Management
  status: String,                   // Required, enum: ['Pending', 'Confirmed', 'In Transit', 'Delivered', 'Cancelled']

  // Package Details
  packageType: String,              // Required (e.g., "Electronics", "Documents")
  packageWeight: Number,            // Required (in kg)
  packageSize: String,              // Required (e.g., "small", "medium", "large")
  packageValue: Number,             // Optional (monetary value)
  packageDescription: String,       // Required

  // Pickup Information
  pickupAddress: String,            // Required
  pickupCity: String,               // Required
  pickupState: String,              // Required
  pickupDate: String,               // Required (YYYY-MM-DD)
  pickupTime: String,               // Required (HH:MM)

  // Delivery Information
  deliveryAddress: String,          // Required
  deliveryCity: String,             // Required
  deliveryState: String,            // Required
  deliveryType: String,             // Required, enum: ['express', 'standard', 'economy']

  // Contact Details
  senderName: String,               // Required
  senderPhone: String,              // Required
  senderEmail: String,              // Optional
  receiverName: String,             // Required
  receiverPhone: String,            // Required
  receiverEmail: String,            // Optional

  specialInstructions: String,      // Optional
  price: Number,                    // Required (in local currency)

  // Status History
  statusHistory: [{
    status: String,
    timestamp: Date,
    note: String
  }],

  createdAt: Date,                  // Default: Date.now
  updatedAt: Date                   // Default: Date.now
}
```

**Indexes:**

- `trackingId`: Unique index for fast lookup
- `customerId`: Index for customer bookings query
- `riderId`: Index for rider assignments

**Status Workflow:**

```
Pending → Confirmed → In Transit → Delivered
   ↓
Cancelled (can happen at any stage)
```

---

## API Reference

### Base URL

**Local Development:** `http://localhost:3000`  
**Production:** `https://your-domain.vercel.app`

### Authentication Endpoints

#### POST /api/login

**Description:** Authenticate user and return user object

**Request:**

```http
POST /api/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

**Success Response (200):**

```json
{
  "id": "507f1f77bcf86cd799439011",
  "name": "John Doe",
  "email": "user@example.com",
  "role": "customer",
  "phone": "+2348012345678",
  "createdAt": "2024-12-11T09:00:00.000Z"
}
```

**Error Response (401):**

```json
{
  "error": "Invalid email or password"
}
```

---

### User Management Endpoints

#### GET /api/accounts

**Description:** Retrieve all users (admin function)

**Request:**

```http
GET /api/accounts
```

**Success Response (200):**

```json
[
  {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "user@example.com",
    "role": "customer",
    "createdAt": "2024-12-11T09:00:00.000Z"
  }
]
```

#### POST /api/accounts

**Description:** Register new user

**Request:**

```http
POST /api/accounts
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securepass123",
  "role": "customer",
  "phone": "+2348012345678",
  "address": "123 Main St",
  "city": "Lagos",
  "state": "Lagos"
}
```

**Success Response (201):**

```json
{
  "id": "507f1f77bcf86cd799439011",
  "name": "John Doe",
  "email": "john@example.com",
  "role": "customer",
  "createdAt": "2024-12-11T09:00:00.000Z"
}
```

**Error Response (409):**

```json
{
  "error": "Email already registered"
}
```

---

### Booking Management Endpoints

#### GET /api/bookings

**Description:** Fetch bookings with optional filters

**Query Parameters:**

- `customerId` (optional): Filter by customer
- `riderId` (optional): Filter by rider
- `trackingId` (optional): Get specific booking
- `status` (optional): Filter by status

**Request Examples:**

```http
GET /api/bookings
GET /api/bookings?customerId=507f1f77bcf86cd799439011
GET /api/bookings?riderId=507f1f77bcf86cd799439012
GET /api/bookings?trackingId=AF-2024-001234
GET /api/bookings?status=Pending
```

**Success Response (200):**

```json
[
  {
    "id": "507f191e810c19729de860ea",
    "trackingId": "AF-2024-001234",
    "customerId": "507f1f77bcf86cd799439011",
    "customerName": "John Doe",
    "status": "Pending",
    "packageType": "Electronics",
    "packageWeight": 2.5,
    "price": 5000,
    "createdAt": "2024-12-11T09:00:00.000Z"
  }
]
```

#### POST /api/bookings

**Description:** Create new booking

**Request:**

```http
POST /api/bookings
Content-Type: application/json

{
  "trackingId": "AF-2024-001234",
  "customerId": "507f1f77bcf86cd799439011",
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
  "senderPhone": "+2348012345678",
  "receiverName": "Jane Smith",
  "receiverPhone": "+2348087654321",
  "price": 5000
}
```

**Success Response (201):**

```json
{
  "id": "507f191e810c19729de860ea",
  "trackingId": "AF-2024-001234",
  "status": "Pending",
  "createdAt": "2024-12-11T09:00:00.000Z"
}
```

**Error Response (409):**

```json
{
  "error": "Tracking ID already exists"
}
```

#### PATCH /api/bookings?id={booking_id}

**Description:** Update booking (assign rider, change status, etc.)

**Request:**

```http
PATCH /api/bookings?id=507f191e810c19729de860ea
Content-Type: application/json

{
  "status": "In Transit",
  "riderId": "507f1f77bcf86cd799439012",
  "riderName": "Mike Wilson"
}
```

**Success Response (200):**

```json
{
  "id": "507f191e810c19729de860ea",
  "trackingId": "AF-2024-001234",
  "status": "In Transit",
  "riderId": "507f1f77bcf86cd799439012",
  "riderName": "Mike Wilson",
  "statusHistory": [
    {
      "status": "In Transit",
      "timestamp": "2024-12-11T10:00:00.000Z",
      "note": "Status updated to In Transit"
    }
  ],
  "updatedAt": "2024-12-11T10:00:00.000Z"
}
```

**Error Response (404):**

```json
{
  "error": "Booking not found"
}
```

---

## Frontend Architecture

### File Structure

```
Frontend/
├── HTML Pages
│   ├── index.html              # Landing page
│   ├── login.html              # Login page
│   ├── register.html           # Registration page
│   ├── booking.html            # Booking form
│   ├── tracking.html           # Package tracking
│   ├── customer-dashboard.html # Customer interface
│   ├── rider-dashboard.html    # Rider interface
│   └── admin-dashboard.html    # Admin interface
│
├── JavaScript Files
│   ├── home.js                 # Landing page logic
│   ├── auth.js                 # Login/register logic
│   ├── booking.js              # Booking form logic
│   ├── tracking.js             # Tracking logic
│   ├── customer-dashboard.js   # Customer dashboard logic
│   ├── rider-dashboard.js      # Rider dashboard logic
│   └── admin-dashboard.js      # Admin dashboard logic
│
└── CSS Files
    ├── home.css                # Landing page styles
    ├── auth.css                # Login/register styles
    ├── booking.css             # Booking form styles
    ├── tracking.css            # Tracking page styles
    └── dashboard.css           # Dashboard styles
```

### State Management

**LocalStorage Keys:**

```javascript
{
  "currentUser": {             // Stored after login
    "id": "string",
    "name": "string",
    "email": "string",
    "role": "string"
  }
}
```

### Common JavaScript Patterns

**API Request Pattern:**

```javascript
async function apiRequest(endpoint, method = "GET", data = null) {
  const options = {
    method,
    headers: { "Content-Type": "application/json" },
  };

  if (data) {
    options.body = JSON.stringify(data);
  }

  const response = await fetch(`/api/${endpoint}`, options);
  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.error || "Request failed");
  }

  return result;
}
```

**Authentication Check:**

```javascript
function checkAuth() {
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));

  if (!currentUser) {
    window.location.href = "login.html";
    return null;
  }

  return currentUser;
}
```

---

## Authentication Flow

```
┌──────────────┐
│ User visits  │
│  login.html  │
└──────┬───────┘
       │
       ▼
┌──────────────────┐
│ Enter email &    │
│ password         │
└──────┬───────────┘
       │
       ▼
┌──────────────────┐
│ POST /api/login  │
└──────┬───────────┘
       │
       ├─── Success ──────┐
       │                  ▼
       │         ┌────────────────┐
       │         │ Store user in  │
       │         │ localStorage   │
       │         └────────┬───────┘
       │                  │
       │                  ▼
       │         ┌────────────────┐
       │         │ Redirect based │
       │         │ on role        │
       │         └────────┬───────┘
       │                  │
       │         ┌────────┴────────┬────────────┐
       │         ▼                 ▼            ▼
       │    ┌─────────┐    ┌──────────┐  ┌──────────┐
       │    │  Admin  │    │ Customer │  │  Rider   │
       │    │Dashboard│    │Dashboard │  │Dashboard │
       │    └─────────┘    └──────────┘  └──────────┘
       │
       └─── Error ────────┐
                          ▼
                 ┌────────────────┐
                 │ Show error     │
                 │ message        │
                 └────────────────┘
```

---

## Booking Workflow

### Customer Creates Booking

```
┌──────────────────┐
│ Customer fills   │
│ booking form     │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ Generate unique  │
│ tracking ID      │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ POST /api/       │
│ bookings         │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ Booking created  │
│ Status: Pending  │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ Display tracking │
│ ID to customer   │
└──────────────────┘
```

### Admin Assigns Rider

```
┌──────────────────┐
│ Admin views      │
│ pending bookings │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ Select booking & │
│ assign rider     │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ PATCH /api/      │
│ bookings?id=xxx  │
│ {riderId, status}│
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ Booking updated  │
│ Status: Confirmed│
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ Rider sees in    │
│ their dashboard  │
└──────────────────┘
```

### Status Updates

```
Pending → Confirmed → In Transit → Delivered
  │
  └──→ Cancelled
```

Each status change:

1. Updates `status` field
2. Adds entry to `statusHistory` array
3. Updates `updatedAt` timestamp

---

## Development Guidelines

### Code Style

**JavaScript:**

- Use `const` and `let`, avoid `var`
- Use async/await for asynchronous operations
- Use template literals for string interpolation
- Add error handling with try-catch blocks

**CSS:**

- Use CSS custom properties for theming
- Mobile-first responsive design
- Follow BEM naming convention where applicable

### API Error Handling

All API endpoints should return consistent error responses:

```javascript
{
  "error": "Human-readable error message"
}
```

**HTTP Status Codes:**

- `200`: Success (GET, PATCH)
- `201`: Created (POST)
- `400`: Bad Request
- `401`: Unauthorized
- `404`: Not Found
- `409`: Conflict (duplicate)
- `500`: Server Error

### Security Best Practices

**Current Implementation:**

- ⚠️ Passwords stored in **plaintext** (development only)
- ✅ CORS enabled
- ✅ Input validation on required fields
- ✅ Unique constraints on email and trackingId

**Production Recommendations:**

1. **Hash passwords** using bcrypt
2. Implement **JWT tokens** for authentication
3. Add **rate limiting** on API endpoints
4. Use **HTTPS** only
5. Sanitize user inputs to prevent injection
6. Add **password strength** validation

---

## Testing

### Manual Testing Checklist

**Authentication:**

- [ ] Login with valid credentials
- [ ] Login with invalid credentials
- [ ] Register new user
- [ ] Register with existing email
- [ ] Logout functionality

**Booking:**

- [ ] Create new booking
- [ ] Create booking with duplicate tracking ID
- [ ] View booking list
- [ ] Filter bookings by customer
- [ ] Filter bookings by rider
- [ ] Track booking by ID

**Dashboard:**

- [ ] Admin can view all bookings
- [ ] Admin can assign riders
- [ ] Customer can view their bookings
- [ ] Rider can view assigned bookings
- [ ] Rider can update status

### Test Accounts

Use `seed.js` to create test accounts:

```bash
node seed.js
```

### API Testing with cURL

**Login:**

```bash
curl -X POST http://localhost:3000/api/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@aflogistics.com","password":"admin123"}'
```

**Create Booking:**

```bash
curl -X POST http://localhost:3000/api/bookings \
  -H "Content-Type: application/json" \
  -d '{
    "trackingId": "AF-TEST-001",
    "customerId": "123",
    "customerName": "Test User",
    "packageType": "Test",
    "packageWeight": 1,
    "packageSize": "small",
    "packageDescription": "Test package",
    "price": 1000
  }'
```

---

## Deployment

### Environment Variables

Required environment variables:

```env
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/dbname
PORT=3000
NODE_ENV=production  # Optional, for production mode
```

### Vercel Deployment

1. **Connect Repository:**

   - Import project from GitHub
   - Select repository

2. **Configure Build:**

   - Build Command: (leave empty)
   - Output Directory: (leave empty)
   - Install Command: `npm install`

3. **Environment Variables:**

   - Add `MONGO_URI` in Vercel dashboard
   - Copy from `.env` file

4. **Deploy:**
   - Click "Deploy"
   - Vercel will deploy automatically

### MongoDB Atlas Setup

1. Create free tier cluster
2. Configure network access (allow all: `0.0.0.0/0`)
3. Create database user
4. Get connection string
5. Replace placeholder values

---

## Troubleshooting

### Common Issues

**Problem:** "MongoDB Connection Error"

**Solution:**

1. Check `MONGO_URI` in `.env`
2. Verify IP whitelist in MongoDB Atlas
3. Ensure database user credentials are correct

---

**Problem:** "CORS Error"

**Solution:**

- Ensure `cors` middleware is enabled in `server.js`
- Check that API requests use correct origin

---

**Problem:** "Cannot find module 'express'"

**Solution:**

```bash
npm install
```

---

**Problem:** "Port 3000 already in use"

**Solution:**

```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Mac/Linux
lsof -ti:3000 | xargs kill
```

---

**Problem:** "User not redirecting after login"

**Solution:**

- Check browser console for errors
- Verify `localStorage` is not disabled
- Ensure role is correctly set in database

---

## Additional Resources

- [Express.js Documentation](https://expressjs.com/)
- [MongoDB Manual](https://docs.mongodb.com/)
- [Mongoose Guide](https://mongoosejs.com/docs/guide.html)
- [Vercel Documentation](https://vercel.com/docs)

---

**Last Updated:** December 11, 2024  
**Version:** 1.0.0  
**Maintained by:** David Ibitokun

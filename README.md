# AF Logistics

A modern, full-stack logistics management system built with Node.js, Express, and MongoDB.

## 🚀 Features

- **User Authentication**: Secure login and registration system with role-based access (Admin, Customer, Rider)
- **Real-time Tracking**: Track package deliveries with status updates
- **Dashboard System**:
  - Admin dashboard for system management
  - Customer dashboard for booking and tracking
  - Rider dashboard for delivery management
- **Booking System**: Easy-to-use interface for scheduling deliveries
- **MongoDB Integration**: Cloud-based database using MongoDB Atlas
- **Responsive Design**: Works seamlessly on desktop and mobile devices

## 🛠️ Tech Stack

- **Frontend**: HTML, CSS, JavaScript
- **Backend**: Node.js, Express.js
- **Database**: MongoDB Atlas
- **Authentication**: Custom JWT-based system

## 📦 Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/David-Ibitokun/AFLogistics.git
   cd AFLogistics
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env` file in the root directory:

   ```
   MONGO_URI=your_mongodb_connection_string
   PORT=3000
   ```

4. **Seed the database** (optional)

   ```bash
   node seed.js
   ```

5. **Start the server**

   ```bash
   node server.js
   ```

6. **Access the application**
   Open your browser and navigate to `http://localhost:3000`

## 👥 Demo Accounts

Use these credentials to test the system:

- **Admin**: admin@aflogistics.com / admin123
- **Customer**: customer@example.com / customer123
- **Rider**: rider@example.com / rider123

## 🌐 Deployment

### Deploying to Vercel

1. Push your code to GitHub
2. Import your repository in Vercel
3. Add environment variable in Vercel:
   - `MONGO_URI`: Your MongoDB Atlas connection string
4. Deploy!

## 📁 Project Structure

```
AFLogistics/
├── index.html           # Landing page
├── login.html          # Login page
├── register.html       # Registration page
├── booking.html        # Booking interface
├── tracking.html       # Package tracking
├── *-dashboard.html    # Role-specific dashboards
├── server.js           # Express server
├── auth.js             # Authentication logic
├── seed.js             # Database seeding script
└── *.css               # Stylesheets
```

## 🔒 Security

- Passwords are stored securely in MongoDB
- Environment variables for sensitive data
- CORS enabled for API security

## 📝 License

This project is licensed under the MIT License.

## 👨‍💻 Author

**David Ibitokun**

- GitHub: [@David-Ibitokun](https://github.com/David-Ibitokun)

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

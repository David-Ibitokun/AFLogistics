// ==========================================
// AF LOGISTICS - CUSTOMER DASHBOARD
// Customer Portal Functionality
// ==========================================

document.addEventListener('DOMContentLoaded', function() {
    
    // ==========================================
    // CHECK AUTHENTICATION
    // ==========================================
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    
    if (!currentUser || currentUser.role !== 'customer') {
        console.log('%c⚠️ Unauthorized Access - Redirecting to Login', 'color: #FF9800; font-weight: bold;');
        window.location.href = 'login.html';
        return;
    }

    console.log('%c✅ Customer Authenticated:', 'color: #0A9E4B; font-weight: bold;');
    console.log('   Name:', currentUser.name);
    console.log('   Email:', currentUser.email);

    // ==========================================
    // INITIALIZE USER INTERFACE
    // ==========================================
    function initializeUI() {
        // Update user name in sidebar
        document.getElementById('userName').textContent = currentUser.name;
        
        // Update profile section
        document.getElementById('profileName').textContent = currentUser.name;
        document.getElementById('profileEmail').textContent = currentUser.email;
        document.getElementById('detailEmail').textContent = currentUser.email;
        document.getElementById('detailPhone').textContent = currentUser.phone || 'Not provided';
        document.getElementById('detailCustomerId').textContent = currentUser.id;
        
        if (currentUser && currentUser.createdAt) {
            const joinDate = new Date(currentUser.createdAt);
            document.getElementById('detailJoinDate').textContent = joinDate.toLocaleDateString('en-US', {
                month: 'long',
                year: 'numeric'
            });
        }
    }

    // Helper function to fetch bookings from API
    async function fetchBookings(filters = {}) {
        try {
            const params = new URLSearchParams(filters);
            const url = `/api/bookings${params.toString() ? '?' + params.toString() : ''}`;
            const res = await fetch(url);
            if (res.ok) {
                return await res.json();
            }
            console.error('Failed to fetch bookings');
            return [];
        } catch (error) {
            console.error('Error fetching bookings:', error);
            return [];
        }
    }

    initializeUI();

    // ==========================================
    // LOAD DASHBOARD STATISTICS
    // ==========================================
    async function loadDashboardStats() {
        const bookings = await fetchBookings({ customerId: currentUser.id });
        const userBookings = bookings.filter(b => b.customerId === currentUser.id);

        // Calculate statistics
        const totalBookings = userBookings.length;
        const pendingDeliveries = userBookings.filter(b => 
            b.status !== 'Delivered'
        ).length;
        const completedDeliveries = userBookings.filter(b => 
            b.status === 'Delivered'
        ).length;
        const totalSpent = userBookings.reduce((sum, b) => sum + (b.price || 0), 0);

        // Update dashboard stats
        document.getElementById('totalBookings').textContent = totalBookings;
        document.getElementById('pendingDeliveries').textContent = pendingDeliveries;
        document.getElementById('completedDeliveries').textContent = completedDeliveries;
        document.getElementById('totalSpent').textContent = '₦' + totalSpent.toLocaleString();

        // Update profile stats
        document.getElementById('profileTotalBookings').textContent = totalBookings;
        document.getElementById('profileCompleted').textContent = completedDeliveries;
        document.getElementById('profileTotalSpent').textContent = '₦' + totalSpent.toLocaleString();
    }

    loadDashboardStats();

    // ==========================================
    // LOAD RECENT BOOKINGS
    // ==========================================
    async function loadRecentBookings() {
        const bookings = await fetchBookings({ customerId: currentUser.id });
        const userBookings = bookings.filter(b => b.customerId === currentUser.id);
        
        // Sort by date (newest first) and take top 3
        const recentBookings = userBookings
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .slice(0, 3);

        const recentBookingsList = document.getElementById('recentBookingsList');

        if (recentBookings.length === 0) {
            recentBookingsList.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-box-open"></i>
                    <h3>No Bookings Yet</h3>
                    <p>Start by booking your first delivery</p>
                </div>
            `;
            return;
        }

        recentBookingsList.innerHTML = recentBookings.map(booking => `
            <div class="booking-card">
                <div class="booking-header">
                    <span class="booking-id">${booking.trackingId}</span>
                    <span class="booking-status ${getStatusClass(booking.status)}">
                        ${booking.status}
                    </span>
                </div>
                <div class="booking-details">
                    <div class="booking-detail">
                        <i class="fas fa-map-marker-alt"></i>
                        <div>
                            <span>From</span>
                            <strong>${booking.pickupCity}</strong>
                        </div>
                    </div>
                    <div class="booking-detail">
                        <i class="fas fa-location-dot"></i>
                        <div>
                            <span>To</span>
                            <strong>${booking.deliveryCity}</strong>
                        </div>
                    </div>
                    <div class="booking-detail">
                        <i class="fas fa-calendar"></i>
                        <div>
                            <span>Date</span>
                            <strong>${formatDate(booking.createdAt)}</strong>
                        </div>
                    </div>
                </div>
                <div class="booking-actions">
                    <button class="btn-small btn-primary" onclick="trackOrder('${booking.trackingId}')">
                        <i class="fas fa-location-crosshairs"></i> Track
                    </button>
                    <button class="btn-small btn-secondary" onclick="viewBookingDetails('${booking.trackingId}')">
                        <i class="fas fa-eye"></i> View Details
                    </button>
                </div>
            </div>
        `).join('');
    }

    loadRecentBookings();

    // ==========================================
    // LOAD ALL BOOKINGS
    // ==========================================
    let currentFilter = 'all';

    async function loadAllBookings(filter = 'all') {
        currentFilter = filter;
        const bookings = await fetchBookings({ customerId: currentUser.id });
        let userBookings = bookings.filter(b => b.customerId === currentUser.id);

        // Apply filter
        if (filter !== 'all') {
            userBookings = userBookings.filter(b => b.status === filter);
        }

        // Sort by date (newest first)
        userBookings.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        const allBookingsList = document.getElementById('allBookingsList');

        if (userBookings.length === 0) {
            allBookingsList.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-box-open"></i>
                    <h3>No Bookings Found</h3>
                    <p>${filter === 'all' ? 'Start by booking your first delivery' : 'No bookings with this status'}</p>
                </div>
            `;
            return;
        }

        allBookingsList.innerHTML = userBookings.map(booking => `
            <div class="booking-card">
                <div class="booking-header">
                    <span class="booking-id">${booking.trackingId}</span>
                    <span class="booking-status ${getStatusClass(booking.status)}">
                        ${booking.status}
                    </span>
                </div>
                <div class="booking-details">
                    <div class="booking-detail">
                        <i class="fas fa-box"></i>
                        <div>
                            <span>Package</span>
                            <strong>${capitalizeFirst(booking.packageType)}</strong>
                        </div>
                    </div>
                    <div class="booking-detail">
                        <i class="fas fa-map-marker-alt"></i>
                        <div>
                            <span>From</span>
                            <strong>${booking.pickupCity}, ${booking.pickupState}</strong>
                        </div>
                    </div>
                    <div class="booking-detail">
                        <i class="fas fa-location-dot"></i>
                        <div>
                            <span>To</span>
                            <strong>${booking.deliveryCity}, ${booking.deliveryState}</strong>
                        </div>
                    </div>
                    <div class="booking-detail">
                        <i class="fas fa-calendar"></i>
                        <div>
                            <span>Booked On</span>
                            <strong>${formatDate(booking.createdAt)}</strong>
                        </div>
                    </div>
                    <div class="booking-detail">
                        <i class="fas fa-naira-sign"></i>
                        <div>
                            <span>Amount</span>
                            <strong>₦${booking.price.toLocaleString()}</strong>
                        </div>
                    </div>
                    <div class="booking-detail">
                        <i class="fas fa-truck"></i>
                        <div>
                            <span>Delivery Type</span>
                            <strong>${capitalizeFirst(booking.deliveryType)}</strong>
                        </div>
                    </div>
                </div>
                <div class="booking-actions">
                    <button class="btn-small btn-primary" onclick="trackOrder('${booking.trackingId}')">
                        <i class="fas fa-location-crosshairs"></i> Track Order
                    </button>
                    <button class="btn-small btn-secondary" onclick="viewBookingDetails('${booking.trackingId}')">
                        <i class="fas fa-eye"></i> View Details
                    </button>
                </div>
            </div>
        `).join('');
    }

    // Load all bookings initially
    loadAllBookings();

    // ==========================================
    // FILTER TABS FUNCTIONALITY
    // ==========================================
    const filterTabs = document.querySelectorAll('.filter-tab');
    
    filterTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            // Update active tab
            filterTabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            
            // Load filtered bookings
            const filter = this.getAttribute('data-filter');
            loadAllBookings(filter);
        });
    });

    // ==========================================
    // SIDEBAR NAVIGATION
    // ==========================================
    const navLinks = document.querySelectorAll('.nav-link[data-section]');
    const contentSections = document.querySelectorAll('.content-section');
    const pageTitle = document.getElementById('pageTitle');

    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            const sectionId = this.getAttribute('data-section');
            switchSection(sectionId);
        });
    });

    window.switchSection = function(sectionId) {
        // Update active nav link
        navLinks.forEach(link => link.classList.remove('active'));
        const activeLink = document.querySelector(`.nav-link[data-section="${sectionId}"]`);
        if (activeLink) activeLink.classList.add('active');

        // Show selected section
        contentSections.forEach(section => section.classList.remove('active'));
        const activeSection = document.getElementById(sectionId);
        if (activeSection) activeSection.classList.add('active');

        // Update page title
        const titles = {
            'dashboard': 'Dashboard',
            'bookings': 'My Bookings',
            'new-booking': 'New Booking',
            'profile': 'My Profile'
        };
        pageTitle.textContent = titles[sectionId] || 'Dashboard';

        // Close mobile sidebar
        if (window.innerWidth <= 968) {
            sidebar.classList.remove('active');
        }
    };

    // ==========================================
    // MOBILE SIDEBAR TOGGLE
    // ==========================================
    const sidebar = document.getElementById('sidebar');
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const sidebarToggle = document.getElementById('sidebarToggle');

    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', function() {
            sidebar.classList.toggle('active');
        });
    }

    if (sidebarToggle) {
        sidebarToggle.addEventListener('click', function() {
            sidebar.classList.remove('active');
        });
    }

    // Close sidebar when clicking outside on mobile
    document.addEventListener('click', function(e) {
        if (window.innerWidth <= 968) {
            if (!sidebar.contains(e.target) && !mobileMenuBtn.contains(e.target)) {
                sidebar.classList.remove('active');
            }
        }
    });

    // ==========================================
    // TRACK ORDER FUNCTION
    // ==========================================
    window.trackOrder = function(trackingId) {
        window.location.href = `tracking.html?id=${trackingId}`;
    };

    // ==========================================
    // VIEW BOOKING DETAILS FUNCTION
    // ==========================================
    window.viewBookingDetails = async function(trackingId) {
        const bookings = await fetchBookings({ trackingId });
        const booking = bookings.find(b => b.trackingId === trackingId);

        if (!booking) {
            showNotification('Booking not found', 'error');
            return;
        }

        // Create modal
        const modal = document.createElement('div');
        modal.className = 'booking-modal';
        modal.innerHTML = `
            <div class="modal-overlay" onclick="closeBookingModal()"></div>
            <div class="modal-content">
                <div class="modal-header">
                    <h2>Booking Details</h2>
                    <button class="modal-close" onclick="closeBookingModal()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <div class="modal-section">
                        <h3><i class="fas fa-barcode"></i> Tracking Information</h3>
                        <p><strong>Tracking ID:</strong> ${booking.trackingId}</p>
                        <p><strong>Status:</strong> <span class="booking-status ${getStatusClass(booking.status)}">${booking.status}</span></p>
                        <p><strong>Booked On:</strong> ${formatDateTime(booking.createdAt)}</p>
                    </div>
                    
                    <div class="modal-section">
                        <h3><i class="fas fa-box"></i> Package Details</h3>
                        <p><strong>Type:</strong> ${capitalizeFirst(booking.packageType)}</p>
                        <p><strong>Weight:</strong> ${booking.packageWeight} kg</p>
                        <p><strong>Size:</strong> ${capitalizeFirst(booking.packageSize)}</p>
                        <p><strong>Description:</strong> ${booking.packageDescription}</p>
                    </div>
                    
                    <div class="modal-section">
                        <h3><i class="fas fa-map-marker-alt"></i> Pickup Location</h3>
                        <p><strong>Address:</strong> ${booking.pickupAddress}</p>
                        <p><strong>City:</strong> ${booking.pickupCity}, ${booking.pickupState}</p>
                        <p><strong>Date:</strong> ${formatDate(booking.pickupDate)}</p>
                    </div>
                    
                    <div class="modal-section">
                        <h3><i class="fas fa-location-dot"></i> Delivery Location</h3>
                        <p><strong>Address:</strong> ${booking.deliveryAddress}</p>
                        <p><strong>City:</strong> ${booking.deliveryCity}, ${booking.deliveryState}</p>
                    </div>
                    
                    <div class="modal-section">
                        <h3><i class="fas fa-users"></i> Contact Information</h3>
                        <p><strong>Sender:</strong> ${booking.senderName} (${booking.senderPhone})</p>
                        <p><strong>Receiver:</strong> ${booking.receiverName} (${booking.receiverPhone})</p>
                    </div>
                    
                    <div class="modal-section">
                        <h3><i class="fas fa-naira-sign"></i> Payment</h3>
                        <p><strong>Amount:</strong> ₦${booking.price.toLocaleString()}</p>
                        <p><strong>Delivery Type:</strong> ${capitalizeFirst(booking.deliveryType)}</p>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn-primary" onclick="trackOrder('${booking.trackingId}')">
                        <i class="fas fa-location-crosshairs"></i> Track Order
                    </button>
                    <button class="btn-secondary" onclick="closeBookingModal()">Close</button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        addModalStyles();
    };

    window.closeBookingModal = function() {
        const modal = document.querySelector('.booking-modal');
        if (modal) modal.remove();
    };

    // ==========================================
    // ADD MODAL STYLES
    // ==========================================
    function addModalStyles() {
        if (document.querySelector('#modalStyles')) return;

        const style = document.createElement('style');
        style.id = 'modalStyles';
        style.innerHTML = `
            .booking-modal {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                z-index: 10000;
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 1rem;
            }

            .modal-overlay {
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0, 0, 0, 0.7);
                animation: fadeIn 0.3s ease;
            }

            .modal-content {
                position: relative;
                background: white;
                border-radius: 20px;
                max-width: 700px;
                width: 100%;
                max-height: 90vh;
                overflow-y: auto;
                animation: slideUp 0.4s ease;
                box-shadow: 0 10px 50px rgba(0, 0, 0, 0.3);
            }

            .modal-header {
                padding: 2rem;
                border-bottom: 1px solid #E0E0E0;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }

            .modal-header h2 {
                font-size: 1.8rem;
                color: #1A1A1A;
            }

            .modal-close {
                background: none;
                border: none;
                font-size: 1.5rem;
                color: #666;
                cursor: pointer;
                padding: 0.5rem;
            }

            .modal-body {
                padding: 2rem;
            }

            .modal-section {
                margin-bottom: 2rem;
                padding-bottom: 2rem;
                border-bottom: 1px solid #E0E0E0;
            }

            .modal-section:last-child {
                border-bottom: none;
            }

            .modal-section h3 {
                font-size: 1.2rem;
                color: #0A9E4B;
                margin-bottom: 1rem;
                display: flex;
                align-items: center;
                gap: 10px;
            }

            .modal-section p {
                margin: 0.5rem 0;
                color: #666;
            }

            .modal-section p strong {
                color: #1A1A1A;
                display: inline-block;
                width: 120px;
            }

            .modal-footer {
                padding: 1.5rem 2rem;
                border-top: 1px solid #E0E0E0;
                display: flex;
                gap: 1rem;
                justify-content: flex-end;
            }

            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }

            @keyframes slideUp {
                from {
                    opacity: 0;
                    transform: translateY(50px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }
        `;
        document.head.appendChild(style);
    }

    // ==========================================
    // LOGOUT FUNCTION
    // ==========================================
    window.logout = function() {
        console.log('%c🚪 Customer Logging Out...', 'color: #FF9800; font-weight: bold;');
        
        localStorage.removeItem('currentUser');
        localStorage.removeItem('rememberMe');
        
        showNotification('Logged out successfully', 'success');
        
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 800);
    };

    // ==========================================
    // UTILITY FUNCTIONS
    // ==========================================
    function getStatusClass(status) {
        const statusMap = {
            'Pending': 'status-pending',
            'Confirmed': 'status-confirmed',
            'Picked Up': 'status-confirmed',
            'In Transit': 'status-in-transit',
            'Out for Delivery': 'status-in-transit',
            'Delivered': 'status-delivered'
        };
        return statusMap[status] || 'status-pending';
    }

    function formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    }

    function formatDateTime(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    function capitalizeFirst(str) {
        if (!str) return '';
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    function showNotification(message, type = 'info') {
        const existingNotification = document.querySelector('.notification');
        if (existingNotification) {
            existingNotification.remove();
        }

        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
                <span>${message}</span>
            </div>
        `;

        notification.style.cssText = `
            position: fixed;
            top: 2rem;
            right: 2rem;
            background: ${type === 'success' ? '#0A9E4B' : type === 'error' ? '#e74c3c' : '#3498db'};
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 10px;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
            z-index: 10000;
            animation: slideInRight 0.3s ease;
            max-width: 400px;
        `;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    if (!document.querySelector('#notificationStyles')) {
        const style = document.createElement('style');
        style.id = 'notificationStyles';
        style.innerHTML = `
            @keyframes slideInRight {
                from { transform: translateX(400px); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            @keyframes slideOutRight {
                from { transform: translateX(0); opacity: 1; }
                to { transform: translateX(400px); opacity: 0; }
            }
            .notification-content {
                display: flex;
                align-items: center;
                gap: 12px;
                font-size: 1rem;
            }
            .notification-content i { font-size: 1.5rem; }
            @media (max-width: 640px) {
                .notification {
                    right: 1rem;
                    left: 1rem;
                    top: 1rem;
                    max-width: none;
                }
            }
        `;
        document.head.appendChild(style);
    }

    console.log('%c✅ Customer Dashboard Initialized!', 'color: #0A9E4B; font-weight: bold;');
});
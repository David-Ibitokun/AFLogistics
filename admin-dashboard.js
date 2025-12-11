// ==========================================
// AF LOGISTICS - ADMIN DASHBOARD
// System Administration & Management
// ==========================================

document.addEventListener('DOMContentLoaded', function() {
    
    // ==========================================
    // CHECK AUTHENTICATION
    // ==========================================
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    
    if (!currentUser || currentUser.role !== 'admin') {
        console.log('%c⚠️ Unauthorized Access - Redirecting to Login', 'color: #FF9800; font-weight: bold;');
        window.location.href = 'login.html';
        return;
    }

    console.log('%c✅ Admin Authenticated:', 'color: #0A9E4B; font-weight: bold;');
    console.log('   Name:', currentUser.name);
    console.log('   Email:', currentUser.email);

    // ==========================================
    // INITIALIZE USER INTERFACE
    // ==========================================
    function initializeUI() {
        document.getElementById('userName').textContent = currentUser.name;
        document.getElementById('profileName').textContent = currentUser.name;
        document.getElementById('profileEmail').textContent = currentUser.email;
        document.getElementById('detailEmail').textContent = currentUser.email;
        document.getElementById('detailPhone').textContent = currentUser.phone || 'Not provided';
        document.getElementById('detailAdminId').textContent = currentUser.id;
        
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const userDetails = users.find(u => u.id === currentUser.id);
        
        if (userDetails && userDetails.createdAt) {
            const joinDate = new Date(userDetails.createdAt);
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
    // ==========================================
    // LOAD DASHBOARD STATISTICS
    // ==========================================
    async function loadDashboardStats() {
        const bookings = await fetchBookings();
        let users = [];
        
        try {
            const res = await fetch('/api/accounts');
            if (res.ok) {
                users = await res.json();
            }
        } catch (error) {
            console.error('Failed to fetch users:', error);
        }

        // Calculate booking statistics
        const totalBookings = bookings.length;
        const pendingBookings = bookings.filter(b => 
            b.status === 'Pending' || b.status === 'Confirmed'
        ).length;
        const completedBookings = bookings.filter(b => 
            b.status === 'Delivered'
        ).length;
        const totalRevenue = bookings.reduce((sum, b) => sum + (b.price || 0), 0);

        // Calculate user statistics
        const totalCustomers = users.filter(u => u.role === 'customer').length;
        const totalRiders = users.filter(u => u.role === 'rider').length;

        // Update dashboard stats
        document.getElementById('totalBookings').textContent = totalBookings;
        document.getElementById('pendingBookings').textContent = pendingBookings;
        document.getElementById('completedBookings').textContent = completedBookings;
        document.getElementById('totalRevenue').textContent = '₦' + totalRevenue.toLocaleString();
        document.getElementById('totalCustomers').textContent = totalCustomers;
        document.getElementById('totalRiders').textContent = totalRiders;

        // Update profile stats
        document.getElementById('profileTotalBookings').textContent = totalBookings;
        document.getElementById('profileTotalUsers').textContent = users.length;
        document.getElementById('profileRevenue').textContent = '₦' + totalRevenue.toLocaleString();
    }

    loadDashboardStats();

    // ==========================================
    // LOAD ANALYTICS
    // ==========================================
    async function loadAnalytics() {
        const bookings = await fetchBookings();

        // Completion rate
        const completedBookings = bookings.filter(b => b.status === 'Delivered').length;
        const completionRate = bookings.length > 0 
            ? ((completedBookings / bookings.length) * 100).toFixed(1) 
            : 0;
        document.getElementById('completionRate').textContent = completionRate + '%';

        // Average order value
        const avgOrderValue = bookings.length > 0
            ? Math.round(bookings.reduce((sum, b) => sum + b.price, 0) / bookings.length)
            : 0;
        document.getElementById('avgOrderValue').textContent = '₦' + avgOrderValue.toLocaleString();

        // Delivery type distribution
        const deliveryTypes = {
            express: bookings.filter(b => b.deliveryType === 'express').length,
            standard: bookings.filter(b => b.deliveryType === 'standard').length,
            economy: bookings.filter(b => b.deliveryType === 'economy').length
        };

        const deliveryTypeStats = document.getElementById('deliveryTypeStats');
        deliveryTypeStats.innerHTML = `
            <div class="stat-card">
                <div class="stat-icon" style="background: #E8F5E9;">
                    <i class="fas fa-bolt" style="color: #4CAF50;"></i>
                </div>
                <div class="stat-info">
                    <h3>${deliveryTypes.express}</h3>
                    <p>Express Delivery</p>
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-icon" style="background: #E3F2FD;">
                    <i class="fas fa-truck" style="color: #2196F3;"></i>
                </div>
                <div class="stat-info">
                    <h3>${deliveryTypes.standard}</h3>
                    <p>Standard Delivery</p>
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-icon" style="background: #FFF3E0;">
                    <i class="fas fa-box" style="color: #FF9800;"></i>
                </div>
                <div class="stat-info">
                    <h3>${deliveryTypes.economy}</h3>
                    <p>Economy Delivery</p>
                </div>
            </div>
        `;
    }

    loadAnalytics();

    // ==========================================
    // LOAD RECENT BOOKINGS
    // ==========================================
    async function loadRecentBookings() {
        const bookings = await fetchBookings();
        const recentBookings = bookings
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .slice(0, 5);

        const recentBookingsList = document.getElementById('recentBookingsList');

        if (recentBookings.length === 0) {
            recentBookingsList.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-box-open"></i>
                    <h3>No Bookings Yet</h3>
                    <p>System bookings will appear here</p>
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
                        <i class="fas fa-user"></i>
                        <div>
                            <span>Customer</span>
                            <strong>${booking.customerName}</strong>
                        </div>
                    </div>
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
                    <button class="btn-small btn-primary" onclick="viewBookingDetails('${booking.trackingId}')">
                        <i class="fas fa-eye"></i> View
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
        const bookings = await fetchBookings();
        let filteredBookings = [...bookings];

        if (filter !== 'all') {
            filteredBookings = filteredBookings.filter(b => b.status === filter);
        }

        filteredBookings.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        const allBookingsList = document.getElementById('allBookingsList');

        if (filteredBookings.length === 0) {
            allBookingsList.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-box-open"></i>
                    <h3>No Bookings Found</h3>
                    <p>${filter === 'all' ? 'No bookings in the system' : 'No bookings with this status'}</p>
                </div>
            `;
            return;
        }

        allBookingsList.innerHTML = filteredBookings.map(booking => `
            <div class="booking-card">
                <div class="booking-header">
                    <span class="booking-id">${booking.trackingId}</span>
                    <span class="booking-status ${getStatusClass(booking.status)}">
                        ${booking.status}
                    </span>
                </div>
                <div class="booking-details">
                    <div class="booking-detail">
                        <i class="fas fa-user"></i>
                        <div>
                            <span>Customer</span>
                            <strong>${booking.customerName}</strong>
                        </div>
                    </div>
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
                        <i class="fas fa-motorcycle"></i>
                        <div>
                            <span>Rider</span>
                            <strong>${booking.riderName || 'Not Assigned'}</strong>
                        </div>
                    </div>
                    <div class="booking-detail">
                        <i class="fas fa-naira-sign"></i>
                        <div>
                            <span>Amount</span>
                            <strong>₦${booking.price.toLocaleString()}</strong>
                        </div>
                    </div>
                </div>
                <div class="booking-actions">
                    <button class="btn-small btn-primary" onclick="viewBookingDetails('${booking.trackingId}')">
                        <i class="fas fa-eye"></i> View Details
                    </button>
                </div>
            </div>
        `).join('');
    }

    loadAllBookings();

    // ==========================================
    // LOAD USERS
    // ==========================================
    let currentUserFilter = 'all';

    async function loadUsers(filter = 'all') {
        currentUserFilter = filter;
        
        let users = [];
        try {
            const res = await fetch('/api/accounts');
            if (res.ok) {
                users = await res.json();
            }
        } catch (error) {
            console.error('Failed to fetch users:', error);
            // Fallback to localStorage if API fails (e.g. offline)
            users = JSON.parse(localStorage.getItem('users') || '[]');
        }

        let filteredUsers = [...users];

        if (filter !== 'all') {
            filteredUsers = filteredUsers.filter(u => u.role === filter);
        }

        const usersList = document.getElementById('usersList');

        if (filteredUsers.length === 0) {
            usersList.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-users"></i>
                    <h3>No Users Found</h3>
                    <p>No users with this role</p>
                </div>
            `;
            return;
        }

        usersList.innerHTML = filteredUsers.map(user => `
            <div class="booking-card">
                <div class="booking-header">
                    <span class="booking-id">${user.name}</span>
                    <span class="booking-status ${getRoleClass(user.role)}">
                        ${capitalizeFirst(user.role)}
                    </span>
                </div>
                <div class="booking-details">
                    <div class="booking-detail">
                        <i class="fas fa-envelope"></i>
                        <div>
                            <span>Email</span>
                            <strong>${user.email}</strong>
                        </div>
                    </div>
                    <div class="booking-detail">
                        <i class="fas fa-phone"></i>
                        <div>
                            <span>Phone</span>
                            <strong>${user.phone || 'Not provided'}</strong>
                        </div>
                    </div>
                    <div class="booking-detail">
                        <i class="fas fa-calendar"></i>
                        <div>
                            <span>Joined</span>
                            <strong>${formatDate(user.createdAt)}</strong>
                        </div>
                    </div>
                    <div class="booking-detail">
                        <i class="fas fa-id-card"></i>
                        <div>
                            <span>User ID</span>
                            <strong>${user.id}</strong>
                        </div>
                    </div>
                </div>
            </div>
        `).join('');
    }

    loadUsers();

    // ==========================================
    // LOAD RIDERS
    // ==========================================
    async function loadRiders() {
        let users = [];
        try {
            const res = await fetch('/api/accounts');
            if (res.ok) {
                users = await res.json();
            }
        } catch (error) {
            console.error('Failed to fetch users:', error);
            users = JSON.parse(localStorage.getItem('users') || '[]');
        }

        const bookings = await fetchBookings();
        const riders = users.filter(u => u.role === 'rider');

        const ridersList = document.getElementById('ridersList');

        if (riders.length === 0) {
            ridersList.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-motorcycle"></i>
                    <h3>No Riders Found</h3>
                    <p>No riders registered in the system</p>
                </div>
            `;
            return;
        }

        ridersList.innerHTML = riders.map(rider => {
            const riderBookings = bookings.filter(b => b.riderId === rider.id);
            const activeDeliveries = riderBookings.filter(b => b.status !== 'Delivered').length;
            const completedDeliveries = riderBookings.filter(b => b.status === 'Delivered').length;

            return `
                <div class="booking-card">
                    <div class="booking-header">
                        <span class="booking-id">${rider.name}</span>
                        <span class="booking-status status-in-transit">
                            <i class="fas fa-motorcycle"></i> Rider
                        </span>
                    </div>
                    <div class="booking-details">
                        <div class="booking-detail">
                            <i class="fas fa-envelope"></i>
                            <div>
                                <span>Email</span>
                                <strong>${rider.email}</strong>
                            </div>
                        </div>
                        <div class="booking-detail">
                            <i class="fas fa-phone"></i>
                            <div>
                                <span>Phone</span>
                                <strong>${rider.phone || 'Not provided'}</strong>
                            </div>
                        </div>
                        <div class="booking-detail">
                            <i class="fas fa-map"></i>
                            <div>
                                <span>Location</span>
                                <strong>${rider.city || 'Not provided'}, ${rider.state || ''}</strong>
                            </div>
                        </div>
                        <div class="booking-detail">
                            <i class="fas fa-clock"></i>
                            <div>
                                <span>Active Deliveries</span>
                                <strong>${activeDeliveries}</strong>
                            </div>
                        </div>
                        <div class="booking-detail">
                            <i class="fas fa-check-circle"></i>
                            <div>
                                <span>Completed</span>
                                <strong>${completedDeliveries}</strong>
                            </div>
                        </div>
                        <div class="booking-detail">
                            <i class="fas fa-box"></i>
                            <div>
                                <span>Total Deliveries</span>
                                <strong>${riderBookings.length}</strong>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }

    loadRiders();

    // ==========================================
    // VIEW BOOKING DETAILS
    // ==========================================
    window.viewBookingDetails = function(trackingId) {
        window.location.href = `tracking.html?id=${trackingId}`;
    };

    // ==========================================
    // FILTER TABS FUNCTIONALITY
    // ==========================================
    const filterTabs = document.querySelectorAll('.filter-tab[data-filter]');
    
    filterTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            document.querySelectorAll('.filter-tab[data-filter]').forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            
            const filter = this.getAttribute('data-filter');
            loadAllBookings(filter);
        });
    });

    // User filter tabs
    const userFilterTabs = document.querySelectorAll('.filter-tab[data-user-filter]');
    
    userFilterTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            document.querySelectorAll('.filter-tab[data-user-filter]').forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            
            const filter = this.getAttribute('data-user-filter');
            loadUsers(filter);
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
        navLinks.forEach(link => link.classList.remove('active'));
        const activeLink = document.querySelector(`.nav-link[data-section="${sectionId}"]`);
        if (activeLink) activeLink.classList.add('active');

        contentSections.forEach(section => section.classList.remove('active'));
        const activeSection = document.getElementById(sectionId);
        if (activeSection) activeSection.classList.add('active');

        const titles = {
            'dashboard': 'Admin Dashboard',
            'all-bookings': 'All Bookings',
            'users': 'Users Management',
            'riders': 'Riders Management',
            'analytics': 'Analytics & Reports',
            'profile': 'Admin Profile'
        };
        pageTitle.textContent = titles[sectionId] || 'Admin Dashboard';

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

    document.addEventListener('click', function(e) {
        if (window.innerWidth <= 968) {
            if (!sidebar.contains(e.target) && !mobileMenuBtn.contains(e.target)) {
                sidebar.classList.remove('active');
            }
        }
    });

    // ==========================================
    // LOGOUT FUNCTION
    // ==========================================
    window.logout = function() {
        console.log('%c🚪 Admin Logging Out...', 'color: #FF9800; font-weight: bold;');
        
        localStorage.removeItem('currentUser');
        localStorage.removeItem('rememberMe');
        
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 500);
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

    function getRoleClass(role) {
        const roleMap = {
            'customer': 'status-confirmed',
            'rider': 'status-in-transit',
            'admin': 'status-delivered'
        };
        return roleMap[role] || 'status-pending';
    }

    function formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    }

    function capitalizeFirst(str) {
        if (!str) return '';
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    console.log('%c✅ Admin Dashboard Initialized!', 'color: #0A9E4B; font-weight: bold;');
    console.log('System Overview:');
    console.log('- Total Bookings:', document.getElementById('totalBookings').textContent);
    console.log('- Total Users:', document.getElementById('profileTotalUsers').textContent);
    console.log('- Total Revenue:', document.getElementById('totalRevenue').textContent);
});
// ==========================================
// AF LOGISTICS - RIDER DASHBOARD
// Rider Portal & Delivery Management
// ==========================================

document.addEventListener('DOMContentLoaded', function() {
    
    // ==========================================
    // CHECK AUTHENTICATION
    // ==========================================
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    
    if (!currentUser || currentUser.role !== 'rider') {
        console.log('%c⚠️ Unauthorized Access - Redirecting to Login', 'color: #FF9800; font-weight: bold;');
        window.location.href = 'login.html';
        return;
    }

    console.log('%c✅ Rider Authenticated:', 'color: #0A9E4B; font-weight: bold;');
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
        document.getElementById('detailRiderId').textContent = currentUser.id;
        
        // Get user data from users array to get additional details
        if (currentUser) {
            if (currentUser.address) {
                document.getElementById('detailAddress').textContent = currentUser.address;
            }
            if (currentUser.city && currentUser.city) {
                document.getElementById('detailLocation').textContent = 
                    `${currentUser.city}, ${currentUser.state}`;
            }
            if (currentUser.createdAt) {
                const joinDate = new Date(currentUser.createdAt);
                document.getElementById('detailJoinDate').textContent = joinDate.toLocaleDateString('en-US', {
                    month: 'long',
                    year: 'numeric'
                });
            }
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
    // AUTO-ASSIGN DELIVERIES TO RIDER
    // ==========================================
    async function autoAssignDeliveries() {
        const bookings = await fetchBookings();
        
        for (const booking of bookings) {
            // Auto-assign pending bookings that don't have a rider
            if (booking.status === 'Pending' && !booking.riderId) {
                try {
                    // Update booking via API
                    await fetch(`/api/bookings?id=${booking.id}`, {
                        method: 'PATCH',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            status: 'Confirmed',
                            riderId: currentUser.id,
                            riderName: currentUser.name,
                            statusNote: `Assigned to rider ${currentUser.name}`
                        })
                    });
                } catch (error) {
                    console.error('Error auto-assigning booking:', error);
                }
            }
        }
    }

    // Auto-assign on load
    autoAssignDeliveries();

    // ==========================================
    // LOAD DASHBOARD STATISTICS
    // ==========================================
    async function loadDashboardStats() {
        const bookings = await fetchBookings({ riderId: currentUser.id });
        const riderDeliveries = bookings.filter(b => b.riderId === currentUser.id);

        // Calculate statistics
        const pendingPickups = riderDeliveries.filter(b => 
            b.status === 'Confirmed'
        ).length;
        
        const inTransit = riderDeliveries.filter(b => 
            b.status === 'In Transit' || b.status === 'Out for Delivery'
        ).length;

        const today = new Date().toDateString();
        const completedToday = riderDeliveries.filter(b => 
            b.status === 'Delivered' && 
            new Date(b.updatedAt).toDateString() === today
        ).length;

        const totalDeliveries = riderDeliveries.filter(b => 
            b.status === 'Delivered'
        ).length;

        // Update dashboard stats
        document.getElementById('pendingPickups').textContent = pendingPickups;
        document.getElementById('inTransitCount').textContent = inTransit;
        document.getElementById('completedToday').textContent = completedToday;
        document.getElementById('totalDeliveries').textContent = totalDeliveries;

        // Update notification badge
        const activeTasks = pendingPickups + inTransit;
        const badge = document.getElementById('notificationBadge');
        if (badge) {
            badge.textContent = activeTasks;
            badge.style.display = activeTasks > 0 ? 'flex' : 'none';
        }

        // Update profile stats
        document.getElementById('profileTotalDeliveries').textContent = riderDeliveries.length;
        document.getElementById('profileCompleted').textContent = totalDeliveries;
    }

    loadDashboardStats();

    // ==========================================
    // LOAD ACTIVE DELIVERIES
    // ==========================================
    async function loadActiveDeliveries() {
        const bookings = await fetchBookings({ riderId: currentUser.id });
        const activeDeliveries = bookings.filter(b => 
            b.riderId === currentUser.id && 
            b.status !== 'Delivered' &&
            b.status !== 'Pending'
        ).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        const activeDeliveriesList = document.getElementById('activeDeliveriesList');

        if (activeDeliveries.length === 0) {
            activeDeliveriesList.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-clipboard-check"></i>
                    <h3>No Active Deliveries</h3>
                    <p>You're all caught up! Check back soon for new assignments.</p>
                </div>
            `;
            return;
        }

        activeDeliveriesList.innerHTML = activeDeliveries.map(booking => `
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
                            <span>Pickup</span>
                            <strong>${booking.pickupAddress}, ${booking.pickupCity}</strong>
                        </div>
                    </div>
                    <div class="booking-detail">
                        <i class="fas fa-location-dot"></i>
                        <div>
                            <span>Delivery</span>
                            <strong>${booking.deliveryAddress}, ${booking.deliveryCity}</strong>
                        </div>
                    </div>
                    <div class="booking-detail">
                        <i class="fas fa-user"></i>
                        <div>
                            <span>Customer</span>
                            <strong>${booking.customerName}</strong>
                        </div>
                    </div>
                </div>
                <div class="booking-actions">
                    ${getStatusActions(booking)}
                </div>
            </div>
        `).join('');
    }

    loadActiveDeliveries();

    // ==========================================
    // LOAD ALL ASSIGNED DELIVERIES
    // ==========================================
    let currentFilter = 'all';

    async function loadAssignedDeliveries(filter = 'all') {
        currentFilter = filter;
        const bookings = await fetchBookings({ riderId: currentUser.id });
        let assignedDeliveries = bookings.filter(b => 
            b.riderId === currentUser.id && 
            b.status !== 'Delivered'
        );

        // Apply filter
        if (filter !== 'all') {
            assignedDeliveries = assignedDeliveries.filter(b => b.status === filter);
        }

        // Sort by date
        assignedDeliveries.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        const assignedDeliveriesList = document.getElementById('assignedDeliveriesList');

        if (assignedDeliveries.length === 0) {
            assignedDeliveriesList.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-clipboard-list"></i>
                    <h3>No Deliveries Found</h3>
                    <p>${filter === 'all' ? 'No assigned deliveries at the moment' : 'No deliveries with this status'}</p>
                </div>
            `;
            return;
        }

        assignedDeliveriesList.innerHTML = assignedDeliveries.map(booking => `
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
                            <strong>${capitalizeFirst(booking.packageType)} (${booking.packageWeight}kg)</strong>
                        </div>
                    </div>
                    <div class="booking-detail">
                        <i class="fas fa-map-marker-alt"></i>
                        <div>
                            <span>Pickup</span>
                            <strong>${booking.pickupAddress}</strong>
                        </div>
                    </div>
                    <div class="booking-detail">
                        <i class="fas fa-location-dot"></i>
                        <div>
                            <span>Delivery</span>
                            <strong>${booking.deliveryAddress}</strong>
                        </div>
                    </div>
                    <div class="booking-detail">
                        <i class="fas fa-user"></i>
                        <div>
                            <span>Customer</span>
                            <strong>${booking.customerName}</strong>
                        </div>
                    </div>
                    <div class="booking-detail">
                        <i class="fas fa-phone"></i>
                        <div>
                            <span>Sender Phone</span>
                            <strong>${booking.senderPhone}</strong>
                        </div>
                    </div>
                    <div class="booking-detail">
                        <i class="fas fa-phone"></i>
                        <div>
                            <span>Receiver Phone</span>
                            <strong>${booking.receiverPhone}</strong>
                        </div>
                    </div>
                </div>
                <div class="booking-actions">
                    ${getStatusActions(booking)}
                    <button class="btn-small btn-secondary" onclick="viewDeliveryDetails('${booking.trackingId}')">
                        <i class="fas fa-eye"></i> Details
                    </button>
                </div>
            </div>
        `).join('');
    }

    loadAssignedDeliveries();

    // ==========================================
    // LOAD DELIVERY HISTORY
    // ==========================================
    async function loadDeliveryHistory() {
        const bookings = await fetchBookings({ riderId: currentUser.id });
        const completedDeliveries = bookings.filter(b => 
            b.riderId === currentUser.id && 
            b.status === 'Delivered'
        ).sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

        const deliveryHistoryList = document.getElementById('deliveryHistoryList');

        if (completedDeliveries.length === 0) {
            deliveryHistoryList.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-history"></i>
                    <h3>No Delivery History</h3>
                    <p>Complete your first delivery to see it here</p>
                </div>
            `;
            return;
        }

        deliveryHistoryList.innerHTML = completedDeliveries.map(booking => `
            <div class="booking-card">
                <div class="booking-header">
                    <span class="booking-id">${booking.trackingId}</span>
                    <span class="booking-status status-delivered">Delivered</span>
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
                        <i class="fas fa-calendar-check"></i>
                        <div>
                            <span>Delivered On</span>
                            <strong>${formatDateTime(booking.updatedAt)}</strong>
                        </div>
                    </div>
                </div>
                <div class="booking-actions">
                    <button class="btn-small btn-secondary" onclick="viewDeliveryDetails('${booking.trackingId}')">
                        <i class="fas fa-eye"></i> View Details
                    </button>
                </div>
            </div>
        `).join('');
    }

    loadDeliveryHistory();

    // ==========================================
    // GET STATUS ACTIONS
    // ==========================================
    function getStatusActions(booking) {
        const actions = {
            'Confirmed': `<button class="btn-small btn-primary" onclick="updateDeliveryStatus('${booking.trackingId}', 'Picked Up')">
                <i class="fas fa-hand-holding-box"></i> Mark as Picked Up
            </button>`,
            'Picked Up': `<button class="btn-small btn-primary" onclick="updateDeliveryStatus('${booking.trackingId}', 'In Transit')">
                <i class="fas fa-truck-fast"></i> Mark In Transit
            </button>`,
            'In Transit': `<button class="btn-small btn-primary" onclick="updateDeliveryStatus('${booking.trackingId}', 'Out for Delivery')">
                <i class="fas fa-motorcycle"></i> Out for Delivery
            </button>`,
            'Out for Delivery': `<button class="btn-small btn-primary" onclick="updateDeliveryStatus('${booking.trackingId}', 'Delivered')">
                <i class="fas fa-check-circle"></i> Mark as Delivered
            </button>`
        };

        return actions[booking.status] || '';
    }

    // ==========================================
    // UPDATE DELIVERY STATUS
    // ==========================================
    window.updateDeliveryStatus = async function(trackingId, newStatus) {
        try {
            const bookings = await fetchBookings({ trackingId });
            const booking = bookings.find(b => b.trackingId === trackingId);

            if (!booking) {
                showNotification('Booking not found', 'error');
                return;
            }

            // Update via API
            const response = await fetch(`/api/bookings?id=${booking.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    status: newStatus,
                    statusNote: `Updated by rider ${currentUser.name}`
                })
            });

            if (response.ok) {
                showNotification(`Status updated to: ${newStatus}`, 'success');
                
                // Refresh all lists
                loadDashboardStats();
                loadActiveDeliveries();
                loadAssignedDeliveries(currentFilter);
                loadDeliveryHistory();
            } else {
                showNotification('Failed to update status', 'error');
            }
        } catch (error) {
            console.error('Error updating status:', error);
            showNotification('Error updating status', 'error');
        }
    };

    // ==========================================
    // REFRESH ALL DELIVERIES
    // ==========================================
    window.updateAllAvailable = function() {
        autoAssignDeliveries();
        loadDashboardStats();
        loadActiveDeliveries();
        loadAssignedDeliveries(currentFilter);
        showNotification('Deliveries refreshed', 'success');
    };

    // ==========================================
    // VIEW DELIVERY DETAILS
    // ==========================================
    window.viewDeliveryDetails = function(trackingId) {
        window.location.href = `tracking.html?id=${trackingId}`;
    };

    // ==========================================
    // FILTER TABS FUNCTIONALITY
    // ==========================================
    const filterTabs = document.querySelectorAll('.filter-tab');
    
    filterTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            filterTabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            
            const filter = this.getAttribute('data-filter');
            loadAssignedDeliveries(filter);
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
            'dashboard': 'Dashboard',
            'assigned-deliveries': 'Assigned Deliveries',
            'delivery-history': 'Delivery History',
            'profile': 'My Profile'
        };
        pageTitle.textContent = titles[sectionId] || 'Dashboard';

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
        console.log('%c🚪 Rider Logging Out...', 'color: #FF9800; font-weight: bold;');
        
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
        `;
        document.head.appendChild(style);
    }

    console.log('%c✅ Rider Dashboard Initialized!', 'color: #0A9E4B; font-weight: bold;');
});
// ==========================================
// AF LOGISTICS - TRACKING PAGE JAVASCRIPT
// Real-time Package Tracking System
// ==========================================

document.addEventListener('DOMContentLoaded', function() {
    
    // ==========================================
    // MOBILE NAVIGATION TOGGLE
    // ==========================================
    const navToggle = document.getElementById('navToggle');
    const navMenu = document.getElementById('navMenu');

    if (navToggle) {
        navToggle.addEventListener('click', function() {
            navMenu.classList.toggle('active');
            
            const spans = navToggle.querySelectorAll('span');
            spans[0].style.transform = navMenu.classList.contains('active') 
                ? 'rotate(45deg) translate(5px, 5px)' 
                : 'rotate(0) translate(0, 0)';
            spans[1].style.opacity = navMenu.classList.contains('active') ? '0' : '1';
            spans[2].style.transform = navMenu.classList.contains('active') 
                ? 'rotate(-45deg) translate(7px, -6px)' 
                : 'rotate(0) translate(0, 0)';
        });
    }

    // ==========================================
    // CHECK FOR URL PARAMETERS
    // ==========================================
    const urlParams = new URLSearchParams(window.location.search);
    const trackingIdFromUrl = urlParams.get('id');
    
    // Check for tracking ID from session storage (from home page quick track)
    const trackingIdFromSession = sessionStorage.getItem('searchTrackingId');
    
    if (trackingIdFromUrl) {
        document.getElementById('trackingInput').value = trackingIdFromUrl;
        trackPackage(trackingIdFromUrl);
    } else if (trackingIdFromSession) {
        document.getElementById('trackingInput').value = trackingIdFromSession;
        trackPackage(trackingIdFromSession);
        sessionStorage.removeItem('searchTrackingId');
    }

    // ==========================================
    // TRACKING FORM SUBMISSION
    // ==========================================
    const trackingForm = document.getElementById('trackingForm');
    
    trackingForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const trackingId = document.getElementById('trackingInput').value.trim();
        
        if (trackingId) {
            trackPackage(trackingId);
        }
    });

    // ==========================================
    // TRACK PACKAGE FUNCTION
    // ==========================================
    function trackPackage(trackingId) {
        // Show loading state
        showLoadingState();
        
        // Simulate API delay for better UX
        setTimeout(() => {
            // Get bookings from localStorage
            const bookings = JSON.parse(localStorage.getItem('bookings') || '[]');
            
            // Find booking by tracking ID
            const booking = bookings.find(b => b.trackingId === trackingId);
            
            if (booking) {
                displayTrackingResults(booking);
            } else {
                showErrorState();
            }
        }, 1000);
    }

    // ==========================================
    // SHOW LOADING STATE
    // ==========================================
    function showLoadingState() {
        document.getElementById('trackingResults').style.display = 'none';
        document.getElementById('errorState').style.display = 'none';
        document.getElementById('loadingState').style.display = 'block';
    }

    // ==========================================
    // SHOW ERROR STATE
    // ==========================================
    function showErrorState() {
        document.getElementById('trackingResults').style.display = 'none';
        document.getElementById('loadingState').style.display = 'none';
        document.getElementById('errorState').style.display = 'block';
    }

    // ==========================================
    // DISPLAY TRACKING RESULTS
    // ==========================================
    function displayTrackingResults(booking) {
        // Hide loading and error states
        document.getElementById('loadingState').style.display = 'none';
        document.getElementById('errorState').style.display = 'none';
        document.getElementById('trackingResults').style.display = 'block';

        // Update status card
        updateStatusCard(booking);
        
        // Update timeline
        updateTimeline(booking);
        
        // Update package details
        updatePackageDetails(booking);
        
        // Update status history
        updateStatusHistory(booking);
        
        // Scroll to results
        setTimeout(() => {
            document.getElementById('trackingResults').scrollIntoView({ 
                behavior: 'smooth', 
                block: 'start' 
            });
        }, 100);
    }

    // ==========================================
    // UPDATE STATUS CARD
    // ==========================================
    function updateStatusCard(booking) {
        const statusBadge = document.getElementById('statusBadge');
        const statusText = document.getElementById('statusText');
        const displayTrackingId = document.getElementById('displayTrackingId');
        const estimatedDelivery = document.getElementById('estimatedDelivery');

        // Update tracking ID
        displayTrackingId.textContent = booking.trackingId;

        // Update status
        statusText.textContent = booking.status;
        
        // Set status icon
        const statusIcons = {
            'Pending': 'fa-clock',
            'Confirmed': 'fa-check-circle',
            'Picked Up': 'fa-hand-holding-box',
            'In Transit': 'fa-truck-fast',
            'Out for Delivery': 'fa-motorcycle',
            'Delivered': 'fa-circle-check'
        };
        
        const icon = statusBadge.querySelector('i');
        icon.className = 'fas ' + (statusIcons[booking.status] || 'fa-box');

        // Calculate estimated delivery
        const pickupDate = new Date(booking.pickupDate);
        const deliveryDays = {
            'express': 0,
            'standard': 2,
            'economy': 5
        };
        
        const daysToAdd = deliveryDays[booking.deliveryType] || 2;
        const estimatedDate = new Date(pickupDate);
        estimatedDate.setDate(estimatedDate.getDate() + daysToAdd);
        
        if (booking.status === 'Delivered') {
            const deliveredDate = booking.statusHistory.find(h => h.status === 'Delivered');
            if (deliveredDate) {
                estimatedDelivery.textContent = 'Delivered on ' + formatDate(deliveredDate.timestamp);
            }
        } else {
            estimatedDelivery.textContent = formatDate(estimatedDate.toISOString());
        }
    }

    // ==========================================
    // UPDATE TIMELINE
    // ==========================================
    function updateTimeline(booking) {
        const statusOrder = [
            'Pending',
            'Confirmed', 
            'Picked Up',
            'In Transit',
            'Out for Delivery',
            'Delivered'
        ];

        const currentStatusIndex = statusOrder.indexOf(booking.status);
        
        // Update all timeline items
        const timelineItems = document.querySelectorAll('.timeline-item');
        
        timelineItems.forEach((item, index) => {
            item.classList.remove('active', 'completed');
            
            if (index < currentStatusIndex) {
                item.classList.add('completed');
            } else if (index === currentStatusIndex) {
                item.classList.add('active');
            }
        });

        // Update timestamps from status history
        booking.statusHistory.forEach(history => {
            const statusKey = history.status.toLowerCase().replace(/ /g, '-');
            const timelineElement = document.getElementById('timeline' + 
                history.status.replace(/ /g, ''));
            
            if (timelineElement) {
                timelineElement.textContent = formatDateTime(history.timestamp);
            }
        });
    }

    // ==========================================
    // UPDATE PACKAGE DETAILS
    // ==========================================
    function updatePackageDetails(booking) {
        // Package Information
        document.getElementById('detailPackageType').textContent = 
            capitalizeFirst(booking.packageType);
        document.getElementById('detailWeight').textContent = 
            booking.packageWeight + ' kg';
        document.getElementById('detailSize').textContent = 
            capitalizeFirst(booking.packageSize);
        document.getElementById('detailDeliveryType').textContent = 
            capitalizeFirst(booking.deliveryType) + ' Delivery';

        // Sender Information
        document.getElementById('detailSenderName').textContent = booking.senderName;
        document.getElementById('detailSenderPhone').textContent = booking.senderPhone;
        document.getElementById('detailSenderLocation').textContent = 
            booking.pickupCity + ', ' + booking.pickupState;

        // Receiver Information
        document.getElementById('detailReceiverName').textContent = booking.receiverName;
        document.getElementById('detailReceiverPhone').textContent = booking.receiverPhone;
        document.getElementById('detailReceiverLocation').textContent = 
            booking.deliveryCity + ', ' + booking.deliveryState;

        // Delivery Timeline
        document.getElementById('detailPickupDate').textContent = 
            formatDate(booking.pickupDate);
        document.getElementById('detailBookedDate').textContent = 
            formatDateTime(booking.createdAt);
        document.getElementById('detailLastUpdated').textContent = 
            formatDateTime(booking.updatedAt);
    }

    // ==========================================
    // UPDATE STATUS HISTORY
    // ==========================================
    function updateStatusHistory(booking) {
        const statusHistory = document.getElementById('statusHistory');
        statusHistory.innerHTML = '';

        // Sort history by timestamp (newest first)
        const sortedHistory = [...booking.statusHistory].sort((a, b) => 
            new Date(b.timestamp) - new Date(a.timestamp)
        );

        sortedHistory.forEach(history => {
            const historyItem = document.createElement('div');
            historyItem.className = 'history-item';
            historyItem.innerHTML = `
                <div class="history-item-content">
                    <h4>${history.status}</h4>
                    <p>${history.note || 'Status updated'}</p>
                </div>
                <div class="history-time">
                    ${formatDateTime(history.timestamp)}
                </div>
            `;
            statusHistory.appendChild(historyItem);
        });
    }

    // ==========================================
    // RESET TRACKING FUNCTION
    // ==========================================
    window.resetTracking = function() {
        document.getElementById('trackingInput').value = '';
        document.getElementById('trackingResults').style.display = 'none';
        document.getElementById('errorState').style.display = 'none';
        document.getElementById('loadingState').style.display = 'none';
        
        // Scroll to search form
        document.querySelector('.search-container').scrollIntoView({ 
            behavior: 'smooth' 
        });
        
        // Focus on input
        document.getElementById('trackingInput').focus();

        // Clear URL parameters
        window.history.replaceState({}, document.title, window.location.pathname);
    };

    // ==========================================
    // UTILITY FUNCTIONS
    // ==========================================
    function formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }

    function formatDateTime(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    function capitalizeFirst(str) {
        if (!str) return '';
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    // ==========================================
    // CHECK USER LOGIN STATUS
    // ==========================================
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const loginBtn = document.querySelector('.btn-login');
    
    if (currentUser && loginBtn) {
        loginBtn.innerHTML = `<i class="fas fa-user-circle"></i> ${currentUser.name}`;
        loginBtn.href = getDashboardUrl(currentUser.role);
    }

    function getDashboardUrl(role) {
        const dashboardUrls = {
            'customer': 'customer-dashboard.html',
            'rider': 'rider-dashboard.html',
            'admin': 'admin-dashboard.html'
        };
        return dashboardUrls[role] || 'login.html';
    }

    // ==========================================
    // NOTIFICATION SYSTEM
    // ==========================================
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
            top: 100px;
            right: 20px;
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
        }, 5000);
    }

    // Add notification animations
    if (!document.querySelector('#notificationStyles')) {
        const style = document.createElement('style');
        style.id = 'notificationStyles';
        style.innerHTML = `
            @keyframes slideInRight {
                from {
                    transform: translateX(400px);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
            
            @keyframes slideOutRight {
                from {
                    transform: translateX(0);
                    opacity: 1;
                }
                to {
                    transform: translateX(400px);
                    opacity: 0;
                }
            }

            .notification-content {
                display: flex;
                align-items: center;
                gap: 12px;
                font-size: 1rem;
            }

            .notification-content i {
                font-size: 1.5rem;
            }

            @media (max-width: 640px) {
                .notification {
                    right: 10px;
                    left: 10px;
                    max-width: none;
                }
            }
        `;
        document.head.appendChild(style);
    }

    // ==========================================
    // AUTO-REFRESH FOR ACTIVE DELIVERIES
    // ==========================================
    let refreshInterval;

    function startAutoRefresh(trackingId) {
        // Clear any existing interval
        if (refreshInterval) {
            clearInterval(refreshInterval);
        }

        // Refresh every 30 seconds for active deliveries
        refreshInterval = setInterval(() => {
            const bookings = JSON.parse(localStorage.getItem('bookings') || '[]');
            const booking = bookings.find(b => b.trackingId === trackingId);
            
            if (booking && booking.status !== 'Delivered') {
                // Update display without showing loading state
                displayTrackingResults(booking);
            } else {
                // Stop refresh if delivered
                clearInterval(refreshInterval);
            }
        }, 30000); // 30 seconds
    }

    // ==========================================
    // CREATE SAMPLE BOOKINGS FOR TESTING
    // ==========================================
    function createSampleBookings() {
        const bookings = JSON.parse(localStorage.getItem('bookings') || '[]');
        
        // Only create samples if no bookings exist
        if (bookings.length === 0) {
            const sampleBookings = [
                {
                    trackingId: 'AFL12345678ABCD',
                    customerId: 'customer_001',
                    customerName: 'Sample User',
                    packageType: 'parcel',
                    packageWeight: '2.5',
                    packageSize: 'medium',
                    packageValue: '50000',
                    packageDescription: 'Electronics - Smartphone',
                    pickupAddress: '123 Lagos Street',
                    pickupCity: 'Lagos',
                    pickupState: 'Lagos',
                    pickupDate: new Date().toISOString().split('T')[0],
                    pickupTime: 'morning',
                    deliveryAddress: '456 Abuja Avenue',
                    deliveryCity: 'Abuja',
                    deliveryState: 'FCT',
                    deliveryType: 'express',
                    senderName: 'John Doe',
                    senderPhone: '+234 800 111 2222',
                    senderEmail: 'john@example.com',
                    receiverName: 'Jane Smith',
                    receiverPhone: '+234 800 333 4444',
                    receiverEmail: 'jane@example.com',
                    specialInstructions: 'Handle with care',
                    status: 'In Transit',
                    price: 3500,
                    createdAt: new Date(Date.now() - 86400000).toISOString(),
                    updatedAt: new Date().toISOString(),
                    statusHistory: [
                        {
                            status: 'Pending',
                            timestamp: new Date(Date.now() - 86400000).toISOString(),
                            note: 'Order placed'
                        },
                        {
                            status: 'Confirmed',
                            timestamp: new Date(Date.now() - 82800000).toISOString(),
                            note: 'Order confirmed and assigned to rider'
                        },
                        {
                            status: 'Picked Up',
                            timestamp: new Date(Date.now() - 79200000).toISOString(),
                            note: 'Package picked up from sender'
                        },
                        {
                            status: 'In Transit',
                            timestamp: new Date(Date.now() - 3600000).toISOString(),
                            note: 'Package is on the way'
                        }
                    ]
                }
            ];
            
            localStorage.setItem('bookings', JSON.stringify(sampleBookings));
            console.log('Sample booking created with tracking ID: AFL12345678ABCD');
        }
    }

    // Create sample bookings for demo purposes
    createSampleBookings();

    console.log('AF Logistics Tracking Page Initialized Successfully! 📍');
    console.log('Try tracking ID: AFL12345678ABCD');
});
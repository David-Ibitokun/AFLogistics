// ==========================================
// AF LOGISTICS - BOOKING PAGE JAVASCRIPT
// Multi-Step Form Logic & Booking System
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
    // MULTI-STEP FORM NAVIGATION
    // ==========================================
    let currentStep = 1;
    const totalSteps = 4;
    const formSteps = document.querySelectorAll('.form-step');
    const progressSteps = document.querySelectorAll('.progress-steps .step');

    // Initialize: Set minimum date to today for pickup date
    const pickupDateInput = document.getElementById('pickupDate');
    if (pickupDateInput) {
        const today = new Date().toISOString().split('T')[0];
        pickupDateInput.setAttribute('min', today);
    }

    // Next Button Handlers
    document.querySelectorAll('.btn-next').forEach(btn => {
        btn.addEventListener('click', function() {
            const nextStep = parseInt(this.getAttribute('data-next'));
            
            if (validateStep(currentStep)) {
                goToStep(nextStep);
            }
        });
    });

    // Back Button Handlers
    document.querySelectorAll('.btn-back').forEach(btn => {
        btn.addEventListener('click', function() {
            const prevStep = parseInt(this.getAttribute('data-prev'));
            goToStep(prevStep);
        });
    });

    function goToStep(step) {
        // Update form steps
        formSteps.forEach((formStep, index) => {
            formStep.classList.remove('active');
            if (index === step - 1) {
                formStep.classList.add('active');
            }
        });

        // Update progress steps
        progressSteps.forEach((progressStep, index) => {
            progressStep.classList.remove('active', 'completed');
            const stepNum = index + 1;
            
            if (stepNum < step) {
                progressStep.classList.add('completed');
            } else if (stepNum === step) {
                progressStep.classList.add('active');
            }
        });

        // Update current step and scroll to top
        currentStep = step;
        window.scrollTo({ top: 0, behavior: 'smooth' });

        // If moving to step 4, populate confirmation
        if (step === 4) {
            populateConfirmation();
        }
    }

    // ==========================================
    // FORM VALIDATION
    // ==========================================
    function validateStep(step) {
        let isValid = true;
        const currentFormStep = document.querySelector(`.form-step[data-step="${step}"]`);
        
        if (!currentFormStep) return false;

        // Get all required inputs in current step
        const requiredInputs = currentFormStep.querySelectorAll('[required]');
        
        requiredInputs.forEach(input => {
            if (input.type === 'radio') {
                const radioGroup = currentFormStep.querySelectorAll(`input[name="${input.name}"]`);
                const isChecked = Array.from(radioGroup).some(radio => radio.checked);
                
                if (!isChecked) {
                    isValid = false;
                    showNotification('Please select a delivery type', 'error');
                }
            } else if (!input.value.trim()) {
                isValid = false;
                input.style.borderColor = '#e74c3c';
                
                // Reset border color after 2 seconds
                setTimeout(() => {
                    input.style.borderColor = '';
                }, 2000);
            }
        });

        // Step-specific validation
        if (step === 1) {
            const weight = document.getElementById('packageWeight').value;
            if (weight && parseFloat(weight) <= 0) {
                showNotification('Package weight must be greater than 0', 'error');
                return false;
            }
        }

        if (step === 3) {
            // Validate email format
            const senderEmail = document.getElementById('senderEmail').value;
            if (senderEmail && !isValidEmail(senderEmail)) {
                showNotification('Please enter a valid sender email', 'error');
                return false;
            }

            const receiverEmail = document.getElementById('receiverEmail').value;
            if (receiverEmail && !isValidEmail(receiverEmail)) {
                showNotification('Please enter a valid receiver email', 'error');
                return false;
            }

            // Validate phone format
            const senderPhone = document.getElementById('senderPhone').value;
            const receiverPhone = document.getElementById('receiverPhone').value;
            
            if (!isValidPhone(senderPhone) || !isValidPhone(receiverPhone)) {
                showNotification('Please enter valid phone numbers', 'error');
                return false;
            }
        }

        if (!isValid) {
            showNotification('Please fill in all required fields', 'error');
        }

        return isValid;
    }

    // ==========================================
    // POPULATE CONFIRMATION STEP
    // ==========================================
    function populateConfirmation() {
        // Package Details
        document.getElementById('confirmPackageType').textContent = 
            document.getElementById('packageType').options[document.getElementById('packageType').selectedIndex].text;
        document.getElementById('confirmWeight').textContent = 
            document.getElementById('packageWeight').value + ' kg';
        document.getElementById('confirmSize').textContent = 
            document.getElementById('packageSize').options[document.getElementById('packageSize').selectedIndex].text;
        document.getElementById('confirmDescription').textContent = 
            document.getElementById('packageDescription').value;

        // Pickup Details
        document.getElementById('confirmPickupAddress').textContent = 
            document.getElementById('pickupAddress').value;
        document.getElementById('confirmPickupCity').textContent = 
            document.getElementById('pickupCity').value + ', ' + document.getElementById('pickupState').value;
        
        const pickupDate = new Date(document.getElementById('pickupDate').value);
        const pickupTime = document.getElementById('pickupTime').options[document.getElementById('pickupTime').selectedIndex].text;
        document.getElementById('confirmPickupDateTime').textContent = 
            pickupDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) + ' - ' + pickupTime;

        // Delivery Details
        document.getElementById('confirmDeliveryAddress').textContent = 
            document.getElementById('deliveryAddress').value;
        document.getElementById('confirmDeliveryCity').textContent = 
            document.getElementById('deliveryCity').value + ', ' + document.getElementById('deliveryState').value;
        
        const selectedDelivery = document.querySelector('input[name="deliveryType"]:checked');
        const deliveryTypeText = selectedDelivery.parentElement.querySelector('h4').textContent;
        document.getElementById('confirmDeliveryType').textContent = deliveryTypeText;

        // Contact Details
        document.getElementById('confirmSender').textContent = 
            document.getElementById('senderName').value;
        document.getElementById('confirmSenderPhone').textContent = 
            document.getElementById('senderPhone').value;
        document.getElementById('confirmReceiver').textContent = 
            document.getElementById('receiverName').value;
        document.getElementById('confirmReceiverPhone').textContent = 
            document.getElementById('receiverPhone').value;

        // Calculate and display pricing
        calculatePrice();
    }

    // ==========================================
    // PRICE CALCULATION
    // ==========================================
    function calculatePrice() {
        const selectedDelivery = document.querySelector('input[name="deliveryType"]:checked');
        const weight = parseFloat(document.getElementById('packageWeight').value) || 0;

        // Base prices
        const basePrices = {
            express: 3500,
            standard: 2000,
            economy: 1200
        };

        const baseFee = basePrices[selectedDelivery.value] || 0;
        
        // Weight charge: ₦200 per kg above 5kg
        let weightCharge = 0;
        if (weight > 5) {
            weightCharge = (weight - 5) * 200;
        }

        const total = baseFee + weightCharge;

        // Update display
        document.getElementById('baseFee').textContent = '₦' + baseFee.toLocaleString();
        document.getElementById('weightCharge').textContent = '₦' + weightCharge.toLocaleString();
        document.getElementById('totalAmount').textContent = '₦' + total.toLocaleString();

        return total;
    }

    // ==========================================
    // FORM SUBMISSION
    // ==========================================
    const bookingForm = document.getElementById('bookingForm');
    
    bookingForm.addEventListener('submit', async function(e) {
        e.preventDefault();

        // Check if user is logged in
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        
        if (!currentUser) {
            showNotification('Please login to book a delivery', 'error');
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 2000);
            return;
        }

        // Generate tracking ID
        const trackingId = generateTrackingId();
        
        // Get selected delivery type
        const selectedDelivery = document.querySelector('input[name="deliveryType"]:checked');
        const deliveryType = selectedDelivery.value;

        // Create booking object
        const booking = {
            trackingId: trackingId,
            customerId: currentUser.id,
            customerName: currentUser.name,
            
            // Package Details
            packageType: document.getElementById('packageType').value,
            packageWeight: document.getElementById('packageWeight').value,
            packageSize: document.getElementById('packageSize').value,
            packageValue: document.getElementById('packageValue').value || '0',
            packageDescription: document.getElementById('packageDescription').value,
            
            // Pickup Details
            pickupAddress: document.getElementById('pickupAddress').value,
            pickupCity: document.getElementById('pickupCity').value,
            pickupState: document.getElementById('pickupState').value,
            pickupDate: document.getElementById('pickupDate').value,
            pickupTime: document.getElementById('pickupTime').value,
            
            // Delivery Details
            deliveryAddress: document.getElementById('deliveryAddress').value,
            deliveryCity: document.getElementById('deliveryCity').value,
            deliveryState: document.getElementById('deliveryState').value,
            deliveryType: deliveryType,
            
            // Contact Details
            senderName: document.getElementById('senderName').value,
            senderPhone: document.getElementById('senderPhone').value,
            senderEmail: document.getElementById('senderEmail').value,
            receiverName: document.getElementById('receiverName').value,
            receiverPhone: document.getElementById('receiverPhone').value,
            receiverEmail: document.getElementById('receiverEmail').value || '',
            
            // Special Instructions
            specialInstructions: document.getElementById('specialInstructions').value || '',
            
            // Booking Details
            status: 'Pending',
            price: calculatePrice(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            
            // History tracking
            statusHistory: [
                {
                    status: 'Pending',
                    timestamp: new Date().toISOString(),
                    note: 'Booking created'
                }
            ]
        };

        // Save booking to database via API
        try {
            const response = await fetch('/api/bookings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(booking)
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to create booking');
            }

            const savedBooking = await response.json();
            
            // Show success message with tracking ID
            showSuccessModal(savedBooking.trackingId);
        } catch (error) {
            console.error('Booking error:', error);
            showNotification(error.message || 'Failed to create booking. Please try again.', 'error');
        }
    });

    // ==========================================
    // SUCCESS MODAL
    // ==========================================
    function showSuccessModal(trackingId) {
        // Create modal
        const modal = document.createElement('div');
        modal.className = 'success-modal';
        modal.innerHTML = `
            <div class="modal-overlay"></div>
            <div class="modal-content">
                <div class="success-icon">
                    <i class="fas fa-check-circle"></i>
                </div>
                <h2>Booking Successful!</h2>
                <p>Your delivery has been booked successfully.</p>
                <div class="tracking-id-display">
                    <span>Tracking ID:</span>
                    <strong>${trackingId}</strong>
                    <button class="btn-copy" onclick="copyTrackingId('${trackingId}')">
                        <i class="fas fa-copy"></i> Copy
                    </button>
                </div>
                <p class="modal-note">Please save this tracking ID to track your delivery.</p>
                <div class="modal-actions">
                    <a href="tracking.html?id=${trackingId}" class="btn btn-primary">
                        <i class="fas fa-location-dot"></i> Track Order
                    </a>
                    <a href="customer-dashboard.html" class="btn btn-secondary">
                        <i class="fas fa-dashboard"></i> Go to Dashboard
                    </a>
                </div>
            </div>
        `;

        // Add modal styles
        const style = document.createElement('style');
        style.innerHTML = `
            .success-modal {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                z-index: 10000;
                display: flex;
                align-items: center;
                justify-content: center;
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
                padding: 3rem;
                border-radius: 20px;
                max-width: 500px;
                width: 90%;
                text-align: center;
                animation: slideUp 0.4s ease;
                box-shadow: 0 10px 50px rgba(0, 0, 0, 0.3);
            }

            .success-icon {
                width: 80px;
                height: 80px;
                background: linear-gradient(135deg, #0A9E4B, #0FBF5F);
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                margin: 0 auto 1.5rem;
                animation: scaleUp 0.5s ease 0.2s both;
            }

            .success-icon i {
                font-size: 3rem;
                color: white;
            }

            .modal-content h2 {
                font-size: 2rem;
                color: #1A1A1A;
                margin-bottom: 1rem;
            }

            .modal-content > p {
                color: #666666;
                margin-bottom: 2rem;
                font-size: 1.1rem;
            }

            .tracking-id-display {
                background: #F8F9FA;
                padding: 1.5rem;
                border-radius: 12px;
                margin-bottom: 1rem;
                border: 2px solid #0A9E4B;
            }

            .tracking-id-display span {
                display: block;
                color: #666666;
                font-size: 0.9rem;
                margin-bottom: 0.5rem;
            }

            .tracking-id-display strong {
                display: block;
                font-size: 1.8rem;
                color: #0A9E4B;
                margin-bottom: 1rem;
                letter-spacing: 2px;
            }

            .btn-copy {
                padding: 8px 20px;
                background: #0A9E4B;
                color: white;
                border: none;
                border-radius: 20px;
                cursor: pointer;
                font-weight: 600;
                transition: all 0.3s ease;
            }

            .btn-copy:hover {
                background: #087A3A;
                transform: translateY(-2px);
            }

            .modal-note {
                font-size: 0.9rem;
                color: #999;
                margin-bottom: 2rem;
            }

            .modal-actions {
                display: flex;
                gap: 1rem;
                justify-content: center;
                flex-wrap: wrap;
            }

            .btn-secondary {
                background: transparent;
                color: #0A9E4B;
                border: 2px solid #0A9E4B;
            }

            .btn-secondary:hover {
                background: #0A9E4B;
                color: white;
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

            @keyframes scaleUp {
                from {
                    transform: scale(0);
                }
                to {
                    transform: scale(1);
                }
            }

            @media (max-width: 640px) {
                .modal-content {
                    padding: 2rem;
                }

                .modal-actions {
                    flex-direction: column;
                }

                .modal-actions .btn {
                    width: 100%;
                }
            }
        `;

        document.head.appendChild(style);
        document.body.appendChild(modal);
    }

    // ==========================================
    // COPY TRACKING ID FUNCTION
    // ==========================================
    window.copyTrackingId = function(trackingId) {
        navigator.clipboard.writeText(trackingId).then(() => {
            showNotification('Tracking ID copied to clipboard!', 'success');
        }).catch(() => {
            // Fallback for older browsers
            const textarea = document.createElement('textarea');
            textarea.value = trackingId;
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand('copy');
            document.body.removeChild(textarea);
            showNotification('Tracking ID copied to clipboard!', 'success');
        });
    };

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
        `;
        document.head.appendChild(style);
    }

    // ==========================================
    // UTILITY FUNCTIONS
    // ==========================================
    function generateTrackingId() {
        const prefix = 'AFL';
        const timestamp = Date.now().toString().slice(-8);
        const random = Math.random().toString(36).substr(2, 4).toUpperCase();
        return `${prefix}${timestamp}${random}`;
    }

    function isValidEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    function isValidPhone(phone) {
        const re = /^[\d\s\-\+\(\)]+$/;
        return re.test(phone) && phone.replace(/\D/g, '').length >= 10;
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

    console.log('AF Logistics Booking Page Initialized Successfully! 📦');
});
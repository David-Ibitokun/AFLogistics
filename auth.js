// ==========================================
// AF LOGISTICS - AUTHENTICATION JAVASCRIPT
// Login, Register & User Management
// ==========================================

document.addEventListener('DOMContentLoaded', function() {
    // Flag: whether local API is available to persist users
    let apiAvailable = false;
    
    // ==========================================
    // ==========================================
    // INITIALIZE DEMO BOOKINGS
    // ==========================================
    function initializeDemoBookings() {
        const bookings = JSON.parse(localStorage.getItem('bookings') || '[]');
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        
        // Only create demo bookings if none exist and we have a user
        if (bookings.length === 0 && currentUser) {
            // Create dummy IDs for demo purposes if not strictly relating to the current user
            // or just use generic IDs.
            const customerId = currentUser.role === 'customer' ? currentUser.id : 'customer_1';
            const riderId = currentUser.role === 'rider' ? currentUser.id : 'rider_1';
            
            // For demo purposes, we will just use the current user data if it matches role,
            // otherwise use placeholders.
             const customerUser = currentUser.role === 'customer' ? currentUser : {
                id: 'customer_1',
                name: 'John Customer',
                email: 'customer@example.com',
                phone: '+234 800 000 0002'
            };

            const riderUser = currentUser.role === 'rider' ? currentUser : {
                 id: 'rider_1',
                name: 'Mike Rider',
                email: 'rider@example.com',
                phone: '+234 800 000 0003'
            };

            const demoBookings = [
                // Customer's Active Booking - In Transit
                {
                    trackingId: 'AFL' + Date.now(),
                    customerId: customerUser.id,
                    customerName: customerUser.name,
                    customerEmail: customerUser.email,
                    riderId: riderUser.id,
                    riderName: riderUser.name,
                    status: 'In Transit',
                    packageType: 'document',
                    packageWeight: 2,
                    packageSize: 'small',
                    packageDescription: 'Important business documents',
                    pickupAddress: '15 Victoria Island Road',
                    pickupCity: 'Lagos',
                    pickupState: 'Lagos',
                    pickupDate: new Date().toISOString().split('T')[0],
                    deliveryAddress: '89 Allen Avenue, Ikeja',
                    deliveryCity: 'Ikeja',
                    deliveryState: 'Lagos',
                    senderName: customerUser.name,
                    senderPhone: customerUser.phone || '+234 800 000 0002',
                    receiverName: 'Jane Business',
                    receiverPhone: '+234 803 123 4567',
                    deliveryType: 'express',
                    price: 3500,
                    createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
                    updatedAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
                    statusHistory: [
                        {
                            status: 'Pending',
                            timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
                            note: 'Booking created'
                        },
                        {
                            status: 'Confirmed',
                            timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
                            note: `Assigned to rider ${riderUser.name}`
                        },
                        {
                            status: 'Picked Up',
                            timestamp: new Date(Date.now() - 90 * 60 * 1000).toISOString(),
                            note: 'Package picked up'
                        },
                        {
                            status: 'In Transit',
                            timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
                            note: 'Package in transit'
                        }
                    ]
                },
                
                // Customer's Pending Booking
                {
                    trackingId: 'AFL' + (Date.now() + 1),
                    customerId: customerUser.id,
                    customerName: customerUser.name,
                    customerEmail: customerUser.email,
                    riderId: null,
                    riderName: null,
                    status: 'Pending',
                    packageType: 'parcel',
                    packageWeight: 5,
                    packageSize: 'medium',
                    packageDescription: 'Electronics - Handle with care',
                    pickupAddress: '23 Herbert Macaulay Way',
                    pickupCity: 'Lagos',
                    pickupState: 'Lagos',
                    pickupDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                    deliveryAddress: '45 Admiralty Way, Lekki',
                    deliveryCity: 'Lekki',
                    deliveryState: 'Lagos',
                    senderName: customerUser.name,
                    senderPhone: customerUser.phone || '+234 800 000 0002',
                    receiverName: 'Mike Tech',
                    receiverPhone: '+234 805 987 6543',
                    deliveryType: 'standard',
                    price: 2500,
                    createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
                    updatedAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
                    statusHistory: [
                        {
                            status: 'Pending',
                            timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
                            note: 'Booking created'
                        }
                    ]
                },
                
                // Customer's Delivered Booking
                {
                    trackingId: 'AFL' + (Date.now() + 2),
                    customerId: customerUser.id,
                    customerName: customerUser.name,
                    customerEmail: customerUser.email,
                    riderId: riderUser.id,
                    riderName: riderUser.name,
                    status: 'Delivered',
                    packageType: 'package',
                    packageWeight: 3,
                    packageSize: 'small',
                    packageDescription: 'Gift items',
                    pickupAddress: '12 Broad Street',
                    pickupCity: 'Lagos',
                    pickupState: 'Lagos',
                    pickupDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                    deliveryAddress: '67 Awolowo Road',
                    deliveryCity: 'Ikoyi',
                    deliveryState: 'Lagos',
                    senderName: customerUser.name,
                    senderPhone: customerUser.phone || '+234 800 000 0002',
                    receiverName: 'Sarah Gift',
                    receiverPhone: '+234 807 654 3210',
                    deliveryType: 'express',
                    price: 4000,
                    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
                    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
                    statusHistory: [
                        {
                            status: 'Pending',
                            timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
                            note: 'Booking created'
                        },
                        {
                            status: 'Confirmed',
                            timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 30 * 60 * 1000).toISOString(),
                            note: `Assigned to rider ${riderUser.name}`
                        },
                        {
                            status: 'Picked Up',
                            timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000 - 2 * 60 * 60 * 1000).toISOString(),
                            note: 'Package picked up'
                        },
                        {
                            status: 'In Transit',
                            timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000 - 1 * 60 * 60 * 1000).toISOString(),
                            note: 'Package in transit'
                        },
                        {
                            status: 'Out for Delivery',
                            timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000 - 30 * 60 * 1000).toISOString(),
                            note: 'Out for delivery'
                        },
                        {
                            status: 'Delivered',
                            timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
                            note: 'Package delivered successfully'
                        }
                    ]
                },
                
                // Rider's Active Delivery - Confirmed
                {
                    trackingId: 'AFL' + (Date.now() + 3),
                    customerId: users.find(u => u.role === 'admin')?.id || 'admin_123',
                    customerName: 'Test Customer A',
                    customerEmail: 'testA@example.com',
                    riderId: riderUser.id,
                    riderName: riderUser.name,
                    status: 'Confirmed',
                    packageType: 'document',
                    packageWeight: 1,
                    packageSize: 'small',
                    packageDescription: 'Legal documents',
                    pickupAddress: '5 Marina Road',
                    pickupCity: 'Lagos',
                    pickupState: 'Lagos',
                    pickupDate: new Date().toISOString().split('T')[0],
                    deliveryAddress: '90 Akin Adesola Street',
                    deliveryCity: 'Victoria Island',
                    deliveryState: 'Lagos',
                    senderName: 'Legal Firm Ltd',
                    senderPhone: '+234 801 111 2222',
                    receiverName: 'Corporate Office',
                    receiverPhone: '+234 802 333 4444',
                    deliveryType: 'express',
                    price: 5000,
                    createdAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
                    updatedAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
                    statusHistory: [
                        {
                            status: 'Pending',
                            timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
                            note: 'Booking created'
                        },
                        {
                            status: 'Confirmed',
                            timestamp: new Date(Date.now() - 40 * 60 * 1000).toISOString(),
                            note: `Assigned to rider ${riderUser.name}`
                        }
                    ]
                },
                
                // Rider's Completed Delivery (Today)
                {
                    trackingId: 'AFL' + (Date.now() + 4),
                    customerId: users.find(u => u.role === 'admin')?.id || 'admin_123',
                    customerName: 'Test Customer B',
                    customerEmail: 'testB@example.com',
                    riderId: riderUser.id,
                    riderName: riderUser.name,
                    status: 'Delivered',
                    packageType: 'parcel',
                    packageWeight: 4,
                    packageSize: 'medium',
                    packageDescription: 'Office supplies',
                    pickupAddress: '33 Murtala Mohammed Way',
                    pickupCity: 'Lagos',
                    pickupState: 'Lagos',
                    pickupDate: new Date().toISOString().split('T')[0],
                    deliveryAddress: '78 Opebi Road',
                    deliveryCity: 'Ikeja',
                    deliveryState: 'Lagos',
                    senderName: 'Supplies Inc',
                    senderPhone: '+234 803 555 6666',
                    receiverName: 'Office Manager',
                    receiverPhone: '+234 804 777 8888',
                    deliveryType: 'standard',
                    price: 3000,
                    createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
                    updatedAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
                    statusHistory: [
                        {
                            status: 'Pending',
                            timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
                            note: 'Booking created'
                        },
                        {
                            status: 'Confirmed',
                            timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
                            note: `Assigned to rider ${riderUser.name}`
                        },
                        {
                            status: 'Picked Up',
                            timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
                            note: 'Package picked up'
                        },
                        {
                            status: 'In Transit',
                            timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
                            note: 'Package in transit'
                        },
                        {
                            status: 'Out for Delivery',
                            timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
                            note: 'Out for delivery'
                        },
                        {
                            status: 'Delivered',
                            timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
                            note: 'Package delivered successfully'
                        }
                    ]
                }
            ];

            localStorage.setItem('bookings', JSON.stringify(demoBookings));
            
            console.log('%c✅ Demo Bookings Created!', 'color: #0A9E4B; font-weight: bold;');
            console.log(`   📦 Created ${demoBookings.length} demo bookings`);
            console.log(`   - Customer: 3 bookings (1 in transit, 1 pending, 1 delivered)`);
            console.log(`   - Rider: 2 deliveries (1 ready for pickup, 1 completed)`);
        } else {
            console.log(`%c✅ Bookings loaded: ${bookings.length}`, 'color: #0A9E4B; font-weight: bold;');
        }
    }



    // ==========================================
    // HANDLE LOGOUT FROM URL PARAMETER
    // ==========================================
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('logout') === 'true') {
        localStorage.removeItem('currentUser');
        localStorage.removeItem('rememberMe');
        console.log('%c✅ User logged out successfully', 'color: #0A9E4B; font-weight: bold;');
        
        window.history.replaceState({}, document.title, window.location.pathname);
        showNotification('Logged out successfully', 'success');
    }

    // ==========================================
    // LOGIN FORM HANDLER
    // ==========================================
    const loginFormElement = document.getElementById('loginFormElement');
    
    if (loginFormElement) {
        loginFormElement.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const email = document.getElementById('loginEmail').value.trim().toLowerCase();
            const password = document.getElementById('loginPassword').value;
            const rememberMe = document.getElementById('rememberMe').checked;
            
            console.log('%c🔐 Login Attempt:', 'color: #2196F3; font-weight: bold;');
            console.log('   Email:', email);
            
            if (!email || !password) {
                showNotification('Please fill in all fields', 'error');
                return;
            }

            if (!isValidEmail(email)) {
                showNotification('Please enter a valid email address', 'error');
                return;
            }


            let loginSuccess = false;
            
            try {
                const res = await fetch('/api/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password })
                });

                if (res.ok) {
                    loginSuccess = true;
                    const user = await res.json();
                    
                    console.log('%c✅ Login Successful!', 'color: #4CAF50; font-weight: bold;');
                    console.log('   User:', user.name);
                    console.log('   Role:', user.role);
                    
                    localStorage.setItem('currentUser', JSON.stringify(user));
                    
                    if (rememberMe) {
                        localStorage.setItem('rememberMe', 'true');
                    }
                    
                    showNotification('Login successful! Redirecting...', 'success');
                    
                    // Initialize demo bookings if needed
                    initializeDemoBookings();

                    setTimeout(() => {
                        const dashboardUrls = {
                            'admin': 'admin-dashboard.html',
                            'customer': 'customer-dashboard.html',
                            'rider': 'rider-dashboard.html'
                        };
                        
                        console.log('   Redirecting to:', dashboardUrls[user.role]);
                        window.location.href = dashboardUrls[user.role] || 'index.html';
                    }, 1000);
                } else {
                    const err = await res.json();
                    console.log('%c❌ Login Failed', 'color: #e74c3c; font-weight: bold;', err.error);
                    showNotification(err.error || 'Login failed', 'error');
                }
            } catch (error) {
                console.error('Login error:', error);
                // Only show error if login didn't succeed
                if (!loginSuccess) {
                    showNotification('Login failed. Server unavailable.', 'error');
                }
            }
        });
    }

    // ==========================================
    // REGISTER FORM HANDLER
    // ==========================================
    const registerFormElement = document.getElementById('registerFormElement');
    
    if (registerFormElement) {
        const accountTypeRadios = document.querySelectorAll('input[name="accountType"]');
        const riderFields = document.getElementById('riderFields');
        
        accountTypeRadios.forEach(radio => {
            radio.addEventListener('change', function() {
                if (this.value === 'rider') {
                    riderFields.style.display = 'block';
                    document.getElementById('registerAddress').setAttribute('required', 'required');
                    document.getElementById('registerCity').setAttribute('required', 'required');
                    document.getElementById('registerState').setAttribute('required', 'required');
                } else {
                    riderFields.style.display = 'none';
                    document.getElementById('registerAddress').removeAttribute('required');
                    document.getElementById('registerCity').removeAttribute('required');
                    document.getElementById('registerState').removeAttribute('required');
                }
            });
        });

        const passwordInput = document.getElementById('registerPassword');
        const strengthIndicator = document.getElementById('passwordStrength');
        
        if (passwordInput && strengthIndicator) {
            passwordInput.addEventListener('input', function() {
                const password = this.value;
                const strength = calculatePasswordStrength(password);
                strengthIndicator.className = 'password-strength ' + strength;
            });
        }

        registerFormElement.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const accountType = document.querySelector('input[name="accountType"]:checked').value;
            const name = document.getElementById('registerName').value.trim();
            const phone = document.getElementById('registerPhone').value.trim();
            const email = document.getElementById('registerEmail').value.trim().toLowerCase();
            const password = document.getElementById('registerPassword').value;
            const confirmPassword = document.getElementById('confirmPassword').value;
            const agreeTerms = document.getElementById('agreeTerms').checked;
            
            console.log('%c🔐 Registration Attempt:', 'color: #2196F3; font-weight: bold;');
            console.log('   Email:', email);
            console.log('   Account Type:', accountType);
            
            if (!name || !phone || !email || !password || !confirmPassword) {
                showNotification('Please fill in all required fields', 'error');
                return;
            }

            if (!isValidEmail(email)) {
                showNotification('Please enter a valid email address', 'error');
                return;
            }

            if (!isValidPhone(phone)) {
                showNotification('Please enter a valid phone number', 'error');
                return;
            }

            if (password.length < 6) {
                showNotification('Password must be at least 6 characters', 'error');
                return;
            }

            if (password !== confirmPassword) {
                showNotification('Passwords do not match', 'error');
                return;
            }

            if (!agreeTerms) {
                showNotification('Please agree to the Terms & Conditions', 'error');
                return;
            }

            const newUser = {
                // id will be assigned by server
                name: name,
                email: email,
                password: password,
                role: accountType,
                phone: phone,
                createdAt: new Date().toISOString()
            };

            if (accountType === 'rider') {
                newUser.address = document.getElementById('registerAddress').value.trim();
                newUser.city = document.getElementById('registerCity').value.trim();
                newUser.state = document.getElementById('registerState').value.trim();
            }

            try {
                const res = await fetch('/api/accounts', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(newUser)
                });

                if (res.status === 201) {
                    const created = await res.json();
                    
                    console.log('%c✅ Registration Successful!', 'color: #4CAF50; font-weight: bold;');
                    console.log('   New User:', created.name);

                    // Auto login
                    localStorage.setItem('currentUser', JSON.stringify(created));

                    showNotification('Registration successful! Redirecting...', 'success');
                    
                    // Initialize demo bookings
                    initializeDemoBookings();

                    setTimeout(() => {
                        const dashboardUrls = {
                            'customer': 'customer-dashboard.html',
                            'rider': 'rider-dashboard.html'
                        };
                        window.location.href = dashboardUrls[accountType] || 'index.html';
                    }, 1000);
                } else if (res.status === 409) {
                    showNotification('Email already registered', 'error');
                } else {
                    const err = await res.json();
                    showNotification(err.error || 'Registration failed', 'error');
                }
            } catch (err) {
                console.error('Server registration error', err);
                showNotification('Registration failed (server unreachable)', 'error');
            }
        });
    }

    // ==========================================
    // QUICK LOGIN (DEMO ACCOUNTS)
    // ==========================================
    window.quickLogin = function(role) {
        console.log('%c🚀 Quick Login:', 'color: #9C27B0; font-weight: bold;');
        console.log('   Role:', role);
        
        let demoEmail = '';
        let demoPassword = '';

        if (role === 'admin') {
            demoEmail = 'admin@aflogistics.com';
            demoPassword = 'admin123';
        } else if (role === 'customer') {
            demoEmail = 'customer@example.com';
            demoPassword = 'customer123';
        } else if (role === 'rider') {
            demoEmail = 'rider@example.com';
            demoPassword = 'rider123';
        }

        document.getElementById('loginEmail').value = demoEmail;
        document.getElementById('loginPassword').value = demoPassword;
        
        // Trigger submit
        const event = new Event('submit', {
            'bubbles': true,
            'cancelable': true
        });
        document.getElementById('loginFormElement').dispatchEvent(event);
    };

    // ==========================================
    // PASSWORD VISIBILITY TOGGLE
    // ==========================================
    window.togglePassword = function(inputId) {
        const input = document.getElementById(inputId);
        const button = input.parentElement.querySelector('.toggle-password');
        const icon = button.querySelector('i');
        
        if (input.type === 'password') {
            input.type = 'text';
            icon.classList.remove('fa-eye');
            icon.classList.add('fa-eye-slash');
        } else {
            input.type = 'password';
            icon.classList.remove('fa-eye-slash');
            icon.classList.add('fa-eye');
        }
    };

    // ==========================================
    // PASSWORD STRENGTH CALCULATOR
    // ==========================================
    function calculatePasswordStrength(password) {
        if (!password) return '';
        
        let strength = 0;
        
        if (password.length >= 8) strength++;
        if (password.length >= 12) strength++;
        if (/[a-z]/.test(password)) strength++;
        if (/[A-Z]/.test(password)) strength++;
        if (/[0-9]/.test(password)) strength++;
        if (/[^a-zA-Z0-9]/.test(password)) strength++;
        
        if (strength <= 2) return 'weak';
        if (strength <= 4) return 'medium';
        return 'strong';
    }

    // ==========================================
    // VALIDATION FUNCTIONS
    // ==========================================
    function isValidEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    function isValidPhone(phone) {
        const re = /^[\d\s\-\+\(\)]+$/;
        return re.test(phone) && phone.replace(/\D/g, '').length >= 10;
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
        }, 5000);
    }

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
                    right: 1rem;
                    left: 1rem;
                    top: 1rem;
                    max-width: none;
                }
            }
        `;
        document.head.appendChild(style);
    }

    // ==========================================
    // LOGOUT FUNCTION (GLOBAL)
    // ==========================================
    window.logout = function() {
        console.log('%c🚪 Logging out...', 'color: #FF9800; font-weight: bold;');
        
        localStorage.removeItem('currentUser');
        localStorage.removeItem('rememberMe');
        
        showNotification('Logged out successfully', 'success');
        
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 800);
    };

    // ==========================================
    // INITIALIZATION LOG
    // ==========================================
    console.log('%c🚀 AF Logistics Authentication System Ready!', 'color: #0A9E4B; font-weight: bold; font-size: 16px;');
    console.log('%cOpen Browser Console (F12) to see login/logout activity', 'color: #666; font-style: italic;');
});
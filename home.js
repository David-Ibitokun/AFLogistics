// ==========================================
// AF LOGISTICS - HOME PAGE JAVASCRIPT
// Interactive Features & Functionality
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
            
            // Animate hamburger icon
            const spans = navToggle.querySelectorAll('span');
            spans[0].style.transform = navMenu.classList.contains('active') 
                ? 'rotate(45deg) translate(5px, 5px)' 
                : 'rotate(0) translate(0, 0)';
            spans[1].style.opacity = navMenu.classList.contains('active') ? '0' : '1';
            spans[2].style.transform = navMenu.classList.contains('active') 
                ? 'rotate(-45deg) translate(7px, -6px)' 
                : 'rotate(0) translate(0, 0)';
        });

        // Close menu when clicking on a link
        const navLinks = navMenu.querySelectorAll('a');
        navLinks.forEach(link => {
            link.addEventListener('click', function() {
                if (window.innerWidth <= 968) {
                    navMenu.classList.remove('active');
                    const spans = navToggle.querySelectorAll('span');
                    spans[0].style.transform = 'rotate(0) translate(0, 0)';
                    spans[1].style.opacity = '1';
                    spans[2].style.transform = 'rotate(0) translate(0, 0)';
                }
            });
        });
    }

    // ==========================================
    // STICKY NAVBAR ON SCROLL
    // ==========================================
    const navbar = document.querySelector('.navbar');
    let lastScroll = 0;

    window.addEventListener('scroll', function() {
        const currentScroll = window.pageYOffset;
        
        if (currentScroll > 100) {
            navbar.style.background = 'rgba(255, 255, 255, 0.98)';
            navbar.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.1)';
        } else {
            navbar.style.background = '#ffffff';
            navbar.style.boxShadow = '0 4px 20px rgba(10, 158, 75, 0.1)';
        }
        
        lastScroll = currentScroll;
    });

    // ==========================================
    // QUICK TRACK FORM
    // ==========================================
    const quickTrackForm = document.getElementById('quickTrackForm');
    
    if (quickTrackForm) {
        quickTrackForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const trackingId = document.getElementById('quickTrackInput').value.trim();
            
            if (trackingId) {
                // Store tracking ID in session storage for tracking page
                sessionStorage.setItem('searchTrackingId', trackingId);
                
                // Redirect to tracking page
                window.location.href = 'tracking.html';
            } else {
                showNotification('Please enter a tracking ID', 'error');
            }
        });
    }

    // ==========================================
    // ANIMATED COUNTER FOR STATS
    // ==========================================
    const statNumbers = document.querySelectorAll('.stat-number');
    let counterAnimated = false;

    function animateCounter(element) {
        const target = parseInt(element.getAttribute('data-target'));
        const duration = 2000; // 2 seconds
        const increment = target / (duration / 16); // 60fps
        let current = 0;

        const updateCounter = () => {
            current += increment;
            if (current < target) {
                element.textContent = Math.floor(current).toLocaleString();
                requestAnimationFrame(updateCounter);
            } else {
                element.textContent = target.toLocaleString() + '+';
            }
        };

        updateCounter();
    }

    // Observe stats section for animation trigger
    const statsSection = document.querySelector('.stats');
    
    if (statsSection) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !counterAnimated) {
                    statNumbers.forEach(stat => animateCounter(stat));
                    counterAnimated = true;
                }
            });
        }, { threshold: 0.5 });

        observer.observe(statsSection);
    }

    // ==========================================
    // SMOOTH SCROLL FOR ANCHOR LINKS
    // ==========================================
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            
            // Skip if it's just "#"
            if (href === '#') {
                e.preventDefault();
                return;
            }
            
            const target = document.querySelector(href);
            
            if (target) {
                e.preventDefault();
                const offsetTop = target.offsetTop - 80; // Account for fixed navbar
                
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });

    // ==========================================
    // CONTACT FORM SUBMISSION
    // ==========================================
    const contactForm = document.getElementById('contactForm');
    
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get form data
            const formData = new FormData(contactForm);
            const data = {
                name: contactForm.querySelector('input[type="text"]').value,
                email: contactForm.querySelector('input[type="email"]').value,
                subject: contactForm.querySelectorAll('input[type="text"]')[1].value,
                message: contactForm.querySelector('textarea').value,
                timestamp: new Date().toISOString()
            };
            
            // Store contact messages in localStorage
            let messages = JSON.parse(localStorage.getItem('contactMessages') || '[]');
            messages.push(data);
            localStorage.setItem('contactMessages', JSON.stringify(messages));
            
            // Show success message
            showNotification('Thank you! Your message has been sent successfully.', 'success');
            
            // Reset form
            contactForm.reset();
        });
    }

    // ==========================================
    // FEATURE CARDS ANIMATION ON SCROLL
    // ==========================================
    const featureCards = document.querySelectorAll('.feature-card, .service-card');
    
    const cardObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                setTimeout(() => {
                    entry.target.style.animation = `fadeInUp 0.6s ease forwards`;
                }, index * 100);
                cardObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });

    featureCards.forEach(card => {
        card.style.opacity = '0';
        cardObserver.observe(card);
    });

    // ==========================================
    // NOTIFICATION SYSTEM
    // ==========================================
    function showNotification(message, type = 'info') {
        // Remove existing notification if any
        const existingNotification = document.querySelector('.notification');
        if (existingNotification) {
            existingNotification.remove();
        }

        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
                <span>${message}</span>
            </div>
        `;

        // Add styles
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

        // Add to body
        document.body.appendChild(notification);

        // Auto remove after 5 seconds
        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 5000);
    }

    // Add notification animations to page
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
    // INITIALIZE USER SESSION
    // ==========================================
    function initializeUserSession() {
        // Check if user is logged in
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        const loginBtn = document.querySelector('.btn-login');
        
        if (currentUser && loginBtn) {
            // Update login button to show user profile
            loginBtn.innerHTML = `<i class="fas fa-user-circle"></i> ${currentUser.name}`;
            loginBtn.href = getDashboardUrl(currentUser.role);
        }
    }

    // Get dashboard URL based on user role
    function getDashboardUrl(role) {
        const dashboardUrls = {
            'customer': 'customer-dashboard.html',
            'rider': 'rider-dashboard.html',
            'admin': 'admin-dashboard.html'
        };
        return dashboardUrls[role] || 'login.html';
    }

    // Initialize session on page load
    initializeUserSession();

    // ==========================================
    // PARALLAX EFFECT ON HERO SECTION
    // ==========================================
    const hero = document.querySelector('.hero');
    
    if (hero) {
        window.addEventListener('scroll', function() {
            const scrolled = window.pageYOffset;
            const parallaxSpeed = 0.5;
            
            if (scrolled < hero.offsetHeight) {
                hero.style.transform = `translateY(${scrolled * parallaxSpeed}px)`;
            }
        });
    }

    // ==========================================
    // LAZY LOAD IMAGES
    // ==========================================
    const images = document.querySelectorAll('img[src]');
    
    const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.style.animation = 'fadeIn 0.5s ease';
                imageObserver.unobserve(img);
            }
        });
    });

    images.forEach(img => imageObserver.observe(img));

    // ==========================================
    // BACK TO TOP BUTTON
    // ==========================================
    const backToTopBtn = document.createElement('button');
    backToTopBtn.innerHTML = '<i class="fas fa-arrow-up"></i>';
    backToTopBtn.className = 'back-to-top';
    backToTopBtn.style.cssText = `
        position: fixed;
        bottom: 30px;
        right: 30px;
        background: #0A9E4B;
        color: white;
        border: none;
        width: 50px;
        height: 50px;
        border-radius: 50%;
        cursor: pointer;
        display: none;
        align-items: center;
        justify-content: center;
        font-size: 1.2rem;
        box-shadow: 0 4px 15px rgba(10, 158, 75, 0.3);
        transition: all 0.3s ease;
        z-index: 1000;
    `;
    
    document.body.appendChild(backToTopBtn);

    window.addEventListener('scroll', function() {
        if (window.pageYOffset > 500) {
            backToTopBtn.style.display = 'flex';
        } else {
            backToTopBtn.style.display = 'none';
        }
    });

    backToTopBtn.addEventListener('click', function() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });

    backToTopBtn.addEventListener('mouseenter', function() {
        this.style.transform = 'translateY(-5px)';
        this.style.boxShadow = '0 6px 20px rgba(10, 158, 75, 0.4)';
    });

    backToTopBtn.addEventListener('mouseleave', function() {
        this.style.transform = 'translateY(0)';
        this.style.boxShadow = '0 4px 15px rgba(10, 158, 75, 0.3)';
    });

    // ==========================================
    // INITIALIZE DEFAULT ADMIN IF NONE EXISTS
    // ==========================================
    function initializeDefaultUsers() {
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        
        // Create default admin if no users exist
        if (users.length === 0) {
            const defaultAdmin = {
                id: 'admin_' + Date.now(),
                name: 'Admin User',
                email: 'admin@aflogistics.com',
                password: 'admin123',
                role: 'admin',
                phone: '+234 800 000 0000',
                createdAt: new Date().toISOString()
            };
            
            users.push(defaultAdmin);
            localStorage.setItem('users', JSON.stringify(users));
            
            console.log('Default admin created - Email: admin@aflogistics.com, Password: admin123');
        }
    }

    // Initialize default users on first load
    initializeDefaultUsers();

    // ==========================================
    // PAGE LOAD ANIMATION
    // ==========================================
    document.body.style.opacity = '0';
    
    window.addEventListener('load', function() {
        document.body.style.transition = 'opacity 0.5s ease';
        document.body.style.opacity = '1';
    });

    console.log('AF Logistics Home Page Initialized Successfully! 🚀');
});

// ==========================================
// UTILITY FUNCTIONS
// ==========================================

// Format date
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

// Generate random tracking ID
function generateTrackingId() {
    const prefix = 'AFL';
    const timestamp = Date.now().toString().slice(-8);
    const random = Math.random().toString(36).substr(2, 4).toUpperCase();
    return `${prefix}${timestamp}${random}`;
}

// Validate email
function isValidEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

// Validate phone
function isValidPhone(phone) {
    const re = /^[\d\s\-\+\(\)]+$/;
    return re.test(phone) && phone.replace(/\D/g, '').length >= 10;
}
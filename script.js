
// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Header scroll hide/show functionality
let lastScrollY = window.scrollY;
let ticking = false;

function updateHeader() {
    const header = document.querySelector('.header');
    const currentScrollY = window.scrollY;

    // Add glass effect
    if (currentScrollY > 30) {
        header.style.backgroundColor = 'rgba(255, 255, 255, 0.8)';
        header.style.backdropFilter = 'blur(20px) saturate(180%)';
        header.style.webkitBackdropFilter = 'blur(20px) saturate(180%)';
        header.style.borderBottom = '1px solid rgba(255, 255, 255, 0.2)';
    } else {
        header.style.backgroundColor = 'transparent';
        header.style.backdropFilter = 'none';
        header.style.webkitBackdropFilter = 'none';
        header.style.borderBottom = 'none';
    }

    // Hide/show header based on scroll direction
    if (currentScrollY > lastScrollY && currentScrollY > 100) {
        // Scrolling down - hide header
        header.style.transform = 'translateY(-100%)';
        header.style.transition = 'transform 0.3s ease-in-out';
    } else if (currentScrollY < lastScrollY) {
        // Scrolling up - show header
        header.style.transform = 'translateY(0)';
        header.style.transition = 'transform 0.3s ease-in-out';
    }

    lastScrollY = currentScrollY;
    ticking = false;
}

function requestTick() {
    if (!ticking) {
        requestAnimationFrame(updateHeader);
        ticking = true;
    }
}

window.addEventListener('scroll', requestTick);

// Add intersection observer for fade-in animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver(function (entries) {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe project cards for animation
document.querySelectorAll('.project-card').forEach(card => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(20px)';
    card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(card);
});

// Logo hover effect - change to image
const logo = document.querySelector('.logo');
const originalText = logo.textContent;

logo.addEventListener('mouseenter', function () {
    this.innerHTML = '<img src="images/logo.svg" alt="Logo" style="width: 48px; height: 48px; display: block;">';
});

logo.addEventListener('mouseleave', function () {
    this.textContent = originalText;
});

// Contact Modal Functions - Optimized
let modal = null;
let isModalOpen = false;

// Cache modal element to avoid repeated DOM queries
function getModal() {
    if (!modal) {
        modal = document.getElementById('contactModal');
    }
    return modal;
}

function openModal() {
    if (isModalOpen) return; // Prevent multiple opens

    const modalElement = getModal();
    if (modalElement) {
        isModalOpen = true;
        modalElement.style.display = 'block';
        document.body.style.overflow = 'hidden';

        // Use requestAnimationFrame to ensure smooth animation
        requestAnimationFrame(() => {
            modalElement.classList.add('show');
        });
    }
}

function closeModal() {
    if (!isModalOpen) return; // Prevent multiple closes

    const modalElement = getModal();
    if (modalElement) {
        isModalOpen = false;
        modalElement.classList.remove('show');
        document.body.style.overflow = 'auto';

        // Hide modal after animation completes
        setTimeout(() => {
            if (!isModalOpen) {
                modalElement.style.display = 'none';
            }
        }, 200);
    }
}

// Optimized event listeners with event delegation
let modalEventListenersAdded = false;

function addModalEventListeners() {
    if (modalEventListenersAdded) return;
    modalEventListenersAdded = true;

    // Close modal when clicking outside of it
    document.addEventListener('click', function (event) {
        const modalElement = getModal();
        if (modalElement && event.target === modalElement && isModalOpen) {
            closeModal();
        }
    }, { passive: true });

    // Close modal with Escape key
    document.addEventListener('keydown', function (event) {
        if (event.key === 'Escape' && isModalOpen) {
            closeModal();
        }
    }, { passive: true });
}

// Initialize modal event listeners
addModalEventListeners();

// Mobile Menu Functionality
function toggleMobileMenu() {
    const overlay = document.getElementById('mobileMenuOverlay');
    const hamburger = document.querySelector('.hamburger');
    const mobileNav = document.querySelector('.mobile-nav');
    const body = document.body;
    const html = document.documentElement;
    
    if (overlay && hamburger && mobileNav) {
        overlay.classList.toggle('active');
        hamburger.classList.toggle('active');
        body.classList.toggle('mobile-menu-open');
        html.classList.toggle('mobile-menu-open');
        
        // Hide mobile nav when menu is open
        if (overlay.classList.contains('active')) {
            mobileNav.style.display = 'none';
            // Prevent scrolling
            body.style.overflow = 'hidden';
            html.style.overflow = 'hidden';
        } else {
            mobileNav.style.display = 'flex';
            // Restore scrolling
            body.style.overflow = '';
            html.style.overflow = '';
        }
    }
}

// Scrollbar visibility control
let scrollTimeout;
function handleScroll() {
    // Add scrolling class
    document.documentElement.classList.add('scrolling');
    
    // Clear existing timeout
    clearTimeout(scrollTimeout);
    
    // Remove scrolling class after scroll stops
    scrollTimeout = setTimeout(() => {
        document.documentElement.classList.remove('scrolling');
    }, 150);
}

// Add scroll event listener
window.addEventListener('scroll', handleScroll, { passive: true });

// Close mobile menu when clicking on overlay
document.addEventListener('DOMContentLoaded', function() {
    const overlay = document.getElementById('mobileMenuOverlay');
    if (overlay) {
        overlay.addEventListener('click', function(e) {
            if (e.target === this) {
                toggleMobileMenu();
            }
        });

        // Close mobile menu when clicking on nav links
        document.querySelectorAll('.mobile-nav-link').forEach(link => {
            link.addEventListener('click', function() {
                toggleMobileMenu();
            });
        });
    }
});

/**
 * Holiday Destination Finder - JavaScript
 * Stage 1: Bootstrap Navigation with Contact Section
 */

document.addEventListener('DOMContentLoaded', function() {
    console.log('Holiday Destination Finder initialized with Bootstrap');
    
    // Initialize destination card handlers
    initDestinationCards();
    
    // Initialize contact form
    initContactForm();
    
    // Initialize smooth scroll for nav links
    initSmoothScroll();
});

/**
 * Initialize destination card click handlers
 */
function initDestinationCards() {
    const buttons = document.querySelectorAll('[data-city]');
    
    buttons.forEach(button => {
        button.addEventListener('click', function() {
            const cityName = this.getAttribute('data-city');
            alert(`You selected ${cityName}! Search functionality will be added in Stage 2.`);
        });
    });
}

/**
 * Initialize contact form
 */
function initContactForm() {
    const form = document.getElementById('contactForm');
    
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const message = document.getElementById('message').value;
            
            // Show success message
            alert(`Thank you ${name}! Your message has been received. We'll get back to you at ${email} soon.`);
            
            // Reset form
            form.reset();
        });
    }
}

/**
 * Initialize smooth scroll for navigation links
 */
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            
            // Only handle same-page links
            if (href !== '#' && href.startsWith('#')) {
                const targetId = href.substring(1);
                const targetElement = document.getElementById(targetId);
                
                if (targetElement) {
                    e.preventDefault();
                    targetElement.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                    
                    // Close mobile menu if open
                    const navbarCollapse = document.getElementById('navbarNav');
                    if (navbarCollapse && navbarCollapse.classList.contains('show')) {
                        const bsCollapse = bootstrap.Collapse.getInstance(navbarCollapse);
                        if (bsCollapse) {
                            bsCollapse.hide();
                        }
                    }
                }
            }
        });
    });
}
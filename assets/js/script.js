/**
 *  script.js for index.html
 * --------------------------------
 * Practical behaviour:
 *  - Smoothly scroll to in-page sections (e.g. #contact)
 *  - Close the Bootstrap navbar on mobile after a link is clicked
 */

document.addEventListener('DOMContentLoaded', function () {
    // Initialise smooth scrolling for in-page links
    initSmoothScroll();
});

/**
 * initSmoothScroll
 * ----------------
 * Enhances any anchor links whose href starts with "#"
 * (these are same-page links like #contact).
 *
 * When clicked:
 *  - Prevents the default instant jump
 *  - Scrolls smoothly to the target section
 *  - Closes the Bootstrap navbar if it's open (mobile view)
 */
function initSmoothScroll() {
    // Select all links where href begins with "#"
    const anchors = document.querySelectorAll('a[href^="#"]');

    anchors.forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');

            // Ignore just "#" which doesn't point to a real element
            if (href !== '#' && href.startsWith('#')) {
                const targetId = href.substring(1); // remove "#"
                const targetElement = document.getElementById(targetId);

                if (targetElement) {
                    // Stop the browser "jump" behaviour
                    e.preventDefault();

                    // Scroll smoothly to the element
                    targetElement.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });

                    // If the Bootstrap navbar is open (mobile), close it
                    const navbarCollapse = document.getElementById('navbarNav');
                    if (navbarCollapse && navbarCollapse.classList.contains('show')) {
                        // Get existing Bootstrap Collapse instance
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

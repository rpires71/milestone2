/**
 *  script.js for index.html
 * --------------------------------
 * Practical behaviour:
 *  - Smoothly scroll to in-page sections (e.g. #contact)
 *  - Close the Bootstrap navbar on mobile after a link is clicked
 */

document.addEventListener("DOMContentLoaded", function () {
  initSmoothScroll();
  setActiveNavLink();

  // If the hash changes (e.g. user clicks a #popular link),
  // update the active nav item accordingly.
  window.addEventListener("hashchange", setActiveNavLink);
});

/**
 * TC001 - Step 7 - Fix
 * Decide which navbar link should be .active based on:
 *  - window.location.hash  (#popular / #contact)
 *  - window.location.pathname (index.html / search.html / packages.html)
 */
function setActiveNavLink() {
  const navLinks = document.querySelectorAll(".navbar-nav .nav-link");
  const path = window.location.pathname.split("/").pop() || "index.html";
  const hash = window.location.hash;

  // Clear any existing active/aria-current
  navLinks.forEach((link) => {
    link.classList.remove("active");
    link.removeAttribute("aria-current");
  });

  let selector = null;

  if (hash === "#popular") {
    // Any nav link that ends with "#popular" or is exactly "#popular"
    selector = '.navbar-nav .nav-link[href="#popular"], .navbar-nav .nav-link[href$="#popular"]';
  } else if (hash === "#contact") {
    selector = '.navbar-nav .nav-link[href="#contact"], .navbar-nav .nav-link[href$="#contact"]';
  } else {
    // No hash → highlight by page
    if (path === "" || path === "index.html") {
      selector = '.navbar-nav .nav-link[href="index.html"]';
    } else if (path === "search.html") {
      selector = '.navbar-nav .nav-link[href="search.html"]';
    } else if (path === "packages.html") {
      selector = '.navbar-nav .nav-link[href="packages.html"]';
    }
  }

  if (selector) {
    const activeLink = document.querySelector(selector);
    if (activeLink) {
      activeLink.classList.add("active");
      activeLink.setAttribute("aria-current", "page");
    }
  }
}

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
 * 
 * TC001 - Step 7 - Fix
 * Smooth scrolling for same-page anchors (href="#..."), plus:
 *  - update URL hash
 *  - refresh active nav state
 *  - close mobile navbar if open
 */
function initSmoothScroll() {
  
  var history = window.history;

  const anchors = document.querySelectorAll('a[href^="#"]');

  anchors.forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      const href = this.getAttribute("href");

      // Ignore plain "#" which has no real target
      if (!href || href === "#" || !href.startsWith("#")) return;

      const targetId = href.substring(1);
      const targetElement = document.getElementById(targetId);

      if (!targetElement) return;

      e.preventDefault();

      // Smooth scroll to the section (Firefox + Edge friendly)
      targetElement.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });

      // Update the URL hash without another jump
      if (history.replaceState) {
        history.replaceState(null, "", href);
      } else {
        window.location.hash = href;
      }

      // Update which nav item is active (Popular / Contact)
      setActiveNavLink();

      // Close the mobile navbar if it's open
      const navbarCollapse = document.getElementById("navbarNav");
      if (navbarCollapse && navbarCollapse.classList.contains("show")) {
        const bsCollapse = bootstrap.Collapse.getInstance(navbarCollapse);
        if (bsCollapse) {
          bsCollapse.hide();
        }
      }
    });
  });
}


// Export for testing (Node.js/Jest environment)
// This allows Jest to import and test the function
if (typeof module !== "undefined" && module.exports) {
  module.exports = { initSmoothScroll };
}

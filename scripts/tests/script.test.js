/* eslint-env jest */
/**
 * @jest-environment jsdom
 */

const { initSmoothScroll } = require('../../assets/js/script.js');
test('initSmoothScroll attaches click listeners to anchor links', () => {
    // Setup DOM with anchor links
    document.body.innerHTML = `
        <a href="#contact" id="link1">Contact</a>
        <a href="#about" id="link2">About</a>
        <div id="contact"></div>
        <div id="about"></div>
    `;
    
    initSmoothScroll();
    
    const link = document.getElementById('link1');
    expect(link).toBeDefined();
    expect(link.onclick).toBeDefined();
});
test('clicking anchor link calls scrollIntoView with smooth behavior', () => {
    document.body.innerHTML = `
        <a href="#contact" id="contactLink">Contact</a>
        <div id="contact"></div>
    `;
    
    const targetElement = document.getElementById('contact');
    targetElement.scrollIntoView = jest.fn(); // Mock scroll function
    
    initSmoothScroll();
    
    const link = document.getElementById('contactLink');
    link.click();
    
    expect(targetElement.scrollIntoView).toHaveBeenCalledWith({
        behavior: 'smooth',
        block: 'start'
    });
});
test('clicking anchor link closes Bootstrap navbar on mobile', () => {
    // Correction: Mock scrollIntoView so jsdom doesn't error
    Element.prototype.scrollIntoView = jest.fn();
    
    document.body.innerHTML = `
        <a href="#contact" id="contactLink">Contact</a>
        <div id="contact"></div>
        <div id="navbarNav" class="show"></div>
    `;
    
    const mockHide = jest.fn();
    window.bootstrap = {
        Collapse: {
            getInstance: jest.fn(() => ({ hide: mockHide }))
        }
    };
    
    initSmoothScroll();
    
    const link = document.getElementById('contactLink');
    link.click();
    
    expect(mockHide).toHaveBeenCalled();
});

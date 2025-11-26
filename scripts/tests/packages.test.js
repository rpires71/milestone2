/* eslint-env jest */
/**
 * @jest-environment jsdom
 */
// Import functions to test
const { 
    getCityNameForUrls,
    setActiveBookingButton,
    bookHotel,
    bookFlights,
    bookPackage,
    bookActivities
} = require('../../assets/js/packages.js');

test('getCityNameForUrls returns global currentCityName if defined', () => {
    window.currentCityName = 'London';
    
    document.body.innerHTML = `
        <input id="citySearch" value="Paris" />
    `;
    
    const result = getCityNameForUrls();
    
    expect(result).toBe('London');
});
test('getCityNameForUrls returns trimmed input value if no global exists', () => {
    window.currentCityName = undefined;
    
    document.body.innerHTML = `
        <input id="citySearch" value="  Barcelona  " />
    `;
    
    const result = getCityNameForUrls();
    
    expect(result).toBe('Barcelona');
});
test('getCityNameForUrls returns empty string if nothing found', () => {
    window.currentCityName = undefined;
    
    document.body.innerHTML = `
        <input id="citySearch" value="   " />
    `;
    
    const result = getCityNameForUrls();
    
    expect(result).toBe('');
});
test('setActiveBookingButton highlights clicked button only', () => {
    document.body.innerHTML = `
        <button class="btn-action active booking-btn-primary">Hotels</button>
        <button class="btn-action booking-btn-secondary">Flights</button>
        <button class="btn-action booking-btn-secondary">Package</button>
    `;
    
    const buttons = document.querySelectorAll('.btn-action');
    const clickedButton = buttons[1]; // Flights button
    
    setActiveBookingButton(clickedButton);
    
    expect(buttons[0].classList.contains('active')).toBe(false);
    expect(buttons[1].classList.contains('active')).toBe(true);
    expect(buttons[2].classList.contains('active')).toBe(false);
    
    expect(buttons[1].classList.contains('booking-btn-primary')).toBe(true);
});
test('bookHotel shows alert if dates are missing', () => {
    document.body.innerHTML = `
        <input id="checkin" value="" />
        <input id="checkout" value="" />
        <input id="guests" value="2" />
        <input id="citySearch" value="Paris" />
    `;
    
    window.alert = jest.fn();
    window.open = jest.fn();
    
    const mockEvent = { currentTarget: document.createElement('button') };
    
    bookHotel(mockEvent);
    
    expect(window.alert).toHaveBeenCalledWith('Please select check-in and check-out dates');
    expect(window.open).not.toHaveBeenCalled();
});
test('bookHotel constructs correct Booking.com URL', () => {
    document.body.innerHTML = `
        <input id="checkin" value="2025-12-01" />
        <input id="checkout" value="2025-12-07" />
        <input id="guests" value="3" />
        <input id="citySearch" value="Rome" />
    `;
    
    window.open = jest.fn();
    window.currentCityName = undefined;
    
    const mockEvent = { currentTarget: document.createElement('button') };
    
    bookHotel(mockEvent);
    
    const expectedUrl = 'https://www.booking.com/searchresults.html?ss=Rome&checkin=2025-12-01&checkout=2025-12-07&group_adults=3&no_rooms=1';
    
    expect(window.open).toHaveBeenCalledWith(expectedUrl, '_blank');
});
test('bookFlights constructs correct Google Flights URL', () => {
    document.body.innerHTML = `
        <input id="checkin" value="2025-12-15" />
        <input id="checkout" value="2025-12-22" />
        <input id="citySearch" value="Tokyo" />
    `;
    
    window.open = jest.fn();
    window.currentCityName = undefined;
    
    const mockEvent = { currentTarget: document.createElement('button') };
    
    bookFlights(mockEvent);
    
    const openedUrl = window.open.mock.calls[0][0];
    
    expect(openedUrl).toContain('google.com/travel/flights');
    expect(openedUrl).toContain('Tokyo');
    expect(openedUrl).toContain('2025-12-15');
    expect(openedUrl).toContain('2025-12-22');
});
test('bookPackage constructs correct Expedia URL with encoded parameters', () => {
    document.body.innerHTML = `
        <input id="checkin" value="2025-11-10" />
        <input id="checkout" value="2025-11-17" />
        <input id="guests" value="4" />
        <input id="citySearch" value="New York" />
    `;
    
    window.open = jest.fn();
    window.currentCityName = undefined;
    
    const mockEvent = { currentTarget: document.createElement('button') };
    
    bookPackage(mockEvent);
    
    const openedUrl = window.open.mock.calls[0][0];
    
    expect(openedUrl).toContain('expedia.co.uk/go/package/search/FlightHotel');
    expect(openedUrl).toContain('2025-11-10');
    expect(openedUrl).toContain('2025-11-17');
    expect(openedUrl).toContain('FromAirport=LON');
    expect(openedUrl).toContain('Destination=New+York');
    expect(openedUrl).toContain('NumAdult=4');
});
test('bookPackage shows alert if check-out date is missing', () => {
    document.body.innerHTML = `
        <input id="checkin" value="2025-12-01" />
        <input id="checkout" value="" />
        <input id="guests" value="2" />
        <input id="citySearch" value="Paris" />
    `;
    
    window.alert = jest.fn();
    window.open = jest.fn();
    
    const mockEvent = { currentTarget: document.createElement('button') };
    
    bookPackage(mockEvent);
    
    expect(window.alert).toHaveBeenCalledWith('Please select both check-in and check-out dates for a package search.');
    expect(window.open).not.toHaveBeenCalled();
});
test('bookActivities extracts city from "City, Country" format', () => {
    document.body.innerHTML = `
        <input id="citySearch" value="Barcelona, Spain" />
    `;
    
    window.open = jest.fn();
    window.currentCityName = undefined;
    
    const mockEvent = { currentTarget: document.createElement('button') };
    
    bookActivities(mockEvent);
    
    const openedUrl = window.open.mock.calls[0][0];
    
    expect(openedUrl).toContain('getyourguide.com/s/?q=Barcelona');
    expect(openedUrl).not.toContain('Spain');
});
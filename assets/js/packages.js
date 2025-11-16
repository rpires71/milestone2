// Helper: get a usable city name (fallback to search input if needed)
function getCityNameForUrls() {
    let name = (typeof currentCityName !== 'undefined' && currentCityName) ? currentCityName : '';
    if (!name) {
        const input = document.getElementById('citySearch');
        if (input && input.value.trim()) name = input.value.trim();
    }
    // final fallback
    return name || '';
}

// Update setActiveBookingButton to accept the clicked element safely
function setActiveBookingButton(clickedButton) {
    // Remove booking-btn-primary from all and add secondary if you use these classes
    document.querySelectorAll('.btn-action').forEach(btn => {
        btn.classList.remove('booking-btn-primary');
        btn.classList.add('booking-btn-secondary');
        btn.classList.remove('active'); // also remove existing active
    });
    // Add active style to clicked
    if (clickedButton) {
        clickedButton.classList.add('booking-btn-primary');
        clickedButton.classList.add('active');
    }
}

/** Book hotels - redirects to Booking.com */
function bookHotel(ev) {
    const btn = ev && ev.currentTarget ? ev.currentTarget : ev;
    setActiveBookingButton(btn);

    const checkIn = document.getElementById('checkin').value;
    const checkOut = document.getElementById('checkout').value;
    const guests = document.getElementById('guests').value || 2;

    if (!checkIn || !checkOut) {
        alert('Please select check-in and check-out dates');
        return;
    }

    const cityName = getCityNameForUrls();
    const searchParam = encodeURIComponent(cityName);

    // Booking expects these params: ss (search string) & checkin/check_out in YYYY-MM-DD
    const bookingUrl = `https://www.booking.com/searchresults.html?ss=${searchParam}&checkin=${encodeURIComponent(checkIn)}&checkout=${encodeURIComponent(checkOut)}&group_adults=${encodeURIComponent(guests)}&no_rooms=1`;

    window.open(bookingUrl, '_blank');
}

/** Book flights - always departing from London (all airports - LON) */
function bookFlights(ev) {
    const btn = ev && ev.currentTarget ? ev.currentTarget : ev;
    setActiveBookingButton(btn);

    const checkIn = document.getElementById('checkin').value;
    const checkOut = document.getElementById('checkout').value;

    if (!checkIn) {
        alert('Please select a departure (check-in) date');
        return;
    }

    // Always depart from London (all airports)
    const origin = "London (LON)";

    // Destination from user search
    const dest = getCityNameForUrls().split(',')[0].trim() || '';
    const departDate = checkIn;
    const returnDate = checkOut || '';

    // Build a Google Flights query that respects LON as the origin
    let googleFlightsUrl =
        `https://www.google.com/travel/flights?q=Flights%20from%20${encodeURIComponent(origin)}%20to%20${encodeURIComponent(dest)}`;

    if (returnDate) {
        googleFlightsUrl += `%20departing%20${encodeURIComponent(departDate)}%20returning%20${encodeURIComponent(returnDate)}`;
    } else {
        googleFlightsUrl += `%20on%20${encodeURIComponent(departDate)}`;
    }

    window.open(googleFlightsUrl, '_blank');
}

/** Book complete package - Expedia packages, from London (all airports) */
function bookPackage(ev) {
    const btn = ev && ev.currentTarget ? ev.currentTarget : ev;
    setActiveBookingButton(btn);

    const checkIn = document.getElementById('checkin').value;
    const checkOut = document.getElementById('checkout').value;
    const guests = document.getElementById('guests').value || '2';

    if (!checkIn || !checkOut) {
        alert('Please select both check-in and check-out dates for a package search.');
        return;
    }

    // Get destination city from currentCityName or from the search box
    let city = '';
    if (typeof currentCityName !== 'undefined' && currentCityName) {
        city = currentCityName;
    } else {
        const input = document.getElementById('citySearch');
        if (input && input.value.trim()) {
            city = input.value.trim();
        }
    }

    if (!city) {
        alert('Please enter a destination city.');
        return;
    }

    // Expedia package deeplink (Flight + Hotel):
    // https://www.expedia.co.uk/go/package/search/FlightHotel/{FromDate}/{ToDate}
    // then query params: FromAirport, Destination, NumRoom, NumAdult, etc.
    const fromDate = checkIn;    // already YYYY-MM-DD
    const toDate   = checkOut;

    const baseUrl = `https://www.expedia.co.uk/go/package/search/FlightHotel/${encodeURIComponent(fromDate)}/${encodeURIComponent(toDate)}`;

    const params = new URLSearchParams({
        FromAirport: 'LON',                  // London – all airports
        Destination: city,                   // let Expedia interpret the city text
        NumRoom: '1',
        NumAdult: guests                     // you’re treating "guests" as adults
        // You could add NumChild / Child ages here later if needed
    });

    const expediaUrl = `${baseUrl}?${params.toString()}`;

    window.open(expediaUrl, '_blank');
}

/** Book activities - redirects to GetYourGuide */
function bookActivities(ev) {
    const btn = ev && ev.currentTarget ? ev.currentTarget : ev;
    setActiveBookingButton(btn);

    const city = getCityNameForUrls().split(',')[0].trim() || '';
    const getYourGuideUrl = `https://www.getyourguide.com/s/?q=${encodeURIComponent(city)}`;

    window.open(getYourGuideUrl, '_blank');
}

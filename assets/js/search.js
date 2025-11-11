// ========================================
// Holiday Destination Finder - Search Page JavaScript
// Using NEW Google Places API (google.maps.places.Place)
// ========================================

let map;
let markers = [];
let currentSearchType = 'tourist_attraction';
let infoWindows = [];

// Initialize the page
document.addEventListener('DOMContentLoaded', function () {
    console.log('Page loaded - initializing...');
    initializeActionButtons();
    initializeSearchButton();

    // Note: Google Maps will be initialized when a search is performed
});

// ========================================
// Action Buttons (Attractions, Restaurants, etc.)
// ========================================
function initializeActionButtons() {
    const actionButtons = document.querySelectorAll('.btn-action');

    actionButtons.forEach(button => {
        button.addEventListener('click', function () {
            // Remove active class from all buttons
            actionButtons.forEach(btn => btn.classList.remove('active'));

            // Add active class to clicked button
            this.classList.add('active');

            // Store the selected type
            currentSearchType = this.getAttribute('data-type');

            // If a search has already been performed, re-search with new type
            const cityInput = document.getElementById('citySearch');
            if (cityInput.value.trim() !== '') {
                performSearch(cityInput.value.trim());
            }
        });
    });
}

// ========================================
// Filter Places Function (for onclick handlers)
// ========================================
function filterPlaces(placeType, button) {
    console.log('filterPlaces called with type:', placeType);

    // Remove active class from all buttons
    const actionButtons = document.querySelectorAll('.btn-action');
    actionButtons.forEach(btn => btn.classList.remove('active'));

    // Add active class to clicked button
    button.classList.add('active');

    // Store the selected type
    currentSearchType = placeType;
    console.log('Current search type set to:', currentSearchType);

    // If a search has already been performed, re-search with new type
    const cityInput = document.getElementById('citySearch');
    if (cityInput.value.trim() !== '') {
        console.log('Re-searching with new type for city:', cityInput.value.trim());
        performSearch(cityInput.value.trim());
    } else {
        console.log('No city entered yet - waiting for search');
    }
}


// ========================================
// Search Button
// ========================================
function initialiseSearchButton() {
    const searchBtn = document.getElementById('searchBtn');
    const cityInput = document.getElementById('citySearch');

    searchBtn.addEventListener('click', function () {
        const cityName = cityInput.value.trim();

        if (cityName === '') {
            alert('Please enter a city name');
            return;
        }

        performSearch(cityName);
    });

    // Allow Enter key to trigger search
    cityInput.addEventListener('keypress', function (e) {
        if (e.key === 'Enter') {
            searchBtn.click();
        }
    });
}

// ========================================
// Handle Search Function (for onclick handler)
// ========================================
function handleSearch() {
    console.log('handleSearch called');
    const cityInput = document.getElementById('citySearch');
    const cityName = cityInput.value.trim();

    console.log('City name:', cityName);

    if (cityName === '') {
        alert('Please enter a city name');
        return;
    }

    performSearch(cityName);
}

// ========================================
// Perform Search
// ========================================
function performSearch(cityName) {
    console.log('performSearch called for:', cityName, 'Type:', currentSearchType);

    // Show results section
    document.getElementById('resultsSection').style.display = 'block';

    // Initialise map if not already initialised
    if (!map) {
        console.log('Initializing map...');
        initMap();
    }

    // Use Google Geocoding to find the city
    const geocoder = new google.maps.Geocoder();

    geocoder.geocode({ address: cityName }, function (results, status) {
        console.log('Geocode status:', status);

        if (status === 'OK') {
            const location = results[0].geometry.location;
            console.log('Location found:', location.lat(), location.lng());

            // Center map on the city
            map.setCenter(location);
            map.setZoom(13);

            // Search for places using NEW API
            searchNearbyPlacesNew(location);

            // Smooth scroll to results
            document.getElementById('resultsSection').scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        } else {
            alert('City not found. Please try another city name.');
            console.error('Geocode error: ' + status);
        }
    });
}

// ========================================
// Initialise Google Maps
// ========================================
function initMap() {
    // Default center (London)
    const defaultLocation = { lat: 51.5074, lng: -0.1278 };

    map = new google.maps.Map(document.getElementById('map'), {
        center: defaultLocation,
        zoom: 13,
        mapId: 'DEMO_MAP_ID', // Required for Advanced Markers
        /*styles: [
            {
                featureType: 'water',
                elementType: 'geometry',
                stylers: [{ color: '#90E0EF' }]
            },
            {
                featureType: 'landscape',
                elementType: 'geometry',
                stylers: [{ color: '#FAF3E0' }]
            }
        ]*/
    });

    console.log('Map initialised successfully');
}


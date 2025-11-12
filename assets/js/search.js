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
function initializeSearchButton() {
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

// ========================================
// Search Nearby Places - NEW PLACES API
// ========================================
async function searchNearbyPlacesNew(location) {
    console.log('Searching nearby places with NEW API for type:', currentSearchType);

    // Clear existing markers
    clearMarkers();

    // Clear existing results
    const resultsList = document.getElementById('resultsList');
    resultsList.innerHTML = '<div class="text-center text-muted py-3"><i class="bi bi-hourglass-split"></i> Loading results...</div>';

    try {
        // Convert type to includedTypes format
        const includedTypes = [currentSearchType];

        console.log('Search parameters:', {
            location: { lat: location.lat(), lng: location.lng() },
            radius: 5000,
            includedTypes: includedTypes
        });

        // NEW API: Use searchNearby
        const { places } = await google.maps.places.Place.searchNearby({
            locationRestriction: {           // Different parameter name
                center: {                    // Plain object
                    lat: location.lat(),     // Call methods to get numbers
                    lng: location.lng()
                },
                radius: 5000                 // Radius goes inside
            },
            includedTypes: includedTypes,
            maxResultCount: 20,
            fields: ['displayName', 'location', 'rating', 'formattedAddress', 'regularOpeningHours']
        });

        console.log('Places found:', places ? places.length : 0);

        if (places && places.length > 0) {
            // Display results
            displayResultsNew(places);

            // Add markers to map
            places.forEach((place, index) => {
                createMarkerNew(place, index);
            });
        } else {
            resultsList.innerHTML = '<div class="alert alert-info">No results found for this location and category. Try a different filter or city.</div>';
        }

    } catch (error) {
        console.error('Error searching places:', error);

        let errorMessage = 'Error searching places. ';

        if (error.message.includes('API key')) {
            errorMessage += 'Check that your API key is valid and has Places API (New) enabled.';
        } else if (error.message.includes('billing')) {
            errorMessage += 'Billing must be enabled in Google Cloud Console.';
        } else {
            errorMessage += error.message;
        }

        resultsList.innerHTML = `<div class="alert alert-danger">${errorMessage}</div>`;
    }
}

// ========================================
// Display Results in Panel - NEW API FORMAT
// ========================================
function displayResultsNew(places) {
    const resultsList = document.getElementById('resultsList');
    resultsList.innerHTML = '';

    places.forEach((place, index) => {
        const resultItem = document.createElement('div');
        resultItem.className = 'result-item';
        resultItem.setAttribute('data-index', index);

        // Get place details
        const name = place.displayName || 'Unknown Place';
        const address = place.formattedAddress || 'Address not available';
        const rating = place.rating || null;
        const isOpen = place.regularOpeningHours?.openNow;

        // Build rating stars
        let ratingHTML = '';
        if (rating) {
            const fullStars = Math.floor(rating);
            const hasHalfStar = rating % 1 >= 0.5;

            for (let i = 0; i < fullStars; i++) {
                ratingHTML += '<i class="bi bi-star-fill"></i>';
            }
            if (hasHalfStar) {
                ratingHTML += '<i class="bi bi-star-half"></i>';
            }
            ratingHTML += ` <span>${rating.toFixed(1)}</span>`;
        }

        resultItem.innerHTML = `
            <h5><i class="bi bi-geo-alt-fill me-2 text-primary"></i>${name}</h5>
            <p><i class="bi bi-pin-map me-2"></i>${address}</p>
            ${rating ? `<p class="rating">${ratingHTML}</p>` : ''}
            ${isOpen !== undefined ? `<p><i class="bi bi-clock me-2"></i>${isOpen ? '<span class="text-success">Open Now</span>' : '<span class="text-danger">Closed</span>'}</p>` : ''}
        `;

        // Add click event to center map on this location
        resultItem.addEventListener('click', function () {
            if (place.location) {
                map.setCenter(place.location);
                map.setZoom(16);

                // Bounce the corresponding marker
                if (markers[index]) {
                    // For standard markers, use animation
                    if (markers[index].setAnimation) {
                        markers[index].setAnimation(google.maps.Animation.BOUNCE);
                        setTimeout(() => {
                            markers[index].setAnimation(null);
                        }, 1400);
                    }
                }
            }
        });

        resultsList.appendChild(resultItem);
    });
}

// ========================================
// Create Map Markers - Using Standard Markers
// ========================================
function createMarkerNew(place, index) {
    if (!place.location) {
        console.warn('Place has no location:', place);
        return;
    }

    // Use standard Marker (works with all maps)
    const marker = new google.maps.Marker({
        map: map,
        position: place.location,
        title: place.displayName || 'Unknown Place',
        label: {
            text: (index + 1).toString(),
            color: 'white',
            fontWeight: 'bold'
        },
        icon: {
            path: google.maps.SymbolPath.CIRCLE,
            fillColor: '#0077B6', // Ocean Blue
            fillOpacity: 1,
            strokeColor: '#FF6B35', // Coral Orange
            strokeWeight: 3,
            scale: 15
        }
    });

    // Add info window
    const infowindow = new google.maps.InfoWindow({
        content: `
            <div style="padding: 10px; max-width: 200px;">
                <h6 style="margin: 0 0 5px 0; color: #0077B6; font-weight: bold;">${place.displayName || 'Unknown Place'}</h6>
                <p style="margin: 0; font-size: 0.9rem; color: #2F3E46;">${place.formattedAddress || ''}</p>
                ${place.rating ? `<p style="margin: 5px 0 0 0; color: #FF6B35; font-weight: bold;">⭐ ${place.rating.toFixed(1)}</p>` : ''}
            </div>
        `
    });

    marker.addListener('click', function () {
        // Close all other info windows
        infoWindows.forEach(iw => iw.close());

        infowindow.open(map, marker);
    });

    infoWindows.push(infowindow);
    markers.push(marker);
}

// ========================================
// Clear Markers
// ========================================
function clearMarkers() {
    markers.forEach(marker => {
        if (marker.setMap) {
            marker.setMap(null);
        }
    });
    markers = [];

    // Close all info windows
    infoWindows.forEach(iw => iw.close());
    infoWindows = [];
}

// ========================================
// Search City Function (for Popular Destinations buttons)
// ========================================
function searchCity(cityName) {
    console.log('searchCity called with:', cityName);
    document.getElementById('citySearch').value = cityName;
    performSearch(cityName);
}
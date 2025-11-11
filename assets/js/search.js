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


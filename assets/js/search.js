// =======================================================================
// HOLIDAY DESTINATION FINDER (search.html)
// Purpose: Powers the search page that lets users enter a city and filter
//          nearby places (Attractions, Restaurants, Hotels, Cafes, Shops).
//
// Key Responsibilities:
// 1) Reads user input from the search bar and category buttons.
// 2) Uses the NEW Google Places API to search for relevant locations.
// 3) Displays results dynamically in the results panel.
// 4) Creates markers on the map that match the result items.
// 5) Allows clicking a result to re-center and highlight on the map.
// =======================================================================

// =========================================================
// Holiday Destination Finder - Search Page JavaScript
// Using NEW Google Places API (google.maps.places.Place)
// =========================================================

// --- GLOBAL VARIABLES --------------------------------------------------
// These variables keep track of the current map, markers, and selected
// category. They are shared by multiple functions.

let map; // Stores the Google Map instance once created.
let markers = []; // List of currently displayed map markers.
let currentSearchType = "tourist_attraction"; // Default filter on page load.
let infoWindows = []; // Stores popup info windows for markers.

// --- INITIAL PAGE SETUP -----------------------------------------------
// When the HTML document finishes loading, these event listeners run to
// activate the search button and category buttons.

document.addEventListener("DOMContentLoaded", function () {
  console.log("Page loaded - initializing...");

  initializeActionButtons(); // Makes category buttons interactive.
  initializeSearchButton(); // Enables search bar and "Enter" key.

  // Note: The Google Map is NOT created here. It is created only when
  // a search is performed, which reduces unnecessary API usage.
});

// ===============================================================
// initialiseActionButtons()
// Purpose: Makes the category buttons (Attractions, Restaurants, Hotels, etc.)
// interactive by:
//  - Highlighting the selected button
//  - Updating the current search filter type (e.g., restaurant)
//  - Auto-refreshing search results if a city has already been entered
// ===============================================================
function initializeActionButtons() {
  // Select ALL elements that have the class .btn-action
  // These are the clickable category buttons in the search UI.
  const actionButtons = document.querySelectorAll(".btn-action");

  // Loop through each button and attach a click event listener
  actionButtons.forEach((button) => {
    button.addEventListener("click", function () {
      // STEP 1: Remove "active" class from ALL buttons
      // This visually un-highlights any previously selected category.
      actionButtons.forEach((btn) => btn.classList.remove("active"));

      // STEP 2: Highlight the clicked button
      // "this" refers to the button that was clicked.
      this.classList.add("active");

      // STEP 3: Save the category type selected by the user
      // Each button stores its type in a custom attribute: data-type=""
      currentSearchType = this.getAttribute("data-type");

      // STEP 4: If the user has already typed a city name,
      // automatic re-search of that city using the new category.
      const cityInput = document.getElementById("citySearch");

      // If the search box is not empty, re-run performSearch()
      // If the search box is not empty, re-run performSearch()
      if (cityInput && cityInput.value.trim() !== "") {
        performSearch(cityInput.value.trim());
      }
    });
  });
}

// ====================================================================
// filterPlaces(placeType, button)
// Purpose:
// This function is triggered by inline onclick attributes in the HTML,
// for example: onclick="filterPlaces('restaurant', this)"
//
// It updates the selected category (Attractions, Restaurants, Hotels…),
// highlights the clicked button, and refreshes the search results ONLY
// if a city has already been entered by the user.
// ====================================================================
function filterPlaces(placeType, button) {
  // Log in console for debugging which type of place was selected.
  console.log("filterPlaces called with type:", placeType);

  // --------------------------------------------------------------
  // STEP 1: Remove "active" class from all category buttons.
  // This ensures only ONE button at a time looks selected.
  // --------------------------------------------------------------
  const actionButtons = document.querySelectorAll(".btn-action");
  actionButtons.forEach((btn) => btn.classList.remove("active"));

  // --------------------------------------------------------------
  // STEP 2: Visually activate the button that the user just clicked.
  // "button" refers to the HTML element passed in via onclick.
  // --------------------------------------------------------------
  button.classList.add("active");

  // --------------------------------------------------------------
  // STEP 3: Update the current search filter (e.g., restaurant, hotel).
  // This tells the Google Places API what category to look for.
  // --------------------------------------------------------------
  currentSearchType = placeType;
  console.log("Current search type set to:", currentSearchType);

  // --------------------------------------------------------------
  // STEP 4: Check if the user already entered a city name.
  // If the search box is NOT empty, automatically re-perform the search
  // using the new filter type (e.g., switching from Restaurants to Cafes).
  // --------------------------------------------------------------
  const cityInput = document.getElementById("citySearch");

  if (cityInput && cityInput.value.trim() !== "") {
    console.log("Re-searching with new type for city:", cityInput.value.trim());
    performSearch(cityInput.value.trim());
  } else {
    // If no city has been typed, we do nothing to avoid wasted API calls.
    console.log("No city entered yet - waiting for search");
  }
}

// ===================================================================
// initializeSearchButton()
// Purpose:
// Enables the search button and allows "Enter" to trigger a search.
// It reads the city input, checks if it's valid, and then calls
// performSearch() to run the Google Places lookup.
// ===================================================================
function initializeSearchButton() {
  // Get a reference to the main search button and the text input box
  const searchBtn = document.getElementById("searchBtn");
  const cityInput = document.getElementById("citySearch");

  // ------------------------------------------------------------
  // CLICK EVENT: When user clicks on the search button, run search
  // ------------------------------------------------------------
  searchBtn.addEventListener("click", function () {
    // Read the city name and remove extra spaces (e.g., " London ")
    const cityName = cityInput.value.trim();

    // If the user hasn't typed anything, show a warning and stop
    if (cityName === "") {
      alert("Please enter a city name");
      return; // Stop here, do not run performSearch()
    }

    // If input is valid, start the Google Maps & Places search
    performSearch(cityName);
  });

  // ------------------------------------------------------------
  // ENTER KEY SUPPORT:
  // Pressing Enter inside the text box triggers the same action
  // as clicking the search button.
  // ------------------------------------------------------------
  cityInput.addEventListener("keypress", function (e) {
    // Check if the key pressed is the "Enter" key
    if (e.key === "Enter") {
      // Programmatically click the search button
      searchBtn.click();
    }
  });
}

// ========================================================================
// performSearch(cityName)
// Purpose:
// This is the MAIN search function of the application. It:
//   1) Reveals the results panel
//   2) Initializes Google Maps if needed
//   3) Converts the city name into map coordinates (geocoding)
//   4) Centers the map on that location
//   5) Calls the Places API to search for attractions, restaurants, etc.
//   6) Smoothly scrolls the user to the results section
//
// This function is triggered when the user presses "Search" or "Enter"
// and also when switching categories after a city has already been searched.
// ========================================================================
function performSearch(cityName) {
  // Log useful debugging information (city being searched + category selected)
  console.log(
    "performSearch called for:",
    cityName,
    "Type:",
    currentSearchType
  );
  // Store the searched city globally
  window.currentCityName = cityName;
  // -----------------------------------------------------------
  // STEP 1: Make sure the results panel becomes visible.
  // On load, this panel is hidden until a valid search happens.
  // -----------------------------------------------------------
  // Jest Test 2.5. fix
  const resultsSection = document.getElementById("resultsSection");
  if (resultsSection) {
    resultsSection.style.display = "block";
  }

  // -----------------------------------------------------------
  // STEP 2: Initialize the Google Map ONLY if one does not already exist.
  // This prevents reloading the whole map during every search.
  // -----------------------------------------------------------
  // Initialize map (with null check - Jest Test 2.5. fix)
  const mapElement = document.getElementById("map");
  if (!map && mapElement) {
    console.log("Initializing map...");
    initMap(); // Creates a map centered on a default location (London)
  }

  // -----------------------------------------------------------
  // STEP 3: Convert the cityName text (e.g., "Paris") into real
  // geographic coordinates (latitude & longitude).
  // Google Geocoder API does this translation.
  // -----------------------------------------------------------
  const geocoder = new google.maps.Geocoder();

  // Call the geocoding API asynchronously
  geocoder.geocode({ address: cityName }, function (results, status) {
    console.log("Geocode status:", status);

    // -----------------------------------------------------------
    // STEP 4: If the geocoder successfully recognized the city,
    // extract its coordinates and move the map to that location.
    // -----------------------------------------------------------
    if (status === "OK") {
      const location = results[0].geometry.location;
      console.log("Location found:", location.lat(), location.lng());

      // Center the map on the found city and set a good zoom level
      map.setCenter(location);
      map.setZoom(13);

      // -----------------------------------------------------------
      // STEP 5: Call the NEW Google Places API to search nearby.
      // It will search based on the selected category (restaurants, hotels, etc.)
      // -----------------------------------------------------------
      searchNearbyPlacesNew(location);

      // -----------------------------------------------------------
      // STEP 6: Smoothly scrolls the page down to the results panel.
      // Enhances user experience so they instantly see results appear.
      // -----------------------------------------------------------
      document.getElementById("resultsSection").scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    } else {
      // -----------------------------------------------------------
      // ERROR HANDLING: If Google cannot find the typed city,
      // warn the user and log details for debugging.
      // -----------------------------------------------------------
      alert("City not found. Please try another city name.");
      console.error("Geocode error: " + status);
    }
  });
}

// =====================================================================
// initMap()
// Purpose:
// Creates and displays the Google Map on the webpage. This is only
// called once when the first search is performed. The map is initially
// centered on London until the user searches for another city.
// =====================================================================
function initMap() {
  // ---------------------------------------------------------------
  // STEP 1: Set a default starting location (London coordinates).
  // This ensures the map has a visible starting point even before
  // the user performs a search.
  // ---------------------------------------------------------------
  const defaultLocation = { lat: 51.5074, lng: -0.1278 };

  // ---------------------------------------------------------------
  // STEP 2: Create the map object and attach it to the <div id="map">
  // The google.maps.Map constructor requires:
  //   - a DOM element (where to display the map)
  //   - configuration settings (center, zoom, style, etc.)
  // ---------------------------------------------------------------
  map = new google.maps.Map(document.getElementById("map"), {
    center: defaultLocation, // Start zoomed into London
    zoom: 13, // Good balance between detail & overview

    // mapId enables use of advanced markers and custom styles.
    // You would normally request your own custom map ID from Google.
    mapId: "8d0e094cf15d6aaa209647df",

    /* ------------------------------------------------------------
        OPTIONAL STYLING (commented out)
        These settings change the colours of land and water. If enabled,
        they apply a custom theme for brand consistency with your site.
        
        styles: [
            {
                featureType: 'water',
                elementType: 'geometry',
                stylers: [{ color: '#90E0EF' }]  // Light Blue (Sky)
            },
            {
                featureType: 'landscape',
                elementType: 'geometry',
                stylers: [{ color: '#FAF3E0' }]  // Sand Beige
            }
        ]
        ------------------------------------------------------------ */
  });

  // Console message helps verify successful map creation during debugging.
  console.log("Map initialised successfully");
}

// ======================================================================
// searchNearbyPlacesNew(location)
// Purpose:
// This function uses the NEW Google Places API ("Place.searchNearby")
// to find businesses or places near a map location, such as restaurants,
// hotels, attractions, cafes, or shopping centers.
//
// Workflow:
//   1) Cleans up old markers & results
//   2) Calls Google Places API based on the selected category (currentSearchType)
//   3) Displays results in the sidebar
//   4) Adds new markers to the map
//   5) Handles API errors gracefully with user feedback
// ======================================================================
async function searchNearbyPlacesNew(location) {
  console.log(
    "Searching nearby places with NEW API for type:",
    currentSearchType
  );

  // ----------------------------------------------------------
  // STEP 1: Remove markers from previous searches
  // This prevents leftover pins from mixing with new results.
  // ----------------------------------------------------------
  clearMarkers();

  // ----------------------------------------------------------
  // STEP 2: Show a "loading" message while waiting for API results
  // This improves user experience during the async request.
  // ----------------------------------------------------------
  const resultsList = document.getElementById("resultsList");
  resultsList.innerHTML =
    '<div class="text-center text-muted py-3"><i class="bi bi-hourglass-split"></i> Loading results...</div>';

  try {
    // ----------------------------------------------------------
    // STEP 3: Prepare the search type in the format expected by
    // the new API (includedTypes must be an array).
    // ----------------------------------------------------------
    const includedTypes = [currentSearchType];

    // Debug log for developers to verify search parameters
    console.log("Search parameters:", {
      location: { lat: location.lat(), lng: location.lng() },
      radius: 5000,
      includedTypes: includedTypes,
    });

    // ----------------------------------------------------------
    // STEP 4: Call the NEW Places API method: Place.searchNearby()
    // Differences from the old API:
    //   - no "radius" argument directly
    //   - use "locationRestriction" with center + radius
    //   - "fields" tells API exactly what data we need
    // ----------------------------------------------------------
    const { places } = await google.maps.places.Place.searchNearby({
      locationRestriction: {
        // Defines search area
        center: {
          lat: location.lat(), // Must call lat() & lng()
          lng: location.lng(), // These return numbers
        },
        radius: 5000, // 5 km radius around the city
      },
      includedTypes: includedTypes, // Category (e.g., restaurant)
      maxResultCount: 20, // Limit to top results
      fields: [
        "displayName",
        "location",
        "rating",
        "formattedAddress",
        "regularOpeningHours",
      ],
    });

    // Log how many places were found (helps debugging Google quota issues)
    console.log("Places found:", places ? places.length : 0);

    // ----------------------------------------------------------
    // STEP 5: If results exist, display them and add map markers
    // ----------------------------------------------------------
    if (places && places.length > 0) {
      // Show results in the left panel
      displayResultsNew(places);

      // Add a numbered marker for each place
      places.forEach((place, index) => {
        createMarkerNew(place, index);
      });
    } else {
      // ------------------------------------------------------
      // No places found: provide a helpful message instead of blank UI
      // ------------------------------------------------------
      resultsList.innerHTML =
        '<div class="alert alert-info">No results found for this location and category. Try a different filter or city.</div>';
    }
  } catch (error) {
    // ----------------------------------------------------------
    // STEP 6: If something goes wrong with the API request,
    // display a detailed human-friendly error message.
    // ----------------------------------------------------------
    console.error("Error searching places:", error);

    let errorMessage = "Error searching places. ";

    // Detect common causes and give specific guidance
    if (error.message.includes("API key")) {
      errorMessage +=
        "Check that your API key is valid and has Places API (New) enabled.";
    } else if (error.message.includes("billing")) {
      errorMessage += "Billing must be enabled in Google Cloud Console.";
    } else {
      errorMessage += error.message; // General fallback
    }

    // Show error visually in the UI
    resultsList.innerHTML = `<div class="alert alert-danger">${errorMessage}</div>`;
  }
}

// ======================================================================
// displayResultsNew(places)
// Purpose:
// Takes an array of place results returned from the NEW Google Places API,
// and dynamically creates interactive "cards" in the sidebar results panel.
// Each card displays the Name, Address, Rating, Opening status, and when
// clicked, zooms the map to that location and animates the marker.
// ======================================================================
function displayResultsNew(places) {
  // ----------------------------------------------------------
  // STEP 1: Target the results list container and clear any old results
  // ----------------------------------------------------------
  const resultsList = document.getElementById("resultsList");
  resultsList.innerHTML = "";

  // ----------------------------------------------------------
  // STEP 2: Loop through each place returned by the API
  // "index" allows us to link each result to its corresponding marker
  // ----------------------------------------------------------
  places.forEach((place, index) => {
    // Create a wrapper container for each result (acts like a card)
    const resultItem = document.createElement("div");
    resultItem.className = "result-item"; // Styled via CSS
    resultItem.setAttribute("data-index", index); // Used to identify marker

    // ----------------------------------------------------------
    // STEP 3: Extract the place details safely with fallback values.
    // Some data might be missing, so default strings prevent errors.
    // ----------------------------------------------------------
    const name = place.displayName || "Unknown Place";
    const address = place.formattedAddress || "Address not available";
    const rating = place.rating || null;
    const isOpen = place.regularOpeningHours?.openNow; // Optional chaining (fails safely if missing)

    // ----------------------------------------------------------
    // STEP 4: Generate star rating UI using Bootstrap icons.
    // - Full stars for whole number rating
    // - Half star if .5 or more remains
    // ----------------------------------------------------------
    let ratingHTML = "";
    if (rating) {
      const fullStars = Math.floor(rating);
      const hasHalfStar = rating % 1 >= 0.5;

      for (let i = 0; i < fullStars; i++) {
        ratingHTML += '<i class="bi bi-star-fill"></i>';
      }
      if (hasHalfStar) {
        ratingHTML += '<i class="bi bi-star-half"></i>';
      }

      // Append the numerical rating (rounded to one decimal)
      ratingHTML += ` <span>${rating.toFixed(1)}</span>`;
    }

    // ----------------------------------------------------------
    // STEP 5: Build the visual card content using template literals
    // Includes icons to support a modern, user-friendly UI
    // ----------------------------------------------------------
    resultItem.innerHTML = `
            <h5><i class="bi bi-geo-alt-fill me-2 text-primary"></i>${name}</h5>
            <p><i class="bi bi-pin-map me-2"></i>${address}</p>
            ${rating ? `<p class="rating">${ratingHTML}</p>` : ""}
            ${
              isOpen !== undefined
                ? `<p><i class="bi bi-clock me-2"></i>${
                    isOpen
                      ? '<span class="text-success">Open Now</span>'
                      : '<span class="text-danger">Closed</span>'
                  }</p>`
                : ""
            }
        `;

    // ----------------------------------------------------------
    // STEP 6: Make each result clickable to trigger map interaction.
    // When clicked:
    //   - The map recenters and zooms into the chosen place
    //   - The matching marker animates ("bounces" briefly)
    // ----------------------------------------------------------
    resultItem.addEventListener("click", function () {
      if (place.location) {
        map.setCenter(place.location);
        map.setZoom(16);

        // Animate ONLY the clicked marker using index linkage
        if (markers[index]) {
          if (markers[index].setAnimation) {
            // Ensure animation is supported
            markers[index].setAnimation(google.maps.Animation.BOUNCE);
            setTimeout(() => {
              markers[index].setAnimation(null); // Stop bounce animation
            }, 1400);
          }
        }
      }
    });

    // ----------------------------------------------------------
    // STEP 7: Add the generated card to the results container
    // ----------------------------------------------------------
    resultsList.appendChild(resultItem);
  });
}

// ======================================================================
// createMarkerNew(place, index)
// Purpose:
// Creates a custom Google Maps marker for each place returned by the
// "NEW Places API". The function:
//   - Validates that the place has coordinates
//   - Draws a customised pin using SVG path icons (circle marker)
//   - Labels the marker with a number matching the sidebar list
//   - Creates an InfoWindow popup with name, address & rating
//   - Ensures only ONE info window is open at a time
//
// Called from: searchNearbyPlacesNew()
// Linked to: displayResultsNew() so both UI and map match up by index
// ======================================================================
function createMarkerNew(place, index) {
  // ----------------------------------------------------------
  // STEP 1: Check if the API returned a location property.
  // If not, we cannot place a pin on the map, so skip safely.
  // ----------------------------------------------------------
  if (!place.location) {
    console.warn("Place has no location:", place);
    return;
  }

  // ----------------------------------------------------------
  // STEP 2: Create a custom marker using standard Google Marker.
  // We avoid AdvancedMarkerElement because it requires map styling
  // and specific configurations. Standard markers = more compatible.
  // ----------------------------------------------------------
  const marker = new google.maps.Marker({
    map: map, // Attach marker to current map
    position: place.location, // Where the marker should be placed
    title: place.displayName || "Unknown Place", // Tooltip text

    // Add a numbered label matching the results list
    label: {
      text: (index + 1).toString(), // Number 1, 2, 3, ...
      color: "white",
      fontWeight: "bold",
    },

    // Custom marker design: circle icon with brand colours
    icon: {
      path: google.maps.SymbolPath.CIRCLE, // Circle shape (SVG)
      fillColor: "#0077B6", // Ocean Blue (brand colour)
      fillOpacity: 1,
      strokeColor: "#FF6B35", // Coral Orange border
      strokeWeight: 3,
      scale: 15, // Size of the circle
    },
  });

  // ----------------------------------------------------------
  // STEP 3: Create a popup InfoWindow with dynamic details.
  // Template literals allow HTML formatting and conditionals.
  // ----------------------------------------------------------
  const infowindow = new google.maps.InfoWindow({
    content: `
            <div style="padding: 10px; max-width: 200px;">
                <h6 style="margin: 0 0 5px 0; color: #0077B6; font-weight: bold;">
                    ${place.displayName || "Unknown Place"}
                </h6>
                <p style="margin: 0; font-size: 0.9rem; color: #2F3E46;">
                    ${place.formattedAddress || ""}
                </p>
                ${
                  place.rating
                    ? `<p style="margin: 5px 0 0 0; color: #FF6B35; font-weight: bold;">⭐ ${place.rating.toFixed(
                        1
                      )}</p>`
                    : ""
                }
            </div>
        `,
  });

  // ----------------------------------------------------------
  // STEP 4: Add interactivity — clicking a marker:
  //   - closes other open info windows
  //   - opens the clicked one
  // This prevents overlapping popups for clearer UI.
  // ----------------------------------------------------------
  marker.addListener("click", function () {
    // Close all other info windows before opening this one
    infoWindows.forEach((iw) => iw.close());
    infowindow.open(map, marker);
  });

  // ----------------------------------------------------------
  // STEP 5: Store this marker and its info window in global arrays
  // Later we can clear them (clearMarkers()) before new searches.
  // ----------------------------------------------------------
  infoWindows.push(infowindow);
  markers.push(marker);
}

// ======================================================================
// clearMarkers()
// Purpose:
// Removes all map markers and closes any open InfoWindows before a new
// search is performed. This prevents leftover markers and popups from
// previous searches from cluttering the map.
//
// Called from: searchNearbyPlacesNew()
// Works with: createMarkerNew(), displayResultsNew()
// ======================================================================
function clearMarkers() {
  // ----------------------------------------------------------
  // STEP 1: Loop through the global array "markers"
  // and remove each marker from the map.
  //
  // Some marker objects may not have a valid setMap method
  // (depending on the object type), so we check first.
  // ----------------------------------------------------------
  markers.forEach((marker) => {
    if (marker.setMap) {
      // Ensure marker has a valid setMap() method
      marker.setMap(null); // Remove marker from the map (Google Maps convention)
    }
  });

  // ----------------------------------------------------------
  // STEP 2: Reset the markers array to an empty list.
  // This clears memory and ensures the next search starts fresh.
  // ----------------------------------------------------------
  markers = [];

  // ----------------------------------------------------------
  // STEP 3: Close all open InfoWindows so no popups remain
  // after clearing the markers.
  // ----------------------------------------------------------
  infoWindows.forEach((iw) => iw.close());

  // ----------------------------------------------------------
  // STEP 4: Clear the infoWindows array to remove references
  // and avoid re-closing old windows later.
  // ----------------------------------------------------------
  infoWindows = [];
}

// =======================================================================
// searchCity(cityName)
// Purpose:
// Allows users to search for a destination *directly* by clicking one of
// the Popular Destinations buttons at the bottom of the page (e.g., NYC,
// Paris, Tokyo). Instead of typing the city manually, this function:
//
//   - Automatically inserts the city name into the search input box
//   - Triggers the same search process as typing & clicking "Search"
//   - Gives a smooth shortcut experience for popular places
//
// Called from: Popular Destination button onclick handlers
// Example in HTML: <button onclick="searchCity('Tokyo')">
// =======================================================================
function searchCity(cityName) {
  // Log the selected city to the console — useful for debugging user clicks
  console.log("searchCity called with:", cityName);

  // STEP 1: Place the selected city name into the search input field
  // This ensures the user sees which city is being searched
  document.getElementById("citySearch").value = cityName;

  // STEP 2: Trigger the main search process (same as clicking "Search")
  // This runs geocoding, map centering, and Places API queries
  performSearch(cityName);
}

// Export functions for testing (Node.js/Jest environment)
if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    initializeActionButtons,
    filterPlaces,
    initializeSearchButton,
    searchCity,
    clearMarkers,
    performSearch,
    // Helpers for Jest Test 2.6.
    _setMarkers: function (m) {
      markers = m;
    },
    _setInfoWindows: function (iw) {
      infoWindows = iw;
    },
  };
}

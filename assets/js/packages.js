/* ======================================================================
   PACKAGES.JS – HOLIDAY PACKAGES & PARTNER BOOKING INTEGRATION

   Purpose:
   This script powers the "Packages" page booking panel (packages.html).
   It connects the user's chosen city, dates and number of guests with
   external booking partners:
     - Booking.com       -> Hotels
     - Google Flights    -> Flights
     - Expedia           -> Flight + Hotel packages
     - GetYourGuide      -> Activities and tours

   Where It Is Used:
   - packages.html
     - The four main action buttons in the booking form:
       - "Book Hotels"      -> onclick="bookHotel(event)"
       - "Book Flights"     -> onclick="bookFlights(event)"
       - "Full Package"   -> onclick="bookPackage(event)"
       - "Book Activities"    -> onclick="bookActivities(event)"
     - These buttons sit under the trip details form (city search box,
       check-in, check-out, and guests selector) and use the values from
       those inputs to build deep links into each partner website. :contentReference[oaicite:1]{index=1}
    ====================================================================== */

    /* =====================================================================================
    VALIDATION TOAST FUNCTIONS
   ---------------------------
   Displays a styled notification instead of the default browser alert.
======================================================================================== */

function showValidationToast(message, type) {
  var container = document.getElementById("validationToastContainer");
  var toastMessage = document.getElementById("toastMessage");
  var toastEl = document.getElementById("validationToast");

  if (!container || !toastMessage || !toastEl) {
    alert(message);
    return;
  }

  toastMessage.textContent = message;

  if (type === "error") {
    toastEl.style.backgroundColor = "#c0392b";
  } else {
    toastEl.style.backgroundColor = "#1a5276";
  }

  container.style.display = "block";

  setTimeout(function () {
    hideValidationToast();
  }, 4000);
}

function hideValidationToast() {
  var container = document.getElementById("validationToastContainer");
  if (container) {
    container.style.display = "none";
  }
}

/* =====================================================================================
    getCityNameForUrls()
   --------------------
   - Purpose:
     Safely retrieves the destination city name to use when building
     external booking URLs (Booking.com, Google Flights, Expedia, etc.).
   - Behaviour:
     1. First tries to read a global variable 'currentCityName' (if set by
        other scripts, e.g. after a search on search.html).
     2. If that is not available, it falls back to the value typed into
        the '#citySearch' input field on packages.html.
     3. Returns an empty string if nothing is found.
   - Why:
     Ensures all partner links (hotels, flights, packages, activities)
     use the same, clean city name without duplicating lookup logic.
======================================================================================== */

function getCityNameForUrls() {
  // Try to use a globally stored city name if it exists.
  // "typeof !== 'undefined'" ensures we don't error if variable doesn't exist.
  let name =
    typeof currentCityName !== "undefined" && currentCityName
      ? currentCityName
      : "";
  // If no global name was found, checks the text input on packages.html.
  if (!name) {
    const input = document.getElementById("citySearch");
    // Only use the input value if it exists AND is not just blank spaces.
    if (input && input.value.trim()) name = input.value.trim();
  }
  // Final fallback: return an empty string instead of null/undefined.
  // Returning '' protects other functions from breaking when building URLs.
  return name || "";
}

/* =====================================================================================
    setActiveBookingButton(clickedButton)
   --------------------------------------
   - Purpose:
     Visually indicates which of the four booking buttons is currently
     "active" (Hotels / Flights / Package / Activities).
   - Behaviour:
     1. Removes the primary/active styling classes from all elements with
        the '.btn-action' class.
     2. Adds 'booking-btn-primary' and '.active' to the clicked button,
        and ensures others fall back to 'booking-btn-secondary'.
   - Why:
     Gives visual feedback to the user about which type of booking they
     just triggered, improving usability and clarity in the UI.
========================================================================================*/

function setActiveBookingButton(clickedButton) {
  // ---------------------------------------------------------
  // STEP 1: Reset button styles
  // Remove the primary style from every booking button and
  // apply a secondary (non-active) style. Also ensure that
  // no button keeps an "active" class from earlier clicks.
  // ---------------------------------------------------------
  document.querySelectorAll(".btn-action").forEach((btn) => {
    btn.classList.remove("booking-btn-primary"); // removes highlight
    btn.classList.add("booking-btn-secondary"); // adds neutral style
    btn.classList.remove("active"); // removes active state
  });

  // ---------------------------------------------------------
  // STEP 2: Make the clicked button look active again
  // If a button triggered this function, highlight it by:
  //   - Adding the primary styling class (highlighted colour)
  //   - Adding the "active" class (for visual + logic purposes)
  // ---------------------------------------------------------
  if (clickedButton) {
    clickedButton.classList.add("booking-btn-primary"); // highlight style
    clickedButton.classList.add("active"); // marks as active
  }
}

/* ----------------------------------------------------------------------
        BOOKING ACTION FUNCTIONS (ONE PER PARTNER)
    ----------------------------------------------------------------------*/

/** Book hotels - redirects to Booking.com */

/* =====================================================================================
    bookHotel(ev)
   -------------------------------------------------------------------------------------
   - Triggered by:
     The "Book Hotels" button on packages.html (onclick="bookHotel(event)").
   - Purpose:
     Redirects the user to Booking.com with check-in, check-out, guests,
     and city filled into the search URL.
   - Behaviour:
     1. Marks the clicked button as active using setActiveBookingButton().
     2. Reads 'checkin', 'checkout', and 'guests' from the form.
     3. Validates that both check-in and check-out are provided; if not,
        shows an alert and stops.
     4. Uses getCityNameForUrls() to obtain the destination city.
     5. Builds a Booking.com search URL using query parameters:
        - ss          -> city name
        - checkin     -> YYYY-MM-DD
        - checkout    -> YYYY-MM-DD
        - group_adults, no_rooms
     6. Opens the Booking.com search results in a new browser tab.
 ===================================================================================== */

function bookHotel(ev) {
  // ------------------------------------------------------------------
  // STEP 1: Identify which button triggered the event.
  // Some browsers pass the event with currentTarget,
  // while fallback (ev) supports inline calls.
  // We use a ternary to choose the correct button element.
  // ------------------------------------------------------------------
  const btn = ev && ev.currentTarget ? ev.currentTarget : ev;

  // Highlight this button and un-highlight others
  setActiveBookingButton(btn);

  // ------------------------------------------------------------------
  // STEP 2: Read user-selected trip data from form fields.
  // The "guests" input defaults to 2 if the user doesn't choose.
  // ------------------------------------------------------------------
  const checkIn = document.getElementById("checkin").value;
  const checkOut = document.getElementById("checkout").value;
  const guests = document.getElementById("guests").value || 2;

  // ------------------------------------------------------------------
  // STEP 3: Validate date fields before constructing a Booking URL.
  // If either date is missing, show an alert and cancel the operation.
  // ------------------------------------------------------------------
  if (!checkIn || !checkOut) {
    showValidationToast("Please select check-in and check-out dates", "warning");
    return;
  }

  // Validate that check-in date is not after check-out date
  if (new Date(checkIn) > new Date(checkOut)) {
    showValidationToast("Check-in date cannot be after check-out date", "error");
    return;
  }

  // ------------------------------------------------------------------
  // STEP 4: Safely get the destination city name.
  // getCityNameForUrls() ensures:
  //   - trims spaces
  //   - falls back to global city if available
  //   - returns '' instead of null or undefined
  // ------------------------------------------------------------------
  const cityName = getCityNameForUrls();
  const searchParam = encodeURIComponent(cityName); // URL safe text

  // ------------------------------------------------------------------
  // STEP 5: Build Booking.com deep link with query parameters.
  // Booking.com expects:
  //   ss            → search string (city)
  //   checkin       → YYYY-MM-DD
  //   checkout      → YYYY-MM-DD
  //   group_adults  → number of adults
  //   no_rooms=1    → assumes one room (simple educational use)
  //
  // encodeURIComponent() ensures safe characters for URLs.
  // ------------------------------------------------------------------
  const bookingUrl =
    `https://www.booking.com/searchresults.html?ss=${searchParam}` +
    `&checkin=${encodeURIComponent(checkIn)}` +
    `&checkout=${encodeURIComponent(checkOut)}` +
    `&group_adults=${encodeURIComponent(guests)}` +
    `&no_rooms=1`;

  // ------------------------------------------------------------------
  // STEP 6: Open the constructed Booking page in a new browser tab.
  // "_blank" ensures the user remains on your site.
  // noreferrer: Prevents passing referrer information to the new page (FIX TC006)
  // ------------------------------------------------------------------
  window.open(bookingUrl, "_blank", "noopener,noreferrer");
}

/** Book flights - always departing from London (all airports - LON) */
/* =====================================================================================
        bookFlights(ev)
   ------------------------
   - Triggered by:
     The "Book Flights" button on packages.html (onclick="bookFlights(event)").
   - Purpose:
     Opens Google Flights with:
       - Departure: always set to London (all airports, LON)
       - Destination: the selected city
       - Dates: check-in as departure date, check-out as optional return date.
   - Behaviour:
     1. Marks the clicked button as active.
     2. Reads the 'checkin' and 'checkout' fields.
     3. Requires a departure date (check-in); alerts if missing.
     4. Uses "London (LON)" as a fixed origin.
     5. Uses getCityNameForUrls(), taking the first part before any comma
        as the destination city.
     6. Builds a human-readable Google Flights query string in the URL:
        - "Flights from London (LON) to {Destination} departing {date} ..."
     7. Opens Google Flights in a new tab with those search terms applied.
===================================================================================== */

function bookFlights(ev) {
  // ----------------------------------------------------------
  // STEP 1: Identify the button that was clicked.
  // Some browsers provide ev.currentTarget; others may only pass ev.
  // This ternary ensures compatibility with inline calls.
  // ----------------------------------------------------------
  const btn = ev && ev.currentTarget ? ev.currentTarget : ev;
  setActiveBookingButton(btn);

  // ----------------------------------------------------------
  // STEP 2: Extract travel dates from the form inputs.
  // ----------------------------------------------------------
 
  // Validate departure date
  const checkIn = document.getElementById("checkin").value;
  const checkOut = document.getElementById("checkout").value;
  const guests = document.getElementById("guests").value;
  const dest = getCityNameForUrls().split(",")[0].trim() || "";

  // Validate all fields are filled
  if (!checkIn || !checkOut) {
    showValidationToast("Please select check-in and check-out dates", "warning");
    return;
  }

  // Validate that check-in date is not after check-out date
  if (new Date(checkIn) > new Date(checkOut)) {
    showValidationToast("Check-in date cannot be after check-out date", "error");
    return;
  }

  // Validate destination city
  if (!dest) {
    showValidationToast("Please enter a destination city", "warning");
    return;
  }

  // Validate guests
  if (!guests) {
    showValidationToast("Please select number of guests", "warning");
    return;
  }

  // ----------------------------------------------------------
  // STEP 3: Hard-code the origin to London (LON).
  // "LON" is a special airport code meaning **All London Airports**:
  //  Heathrow (LHR), Gatwick (LGW), Stansted (STN), Luton (LTN), etc.
  // This gives more flight options automatically.
  // ----------------------------------------------------------
  const origin = "London (LON)";

  // ----------------------------------------------------------
  // STEP 4: Extract destination city from user search.
  // Split removes anything after a comma (e.g., "Paris, France" -> "Paris").
  // trim() ensures no extra spaces break the search.
  // If blank, fallback is '' instead of undefined/null.
  // ----------------------------------------------------------
  
  const departDate = checkIn;
  const returnDate = checkOut || "";

  // ----------------------------------------------------------
  // STEP 5: Build a natural-language Google Flights query.
  // Google Flights accepts readable query strings like:
  //   Flights from London to New York departing 2025-01-20 returning 2025-01-27
  //
  // encodeURIComponent() avoids broken URLs caused by spaces and symbols.
  // ----------------------------------------------------------
  let googleFlightsUrl = `https://www.google.com/travel/flights?q=Flights%20from%20${encodeURIComponent(
    origin
  )}%20to%20${encodeURIComponent(dest)}`;

  // Add either return option or one-way date
  if (returnDate) {
    googleFlightsUrl += `%20departing%20${encodeURIComponent(
      departDate
    )}%20returning%20${encodeURIComponent(returnDate)}`;
  } else {
    googleFlightsUrl += `%20on%20${encodeURIComponent(departDate)}`;
  }

  // ----------------------------------------------------------
  // STEP 6: Open the flights page in a new tab so the user
  // remains on your site and can return easily.
  // noreferrer: Prevents passing referrer information to the new page (FIX TC006)
  // ----------------------------------------------------------
  window.open(googleFlightsUrl, "_blank", "noopener,noreferrer");
}

/** Book full package - Expedia packages, from London (all airports) */

/* =====================================================================================
    bookPackage(ev)
   -----------------------
   - Triggered by:
     The "Full Package" button (onclick="bookPackage(event)") from packages.html.
   - Purpose:
     Sends the user to Expedia's "Flight + Hotel" package search with:
       - Origin: London (all airports, LON)
       - Destination: selected city
       - Dates: check-in/check-out
       - Guests: number of adults.
   - Behaviour:
     1. Marks the clicked button as active.
     2. Reads 'checkin', 'checkout', and 'guests'.
     3. Validates that both dates are present; if not, alerts and stops.
     4. Gets the city either from 'currentCityName' or from '#citySearch'.
     5. If no city is available, shows an alert and stops.
     6. Builds an Expedia deep link using the pattern:
        https://www.expedia.co.uk/go/package/search/FlightHotel/{FromDate}/{ToDate}
        with query parameters:
        - FromAirport = LON
        - Destination = city
        - NumRoom    = 1
        - NumAdult   = guests
     7. Opens the Expedia package search in a new tab.
===================================================================================== */

function bookPackage(ev) {
  // ----------------------------------------------------------
  // STEP 1: Detect which button was clicked and highlight it.
  // The ternary handles cases where 'ev.currentTarget' exists
  // or where only 'ev' is passed (inline event call).
  // ----------------------------------------------------------
  const btn = ev && ev.currentTarget ? ev.currentTarget : ev;
  setActiveBookingButton(btn);

  // ----------------------------------------------------------
  // STEP 2: Read trip details from the form.
  // Guests default to "2" if the user has not selected any.
  // ----------------------------------------------------------
  const checkIn = document.getElementById("checkin").value;
  const checkOut = document.getElementById("checkout").value;
  const guests = document.getElementById("guests").value || "2";

  // ----------------------------------------------------------
  // STEP 3: Validate that BOTH dates are present.
  // A package search requires both arrival and departure dates.
  // ----------------------------------------------------------
  if (!checkIn || !checkOut) {
    showValidationToast("Please select both check-in and check-out dates for a package search.", "warning");
    return;
  }

  // Validate that check-in date is not after check-out date
  if (new Date(checkIn) > new Date(checkOut)) {
    showValidationToast("Check-in date cannot be after check-out date", "error");
    return;
  }

  // ----------------------------------------------------------
  // STEP 4: Safely retrieve the destination city.
  // Try reading the globally stored currentCityName first.
  // If not available, fallback to the text in the search box.
  // ----------------------------------------------------------
  let city = "";
  if (typeof currentCityName !== "undefined" && currentCityName) {
    city = currentCityName;
  } else {
    const input = document.getElementById("citySearch");
    if (input && input.value.trim()) {
      city = input.value.trim();
    }
  }

  // If no valid city name is found, warn the user.
  if (!city) {
    showValidationToast("Please enter a destination city.", "warning");
    return;
  }

  // ----------------------------------------------------------
  // STEP 5: Construct the Expedia package deeplink.
  //
  // Expedia expects:
  //  BASE URL:
  //    https://www.expedia.co.uk/go/package/search/FlightHotel/{FromDate}/{ToDate}
  //
  //  QUERY PARAMETERS:
  //    FromAirport = "LON"  (all London airports)
  //    Destination = raw city text (Expedia interprets it)
  //    NumRoom     = number of rooms
  //    NumAdult    = guest count (treated as adults)
  //
  // Note: encodeURIComponent() ensures valid URL characters.
  // ----------------------------------------------------------

  const fromDate = checkIn; // already YYYY-MM-DD
  const toDate = checkOut;

  // Base URL that includes the date range
  const baseUrl = `https://www.expedia.co.uk/go/package/search/FlightHotel/${encodeURIComponent(
    fromDate
  )}/${encodeURIComponent(toDate)}`;

  // Build query parameters automatically with URLSearchParams
  const params = new URLSearchParams({
    FromAirport: "LON", // London – all airports
    Destination: city, // let Expedia interpret the city text
    NumRoom: "1", // Simplified project assumption
    NumAdult: guests, // Guests treated as adults only
    // Could add NumChild / Child ages here later if needed
  });

  // Final Expedia URL with query string
  const expediaUrl = `${baseUrl}?${params.toString()}`;

  // ----------------------------------------------------------
  // STEP 6: Open Expedia in a new browser tab.
  // "_blank" keeps the user on this website.
  // noreferrer: Prevents passing referrer information to the new page (FIX TC006)
  // ----------------------------------------------------------
  window.open(expediaUrl, "_blank", "noopener,noreferrer");
}

/** Book activities - redirects to GetYourGuide */

/* =====================================================================================
    bookActivities(ev)
   ------------------------
   - Triggered by:
     The "Book Activities" button (onclick="bookActivities(event)") from packages.html.
   - Purpose:
     Opens GetYourGuide with the chosen city pre-filled as the search term,
     so the user can browse tours and activities.
   - Behaviour:
     1. Marks the clicked button as active.
     2. Uses getCityNameForUrls(), again taking just the first part before
        any comma (e.g. "Paris" from "Paris, France").
     3. Builds a GetYourGuide search URL:
        https://www.getyourguide.com/s/?q={city}
     4. Opens the results in a new browser tab.
===================================================================================== */

function bookActivities(ev) {
  // ----------------------------------------------------------
  // STEP 1: Detect & visually highlight the clicked button.
  // Uses the same cross-browser logic as other booking functions:
  //   - ev.currentTarget when available
  //   - otherwise fallback to ev itself
  // ----------------------------------------------------------
  const btn = ev && ev.currentTarget ? ev.currentTarget : ev;
  setActiveBookingButton(btn);

  // ----------------------------------------------------------
  // STEP 2: Safely retrieve the destination name.
  // getCityNameForUrls():
  //   - returns cleaned input (trimmed)
  //   - avoids undefined/null issues
  // Split + trim removes anything after a comma:
  //   "Rome, Italy" -> "Rome"
  // Falling back to '' ensures a valid (empty) search string.
  // ----------------------------------------------------------
  const city = getCityNameForUrls().split(",")[0].trim() || "";
  // ----------------------------------------------------------
  // STEP 3: Build the GetYourGuide search link.
  // Example URL format:
  //   https://www.getyourguide.com/s/?q=Paris
  //   encodeURIComponent() protects special characters in city names:
  //   "São Paulo" -> "S%C3%A3o%20Paulo"
  // ----------------------------------------------------------
  const getYourGuideUrl = `https://www.getyourguide.com/s/?q=${encodeURIComponent(
    city
  )}`;

  // ----------------------------------------------------------
  // STEP 4: Open the activities page in a new browser tab.
  // "_blank" ensures the user stays on your site for further actions.
  // noreferrer: Prevents passing referrer information to the new page (FIX TC006)
  // ----------------------------------------------------------
  window.open(getYourGuideUrl, "_blank", "noopener,noreferrer");
}

// Export functions for testing (Node.js/Jest environment)
if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    getCityNameForUrls,
    setActiveBookingButton,
    bookHotel,
    bookFlights,
    bookPackage,
    bookActivities,
  };
}

/* ====================================================================== 
   Overall Role in the Application:
   - packages.js acts as the "integration layer" between the internal
     booking form (HTML inputs on packages.html) and four external
     travel services (Booking.com, Google Flights, Expedia, GetYourGuide).
   - It NEVER processes payments itself; instead it passes user input
     (city, dates, guests) into correctly formatted URLs and lets the
     partner websites handle the actual booking process.
   - This keeps the project within an educational scope while still
     demonstrating realistic industry-style integrations.
   ====================================================================== */

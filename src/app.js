const apiKeyOne = process.env.apiKeyOne;
// TODO: Update icons
// TODO: Add error handling (no geolocation and axios calls), if not geolocation add default city
// TODO: Add Precipitation, Humidty, Wind
// TODO: Add distinction between C and F based on which one if visible
// TODO: Update timezones
// ------------------------------
// SECTION: Time and Days Handling
// ------------------------------

// Initialize current date and days array
const now = new Date();
const daysArr = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
];

/**
 * Format the current date and time
 * @param {Date} dateObj - The date object
 * @param {string[]} daysArr - Array of days in a week
 * @returns {string} - Formatted string
 */
function formatTodayDate(dateObj, daysArr) {
    let day = daysArr[dateObj.getDay()];
    let hour = dateObj.getHours();
    let minutes = dateObj.getMinutes();
    if (minutes < 10) {
        minutes = `0${minutes}`;
    }
    return `${day} ${hour}:${minutes}`;
}
/**
 * Get future days based on the current day
 * @param {Date} dateObj - The date object
 * @param {string[]} daysArr - Array of days in a week
 * @param {number} numberOfDays - Number of future days to get
 * @returns {string[]} - Array of future days
 */
function formatFutureDays(dateObj, daysArr, numberOfDays) {
    let futureDays = [];
    for (let i = 1; i <= numberOfDays; i++) {
        let daysIndex = (dateObj.getDay() + i) % 7;
        futureDays.push(daysArr[daysIndex]);
    }
    return futureDays;
}

// ------------------------------
// SECTION: Geolocation and Temperature Unit Handling
// ------------------------------

/**
 * Fetches the current geolocation and initiates a request to get the current weather data.
 * @param {Object} position - The geolocation position object containing 'coords' with 'latitude' and 'longitude'.
 */
function findGeoLocationInitialTemp(position) {
    let currentLocation = [position.coords.latitude, position.coords.longitude];
    getCurrentTempByCoordinates(currentLocation[0], currentLocation[1]);
}
/**
 * Handles the click event for fetching current location and initiates a request to get the current weather data based on the geolocation.
 */
function handleCurrentLocationCLick() {
    navigator.geolocation.getCurrentPosition(findGeoLocationInitialTemp);
}

// ------------------------------
// SECTION: Current Weather Handling
// ------------------------------

/**
 * Fetch current temperature data in Celsius from API and update the UI
 * @param {number} lat - Latitude
 * @param {number} long - Longitude
 */
async function getCurrentTempByCoordinates(lat, long) {
    const response = await axios.get(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${long}&units=metric&appid=${apiKeyOne}`
    );
    changeUITemperatureScales(Math.round(response.data.main.temp));
    handleUILocation(response.data.name);
}
/**
 * Fetches the current temperature data based on a city name and temperature unit and updates the UI.
 * @param {string} city - The name of the city.
 * @param {string} unit - The temperature unit ('metric' or 'imperial').
 */
async function getCurrentTempCity(city, unit) {
    const response = await axios.get(
        `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKeyOne}&units=${unit}`
    );
    changeUITemperatureScales(Math.round(response.data.main.temp));
    handleUILocation(response.data.name);
}

// ------------------------------
// SECTION: Upcoming Weather Handling
// ------------------------------
// Incomplete Code - Limit API Calls while working on other parts of the code
// TODO: Add current location information and use forecast object to update html elements

// /**
//  * Fetch upcoming weather data from API
//  * @returns {Promise<Object>} - A promise that resolves to the forecast data from the API
//  */
// async function getWeatherData() {
//     const response = await axios.get(
//         `http://api.weatherapi.com/v1/forecast.json?key=${apiKeyTwo}&q=48.8567,2.3508&days=6&aqi=no&alerts=no`
//     );
//     return response.data;
// }

// // Fetch and log forecasted weather
// let forecastObj = await getWeatherData();
// console.log(forecastObj);

// ------------------------------
// SECTION: UI Updating Functions
// ------------------------------

/**
 * Update temperature value in UI
 * @param {number} newTemperatureValue - New temperature value
 */
function changeUITemperatureScales(newTemperatureValue) {
    let todayTemperature = document.querySelector(".temperature-value");
    todayTemperature.innerHTML = newTemperatureValue;
}
/**
 * Update UI elements to display upcoming days
 * @param {string[]} nextFiveDays - Array of next five days
 */
function updateUIElementsDays(nextFiveDays) {
    let daysElementSelectors = [
        "#tomorrow-card h6",
        "#day-three-card h6",
        "#day-four-card h6",
        "#day-five-card h6",
        "#day-six-card h6",
    ];
    let todayDiv = document.querySelector("#current-date-time");
    todayDiv.innerHTML = formatTodayDate(now, daysArr);
    for (let i = 0; i < 5; i++) {
        let element = document.querySelector(daysElementSelectors[i]);
        element.innerHTML = nextFiveDays[i];
    }
}
/**
 * Updates the displayed location in the UI.
 * @param {string} location - The new location to display.
 */
function handleUILocation(location) {
    let locationDiv = document.querySelector("#location-div");
    locationDiv.innerHTML = location;
}

// ------------------------------
// SECTION: Event Listeners and Initializations
// ------------------------------

// Initialize temperature with Celsius data
navigator.geolocation.getCurrentPosition(findGeoLocationInitialTemp);

// Add event listeners for temperature scale buttons
let fahrenheitSpan = document.querySelector("#fahrenheit");
let celsiusSpan = document.querySelector("#celsius");

celsiusSpan.addEventListener("click", (event) => {
    event.preventDefault();
    let locationDiv = document.querySelector("#location-div");
    getCurrentTempCity(locationDiv.innerHTML, "metric");
});
fahrenheitSpan.addEventListener("click", (event) => {
    event.preventDefault();
    let locationDiv = document.querySelector("#location-div");
    getCurrentTempCity(locationDiv.innerHTML, "imperial");
});

// Add event listener for search form submission
let form = document.querySelector(".search-form");
form.addEventListener("submit", (e) => {
    e.preventDefault();
    let searchInput = document.querySelector("#search-location-input");
    getCurrentTempCity(searchInput.value, "metric");
    searchInput.value = "";
});

// Add event listener for current location button
let currentButton = document.getElementById("current-location");
currentButton.addEventListener("click", handleCurrentLocationCLick);

// Initialize UI elements
let nextFiveDays = formatFutureDays(now, daysArr, 5);
updateUIElementsDays(nextFiveDays);

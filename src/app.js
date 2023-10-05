import { apiKeyOne, apiKeyTwo } from "../apiKeys.js";
// ------------------------------
// SECTION: Time and Days Handling
// ------------------------------

// Initialize current date and days array
let now = new Date();
let daysArr = [
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
 * @param {Array} daysArr - Array of days in a week
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
 * @param {Array} daysArr - Array of days in a week
 * @param {number} numberOfDays - Number of future days to get
 * @returns {Array} - Array of future days
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
// SECTION: Current Weather Handling
// ------------------------------

/**
 * Fetch current temperature data in Celsius from API
 * @returns {Promise<Object>} - A promise that resolves to the response data from the API
 */
async function getCurrentCelTempData() {
    const response = await axios.get(
        `https://api.openweathermap.org/data/2.5/weather?lat=35.19182118&lon=-106.6941991&units=metric&appid=${apiKeyOne}`
    );
    return response.data;
}
/**
 * Fetch current temperature data in Fahrenheit from API
 * @returns {Promise<Object>} - A promise that resolves to the response data from the API
 */
async function getCurrentFahTempData() {
    const response = await axios.get(
        `https://api.openweathermap.org/data/2.5/weather?lat=35.19182118&lon=-106.6941991&units=imperial&appid=${apiKeyOne}`
    );
    return response.data;
}

// Fetch and log current weather data
// What I am currently working on
let celWeatherObj = await getCurrentCelTempData();
console.log(celWeatherObj);
let fahWeatherObj = await getCurrentFahTempData();
console.log(fahWeatherObj);

// ------------------------------
// SECTION: Upcoming Weather Handling
// ------------------------------

/**
 * Fetch upcoming weather data from API
 * @returns {Promise<Object>} - A promise that resolves to the forecast data from the API
 */
async function getWeatherData() {
    const response = await axios.get(
        `http://api.weatherapi.com/v1/forecast.json?key=${apiKeyTwo}&q=48.8567,2.3508&days=6&aqi=no&alerts=no`
    );
    return response.data;
}

// Fetch and log forecasted weather
// TODO: Add current location information and use forecast object to update html elements
let forecastObj = await getWeatherData();
console.log(forecastObj);

// ------------------------------
// SECTION: Search Feature Handling
// ------------------------------

// TODO: Implement search feature to find weather by location

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
 * Update UI elements for upcoming weather
 * @param {Array} nextFiveDays - Array of next five days
 */
function updateUIElements(nextFiveDays) {
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
 * Handle location change on form submit
 * @param {Event} event - The form submit event
 */
function handleLocationChange(event) {
    event.preventDefault();
    let searchInput = document.querySelector("#search-location-input");
    let locationDiv = document.querySelector("#location-div");
    locationDiv.innerHTML = searchInput.value;
}

// ------------------------------
// SECTION: Event Listeners and Initializations
// ------------------------------

changeUITemperatureScales(Math.round(celWeatherObj.main.temp));

// Add event listeners for temperature scale buttons
let fahrenheitSpan = document.querySelector("#fahrenheit");
let celsiusSpan = document.querySelector("#celsius");

fahrenheitSpan.addEventListener("click", (event) => {
    event.preventDefault();
    changeUITemperatureScales(Math.round(fahWeatherObj.main.temp));
});
celsiusSpan.addEventListener("click", (event) => {
    event.preventDefault();
    changeUITemperatureScales(Math.round(celWeatherObj.main.temp));
});

// Add event listener for search form submission
let form = document.querySelector(".search-form");
form.addEventListener("submit", handleLocationChange);

// Initialize UI elements
let nextFiveDays = formatFutureDays(now, daysArr, 5);
updateUIElements(nextFiveDays);

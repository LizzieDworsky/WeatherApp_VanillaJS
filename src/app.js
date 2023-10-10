import { apiKeyOne, apiKeyTwo } from "../apiKeys.js";

// ------------------------------
// SECTION: Time and Days Handling
// ------------------------------

// TODO: Update timezones
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
const elementIds = {
    temperatureValue: "temperature-value",
    description: "description",
    humidity: "humidity",
    windSpeed: "wind-speed",
    location: "location-div",
    windUnit: "wind-speed-unit",
    searchInput: "search-location-input",
    fahrenheit: "fahrenheit",
    celsius: "celsius",
    dateTime: "current-date-time",
    currentLocation: "current-location-button",
    weatherIcon: "weather-icon",
};

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
 * Handles the error when geolocation fails. Defaults to weather data for Albuquerque and hides the current location button.
 * @param {PositionError} error - The geolocation error object.
 */
function handleGeoLocationError(error) {
    console.error("Geolocation failed:", error);
    getCurrentTempCity("Albuquerque", "metric");
    let locationButton = document.getElementById(elementIds["currentLocation"]);
    locationButton.style.display = "none";
}
/**
 * Fetches the current geolocation and initiates a request to get the current weather data.
 * @param {Object} position - The geolocation position object.
 * @param {Object} position.coords - The coordinates object.
 * @param {number} position.coords.latitude - The latitude. Passed into `getCurrentTempByCoordinates`.
 * @param {number} position.coords.longitude - The longitude. Passed into `getCurrentTempByCoordinates`.
 */
function findGeoLocationInitialTemp(position) {
    let currentLocation = [position.coords.latitude, position.coords.longitude];
    getCurrentTempByCoordinates(currentLocation[0], currentLocation[1]);
}
/**
 * Handles the click event for fetching current location and initiates a request to get the current weather data based on the geolocation.
 * Specifically, it triggers the `findGeoLocationInitialTemp` function or `handleGeoLocationError` if geolocation fails.
 */
function handleCurrentLocationClick() {
    navigator.geolocation.getCurrentPosition(
        findGeoLocationInitialTemp,
        handleGeoLocationError
    );
}

// ------------------------------
// SECTION: Current Weather Handling
// ------------------------------

/**
 * Generic function to fetch current temperature data from API and update the UI.
 * @param {string} apiUrl - The API URL to fetch data from.
 * @throws {Error} Throws an error if the API call fails.
 */
async function fetchAndUpdateWeather(apiUrl) {
    try {
        const response = await axios.get(apiUrl);
        uiWeatherDetails(
            response.data.main.temp,
            response.data.weather[0].description,
            response.data.main.humidity,
            response.data.wind.speed,
            `${response.data.name}, ${response.data.sys.country}`
        );
        updateWeatherIcon(
            response.data.weather[0].icon,
            response.data.weather[0].description
        );
    } catch (error) {
        console.error("Failed to fetch data:", error);
    }
}
/**
 * Fetch current temperature data in Celsius from API and update the UI
 * Specifically, it triggers the `fetchAndUpdateWeather` function to update the UI.
 * @param {number} lat - Latitude
 * @param {number} long - Longitude
 */
async function getCurrentTempByCoordinates(lat, long) {
    const apiUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${long}&units=metric&appid=${apiKeyOne}`;
    fetchAndUpdateWeather(apiUrl);
}
/**
 * Fetches the current temperature data based on a city name and temperature unit and updates the UI.
 * Specifically, it triggers the `fetchAndUpdateWeather` function to update the UI.
 * @param {string} city - The name of the city.
 * @param {string} unit - The temperature unit ('metric' or 'imperial').
 */
async function getCurrentTempCity(city, unit) {
    const apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKeyOne}&units=${unit}`;
    fetchAndUpdateWeather(apiUrl);
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
    let todayDiv = document.getElementById(elementIds["dateTime"]);
    todayDiv.innerHTML = formatTodayDate(now, daysArr);
    for (let i = 0; i < 5; i++) {
        let element = document.querySelector(daysElementSelectors[i]);
        element.innerHTML = nextFiveDays[i];
    }
}
/**
 * Updates the UI with weather details such as temperature, description, humidity, wind speed, and location.
 * @param {number} temp - The current temperature in the desired unit (e.g., Celsius, Fahrenheit).
 * @param {string} description - The weather description (e.g., "Sunny", "Cloudy").
 * @param {number} humidity - The current humidity percentage.
 * @param {number} windSpeed - The current wind speed in the desired unit (e.g., mph, km/h).
 * @param {string} location - The current location (e.g., city name).
 */
function uiWeatherDetails(temp, description, humidity, windSpeed, location) {
    updateWeatherDetails("temperatureValue", Math.round(temp));
    updateWeatherDetails("description", description);
    updateWeatherDetails("humidity", humidity);
    updateWeatherDetails("windSpeed", Math.round(windSpeed));
    updateWeatherDetails("location", location);
}
/**
 * Updates a specific weather detail in the UI.
 * @param {string} idName - The HTML element ID to target for updating.
 * @param {(string|number)} newValue - The new value to set for the targeted HTML element. Can be a temperature, description, etc.
 */
function updateWeatherDetails(key, newValue) {
    let detailsElement = document.getElementById(elementIds[key]);
    detailsElement.innerHTML = newValue;
}
/**
 * Updates the weather icon and its description in the UI.
 * @param {string} icon - The icon code from the weather API.
 * @param {string} description - The description of the weather condition.
 */
function updateWeatherIcon(icon, description) {
    let weatherIcon = document.getElementById(elementIds["weatherIcon"]);
    weatherIcon.setAttribute(
        "src",
        `http://openweathermap.org/img/wn/${icon}@2x.png`
    );
    weatherIcon.setAttribute("alt", description);
}
/**
 * Updates the class for active and inactive units.
 * @param {HTMLElement} toActiveElement - The element to set as active.
 * @param {HTMLElement[]} toInactiveElement - The element to set as inactive.
 */
function updateUnitClass(toActiveElement, toInactiveElement) {
    toActiveElement.classList.add("active");
    toActiveElement.classList.remove("inactive");
    toInactiveElement.classList.add("inactive");
    toInactiveElement.classList.remove("active");
}

// ------------------------------
// SECTION: Event Listeners and Initializations
// ------------------------------

/**
 * Handles click and submit events to update temperature units, fetch current temperature,
 * and update UI classes.
 *
 * @param {Event} event - The DOM event triggered.
 * @param {string} unit - The unit of measurement ("metric" or "imperial").
 * @param {HTMLElement} activeSpan - The span element to be activated (will receive a special CSS class).
 * @param {HTMLElement} inactiveSpan - The span element to be deactivated (will lose the special CSS class).
 * @param {string} location - The location for which to get the current temperature.
 */
function handleClicksSubmit(event, unit, activeSpan, inactiveSpan, location) {
    event.preventDefault();
    let unitSpan = document.getElementById(elementIds["windUnit"]);
    unitSpan.innerHTML = unit === "metric" ? "m/s" : "mph";
    getCurrentTempCity(location, unit);
    updateUnitClass(activeSpan, inactiveSpan);
}

// Initialize temperature with Celsius data
navigator.geolocation.getCurrentPosition(
    findGeoLocationInitialTemp,
    handleGeoLocationError
);

// Add event listeners for temperature scale buttons
let fahrenheitSpan = document.getElementById(elementIds["fahrenheit"]);
let celsiusSpan = document.getElementById(elementIds["celsius"]);

celsiusSpan.addEventListener("click", (event) => {
    let locationDiv = document.getElementById(elementIds["location"]);
    handleClicksSubmit(
        event,
        "metric",
        celsiusSpan,
        fahrenheitSpan,
        locationDiv.innerHTML
    );
});
fahrenheitSpan.addEventListener("click", (event) => {
    let locationDiv = document.getElementById(elementIds["location"]);
    handleClicksSubmit(
        event,
        "imperial",
        fahrenheitSpan,
        celsiusSpan,
        locationDiv.innerHTML
    );
});

// Add event listener for search form submission
let form = document.querySelector(".search-form");
form.addEventListener("submit", (event) => {
    let searchInput = document.getElementById(elementIds["searchInput"]);
    handleClicksSubmit(
        event,
        "metric",
        celsiusSpan,
        fahrenheitSpan,
        searchInput.value
    );
    searchInput.value = "";
});

// Add event listener for current location button
let currentButton = document.getElementById(elementIds["currentLocation"]);
currentButton.addEventListener("click", handleCurrentLocationClick);

// Initialize UI elements
let nextFiveDays = formatFutureDays(now, daysArr, 5);
updateUIElementsDays(nextFiveDays);

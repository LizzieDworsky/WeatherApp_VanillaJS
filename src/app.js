import { apiKey, googleApiKey } from "../apiKeys.js";

// ------------------------------
// SECTION: Time and Days Handling
// ------------------------------

// TODO: Update timezones
// Initialize current date and days array
const localDate = new Date();
const utcDate = localDate.getTime();
const timeOffset = -28800 * 1000;
const timeZoneDate = new Date(utcDate + timeOffset);
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
    timezoneTime: "timezone-time",
    currentLocation: "navigate-icon",
    weatherIcon: "weather-icon",
    forecastRow: "forecast-row",
};
/**
 * Format the current date and time based on local or UTC time.
 *
 * @param {Date} dateObj - The date object to format.
 * @param {string[]} daysArr - Array of days in a week, used for formatting the day.
 * @param {boolean} isUTC - Flag to indicate whether to use UTC time. If true, uses UTC time; otherwise, uses local time.
 *
 * @returns {string} - Formatted string representing the date and time, including AM/PM.
 */
function formatTodayDate(dateObj, daysArr, isUTC) {
    console.log(dateObj);
    console.log(dateObj.getHours());
    let day, hour, minutes;
    if (isUTC) {
        day = daysArr[dateObj.getUTCDay()];
        hour = dateObj.getUTCHours();
        minutes = dateObj.getUTCMinutes();
    } else {
        day = daysArr[dateObj.getDay()];
        hour = dateObj.getHours();
        minutes = dateObj.getMinutes();
    }

    if (minutes < 10) {
        minutes = `0${minutes}`;
    }
    let ampm = hour >= 12 ? "PM" : "AM";
    hour = hour % 12;
    hour = hour ? hour : 12;
    return `${day} ${hour}:${minutes} ${ampm}`;
}
/**
 * Get future days based on the current day
 * @param {Date} dateObj - The date object
 * @param {string[]} daysArr - Array of days in a week
 * @param {number} numberOfDays - Number of future days to get
 * @returns {string[]} - Array of future days
 */
function formatDays(dateObj, daysArr, numberOfDays) {
    let futureDays = [];
    for (let i = 0; i < numberOfDays; i++) {
        let daysIndex = (dateObj.getDay() + i) % 7;
        futureDays.push(daysArr[daysIndex]);
    }
    return futureDays;
}
async function fetchTimeZoneData(lat, long, timeStamp) {
    try {
        const response = await axios.get(
            `https://maps.googleapis.com/maps/api/timezone/json?location=${lat},${long}&timestamp=${timeStamp}&key=${googleApiKey}`
        );
        console.log(response.data);
        const isDST = response.dstOffset !== 0;
        const timeZoneOffset =
            (isDST ? response.data.dstOffset : response.data.rawOffset) * 1000;
        console.log(timeZoneOffset);
        // console.log(formatTodayDate(response.data));
    } catch (error) {
        console.error("Failed to fetch data:", error);
    }
}
fetchTimeZoneData(38.7077507, -9.1365919, 1697120560);

let localDateTimeEle = document.getElementById(elementIds["dateTime"]);
let localDateTime = formatTodayDate(localDate, daysArr, false);
localDateTimeEle.innerHTML = localDateTime;

let timeZoneEle = document.getElementById(elementIds["timezoneTime"]);
let timeZone = formatTodayDate(timeZoneDate, daysArr, true);
timeZoneEle.innerHTML = timeZone;

// ------------------------------
// SECTION: Geolocation and Temperature Unit Handling
// ------------------------------

/**
 * Handles the error when geolocation fails. Defaults to weather data for Albuquerque.
 * @param {PositionError} error - The geolocation error object.
 */
function handleGeoLocationError(error) {
    console.error("Geolocation failed:", error);
    getCurrentTempCity("Albuquerque", "metric");
    getForecastCity("Albuquerque", "metric");
    locationButton.style.display = "none";
}
/**
 * Fetches the current geolocation and initiates a request to get the current weather data and forecast.
 * @param {Object} position - The geolocation position object.
 * @param {Object} position.coords - The coordinates object.
 * @param {number} position.coords.latitude - The latitude. Passed into `getCurrentTempByCoordinates`.
 * @param {number} position.coords.longitude - The longitude. Passed into `getCurrentTempByCoordinates`.
 */
function findGeoLocationInitialTemp(position) {
    let currentLocation = [position.coords.latitude, position.coords.longitude];
    getCurrentTempByCoordinates(currentLocation[0], currentLocation[1]);
    getForecastByCoordinates(currentLocation[0], currentLocation[1]);
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
async function fetchAndUpdateCurrentWeather(apiUrl) {
    try {
        const response = await axios.get(apiUrl);
        updateWeatherDetails(
            response.data.temperature.current,
            response.data.condition.description,
            response.data.temperature.humidity,
            response.data.wind.speed,
            `${response.data.city}, ${response.data.country}`
        );
        updateWeatherIcon(
            response.data.condition.icon_url,
            response.data.condition.description
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
    const apiUrl = `https://api.shecodes.io/weather/v1/current?lat=${lat}&lon=${long}&key=${apiKey}&units=metric`;
    fetchAndUpdateCurrentWeather(apiUrl);
}
/**
 * Fetches the current temperature data based on a city name and temperature unit and updates the UI.
 * Specifically, it triggers the `fetchAndUpdateWeather` function to update the UI.
 * @param {string} city - The name of the city.
 * @param {string} unit - The temperature unit ('metric' or 'imperial').
 */
async function getCurrentTempCity(city, unit) {
    const apiUrl = `https://api.shecodes.io/weather/v1/current?query=${city}&key=${apiKey}&units=${unit}`;
    fetchAndUpdateCurrentWeather(apiUrl);
}

// ------------------------------
// SECTION: Upcoming Weather Handling
// ------------------------------

/**
 * Generic function to fetch the forecast data from API and update the UI.
 * @param {string} apiUrl - The API URL to fetch data from.
 * @throws {Error} Throws an error if the API call fails and logs it to the console.
 */
async function fetchAndUpdateForecast(apiUrl) {
    try {
        const response = await axios.get(apiUrl);
        formatForecastObject(response.data);
    } catch (error) {
        console.error("Failed to fetch data:", error);
    }
}
/**
 * Fetches the 7-day weather forecast based on latitude and longitude.
 * Calls `fetchAndUpdateForecast` with the constructed API URL.
 * @param {number} lat - The latitude.
 * @param {number} long - The longitude.
 */
function getForecastByCoordinates(lat, long) {
    let apiUrl = `https://api.shecodes.io/weather/v1/forecast?lat=${lat}&lon=${long}&key=${apiKey}&units=metric`;
    fetchAndUpdateForecast(apiUrl);
}
/**
 * Fetches the forecast data based on a city name and temperature unit and updates the UI.
 * Calls `fetchAndUpdateForecast` with the constructed API URL.
 * @param {string} city - The name of the city.
 * @param {string} unit - The temperature unit ('metric' or 'imperial').
 */
async function getForecastCity(city, unit) {
    const apiUrl = `https://api.shecodes.io/weather/v1/forecast?query=${city}&key=${apiKey}&units=${unit}`;
    fetchAndUpdateForecast(apiUrl);
}
/**
 * Formats the forecast object to include relevant weather details for future days.
 * @param {Object} responseObj - The response object from the API containing forecast data.
 */
function formatForecastObject(responseObj) {
    let futureDays = formatDays(localDate, daysArr, 6);
    let arrayOfForecastObj = Array(futureDays.length)
        .fill(null)
        .map(() => ({ day: "" }));

    for (let i = 0; i < futureDays.length; i++) {
        arrayOfForecastObj[i].day = futureDays[i];
        arrayOfForecastObj[i].icon = responseObj.daily[i].condition.icon_url;
        arrayOfForecastObj[i].condition =
            responseObj.daily[i].condition.description;
        arrayOfForecastObj[i].maxTemp = Math.round(
            responseObj.daily[i].temperature.maximum
        );
        arrayOfForecastObj[i].minTemp = Math.round(
            responseObj.daily[i].temperature.minimum
        );
    }
    updateForecastUI(arrayOfForecastObj);
}

// ------------------------------
// SECTION: UI Updating Functions
// ------------------------------

/**
 * Updates the UI to display the weather forecast.
 * @param {Object[]} arrayOfForecastObj - An array of forecast objects containing weather details for future days.
 */
function updateForecastUI(arrayOfForecastObj) {
    let forecastHtml = "";
    arrayOfForecastObj.forEach((forecastObj) => {
        forecastHtml += `
        <div class="col-lg-2 col-md-4 col-sm-6 col-12 p-0">
            <div class="card m-2 custom-cards">
            <div class="card-body p-3">
                <h5 class="forecast-day">${forecastObj.day}</h5>
                <img src="${forecastObj.icon}" title="${forecastObj.condition}" alt="${forecastObj.condition}" class="forecast-icons" />
                <h5>
                <span class="forecast-temp max">${forecastObj.maxTemp}°</span>
                <span class="forecast-temp pike">|</span>
                <span class="forecast-temp min">${forecastObj.minTemp}°</span>
                </h5>
            </div>
            </div>
        </div>
    `;
    });
    let forcastRow = document.getElementById(elementIds["forecastRow"]);
    forcastRow.innerHTML = forecastHtml;
}
/**
 * Updates the UI with weather details such as temperature, description, humidity, wind speed, and location.
 * @param {number} temp - The current temperature in the desired unit (e.g., Celsius, Fahrenheit).
 * @param {string} description - The weather description (e.g., "Sunny", "Cloudy").
 * @param {number} humidity - The current humidity percentage.
 * @param {number} windSpeed - The current wind speed in the desired unit (e.g., mph, km/h).
 * @param {string} location - The current location (e.g., city name).
 */
function updateWeatherDetails(
    temp,
    description,
    humidity,
    windSpeed,
    location
) {
    updateWeatherDetailsUI("temperatureValue", Math.round(temp));
    updateWeatherDetailsUI("description", description);
    updateWeatherDetailsUI("humidity", humidity);
    updateWeatherDetailsUI("windSpeed", Math.round(windSpeed));
    updateWeatherDetailsUI("location", location);
}
/**
 * Updates a specific weather detail in the UI.
 * @param {string} key - The HTML element ID to target for updating.
 * @param {(string|number)} newValue - The new value to set for the targeted HTML element. Can be a temperature, description, etc.
 */
function updateWeatherDetailsUI(key, newValue) {
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
    weatherIcon.setAttribute("src", icon);
    weatherIcon.setAttribute("alt", description);
}
/**
 * Updates the class for active and inactive units.
 * @param {HTMLElement} toActiveElement - The element to set as active.
 * @param {HTMLElement} toInactiveElement - The element to set as inactive.
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
 * @param {HTMLElement} activeSpan - The DOM element to be activated (will receive a special CSS class).
 * @param {HTMLElement} inactiveSpan - The DOM element to be deactivated (will lose the special CSS class).
 * @param {string} location - The location for which to get the current temperature.
 */
function handleClicksSubmit(event, unit, activeSpan, inactiveSpan, location) {
    event.preventDefault();
    let unitSpan = document.getElementById(elementIds["windUnit"]);
    unitSpan.innerHTML = unit === "metric" ? "m/s" : "mph";
    getCurrentTempCity(location, unit);
    getForecastCity(location, unit);
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
currentButton.addEventListener("click", (event) => {
    handleCurrentLocationClick();
    updateUnitClass(celsiusSpan, fahrenheitSpan);
});

/**
 * Asynchronously fetches the API key from a secure Netlify function.
 *
 * @async
 * @returns {Promise<string|null>} A promise that resolves to the API key if successful, or null if an error occurs.
 * @throws Will print an error message to the console if an error occurs.
 */
async function fetchApiKey() {
    try {
        const response = await axios.get("/.netlify/functions/fetchApiKey");
        return response.data.key;
    } catch (error) {
        console.error("An error occurred while fetching the API key:", error);
        return null;
    }
}
const apiKey = await fetchApiKey();

// ------------------------------
// SECTION: Time and Days Handling
// ------------------------------

// Initialize current date and days array
const localDate = new Date();
const unixTimestamp = localDate.getTime();
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
 * Formats the current date and time based on local or UTC time.
 * @param {Date} dateObj - The date object to format.
 * @param {string[]} daysArr - Array of days in a week.
 * @param {boolean} isUTC - Whether to use UTC time.
 * @returns {string} Formatted date and time string.
 */
function formatTodayDate(dateObj, daysArr, isUTC) {
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
 * Gets future days based on the current day.
 * @param {Date} dateObj - The date object.
 * @param {string[]} daysArr - Array of days in a week.
 * @param {number} numberOfDays - Number of future days to get.
 * @returns {string[]} Array of future days, including today.
 */
function formatDays(dateObj, daysArr, numberOfDays) {
    let futureDays = [];
    for (let i = 0; i < numberOfDays; i++) {
        let daysIndex = (dateObj.getDay() + i) % 7;
        futureDays.push(daysArr[daysIndex]);
    }
    return futureDays;
}
/**
 * Fetches time zone data from Google Maps API based on latitude, longitude, and timestamp.
 * Calls `formattimeZoneData` to format and update the UI with the fetched data.
 *
 * @async
 * @param {number} lat - The latitude of the location.
 * @param {number} long - The longitude of the location.
 * @param {number} timeStamp - The Unix timestamp for which to fetch time zone data.
 * @throws {Error} Logs an error to the console if the API call fails.
 */
async function fetchTimeZoneData(lat, long, timeStamp) {
    try {
        const response = await axios.get(
            `https://maps.googleapis.com/maps/api/timezone/json?location=${lat},${long}&timestamp=${timeStamp}&key=${googleApiKey}`
        );
        formattimeZoneData(response.data);
    } catch (error) {
        console.error("Failed to fetch data:", error);
    }
}
/**
 * Formats the time zone data and updates the UI.
 * Calculates the time zone offset and updates the time displayed in the UI based on the response object.
 *
 * @param {Object} responseObj - The response object from the Google Maps API containing time zone data.
 * @param {number} responseObj.rawOffset - The time offset from UTC, in seconds.
 * @param {number} responseObj.dstOffset - The daylight saving time offset, in seconds.
 */
function formattimeZoneData(responseObj) {
    const isDST = responseObj.dstOffset !== 0;
    const timeZoneOffset =
        (isDST
            ? responseObj.rawOffset + responseObj.dstOffset
            : responseObj.rawOffset) * 1000;
    const timeZoneDate = new Date(unixTimestamp + timeZoneOffset);
    let timeZoneEle = document.getElementById(elementIds["timezoneTime"]);
    timeZoneEle.innerHTML = formatTodayDate(timeZoneDate, daysArr, true);
}

// ------------------------------
// SECTION: Geolocation and Temperature Unit Handling
// ------------------------------

/**
 * Handles geolocation errors by defaulting to weather data for Albuquerque.
 * @param {PositionError} error - Geolocation error object.
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

function handleLocationError(inputEle) {
    inputEle.placeholder = "Invalid location, please try again.";
    inputEle.classList.add("location-error");
}

/**
 * Generic function to fetch current temperature data from API and update the UI.
 * @param {string} apiUrl - The API URL to fetch data from.
 * @param {boolean} [isNewCity=false] - Whether the location is a new city.
 * @throws {Error} Throws an error if the API call fails.
 */
async function fetchAndUpdateCurrentWeather(apiUrl, isNewCity = false) {
    let inputEle = document.getElementById(elementIds["searchInput"]);
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
        if (isNewCity) {
            fetchTimeZoneData(
                response.data.coordinates.latitude,
                response.data.coordinates.longitude,
                response.data.time
            );
        }
        if (inputEle.classList.contains("location-error")) {
            inputEle.classList.remove("location-error");
            inputEle.placeholder = "Search by city";
        }
    } catch (error) {
        console.error("Failed to fetch data:", error);
        handleLocationError(inputEle);
    }
}
/**
 * Fetch current temperature data in Celsius from API and update the UI
 * Specifically, it triggers the `fetchAndUpdateWeather` function to update the UI.
 * @param {number} lat - Latitude
 * @param {number} long - Longitude
 */
function getCurrentTempByCoordinates(lat, long) {
    const apiUrl = `https://api.shecodes.io/weather/v1/current?lat=${lat}&lon=${long}&key=${weatherApiKey}&units=metric`;
    fetchAndUpdateCurrentWeather(apiUrl);
}
/**
 * Fetches the current temperature data based on a city name and temperature unit and updates the UI.
 * Specifically, it triggers the `fetchAndUpdateWeather` function to update the UI.
 * @param {string} city - The name of the city.
 * @param {boolean} [isNewCity=false] - Whether the location is a new city.
 * @param {string} unit - The temperature unit ('metric' or 'imperial').
 */
function getCurrentTempCity(city, unit, isNewCity = false) {
    const apiUrl = `https://api.shecodes.io/weather/v1/current?query=${city}&key=${weatherApiKey}&units=${unit}`;
    fetchAndUpdateCurrentWeather(apiUrl, isNewCity);
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
    let apiUrl = `https://api.shecodes.io/weather/v1/forecast?lat=${lat}&lon=${long}&key=${weatherApiKey}&units=metric`;
    fetchAndUpdateForecast(apiUrl);
}
/**
 * Fetches the forecast data based on a city name and temperature unit and updates the UI.
 * Calls `fetchAndUpdateForecast` with the constructed API URL.
 * @param {string} city - The name of the city.
 * @param {string} unit - The temperature unit ('metric' or 'imperial').
 */
async function getForecastCity(city, unit) {
    const apiUrl = `https://api.shecodes.io/weather/v1/forecast?query=${city}&key=${weatherApiKey}&units=${unit}`;
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
/**
 * Updates the initial date and time information in the UI.
 *
 * This function fetches the current local date and time using the `formatTodayDate` function and updates
 * the corresponding HTML elements for displaying the local date and time as well as the time zone.
 */
function updateDateTimeUICurrentLocation() {
    let localDateTimeEle = document.getElementById(elementIds["dateTime"]);
    let localDateTime = formatTodayDate(localDate, daysArr, false);
    let timeZoneEle = document.getElementById(elementIds["timezoneTime"]);
    localDateTimeEle.innerHTML = localDateTime;
    timeZoneEle.innerHTML = localDateTime;
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
 * @param {boolean} [isNewCity=false] - Whether the location is a new city.
 */
function handleClicksSubmit(
    event,
    unit,
    activeSpan,
    inactiveSpan,
    location,
    isNewCity = false
) {
    event.preventDefault();
    let unitSpan = document.getElementById(elementIds["windUnit"]);
    unitSpan.innerHTML = unit === "metric" ? "m/s" : "mph";
    getCurrentTempCity(location, unit, isNewCity);
    getForecastCity(location, unit);
    updateUnitClass(activeSpan, inactiveSpan);
}

// Initialize date and time display in UI
updateDateTimeUICurrentLocation();

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
        searchInput.value,
        true
    );
    searchInput.value = "";
});

// Add event listener for current location button
let currentButton = document.getElementById(elementIds["currentLocation"]);
currentButton.addEventListener("click", (event) => {
    handleCurrentLocationClick();
    updateUnitClass(celsiusSpan, fahrenheitSpan);
    updateDateTimeUICurrentLocation();
});

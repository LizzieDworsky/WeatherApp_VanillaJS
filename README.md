# Weather Application

## Table of Contents

-   [Live Demo](#live-demo)
-   [Description](#description)
-   [Features](#features)
-   [Installation](#installation)
-   [Usage](#usage)
-   [File Structure](#file-structure)
-   [Future Work](#future-work)
-   [Challenges and Lessons Learned](#challenges-and-lessons-learned)
-   [Contributing](#contributing)

## Live Demo

You can check out the live demo of the application here: [Live Demo Link](https://glowing-conkies-bc37a3.netlify.app/).

## Description

This is a weather application that fetches real-time weather data based on the user's location. The application uses two separate APIs to fetch the current weather and the forecast for the next 5 days.

## Features

-   **Geolocation**: Automatically fetches the user's location to display local weather information.
-   **Current Weather**: Displays the current temperature, humidity, wind speed, and an icon representing the weather condition.
-   **Local Time**: Shows the local time of the location being displayed.
-   **5-Day Forecast**: Provides the weather forecast for the current day and the following five days.
-   **Search Bar**: Allows the user to input a city and get the weather and time data for that location.
-   **Error Handling**: Proper error messages for invalid locations and fallback to a default location if geolocation is not enabled.

## Installation

No special installation steps are required as this is a vanilla JavaScript project. Simply download or clone the repository and open `index.html` in a web browser.

## Usage

1. **Open the Project**: Navigate to the folder where you downloaded or cloned the project and double-click on `index.html` to open it in a web browser.
2. **Allow Location**: A prompt will appear asking for your location. Click "Allow" to get weather data for your current location.
3. **Search by City**: Use the search bar at the top of the page to find weather data for different cities.

**Note**: If you deny location access, the default location will be Albuquerque.

## File Structure

-   `index.html`: Main HTML file
-   `main.js`: Contains all JavaScript logic for fetching and displaying data
-   `styles.css`: All styles for the application

## Future Work

-   **Time Zone Issue**: There is a known limitation regarding the time display. When the user denies access to geolocation, the default location is set to Albuquerque, but the local time might not correspond to the user's actual time zone. This issue will be addressed in future iterations.
-   **Additional Weather Metrics**: Future versions will include more detailed weather metrics such as air quality index and UV index.
-   **Google Places Integration**: Plans to integrate Google Places API to auto-populate the search input box, improving the user experience.
-   **Mobile Responsiveness**: Work on improving the UI for better mobile responsiveness is planned.

## Challenges and Lessons Learned

### Asynchronous API Calls

I encountered difficulty in finding a suitable API for fetching both current and forecast weather data that was free to use. After experimenting with three different APIs, I settled on one that met my requirements. The Google Time Zone API was straightforward in contrast; however, I did invest time in understanding how to utilize the time zone data effectively, especially when it came to accounting for daylight savings and decoding the Unix timestamp, UTC, and offsets.

### User Geolocation

While this part of the project was relatively straightforward for me, it's worth noting that geolocation can often present challenges, such as user permissions or inaccurate location data.

### UI Implementation

Several challenges arose in terms of design and responsiveness, especially while templating the HTML for the weather forecast cards. Here is the code snippet that I used to tackle this issue:

```javascript
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
    let forecastRow = document.getElementById(elementIds["forecastRow"]);
    forecastRow.innerHTML = forecastHtml;
}
```

### Error Handling

Understanding how to gracefully handle errors was an interesting challenge. I had to figure out how to notify users effectively when something didn't work as expected, like a location not being found in the API.

## Contributing

Instructions for other developers on how to contribute to your project:

1. **Fork the repository**
2. **Create a new branch**
    ```bash
    git checkout -b new-feature
    ```
3. **Commit your changes**
    ```bash
    git commit -m 'Add some feature'
    ```
4. **Push to the branch**
    ```bash
    git push origin new-feature
    ```
5. **Create a new Pull Request**

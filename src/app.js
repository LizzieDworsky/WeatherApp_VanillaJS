// Time and Days

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

function formatTodayDate(dateObj, daysArr) {
    let day = daysArr[dateObj.getDay()];
    let hour = dateObj.getHours();
    let minutes = dateObj.getMinutes();
    if (minutes < 10) {
        minutes = `0${minutes}`;
    }
    return `${day} ${hour}:${minutes}`;
}

function formatFutureDays(dateObj, daysArr, numberOfDays) {
    let futureDays = [];
    for (let i = 1; i <= numberOfDays; i++) {
        let daysIndex = (dateObj.getDay() + i) % 7;
        futureDays.push(daysArr[daysIndex]);
    }
    return futureDays;
}

// Handle Current Weather / Temperature

async function getCurrentTempData() {
    const response = await axios.get(
        `https://api.openweathermap.org/data/2.5/weather?lat=35.19182118&lon=-106.6941991&units=metric&appid=0a521eaf234a3a56f45252fac3c737ad`
    );
    return response.data;
}

function changeTemperatureScales(newTemperatureValue) {
    let todayTemperature = document.querySelector(".temperature-value");
    todayTemperature.innerHTML = newTemperatureValue;
}

let weatherObj = await getCurrentTempData();
console.log(weatherObj);

let fahrenheitSpan = document.querySelector("#fahrenheit");
let celsiusSpan = document.querySelector("#celsius");

fahrenheitSpan.addEventListener("click", (event) => {
    event.preventDefault();
    changeTemperatureScales(70);
});
celsiusSpan.addEventListener("click", (event) => {
    event.preventDefault();
    changeTemperatureScales(21);
});

// Handle Upcoming Weather / Temperature

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

let nextFiveDays = formatFutureDays(now, daysArr, 5);
updateUIElements(nextFiveDays);

// Handle Search Feature

let form = document.querySelector(".search-form");
form.addEventListener("submit", handleLocationChange);

function handleLocationChange(event) {
    event.preventDefault();
    let searchInput = document.querySelector("#search-location-input");
    let locationDiv = document.querySelector("#location-div");
    locationDiv.innerHTML = searchInput.value;
}

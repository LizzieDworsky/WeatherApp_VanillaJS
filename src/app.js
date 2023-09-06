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

function handleLocationChange(event) {
    event.preventDefault();
    let searchInput = document.querySelector("#search-location-input");
    let locationDiv = document.querySelector("#location-div");
    locationDiv.innerHTML = searchInput.value;
}

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

function changeTemperatureScales(newTemperatureValue) {
    let todayTemperature = document.querySelector(".temperature-value");
    todayTemperature.innerHTML = newTemperatureValue;
}

let nextFiveDays = formatFutureDays(now, daysArr, 5);
updateUIElements(nextFiveDays);

let form = document.querySelector(".search-form");
form.addEventListener("submit", handleLocationChange);

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

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

let dateDiv = document.querySelector("#current-date-time");
let nextFiveDays = formatFutureDays(now, daysArr, 5);
let tomorrow = document.querySelector("#tomorrow-card h6");
let dayThree = document.querySelector("#day-three-card h6");
let dayFour = document.querySelector("#day-four-card h6");
let dayFive = document.querySelector("#day-five-card h6");
let daySix = document.querySelector("#day-six-card h6");
let form = document.querySelector(".search-form");
form.addEventListener("submit", handleLocationChange);
dateDiv.innerHTML = formatTodayDate(now, daysArr);
tomorrow.innerHTML = nextFiveDays[0];
dayThree.innerHTML = nextFiveDays[1];
dayFour.innerHTML = nextFiveDays[2];
dayFive.innerHTML = nextFiveDays[3];
daySix.innerHTML = nextFiveDays[4];

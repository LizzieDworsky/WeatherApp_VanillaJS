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

function formatFutureDays(dateObj, daysArr) {
    let nextFiveDays = [];
    for (let i = 1; i < 6; i++) {
        let daysIndex = (dateObj.getDay() + i) % 7;
        nextFiveDays.push(daysArr[daysIndex]);
    }
    return nextFiveDays;
}

let dateDiv = document.querySelector("#current-date-time");
dateDiv.innerHTML = formatTodayDate(now, daysArr);
let nextFiveDays = formatFutureDays(now, daysArr);
console.log(nextFiveDays);

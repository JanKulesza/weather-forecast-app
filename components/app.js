// Get the overlay element
let overlay = document.getElementById('overlay');

// Function to toggle the visibility of the overlay
let toggleOverlay = () => {
    // Check if the overlay is currently hidden
    if (overlay.style.visibility == 'hidden') {
        // If hidden, make it visible
        overlay.style.visibility = 'visible';
    } else {
        // If visible, hide it
        overlay.style.visibility = 'hidden';
    }
}

// Get the location input element
let locationInput = document.getElementById('locationSelect');

// Get the button to open the location form
let openFormBtn = document.querySelector('.change-location');

// Get the button to submit the chosen city
let submitCityBtn = document.querySelector('.choose');

// Get the button to close the overlay
let closeBtn = document.querySelector('.close');

// Get the element containing the list of cities
let cities = document.querySelector('.cities');

// Add click event listeners to open and close the overlay
[openFormBtn, closeBtn].forEach(element => {
    element.addEventListener('click', toggleOverlay);
});

// Set initial styles for visual elements based on window size
document.getElementById('visual').style.width = window.innerWidth;
document.getElementById('visual1').style.width = window.innerWidth;
document.querySelector('.parallax').style.height = `${window.innerHeight}px`;

// Update visual elements when the window is resized
window.addEventListener('resize', function (event) {
    this.document.getElementById('visual').style.width = this.window.innerWidth;
    this.document.getElementById('visual1').style.width = this.window.innerWidth;
    this.document.querySelector('.parallax').style.height = `${this.window.innerHeight}px`;

    // Adjust display based on window width
    if (this.window.innerWidth < 800) {
        this.document.getElementById('visual').style.display = 'block';
        this.document.getElementById('visual1').style.display = 'none';
    } else {
        this.document.getElementById('visual1').style.display = 'block';
        this.document.getElementById('visual').style.display = 'none';
    }
});

// Initialize arrays and constants for days of the week and chosen days
let chooseDays = Array.from(document.querySelectorAll('.choose-day button'));
const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
let locationLatLon;

// Add input event listener to the location input field
locationInput.addEventListener('input', function (event) {
    let location = locationInput.value;

    // Fetch city data based on user input
    fetch(`http://api.weatherapi.com/v1/search.json?key=2a9b992c0ebc4df194b143043242904&q=${location}`)
        .then(response => response.json())
        .then(data => {
            // Clear existing city elements
            document.querySelectorAll('.city').forEach(element => {
                element.remove();
            })

            // Create new city elements based on fetched data
            data.forEach(element => {
                let newElement = document.createElement('section');
                newElement.classList.add('city');
                newElement.innerHTML = `
                <p class="city-name" data-location="${element.lat}, ${element.lon}" data-location-name="${element.name}">${element.name}, ${element.region}</p>
                <p class="country-name">${element.country}</p>
                `;
                newElement.addEventListener('click', function (event) {
                    // Update location input field with chosen city name
                    let cityNameChoosen = this.querySelector('.city-name').getAttribute('data-location-name');
                    locationLatLon = this.querySelector('.city-name').getAttribute('data-location');
                    locationInput.value = cityNameChoosen;
                })

                cities.appendChild(newElement);
            });
        })
        .catch(error => console.error(error));
});

// Function to insert forecast data into the day forecast section
function insertingDataIntoDayForecast(data, currentHour, forecastDay) {
    // Create elements to display current hour's weather data
    if (forecastDay === 0) {
        let nowElement = document.createElement('section');
        nowElement.classList.add('hour');
        nowElement.innerHTML = `
                <p>Now</p>
                <img src="https:${data.current.condition.icon}" alt="${data.current.condition.text}">
                <p>${data.forecast.forecastday[forecastDay].hour[currentHour].temp_c}°C</p>
                <p class="chance-of-rain">${data.forecast.forecastday[forecastDay].hour[currentHour].chance_of_rain > data.forecast.forecastday[forecastDay].hour[currentHour].chance_of_snow ? data.forecast.forecastday[forecastDay].hour[currentHour].chance_of_rain : data.forecast.forecastday[forecastDay].hour[currentHour].chance_of_snow}%</p>
            `;
        document.querySelector('.weather-each-hour').appendChild(nowElement);
    } else currentHour = -1;

    // Create elements for remaining hours' weather data
    data.forecast.forecastday[forecastDay].hour.forEach(element => {
        if (parseInt(element.time.slice(11, 13)) > currentHour) {
            let newElement = document.createElement('section');
            newElement.classList.add('hour');
            newElement.innerHTML = `
                    <p>${element.time.slice(11, 15)}</p>
                    <img src="https:${element.condition.icon}" alt="${element.condition.text}">
                    <p>${element.temp_c}°C</p>
                    <p class="chance-of-rain">${element.chance_of_rain > element.chance_of_snow ? element.chance_of_rain : element.chance_of_snow}%</p>
                `;
            document.querySelector('.weather-each-hour').appendChild(newElement);
        }
    });
}

// Function to load forecast data
function loadingForecast() {
    // Fetch weather forecast data based on location
    fetch(`http://api.weatherapi.com/v1/forecast.json?key=2a9b992c0ebc4df194b143043242904&q=${locationLatLon}&days=7&aqi=no&alerts=yes`)
        .then(result => result.json())
        .then(data => {
            let forecast = document.querySelector('.forecast');
            currentHour = parseInt(data.current.last_updated.slice(11, 13));

            // Remove existing day forecast elements
            forecast.querySelectorAll('.day').forEach(element => element.remove());
            document.querySelector('.weather-each-hour').querySelectorAll('.hour').forEach(element => element.remove());

            // Update header with current weather information
            document.querySelector('header').innerHTML = `
                <p>${data.current.condition.text}</p>
                <img src="https:${data.current.condition.icon}" alt="${data.current.condition.text}">
                <h2>${data.current.temp_c}°C</h2>
            `
            // Update location name
            document.querySelector('.location-name').innerHTML = `
            <div class="location-name">
                <h2>${data.location.name}, ${data.location.country}</h2>
            </div>
            `;

            // Insert forecast data into day forecast sections
            insertingDataIntoDayForecast(data, currentHour, 0);

            // Create elements for each forecast day
            for (let i = 0; i < 7; i++) {
                let currentDayOfWeek = new Date(data.forecast.forecastday[i].date).getDay();
                let newElement = document.createElement('section');
                newElement.classList.add('day');
                newElement.innerHTML = `
                <p>${daysOfWeek[currentDayOfWeek - 1 >= 0 ? currentDayOfWeek - 1 : 6]}</p>
                <img src="https:${data.forecast.forecastday[i].day.condition.icon}" alt="${data.forecast.forecastday[i].day.condition.text}">
                <p class="max-min-temp">${data.forecast.forecastday[i].day.maxtemp_c}°C, ${data.forecast.forecastday[i].day.mintemp_c}°C</p>
                `;

                forecast.appendChild(newElement)
            }
        })
        .catch(error => console.error(error));
}

// Get user's location and load forecast data
if ("geolocation" in navigator) {
    navigator.geolocation.getCurrentPosition(
        // Success callback function
        function (position) {
            // Access the latitude and longitude coordinates
            const latitude = position.coords.latitude;
            const longitude = position.coords.longitude;
            locationLatLon = `${latitude.toFixed(2)}, ${longitude.toFixed(2)}`
            loadingForecast()
        },
        // Error callback function
        function (error) {
            // Handle any errors
            console.error("Error getting location:", error);
        }
    );
} else {
    console.error("Geolocation is not supported by this browser.");
}

// Add click event listener to submit button for chosen city
submitCityBtn.addEventListener('click', function (event) {
    // Add focus style to first day button
    chooseDays[0].classList.add('focus');
    chooseDays[1].classList.remove('focus');

    // Hide the overlay
    overlay.style.visibility = 'hidden';

    // Load forecast data for chosen city
    loadingForecast();
});

// Add click event listeners to day buttons for switching forecast days
chooseDays.forEach(element => {
    element.addEventListener('click', function (event) {
        // Remove focus style from all day buttons
        chooseDays[0].classList.remove('focus');
        chooseDays[1].classList.remove('focus');
        // Add focus style to clicked day button
        element.classList.add('focus');

        // Fetch forecast data for selected day
        fetch(`http://api.weatherapi.com/v1/forecast.json?key=2a9b992c0ebc4df194b143043242904&q=${locationLatLon}&days=2&aqi=no&alerts=yes`)
            .then(result => result.json())
            .then(data => {
                currentHour = parseInt(data.current.last_updated.slice(11, 13));
                // Clear existing hour forecast elements
                document.querySelector('.weather-each-hour').querySelectorAll('.hour').forEach(element => element.remove());
                // Insert forecast data for selected day
                insertingDataIntoDayForecast(data, currentHour, chooseDays.findIndex(element => element.classList.contains('focus')));
            })
            .catch(error => console.error(error));
    })
});

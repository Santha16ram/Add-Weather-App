const apiKey = "9a14ac8875a97180fd4840397b88c72e";
const apiUrl = "https://api.openweathermap.org/data/2.5/forecast?units=metric&q=";

const cityInput = document.getElementById("city-input");
const searchButton = document.getElementById("search-btn");
const weatherDashboard = document.querySelector(".weather-dashboard");
const errorMessage = document.getElementById("error-message");
const forecastContainer = document.getElementById("forecast-container");

const cityNameEl = document.getElementById("city-name");
const tempEl = document.getElementById("temperature");
const feelsLikeEl = document.getElementById("feels-like");
const humidityEl = document.getElementById("humidity");
const windSpeedEl = document.getElementById("wind-speed");
const pressureEl = document.getElementById("pressure");
const weatherIconEl = document.getElementById("weather-icon");
const descriptionEl = document.getElementById("weather-description");

const mpsToKmh = (mps) => Math.round(mps * 3.6);

const getDayName = (dt_txt) => {
    const date = new Date(dt_txt);
    return date.toLocaleDateString('en-US', { weekday: 'short' });
};

/**
 * Fetches and displays both current and 5-day forecast data.
 * @param {string} city - The name of the city to fetch weather for.
 */
async function checkWeather(city) {
    errorMessage.style.display = "none";
    weatherDashboard.style.opacity = 0; 
    forecastContainer.innerHTML = ''; 

    try {
        const response = await fetch(apiUrl + city + `&appid=${apiKey}`);

        if (response.status === 404) {
            errorMessage.querySelector('p').textContent = "City not found. Please try again.";
            errorMessage.style.display = "block";
            return;
        }

        const data = await response.json();
        
        const currentData = data.list[0];
        
        cityNameEl.innerHTML = data.city.name;
        tempEl.innerHTML = Math.round(currentData.main.temp) + "°C";
        feelsLikeEl.innerHTML = `Feels like: ${Math.round(currentData.main.feels_like)}°C`;
        humidityEl.innerHTML = currentData.main.humidity + "%";
        windSpeedEl.innerHTML = mpsToKmh(currentData.wind.speed) + " km/h"; 
        pressureEl.innerHTML = currentData.main.pressure + " hPa";
        descriptionEl.innerHTML = currentData.weather[0].description; 

        const iconCode = currentData.weather[0].icon;
        weatherIconEl.src = `http://openweathermap.org/img/wn/${iconCode}@2x.png`;
        
        displayForecast(data.list);

        weatherDashboard.style.opacity = 1; 
        cityInput.value = ""; 

    } catch (error) {
        console.error("Error fetching weather data:", error);
        errorMessage.querySelector('p').textContent = "Could not fetch data. Check your network or API key.";
        errorMessage.style.display = "block";
    }
}


/**
 * Processes the list of 3-hour forecast intervals to display a 5-day forecast.
 * @param {Array} list - The 'list' array from the OpenWeatherMap 'forecast' response.
 */
function displayForecast(list) {
    const forecast = {};
    const today = new Date().toDateString();

    for (let item of list) {
        const dateKey = new Date(item.dt_txt).toDateString();
        
        if (dateKey === today) continue;

        if (!forecast[dateKey]) {
            forecast[dateKey] = {
                day: getDayName(item.dt_txt),
                maxTemp: -Infinity,
                minTemp: Infinity,
                icon: item.weather[0].icon,
            };
        }

        forecast[dateKey].maxTemp = Math.max(forecast[dateKey].maxTemp, item.main.temp_max);
        forecast[dateKey].minTemp = Math.min(forecast[dateKey].minTemp, item.main.temp_min);
    }
    
    const forecastDays = Object.values(forecast).slice(0, 5);

    forecastDays.forEach(dayData => {
        const forecastDayEl = document.createElement('div');
        forecastDayEl.className = 'forecast-day';
        
        forecastDayEl.innerHTML = `
            <span class="day-label">${dayData.day}</span>
            <img src="http://openweathermap.org/img/wn/${dayData.icon}@2x.png" class="day-icon" alt="Weather icon">
            <span class="day-temp-max">${Math.round(dayData.maxTemp)}°C</span>
            <span class="day-temp-min">${Math.round(dayData.minTemp)}°C</span>
        `;
        forecastContainer.appendChild(forecastDayEl);
    });
}



searchButton.addEventListener("click", () => {
    const city = cityInput.value.trim();
    if (city) {
        checkWeather(city);
    }
});

cityInput.addEventListener("keypress", (event) => {
    if (event.key === "Enter") {
        searchButton.click();
    }
});

checkWeather("Coimbatore");
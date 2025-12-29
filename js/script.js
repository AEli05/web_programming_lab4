const APP_STATE_KEY = "weatherAppState";
const API_KEY = "11bfaffb59904ac8ba3205312252512"
const BASE_URL = "https://api.weatherapi.com/v1/forecast.json";
let currentState = {
    currentLocation: null,
    cities: [],
};
let appContainer = null;
let cityInput = null;
let suggestionsList = null;
let cityError = null;
let refreshButton = null;
let weatherContainer = null;
let selectedCity = null;
let savedCitiesContainer = null;

function createAppContainer() {
    appContainer = document.getElementById("app");
    return appContainer;
}


function createTile(container) {
    const tile = document.createElement("h1");
    tile.textContent = "Прогноз погоды";
    tile.classList.add("app-tile");
    container.appendChild(tile)
}

function createRefreshButton(container) {
    const button = document.createElement("button");
    button.id = "refresh-btn";
    button.textContent = "Обновить";
    button.disabled = true;
    button.addEventListener("click", () => {

    });
    container.appendChild(button);
    return button;
}

function createWeatherContainer(container) {
    const weatherContainer = document.createElement("div");
    weatherContainer.id = "weather-container";
    container.appendChild(weatherContainer);
    return weatherContainer;
}

function createCityForm(container) {
    const form = document.createElement("form");
    form.classList.add("city-form");
    form.id = "city-form";

    const input = document.createElement("input");
    input.type = "text";
    input.placeholder = "Введите город:";
    input.id = "city-input";
    input.autocomplete = "off";

    const suggestions = document.createElement("ul");
    suggestions.classList.add("suggestions");
    suggestions.id = "suggestions-list";

    const error = document.createElement("div");
    error.classList.add("error-message");
    error.id = "city-error";
    error.style.display = "none";


    form.append(input, suggestions, error);
    container.appendChild(form);

    return { form, input, suggestions, error};
}

function createSavedCitiesContainer(container) {
    const div = document.createElement("div");
    div.id = "saved-cities";
    container.appendChild(div);
    return div;
}


function showError(message) {
    const error = document.getElementById("city-error");
    error.textContent = message;
    error.style.display = "block";
    setTimeout(() => {
        error.style.display = "none";
    }, 5000);
}

function showCityInputError(message) {
    cityError.textContent = message;
    cityError.style.display = "block";
}

function hideCityInputError() {
    cityError.textContent = "";
    cityError.style.display = "none";
}


function clearSuggestions() {
    suggestionsList.innerHTML = "";
}

function showCityForm() {
    const cityForm = document.getElementById("city-form");
    const cityInput = document.getElementById("city-input");

    cityForm.style.display = "block";
    cityInput.focus();
    cityInput.value = "";
    clearSuggestions();
}

function saveState() {
    localStorage.setItem(APP_STATE_KEY, JSON.stringify(currentState));
}

function addCityToState(city) {
    const exists = currentState.cities.some(
        c =>
            (c.lat === city.lat && c.lon === city.lon) ||
            (c.name && city.name && c.name.toLowerCase() === city.name.toLowerCase())
    );

    if (!exists) {
        currentState.cities.push(city);
        saveState();
        renderSavedCities();
    }
}

function renderSavedCities() {
    if (!savedCitiesContainer) return;

    savedCitiesContainer.innerHTML = "";

    currentState.cities.forEach((city, index) => {
        const wrapper = document.createElement("div");
        wrapper.className = "saved-city-item";

        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "saved-city-btn";
        btn.textContent = city.name;

        btn.addEventListener("click", () => {
            currentState.currentLocation = city;
            saveState();
            fetchWeatherByCoords(city.lat, city.lon);
        });

        const removeBtn = document.createElement("button");
        removeBtn.type = "button";
        removeBtn.className = "remove-city-btn";
        removeBtn.textContent = "✕";

        removeBtn.addEventListener("click", (e) => {
            e.stopPropagation();

            currentState.cities.splice(index, 1);
            saveState();
            renderSavedCities();
        });

        wrapper.append(btn, removeBtn);
        savedCitiesContainer.appendChild(wrapper);
    });
}

function loadState() {
    const saved = localStorage.getItem(APP_STATE_KEY);
    if (saved) {
        currentState = JSON.parse(saved);
    }
}

function renderWeather(data) {
    const location = data.location;
    const current = data.current;

    const forecastDays = data.forecast?.forecastday || [];
    if (forecastDays.length === 0) return;

    const today = forecastDays[0].day;

    const todayIconUrl = today.condition.icon.startsWith("//")
        ? "https:" + today.condition.icon
        : today.condition.icon;
    const daysHtml = forecastDays.map((d, index) => {
        const dayIconUrl = d.day.condition.icon.startsWith("//")
            ? "https:" + d.day.condition.icon
            : d.day.condition.icon;

        const dateText = new Date(d.date).toLocaleDateString("ru-RU", {
            day: "2-digit",
            month: "2-digit",
        });

        return `
          <div class="forecast-day ${index === 0 ? "today" : ""}">
            <div class="forecast-date">${dateText}</div>
            <img class="forecast-icon" src="${dayIconUrl}" alt="icon" />
            <div class="forecast-temp">${Math.round(d.day.avgtemp_c)}°C</div>
            <div class="forecast-desc">${d.day.condition.text}</div>
          </div>
        `;
    }).join("");

    weatherContainer.innerHTML = `
      <div class="weather-card">
        <h3 class="forecast-title">Прогноз на 5 дней</h3>
        <div class="forecast-grid">
          ${daysHtml}
        </div>
        <h2>${location.name}, ${location.country}</h2>
        <p class="temp">${Math.round(today.avgtemp_c)}°C</p>
        <p class="desc">${today.condition.text}</p>
        <img src="${todayIconUrl}" alt="Погода" class="weather-icon"/>

        <div class="weather-details">
          <p><strong>Мин:</strong> ${Math.round(today.mintemp_c)}°C</p>
          <p><strong>Макс:</strong> ${Math.round(today.maxtemp_c)}°C</p>
          <p><strong>Ощущается как:</strong> ${Math.round(current.feelslike_c)}°C</p>
          <p><strong>Влажность:</strong> ${current.humidity}%</p>
          <p><strong>Давление:</strong> ${current.pressure_mb} гПа</p>
          <p><strong>Ветер:</strong> ${current.wind_kph} км/ч</p>
        </div>

        <small>Обновлено: ${new Date().toLocaleTimeString("ru-RU")}</small>
      </div>
    `;
}

function fetchWeatherByCoords(lat, lon) {
    const url = `${BASE_URL}?key=${API_KEY}&q=${lat},${lon}&days=5&lang=ru`;

    weatherContainer.innerHTML = "<p>Загружаем Вашу погоду...подождите немного...</p>";
    refreshButton.disabled = true;

    fetch(url)
        .then((response) => {
        if (!response.ok) throw new Error("Ошибка загрузки погоды");
        return response.json();
    })

        .then((data) => {
            saveState();
            renderWeather(data);
            refreshButton.style.display = "inline-block";
            refreshButton.disabled = false;
        })
        .catch(() => {
            showError("Не удалось загрузить погоду.");
            weatherContainer.innerHTML = "<p>Не удалось загрузить данные</p>";
            refreshButton.disabled = false;
            showCityForm();
        })

}

function requestLocation() {
    if (!navigator.geolocation) {
        showError("Браузер не поддерживает геолокацию.");
        showCityForm();
        return;
    }

    weatherContainer.innerHTML = "<p>Определяем местоположение, подождите...</p>";
    refreshButton.disabled = true;

    navigator.geolocation.getCurrentPosition(
        (position) => {
            const { latitude: lat, longitude: lon } = position.coords;

            currentState.currentLocation = {
                name: "Текущее местоположение",
                lat,
                lon,
                source: "geo"
            };
            saveState();

            addCityToState({
                name: "Текущее местоположение",
                lat,
                lon,
                source: "geo"
            });

            fetchWeatherByCoords(lat, lon);
        },
        () => {
            showCityForm();
            weatherContainer.innerHTML =
                "<p>Геолокация выключена. Введите город вручную.</p>";
            refreshButton.disabled = false;
        },
        {
            enableHighAccuracy: false,
            timeout: 8000,
            maximumAge: 0
        }
    );
}

async function searchCity(query) {
    if (!query.trim()) return [];

    try {
        const response = await fetch(
            `https://api.weatherapi.com/v1/search.json?key=${API_KEY}&q=${encodeURIComponent(query)}`
        );
        if (!response.ok) return [];
        return await response.json();
    } catch (error) {
        return [];
    }
}

function setupCityInput() {
    cityInput.addEventListener("input", async (e) => {
        const query = e.target.value.trim();
        selectedCity = null;
        hideCityInputError();
        clearSuggestions();

        if (query.length < 2) return;

        const results = await searchCity(query);
        if (results.length === 0) {
            showCityInputError("Город не найден. Выберите город из списка.");
            return;
        }

        results.slice(0, 5).forEach((city) => {
            const li = document.createElement("li");
            li.className = "suggestions-item";
            li.textContent = `${city.name}, ${city.country}`;
            li.dataset.lat = city.lat;
            li.dataset.lon = city.lon;
            li.addEventListener("click", () => {
                selectedCity = {
                    name: city.name,
                    country: city.country,
                    lat: city.lat,
                    lon: city.lon
                };

                cityInput.value = `${city.name}, ${city.country}`;
                clearSuggestions();
                hideCityInputError();

                currentState.currentLocation = {
                    name: `${city.name}, ${city.country}`,
                    lat: city.lat,
                    lon: city.lon,
                    source: "city"
                };
                addCityToState({
                    name: `${city.name}, ${city.country}`,
                    lat: city.lat,
                    lon: city.lon,
                    source: "city"
                });
                fetchWeatherByCoords(city.lat, city.lon);
            });
            suggestionsList.appendChild(li);
        });
    });

    document.addEventListener("click", e => {
        if (!cityInput.contains(e.target) && !suggestionsList.contains(e.target)) {

        }
    });
}

function init() {
    loadState();
    createAppContainer();
    createTile(appContainer);
    const formElements = createCityForm(appContainer);
    savedCitiesContainer = createSavedCitiesContainer(appContainer);
    weatherContainer = createWeatherContainer(appContainer);

    renderSavedCities();

    cityInput = formElements.input;
    suggestionsList = formElements.suggestions;
    cityError = formElements.error;
    refreshButton = createRefreshButton(appContainer);

    setupCityInput();

    cityInput.addEventListener("blur", () => {
        const text = cityInput.value.trim();
        if (!text) {
            hideCityInputError();
            return;
        }
        if (!selectedCity) {
            showCityInputError("Пожалуйста, выберите город из выпадающего списка.");
        }
    });


    refreshButton.addEventListener("click", () => {
        const loc = currentState.currentLocation;
        if (loc?.lat && loc?.lon) {
            fetchWeatherByCoords(loc.lat, loc.lon);
        } else {
            requestLocation();
        }
    });

    const hasSavedState =
        !!localStorage.getItem(APP_STATE_KEY) &&
        !!currentState.currentLocation?.lat &&
        !!currentState.currentLocation?.lon;

    if (hasSavedState) {
        fetchWeatherByCoords(currentState.currentLocation.lat, currentState.currentLocation.lon);
    } else {
        requestLocation();
    }

}

document.addEventListener("DOMContentLoaded", () => {
    init();
});


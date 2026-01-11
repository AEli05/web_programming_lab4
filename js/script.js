const APP_STATE_KEY = "weatherAppState";
const API_KEY = "4f49a3f5ee2b4355994152929261001"
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
    clearContainer(suggestionsList);
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

    clearContainer(savedCitiesContainer);

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
    clearContainer(weatherContainer);
    const location = data.location;
    const current = data.current;

    const forecastDays = data.forecast.forecastday;
    const card = document.createElement("div")
    card.className = "weather-card";

    const forecastTitle = document.createElement("h3");
    forecastTitle.className = "forecast-title";
    forecastTitle.textContent = "Прогноз на 5 дней";

    const forecastGrid = document.createElement("div");
    forecastGrid.className = "forecast-grid";

    forecastDays.forEach((day, index) => {
        const dayCard = document.createElement("div");
        dayCard.className = "forecast-day";
        if (index === 0) {
            dayCard.classList.add("today");
        }

        const date = document.createElement("div");
        date.className = "forecast-date";
        date.textContent = new Date(day.date).toLocaleDateString("ru-RU", {
            day: "2-digit",
            month: "2-digit",
        });

        const icon = document.createElement("img");
        icon.className = "forecast-icon";
        icon.src = day.day.condition.icon.startsWith("//")
            ? "https:" + day.day.condition.icon
            : day.day.condition.icon;
        icon.alt = "Погода";

        const temp = document.createElement("div");
        temp.className = "forecast-temp";
        temp.textContent = `${Math.round(day.day.avgtemp_c)}°C`;

        const desc = document.createElement("div");
        desc.className = "forecast-desc";
        desc.textContent = day.day.condition.text;

        dayCard.append(date, icon, temp, desc);
        forecastGrid.appendChild(dayCard);
    });

    const cityTitle = document.createElement("h2");
    cityTitle.textContent = `${location.name}, ${location.country}`;

    const tempNow = document.createElement("p");
    tempNow.className = "temp";
    tempNow.textContent = `${Math.round(forecastDays[0].day.avgtemp_c)}°C`;

    const descNow = document.createElement("p");
    descNow.className = "desc";
    descNow.textContent = forecastDays[0].day.condition.text;

    const mainIcon = document.createElement("img");
    mainIcon.className = "weather-icon";
    mainIcon.src = forecastDays[0].day.condition.icon.startsWith("//")
        ? "https:" + forecastDays[0].day.condition.icon
        : forecastDays[0].day.condition.icon;
    mainIcon.alt = "Погода";

    const details = document.createElement("div");
    details.className = "weather-details";

    function createDetail(label, value) {
        const p = document.createElement("p");
        const strong = document.createElement("strong");
        strong.textContent = label;
        p.append(strong, `${value}`);
        return p;
    }

    details.append(
        createDetail("Мин:", `${Math.round(forecastDays[0].day.mintemp_c)}°C`),
        createDetail("Макс:", `${Math.round(forecastDays[0].day.maxtemp_c)}°C`),
        createDetail("Ощущается как:", `${Math.round(current.feelslike_c)}°C`),
        createDetail("Влажность:", `${current.humidity}%`),
        createDetail("Давление:", `${current.pressure_mb} гПа`),
        createDetail("Ветер:", `${current.wind_kph} км/ч`)
    );

    const updated = document.createElement("small");
    updated.textContent = `Обновлено: ${new Date().toLocaleTimeString("ru-RU")}`;

    card.append(
        forecastTitle,
        forecastGrid,
        cityTitle,
        tempNow,
        descNow,
        mainIcon,
        details,
        updated
    );

    weatherContainer.appendChild(card);
}

function clearContainer(container) {
    while (container.firstChild) {
        container.removeChild(container.firstChild);
    }
}

function showMessage(container, message) {
    clearContainer(container);
    const p = document.createElement("p");
    p.textContent = message;
    container.appendChild(p);
}

function fetchWeatherByCoords(lat, lon) {
    const url = `${BASE_URL}?key=${API_KEY}&q=${lat},${lon}&days=5&lang=ru`;

    showMessage(weatherContainer, "Загружаем Вашу погоду...");
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
            showMessage(weatherContainer, "Не удалось загрузить данные");
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

    showMessage(weatherContainer, "Определяем местоположение, подождите...");
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
            showMessage(
                weatherContainer,
                "Геолокация выключена. Введите город вручную."
            );
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

    cityInput = formElements.input;
    suggestionsList = formElements.suggestions;
    cityError = formElements.error;

    refreshButton = createRefreshButton(appContainer);

    renderSavedCities();
    setupCityInput();

    formElements.form.addEventListener("submit", (e) => {
        e.preventDefault();

        const text = cityInput.value.trim();

        if (!text) {
            showCityInputError("Введите название города.");
            return;
        }

        if (!selectedCity) {
            showCityInputError("Выберите город из выпадающего списка.");

        }

    });

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

    document.addEventListener("click", (e) => {
        if (!cityInput.contains(e.target) && !suggestionsList.contains(e.target)) {
            clearSuggestions();
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


    if (currentState.currentLocation?.lat && currentState.currentLocation?.lon) {
        fetchWeatherByCoords(currentState.currentLocation.lat, currentState.currentLocation.lon);
    } else {
        requestLocation();
    }
}

document.addEventListener("DOMContentLoaded", () => {
    init();
});


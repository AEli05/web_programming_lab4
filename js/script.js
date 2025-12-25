console.log("Проверочка");

const APP_STATE_KEY = "weatherAppState";
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

function createAppContainer() {
    appContainer = document.createElement("div");
    appContainer.id = "app";
    document.body.appendChild(appContainer);
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
        console.log("проверка 2.0");
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
    form.id = "city_form";
    form.style.display = "none";

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

    return {form, input, suggestions, error};

}

function showError(message) {
    const error = document.getElementById("city-error");
    error.textContent = message;
    error.style.display = "block";
    setTimeout(() => {
        error.style.display = "none";
    }, 5000);
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

function loadState() {
    const saved = localStorage.getItem(APP_STATE_KEY);
    if (saved) {
        currentState = JSON.parse(saved);
    }
}

function requestLocation() {
    if (!navigator.geolocation) {
        showError("Возникли небольшие проблемы с определением вашей геолокации :(");
        showCityForm();
    }

    weatherContainer.innerHTML = "<p>Определяем местоположение, подождите...</p>";

    navigator.geolocation.getCurrentPosition((position) => {
        const { latitude: lat, longitude: lon } = position.coords;
        currentState.currentLocation = { name: "Текущее местоположение", lat, lon };
        saveState();
        fetchWeatherByCoords(lat, lon);
    },
    (error) => {
        showCityForm();
        weatherContainer.innerHTML = <p>Не получилось корректно определить ваше местоположение</p>;
    }
    );
}



async function searchCity(query) {
    if (!query.trim()) return [];

    try {
        const response = await fetch(
            `http://api.weatherapi.com/v1/searchjson?key=11bfaffb59904ac8ba3205312252512&q=${encodeURIComponent(query)}`
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
        clearSuggestions();

        if (query.length < 2) return;

        const results = await searchCity(query);
        if (results.length === 0) {
            const li = document.createElement("li");
            li.className = "suggestions-item empty";
            li.textContent = "Город не найден";
            suggestionsList.appendChild(li);
            return;
        }

        results.slice(0, 5).forEach((city) => {
            const li = document.createElement("li");
            li.className = "suggestions-item";
            li.textContent = "$(city.name), $(city.country)";
            li.dataset.lat = city.lat;
            li.dataset.lon = city.lon;
            li.addEventListener("click", () => {
                fetchWeatherByCoords(city.lat, city.lon);
                hideCityForm();
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
    createAppContainer();
    createTile(appContainer);
    weatherContainer = createWeatherContainer(appContainer);
    const formElements = createCityForm(appContainer);

    cityInput = formElements.input;
    suggestionsList = formElements.suggestions;
    cityError = formElements.error;
    refreshButton = createRefreshButton(appContainer);

    formElements.form.display = "none";

    requestLocation()
}


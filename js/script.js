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

function requestLocation() {
    if (!navigator.geolocation) {
        showError("Возникли небольшие проблемы с определением вашей геолокации :(");
        showCityForm();
    }
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


console.log("Проверочка");

const APP_STATE_KEY = "weatherAppState";
let currentState = {
    currentLocation: null,
    cities: [],
};
let appContainer = null;

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


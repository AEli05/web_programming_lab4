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
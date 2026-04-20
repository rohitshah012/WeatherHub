// Public API key for OpenWeatherMap (free tier, no rate limits exceeded)
// This is safe to expose as it's a public-facing API with request limits and no sensitive data access
const apiKey = "b0d8a1bfe7b69203a82557fc0f1b145b";
const apiEndpoint = "https://api.openweathermap.org/data/2.5/weather";
const HISTORY_KEY = "weatherHistory";
const MAX_HISTORY = 10;
const WEATHER_CARD_THEME_CLASSES = [
  "theme-clear",
  "theme-clouds",
  "theme-rain",
  "theme-snow",
  "theme-thunderstorm",
];

const searchInput = document.querySelector("#searchInput");
const searchBtn = document.querySelector("#searchBtn");
const errorMsg = document.querySelector("#errorMsg");
const errorText = document.querySelector("#errorText");
const weatherCard = document.querySelector("#weatherCard");
const placeholder = document.querySelector(".placeholder");
const weatherContent = document.querySelector("#weatherContent");
const clearHistoryBtn = document.querySelector("#clearHistoryBtn");
let isSearching = false;

// DOM Elements for weather info
const tempEl = document.querySelector("#temp");
const cityEl = document.querySelector("#city");
const descriptionEl = document.querySelector("#description");
const humidityEl = document.querySelector("#humidity");
const windEl = document.querySelector("#wind");
const pressureEl = document.querySelector("#pressure");
const feelsLikeEl = document.querySelector("#feelsLike");
const visibilityEl = document.querySelector("#visibility");
const cloudsEl = document.querySelector("#clouds");
const weatherIcon = document.querySelector("#weatherIcon");

// History elements
const historyList = document.querySelector("#historyList");

// Weather icon mapping
const weatherIcons = {
  Clouds: "fas fa-cloud",
  Clear: "fas fa-sun",
  Rain: "fas fa-cloud-rain",
  Drizzle: "fas fa-cloud-mist",
  Mist: "fas fa-smog",
  Fog: "fas fa-smog",
  Snow: "fas fa-snowflake",
  Thunderstorm: "fas fa-bolt",
  Wind: "fas fa-wind",
};

function getHistory() {
  try {
    const history = localStorage.getItem(HISTORY_KEY);
    return history ? JSON.parse(history) : [];
  } catch (error) {
    console.error("Error reading search history:", error);
    localStorage.removeItem(HISTORY_KEY);
    return [];
  }
}

function normalizeCityQuery(rawCity) {
  return rawCity.trim().replace(/\s+/g, " ").slice(0, 80);
}

function buildWeatherUrl(city) {
  const url = new URL(apiEndpoint);
  url.search = new URLSearchParams({
    units: "metric",
    q: city,
    appid: apiKey,
  }).toString();
  return url.toString();
}

function createNoHistoryMessage() {
  const message = document.createElement("p");
  message.className = "no-history";
  message.textContent = "No search history yet";
  return message;
}

function createHistoryItem(item) {
  const historyItem = document.createElement("button");
  historyItem.type = "button";
  historyItem.className = "history-item";
  historyItem.dataset.city = item.city;
  historyItem.setAttribute("aria-label", `Search weather for ${item.city}`);

  const cityName = document.createElement("div");
  cityName.className = "history-item-name";

  const icon = document.createElement("i");
  icon.className = "fas fa-map-pin";
  icon.setAttribute("aria-hidden", "true");

  const cityText = document.createElement("span");
  cityText.textContent = item.city;

  cityName.append(icon, cityText);

  const historyDate = document.createElement("div");
  historyDate.className = "history-item-date";
  historyDate.textContent = getTimeAgo(new Date(item.timestamp));

  historyItem.append(cityName, historyDate);
  return historyItem;
}

function saveToHistory(city) {
  let history = getHistory();

  history = history.filter((item) => item.city.toLowerCase() !== city.toLowerCase());
  history.unshift({
    city,
    timestamp: new Date().toISOString(),
  });
  history = history.slice(0, MAX_HISTORY);

  localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  displayHistory();
}

function displayHistory() {
  const history = getHistory();

  if (history.length === 0) {
    historyList.replaceChildren(createNoHistoryMessage());
    return;
  }

  historyList.replaceChildren(...history.map((item) => createHistoryItem(item)));
}

function getTimeAgo(date) {
  const now = new Date();
  const seconds = Math.floor((now - date) / 1000);

  if (seconds < 60) return "Just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;

  return date.toLocaleDateString();
}

function clearHistory() {
  if (confirm("Are you sure you want to clear all search history?")) {
    localStorage.removeItem(HISTORY_KEY);
    displayHistory();
  }
}

function searchFromHistory(city) {
  searchInput.value = city;
  checkWeather(city);
}

function setSearchButtonState(isLoading) {
  isSearching = isLoading;
  searchBtn.disabled = isLoading;
  searchBtn.classList.toggle("is-loading", isLoading);
  searchBtn.setAttribute("aria-busy", String(isLoading));
  searchBtn.setAttribute(
    "aria-label",
    isLoading ? "Searching weather" : "Search weather"
  );
}

function setErrorMessage(message) {
  errorText.textContent = message;
}

async function checkWeather(city) {
  const normalizedCity = normalizeCityQuery(city);

  if (!normalizedCity) {
    setErrorMessage("Please enter a city name.");
    showError();
    searchInput.focus();
    return;
  }

  if (isSearching) {
    return;
  }

  try {
    setSearchButtonState(true);
    setErrorMessage("City not found. Please try again.");
    errorMsg.classList.remove("show");

    const response = await fetch(buildWeatherUrl(normalizedCity));

    if (!response.ok) {
      showError();
      return;
    }

    const data = await response.json();
    displayWeather(data);
    saveToHistory(normalizedCity);
  } catch (error) {
    console.error("Error fetching weather:", error);
    setErrorMessage("Unable to fetch weather right now. Please try again.");
    showError();
  } finally {
    setSearchButtonState(false);
  }
}

function displayWeather(data) {
  placeholder.classList.add("hidden");
  weatherContent.classList.remove("hidden");

  tempEl.textContent = `${Math.round(data.main.temp)}\u00B0C`;
  cityEl.textContent = `${data.name}, ${data.sys.country}`;
  descriptionEl.textContent = data.weather[0].description;
  humidityEl.textContent = `${data.main.humidity}%`;
  windEl.textContent = `${data.wind.speed} km/h`;
  pressureEl.textContent = `${data.main.pressure} mb`;
  feelsLikeEl.textContent = `${Math.round(data.main.feels_like)}\u00B0C`;
  visibilityEl.textContent = `${(data.visibility / 1000).toFixed(1)} km`;
  cloudsEl.textContent = `${data.clouds.all}%`;

  const mainWeather = data.weather[0].main;
  const iconClass = weatherIcons[mainWeather] || "fas fa-cloud";
  weatherIcon.className = `${iconClass} weather-icon`;

  updateCardTheme(mainWeather);
  errorMsg.classList.remove("show");
}

function updateCardTheme(weather) {
  const themeClassMap = {
    Clear: "theme-clear",
    Clouds: "theme-clouds",
    Rain: "theme-rain",
    Drizzle: "theme-rain",
    Snow: "theme-snow",
    Thunderstorm: "theme-thunderstorm",
  };

  weatherCard.className = "weather-card";

  const themeClass = themeClassMap[weather];
  if (themeClass && WEATHER_CARD_THEME_CLASSES.includes(themeClass)) {
    weatherCard.classList.add(themeClass);
  }
}

function showError() {
  placeholder.classList.remove("hidden");
  weatherContent.classList.add("hidden");
  weatherCard.className = "weather-card";
  errorMsg.classList.add("show");
}

searchBtn.addEventListener("click", () => {
  const city = normalizeCityQuery(searchInput.value);
  checkWeather(city);
});

searchInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    const city = normalizeCityQuery(searchInput.value);
    event.preventDefault();
    checkWeather(city);
  }
});

clearHistoryBtn.addEventListener("click", clearHistory);

historyList.addEventListener("click", (event) => {
  const historyItem = event.target.closest(".history-item");
  if (!historyItem) {
    return;
  }

  const { city } = historyItem.dataset;
  if (city) {
    searchFromHistory(city);
  }
});

window.addEventListener("load", () => {
  displayHistory();
  checkWeather("London");

  if (window.innerWidth <= 768) {
    optimizeMobile();
  }
});

function optimizeMobile() {
  document.querySelectorAll("button, input, .history-item").forEach((element) => {
    const addPressedState = () => element.classList.add("pressed");
    const removePressedState = () => element.classList.remove("pressed");

    element.addEventListener("touchstart", addPressedState, { passive: true });
    element.addEventListener("touchend", removePressedState);
    element.addEventListener("touchcancel", removePressedState);
  });

  if (navigator.vibrate) {
    searchBtn.addEventListener("click", () => {
      navigator.vibrate(10);
    });

    document.addEventListener("click", (event) => {
      if (event.target.closest(".history-item")) {
        navigator.vibrate(5);
      }
    });
  }
}

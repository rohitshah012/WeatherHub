const apiKey = "b0d8a1bfe7b69203a82557fc0f1b145b";
const apiUrl = "https://api.openweathermap.org/data/2.5/weather?units=metric&q=";
const HISTORY_KEY = "weatherHistory";
const MAX_HISTORY = 10;

const searchInput = document.querySelector("#searchInput");
const searchBtn = document.querySelector("#searchBtn");
const errorMsg = document.querySelector("#errorMsg");
const weatherCard = document.querySelector("#weatherCard");
const placeholder = document.querySelector(".placeholder");
const weatherContent = document.querySelector("#weatherContent");

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

// Get history from localStorage
function getHistory() {
  const history = localStorage.getItem(HISTORY_KEY);
  return history ? JSON.parse(history) : [];
}

// Save to history
function saveToHistory(city) {
  let history = getHistory();
  
  // Remove if already exists (to avoid duplicates)
  history = history.filter(item => item.city.toLowerCase() !== city.toLowerCase());
  
  // Add new entry at the beginning
  history.unshift({
    city: city,
    timestamp: new Date().toISOString()
  });

  // Keep only the last MAX_HISTORY entries
  history = history.slice(0, MAX_HISTORY);

  localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  displayHistory();
}

// Display history
function displayHistory() {
  const history = getHistory();

  if (history.length === 0) {
    historyList.innerHTML = '<p class="no-history">No search history yet</p>';
    return;
  }

  historyList.innerHTML = history
    .map((item, index) => {
      const date = new Date(item.timestamp);
      const timeAgo = getTimeAgo(date);
      return `
        <div class="history-item" onclick="searchFromHistory('${item.city}')">
          <div class="history-item-name">
            <i class="fas fa-map-pin"></i>
            ${item.city}
          </div>
          <div class="history-item-date">${timeAgo}</div>
        </div>
      `;
    })
    .join("");
}

// Get time ago string
function getTimeAgo(date) {
  const now = new Date();
  const seconds = Math.floor((now - date) / 1000);
  
  if (seconds < 60) return "Just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  
  return date.toLocaleDateString();
}

// Clear history
function clearHistory() {
  if (confirm("Are you sure you want to clear all search history?")) {
    localStorage.removeItem(HISTORY_KEY);
    displayHistory();
  }
}

// Search from history
function searchFromHistory(city) {
  searchInput.value = city;
  checkWeather(city);
}

async function checkWeather(city) {
  try {
    // Hide error message initially
    errorMsg.classList.remove("show");

    const response = await fetch(apiUrl + city + `&appid=${apiKey}`);

    if (response.status === 404) {
      showError();
      return;
    }

    if (!response.ok) {
      showError();
      return;
    }

    const data = await response.json();
    displayWeather(data);
    
    // Save to history
    saveToHistory(city);
  } catch (error) {
    console.error("Error fetching weather:", error);
    showError();
  }
}

function displayWeather(data) {
  // Hide placeholder and show content
  placeholder.classList.add("hidden");
  weatherContent.classList.remove("hidden");

  // Update weather info
  tempEl.innerHTML = Math.round(data.main.temp) + "°C";
  cityEl.innerHTML = data.name + ", " + data.sys.country;
  descriptionEl.innerHTML = data.weather[0].description;
  humidityEl.innerHTML = data.main.humidity + "%";
  windEl.innerHTML = data.wind.speed + " km/h";
  pressureEl.innerHTML = data.main.pressure + " mb";
  feelsLikeEl.innerHTML = Math.round(data.main.feels_like) + "°C";
  visibilityEl.innerHTML = (data.visibility / 1000).toFixed(1) + " km";
  cloudsEl.innerHTML = data.clouds.all + "%";

  // Update weather icon
  const mainWeather = data.weather[0].main;
  const iconClass = weatherIcons[mainWeather] || "fas fa-cloud";
  weatherIcon.className = iconClass + " weather-icon";

  // Update card color based on weather
  updateCardTheme(mainWeather);

  // Hide error message
  errorMsg.classList.remove("show");
}

function updateCardTheme(weather) {
  const weatherCard = document.querySelector("#weatherCard");
  const icon = document.querySelector("#weatherIcon");

  // Reset icon color
  icon.style.color = "#667eea";

  // Remove all theme classes
  weatherCard.className = "weather-card";

  // Add theme based on weather
  switch (weather) {
    case "Clear":
      weatherCard.style.background = "linear-gradient(135deg, #fff5e6 0%, #ffe8cc 100%)";
      icon.style.color = "#f59e0b";
      break;
    case "Clouds":
      weatherCard.style.background = "linear-gradient(135deg, #e0e7ff 0%, #d1d5f0 100%)";
      break;
    case "Rain":
    case "Drizzle":
      weatherCard.style.background = "linear-gradient(135deg, #cfe9f3 0%, #a8d8ea 100%)";
      icon.style.color = "#06b6d4";
      break;
    case "Snow":
      weatherCard.style.background = "linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)";
      icon.style.color = "#0ea5e9";
      break;
    case "Thunderstorm":
      weatherCard.style.background = "linear-gradient(135deg, #1e293b 0%, #334155 100%)";
      icon.style.color = "#fbbf24";
      break;
    default:
      weatherCard.style.background = "white";
  }
}

function showError() {
  placeholder.classList.remove("hidden");
  weatherContent.classList.add("hidden");
  errorMsg.classList.add("show");
}

// Event listeners
searchBtn.addEventListener("click", () => {
  const city = searchInput.value.trim();
  if (city) {
    checkWeather(city);
  }
});

// Search on Enter key
searchInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    const city = searchInput.value.trim();
    if (city) {
      checkWeather(city);
    }
  }
});

// Load default city on page load
window.addEventListener("load", () => {
  displayHistory();
  checkWeather("London");
  
  // Add mobile-specific optimizations
  if (window.innerWidth <= 768) {
    optimizeMobile();
  }
});

// Optimize for mobile
function optimizeMobile() {
  // Prevent double-tap zoom on buttons
  document.querySelectorAll("button, input, .history-item").forEach(el => {
    el.addEventListener("touchstart", function() {
      this.style.opacity = "0.8";
    });
    el.addEventListener("touchend", function() {
      this.style.opacity = "1";
    });
  });

  // Haptic feedback on touch (iOS)
  if (navigator.vibrate) {
    searchBtn.addEventListener("click", () => {
      navigator.vibrate(10);
    });
    document.addEventListener("click", (e) => {
      if (e.target.closest(".history-item")) {
        navigator.vibrate(5);
      }
    });
  }
}



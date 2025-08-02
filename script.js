const apiKey = "199fe0367becd63a8bc5f890c8f9247e"; 

async function getWeather() {
  const city = document.getElementById("city").value.trim();
  if (!city) {
    document.getElementById("weather").innerHTML = `<p style="color:red;">Please enter a city name.</p>`;
    return;
  }

  const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;
  const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric`;

  try {
    const [weatherRes, forecastRes] = await Promise.all([
      fetch(url),
      fetch(forecastUrl)
    ]);

    if (!weatherRes.ok || !forecastRes.ok) throw new Error("City not found");

    const weatherData = await weatherRes.json();
    const forecastData = await forecastRes.json();

    const { name, sys, main, weather, wind, timezone, coord } = weatherData;

    const localTime = new Date(Date.now() + timezone * 1000).toUTCString().slice(17, 22);

    const sunrise = new Date((sys.sunrise + timezone) * 1000).toUTCString().slice(17, 22);
    const sunset = new Date((sys.sunset + timezone) * 1000).toUTCString().slice(17, 22);

    let forecastHTML = "<h3>3-Day Forecast</h3>";
    const daysShown = new Set();
    for (const item of forecastData.list) {
      const date = new Date(item.dt * 1000).toDateString();
      if (!daysShown.has(date) && daysShown.size < 3) {
        forecastHTML += `
          <p><strong>${date}</strong>: ${item.weather[0].main}, ${item.main.temp}°C</p>
        `;
        daysShown.add(date);
      }
    }

    const html = `
      <h2>${name}, ${sys.country}</h2>
      <p><strong>${weather[0].main}</strong> - ${weather[0].description}</p>
      <p>🌡️ Temp: ${main.temp}°C</p>
      <p>💧 Humidity: ${main.humidity}%</p>
      <p>🌬️ Wind: ${wind.speed} m/s, Dir: ${wind.deg}°</p>
      <p>🕒 Local Time: ${localTime}</p>
      <p>🌅 Sunrise: ${sunrise} | 🌇 Sunset: ${sunset}</p>
      <img src="https://openweathermap.org/img/wn/${weather[0].icon}@2x.png" />
      ${forecastHTML}
    `;

    document.getElementById("weather").innerHTML = html;

    // Show map
    if (window.myMap) {
      myMap.setView([coord.lat, coord.lon], 10);
      myMarker.setLatLng([coord.lat, coord.lon]);
    } else {
      window.myMap = L.map("map").setView([coord.lat, coord.lon], 10);
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "&copy; OpenStreetMap contributors"
      }).addTo(myMap);
      window.myMarker = L.marker([coord.lat, coord.lon]).addTo(myMap);
    }

  } catch (err) {
    document.getElementById("weather").innerHTML = `<p style="color:red;">${err.message}</p>`;
  }
}

// Theme toggle
document.getElementById("themeToggle").addEventListener("click", () => {
  document.body.classList.toggle("dark");
  const isDark = document.body.classList.contains("dark");
  document.getElementById("themeToggle").textContent = isDark ? "☀️" : "🌙";
});

document.getElementById("city").addEventListener("keydown", function (e) {
  if (e.key === "Enter") {
    getWeather();
  }
});

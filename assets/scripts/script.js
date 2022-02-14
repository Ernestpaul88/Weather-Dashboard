$(function () {
  var searchHistory;

  var apiKey = "3d2a2db67527f59a92cce20e79cbc56d";
  var todaysDate = moment().format("MM/DD/YYYY");

  var bold = $("<b>");
  var citySpan = $("<span>").attr("id", "city-span");
  var dateSpan = $("<span>").text("(" + todaysDate + ")");
  var weatherIcon = $("<img>").addClass("img-fluid");
  bold.append(citySpan, dateSpan);

  $("#city-header").append(bold, weatherIcon);

  $("#searchButton").on("click", function () {
    var city = $("#searchForCityInput").val().trim();
    if (city) {
      getTodaysWeather(city);
      get5DayForecasts(city);
      searchHistory.unshift({ city });
      $("#searchForCityInput").val("");
    } else {
      alert("Please enter a City");
    }

    saveSearchHistory();
    displaySearchHistory(city);
  });

  //API function to requests todays weather
  // https://openweathermap.org/current#name
  function getTodaysWeather(city) {
    var apiURL = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=imperial&appid=${apiKey}`;

    fetch(apiURL)
      .then(function (response) {
        return response.json();
      })
      .then(function (data) {
        displayTodaysWeather(data, city);
      });
  }

  //Display todays weather in the main container
  function displayTodaysWeather(weather, city) {
    //clear content from previous searches
    $("#city-span").text(city + " ");
    $("#temp span").text("");
    $("#wind span").text("");
    $("#humidity span").text("");
    $("#uv-index span").text("");

    //Add the weather Icon
    weatherIcon.attr(
      "src",
      `https://openweathermap.org/img/wn/${weather.weather[0].icon}@2x.png`
    );

    //add weather conditions for city
    $("#temp span").text(weather.main.temp + " °F");
    $("#wind span").text(weather.wind.speed + " MPH");
    $("#humidity span").text(weather.main.humidity + " %");

    //get UV Index
    var lat = weather.coord.lat;
    var lon = weather.coord.lon;
    getUvIndex(lat, lon);
  }

  //Api function for retrieving the UV index
  // https://openweathermap.org/api/uvi
  function getUvIndex(lat, lon) {
    var apiURL = `https://api.openweathermap.org/data/2.5/uvi?appid=${apiKey}&lat=${lat}&lon=${lon}`;
    fetch(apiURL).then(function (response) {
      response.json().then(function (data) {
        displayUvIndex(data.value);
      });
    });
  }

  //display Uv Index
  function displayUvIndex(uVIndex) {
    //remove all classes from uv index
    $("#uv-index span").removeClass();

    //determine uv Index conditions
    if (uVIndex <= 2) {
      $("#uv-index span").addClass("uv text-white rounded uv-favorable");
    } else if (uVIndex > 2 && uVIndex <= 5) {
      $("#uv-index span").addClass("uv text-dark rounded uv-moderate");
    } else if (uVIndex > 5 && uVIndex <= 7) {
      $("#uv-index span").addClass("uv text-white rounded uv-severe");
    } else if (uVIndex > 7) {
      $("#uv-index span").addClass("uv text-white rounded uv-xsevere");
    }

    $("#uv-index span").text(uVIndex);
  }

  //Api function for getting the 5 day forecasts
  // https://openweathermap.org/forecast16#name16
  function get5DayForecasts(city) {
    var apiURL = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=imperial&appid=${apiKey}`;

    fetch(apiURL).then(function (response) {
      response.json().then(function (data) {
        forecastsHandler(data);
      });
    });
  }

  // Loops through weather lists
  function forecastsHandler(weather) {
    //Empty forecasts container
    $("#forecasts").empty();

    var forecast = weather.list;
    for (var i = 5; i < forecast.length; i = i + 8) {
      displayForecasts(forecast[i]);
    }
  }

  //display forecasts
  function displayForecasts(forecast) {
    var divColumn = $("<div>").addClass("col-custom");
    var divCard = $("<div>").addClass("card text-white");
    var divCardBody = $("<div>").addClass("card-body");
    // set date for card title
    var date = moment.unix(forecast.dt).format("MM/DD/YYYY");
    var cardTitle = $("<p>").addClass("card-title h5 fw-bold").text(date);

    // set src attribute here
    var weatherIcon = $("<img>")
      .addClass("img-fluid card-body text-center")
      .attr(
        "src",
        `https://openweathermap.org/img/wn/${forecast.weather[0].icon}@2x.png`
      );

    //add temp
    var temp = $("<p>")
      .addClass("card-text mb-4 fw-bold")
      .text("Temp: " + forecast.main.temp + " °F");

    //add wind
    var wind = $("<p>")
      .addClass("card-text mb-4 fw-bold")
      .text("Wind: " + forecast.wind.speed + " MPH");

    // add humidity
    var humidity = $("<p>")
      .addClass("card-text mb-4 fw-bold")
      .text("Humidity: " + forecast.main.humidity + " %");

    divCardBody.append(cardTitle, weatherIcon, temp, wind, humidity);
    divCard.append(divCardBody);
    divColumn.append(divCard);

    $("#forecasts").append(divColumn);
  }

  function saveSearchHistory() {
    localStorage.setItem("searchHistory", JSON.stringify(searchHistory));
  }

  function displaySearchHistory(city) {
    var listItem = $("<li>").addClass("searches mb-3");
    var div = $("<div>").addClass("d-grid gap-2");
    var button = $("<button>")
      .addClass("btn btn-secondary")
      .attr("type", "button")
      .attr("name", city)
      .text(city);

    div.append(button);
    listItem.append(div);

    $("#list-SearchHistory").prepend(listItem);
  }

  $("#list-SearchHistory").on("click", "button", function () {
    // get button name value attribute
    var city = $(this).attr("name");

    //display weather forecast
    if (city) {
      getTodaysWeather(city);
      get5DayForecasts(city);
    }
  });

  function loadCities() {
    searchHistory = JSON.parse(localStorage.getItem("searchHistory"));

    // if nothing in localStorage, create a new object
    if (!searchHistory) {
      searchHistory = [];
    }

    // loop over object properties
    $.each(searchHistory, function (index, city) {
      displaySearchHistory(city.city);
    });
  }

  // load cities
  loadCities();
});

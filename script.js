$(document).ready(function() {

  //EventListener for the search button
  $("#search-button").on("click", function() {

    //pulls value of from the text box
    var searchValue = $("#search-value").val();

    // clear input box
    $("#search-value").val("");

    //makings a querry for the weather.
    searchWeather(searchValue);
  });

  //Searches the weather for the city clicked on in the history section.
  $(".history").on("click", "li", function() {
    searchWeather($(this).text());
  });

  //adds a new list item and appends it to the history list.
  function makeRow(text) {
    var li = $("<li>").addClass("list-group-item list-group-item-action").text(text);
    $(".history").append(li);
  }

  //main search function
  function searchWeather(searchValue) {
    //querries the api for the weather from a search value
    $.ajax({
      type: "GET",
      url: "http://api.openweathermap.org/data/2.5/weather?q=" + searchValue + "&appid=83446f1563efe3fbbfb5ad40dfcf9bfd&units=imperial",
      dataType: "json",

      //if the querry succeeds in finding weather data for your city.
      success: function(data) {
        // create history link for this search
        if (history.indexOf(searchValue) === -1) {
          history.push(searchValue);
          window.localStorage.setItem("history", JSON.stringify(history));
    
          makeRow(searchValue);
        }
        
        // clear any old content
        $("#today").empty();

        // create html content for current weather
        var title = $("<h3>").addClass("card-title").text(data.name + " (" + new Date().toLocaleDateString() + ")");
        var card = $("<div>").addClass("card");
        var wind = $("<p>").addClass("card-text").text("Wind Speed: " + data.wind.speed + " MPH");
        var humid = $("<p>").addClass("card-text").text("Humidity: " + data.main.humidity + "%");
        var temp = $("<p>").addClass("card-text").text("Temperature: " + data.main.temp + " °F");
        var cardBody = $("<div>").addClass("card-body");
        var img = $("<img>").attr("src", "http://openweathermap.org/img/w/" + data.weather[0].icon + ".png");

        // merge and add to page
        title.append(img);
        cardBody.append(title, temp, humid, wind);
        card.append(cardBody);
        $("#today").append(card);

        // call follow-up api endpoints
        getHourly(data.coord.lat, data.coord.lon);
        getForecast(searchValue);
        getUVIndex(data.coord.lat, data.coord.lon);
      }
    });
  }
  
  //Get's the extended forcast for the city. 
  function getForecast(searchValue) {
    $.ajax({
      type: "GET",
      url: "http://api.openweathermap.org/data/2.5/forecast?q=" + searchValue + "&appid=83446f1563efe3fbbfb5ad40dfcf9bfd&units=imperial",
      dataType: "json",

      //if the api succesfully grabs the forcast for your city.
      success: function(data) {
        // overwrite any existing content with title and empty row
        $("#forecast").html("<h4 class=\"mt-3\">5-Day Forecast:</h4>").append("<div class=\"row\">");

        // loop over all forecasts (by 3-hour increments)
        for (var i = 0; i < data.list.length; i++) {
          // only look at forecasts around 3:00pm
          if (data.list[i].dt_txt.indexOf("15:00:00") !== -1) {
            // create html elements for a bootstrap card
            var col = $("<div>").addClass("col-md-2");
            var card = $("<div>").addClass("card bg-primary text-white");
            var body = $("<div>").addClass("card-body p-2");

            var title = $("<h5>").addClass("card-title").text(new Date(data.list[i].dt_txt).toLocaleDateString());

            var img = $("<img>").attr("src", "http://openweathermap.org/img/w/" + data.list[i].weather[0].icon + ".png");

            var p1 = $("<p>").addClass("card-text").text("Temp: " + data.list[i].main.temp_max + " °F");
            var p2 = $("<p>").addClass("card-text").text("Humidity: " + data.list[i].main.humidity + "%");

            // merge together and put on page
            col.append(card.append(body.append(title, img, p1, p2)));
            $("#forecast .row").append(col);
          }
        }
      }
    });
  }
  //get's the UV index for the city
  function getUVIndex(lat, lon) {
    $.ajax({
      type: "GET",
      url: "http://api.openweathermap.org/data/2.5/uvi?appid=83446f1563efe3fbbfb5ad40dfcf9bfd&lat=" + lat + "&lon=" + lon,
      dataType: "json",
      success: function(data) {
        var uv = $("<p>").text("UV Index: ");
        var btn = $("<span>").addClass("btn btn-sm").text(data.value);
        
        // change color depending on uv value
        if (data.value < 3) {
          btn.addClass("btn-success");
        }
        else if (data.value < 7) {
          btn.addClass("btn-warning");
        }
        else {
          btn.addClass("btn-danger");
        }
        
        $("#today .card-body").append(uv.append(btn));
      }
    });
  }

  //The Group's plan. Add an hourly forecast
  function getHourly(lat, lon){
    $.ajax({
      type: "GET",
      url: "https://api.openweathermap.org/data/2.5/onecall?lat="+lat+"&lon="+lon+"&appid=83446f1563efe3fbbfb5ad40dfcf9bfd&units=imperial",
      dataType: "json",
      success: function(data){
        console.log(data);

        var hour = moment().startOf("hour");
        console.log(hour)

        $("#hourly").html("<h4 class=\"mt-3\">Hourly Forecast:</h4>").append("<div class=\"row\">");
        for(var i = 1; i <= 5; i++){
          console.log(data.hourly[i])

          


          //create card body.
          var col = $("<div>").addClass("col-md-2");
          var card = $("<div>").addClass("card bg-primary text-white");
          var body = $("<div>").addClass("card-body p-2");

          //print time
          console.log(hour.add(1, "h"));
          //var time =$("<div>").text("In "+ i + " hour(s)");
          var time =$("<div>").text(hour.format("h a"));
          //grab icon
          var weather = $("<img>").attr("src", "http://openweathermap.org/img/w/" + data.hourly[i].weather[0].icon + ".png");
          //grab tempreture
          var temp = $("<div>").text("Temp: " + data.hourly[i].temp +  " °F");
          //append all variables onto a card
          col.append(card.append(body.append(time, weather, temp)));
          //append card to view
          $("#hourly .row").append(col);
        }
        //display the hourly forcast for the next 5 hours. 



      }
      



    });
  }


  // get current history, if any
  var history = JSON.parse(window.localStorage.getItem("history")) || [];

  // displays the last item in history
  if (history.length > 0) {
    searchWeather(history[history.length-1]);
  }
  // creates a button for each item in history
  for (var i = 0; i < history.length; i++) {
    makeRow(history[i]);
  }
});

var tomtomPre = "https://api.tomtom.com/search/2/geocode/"
var tomtomPost = ".json?limit=1&view=Unified&key=something";
var owmPre = "http://api.openweathermap.org/data/2.5/forecast?"
var openWeatherMapKey = "";
var picURL = " http://openweathermap.org/img/wn/";
var localURL = "http://localhost:8080/cse383_php/final.php?method=";

// https://api.tomtom.com/search/2/geocode/benton+hall+oxford+ohio.json?limit=1&view=Unified&key=WAXo72KLN8tmKy4TMy03VbmqJvMTwaW9
// http://api.openweathermap.org/data/2.5/forecast?lat=%7Blat%7D&lon=%7Blon%7D&appid=
// http://localhost:8080/cse383_php/final.php?method=setWeather&location={}&mapJson={}&weatherJson={} 
// http://localhost:8080/cse383_php/final.php?method=getWeather&date=2022-11-16

function getWeatherTable() {
    var searchInput = document.getElementById("search").value;
    var searchURL = tomtomPre + searchInput + tomtomPost;

    // call ajax routine to save tomtom api stuff
    var mapJson = $.ajax({
        url: searchURL,
        method: "GET"
    }).done(function (data) {
        var lat = data.results[0].position.lat; // get index from json result
        var lon = data.results[0].position.lon;
        var weatherURL = owmPre + "lat=" + lat + "&lon=" + lon + "&appid=" + openWeatherMapKey + "&units=metric";
        // do openweathermap api stuff 
        var weatherJson = $.ajax({
            url: weatherURL,
            method: "GET"
        }).done(function (data) {
            $("#weatherRes").empty(); // empty the table
            var count, increment;
            for (let i = 0; i < 5; i++) { // 5 days
                var minArr = []; // minimum temperatures
                var maxArr = []; // maximum temperatures
                if (i == 0) {
                    count = 0;
                    increment = count + 8;
                } else {
                    count = 8 * i - 1;
                    increment = count + 9;
                }

                for (let j = count; j < increment; j++) { // 8 jumps per day
                    minArr[j] = data.list[j].main.temp_min;
                    maxArr[j] = data.list[j].main.temp_max;
                }

                if (minArr.length > 8 && maxArr.length > 8) {
                    minArr.splice(0, count + 1);
                    maxArr.splice(0, count + 1);
                }

                // print date & day of the week
                var newDate = new Date(data.list[count].dt_txt);
                var stringDate = newDate.toDateString();
                stringDate = stringDate.substring(4);

                // get picture of the weather today
                var icon = data.list[count].weather[0].icon;
                var completePicURL = picURL + icon + "@2x.png";

                // Add a new row to the table
                $("#weatherRes").append("<tr><td>" + stringDate
                    + "</td><td>" + getDay(newDate)
                    + "</td><td>" + Math.max(...maxArr)
                    + "</td><td>" + Math.min(...minArr)
                    + "</td><td>" + data.list[count].weather[0].description
                    + "<img class='img-fluid icon-small' id='icon' src='" + completePicURL + "'/>"
                    + "</td><td>" + data.list[count].visibility / 1000
                    + "</td><td>" + data.list[count].main.humidity + "</td></tr>");
            }

            // store json results to php
            a = $.ajax({
                url: localURL + "setWeather&location=" + searchInput,
                data: {
                    mapJson: mapJson.responseText,
                    weatherJson: weatherJson.responseText
                },
                method: "POST"
            }).done(function (data) {
                console.log("successfully saved input to final.php");
            }).fail(function (error) {
                console.log("error on setWeather()", error.statusText);
                setTimeout(5000);
            });

        }).fail(function (error) {
            console.log("error on openweathermap", error.statusText);
            setTimeout(5000);
        });
    }).fail(function (error) {
        console.log("error on tomtom", error.statusText);
        setTimeout(5000);
    });
}

// Returns the String value of the day of the week.
function getDay(date) {
    var day = date.getDay();
    if (day == 0) return "Sunday"
    else if (day == 1) return "Monday"
    else if (day == 2) return "Tuesday"
    else if (day == 3) return "Wednesday"
    else if (day == 4) return "Thursday"
    else if (day == 5) return "Friday"
    else if (day == 6) return "Saturday"
}

// // http://localhost:8080/cse383_php/final.php?method=getWeather&date=2022-11-16
function getWeatherHistory() {
    var dateReq = document.getElementById("dateReq").value;
    var numReq = document.getElementById("numReq").value;
    console.log(dateReq + " " + numReq);
    var newURL = localURL + "getWeather&date=" + dateReq
    // call ajax 
    a = $.ajax({
        url: newURL,
        method: "GET"
    }).done(function (data) {
        console.log(newURL);
        console.log("successfully retrieve data from php");
        console.log(data.result[0].Location);

        for (let i = 0; i < numReq; i++) {
            var currLine = data.result[i];
            var mapData = JSON.parse(currLine.MapJson);
            // Add a new row to the table
            $("#historyRes").append("<tr><td>" + currLine.DateTime // date: DateTime
                + "</td><td>" + currLine.Location
                + "</td><td>" + mapData.results[0].position.lat + ", " + mapData.results[0].position.lon// fuzzy search: Location
                + "</td><td><div class='col-md-2 align-self-end'>"
                + "<button type='button' class='btn btn-success btn-sm btn-block' onclick='getWeatherData(" + i + ");'>Get weather data</button></div></td></tr>");
        }
    }).fail(function (error) {
        console.log("failed to retrieve data from php");
        setTimeout(5000);
    });
}

function getWeatherData(num) {
    var dateReq = document.getElementById("dateReq").value;
    var newURL = localURL + "getWeather&date=" + dateReq
    // call ajax 
    a = $.ajax({
        url: newURL, // to php 
        method: "GET"
    }).done(function (data) { //json data
        $("#historyData").empty(); // empty the table
        // get WeatherJson elem
        var weatherData = JSON.parse(data.result[num].WeatherJson);
        var count, increment;
        for (let i = 0; i < 5; i++) { // 5 days
            var minArr = []; // minimum temperatures
            var maxArr = []; // maximum temperatures
            if (i == 0) {
                count = 0;
                increment = count + 8;
            } else {
                count = 8 * i - 1;
                increment = count + 9;
            }

            for (let j = count; j < increment; j++) { // 8 jumps per day
                minArr[j] = weatherData.list[j].main.temp_min;
                maxArr[j] = weatherData.list[j].main.temp_max;
            }

            if (minArr.length > 8 && maxArr.length > 8) {
                minArr.splice(0, count + 1);
                maxArr.splice(0, count + 1);
            }

            // print date & day of the week
            var newDate = new Date(weatherData.list[count].dt_txt);
            var stringDate = newDate.toDateString();
            stringDate = stringDate.substring(4);

            // get picture of the weather today
            var icon = weatherData.list[count].weather[0].icon;
            var completePicURL = picURL + icon + "@2x.png";

            // Add a new row to the table
            $("#historyData").append("<tr><td>" + stringDate
                + "</td><td>" + getDay(newDate)
                + "</td><td>" + Math.max(...maxArr)
                + "</td><td>" + Math.min(...minArr)
                + "</td><td>" + weatherData.list[count].weather[0].description
                + "<img class='img-fluid icon-small' id='icon' src='" + completePicURL + "'/>"
                + "</td><td>" + weatherData.list[count].visibility / 1000
                + "</td><td>" + weatherData.list[count].main.humidity + "</td></tr>");
        }
    }).fail(function (error) {
        console.log("failed to retrieve data from php");
        setTimeout(5000);
    });
}

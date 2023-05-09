function checkStr(str, strName) {
  if (!str) throw `No string provided for ${strName}`;
  if (typeof str !== "string") throw `${strName} is not a string`;
  str = str.trim();
  console.log(str.length);
  if (str.length === 0) throw `${strName} is empty`;
  return str; // trimmed
}

function checkCity(city, cityName) {
  city = checkStr(city, cityName);
  if (/\d/.test(city)) {
    throw "City name contains a numerical digit!";
  }
  return city.toLowerCase(); // trimmed and lowercased
}

function fillLeaderboardTable(leaderboardTableData) {
  var table = $(".leaderboard-table");
  table.find("tbody").empty();

  $.each(leaderboardTableData, function (index, user) {
    // console.log(index)
    // console.log(user)
    const iconToUse = user.icon
      ? user.icon
      : "/static/images/default_bird_icon.jpg";
    var row = $("<tr>").append(
      $("<td>").text(index),
      $("<td>").append(
        $("<img>").addClass("leaderboard-user-icon").attr("src", iconToUse)
      ),
      $("<td>").text(user.username),
      $("<td>").text(user.high_score)
    );
    table.append(row);
  });
}

$(document).on("submit", "#location-search-form", function (event) {
  event.preventDefault();
  var citySearchBar = $("#citySearchBar").val();
  var countryInput = $("#countryInput").val();
  var errorDiv = $("#error");
  errorDiv.hide();

  if (
    citySearchBar &&
    citySearchBar !== undefined &&
    countryInput !== "invalid"
  ) {
    try {
      checkCity(citySearchBar, citySearchBar);
      $.ajax({
        type: "POST",
        url: "/leaderboard/local/",
        data: {
          countryInput: countryInput,
          citySearchBar: checkCity(citySearchBar, citySearchBar),
        },
      }).then(function (response) {
        //console.log(response)
        fillLeaderboardTable(response);
      });
    } catch (e) {
      errorDiv.html("Please select and enter a valid country and city.");
      errorDiv.show();
    }
  } else {
    errorDiv.html("Please select and enter a valid country and city.");
    errorDiv.show();
  }
});

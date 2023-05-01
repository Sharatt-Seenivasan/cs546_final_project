
function checkStr(str, strName) {
    if (!str) throw `No string provided for ${strName}`;
    if (typeof str !== "string") throw `${strName} is not a string`;
    str = str.trim();
    if (str.length === 0) throw `${strName} is empty`;
    return str; // trimmed
  }

function checkCity(city, cityName) {
    city = checkStr(city, cityName);
    return city.toLowerCase(); // trimmed and lowercased
}

function fillLeaderboardTable(leaderboardTableData){
    var table = $('#table leaderboard-table');
    table.empty()

    $.each(leaderboardTableData, function(index, user) {
        var row = $('<tr>').append(
          $('<td>').text(index),
          $('<td>').text(user.icon),
          $('<td>').text(user.username),
          $('<td>').text(user.high_score)
        );
        table.append(row);
    });
}   

$(document).on('submit', '#location-search-form',function(event) {
        event.preventDefault(); 
        var citySearchBar = $('#citySearchBar').val(); 
        var countryInput= $('#countryInput').val();
    
        if(citySearchBar && citySearchBar !== undefined && countryInput !== 'invalid' && checkCity(citySearchBar,citySearchBar)) {
            $.ajax({
                type: "POST",
                url: '/users/leaderboard/local/',
                data: {countryInput:countryInput ,citySearchBar: checkCity(citySearchBar,citySearchBar)}
            }).then(function (response) {
                fillLeaderboardTable(response)
            });
        }
});




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
    var table = $('.leaderboard-table');
    table.find("tbody").empty()

    $.each(leaderboardTableData, function(index, user) {
        // console.log(index)
        // console.log(user)
        var row = $('<tr>').append(
          $('<td>').text(index),
          $('<td>').append($('<img>').addClass('leaderboard-user-icon').attr('src', user.icon)),
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
        var errorDiv = $('#error')
    
        if(citySearchBar && citySearchBar !== undefined && countryInput !== 'invalid' && checkCity(citySearchBar,citySearchBar)) {
            $.ajax({
                type: "POST",
                url: '/leaderboard/local/',
                data: {countryInput:countryInput ,citySearchBar: checkCity(citySearchBar,citySearchBar)}
            }).then(function (response) {
                //console.log(response)
                fillLeaderboardTable(response)
            });
        }
        else {
            errorDiv.html("The country and/or city selected is invalid!")
        }
});



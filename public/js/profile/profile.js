// const geocoder = require('geocoder');

// function populateCitiesByCountry(country) {
//   geocoder.geocode(country, function(err, data) {
//     if (err) {
//       console.log(err);
//     } else {
//       const cities = data.results
//         .map(result => result.address_components)
//         .flat()
//         .filter(component => component.types.includes('locality'))
//         .map(city => city.long_name);

//       const citySelect = document.getElementById('city-select');

//       citySelect.innerHTML = '';
//       cities.forEach(city => {
//         const option = document.createElement('option');
//         option.value = city;
//         option.text = city;
//         citySelect.appendChild(option);
//       });
//     }
//   });
// }


// function populateCountries() {

//   geocoder.geocode('countries', function(err, data) {
//     if (err) {
//       console.log(err);
//     } else {
//       const countries = data.results
//         .map(result => result.address_components)
//         .flat()
//         .filter(component => component.types.includes('country'))
//         .map(country => country.long_name);

//       const countrySelect = document.getElementById('country-select');
//       countries.forEach(country => {
//         const option = document.createElement('option');
//         option.value = country;
//         option.text = country;
//         countrySelect.appendChild(option);
//       });

//       countrySelect.addEventListener('change', function(event) {
//         const selectedCountry = event.target.value;
//         populateCitiesByCountry(selectedCountry);
//       });
//     }
//   });
// }

// populateCountries();

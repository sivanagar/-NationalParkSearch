//Variables
const parksEl = document.getElementById("divParks");
const inputCity = document.getElementById("inputCity");
const buttonSearch = document.getElementById("buttonSearch");
const divNews = document.getElementById("divNews");
const distanceEl = document.getElementById("distance");
const divLoading = document.getElementById("divLoading");
let cityName = "";
let cityState = "";
let cityLat = 0;
let cityLng = 0;
let favoriteParks = JSON.parse(localStorage.getItem("favoriteParks")) || [];

//Functions

//Get News About the City

//Get National Park List
function getNationalParks() {
  showLoading();
  const url = `https://developer.nps.gov/api/v1/parks?limit=465V&api_key=x6sAYVvGxVvGZ5T60O2OnqEGdJnsiGuyJBeye1QX`;
  fetch(url)
    .then((response) => response.json())
    .then((response) => {
      //show parks
      showParks(response.data);
    });
}

//Show Park closed to the City in the State
function showParks(parks) {
  if (parks) {
    parksEl.innerHTML = "";
    parks.map((park) => {
      const dist = distance(cityLat, cityLng, park.latitude, park.longitude);
      if (dist <= Number(distanceEl.value)) {
        // all images for the park
        let parkImages = `<div class="ui tiny images">`;
        for (let i = 0; i < park.images.length; i++) {
          parkImages += `<a href="${park.images[i].url}" data-lightbox="${park.fullName}"  data-title="${park.images[i].title}">
                        <img class="ui image Mini" src="${park.images[i].url}" loading="lazy"/>
                        </a>`;
        }
        parkImages += `</div>`;

        //all activities for the park
        let parkActivities = "<span>";
        for (let i = 0; i < 5 && i < park.activities.length; i++) {
          console.log(park.activities[i].name);
          parkActivities += ` ${park.activities[i].name},`;
        }
        parkActivities += `</span>`;

        const newPark = `
        <div class="ui item">
          <div class="ui large image">
            <img class="main-image" src="${park.images[0].url}">
          </div>
          <div class="content left aligned">
            <div class="header">${park.fullName} 
              <div id="favorite" class="ui right floated">
              ${
                favoriteParks.find((p) => p === park.fullName)
                  ? `<i data-name="${park.fullName}" class="bookmark icon"></i>`
                  : `<i data-name="${park.fullName}" class="bookmark outline icon"></i>`
              }
              
              
              </div>
            </div>
              <div class="meta">
                <span> ${park.addresses[0].line1}, ${park.addresses[0].city} ${
          park.addresses[0].stateCode
        } <br>${Math.floor(dist)} miles away</span>
              </div>
              <div class="description">
                <p>${park.description}</p>
              </div>
              <div class="extra">
                <span>${
                  park.entranceFees[0].cost === "0.00"
                    ? "Free"
                    : "$" + park.entranceFees[0].cost
                }</span>
                ${parkActivities} 
              </div>
              ${parkImages}
              
          </div>
        </div>

`;
        parksEl.innerHTML += newPark;
      }
    });
  }
  hideLoading();
}

//TODO: Show Loading div
function showLoading() {
  divLoading.classList = "ui active inverted dimmer show-flex";
}

//TODO: hide Loading div
function hideLoading() {
  divLoading.classList = "ui active inverted dimmer no-show";
}

//Calculate the Distance between to poitn base in coordinates Harvesine Formula geodatasource.com
function distance(lat1, lon1, lat2, lon2, unit) {
  if (lat1 == lat2 && lon1 == lon2) {
    return 0;
  } else {
    var radlat1 = (Math.PI * lat1) / 180;
    var radlat2 = (Math.PI * lat2) / 180;
    var theta = lon1 - lon2;
    var radtheta = (Math.PI * theta) / 180;
    var dist =
      Math.sin(radlat1) * Math.sin(radlat2) +
      Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
    if (dist > 1) {
      dist = 1;
    }
    dist = Math.acos(dist);
    dist = (dist * 180) / Math.PI;
    dist = dist * 60 * 1.1515;
    if (unit == "K") {
      dist = dist * 1.609344;
    }
    if (unit == "N") {
      dist = dist * 0.8684;
    }
    return dist;
  }
}

//Google Autocomplete API
let autocomplete;

function initAutocomplete() {
  autocomplete = new google.maps.places.Autocomplete(inputCity, {
    types: ["(cities)"],
    componentRestrictions: {
      country: "us",
    },
  });
  autocomplete.addListener("place_changed", onCityChanged);
}
//Get City Weather Information
function onCityChanged() {
  var place = autocomplete.getPlace();
  console.log("place from Google API", place);
  cityLat = place.geometry.location.lat();
  cityLng = place.geometry.location.lng();
  cityName = place.vicinity;
  cityState = place.address_components[2].short_name;

  getNationalParks();
}

distanceEl.addEventListener("blur", () => {
  if (distanceEl.value && distanceEl.value != "0") {
    getNationalParks();
  } else {
    $("#modalDistance").modal("show");
  }
});

parksEl.addEventListener("click", (event) => {
  if (
    event.target.className === "bookmark icon" ||
    event.target.className === "bookmark outline icon"
  ) {
    const parkName = event.target.getAttribute("data-name");
    if (!favoriteParks.find((p) => p === parkName)) {
      event.target.classList = "bookmark icon";
      favoriteParks.push(parkName);
      localStorage.setItem("favoriteParks", JSON.stringify(favoriteParks));
    } else {
      //remove from the local storage
      event.target.classList = "bookmark outline icon";
      const index = favoriteParks.indexOf(parkName);
      favoriteParks.splice(index, 1);
      localStorage.setItem("favoriteParks", JSON.stringify(favoriteParks));
    }
  }
});

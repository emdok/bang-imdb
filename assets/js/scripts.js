const imdbApiKey = "k_8oixkc80";
const nytReviewsApiKey = "1CtMayWncOQbFJuoqvGVAcHGbcd644Hj";
const searchQuery = document.querySelector('#fixed-header-drawer-exp');
var mediaGridEl = document.querySelector("#media-grid");
var userSearchHistory = [];

//This is a sleep function to prevent too many API requests due to Rate Limits
function sleep(milliseconds) {
    const date = Date.now();
    let currentDate = null;
    do {
        currentDate = Date.now();
    } while (currentDate - date < milliseconds);
}

//This function checks local storage to add values to Recent Searches
var recentSearchHistory = function () {

    if (localStorage.getItem("search term")) {
        userSearchHistory = JSON.parse(localStorage.getItem("search term"));

        for (var i = 0; i < userSearchHistory.length; i++) {
            getIMDBMedia(userSearchHistory[i]);
        };
    }
};

recentSearchHistory();

//Default list of shows from IMDB
var getDefaultIMDBMedia = function () {
    var imdbQueryUrl = "https://imdb-api.com/API/AdvancedSearch/" + imdbApiKey + "?title_type=feature,tv_series&countries=us&languages=en&sort=boxoffice_gross_us,desc";

    fetch(imdbQueryUrl).then(function (response) {
        if (response.ok) {
            response.json().then(function (data) {
                var array = data.results;
                console.log(data);
                for (let i = 0; i < 50; i++) {
                    sleep(150);
                    var media = array[i].id;
                    getStreamAvailability(media)
                }
            });
        } else {
            alert("Error: Title not found");
        }
    });
};

getDefaultIMDBMedia();

// Get Series/Movie Title from IMDB and ID
var getIMDBMedia = function (title) {
    var imdbQueryUrl = "https://imdb-api.com/en/API/SearchAll/" + imdbApiKey + "/" + title;

    fetch(imdbQueryUrl).then(function (response) {
        if (response.ok) {
            response.json().then(function (data) {
                var array = data.results;
                console.log(array);
                for (let i = 0; i < 5; i++) {
                    getStreamAvailability(array[i].id).catch(err => {
                        console.log('error in getIMDBMedia is: ', err)
                    })
                }
                getNytReviews(title);
            });
        } else {
            alert("Error: Title not found");
        }
    }).catch(err => {
        console.error('error in imdb media fetch: ', err);
    });
};


//Function to use IMDB ID to locate Streaming Services
function getStreamAvailability(mediaId) {

    try {
        fetch("https://streaming-availability.p.rapidapi.com/get/ultra?imdb_id=" + mediaId + "&output_language=en", {
            "method": "GET",
            "headers": {
                "x-rapidapi-host": "streaming-availability.p.rapidapi.com",
                "x-rapidapi-key": "d9ad7c19d0msh5e66719b7acc4f6p117731jsn3cd820ad1e3b"
            }
        }).then(function (response) {
            if (response.status === 404) {
                console.log('sorry this movie isn\'t availible');
            } else {

                response.json().then(function (data) {
                    console.log("streamAvail:", data);

                    var banner = "https://image.tmdb.org/t/p/w500/" + data.posterPath;
                    var title = data.title;
                    var streaming = data.streamingInfo;
                    var service = Object.values(streaming)[0];
                    var service2 = Object.values(service)[0];
                    var serviceLink = service2.link;
                    console.log(serviceLink);
                    var serviceName = strmServiceTitle(serviceLink);
                    console.log(serviceName);
                    console.log(banner);
                    console.log(title);

                    cardMaker(title, banner, serviceLink, serviceName);

                }).catch(err => {
                    console.error('error in .json: ', err)
                })
            }
        })
            .catch(err => {
                console.error('error in fetchL ', err);
            });
    } catch (err) {
        console.log('error in catch block', err)
    }
}

// Function to pull out streaming service Title from link
function strmServiceTitle(str) {
    var title = str.split('.');
    return title[1];
}

// API Call to NYTimes Reviews
var getNytReviews = function (title) {
    var nytReviewQueryUrl = "https://api.nytimes.com/svc/movies/v2/reviews/search.json?query=" + title + "&api-key=" + nytReviewsApiKey;

    fetch(nytReviewQueryUrl).then(function (response) {
        if (response.ok) {
            response.json().then(function (data) {
                console.log(data);
            });
        } else {
            console.log("Error: Review not found");
        }
    });
};

// Action to take when user has pressed Return, runs getIMDBMedia function on user searchTerms
var searchTermHandler = function (keyword) {
    event.preventDefault();

    userSearchHistory.push(keyword);
    localStorage.setItem("search term", JSON.stringify(userSearchHistory));
    mediaGridEl.innerHTML = "";
    var results = getIMDBMedia(keyword);
    console.log(results);

}

// listen for the user to press return to capture search term
searchQuery.addEventListener('keyup', function (event) {

    if (event.keyCode === 13) {
        var searchTerms = this.value;
        searchTermHandler(searchTerms);
    }
});

///
// on click refresh homepage with default view
var navHome = document.querySelector("#home");
navHome.addEventListener("click", function () {
    alert("home clicked");
});

// on click refresh homepage, display only movies
var navMovies = document.querySelector("#movies");
navMovies.addEventListener("click", function () {
    alert("movies clicked");
});

// on click refresh homepage, display only tv shows
var navTvShows = document.querySelector("#tv-shows");
navTvShows.addEventListener("click", function () {
    alert("tv shows clicked");
});

// on click refresh page, display new and popular results
var navPopular = document.querySelector("#popular");
navPopular.addEventListener("click", function () {
    alert("popular clicked");
});

// This function is used to build the media card within Search Results
function cardMaker(title, banner, streamLink, streamName) {

    mediaGridEl.innerHTML += `
    <div class="mdl-card mdl-shadow--2dp mdl-cell mdl-cell--3-col">
    <div class="mdl-card__title">
      <h2 class="mdl-card__title-text">${title}</h2>
    </div>
    <div class="mdl-card__media">
      <img src="${banner}" width="100%" alt="">
    </div>
    <div class="mdl-card__actions mdl-card--border">
      <a href="${streamLink}" class="mdl-button mdl-button--colored mdl-js-button mdl-js-ripple-effect">
        ${streamName}
      </a>
    </div>
  </div>
    `
};
const imdbApiKey = "k_8oixkc80";
const searchQuery = document.querySelector('#fixed-header-drawer-exp');
var mediaGridEl = document.querySelector("#media-grid");
var navHome = document.querySelector("#home");
var navMovies = document.querySelector("#movies");
var navTvShows = document.querySelector("#tv-shows");
var navPopular = document.querySelector("#popular");
var userSearchHistory = [];


/**** Functions ****/

// Sleep function to prevent 429 errors on API Calls
function sleep(milliseconds) {
    const date = Date.now();
    let currentDate = null;
    do {
        currentDate = Date.now();
    } while (currentDate - date < milliseconds);
}

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

                    var serviceOne = Object.values(streaming)[0];
                    var serviceOneA = Object.values(serviceOne)[0];
                    var serviceLinkOne = serviceOneA.link;
                    var serviceNameOne = strmServiceTitle(serviceLinkOne);

                    var serviceTwo = Object.values(streaming)[1];
                    var serviceOneB = Object.values(serviceTwo)[1];
                    var serviceLinkTwo = serviceOneB.link;
                    var serviceNameTwo = strmServiceTitle(serviceLinkTwo);

                    cardMaker(title, banner, serviceLinkOne, serviceNameOne, serviceLinkTwo, serviceNameTwo);

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

// Function to check local storage for previous searches
var recentSearchHistory = function () {

    if (localStorage.getItem("search term")) {
        userSearchHistory = JSON.parse(localStorage.getItem("search term"));

        for (var i = 0; i < userSearchHistory.length; i++) {
            getIMDBMedia(userSearchHistory[i]);
        };
    }
};

recentSearchHistory();

// Function to grab Most Popular movies for Movie Quick Filter
var getMovieIMDBMedia = function () {
    var imdbQueryUrl = "https://imdb-api.com/en/API/MostPopularMovies/" + imdbApiKey

    fetch(imdbQueryUrl).then(function (response) {
        if (response.ok) {
            response.json().then(function (data) {
                var array = data.items;
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

// Function to grab Most popular Tv Shows for TV QuickFilter
var getTvShowIMDBMedia = function () {
    var imdbQueryUrl = "https://imdb-api.com/en/API/MostPopularTVs/" + imdbApiKey;

    fetch(imdbQueryUrl).then(function (response) {
        if (response.ok) {
            response.json().then(function (data) {
                var array = data.items;
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

// Function to grab Most Popular Movies and TV Shows for Popular Quick filter
var getPopularIMDBMedia = function () {
    var imdbQueryUrl = "https://imdb-api.com/API/AdvancedSearch/" + imdbApiKey + "?title_type=feature,tv_movie,tv_series,tv_episode,documentary&groups=top_100&countries=us&languages=en";

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

// Function to build out media cards for each piece of media
function cardMaker(title, banner, streamLink, streamName, streamLink2, streamName2) {

    mediaGridEl.innerHTML += `
    <div class="mdl-card mdl-shadow--2dp mdl-cell mdl-cell--3-col mdl-cell--4-col-tablet mdl-cell--4-col-phone">
    <div class="mdl-card__title">
      <h2 class="mdl-card__subtitle-text truncate">${title}</h2>
    </div>
    <div class="mdl-card__media">
      <img src="${banner}" width="100%" alt="">
    </div>
    <div class="mdl-card__actions mdl-card--border">
      <a href="${streamLink}" target="_blank" class="card-button mdl-button mdl-js-button mdl-js-ripple-effect">
        ${streamName}
      </a>
      <a href="${streamLink2}" target="_blank" class="card-button mdl-button mdl-js-button mdl-js-ripple-effect">
      ${streamName2}
    </a>
    </div>
  </div>
    `
};


/***** Event Listeners & Event Handlers *****/

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

// on click refresh homepage with default view
navHome.addEventListener("click", function () {
    event.preventDefault();

    mediaGridEl.innerHTML = "";
    getDefaultIMDBMedia();
});

// on click refresh homepage, display only movies
navMovies.addEventListener("click", function () {
    event.preventDefault()

    mediaGridEl.innerHTML = "";
    getMovieIMDBMedia();

});

// on click refresh homepage, display only tv shows
navTvShows.addEventListener("click", function () {
    event.preventDefault();

    mediaGridEl.innerHTML = "";
    getTvShowIMDBMedia();

});

// on click refresh page, display new and popular results
navPopular.addEventListener("click", function () {
    event.preventDefault();

    mediaGridEl.innerHTML = "";
    getPopularIMDBMedia();
});


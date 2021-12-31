const imdbApiKey = "k_8oixkc80";
const searchQuery = document.querySelector('#fixed-header-drawer-exp');
var searchBar = document.querySelector("#search-bar");
var mainEl = document.querySelector("main");
var recentSearchEl = document.querySelector("#recent-search");
var mediaGridEl = document.querySelector("#media-grid");
var navHome = document.querySelector("#home");
var navMovies = document.querySelector("#movies");
var navTvShows = document.querySelector("#tv-shows");
var navTopRated = document.querySelector("#top-rated");
var userSearchHistory = [];

//Default list of shows from IMDB
var getDefaultIMDBMedia = function () {
    var imdbQueryUrl = "https://imdb-api.com/API/AdvancedSearch/" + imdbApiKey + "?title_type=feature,tv_series&countries=us&languages=en&sort=boxoffice_gross_us,desc";

    fetch(imdbQueryUrl).then(function (response) {
        if (response.ok) {
            response.json().then(async function (data) {
                var array = data.results;
                console.log(data);
                for (let i = 0; i < 50; i++) {
                    var media = array[i].id;
                    await getStreamAvailability(media, cardMaker)
                }
            });
        } else {
            alert("Error: Title not found");
        }
    });
};

getDefaultIMDBMedia();

// Get Series/Movie Title from IMDB and ID
var getIMDBMedia = function (title, cardMaker) {
    var imdbQueryUrl = "https://imdb-api.com/en/API/SearchAll/" + imdbApiKey + "/" + title;

    fetch(imdbQueryUrl).then(function (response) {
        if (response.ok) {
            response.json().then(async function (data) {
                var array = data.results;
                console.log(array);
                for (let i = 0; i < 5; i++) {
                    await getStreamAvailability(array[i].id, cardMaker).catch(err => {
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
async function getStreamAvailability(mediaId, mediaMaker) {

    try {
        await fetch("https://streaming-availability.p.rapidapi.com/get/ultra?imdb_id=" + mediaId + "&output_language=en", {
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
                    var service = streaming?Object.values(streaming)[0]:{};
                    var service2 = service?Object.values(service)[0]:{};
                    var serviceLink = service2.link;
                    var serviceName = strmServiceTitle(serviceLink);

                    mediaMaker(title, banner, serviceLink, serviceName);

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
    var title = str?str.split('.'):["","No Service"];
    return title[1];
}

// Function to check Local Storage for any recent user searches and add to array
var recentSearchHistory = async function () {

    if (localStorage.getItem("search term")) {
       document.querySelector("#recent-search-container").style.display = "block";
        userSearchHistory = JSON.parse(localStorage.getItem("search term"));

        for (var i = 0; i < 5; i++) {
            await getRecentIMDB(userSearchHistory[i]);  
        };

        async function getRecentIMDB(title) {
            var imdbQueryUrl = "https://imdb-api.com/en/API/SearchAll/" + imdbApiKey + "/" + title;

            await fetch(imdbQueryUrl).then(function (response) {
                if (response.ok) {
                    response.json().then(async function (data) {
                        var array = data.results;
                        console.log(array);

                        for (let i = 0; i < 8; i++) {
                            await getStreamAvailability(array[i].id, recentSearchMaker).catch(err => {
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
        }
    }
};

recentSearchHistory();

// Function to grab Most Popular Movies from IMDB
var getMovieIMDBMedia = function () {
    var imdbQueryUrl = "https://imdb-api.com/en/API/MostPopularMovies/" + imdbApiKey

    fetch(imdbQueryUrl).then(function (response) {
        if (response.ok) {
            response.json().then(async function (data) {
                var array = data.items;
                for (let i = 0; i < 50; i++) {
                    var media = array[i].id;
                    await getStreamAvailability(media, cardMaker)
                }
            });
        } else {
            alert("Error: Title not found");
        }
    });
};

// Function to get Most Popular TV Shows from IMDB
var getTvShowIMDBMedia = function () {
    var imdbQueryUrl = "https://imdb-api.com/en/API/MostPopularTVs/" + imdbApiKey;

    fetch(imdbQueryUrl).then(function (response) {
        if (response.ok) {
            response.json().then(async function (data) {
                var array = data.items;
                for (let i = 0; i < 50; i++) {
                    var media = array[i].id;
                    await getStreamAvailability(media, cardMaker)
                }
            });
        } else {
            alert("Error: Title not found");
        }
    });
};

// Function to call top rated media on IMDB
var getTopRatedIMDBMedia = function () {
    var imdbQueryUrl = "https://imdb-api.com/API/AdvancedSearch/" + imdbApiKey + "?title_type=feature,tv_movie,tv_series,tv_episode,documentary&groups=top_100&countries=us&languages=en";

    fetch(imdbQueryUrl).then(function (response) {
        if (response.ok) {
            response.json().then(async function (data) {
                var array = data.results;
                for (let i = 0; i < 50; i++) {
                    var media = array[i].id;
                    await getStreamAvailability(media, cardMaker)
                }
            });
        } else {
            alert("Error: Title not found");
        }
    });
};

// Function to create media cards per API Call
function cardMaker(title, banner, streamLink, streamName) {

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
    </div>
  </div>
    `
};

function recentSearchMaker(title, banner, streamLink, streamName) {
    recentSearchEl.innerHTML += `
    <div class="mdl-card mdl-shadow--2dp mdl-cell mdl-cell--3-col mdl-cell--4-col-tablet mdl-cell--4-col-phone">
        <div class="mdl-card__title">
            <h2 class="mdl-card__subtitle-text truncate">${title}</h2>
         </div>
         <div class="mdl-card__media">
             <img src="${banner}" width="100%" alt="">
        </div>
         <div class="mdl-card__actions mdl-card--border">
             <a href="${streamLink}" target="_blank" class="card-button mdl-button mdl-js-button mdl-js-ripple-effect">${streamName}</a>
        </div>
    </div>
    `
};

// Action to take when user has pressed Return, runs getIMDBMedia function on user searchTerms
var searchTermHandler = function (keyword) {
    event.preventDefault();

    document.querySelector("#recent-search-container").style.display = "none";

    userSearchHistory.push(keyword);
    localStorage.setItem("search term", JSON.stringify(userSearchHistory));
    mediaGridEl.innerHTML = "";
    getIMDBMedia(keyword, cardMaker);
}

// listen for the user to press return to capture search term
searchQuery.addEventListener('keyup', function (event) {

    if (event.keyCode === 13) {
        if (this.value === "") {
            searchQuery.value = "";
        } else {
            var searchTerms = this.value;
            searchTermHandler(searchTerms);
            searchQuery.value = "";
            searchBar.classList.remove("is-dirty", "is-focused");
        }

    }
});

// on click refresh homepage with default view
navHome.addEventListener("click", function () {
    event.preventDefault();
    navHome.classList.add("active");
    navMovies.classList.remove("active");
    navTvShows.classList.remove("active");
    navTopRated.classList.remove("active");

    document.querySelector("#recent-search-container").style.display = "none";
    mediaGridEl.innerHTML = "";
    getDefaultIMDBMedia();
});

// on click refresh homepage, display only movies
navMovies.addEventListener("click", function () {
    event.preventDefault()
    navHome.classList.remove("active");
    navMovies.classList.add("active");
    navTvShows.classList.remove("active");
    navTopRated.classList.remove("active");

    document.querySelector("#recent-search-container").style.display = "none";
    mediaGridEl.innerHTML = "";
    getMovieIMDBMedia();
});

// on click refresh homepage, display only tv shows
navTvShows.addEventListener("click", function () {
    event.preventDefault();
    navHome.classList.remove("active");
    navMovies.classList.remove("active");
    navTvShows.classList.add("active");
    navTopRated.classList.remove("active");

    document.querySelector("#recent-search-container").style.display = "none";
    mediaGridEl.innerHTML = "";
    getTvShowIMDBMedia();
});

// on click refresh page, display new and popular results
navTopRated.addEventListener("click", function () {
    event.preventDefault();
    navHome.classList.remove("active");
    navMovies.classList.remove("active");
    navTvShows.classList.remove("active");
    navTopRated.classList.add("active");

    document.querySelector("#recent-search-container").style.display = "none";
    mediaGridEl.innerHTML = "";
    getTopRatedIMDBMedia();
});

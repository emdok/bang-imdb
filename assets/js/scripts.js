const imdbApiKey = "k_8oixkc80";
const nytReviewsApiKey = "1CtMayWncOQbFJuoqvGVAcHGbcd644Hj";
const searchQuery = document.querySelector('#fixed-header-drawer-exp');
var mediaGridEl = document.querySelector("#media-grid");

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
    var streamingArray = [];

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

                    var banner = data.backdropURLs.original;
                    var title = data.title;
                    var streaming = data.streamingInfo;
                    var service = Object.values(streaming)[0];
                    var service2 = Object.values(service)[0];
                    var serviceLink = service2.link;
                    console.log(serviceLink);
                    console.log(banner);
                    console.log(title);

                    cardMaker(banner, title, serviceLink);

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
    var results = getIMDBMedia(keyword);
    console.log(results);

}

// listen for the user to press return to capture search term
searchQuery.addEventListener('keyup', function (event) {
    if (event.keyCode === 13) {
        mediaGridEl.innerHTML = "";
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

function cardMaker(img, title, stream) {
    
    mediaGridEl.innerHTML += `
    <div class="demo-card-square mdl-card mdl-shadow--2dp">
    <div class="mdl-card__title mdl-card--expand">
      <h2 class="mdl-card__title-text">${title}</h2>
    </div>
    <div class="mdl-card__actions mdl-card--border">
      <a class="mdl-button mdl-button--colored mdl-js-button mdl-js-ripple-effect">
        ${stream}
      </a>
    </div>
  </div>
    `
var mediaCard = document.createElement();
mediaGridEl.appendChild(mediaCard);


    for (let i = 0; i < 50; i++) {
     cardMaker(img, title, stream); 
    }
};
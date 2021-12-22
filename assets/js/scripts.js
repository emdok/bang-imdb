const imdbApiKey = "k_8oixkc80";
const nytReviewsApiKey = "1CtMayWncOQbFJuoqvGVAcHGbcd644Hj";


//Default list of shows from IMDB
var getDefaultIMDBMedia = function () {
    var imdbQueryUrl = "https://imdb-api.com/API/AdvancedSearch/" + imdbApiKey + "?title_type=feature,tv_movie,tv_series,tv_miniseries&sort=release_date,desc";

    fetch(imdbQueryUrl).then(function (response) {
        if (response.ok) {
            response.json().then(function (data) {
                var array = data.results;

                for (let i = 0; i < 10; i++) {
                    var media = array[i].id;
                    getStreamAvailability(media);
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
                console.log("IMDB:", data);
                getStreamAvailability(data.results[0].id);
                getNytReviews(title);
            });
        } else {
            alert("Error: Title not found");
        }
    });
};

// getIMDBMedia("The Big Lebowski");

//Function to use IMDB ID to locate Streaming Services
var getStreamAvailability = function (mediaId) {
    fetch("https://streaming-availability.p.rapidapi.com/get/basic?country=us&imdb_id=" + mediaId + "&output_language=en", {
        "method": "GET",
        "headers": {
            "x-rapidapi-host": "streaming-availability.p.rapidapi.com",
            "x-rapidapi-key": "21f375a3cfmsh4f8395beb749419p1aaee6jsn187734a6f501"
        }
    })
        .then(response => {
            response.json().then(function (data) {
                console.log("streamAvail:", data);
                var banner = data.posterURLs.original;
                var desc = data.overview;
                var cast = data.cast;
                var strmSrvc = data.streamingInfo;

                console.log("banner:", banner);
                console.log("Description:", desc);
                console.log("Cast:", cast);
                console.log("Streaming Services:", strmSrvc);
            })
        })
        .catch(err => {
            console.error(err);
        });
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
            alert("Error: Review not found");
        }
    });
};

// on click refresh homepage with default view
var navHome = document.querySelector("#home");
navHome.addEventListener("click", function() {
    alert("home clicked");  
});

 // on click refresh homepage, display only movies
var navMovies = document.querySelector("#movies");
navMovies.addEventListener("click", function() {
    alert("movies clicked"); 
});

// on click refresh homepage, display only tv shows
var navTvShows = document.querySelector("#tv-shows");
navTvShows.addEventListener("click", function() {
    alert("tv shows clicked");
});

// on click refresh page, display new and popular results
var navNewAndPopular = document.querySelector("#new-and-popular");
navNewAndPopular.addEventListener("click", function() {
    alert("new and popular clicked");
});
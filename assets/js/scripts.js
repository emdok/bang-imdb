const imdbApiKey = "k_8oixkc80";
const nytReviewsApiKey = "1CtMayWncOQbFJuoqvGVAcHGbcd644Hj";

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

getIMDBMedia("The Big Lebowski");

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
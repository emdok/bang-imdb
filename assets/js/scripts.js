var imdbApiKey = "k_8oixkc80";

var getIMDBMedia = function (title) {
    var imdbQueryUrl = "https://imdb-api.com/en/API/SearchAll/" + imdbApiKey + "/" + title;

    fetch(imdbQueryUrl).then(function (response) {
        if (response.ok) {
            response.json().then(function (data) {
                console.log("IMDB:", data);
                getStreamAvailability(data.results[0].id);
            });
        } else {
            alert("Error: Title not found");
        }
    });
};

getIMDBMedia("The Big Lebowski");

//Streaming Availability API
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
    })
})
.catch(err => {
	console.error(err);
});

}

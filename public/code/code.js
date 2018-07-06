 // Initialize Firebase
 var config = {
  apiKey: "AIzaSyBFolyg1FbHvFgQo71r_nypLHaAnBQq_3A",
  authDomain: "band-together-app.firebaseapp.com",
  databaseURL: "https://band-together-app.firebaseio.com",
  projectId: "band-together-app",
  storageBucket: "",
  messagingSenderId: "94818319032"
};

firebase.initializeApp(config);

$(document).ready(function() {
  console.log("in code")
  var database = firebase.database();
  var access_token = localStorage.getItem("token")

  var clearShows = function() {
    database.ref("searches").remove()
    database.ref("player").remove()

  }
  //is the searchBandsInTownEvents function necessary? -carter

  function searchBandsInTownEvents(events) {

    // Querying the bandsintown api for the selected artist, the ?app_id parameter is required, but can equal anything
    
    var queryURL = "https://rest.bandsintown.com/artists/" + artist + "/events?app_id=band_together";
    $.ajax({
      url: queryURL,
      method: "GET"
    }).done(function(response) {

      // Printing the entire object to console
      //console.log(response);

      // Constructing HTML containing the artist information
    });
  }

  var spotifySearch = function(inputArtist) {
    var spotQueryURL = "https://api.spotify.com/v1/search?q=" + inputArtist + "&type=artist&market=us&limit=1";
    console.log(spotQueryURL + "q1")
    console.log(access_token)

        // Here we run our AJAX call to the OpenWeatherMap API
        $.ajax({
          url: spotQueryURL,
          headers: {
            'Authorization': 'Bearer ' + access_token
          },
          method: "GET"
        })
          // We store all of the retrieved data inside of an object called "response"
          .then(function(response) {
            console.log("made it")
            // Log the queryURL
            bandID = response.artists.items[0].id;
            console.log(bandID + "band id")
            
            var spotQueryURL2 = "https://api.spotify.com/v1/artists/" + bandID + "/top-tracks?country=us";
            console.log(spotQueryURL2 + "q2")
            // Log the resulting object
            $.ajax({
                url: spotQueryURL2,
                headers: {
                  'Authorization': 'Bearer ' + access_token
                },
                method: "GET"
              })
                // We store all of the retrieved data inside of an object called "response"
                .then(function(response) {
          
                  // Log the queryURL
                  
          
                  // Log the resulting object
                  console.log(response.tracks[0].preview_url);

                  
                  playerURL = response.tracks[0].preview_url
                  console.log(playerURL + "here")
                  database.ref("player").set(playerURL)
                  database.ref("player").on("value", function(childSnapshot) {
                  var updatedPlayer = childSnapshot.val()
                  var video = $('<video />', {
                    id: 'video',
                    src: updatedPlayer,
                    type: 'video/mp4',
                    controls: true
                });
                $("#player-holder").empty()
                $("#player-holder").append(video)
              });
                
                  
                });
          });
  }


  function searchBandsInTown(artist) {

    // Querying the bandsintown api for the selected artist, the ?app_id parameter is required, but can equal anything
    var queryURL = "https://rest.bandsintown.com/artists/" + artist + "?app_id=band_together";
    $.ajax({
      url: queryURL,
      method: "GET"
    }).then(function(response) {

      // Printing the entire object to console

      // Constructing HTML containing the artist information
      

      //create object to push to firebase
      var recentSearch = {
        name: response.name,
        url: response.url,
        image: response.thumb_url,
        upcoming: response.upcoming_event_count
      };
      
      
      
      database.ref("searches").push(recentSearch);
      database.ref("current").update(recentSearch);

      database.ref("current").on("value", function(childSnapshot) {
        var currentArtist = Object.values(childSnapshot.val())
        var mainArtistDiv = $("<div class='bg-dark' id='main-artist-div'>")
        var mainArtistLink = $( ".main-artist-div" ).wrap( "<a href></a>" );

      

      var artistName = $("<h1>").text(currentArtist[1]);
      var artistURL = $("<a>").attr("href", currentArtist[3]).append(artistName);
      var artistImage = $("<img>").attr("src", currentArtist[0]);
      
      var upcomingEvents = $("<h2 id='main-img'>").text(currentArtist[2] + " upcoming events");
      
      var goToArtist = $("<a>").attr("href", currentArtist[3]).text("See Tour Dates");
      $("#artist-container").empty();
      $("#artist-container").append(mainArtistDiv);
      $(mainArtistDiv).append(artistURL, artistImage, goToArtist);
      $("#tour-date-holder").empty()
      $("#tour-date-holder").append(upcomingEvents)
          //console.log(childSnapshot.val()[0].name)
        });
      

      

      //Empty the contents of the artist-div, append the new artist content
      
      
      
      // Carter starting here
      if (response.upcoming_event_count > 0) {
          var newQueryURL = "https://rest.bandsintown.com/artists/" + artist + "/events?app_id=band_together";
          $.ajax({
              url: newQueryURL,
              method: "GET"
          }).then(function(newResponse){

              for (var i = 0; i < 5; i++){
                  
                  var eventDate = newResponse[i].datetime;
                  
                  eventDate = moment(eventDate).format("MMMM DD YYYY, h:mm a");
                  
                  var venue = newResponse[i].venue.name;
                  var dateVenue = {
                    dbVenue : venue,
                    dbDate : eventDate
                  }
                  console.log(newResponse)
                  
                  database.ref("current-dates").push(dateVenue)

                  
                  //console.log(newResponse[i].url)
                  database.ref("current-dates").on("value", function(childSnapshot) {
                    var currentDates = Object.values(childSnapshot.val())
                  

                  
                  });

                  var goToArtist = $("<a>").attr("href", response.url).text("See Tour Dates");

                  
                  var upcomingVenues = $("<a>").attr("href", newResponse[i].url).html("<h3>playing in " + newResponse[i].venue.city + " at the " + venue + " on " + eventDate);
                  

                  

                  $("#tour-date-holder").append(upcomingVenues);
                  var ticketStatus = $("<h4>").text("tickets are " + newResponse[i].offers[0].status)
                  $("#tour-date-holder").append(ticketStatus);
                    
                  


              }
          })
      }
    });
  }

  // ----------------------------- //
   // Event handler for user clicking the select-artist button
   $("#find-shows-top").on("click", function(event) {
    // Preventing the button from trying to submit the form
    event.preventDefault();
    // Storing the artist name
  
    
    var inputArtist = $("#artist-input-top").val().trim();
    $("#artist-input-top").val("")

    // Running the searchBandsInTown function (passing in the artist as an argument)
    searchBandsInTown(inputArtist);
    spotifySearch(inputArtist)
  });

  // Event handler for user clicking the select-artist button
  $("#find-shows").on("click", function(event) {
    // Preventing the button from trying to submit the form
    event.preventDefault();
    // Storing the artist name
  
    
    var inputArtist = $("#artist-input").val().trim();
    $("#artist-input").val("")

    // Running the searchBandsInTown function (passing in the artist as an argument)
    searchBandsInTown(inputArtist);
    spotifySearch(inputArtist)
  });

  $("#clear-shows").on("click", function(event) {
    clearShows()
  })

  database.ref("searches").on("value", function(childSnapshot) {
    childSnapshot.numChildren()
    if (childSnapshot.numChildren() > 3) {
      console.log(childSnapshot)
      //console.log(childSnapshot.val()[0].name)
    }

  //console.log(childSnapshot.val());
  console.log(Object.values(childSnapshot.val()).length)
  console.log(Object.values(childSnapshot.val())[0].name)
  //console.log(childSnapshot.val()[0].name)
  recentSearchArray = Object.values(childSnapshot.val())
  console.log(recentSearchArray[0].name + " array working")

  //console.log(Object.values(childSnapshot.val())[0].name)
  // if (recentSearchArray.length > 0){
  //   for (var i=recentSearchArray.length-1; i>(recentSearchArray.length-4); i--){
  //     console.log(recentSearchArray[i].name)

  //     var recentName = $("<h3>").text(recentSearchArray[i].name);
  //     var recentURL = $("<a>").attr("href", recentSearchArray[i].url).append(recentName);
  //     var recentImage = $("<img>").attr("src", recentSearchArray[i].image);
  //     var recentUpcoming =  $("<h2>").text(recentSearchArray[i].upcoming + " upcoming events");

  //     var recentSearchDiv = $("<div class='bg-dark' id='recent-search-div'>")
  //     $("#main-container").append(recentSearchDiv);
  //     $(recentSearchDiv).append(recentName, recentURL, recentImage, recentUpcoming);
  //   }

    if (recentSearchArray.length > 0){
      
      
      
      
      function avoidDuplicates(){
        var i=recentSearchArray.length-1;
        var bandA=recentSearchArray[i].name;
        var bandB;
        var bandC;
        //console.log(bandA+" band a")
        var recentName = $("<h3>").text(recentSearchArray[i].name);
        var recentURL = $("<a>").attr("href", recentSearchArray[i].url).append(recentName);
        var recentImage = $("<img>").attr("src", recentSearchArray[i].image);
        var recentUpcoming =  $("<h2>").text(recentSearchArray[i].upcoming + " upcoming events");
        var recentSearchDiv = $("<div class='bg-dark' id='recent-search-div'>")
        $("#search1").empty()
        $("#search1").append(recentSearchDiv);
        $(recentSearchDiv).append(recentName, recentURL, recentImage, recentUpcoming);
        for (var p=recentSearchArray.length-1; p>0; p--){
          bandB=recentSearchArray[p].name;
          if (bandA===bandB || bandB===undefined){
            //console.log(bandB + "band b progress")
          }else {
            //console.log(bandB+" band b");
            //a little messy with duplicating the code for each individual band - would probably be cleaner as a function but whatevs
            var recentName = $("<h3>").text(recentSearchArray[p].name);
            var recentURL = $("<a>").attr("href", recentSearchArray[p].url).append(recentName);
            var recentImage = $("<img>").attr("src", recentSearchArray[p].image);
            var recentUpcoming =  $("<h2>").text(recentSearchArray[p].upcoming + " upcoming events");
            var recentSearchDiv = $("<div class='bg-dark' id='recent-search-div'>")
            $("#search2").empty()
            $("#search2").append(recentSearchDiv);
            $(recentSearchDiv).append(recentName, recentURL, recentImage, recentUpcoming);
            
            //set the variable to 0 to kick out of the search
            p=0;
            
          }
        }
        for (var t=recentSearchArray.length-1; t>0; t--){
        
          bandC=recentSearchArray[t].name;
          
        
          if (bandC===bandB || bandC===bandA || bandC===undefined){
            //console.log(bandC + "band c progress")
          }
          else{
            //console.log(bandC+" band c");
            
            var recentName = $("<h3>").text(recentSearchArray[t].name);
            var recentURL = $("<a>").attr("href", recentSearchArray[t].url).append(recentName);
            var recentImage = $("<img>").attr("src", recentSearchArray[t].image);
            var recentUpcoming =  $("<h2>").text(recentSearchArray[t].upcoming + " upcoming events");
            var recentSearchDiv = $("<div class='bg-dark' id='recent-search-div'>")
            $("#search3").empty()
            $("#search3").append(recentSearchDiv);
            $(recentSearchDiv).append(recentName, recentURL, recentImage, recentUpcoming);
            t=0;
          }
        }  
      }
      avoidDuplicates();

    }











  });
});

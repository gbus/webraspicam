/*!
 * controls for 3bot camera viewer
 * uses ajax to control restful interface to servos
 * Date: 2014-10-14
 */


var webserver_address = location.host;

var y_channel = 11
var x_channel = 12
var step_val  = 30

var position_url  = 'http://' + webserver_address + '/servo/position'
var settings_url  = 'http://' + webserver_address + '/servo/config'
var neutral_url	  = 'http://' + webserver_address + '/servo/neutral'
var step_url	  = 'http://' + webserver_address + '/servo/step'
/*
function loadSettings (url, ch, slider_name) {
    var PageUrl = url + '/' + ch;
    var data;

    //Load the data in using jQuerys ajax call
    $.ajax({
        url:PageUrl,
        dataType:'json',
        async: false,
        success:function (data) {
            $(slider_name).slider({
                min: data.minp,
                max: data.maxp,
	        value: data.minp + (data.maxp-data.minp)/2
            });
	}
    });
}
*/

function loadRestfulData (url, ch, val) {
    var PageUrl = url + '/' + ch+'/' + val;
    //Set the content pane to a loading screen
    $('#content-pane').text('Changing status...');
    //Load the data in using jQuerys ajax call
    $.ajax({
        url:PageUrl,
        dataType:'json',
        success:function (data) {
            //Once we receive the data, set it to the content pane.
            $('#content-pane').text("Channel: "+data["channel"]+" Position: "+data["pos"]);
        }
    });
}


function resetPosition (url, ch, fieldupdate) {
    var PageUrl = url + '/' + ch;
    //Set the content pane to a loading screen
    $('#content-pane').text('Resetting camera position');
    //Load the data in using jQuerys ajax call
    $.ajax({
        url:PageUrl,
        dataType:'json',
        success:function (data) {
            //Once we receive the data, set it to the content pane.
            $('#content-pane').text("Channel: "+data["channel"]+" Position: "+data["pos"]);
            $(fieldupdate).text(data["pos"]);
        }
    });
}

// Get min,max values with REST calls
//loadSettings (settings_url, x_channel, '#xpos');
//loadSettings (settings_url, y_channel, '#ypos');


// Set neutral position
resetPosition (neutral_url, x_channel, '#xposVal');
resetPosition (neutral_url, y_channel, '#yposVal');



$('#X_camup').click(function() {
    $.ajax({
        url: step_url + '/' + x_channel +'/' + -step_val,
        success: function(data) {
            $('#xposVal').text(data["pos"]);
        }
    });

});

$('#X_camdown').click(function() {
    $.ajax({
        url: step_url + '/' + x_channel +'/' + step_val,
        success: function(data) {
            $('#xposVal').text(data["pos"]);
        }
    });

});


$('#Y_camleft').click(function() {
    $.ajax({
        url: step_url + '/' + y_channel +'/' + step_val,
        success: function(data) {
            $('#yposVal').text(data["pos"]);
        }
    });

});

$('#Y_camright').click(function() {
    $.ajax({
        url: step_url + '/' + y_channel +'/' + -step_val,
        success: function(data) {
            $('#yposVal').text(data["pos"]);
        }
    });

});

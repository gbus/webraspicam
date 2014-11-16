//
// Interface
//


var imgw = 2592;
var imgh = 1944;
var vidw = 1920;
var vidh = 1080;
var vfps = 25;	// video fps
var bfps = 25;	// boxed fps

$(document).ready(function () {
    $('img#mjpeg_dest').imgAreaSelect({
	autoHide: true,
        handles: true,
	disable: false,
        onSelectEnd: set_roi
    });
});


// Scan media directory for images and videos when the modal it shown 
$(document).ready(function () {
  $('#mediaModal').on('shown.bs.modal', function () {
    loadMediaInfo()
  });
});

$(function () {
	$("#btndownload").click(function(e){
		e.preventDefault();
		alert('Delete pressed');
		/*
		var selectedMedia = new Array();
		$('input[name="selmedia"]:checked').each(function() {
			selectedMedia.push(this.value);
		});
		$.post("/raspimjpeg/mediamgt", selectedMedia);
		*/
		      /*
      $.post('http://path/to/post', 
         $('#mediaForm').serialize(), 
         function(data, status, xhr){
           // do something here with response;
         });
      */
	});
});

function loadMediaInfo() {
	$.getJSON("/raspimjpeg/media", function (data) {
	     var imagelist = data.images;
	     var videolist = data.videos;

	     // Images and videos are sorted by date and time (field dt)	     
	     imagelist.sort(function(a,b){
	       return new Date(b.dt) - new Date(a.dt);
	     });
	     videolist.sort(function(a,b){
	       return new Date(b.dt) - new Date(a.dt);
	     }); 	     


	     // The html tables are generated
	     var imagehtml = '<table class="table table-hover">'     
	     $.each(imagelist, function(index, im) {
	        imagehtml = imagehtml + '<tr><td><input type="checkbox" id="selmedia" name="selmedia" value="'+im.fname+'"> <a href="'+im.fname+'" target="_blank"> '+im.dt+'</a></td><td align="right"><span class="label label-info">'+im.size+'</span></td></tr>'
	     });
	     imagehtml = imagehtml + '<div id="debugselmedia"></div>'
	     imagehtml = imagehtml+'</table>'
	     
	     var videohtml = '<table class="table table-hover">'
	     $.each(videolist, function(index, vi) {
	        videohtml = videohtml + '<tr><td><input type="checkbox" name="'+vi.id+'" value="'+vi.fname+'"> <a href="'+vi.fname+'" target="_blank"> '+vi.dt+'</a></td><td align="right"><span class="label label-info">'+vi.size+'</span></td></tr>'
	     });
	     videohtml = videohtml+'</table>'   
	     
	     // The tables are assigned to the respective tabs
	     $('#tabled-image-list').html(imagehtml)
	     $('#tabled-video-list').html(videohtml)
	});

}

viewerAlert = function() {}
viewerAlert.warning = function(alertType, alertContent) {
	$('#viewerNotifications').append('<div id="regionselAlert" class="alert alert-' + alertType + '"> ' + alertContent + ' </div>')

}


function set_preset(value) {

  document.getElementById("video_width").value = value.substr(0, 4);
  document.getElementById("video_height").value = value.substr(5, 4);
  document.getElementById("video_fps").value = value.substr(10, 2);
  document.getElementById("MP4Box_fps").value = value.substr(13, 2);
  document.getElementById("image_width").value = value.substr(16, 4);
  document.getElementById("image_height").value = value.substr(21, 4);
  send_cmd("px", value);

}


function set_res() {
  var imgw0 = imgw;
  var imgh0 = imgh;
  var vidw0 = vidw;
  var vidh0 = vidh;
  var vfps0 = vfps;
  var bfps0 = bfps;

  while(imgw0.length < 4) imgw0 = "0" + imgw0;
  while(imgh0.length < 4) imgh0 = "0" + imgh0;
  while(vidw0.length < 4) vidw0 = "0" + vidw0;
  while(vidh0.length < 4) vidh0 = "0" + vidh0;
  while(vfps0.length < 2) vfps0 = "0" + vfps0;
  while(bfps0.length < 2) bfps0 = "0" + bfps0;

  send_cmd("px", vidw0 + " " + vidh0 + " " + vfps0 + " " + bfps0 + " " + imgw0 + " " + imgh0);
}


// Video resolution control panel
$( document.body ).on( 'click', '#load_predefined_video li', function( event ) {
      var $target = $( event.currentTarget );
      var resolution = $target.text().split("x");
      document.getElementById("vwidth").value = resolution[0];
      document.getElementById("vheight").value = resolution[1];
//      alert( "Resolution set to : " + vidw + " width " + vidh + " height" );
      parent.$('#applyres_video').trigger('click');
      return false;
   });

// Video resolution submit
$( document.body ).on( 'click', '#applyres_video', function() {
	  vidw = document.getElementById("vwidth").value;
	  vidh = document.getElementById("vheight").value;
	  set_res();
   });



// Image resolution control panel
$( document.body ).on( 'click', '#load_predefined_image li', function( event ) {
      var $target = $( event.currentTarget );
      var resolution = $target.text().split("x");
      document.getElementById("iwidth").value = resolution[0];
      document.getElementById("iheight").value = resolution[1];
//      alert( "Resolution set to : " + vidw + " width " + vidh + " height" );
      parent.$('#applyres_image').trigger('click');
      return false;
   });

// Image resolution submit
$( document.body ).on( 'click', '#applyres_image', function() {
	  imgw = document.getElementById("iwidth").value;
	  imgh = document.getElementById("iheight").value;
	  set_res();
   });



// fps submit
$( document.body ).on( 'click', '#applyfps', function() {
	  vfps = document.getElementById("vfps").value;
	  bfps = document.getElementById("bvfps").value;
	  set_res();
   });



function set_ce() {
  
  while(document.getElementById("ce_u").value.length < 3) document.getElementById("ce_u").value = "0" + document.getElementById("ce_u").value;
  while(document.getElementById("ce_v").value.length < 3) document.getElementById("ce_v").value = "0" + document.getElementById("ce_v").value;
  
  send_cmd("ce", document.getElementById("ce_en").value + " " + document.getElementById("ce_u").value + " " + document.getElementById("ce_v").value);

}

function set_roi(img,selection) {
  if (!selection.width || !selection.height)
        return;
  // x,y,w,h rescaled on a 0-65535 range
  var xr = Math.round(selection.x1/img.clientWidth*65535);
  var yr = Math.round(selection.y1/img.clientHeight*65535);
  var wr = Math.round(selection.width/img.clientWidth*65535);
  var hr = Math.round(selection.height/img.clientHeight*65535);
  
  // 0 padded to 5 chars
  var xrstr = xr.toString();
  var yrstr = yr.toString();
  var wrstr = wr.toString();
  var hrstr = hr.toString();
  while(xrstr.length < 5) xrstr = "0" + xrstr;
  while(yrstr.length < 5) yrstr = "0" + yrstr;
  while(wrstr.length < 5) wrstr = "0" + wrstr;
  while(hrstr.length < 5) hrstr = "0" + hrstr;

  // Trigger an info alert that shows the selected range in pixels
  viewerAlert.warning('info', '<a href="#" class="close" data-dismiss="alert"><span class="glyphicon glyphicon-retweet"></a> <strong>Region defined</strong> ('+selection.x1+','+selection.y1+') to ('+selection.x2+','+selection.y2+').');

    $('img#mjpeg_dest').imgAreaSelect({	disable: true });

	$("#regionselAlert").bind('closed.bs.alert', function(){
        send_cmd("ri", "00000 00000 65535 65535" );
    	$('img#mjpeg_dest').imgAreaSelect({	disable: false });
    });

  send_cmd("ri", xrstr + " " + yrstr + " " + wrstr + " " + hrstr );
}


//
// Shutdown
//
function sys_shutdown() {
  ajax_status.open("GET", "cmd_func.php?cmd=shutdown", true);
  ajax_status.send();
}

function sys_reboot() {
  ajax_status.open("GET", "cmd_func.php?cmd=reboot", true);
  ajax_status.send();
}

//
// MJPEG
//
var mjpeg_img;
var halted = 0;

function reload_img () {
  if(!halted) mjpeg_img.src = "/camera/image?time=" + new Date().getTime();
  else setTimeout("reload_img()", 500);
}

function error_img () {
  setTimeout("mjpeg_img.src = '/camera/image?time=' + new Date().getTime();", 100);
}

//
// Ajax Status
//
var ajax_status;

if(window.XMLHttpRequest) {
  ajax_status = new XMLHttpRequest();
}
else {
  ajax_status = new ActiveXObject("Microsoft.XMLHTTP");
}


ajax_status.onreadystatechange = function() {
  if(ajax_status.readyState == 4 && ajax_status.status == 200) {

    if(ajax_status.responseText == "ready") {
      document.getElementById("video_button").disabled = false;
      document.getElementById("video_button").value = "record video start";
      document.getElementById("video_button").onclick = function() {send_cmd("ca", "1");};
      document.getElementById("image_button").disabled = false;
      document.getElementById("image_button").value = "record image";
      document.getElementById("image_button").onclick = function() {send_cmd("im", "");};
      document.getElementById("timelapse_button").disabled = false;
      document.getElementById("timelapse_button").value = "timelapse start";
      document.getElementById("timelapse_button").onclick = function() {send_cmd("tl", (document.getElementById("tl_interval").value*10));};
      document.getElementById("md_button").disabled = false;
      document.getElementById("md_button").value = "motion detection start";
      document.getElementById("md_button").onclick = function() {send_cmd("md", "1");};
      document.getElementById("halt_button").disabled = false;
      document.getElementById("halt_button").value = "stop camera";
      document.getElementById("halt_button").onclick = function() {send_cmd("ru", "0");};
      halted = 0;
    }
    else if(ajax_status.responseText == "md_ready") {
      document.getElementById("video_button").disabled = true;
      document.getElementById("video_button").value = "record video start";
      document.getElementById("video_button").onclick = function() {};
      document.getElementById("image_button").disabled = true;
      document.getElementById("image_button").value = "record image";
      document.getElementById("image_button").onclick = function() {};
      document.getElementById("timelapse_button").disabled = true;
      document.getElementById("timelapse_button").value = "timelapse start";
      document.getElementById("timelapse_button").onclick = function() {};
      document.getElementById("md_button").disabled = false;
      document.getElementById("md_button").value = "motion detection stop";
      document.getElementById("md_button").onclick = function() {send_cmd("md", "0");};
      document.getElementById("halt_button").disabled = true;
      document.getElementById("halt_button").value = "stop camera";
      document.getElementById("halt_button").onclick = function() {};
      halted = 0;
    }
    else if(ajax_status.responseText == "video") {
      document.getElementById("video_button").disabled = false;
      document.getElementById("video_button").value = "record video stop";
      document.getElementById("video_button").onclick = function() {send_cmd("ca", "0");};
      document.getElementById("image_button").disabled = true;
      document.getElementById("image_button").value = "record image";
      document.getElementById("image_button").onclick = function() {};
      document.getElementById("timelapse_button").disabled = true;
      document.getElementById("timelapse_button").value = "timelapse start";
      document.getElementById("timelapse_button").onclick = function() {};
      document.getElementById("md_button").disabled = true;
      document.getElementById("md_button").value = "motion detection start";
      document.getElementById("md_button").onclick = function() {};
      document.getElementById("halt_button").disabled = true;
      document.getElementById("halt_button").value = "stop camera";
      document.getElementById("halt_button").onclick = function() {};
    }
    else if(ajax_status.responseText == "timelapse") {
      document.getElementById("video_button").disabled = true;
      document.getElementById("video_button").value = "record video start";
      document.getElementById("video_button").onclick = function() {};
      document.getElementById("image_button").disabled = true;
      document.getElementById("image_button").value = "record image";
      document.getElementById("image_button").onclick = function() {};
      document.getElementById("timelapse_button").disabled = false;
      document.getElementById("timelapse_button").value = "timelapse stop";
      document.getElementById("timelapse_button").onclick = function() {send_cmd("tl", "0");};
      document.getElementById("md_button").disabled = true;
      document.getElementById("md_button").value = "motion detection start";
      document.getElementById("md_button").onclick = function() {};
      document.getElementById("halt_button").disabled = true;
      document.getElementById("halt_button").value = "stop camera";
      document.getElementById("halt_button").onclick = function() {};
    }
    else if(ajax_status.responseText == "md_video") {
      document.getElementById("video_button").disabled = true;
      document.getElementById("video_button").value = "record video start";
      document.getElementById("video_button").onclick = function() {};
      document.getElementById("image_button").disabled = true;
      document.getElementById("image_button").value = "record image";
      document.getElementById("image_button").onclick = function() {};
      document.getElementById("timelapse_button").disabled = true;
      document.getElementById("timelapse_button").value = "timelapse start";
      document.getElementById("timelapse_button").onclick = function() {};
      document.getElementById("md_button").disabled = true;
      document.getElementById("md_button").value = "recording video...";
      document.getElementById("md_button").onclick = function() {};
      document.getElementById("halt_button").disabled = true;
      document.getElementById("halt_button").value = "stop camera";
      document.getElementById("halt_button").onclick = function() {};
    }
    else if(ajax_status.responseText == "image") {
      document.getElementById("video_button").disabled = true;
      document.getElementById("video_button").value = "record video start";
      document.getElementById("video_button").onclick = function() {};
      document.getElementById("image_button").disabled = true;
      document.getElementById("image_button").value = "recording image";
      document.getElementById("image_button").onclick = function() {};
      document.getElementById("timelapse_button").disabled = true;
      document.getElementById("timelapse_button").value = "timelapse start";
      document.getElementById("timelapse_button").onclick = function() {};
      document.getElementById("md_button").disabled = true;
      document.getElementById("md_button").value = "motion detection start";
      document.getElementById("md_button").onclick = function() {};
      document.getElementById("halt_button").disabled = true;
      document.getElementById("halt_button").value = "stop camera";
      document.getElementById("halt_button").onclick = function() {};
    }
    else if(ajax_status.responseText == "boxing") {
      document.getElementById("video_button").disabled = true;
      document.getElementById("video_button").value = "video processing...";
      document.getElementById("video_button").onclick = function() {};
      document.getElementById("image_button").disabled = true;
      document.getElementById("image_button").value = "record image";
      document.getElementById("image_button").onclick = function() {};
      document.getElementById("timelapse_button").disabled = true;
      document.getElementById("timelapse_button").value = "timelapse start";
      document.getElementById("timelapse_button").onclick = function() {};
      document.getElementById("md_button").disabled = true;
      document.getElementById("md_button").value = "motion detection start";
      document.getElementById("md_button").onclick = function() {};
      document.getElementById("halt_button").disabled = true;
      document.getElementById("halt_button").value = "stop camera";
      document.getElementById("halt_button").onclick = function() {};
    }
    else if(ajax_status.responseText == "md_boxing") {
      document.getElementById("video_button").disabled = true;
      document.getElementById("video_button").value = "record video start";
      document.getElementById("video_button").onclick = function() {};
      document.getElementById("image_button").disabled = true;
      document.getElementById("image_button").value = "record image";
      document.getElementById("image_button").onclick = function() {};
      document.getElementById("timelapse_button").disabled = true;
      document.getElementById("timelapse_button").value = "timelapse start";
      document.getElementById("timelapse_button").onclick = function() {};
      document.getElementById("md_button").disabled = true;
      document.getElementById("md_button").value = "video processing...";
      document.getElementById("md_button").onclick = function() {};
      document.getElementById("halt_button").disabled = true;
      document.getElementById("halt_button").value = "stop camera";
      document.getElementById("halt_button").onclick = function() {};
    }
    else if(ajax_status.responseText == "halted") {
      document.getElementById("video_button").disabled = true;
      document.getElementById("video_button").value = "record video start";
      document.getElementById("video_button").onclick = function() {};
      document.getElementById("image_button").disabled = true;
      document.getElementById("image_button").value = "record image";
      document.getElementById("image_button").onclick = function() {};
      document.getElementById("timelapse_button").disabled = true;
      document.getElementById("timelapse_button").value = "timelapse start";
      document.getElementById("timelapse_button").onclick = function() {};
      document.getElementById("md_button").disabled = true;
      document.getElementById("md_button").value = "motion detection start";
      document.getElementById("md_button").onclick = function() {};
      document.getElementById("halt_button").disabled = false;
      document.getElementById("halt_button").value = "start camera";
      document.getElementById("halt_button").onclick = function() {send_cmd("ru", "1");};
      halted = 1;
    }
    else if(ajax_status.responseText.substr(0,5) == "Error") alert("Error in RaspiMJPEG: " + ajax_status.responseText.substr(7) + "\nRestart RaspiMJPEG (./RPi_Cam_Web_Interface_Installer.sh start) or the whole RPi.");
    
    reload_ajax(ajax_status.responseText);

  }
}

function reload_ajax (last) {
  ajax_status.open("GET","/raspimjpeg/status/" + last,true);
  ajax_status.send();
}



//
// Ajax Commands
//
var ajax_cmd;

if(window.XMLHttpRequest) {
  ajax_cmd = new XMLHttpRequest();
}
else {
  ajax_cmd = new ActiveXObject("Microsoft.XMLHTTP");
}

function send_cmd (cmd, value) {
  ajax_cmd.open("GET","raspimjpeg/" + cmd + "/" + value,true);
  ajax_cmd.send();

}

//
// Init
//
function init() {

  // mjpeg
  mjpeg_img = document.getElementById("mjpeg_dest");
  mjpeg_img.onload = reload_img;
  mjpeg_img.onerror = error_img;
  reload_img();
  // status
  reload_ajax("");

}

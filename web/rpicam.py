import os
import sys
import web
import json
from shutil import move
import tarfile
from datetime import datetime

c_path = os.path.split(os.path.dirname(sys.argv[0]))[0]

if c_path:
    if c_path.startswith('/'):
        root_project_path = c_path
    else:
        root_project_path = os.path.join(os.getcwd(), c_path)
else:
    root_project_path = os.path.split(os.getcwd())[0]
    
sys.path = [os.path.join(root_project_path, 'lib')] + sys.path

#import inspect
#currentdir = os.path.dirname(os.path.abspath(inspect.getfile(inspect.currentframe())))
#parentdir = os.path.dirname(currentdir)
#os.sys.path.insert(0,parentdir) 


from servo import Servo
from rpicontrol import *
from mediascan import getvideoinfo,getimageinfo

# jpeg name written in /dev/shm/mjpeg by raspimjpeg
raspicam_path = '/dev/shm/mjpeg'
raspicam_filename = 'cam.jpg'
raspicam_status_file = "/home/pi/webraspicam/web/static/raspicam/status_mjpeg"
status_check_sec = 3
raspififo = "/var/run/raspimjpeg/FIFO"


media_path	= "static/raspicam/media"
image_subdir	= "images"
video_subdir	= "videos"
waste_subdir	= "wastebasket"
image_path	= "%s/%s" % (media_path, image_subdir)
video_path	= "%s/%s" % (media_path, video_subdir)
waste_path	= "%s/%s" % (media_path, waste_subdir)



render = web.template.render('templates/')

urls = (
  # Several test interfaces (some of them will be removed at some point)
  '/', 'index',

  # Servo controls
  '/servo/neutral/(.*)', 'Reset',
  '/servo/position/(.*)/(.*)', 'Position',
  '/servo/step/(.*)/(.*)', 'Step',
  '/servo/minposition/(.*)', 'SetMin',
  '/servo/maxposition/(.*)', 'SetMax',
  '/servo/config/(.*)', 'GetConf',

  # raspimjpeg controls
  '/raspimjpeg/status/(.*)', 'RaspicamStatus',
  '/raspimjpeg/(.*)/(.*)', 'RaspicamCmd',
  '/raspimjpeg/media', 'RaspicamMedia',
  '/raspimjpeg/mediamgt', 'RaspicamMediaManagement',


  # Camera jpeg streaming
  '/camera/image', 'raspiimage',
)


# Manage multiple servo instance (one for pan, one for tilt)
servoList = dict()
def servoChooser(ch):
	channel = int(ch)
	if channel not in servoList:
		servoList[channel] = Servo(channel)
	return servoList[channel]



# WebPy classes referenced by the URLs
class Reset:
	def GET(self, channel):
		s = servoChooser(channel)
		s.set_channel( int(channel) )
		ret = s.reset_position()
		web.header('Content-Type', 'application/json')
		return json.dumps( {'pos': ret, 'channel': channel} ) 
    	
class Position:
	def GET(self, channel, pos):
		s = servoChooser(channel)
		s.set_channel( int(channel) )
		ret = s.set_position( int(pos) )
		web.header('Content-Type', 'application/json')
		return json.dumps( {'pos': ret, 'channel': channel} )

class Step:
	def GET(self, channel, step):
		s = servoChooser(channel)
		s.set_channel( int(channel) )
		ret = s.step_position( int(step) )
		web.header('Content-Type', 'application/json')
		return json.dumps( {'pos': ret, 'channel': channel} )
    
class SetMin:
	def GET(self, channel):
		s = servoChooser(channel)
		s.set_channel( int(channel) )
		ret = s.set_position( s.min_pos )
		web.header('Content-Type', 'application/json')
		return json.dumps( {'pos': ret, 'channel': channel} )
    
    
class SetMax:
	def GET(self, channel):
		s = servoChooser(channel)
		s.set_channel( int(channel) )
		ret = s.set_position( s.max_pos )
		web.header('Content-Type', 'application/json')
		return json.dumps( {'pos': ret, 'channel': channel} )

class GetConf:
	def GET(self, channel):
		s = servoChooser(channel)
		s.set_channel( int(channel) )
		ret = s.get_servo_conf()
		web.header('Content-Type', 'application/json')
		return json.dumps( ret )

class index:
    def GET(self):
		return render.index()

class raspiimage:
    def GET(self):
        web.header("Content-Type", "images/jpeg")
        return open('%s/%s'%(raspicam_path,raspicam_filename),"rb").read()


class RaspicamStatus:
	def GET(self, last):
		return raspimjpeg_status(raspicam_status_file, last, status_check_sec)

class RaspicamCmd:
	def GET(self, cmd, value=''):
		return raspimjpeg_cmd(raspififo, cmd, value)

class RaspicamMedia:
    def GET(self):
        allmedia = {'videos': getvideoinfo(video_path),'images': getimageinfo(image_path)}
        web.header('Content-Type', 'application/json')
        return json.dumps(allmedia)

class RaspicamMediaManagement:
	def POST(self):
		post_data = web.input(name=[])
		if post_data:
			for entry in post_data:
				move (waste_path, entry.fname)

class RaspicamMediaDownload:
	def POST(self):
		post_data = web.input(name=[])
		if post_data:
			tarfilename = "/tmp/media_%s.tar"%datetime.now().isoformat('_')
			tar = tarfile.open(tarfilename, "w")
			for entry in post_data:
			    tar.add(entry, recursive=False)
			tar.close()
			return tarfilename


app = web.application(urls, globals())

if __name__ == "__main__": 
    app.run()

application = app.wsgifunc()

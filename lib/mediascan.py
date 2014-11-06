import time
from os import path
from glob import glob
from humansize import approximate_size


def getvideoinfo(video_path):
	videos = []
	video_files = glob('%s/video_*.mp4'%video_path)

	for v_file in video_files:
		v_file_name	= path.basename(v_file)
		v_file_id	= v_file_name.split('.')[0]	# Remove path and extension
		v_file_date	= v_file_id.split('_')[2]
		v_file_time	= v_file_id.split('_')[3]
		videos.append({'id': v_file_id, 'size': approximate_size(path.getsize(v_file), False), 'date': v_file_date, 'time': v_file_time, 'fname': v_file_name})
	return videos


def getimageinfo(image_path):
	images = []
	image_files = glob('%s/image_*.jpg'%image_path)

	for i_file in image_files:
		i_file_name	= path.basename(i_file)
		i_file_id	= i_file_name.split('.')[0]	# Remove path and extension
		i_file_date	= i_file_id.split('_')[2]
		i_file_time	= i_file_id.split('_')[3]
		images.append({'id': i_file_id, 'size': approximate_size(path.getsize(i_file), False), 'date': i_file_date, 'time': i_file_time, 'fname': i_file_name})
	return images



if __name__ == '__main__':
	media_path	= "../web/static/raspicam/media"
	image_subdir	= "images"
	video_subdir	= "videos"
	image_path	= "%s/%s" % (media_path, image_subdir)
	video_path	= "%s/%s" % (media_path, video_subdir)
	url_media_path	= "static/raspicam/media"


	videos = getvideoinfo(video_path)

	print "<table class=\"table table-hover\">"

	for v in videos:
		print "<tr><td><a href=\"%s/%s/%s\">%s</a></td><td><span class=\"label label-info\">%s</span></td></tr>" % (url_media_path, video_subdir, v['fname'], v['id'], v['size'])

	print "</table>"



	print "<table class=\"table table-hover\">"
	images = getimageinfo(image_path)
	for i in images:
		print "<tr><td><a href=\"%s/%s/%s\">%s</a></td><td><span class=\"label label-info\">%s</span></td></tr>" % (url_media_path, image_subdir, i['fname'], i['id'], i['size'])

	print "</table>"



	allmedia = {'videos': getvideoinfo(video_path),'images': getimageinfo(image_path)}

	print allmedia


import time




# Compare the last status reqested in the url with the current status from a file
# The file raspicam_status_file is updated by raspimjpeg as set in /etc/raspimpeg
def raspimjpeg_status(raspicam_status_file, last, check_timeout):
	period_check = .1	# Check every 100ms
	sf = open (raspicam_status_file, 'r')
	n = int(check_timeout/period_check)

	i=0
	while i<n:
		sf.seek(0)
		current = sf.read()
		if (current != last):
			break
		time.sleep(period_check)
		i+=1
	return current



# Dispatch commands to raspimjpeg FIFO
def raspimjpeg_cmd(raspififo, cmd, value):
	f = open (raspififo, 'w')

	if value != '':
		f.write("%s %s" % (cmd, value))
	else:
		f.write(cmd)
	return 0

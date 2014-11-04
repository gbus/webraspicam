# Servo library for Adafruit 16-Channel 12-bit PWM/Servo Driver
# It abstracts some basic functionalities

from libpwm.Adafruit_PWM_Servo_Driver import PWM
from servo_config import channel_config



class Servo:
	freq	= 60
	p	= None

	def __init__(self, ch=0):
		self.min_pos	= channel_config[ch]['minp']
		self.max_pos	= channel_config[ch]['maxp']
		self.pos	= self.get_neutral_pos()
		self.channel	= ch
		self.p		= PWM()
		self.p.setPWMFreq( self.freq )	
		
#	def __init__( self, ch=0, minp=200, maxp=500 ):
#		self.min_pos		= minp
#		self.max_pos		= maxp
#		self.pos		= minp
#		self.channel		= ch
#		self.reset_position()

	def reset_position(self):
		ret = self.set_position(self.get_neutral_pos())
		if ret < 0:
			return -1
		return ret
		
	# Set a given value (position) for the servo 
	def set_position( self, position ):
		self.pos = position
		if position < self.min_pos:
			self.pos = self.min_pos
		elif position > self.max_pos:
			self.pos = self.max_pos
                print "New value set %d range(%d-%d)" % (self.pos, self.min_pos, self.max_pos)
		return self.p.setPWM(self.channel, 0, self.pos)
	
	# Set channel to use and load its settings
	def set_channel( self, ch ):
		self.channel = ch
		self.min_pos	= channel_config[self.channel]['minp']
		self.max_pos	= channel_config[self.channel]['maxp']


	# Increase number of steps the current position
	def step_position( self, steps ):
		self.pos += steps
		return self.set_position(self.pos)

	# Load servo config
	def get_servo_conf( self ):
		return channel_config[self.channel]

	# Get current position
	def get_current_pos( self ):
		return self.pos

	# Get neutral position
	def get_neutral_pos( self ):
		return self.min_pos + ((self.max_pos - self.min_pos) / 2)
		
		
		


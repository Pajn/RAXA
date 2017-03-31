export const FIRMWARE_BLOCK_SIZE = 16
export const BROADCAST_ADDRESS = 255
export const NODE_SENSOR_ID = 255

/**
 * Sent by a node when they present attached sensors. This is usually done in setup() at startup.
 */
export const C_PRESENTATION = 0
/**
 * This message is sent from or to a sensor when a sensor value should be updated
 */
export const C_SET = 1
/**
 * Requests a variable value (usually from an actuator destined for controller).
 */
export const C_REQ = 2
/**
 * This is a special internal message. See table below for the details
 */
export const C_INTERNAL = 3
/**
 * Used for OTA firmware updates
 */
export const C_STREAM = 4

/**
 * Temperature
 *
 * Used By:
 *  S_TEMP, S_HEATER, S_HVAC, S_WATER_QUALITY
 */
export const V_TEMP = 0
/**
 * Humidity
 *
 * Used By:
 *  S_HUM
 */
export const V_HUM = 1
/**
 * Binary status. 0=off 1=on
 *
 * Used By:
 *  S_BINARY, S_DIMMER, S_SPRINKLER, S_HVAC, S_HEATER, S_WATER_QUALITY
 */
export const V_STATUS = 2
/**
 * Percentage value. 0-100 (%)
 *
 * Used By:
 *  S_DIMMER, S_COVER
 */
export const V_PERCENTAGE = 3
/**
 * Atmospheric Pressure
 *
 * Used By:
 *  S_BARO
 */
export const V_PRESSURE = 4
/**
 * Whether forecast. One of "stable", "sunny", "cloudy", "unstable", "thunderstorm" or "unknown"
 *
 * Used By:
 *  S_BARO
 */
export const V_FORECAST = 5
/**
 * Amount of rain
 *
 * Used By:
 *  S_RAIN
 */
export const V_RAIN = 6
/**
 * Rate of rain
 *
 * Used By:
 *  S_RAIN
 */
export const V_RAINRATE = 7
/**
 * Windspeed
 *
 * Used By:
 *  S_WIND
 */
export const V_WIND = 8
/**
 * Gust
 *
 * Used By:
 *  S_WIND
 */
export const V_GUST = 9
/**
 * Wind direction 0-360 (degrees)
 *
 * Used By:
 *  S_WIND
 */
export const V_DIRECTION = 10
/**
 * UV light level
 *
 * Used By:
 *  S_UV
 */
export const V_UV = 11
/**
 * Weight (for scales etc)
 *
 * Used By:
 *  S_WEIGHT
 */
export const V_WEIGHT = 12
/**
 * Distance
 *
 * Used By:
 *  S_DISTANCE
 */
export const V_DISTANCE = 13
/**
 * Impedance value
 *
 * Used By:
 *  S_MULTIMETER, S_WEIGHT
 */
export const V_IMPEDANCE = 14
/**
 * Armed status of a security sensor.
 *
 * 1=Armed, 0=Bypassed
 *
 * Used By:
 *  S_DOOR, S_MOTION, S_SMOKE, S_SPRINKLER, S_WATER_LEAK, S_SOUND, S_VIBRATION, S_MOISTURE
 */
export const V_ARMED = 15
/**
 * Tripped status of a security sensor. 1=Tripped, 0=Untripped
 *
 * Used By:
 *  S_DOOR, S_MOTION, S_SMOKE, S_SPRINKLER, S_WATER_LEAK, S_SOUND, S_VIBRATION, S_MOISTURE
 */
export const V_TRIPPED = 16
/**
 * Watt value for power meters
 *
 * Used By:
 *  S_POWER, S_BINARY, S_DIMMER, S_RGB_LIGHT, S_RGBW_LIGHT
 */
export const V_WATT = 17
/**
 * Accumulated number of KWH for a power meter
 *
 * Used By:
 *  S_POWER
 */
export const V_KWH = 18
/**
 * Turn on a scene
 *
 * Used By:
 *  S_SCENE_CONTROLLER
 */
export const V_SCENE_ON = 19
/**
 * Turn of a scene
 *
 * Used By:
 *  S_SCENE_CONTROLLER
 */
export const V_SCENE_OFF = 20
/**
 * Mode of header. One of "Off", "HeatOn", "CoolOn", or "AutoChangeOver"
 *
 * Used By:
 *  S_HVAC, S_HEATER
 */
export const V_HVAC_FLOW_STATE = 21
/**
 * HVAC/Heater fan speed ("Min", "Normal", "Max", "Auto")
 *
 * Used By:
 *  S_HVAC, S_HEATER
 */
export const V_HVAC_SPEED = 22
/**
 * Uncalibrated light level. 0-100%. Use V_LEVEL for light level in lux.
 *
 * Used By:
 *  S_LIGHT_LEVEL
 */
export const V_LIGHT_LEVEL = 23
/**
 * Custom value 	Any device
 */
export const V_VAR1 = 24
/**
 * Custom value 	Any device
 */
export const V_VAR2 = 25
/**
 * Custom value 	Any device
 */
export const V_VAR3 = 26
/**
 * Custom value 	Any device
 */
export const V_VAR4 = 27
/**
 * Custom value 	Any device
 */
export const V_VAR5 = 28
/**
 * Window covering. Up.
 *
 * Used By:
 *  S_COVER
 */
export const V_UP = 29
/**
 * Window covering. Down.
 *
 * Used By:
 *  S_COVER
 */
export const V_DOWN = 30
/**
 * Window covering. Stop.
 *
 * Used By:
 *  S_COVER
 */
export const V_STOP = 31
/**
 * Send out an IR-command
 *
 * Used By:
 *  S_IR
 */
export const V_IR_SEND = 32
/**
 * This message contains a received IR-command
 *
 * Used By:
 *  S_IR
 */
export const V_IR_RECEIVE = 33
/**
 * Flow of water (in meter)
 *
 * Used By:
 *  S_WATER
 */
export const V_FLOW = 34
/**
 * Water volume
 *
 * Used By:
 *  S_WATER
 */
export const V_VOLUME = 35
/**
 * Set or get lock status. 1=Locked, 0=Unlocked
 *
 * Used By:
 *  S_LOCK
 */
export const V_LOCK_STATUS = 36
/**
 * Used for sending level-value
 *
 * Used By:
 *  S_DUST, S_AIR_QUALITY, S_SOUND (dB), S_VIBRATION (hz), S_LIGHT_LEVEL (lux)
 */
export const V_LEVEL = 37
/**
 * Voltage level
 *
 * Used By:
 *  S_MULTIMETER
 */
export const V_VOLTAGE = 38
/**
 * Current level
 *
 * Used By:
 *  S_MULTIMETER
 */
export const V_CURRENT = 39
/**
 * RGB value transmitted as ASCII hex string (I.e "ff0000" for red)
 *
 * Used By:
 *  S_RGB_LIGHT, S_COLOR_SENSOR
 */
export const V_RGB = 40
/**
 * RGBW value transmitted as ASCII hex string (I.e "ff0000ff" for red + full white)
 *
 * Used By:
 *  S_RGBW_LIGHT
 */
export const V_RGBW = 41
/**
 * Optional unique sensor id (e.g. OneWire DS1820b ids)
 *
 * Used By:
 *  S_TEMP
 */
export const V_ID = 42
/**
 * Allows sensors to send in a string representing the unit prefix to be displayed in GUI. This is not parsed by controller! E.g. cm, m, km, inch.
 *
 * Used By:
 *  S_DISTANCE, S_DUST, S_AIR_QUALITY
 */
export const V_UNIT_PREFIX = 43
/**
 * HVAC cold setpoint
 *
 * Used By:
 *  S_HVAC
 */
export const V_HVAC_SETPOINT_COOL = 44
/**
 * HVAC/Heater setpoint
 *
 * Used By:
 *  S_HVAC, S_HEATER
 */
export const V_HVAC_SETPOINT_HEAT = 45
/**
 * Flow mode for HVAC ("Auto", "ContinuousOn", "PeriodicOn")
 *
 * Used By:
 *  S_HVAC
 */
export const V_HVAC_FLOW_MODE = 46
/**
 * Text message to display on LCD or controller device
 *
 * Used By:
 *  S_INFO
 */
export const V_TEXT = 47
/**
 * Custom messages used for controller/inter node specific commands, preferably using S_CUSTOM device type.
 *
 * Used By:
 *  S_CUSTOM
 */
export const V_CUSTOM = 48
/**
 * GPS position and altitude. Payload: latitude;longitude;altitude(m). E.g. "55.722526;13.017972;18"
 *
 * Used By:
 *  S_GPS
 */
export const V_POSITION = 49
/**
 * Record IR codes S_IR for playback
 *
 * Used By:
 *  S_IR
 */
export const V_IR_RECORD = 50
/**
 * Water PH
 *
 * Used By:
 *  S_WATER_QUALITY
 */
export const V_PH = 51
/**
 * Water ORP : redox potential in mV
 *
 * Used By:
 *  S_WATER_QUALITY
 */
export const V_ORP = 52
/**
 * Water electric conductivity μS/cm (microSiemens/cm)
 *
 * Used By:
 *  S_WATER_QUALITY
 */
export const V_EC = 53
/**
 * Reactive power: volt-ampere reactive (var)
 *
 * Used By:
 *  S_POWER
 */
export const V_VAR = 54
/**
 * Apparent power: volt-ampere (VA)
 *
 * Used By:
 *  S_POWER
 */
export const V_VA = 55
/**
 * Ratio of real power to apparent power: floating point value in the range [-1,..,1]
 *
 * Used By:
 *  S_POWER
 */
export const V_POWER_FACTOR = 56

/**
 * Use this to report the battery level (in percent 0-100).
 */
export const I_BATTERY_LEVEL = 0
/**
 * Sensors can request the current time from the Controller using this message. The time will be reported as the seconds since 1970
 */
export const I_TIME = 1
/**
 * Used to request gateway version from controller.
 */
export const I_VERSION = 2
/**
 * Use this to request a unique node id from the controller.
 */
export const I_ID_REQUEST = 3
/**
 * Id response back to node. Payload contains node id.
 */
export const I_ID_RESPONSE = 4
/**
 * Start/stop inclusion mode of the Controller (1=start, 0=stop).
 */
export const I_INCLUSION_MODE = 5
/**
 * Config request from node. Reply with (M)etric or (I)mperal back to sensor.
 */
export const I_CONFIG = 6
/**
 * When a sensor starts up, it broadcast a search request to all neighbor nodes. They reply with a I_FIND_PARENT_RESPONSE.
 */
export const I_FIND_PARENT = 7
/**
 * Reply message type to I_FIND_PARENT request.
 */
export const I_FIND_PARENT_RESPONSE = 8
/**
 * Sent by the gateway to the Controller to trace-log a message
 */
export const I_LOG_MESSAGE = 9
/**
 * A message that can be used to transfer child sensors (from EEPROM routing table) of a repeating node.
 */
export const I_CHILDREN = 10
/**
 * Optional sketch name that can be used to identify sensor in the Controller GUI
 */
export const I_SKETCH_NAME = 11
/**
 * Optional sketch version that can be reported to keep track of the version of sensor in the Controller GUI.
 */
export const I_SKETCH_VERSION = 12
/**
 * Used by OTA firmware updates. Request for node to reboot.
 */
export const I_REBOOT = 13
/**
 * Send by gateway to controller when startup is complete.
 */
export const I_GATEWAY_READY = 14
/**
 * Provides signing related preferences (first byte is preference version).
 */
export const I_SIGNING_PRESENTATION = 15
/**
 * Used between sensors when requesting nonce.
 */
export const I_NONCE_REQUEST = 16
/**
 * Used between sensors for nonce response.
 */
export const I_NONCE_RESPONSE = 17
/**
 * Heartbeat request
 */
export const I_HEARTBEAT_REQUEST = 18
/**
 * Presentation message
 */
export const I_PRESENTATION = 19
/**
 * Discover request
 */
export const I_DISCOVER_REQUEST = 20
/**
 * Discover response
 */
export const I_DISCOVER_RESPONSE = 21
/**
 * Heartbeat response
 */
export const I_HEARTBEAT_RESPONSE = 22
/**
 * Node is locked (reason in string-payload)
 */
export const I_LOCKED = 23
/**
 * Ping sent to node, payload incremental hop counter
 */
export const I_PING = 24
/**
 * In return to ping, sent back to sender, payload incremental hop counter
 */
export const I_PONG = 25
/**
 * Register request to GW
 */
export const I_REGISTRATION_REQUEST = 26
/**
 * Register response from GW
 */
export const I_REGISTRATION_RESPONSE = 27
/**
 * Debug message
 */
export const I_DEBUG = 28

/**
 * Door and window sensors
 *
 * Uses:
 *  V_TRIPPED, V_ARMED
 */
export const S_DOOR = 0
/**
 * Motion sensors
 *
 * Uses:
 *  V_TRIPPED, V_ARMED
 */
export const S_MOTION = 1
/**
 * Smoke sensor
 *
 * Uses:
 *  V_TRIPPED, V_ARMED
 */
export const S_SMOKE = 2
/**
 * Binary device (on/off)
 *
 * Uses:
 *  V_STATUS, V_WATT
 */
export const S_BINARY = 3
/**
 * Dimmable device of some kind
 *
 * Uses:
 *  V_STATUS (on/off), V_PERCENTAGE (dimmer level 0-100), V_WATT
 */
export const S_DIMMER = 4
/**
 * Window covers or shades
 *
 * Uses:
 *  V_UP, V_DOWN, V_STOP, V_PERCENTAGE
 */
export const S_COVER = 5
/**
 * Temperature sensor
 *
 * Uses:
 *  V_TEMP, V_ID
 */
export const S_TEMP = 6
/**
 * Humidity sensor
 *
 * Uses:
 *  V_HUM
 */
export const S_HUM = 7
/**
 * Barometer sensor (Pressure)
 *
 * Uses:
 *  V_PRESSURE, V_FORECAST
 */
export const S_BARO = 8
/**
 * Wind sensor
 *
 * Uses:
 *  V_WIND, V_GUST, V_DIRECTION
 */
export const S_WIND = 9
/**
 * Rain sensor
 *
 * Uses:
 *  V_RAIN, V_RAINRATE
 */
export const S_RAIN = 10
/**
 * UV sensor
 *
 * Uses:
 *  V_UV
 */
export const S_UV = 11
/**
 * Weight sensor for scales etc.
 *
 * Uses:
 *  V_WEIGHT, V_IMPEDANCE
 */
export const S_WEIGHT = 12
/**
 * Power measuring device, like power meters
 *
 * Uses:
 *  V_WATT, V_KWH, V_VAR, V_VA, V_POWER_FACTOR
 */
export const S_POWER = 13
/**
 * Heater device
 *
 * Uses:
 *  V_HVAC_SETPOINT_HEAT, V_HVAC_FLOW_STATE, V_TEMP, V_STATUS
 */
export const S_HEATER = 14
/**
 * Distance sensor
 *
 * Uses:
 *  V_DISTANCE, V_UNIT_PREFIX
 */
export const S_DISTANCE = 15
/**
 * Light sensor
 *
 * Uses:
 *  V_LIGHT_LEVEL (uncalibrated percentage), V_LEVEL (light level in lux)
 */
export const S_LIGHT_LEVEL = 16
/**
 * Arduino node device
 */
export const S_ARDUINO_NODE = 17
/**
 * Arduino repeating node device
 */
export const S_ARDUINO_REPEATER_NODE = 18
/**
 * Lock device
 *
 * Uses:
 *  V_LOCK_STATUS
 */
export const S_LOCK = 19
/**
 * Ir sender/receiver device
 *
 * Uses:
 *  V_IR_SEND, V_IR_RECEIVE, V_IR_RECORD
 */
export const S_IR = 20
/**
 * Water meter
 *
 * Uses:
 *  V_FLOW, V_VOLUME
 */
export const S_WATER = 21
/**
 * Air quality sensor e.g. MQ-2
 *
 * Uses:
 *  V_LEVEL, V_UNIT_PREFIX
 */
export const S_AIR_QUALITY = 22
/**
 * Use this for custom sensors where no other fits.
 */
export const S_CUSTOM = 23
/**
 * Dust level sensor
 *
 * Uses:
 *  V_LEVEL, V_UNIT_PREFIX
 */
export const S_DUST = 24
/**
 * Scene controller device
 *
 * Uses:
 *  V_SCENE_ON, V_SCENE_OFF
 */
export const S_SCENE_CONTROLLER = 25
/**
 * RGB light
 *
 * Uses:
 *  V_RGB, V_WATT
 */
export const S_RGB_LIGHT = 26
/**
 * RGBW light (with separate white component)
 *
 * Uses:
 *  V_RGBW, V_WATT
 */
export const S_RGBW_LIGHT = 27
/**
 * Color sensor
 *
 * Uses:
 *  V_RGB
 */
export const S_COLOR_SENSOR = 28
/**
 * Thermostat/HVAC device
 *
 * Uses:
 *  V_STATUS, V_TEMP, V_HVAC_SETPOINT_HEAT, V_HVAC_SETPOINT_COOL, V_HVAC_FLOW_STATE, V_HVAC_FLOW_MODE, V_HVAC_SPEED
 */
export const S_HVAC = 29
/**
 * Multimeter device
 *
 * Uses:
 *  V_VOLTAGE, V_CURRENT, V_IMPEDANCE
 */
export const S_MULTIMETER = 30
/**
 * Sprinkler device
 *
 * Uses:
 *  V_STATUS (turn on/off), V_TRIPPED (if fire detecting device)
 */
export const S_SPRINKLER = 31
/**
 * Water leak sensor
 *
 * Uses:
 *  V_TRIPPED, V_ARMED
 */
export const S_WATER_LEAK = 32
/**
 * Sound sensor
 *
 * Uses:
 *  V_LEVEL (in dB), V_TRIPPED, V_ARMED
 */
export const S_SOUND = 33
/**
 * Vibration sensor
 *
 * Uses:
 *  V_LEVEL (vibration in Hz), V_TRIPPED, V_ARMED
 */
export const S_VIBRATION = 34
/**
 * Moisture sensor
 *
 * Uses:
 *  V_LEVEL (water content or moisture in percentage?), V_TRIPPED, V_ARMED
 */
export const S_MOISTURE = 35
/**
 * LCD text device
 *
 * Uses:
 *  V_TEXT
 */
export const S_INFO = 36
/**
 * Gas meter
 *
 * Uses:
 *  V_FLOW, V_VOLUME
 */
export const S_GAS = 37
/**
 * GPS Sensor
 *
 * Uses:
 *  V_POSITION
 */
export const S_GPS = 38
/**
 * Water quality sensor
 *
 * Uses:
 *  V_TEMP, V_PH, V_ORP, V_EC, V_STATUS
 */
export const S_WATER_QUALITY = 39

export const ST_FIRMWARE_CONFIG_REQUEST	= 0
export const ST_FIRMWARE_CONFIG_RESPONSE	= 1
export const ST_FIRMWARE_REQUEST			    = 2
export const ST_FIRMWARE_RESPONSE			  = 3
export const ST_SOUND						        = 4
export const ST_IMAGE						        = 5

export const P_STRING					= 0
export const P_BYTE						= 1
export const P_INT16						= 2
export const P_UINT16					= 3
export const P_LONG32					= 4
export const P_ULONG32					= 5
export const P_CUSTOM					= 6

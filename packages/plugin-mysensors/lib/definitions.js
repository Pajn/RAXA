"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var FIRMWARE_BLOCK_SIZE = exports.FIRMWARE_BLOCK_SIZE = 16;
var BROADCAST_ADDRESS = exports.BROADCAST_ADDRESS = 255;
var NODE_SENSOR_ID = exports.NODE_SENSOR_ID = 255;
/**
 * Sent by a node when they present attached sensors. This is usually done in setup() at startup.
 */
var C_PRESENTATION = exports.C_PRESENTATION = 0;
/**
 * This message is sent from or to a sensor when a sensor value should be updated
 */
var C_SET = exports.C_SET = 1;
/**
 * Requests a variable value (usually from an actuator destined for controller).
 */
var C_REQ = exports.C_REQ = 2;
/**
 * This is a special internal message. See table below for the details
 */
var C_INTERNAL = exports.C_INTERNAL = 3;
/**
 * Used for OTA firmware updates
 */
var C_STREAM = exports.C_STREAM = 4;
/**
 * Temperature
 *
 * Used By:
 *  S_TEMP, S_HEATER, S_HVAC, S_WATER_QUALITY
 */
var V_TEMP = exports.V_TEMP = 0;
/**
 * Humidity
 *
 * Used By:
 *  S_HUM
 */
var V_HUM = exports.V_HUM = 1;
/**
 * Binary status. 0=off 1=on
 *
 * Used By:
 *  S_BINARY, S_DIMMER, S_SPRINKLER, S_HVAC, S_HEATER, S_WATER_QUALITY
 */
var V_STATUS = exports.V_STATUS = 2;
/**
 * Percentage value. 0-100 (%)
 *
 * Used By:
 *  S_DIMMER, S_COVER
 */
var V_PERCENTAGE = exports.V_PERCENTAGE = 3;
/**
 * Atmospheric Pressure
 *
 * Used By:
 *  S_BARO
 */
var V_PRESSURE = exports.V_PRESSURE = 4;
/**
 * Whether forecast. One of "stable", "sunny", "cloudy", "unstable", "thunderstorm" or "unknown"
 *
 * Used By:
 *  S_BARO
 */
var V_FORECAST = exports.V_FORECAST = 5;
/**
 * Amount of rain
 *
 * Used By:
 *  S_RAIN
 */
var V_RAIN = exports.V_RAIN = 6;
/**
 * Rate of rain
 *
 * Used By:
 *  S_RAIN
 */
var V_RAINRATE = exports.V_RAINRATE = 7;
/**
 * Windspeed
 *
 * Used By:
 *  S_WIND
 */
var V_WIND = exports.V_WIND = 8;
/**
 * Gust
 *
 * Used By:
 *  S_WIND
 */
var V_GUST = exports.V_GUST = 9;
/**
 * Wind direction 0-360 (degrees)
 *
 * Used By:
 *  S_WIND
 */
var V_DIRECTION = exports.V_DIRECTION = 10;
/**
 * UV light level
 *
 * Used By:
 *  S_UV
 */
var V_UV = exports.V_UV = 11;
/**
 * Weight (for scales etc)
 *
 * Used By:
 *  S_WEIGHT
 */
var V_WEIGHT = exports.V_WEIGHT = 12;
/**
 * Distance
 *
 * Used By:
 *  S_DISTANCE
 */
var V_DISTANCE = exports.V_DISTANCE = 13;
/**
 * Impedance value
 *
 * Used By:
 *  S_MULTIMETER, S_WEIGHT
 */
var V_IMPEDANCE = exports.V_IMPEDANCE = 14;
/**
 * Armed status of a security sensor.
 *
 * 1=Armed, 0=Bypassed
 *
 * Used By:
 *  S_DOOR, S_MOTION, S_SMOKE, S_SPRINKLER, S_WATER_LEAK, S_SOUND, S_VIBRATION, S_MOISTURE
 */
var V_ARMED = exports.V_ARMED = 15;
/**
 * Tripped status of a security sensor. 1=Tripped, 0=Untripped
 *
 * Used By:
 *  S_DOOR, S_MOTION, S_SMOKE, S_SPRINKLER, S_WATER_LEAK, S_SOUND, S_VIBRATION, S_MOISTURE
 */
var V_TRIPPED = exports.V_TRIPPED = 16;
/**
 * Watt value for power meters
 *
 * Used By:
 *  S_POWER, S_BINARY, S_DIMMER, S_RGB_LIGHT, S_RGBW_LIGHT
 */
var V_WATT = exports.V_WATT = 17;
/**
 * Accumulated number of KWH for a power meter
 *
 * Used By:
 *  S_POWER
 */
var V_KWH = exports.V_KWH = 18;
/**
 * Turn on a scene
 *
 * Used By:
 *  S_SCENE_CONTROLLER
 */
var V_SCENE_ON = exports.V_SCENE_ON = 19;
/**
 * Turn of a scene
 *
 * Used By:
 *  S_SCENE_CONTROLLER
 */
var V_SCENE_OFF = exports.V_SCENE_OFF = 20;
/**
 * Mode of header. One of "Off", "HeatOn", "CoolOn", or "AutoChangeOver"
 *
 * Used By:
 *  S_HVAC, S_HEATER
 */
var V_HVAC_FLOW_STATE = exports.V_HVAC_FLOW_STATE = 21;
/**
 * HVAC/Heater fan speed ("Min", "Normal", "Max", "Auto")
 *
 * Used By:
 *  S_HVAC, S_HEATER
 */
var V_HVAC_SPEED = exports.V_HVAC_SPEED = 22;
/**
 * Uncalibrated light level. 0-100%. Use V_LEVEL for light level in lux.
 *
 * Used By:
 *  S_LIGHT_LEVEL
 */
var V_LIGHT_LEVEL = exports.V_LIGHT_LEVEL = 23;
/**
 * Custom value 	Any device
 */
var V_VAR1 = exports.V_VAR1 = 24;
/**
 * Custom value 	Any device
 */
var V_VAR2 = exports.V_VAR2 = 25;
/**
 * Custom value 	Any device
 */
var V_VAR3 = exports.V_VAR3 = 26;
/**
 * Custom value 	Any device
 */
var V_VAR4 = exports.V_VAR4 = 27;
/**
 * Custom value 	Any device
 */
var V_VAR5 = exports.V_VAR5 = 28;
/**
 * Window covering. Up.
 *
 * Used By:
 *  S_COVER
 */
var V_UP = exports.V_UP = 29;
/**
 * Window covering. Down.
 *
 * Used By:
 *  S_COVER
 */
var V_DOWN = exports.V_DOWN = 30;
/**
 * Window covering. Stop.
 *
 * Used By:
 *  S_COVER
 */
var V_STOP = exports.V_STOP = 31;
/**
 * Send out an IR-command
 *
 * Used By:
 *  S_IR
 */
var V_IR_SEND = exports.V_IR_SEND = 32;
/**
 * This message contains a received IR-command
 *
 * Used By:
 *  S_IR
 */
var V_IR_RECEIVE = exports.V_IR_RECEIVE = 33;
/**
 * Flow of water (in meter)
 *
 * Used By:
 *  S_WATER
 */
var V_FLOW = exports.V_FLOW = 34;
/**
 * Water volume
 *
 * Used By:
 *  S_WATER
 */
var V_VOLUME = exports.V_VOLUME = 35;
/**
 * Set or get lock status. 1=Locked, 0=Unlocked
 *
 * Used By:
 *  S_LOCK
 */
var V_LOCK_STATUS = exports.V_LOCK_STATUS = 36;
/**
 * Used for sending level-value
 *
 * Used By:
 *  S_DUST, S_AIR_QUALITY, S_SOUND (dB), S_VIBRATION (hz), S_LIGHT_LEVEL (lux)
 */
var V_LEVEL = exports.V_LEVEL = 37;
/**
 * Voltage level
 *
 * Used By:
 *  S_MULTIMETER
 */
var V_VOLTAGE = exports.V_VOLTAGE = 38;
/**
 * Current level
 *
 * Used By:
 *  S_MULTIMETER
 */
var V_CURRENT = exports.V_CURRENT = 39;
/**
 * RGB value transmitted as ASCII hex string (I.e "ff0000" for red)
 *
 * Used By:
 *  S_RGB_LIGHT, S_COLOR_SENSOR
 */
var V_RGB = exports.V_RGB = 40;
/**
 * RGBW value transmitted as ASCII hex string (I.e "ff0000ff" for red + full white)
 *
 * Used By:
 *  S_RGBW_LIGHT
 */
var V_RGBW = exports.V_RGBW = 41;
/**
 * Optional unique sensor id (e.g. OneWire DS1820b ids)
 *
 * Used By:
 *  S_TEMP
 */
var V_ID = exports.V_ID = 42;
/**
 * Allows sensors to send in a string representing the unit prefix to be displayed in GUI. This is not parsed by controller! E.g. cm, m, km, inch.
 *
 * Used By:
 *  S_DISTANCE, S_DUST, S_AIR_QUALITY
 */
var V_UNIT_PREFIX = exports.V_UNIT_PREFIX = 43;
/**
 * HVAC cold setpoint
 *
 * Used By:
 *  S_HVAC
 */
var V_HVAC_SETPOINT_COOL = exports.V_HVAC_SETPOINT_COOL = 44;
/**
 * HVAC/Heater setpoint
 *
 * Used By:
 *  S_HVAC, S_HEATER
 */
var V_HVAC_SETPOINT_HEAT = exports.V_HVAC_SETPOINT_HEAT = 45;
/**
 * Flow mode for HVAC ("Auto", "ContinuousOn", "PeriodicOn")
 *
 * Used By:
 *  S_HVAC
 */
var V_HVAC_FLOW_MODE = exports.V_HVAC_FLOW_MODE = 46;
/**
 * Text message to display on LCD or controller device
 *
 * Used By:
 *  S_INFO
 */
var V_TEXT = exports.V_TEXT = 47;
/**
 * Custom messages used for controller/inter node specific commands, preferably using S_CUSTOM device type.
 *
 * Used By:
 *  S_CUSTOM
 */
var V_CUSTOM = exports.V_CUSTOM = 48;
/**
 * GPS position and altitude. Payload: latitude;longitude;altitude(m). E.g. "55.722526;13.017972;18"
 *
 * Used By:
 *  S_GPS
 */
var V_POSITION = exports.V_POSITION = 49;
/**
 * Record IR codes S_IR for playback
 *
 * Used By:
 *  S_IR
 */
var V_IR_RECORD = exports.V_IR_RECORD = 50;
/**
 * Water PH
 *
 * Used By:
 *  S_WATER_QUALITY
 */
var V_PH = exports.V_PH = 51;
/**
 * Water ORP : redox potential in mV
 *
 * Used By:
 *  S_WATER_QUALITY
 */
var V_ORP = exports.V_ORP = 52;
/**
 * Water electric conductivity μS/cm (microSiemens/cm)
 *
 * Used By:
 *  S_WATER_QUALITY
 */
var V_EC = exports.V_EC = 53;
/**
 * Reactive power: volt-ampere reactive (var)
 *
 * Used By:
 *  S_POWER
 */
var V_VAR = exports.V_VAR = 54;
/**
 * Apparent power: volt-ampere (VA)
 *
 * Used By:
 *  S_POWER
 */
var V_VA = exports.V_VA = 55;
/**
 * Ratio of real power to apparent power: floating point value in the range [-1,..,1]
 *
 * Used By:
 *  S_POWER
 */
var V_POWER_FACTOR = exports.V_POWER_FACTOR = 56;
/**
 * Use this to report the battery level (in percent 0-100).
 */
var I_BATTERY_LEVEL = exports.I_BATTERY_LEVEL = 0;
/**
 * Sensors can request the current time from the Controller using this message. The time will be reported as the seconds since 1970
 */
var I_TIME = exports.I_TIME = 1;
/**
 * Used to request gateway version from controller.
 */
var I_VERSION = exports.I_VERSION = 2;
/**
 * Use this to request a unique node id from the controller.
 */
var I_ID_REQUEST = exports.I_ID_REQUEST = 3;
/**
 * Id response back to node. Payload contains node id.
 */
var I_ID_RESPONSE = exports.I_ID_RESPONSE = 4;
/**
 * Start/stop inclusion mode of the Controller (1=start, 0=stop).
 */
var I_INCLUSION_MODE = exports.I_INCLUSION_MODE = 5;
/**
 * Config request from node. Reply with (M)etric or (I)mperal back to sensor.
 */
var I_CONFIG = exports.I_CONFIG = 6;
/**
 * When a sensor starts up, it broadcast a search request to all neighbor nodes. They reply with a I_FIND_PARENT_RESPONSE.
 */
var I_FIND_PARENT = exports.I_FIND_PARENT = 7;
/**
 * Reply message type to I_FIND_PARENT request.
 */
var I_FIND_PARENT_RESPONSE = exports.I_FIND_PARENT_RESPONSE = 8;
/**
 * Sent by the gateway to the Controller to trace-log a message
 */
var I_LOG_MESSAGE = exports.I_LOG_MESSAGE = 9;
/**
 * A message that can be used to transfer child sensors (from EEPROM routing table) of a repeating node.
 */
var I_CHILDREN = exports.I_CHILDREN = 10;
/**
 * Optional sketch name that can be used to identify sensor in the Controller GUI
 */
var I_SKETCH_NAME = exports.I_SKETCH_NAME = 11;
/**
 * Optional sketch version that can be reported to keep track of the version of sensor in the Controller GUI.
 */
var I_SKETCH_VERSION = exports.I_SKETCH_VERSION = 12;
/**
 * Used by OTA firmware updates. Request for node to reboot.
 */
var I_REBOOT = exports.I_REBOOT = 13;
/**
 * Send by gateway to controller when startup is complete.
 */
var I_GATEWAY_READY = exports.I_GATEWAY_READY = 14;
/**
 * Provides signing related preferences (first byte is preference version).
 */
var I_SIGNING_PRESENTATION = exports.I_SIGNING_PRESENTATION = 15;
/**
 * Used between sensors when requesting nonce.
 */
var I_NONCE_REQUEST = exports.I_NONCE_REQUEST = 16;
/**
 * Used between sensors for nonce response.
 */
var I_NONCE_RESPONSE = exports.I_NONCE_RESPONSE = 17;
/**
 * Heartbeat request
 */
var I_HEARTBEAT_REQUEST = exports.I_HEARTBEAT_REQUEST = 18;
/**
 * Presentation message
 */
var I_PRESENTATION = exports.I_PRESENTATION = 19;
/**
 * Discover request
 */
var I_DISCOVER_REQUEST = exports.I_DISCOVER_REQUEST = 20;
/**
 * Discover response
 */
var I_DISCOVER_RESPONSE = exports.I_DISCOVER_RESPONSE = 21;
/**
 * Heartbeat response
 */
var I_HEARTBEAT_RESPONSE = exports.I_HEARTBEAT_RESPONSE = 22;
/**
 * Node is locked (reason in string-payload)
 */
var I_LOCKED = exports.I_LOCKED = 23;
/**
 * Ping sent to node, payload incremental hop counter
 */
var I_PING = exports.I_PING = 24;
/**
 * In return to ping, sent back to sender, payload incremental hop counter
 */
var I_PONG = exports.I_PONG = 25;
/**
 * Register request to GW
 */
var I_REGISTRATION_REQUEST = exports.I_REGISTRATION_REQUEST = 26;
/**
 * Register response from GW
 */
var I_REGISTRATION_RESPONSE = exports.I_REGISTRATION_RESPONSE = 27;
/**
 * Debug message
 */
var I_DEBUG = exports.I_DEBUG = 28;
/**
 * Door and window sensors
 *
 * Uses:
 *  V_TRIPPED, V_ARMED
 */
var S_DOOR = exports.S_DOOR = 0;
/**
 * Motion sensors
 *
 * Uses:
 *  V_TRIPPED, V_ARMED
 */
var S_MOTION = exports.S_MOTION = 1;
/**
 * Smoke sensor
 *
 * Uses:
 *  V_TRIPPED, V_ARMED
 */
var S_SMOKE = exports.S_SMOKE = 2;
/**
 * Binary device (on/off)
 *
 * Uses:
 *  V_STATUS, V_WATT
 */
var S_BINARY = exports.S_BINARY = 3;
/**
 * Dimmable device of some kind
 *
 * Uses:
 *  V_STATUS (on/off), V_PERCENTAGE (dimmer level 0-100), V_WATT
 */
var S_DIMMER = exports.S_DIMMER = 4;
/**
 * Window covers or shades
 *
 * Uses:
 *  V_UP, V_DOWN, V_STOP, V_PERCENTAGE
 */
var S_COVER = exports.S_COVER = 5;
/**
 * Temperature sensor
 *
 * Uses:
 *  V_TEMP, V_ID
 */
var S_TEMP = exports.S_TEMP = 6;
/**
 * Humidity sensor
 *
 * Uses:
 *  V_HUM
 */
var S_HUM = exports.S_HUM = 7;
/**
 * Barometer sensor (Pressure)
 *
 * Uses:
 *  V_PRESSURE, V_FORECAST
 */
var S_BARO = exports.S_BARO = 8;
/**
 * Wind sensor
 *
 * Uses:
 *  V_WIND, V_GUST, V_DIRECTION
 */
var S_WIND = exports.S_WIND = 9;
/**
 * Rain sensor
 *
 * Uses:
 *  V_RAIN, V_RAINRATE
 */
var S_RAIN = exports.S_RAIN = 10;
/**
 * UV sensor
 *
 * Uses:
 *  V_UV
 */
var S_UV = exports.S_UV = 11;
/**
 * Weight sensor for scales etc.
 *
 * Uses:
 *  V_WEIGHT, V_IMPEDANCE
 */
var S_WEIGHT = exports.S_WEIGHT = 12;
/**
 * Power measuring device, like power meters
 *
 * Uses:
 *  V_WATT, V_KWH, V_VAR, V_VA, V_POWER_FACTOR
 */
var S_POWER = exports.S_POWER = 13;
/**
 * Heater device
 *
 * Uses:
 *  V_HVAC_SETPOINT_HEAT, V_HVAC_FLOW_STATE, V_TEMP, V_STATUS
 */
var S_HEATER = exports.S_HEATER = 14;
/**
 * Distance sensor
 *
 * Uses:
 *  V_DISTANCE, V_UNIT_PREFIX
 */
var S_DISTANCE = exports.S_DISTANCE = 15;
/**
 * Light sensor
 *
 * Uses:
 *  V_LIGHT_LEVEL (uncalibrated percentage), V_LEVEL (light level in lux)
 */
var S_LIGHT_LEVEL = exports.S_LIGHT_LEVEL = 16;
/**
 * Arduino node device
 */
var S_ARDUINO_NODE = exports.S_ARDUINO_NODE = 17;
/**
 * Arduino repeating node device
 */
var S_ARDUINO_REPEATER_NODE = exports.S_ARDUINO_REPEATER_NODE = 18;
/**
 * Lock device
 *
 * Uses:
 *  V_LOCK_STATUS
 */
var S_LOCK = exports.S_LOCK = 19;
/**
 * Ir sender/receiver device
 *
 * Uses:
 *  V_IR_SEND, V_IR_RECEIVE, V_IR_RECORD
 */
var S_IR = exports.S_IR = 20;
/**
 * Water meter
 *
 * Uses:
 *  V_FLOW, V_VOLUME
 */
var S_WATER = exports.S_WATER = 21;
/**
 * Air quality sensor e.g. MQ-2
 *
 * Uses:
 *  V_LEVEL, V_UNIT_PREFIX
 */
var S_AIR_QUALITY = exports.S_AIR_QUALITY = 22;
/**
 * Use this for custom sensors where no other fits.
 */
var S_CUSTOM = exports.S_CUSTOM = 23;
/**
 * Dust level sensor
 *
 * Uses:
 *  V_LEVEL, V_UNIT_PREFIX
 */
var S_DUST = exports.S_DUST = 24;
/**
 * Scene controller device
 *
 * Uses:
 *  V_SCENE_ON, V_SCENE_OFF
 */
var S_SCENE_CONTROLLER = exports.S_SCENE_CONTROLLER = 25;
/**
 * RGB light
 *
 * Uses:
 *  V_RGB, V_WATT
 */
var S_RGB_LIGHT = exports.S_RGB_LIGHT = 26;
/**
 * RGBW light (with separate white component)
 *
 * Uses:
 *  V_RGBW, V_WATT
 */
var S_RGBW_LIGHT = exports.S_RGBW_LIGHT = 27;
/**
 * Color sensor
 *
 * Uses:
 *  V_RGB
 */
var S_COLOR_SENSOR = exports.S_COLOR_SENSOR = 28;
/**
 * Thermostat/HVAC device
 *
 * Uses:
 *  V_STATUS, V_TEMP, V_HVAC_SETPOINT_HEAT, V_HVAC_SETPOINT_COOL, V_HVAC_FLOW_STATE, V_HVAC_FLOW_MODE, V_HVAC_SPEED
 */
var S_HVAC = exports.S_HVAC = 29;
/**
 * Multimeter device
 *
 * Uses:
 *  V_VOLTAGE, V_CURRENT, V_IMPEDANCE
 */
var S_MULTIMETER = exports.S_MULTIMETER = 30;
/**
 * Sprinkler device
 *
 * Uses:
 *  V_STATUS (turn on/off), V_TRIPPED (if fire detecting device)
 */
var S_SPRINKLER = exports.S_SPRINKLER = 31;
/**
 * Water leak sensor
 *
 * Uses:
 *  V_TRIPPED, V_ARMED
 */
var S_WATER_LEAK = exports.S_WATER_LEAK = 32;
/**
 * Sound sensor
 *
 * Uses:
 *  V_LEVEL (in dB), V_TRIPPED, V_ARMED
 */
var S_SOUND = exports.S_SOUND = 33;
/**
 * Vibration sensor
 *
 * Uses:
 *  V_LEVEL (vibration in Hz), V_TRIPPED, V_ARMED
 */
var S_VIBRATION = exports.S_VIBRATION = 34;
/**
 * Moisture sensor
 *
 * Uses:
 *  V_LEVEL (water content or moisture in percentage?), V_TRIPPED, V_ARMED
 */
var S_MOISTURE = exports.S_MOISTURE = 35;
/**
 * LCD text device
 *
 * Uses:
 *  V_TEXT
 */
var S_INFO = exports.S_INFO = 36;
/**
 * Gas meter
 *
 * Uses:
 *  V_FLOW, V_VOLUME
 */
var S_GAS = exports.S_GAS = 37;
/**
 * GPS Sensor
 *
 * Uses:
 *  V_POSITION
 */
var S_GPS = exports.S_GPS = 38;
/**
 * Water quality sensor
 *
 * Uses:
 *  V_TEMP, V_PH, V_ORP, V_EC, V_STATUS
 */
var S_WATER_QUALITY = exports.S_WATER_QUALITY = 39;
var ST_FIRMWARE_CONFIG_REQUEST = exports.ST_FIRMWARE_CONFIG_REQUEST = 0;
var ST_FIRMWARE_CONFIG_RESPONSE = exports.ST_FIRMWARE_CONFIG_RESPONSE = 1;
var ST_FIRMWARE_REQUEST = exports.ST_FIRMWARE_REQUEST = 2;
var ST_FIRMWARE_RESPONSE = exports.ST_FIRMWARE_RESPONSE = 3;
var ST_SOUND = exports.ST_SOUND = 4;
var ST_IMAGE = exports.ST_IMAGE = 5;
var P_STRING = exports.P_STRING = 0;
var P_BYTE = exports.P_BYTE = 1;
var P_INT16 = exports.P_INT16 = 2;
var P_UINT16 = exports.P_UINT16 = 3;
var P_LONG32 = exports.P_LONG32 = 4;
var P_ULONG32 = exports.P_ULONG32 = 5;
var P_CUSTOM = exports.P_CUSTOM = 6;
//# sourceMappingURL=definitions.js.map

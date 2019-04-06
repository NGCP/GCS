/* eslint-disable import/prefer-default-export, @typescript-eslint/class-name-casing, max-len, camelcase, @typescript-eslint/camelcase, @typescript-eslint/no-explicit-any */

/* eslint-enable max-len */
/*
 * Allows us to use xbee-api as the original api has no typings.
 */
declare module 'xbee-api' {
  import BufferReader from 'buffer-reader';
  import { Buffer } from 'safe-buffer';
  import { Transform } from 'stream';

  type START_BYTE = number;
  type ESCAPE = number;
  type XOFF = number;
  type XON = number;

  export interface Frame {
    addresses?: number[];
    analogSamples?: object;
    broadcastRadius?: number;
    clusterId?: string;
    command?: string;
    commandParameter?: any;
    commandStatus?: string;
    data?: any;
    deliveryStatus?: number;
    destination16?: string;
    destination64?: string;
    deviceType?: number;
    digiManufacturerID?: string;
    digiProfileID?: string;
    digitalSamples?: object;
    discoveryStatus?: number;
    destinationEndpoint?: string;
    hopCount?: number;
    id?: number;
    modemStatus?: number;
    nodeIdentifier?: string;
    numSamples?: number;
    options?: number;
    profileId?: string;
    remote16?: string;
    remote64?: string;
    remoteParent16?: string;
    receiveOptions?: number;
    remoteCommandOptions?: number;
    rssi?: number;
    sender16?: string;
    sender64?: string;
    sensors?: number;
    sensorValues?: {
      AD0: number;
      AD1: number;
      AD2: number;
      AD3: number;
      T: number;
      temperature?: number;
      relativeHumidity?: number;
      trueHumidity?: number;
      waterPresent: boolean;
    };
    sourceEndpoint?: string;
    sourceEvent?: number;
    transmitRetryCount?: number;
  }

  export interface XbeeAPIOptions {
    raw_frames?: boolean;
    api_mode?: 1 | 2;
    module?: '802.15.4' | 'ZNet' | 'ZigBee' | 'Any';
    convert_adc?: boolean;
    vref_adc?: number;
    parser_buffer_size?: number;
    builder_buffer_size?: number;
  }

  export class XbeeAPI {
    private options: XbeeAPIOptions;

    private parseState: {
      buffer: Buffer;
      offset: number;
      length: number;
      total: number;
      checksum: number;
      b: number;
      escape_next: boolean;
      waiting: boolean;
    };

    /**
     * Builder transform stream of the Xbee.
     */
    public builder: Transform;

    /**
     * Parser transform stream of the Xbee.
     */
    public parser: Transform;

    public constructor(options?: XbeeAPIOptions);

    private escape(buffer: Buffer): Buffer;

    /**
     * Returns an API frame (buffer) created from the passed frame object. See Creating frames
     * from objects to write to the XBee for details on how these passed objects are specified.
     */
    public buildFrame(frame: Frame): Buffer;

    /**
     * Parses and returns a frame object from the buffer passed. Note that the buffer must be
     * a complete frame, starting with the start byte and ending with the checksum byte. See
     * Objects created from received API Frames for details on how the retured objects are
     * specified.
     */
    public parseFrame(rawFrame: Buffer): Frame;

    /**
     * Returns whether the library implements a parser for the frame contained in the provided
     * buffer. The buffer only needs to contain up to the frame type segment to determine if it
     * can be parsed, but `parseFrame()` will need a complete frame.
     */
    public canParse(buffer: Buffer): boolean;

    private canBuild(type: string): boolean;

    public nextFrameId(): number;

    /**
     * Returns a parser function with the profile `function(emitter, buffer) {}`. This can be
     * passed to a serial reader such as serialport. Note that XBeeAPI will not use the
     * emitter to emit a parsed frame, but it's own emitter
     */
    public rawParser(): (emitter: any, buffer: Buffer) => void;

    private newStream(): any;

    /**
     * Parses data in the buffer, assumes it is comming directly from the XBee. If a complete
     * frame is collected, it is emitted as Event: 'frame_object'.
     */
    public parseRaw(buffer: Buffer, enc?: any, cb?: () => void): void;
  }

  export interface constants {
    START_BYTE: START_BYTE;
    ESCAPE: ESCAPE;
    XOFF: XOFF;
    XON: XON;
    ESCAPE_WITH: number;

    UNKNOWN_16: [number, number];
    UNKNOWN_64: [number, number, number, number, number, number, number, number];
    BROADCAST_16_XB: [number, number];
    COORDINATOR_16: [number, number];
    COORDINATOR_64: [number, number, number, number, number, number, number, number];

    ESCAPE_BYTES: [
      START_BYTE,
      ESCAPE,
      XOFF,
      XON
    ];

    FRAME_TYPE: {
      AT_COMMAND: number;
      0x08: string;
      AT_COMMAND_QUEUE_PARAMETER_VALUE: number;
      0x09: string;
      ZIGBEE_TRANSMIT_REQUEST: number;
      0x10: string;
      EXPLICIT_ADDRESSING_ZIGBEE_COMMAND_FRAME: number;
      0x11: string;
      REMOTE_AT_COMMAND_REQUEST: number;
      0x17: string;
      CREATE_SOURCE_ROUTE: number;
      0x21: string;
      REGISTER_JOINING_DEVICE: number;
      0x24: string;
      AT_COMMAND_RESPONSE: number;
      0x88: string;
      MODEM_STATUS: number;
      0x8A: string;
      ZIGBEE_TRANSMIT_STATUS: number;
      0x8B: string;
      ZIGBEE_RECEIVE_PACKET: number;
      0x90: string;
      ZIGBEE_EXPLICIT_RX: number;
      0x91: string;
      ZIGBEE_IO_DATA_SAMPLE_RX: number;
      0x92: string;
      XBEE_SENSOR_READ: number;
      0x94: string;
      NODE_IDENTIFICATION: number;
      0x95: string;
      REMOTE_COMMAND_RESPONSE: number;
      0x97: string;
      OTA_FIRMWARE_UPDATE_STATUS: number;
      0xA0: string;
      ROUTE_RECORD: number;
      0xA1: string;
      DEVICE_AUTHENITCATED_INDICATOR: number;
      0xA2: string;
      MTO_ROUTE_REQUEST: number;
      0xA3: string;
      REGISTER_JOINING_DEVICE_STATUS: number;
      0xA4: string;
      JOIN_NOTIFICATION_STATUS: number;
      0xA5: string;

      // Series 1/802.15.4 Support
      TX_REQUEST_64: number;
      0x00: string;
      TX_REQUEST_16: number;
      0x01: string;
      TX_STATUS: number;
      0x89: string;
      RX_PACKET_64: number;
      0x80: string;
      RX_PACKET_16: number;
      0x81: string;
      RX_PACKET_64_IO: number;
      0x82: string;
      RX_PACKET_16_IO: number;
      0x83: string;
    };

    DISCOVERY_STATUS: {
      NO_DISCOVERY_OVERHEAD: number;
      0x00: string;
      ADDRESS_DISCOVERY: number;
      0x01: string;
      ROUTE_DISCOVERY: number;
      0x02: string;
      ADDRESS_AND_ROUTE_DISCOVERY: number;
      0x03: string;
      EXTENDED_TIMEOUT_DISCOVERY: number;
      0x40: string;
    };

    DELIVERY_STATUS: {
      SUCCESS: number;
      0x00: string;
      MAC_ACK_FALIURE: number;
      0x01: string;
      CA_FAILURE: number;
      0x02: string;
      INVALID_DESTINATION_ENDPOINT: number;
      0x15: string;
      NETWORK_ACK_FAILURE: number;
      0x21: string;
      NOT_JOINED_TO_NETWORK: number;
      0x22: string;
      SELF_ADDRESSED: number;
      0x23: string;
      ADDRESS_NOT_FOUND: number;
      0x24: string;
      ROUTE_NOT_FOUND: number;
      0x25: string;
      BROADCAST_SOURCE_FAILED: number;
      0x26: string;
      INVALID_BINDING_TABLE_INDEX: number;
      0x2B: string;
      RESOURCE_ERROR: number;
      0x2C: string;
      ATTEMPTED_BROADCAST_WITH_APS_TRANS: number;
      0x2D: string;
      ATTEMPTED_BROADCAST_WITH_APS_TRANS_EE0: number;
      0x2E: string;
      RESOURCE_ERROR_B: number;
      0x32: string;
      DATA_PAYLOAD_TOO_LARGE: number;
      0x74: string;
      INDIRECT_MESSAGE_UNREQUESTED: number;
      0x75: string;
    };

    COMMAND_STATUS: {
      OK: number;
      0x00: string;
      ERROR: number;
      0x01: string;
      INVALID_COMMAND: number;
      0x02: string;
      INVALID_PARAMETER: number;
      0x03: string;
      REMOTE_CMD_TRANS_FAILURE: number;
      0x04: string;
    };

    MODEM_STATUS: {
      HARDWARE_RESET: number;
      0x00: string;
      WATCHDOG_RESET: number;
      0x01: string;
      JOINED_NETWORK: number;
      0x02: string;
      DISASSOCIATED: number;
      0x03: string;
      COORDINATOR_STARTED: number;
      0x06: string;
      SECURITY_KEY_UPDATED: number;
      0x07: string;
      VOLTAGE_SUPPLY_LIMIT_EXCEEDED: number;
      0x0D: string;
      CONFIGURATION_CHANGED_DURING_JOIN: number;
      0x11: string;
      STACK_ERROR: number;
      0x80: string;
    };

    RECEIVE_OPTIONS: {
      PACKET_ACKNOWLEDGED: number;
      0x01: string;
      PACKET_WAS_BROADCAST: number;
      0x02: string;
      PACKET_ENCRYPTED: number;
      0x20: string;
      PACKET_SENT_FROM_END_DEVICE: number;
      0x40: string;
    };

    DEVICE_TYPE: {
      COORDINATOR: number;
      0x00: string;
      ROUTER: number;
      0x01: string;
      END_DEVICE: number;
      0x02: string;
    };

    DIGITAL_CHANNELS: {
      MASK: {
        0: [string, string];
        1: [string, string];
        2: [string, string];
        3: [string, string];
        4: [string];
        5: [string, string];
        6: [string, string];
        7: [string, string];
        10: [string, string];
        11: [string, string];
        12: [string, string];
      };

      DIO0: number;
      DIO1: number;
      DIO2: number;
      DIO3: number;
      DIO4: number;
      DIO5: number;
      DIO6: number;
      DIO7: number;
      DIO10: number;
      DIO11: number;
      DIO12: number;

      AD0: number;
      AD1: number;
      AD2: number;
      AD3: number;

      ASSOCIATE: number;
      RTS: number;
      CTS: number;
      RSSI: number;
      PWM: number;
      CD: number;
    };

    ANALOG_CHANNELS: {
      MASK: {
        0: [string, string];
        1: [string, string];
        2: [string, string];
        3: [string, string];
        7: [string];
      };

      PIN: {
        20: number;
        19: number;
        18: number;
        17: number;
        11: number;
        15: number;
        16: number;
        12: number;
        6: number;
        7: number;
        4: number;
      };

      AD0: number;
      AD1: number;
      AD2: number;
      AD3: number;

      DIO0: number;
      DIO1: number;

      SUPPLY: number;
    };

    PULLUP_RESISTOR: {
      MASK: {
        0: [string];
        1: [string, string];
        2: [string, string];
        3: [string, string];
        4: [string, string];
        5: [string, string];
        6: [string, string, string];
        7: [string, string];
        8: [string, string];
        9: [string, string];
        10: [string];
        11: [string, string, string];
        12: [string, string];
        13: [string, string];
      };

      PIN: {
        11: number;
        17: number;
        18: number;
        19: number;
        20: number;
        16: number;
        9: number;
        3: number;
        15: number;
        13: number;
        4: number;
        6: number;
        7: number;
        12: number;

        DIO4: number;
        DIO3: number;
        DIO2: number;
        DIO1: number;
        DIO0: number;
        DIO6: number;
        DIO8: number;
        DIO9: number;
        DIO12: number;
        DIO10: number;
        DIO11: number;
        DIO7: number;

        AD3: number;
        AD2: number;
        AD1: number;
        AD0: number;

        PWM0: number;
        PWM1: number;

        RTS: number;
        DTR: number;
        SLEEP_REQUEST: number;
        DIN: number;
        CONFIG: number;
        ASSOCIATE: number;
        ON: number;
        SLEEP: number;
        RSSI: number;
        CTS: number;
      };
    };

    CHANGE_DETECTION: {
      MASK: {
        0: [string];
        1: [string];
        2: [string];
        3: [string];
        4: [string];
        5: [string];
        6: [string];
        7: [string];
        8: [string];
        9: [string];
        10: [string];
        11: [string];
      };

      PIN: {
        20: number;
        19: number;
        18: number;
        17: number;
        11: number;
        15: number;
        16: number;
        12: number;
        9: number;
        13: number;
        6: number;
        7: number;
      };

      DIO0: number;
      DIO1: number;
      DIO2: number;
      DIO3: number;
      DIO4: number;
      DIO5: number;
      DIO6: number;
      DIO7: number;
      DIO8: number;
      DIO9: number;
      DIO10: number;
      DIO11: number;
    };

    PIN_MODE: {
      // pin
      P2: {
        // key
        UNMONITORED_INPUT: number;
        DIGITAL_INPUT: number;
        DIGITAL_OUTPUT_LOW: number;
        DIGITAL_OUTPUT_HIGH: number;
        0x00: string;
        0x03: string;
        0x04: string;
        0x05: string;
      };

      P1: {
        UNMONITORED_INPUT: number;
        DIGITAL_INPUT: number;
        DIGITAL_OUTPUT_LOW: number;
        DIGITAL_OUTPUT_HIGH: number;
        0x00: string;
        0x03: string;
        0x04: string;
        0x05: string;
      };

      P0: {
        DISABLED: number;
        RSSI_PWM: number;
        DIGITAL_INPUT: number;
        DIGITAL_OUTPUT_LOW: number;
        DIGITAL_OUTPUT_HIGH: number;
        0x00: string;
        0x01: string;
        0x03: string;
        0x04: string;
        0x05: string;
      };

      D4: {
        DISABLED: number;
        DIGITAL_INPUT: number;
        DIGITAL_OUTPUT_LOW: number;
        DIGITAL_OUTPUT_HIGH: number;
        0x00: string;
        0x03: string;
        0x04: string;
        0x05: string;
      };

      D7: {
        DISABLED: number;
        CTS_FLOW_CTRL: number;
        DIGITAL_INPUT: number;
        DIGITAL_OUTPUT_LOW: number;
        DIGITAL_OUTPUT_HIGH: number;
        RS485_TX_LOW: number;
        RS485_TX_HIGH: number;
        0x00: string;
        0x01: string;
        0x03: string;
        0x04: string;
        0x05: string;
        0x06: string;
        0x07: string;
      };

      D5: {
        DISABLED: number;
        ASSOC_LED: number;
        DIGITAL_INPUT: number;
        DIGITAL_OUTPUT_LOW: number;
        DIGITAL_OUTPUT_HIGH: number;
        0x00: string;
        0x01: string;
        0x03: string;
        0x04: string;
        0x05: string;
      };

      D6: {
        DISABLED: number;
        RTS_FLOW_CTRL: number;
        DIGITAL_INPUT: number;
        DIGITAL_OUTPUT_LOW: number;
        DIGITAL_OUTPUT_HIGH: number;
        0x00: string;
        0x01: string;
        0x03: string;
        0x04: string;
        0x05: string;
      };

      D0: {
        DISABLED: number;
        NODE_ID_ENABLED: number; // Only valid for D0!
        ANALOG_INPUT: number;
        DIGITAL_INPUT: number;
        DIGITAL_OUTPUT_LOW: number;
        DIGITAL_OUTPUT_HIGH: number;
        0x00: string;
        0x01: string;
        0x02: string;
        0x03: string;
        0x04: string;
        0x05: string;
      };

      D1: {
        DISABLED: number;
        NODE_ID_ENABLED: number; // Only valid for D0!
        ANALOG_INPUT: number;
        DIGITAL_INPUT: number;
        DIGITAL_OUTPUT_LOW: number;
        DIGITAL_OUTPUT_HIGH: number;
        0x00: string;
        0x01: string;
        0x02: string;
        0x03: string;
        0x04: string;
        0x05: string;
      };

      D2: {
        DISABLED: number;
        NODE_ID_ENABLED: number; // Only valid for D0!
        ANALOG_INPUT: number;
        DIGITAL_INPUT: number;
        DIGITAL_OUTPUT_LOW: number;
        DIGITAL_OUTPUT_HIGH: number;
        0x00: string;
        0x01: string;
        0x02: string;
        0x03: string;
        0x04: string;
        0x05: string;
      };

      D3: {
        DISABLED: number;
        NODE_ID_ENABLED: number; // Only valid for D0!
        ANALOG_INPUT: number;
        DIGITAL_INPUT: number;
        DIGITAL_OUTPUT_LOW: number;
        DIGITAL_OUTPUT_HIGH: number;
        0x00: string;
        0x01: string;
        0x02: string;
        0x03: string;
        0x04: string;
        0x05: string;
      };
    };

    PIN_COMMAND: {
      PIN: {
        '6': string;
        '7': string;
        '4': string;
        '12': string;
        '16': string;
        '20': string;
        '19': string;
        '18': string;
        '17': string;
        '11': string;
        '15': string;
      };

      DIO10: string;
      DIO11: string;
      DIO12: string;
      DIO7: string;
      DIO6: string;
      DIO0: string;
      DIO1: string;
      DIO2: string;
      DIO3: string;
      DIO4: string;
      DIO5: string;

      PWM0: string;
      PWM1: string;

      AD0: string;
      AD1: string;
      AD2: string;
      AD3: string;

      RSSIM: string;
      CTS: string;
      ASSOC: string;
    };

    FRAME_TYPE_SETS: {
      '802.15.4': [number, number, number, number, number, number, number, number, number,
        number, number, number, number];
      ZNet: [number, number, number, number, number, number, number, number, number,
        number, number, number, number, number];
      ZigBee: [number, number, number, number, number, number, number, number, number,
        number, number, number, number, number, number, number, number, number, number,
        number, number, number];
      Any: [number, number, number, number, number, number, number, number, number, number,
        number, number, number, number, number, number, number, number, number, number, number,
        number, number, number, number, number, number, number, number];
    };
  }
}

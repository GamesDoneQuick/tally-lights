// Packages
import J5Raspi = require('raspi-io');
import * as five from 'johnny-five';

// Ours
import { createLogger } from '../common/logger';

const log = createLogger('board');

let initialized = false;
let preview: five.Pin;
let program: five.Pin;
let brightnessPin: five.Led;
let bitPin0: five.Pin;
let bitPin1: five.Pin;
let bitPin2: five.Pin;
let bitPin3: five.Pin;
let fleetPin: five.Pin;
let channel = -1;

export async function init(): Promise<void> {
	if (initialized) {
		return;
	}

	return new Promise(resolve => {
		log.info('Preparing board...');
		const board = new five.Board({
			io: new J5Raspi.RaspiIO(),
		});

		board.on('ready', () => {
			initialized = true;
			log.info('Board ready!');
			brightnessPin = new five.Led('PWM0' as any);
			preview = new five.Pin('GPIO5');
			program = new five.Pin('GPIO6');
			bitPin0 = new five.Pin('GPIO23');
			let changer = new five.Button({ pin: 'GPIO23', isPullup: true }); // This appears to be the only way to set the pull-up resistor
			bitPin1 = new five.Pin('GPIO22');
			new five.Button({ pin: 'GPIO22', isPullup: true });
			bitPin2 = new five.Pin('GPIO27');
			new five.Button({ pin: 'GPIO27', isPullup: true });
			bitPin3 = new five.Pin('GPIO17');
			new five.Button({ pin: 'GPIO17', isPullup: true });
			fleetPin = new five.Pin('GPIO24');
			let changer2 = new five.Button({ pin: 'GPIO24', isPulldown: true });
			updateChannel();
			changer.on('up', () => {
				updateChannel();
			});
			changer.on('down', () => {
				updateChannel();
			});
			changer2.on('up', () => {
				updateChannel();
			});
			changer2.on('down', () => {
				updateChannel();
			});
			preview.low;
			program.low;
			resolve();
		});

		board.on('exit', () => {
			log.info('Cleaning up for exit...');
			if (preview) {
				preview.low();
			}

			if (program) {
				program.low();
			}

			log.info('Cleaning up complete!');
		});
	});
}

export function getChannel(): number {
	return channel;
}

function updateChannel() {
	bitPin0.query(pin0 => {
		bitPin1.query(pin1 => {
			bitPin2.query(pin2 => {
				bitPin3.query(pin3 => {
					fleetPin.query(fPin => {
						let newChannel = 0;
						if (!pin0.value) newChannel += 1;
						if (!pin1.value) newChannel += 2;
						if (!pin2.value) newChannel += 4;
						if (!pin3.value) newChannel += 8;
						if (!fPin.value) newChannel += 10;
						if (channel !== newChannel){
							channel = newChannel;
							log.info('New tally channel: ' + channel.toString());
						}
					})
				});
			});
		});
	});
}

export function setBrightness(brightness: number): void {
	if (!initialized) {
		throw new Error('board not initialized');
	}
	return brightnessPin.brightness(brightness);
}

export function turnOn(channel: 'program' | 'preview'): void {
	if (!initialized) {
		throw new Error('board not initialized');
	}

	const pin = channel === 'program' ? program : preview;
	return pin.high();
}

export function turnOff(channel: 'program' | 'preview'): void {
	if (!initialized) {
		throw new Error('board not initialized');
	}
	const pin = channel === 'program' ? program : preview;
	return pin.low();
}

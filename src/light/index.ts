// Packages
import * as io from 'socket.io-client';

// Ours
import { TypedLightClient } from '../types/socket-protocol';
import { init as initBoard, setBrightness, turnOn, turnOff, getChannel } from './board';
import { createLogger } from '../common/logger';
import config from '../common/config';

const log = createLogger('socket');
const host = `http://${config.get('baseStation').ip}:${config.get('baseStation').port}`;
const ns = '/light';
let programBrightness = 100;
let previewBrightness = 100;

initBoard()
	.then(() => {
		const client: TypedLightClient = io(host + ns) as any;

		client.on('connect', () => {
			log.info('Connected to base station')
		})

		client.on('setBrightness', ({ preview, program }) => {
			log.info('setBrightness | preview: %s, program: %s', preview, program);
			programBrightness = program;
			previewBrightness = preview;
		});

		client.on('setTally', newStates => {
			let tallyChannel = getChannel();
			if (!newStates || !Array.isArray(newStates)) {
				return;
			}

			newStates.forEach(({ channel, state }) => {
				if (channel !== tallyChannel) { //config.get('light').channel
					return;
				}

				log.info('setTally | %s', state);
				if (state === 'preview') {
					turnOff('program');
					setBrightness(previewBrightness)
					setTimeout(() => {
						turnOn('preview');
					}, 100)
				} else if (state === 'program') {
					turnOff('preview');
					setBrightness(programBrightness)
					setTimeout(() => {
						turnOn('program');
					}, 100)
				} else {
					turnOff('preview');
					turnOff('program');
				}
			});
		});
	})
	.catch(error => {
		log.error('Failed to init:', error);
	});

let heartbeatCounter = 0;
setInterval(() => {
	log.debug(`Heartbeat #${heartbeatCounter++}`);
}, 10000);

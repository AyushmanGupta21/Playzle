// EventBridge — singleton to communicate between Phaser and React
import { EventEmitter } from 'eventemitter3';

export const EVENTS = {
    CHECKPOINT_REACHED: 'CHECKPOINT_REACHED',
    GAME_RESUME: 'GAME_RESUME',
    LEVEL_COMPLETE: 'LEVEL_COMPLETE',
} as const;

class Bridge extends EventEmitter { }
export const eventBridge = new Bridge();

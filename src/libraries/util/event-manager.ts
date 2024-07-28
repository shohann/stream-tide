import { EventEmitter } from "events";

class EventManager {
  private static instance: EventEmitter;

  constructor() {
    if (!EventManager.instance) {
      EventManager.instance = new EventEmitter();
    }
  }

  getInstance(): EventEmitter {
    return EventManager.instance;
  }
}

export default new EventManager();

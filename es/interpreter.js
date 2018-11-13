var __assign = this && this.__assign || function () {
    __assign = Object.assign || function (t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
import { SpecialTargets, ActionTypes } from './types';
import * as actionTypes from './actionTypes';
import { toEventObject, doneInvoke, error } from './actions';
import { Machine } from './Machine';
import { StateNode } from './StateNode';
import { mapContext } from './utils';
var SimulatedClock = /** @class */ /*#__PURE__*/function () {
    function SimulatedClock() {
        this.timeouts = new Map();
        this._now = 0;
        this._id = 0;
    }
    SimulatedClock.prototype.now = function () {
        return this._now;
    };
    SimulatedClock.prototype.getId = function () {
        return this._id++;
    };
    SimulatedClock.prototype.setTimeout = function (fn, timeout) {
        var id = this.getId();
        this.timeouts.set(id, {
            start: this.now(),
            timeout: timeout,
            fn: fn
        });
        return id;
    };
    SimulatedClock.prototype.clearTimeout = function (id) {
        this.timeouts.delete(id);
    };
    SimulatedClock.prototype.set = function (time) {
        if (this._now > time) {
            throw new Error('Unable to travel back in time');
        }
        this._now = time;
        this.flushTimeouts();
    };
    SimulatedClock.prototype.flushTimeouts = function () {
        var _this = this;
        this.timeouts.forEach(function (timeout, id) {
            if (_this.now() - timeout.start >= timeout.timeout) {
                timeout.fn.call(null);
                _this.timeouts.delete(id);
            }
        });
    };
    SimulatedClock.prototype.increment = function (ms) {
        this._now += ms;
        this.flushTimeouts();
    };
    return SimulatedClock;
}();
export { SimulatedClock };
var Interpreter = /** @class */ /*#__PURE__*/function () {
    /**
     * Creates a new Interpreter instance (i.e., service) for the given machine with the provided options, if any.
     *
     * @param machine The machine to be interpreted
     * @param options Interpreter options
     */
    function Interpreter(machine, options) {
        if (options === void 0) {
            options = Interpreter.defaultOptions;
        }
        var _this = this;
        this.machine = machine;
        this.eventQueue = [];
        this.delayedEventsMap = {};
        this.activitiesMap = {};
        this.listeners = new Set();
        this.contextListeners = new Set();
        this.stopListeners = new Set();
        this.doneListeners = new Set();
        this.eventListeners = new Set();
        this.sendListeners = new Set();
        this.initialized = false;
        this.children = new Map();
        this.forwardTo = new Set();
        /**
         * Alias for Interpreter.prototype.start
         */
        this.init = this.start;
        /**
         * Sends an event to the running interpreter to trigger a transition,
         * and returns the immediate next state.
         *
         * @param event The event to send
         */
        this.send = function (event) {
            var eventObject = toEventObject(event);
            var nextState = _this.nextState(eventObject);
            _this.update(nextState, event);
            // Forward copy of event to child interpreters
            _this.forward(eventObject);
            return nextState;
            // tslint:disable-next-line:semicolon
        };
        /**
         * Returns a send function bound to this interpreter instance.
         *
         * @param event The event to be sent by the sender.
         */
        this.sender = function (event) {
            function sender() {
                return this.send(event);
            }
            return sender.bind(_this);
        };
        this.sendTo = function (event, to) {
            var child = to === SpecialTargets.Parent ? _this.parent : _this.children.get(to);
            if (!child) {
                throw new Error("Unable to send event to child '" + to + "' from interpreter '" + _this.id + "'.");
            }
            child.send(event);
        };
        var resolvedOptions = __assign({}, Interpreter.defaultOptions, options);
        this.clock = resolvedOptions.clock;
        this.logger = resolvedOptions.logger;
        this.parent = resolvedOptions.parent;
        this.id = resolvedOptions.id || "" + Math.round(Math.random() * 99999);
    }
    Object.defineProperty(Interpreter.prototype, "initialState", {
        /**
         * The initial state of the statechart.
         */
        get: function () {
            return this.machine.initialState;
        },
        enumerable: true,
        configurable: true
    });
    Interpreter.prototype.update = function (state, event) {
        var _this = this;
        this.state = state;
        var context = this.state.context;
        var eventObject = toEventObject(event);
        this.state.actions.forEach(function (action) {
            _this.exec(action, context, eventObject);
        }, context);
        if (eventObject) {
            this.eventListeners.forEach(function (listener) {
                return listener(eventObject);
            });
        }
        this.listeners.forEach(function (listener) {
            return listener(state, eventObject);
        });
        this.contextListeners.forEach(function (ctxListener) {
            return ctxListener(_this.state.context, _this.state.history ? _this.state.history.context : undefined);
        });
        if (this.state.tree && this.state.tree.done) {
            // get donedata
            var doneData_1 = this.state.tree.getDoneData(this.state.context, toEventObject(event));
            this.doneListeners.forEach(function (listener) {
                return listener(doneInvoke(_this.id, doneData_1));
            });
            this.stop();
        }
        this.flushEventQueue();
    };
    /*
     * Adds a listener that is notified whenever a state transition happens. The listener is called with
     * the next state and the event object that caused the state transition.
     *
     * @param listener The state listener
     */
    Interpreter.prototype.onTransition = function (listener) {
        this.listeners.add(listener);
        return this;
    };
    /**
     * Adds an event listener that is notified whenever an event is sent to the running interpreter.
     * @param listener The event listener
     */
    Interpreter.prototype.onEvent = function (listener) {
        this.eventListeners.add(listener);
        return this;
    };
    /**
     * Adds an event listener that is notified whenever a `send` event occurs.
     * @param listener The event listener
     */
    Interpreter.prototype.onSend = function (listener) {
        this.sendListeners.add(listener);
        return this;
    };
    /**
     * Adds a context listener that is notified whenever the state context changes.
     * @param listener The context listener
     */
    Interpreter.prototype.onChange = function (listener) {
        this.contextListeners.add(listener);
        return this;
    };
    /**
     * Adds a listener that is notified when the machine is stopped.
     * @param listener The listener
     */
    Interpreter.prototype.onStop = function (listener) {
        this.stopListeners.add(listener);
        return this;
    };
    /**
     * Adds a state listener that is notified when the statechart has reached its final state.
     * @param listener The state listener
     */
    Interpreter.prototype.onDone = function (listener) {
        this.doneListeners.add(listener);
        return this;
    };
    /**
     * Removes a listener.
     * @param listener The listener to remove
     */
    Interpreter.prototype.off = function (listener) {
        this.listeners.delete(listener);
        return this;
    };
    /**
     * Starts the interpreter from the given state, or the initial state.
     * @param initialState The state to start the statechart from
     */
    Interpreter.prototype.start = function (initialState) {
        if (initialState === void 0) {
            initialState = this.machine.initialState;
        }
        this.initialized = true;
        this.update(initialState, { type: actionTypes.init });
        return this;
    };
    /**
     * Stops the interpreter and unsubscribe all listeners.
     *
     * This will also notify the `onStop` listeners.
     */
    Interpreter.prototype.stop = function () {
        var _this = this;
        this.listeners.forEach(function (listener) {
            return _this.off(listener);
        });
        this.stopListeners.forEach(function (listener) {
            // call listener, then remove
            listener();
            _this.stopListeners.delete(listener);
        });
        this.contextListeners.forEach(function (ctxListener) {
            return _this.contextListeners.delete(ctxListener);
        });
        this.doneListeners.forEach(function (doneListener) {
            return _this.doneListeners.delete(doneListener);
        });
        return this;
    };
    /**
     * Returns the next state given the interpreter's current state and the event.
     *
     * This is a pure method that does _not_ update the interpreter's state.
     *
     * @param event The event to determine the next state
     */
    Interpreter.prototype.nextState = function (event) {
        var eventObject = toEventObject(event);
        if (!this.initialized) {
            throw new Error("Unable to send event \"" + eventObject.type + "\" to an uninitialized interpreter (ID: " + this.machine.id + "). Event: " + JSON.stringify(event));
        }
        var nextState = this.machine.transition(this.state, eventObject, this.state.context);
        return nextState;
    };
    Interpreter.prototype.forward = function (event) {
        var _this = this;
        this.forwardTo.forEach(function (id) {
            var child = _this.children.get(id);
            if (!child) {
                throw new Error("Unable to forward event '" + event + "' from interpreter '" + _this.id + "' to nonexistant child '" + id + "'.");
            }
            child.send(event);
        });
    };
    Interpreter.prototype.defer = function (sendAction) {
        var _this = this;
        return this.clock.setTimeout(function () {
            if (sendAction.to) {
                _this.sendTo(sendAction.event, sendAction.to);
            } else {
                _this.send(sendAction.event);
            }
        }, sendAction.delay || 0);
    };
    Interpreter.prototype.cancel = function (sendId) {
        this.clock.clearTimeout(this.delayedEventsMap[sendId]);
        delete this.delayedEventsMap[sendId];
    };
    Interpreter.prototype.exec = function (action, context, event) {
        var _this = this;
        if (action.exec) {
            return action.exec(context, event, { action: action });
        }
        switch (action.type) {
            case actionTypes.send:
                var sendAction = action;
                if (sendAction.delay) {
                    this.delayedEventsMap[sendAction.id] = this.defer(sendAction);
                    return;
                } else {
                    if (sendAction.to) {
                        this.sendTo(sendAction.event, sendAction.to);
                    } else {
                        this.eventQueue.push(sendAction.event);
                    }
                }
                break;
            case actionTypes.cancel:
                this.cancel(action.sendId);
                break;
            case actionTypes.start:
                {
                    var activity_1 = action.activity;
                    // Invoked services
                    if (activity_1.type === ActionTypes.Invoke) {
                        var service = activity_1.src ? activity_1.src instanceof StateNode ? activity_1.src : typeof activity_1.src === 'function' ? activity_1.src : this.machine.options.services ? this.machine.options.services[activity_1.src] : undefined : undefined;
                        var id_1 = activity_1.id,
                            data = activity_1.data;
                        var autoForward = !!activity_1.forward;
                        if (!service) {
                            // tslint:disable-next-line:no-console
                            console.warn("No service found for invocation '" + activity_1.src + "' in machine '" + this.machine.id + "'.");
                            return;
                        }
                        if (typeof service === 'function') {
                            var promise = service(context, event);
                            var canceled_1 = false;
                            promise.then(function (response) {
                                if (!canceled_1) {
                                    _this.send(doneInvoke(activity_1.id, response));
                                }
                            }).catch(function (e) {
                                // Send "error.execution" to this (parent).
                                _this.send(error(e, id_1));
                            });
                            this.activitiesMap[activity_1.id] = function () {
                                canceled_1 = true;
                            };
                        } else if (typeof service !== 'string') {
                            // TODO: try/catch here
                            var childMachine = service instanceof StateNode ? service : Machine(service);
                            var interpreter_1 = this.spawn(data ? childMachine.withContext(mapContext(data, context, event)) : childMachine, {
                                id: id_1,
                                autoForward: autoForward
                            }).onDone(function (doneEvent) {
                                _this.send(doneEvent); // todo: fix
                            });
                            interpreter_1.start();
                            this.activitiesMap[activity_1.id] = function () {
                                _this.children.delete(interpreter_1.id);
                                _this.forwardTo.delete(interpreter_1.id);
                                interpreter_1.stop();
                            };
                        }
                    } else {
                        var implementation = this.machine.options && this.machine.options.activities ? this.machine.options.activities[activity_1.type] : undefined;
                        if (!implementation) {
                            // tslint:disable-next-line:no-console
                            console.warn("No implementation found for activity '" + activity_1.type + "'");
                            return;
                        }
                        // Start implementation
                        this.activitiesMap[activity_1.id] = implementation(context, activity_1);
                    }
                    break;
                }
            case actionTypes.stop:
                {
                    var activity = action.activity;
                    var dispose = this.activitiesMap[activity.id];
                    if (dispose) {
                        dispose();
                    }
                    break;
                }
            case actionTypes.log:
                var expr = action.expr ? action.expr(context, event) : undefined;
                if (action.label) {
                    this.logger(action.label, expr);
                } else {
                    this.logger(expr);
                }
                break;
            default:
                // tslint:disable-next-line:no-console
                console.warn("No implementation found for action type '" + action.type + "'");
                break;
        }
        return undefined;
    };
    Interpreter.prototype.spawn = function (machine, options) {
        if (options === void 0) {
            options = {};
        }
        var childInterpreter = new Interpreter(machine, {
            parent: this,
            id: options.id || machine.id
        });
        this.children.set(childInterpreter.id, childInterpreter);
        if (options.autoForward) {
            this.forwardTo.add(childInterpreter.id);
        }
        return childInterpreter;
    };
    Interpreter.prototype.flushEventQueue = function () {
        var flushedEvent = this.eventQueue.shift();
        if (flushedEvent) {
            this.send(flushedEvent);
        }
    };
    /**
     * The default interpreter options:
     *
     * - `clock` uses the global `setTimeout` and `clearTimeout` functions
     * - `logger` uses the global `console.log()` method
     */
    Interpreter.defaultOptions = /*#__PURE__*/function (global) {
        return {
            clock: {
                setTimeout: function (fn, ms) {
                    return global.setTimeout.call(null, fn, ms);
                },
                clearTimeout: function (id) {
                    return global.clearTimeout.call(null, id);
                }
            },
            logger: global.console.log.bind(console)
        };
    }(typeof window === 'undefined' ? global : window);
    Interpreter.interpret = interpret;
    return Interpreter;
}();
export { Interpreter };
/**
 * Creates a new Interpreter instance for the given machine with the provided options, if any.
 *
 * @param machine The machine to interpret
 * @param options Interpreter options
 */
export function interpret(machine, options) {
    var interpreter = new Interpreter(machine, options);
    return interpreter;
}
"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) if (e.indexOf(p[i]) < 0)
            t[p[i]] = s[p[i]];
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
var types_1 = require("./types");
var actionTypes = require("./actionTypes");
exports.actionTypes = actionTypes;
var utils_1 = require("./utils");
function toEventObject(event
// id?: TEvent['type']
) {
    if (typeof event === 'string' || typeof event === 'number') {
        var eventObject = { type: event };
        // if (id !== undefined) {
        //   eventObject.id = id;
        // }
        return eventObject;
    }
    return event;
}
exports.toEventObject = toEventObject;
function getActionFunction(actionType, actionFunctionMap) {
    if (!actionFunctionMap) {
        return undefined;
    }
    var actionReference = actionFunctionMap[actionType];
    if (!actionReference) {
        return undefined;
    }
    if (typeof actionReference === 'function') {
        return actionReference;
    }
    return actionReference;
}
function toActionObject(action, actionFunctionMap) {
    var actionObject;
    if (typeof action === 'string' || typeof action === 'number') {
        var exec = getActionFunction(action, actionFunctionMap);
        if (typeof exec === 'function') {
            actionObject = {
                type: action,
                exec: exec
            };
        }
        else if (exec) {
            actionObject = exec;
        }
        else {
            actionObject = { type: action, exec: undefined };
        }
    }
    else if (typeof action === 'function') {
        actionObject = {
            type: action.name,
            exec: action
        };
    }
    else {
        var exec = getActionFunction(action.type, actionFunctionMap);
        if (typeof exec === 'function') {
            actionObject = __assign({}, action, { exec: exec });
        }
        else if (exec) {
            var type = action.type, other = __rest(action, ["type"]);
            actionObject = __assign({ type: type }, exec, other);
        }
        else {
            actionObject = action;
        }
    }
    Object.defineProperty(actionObject, 'toString', {
        value: function () { return actionObject.type; },
        enumerable: false,
        configurable: true
    });
    return actionObject;
}
exports.toActionObject = toActionObject;
function toActivityDefinition(action) {
    var actionObject = toActionObject(action);
    return __assign({ id: typeof action === 'string' ? action : actionObject.id }, actionObject, { type: actionObject.type });
}
exports.toActivityDefinition = toActivityDefinition;
exports.toActionObjects = function (action, actionFunctionMap) {
    if (!action) {
        return [];
    }
    var actions = Array.isArray(action) ? action : [action];
    return actions.map(function (subAction) { return toActionObject(subAction, actionFunctionMap); });
};
/**
 * Raises an event. This places the event in the internal event queue, so that
 * the event is immediately consumed by the machine in the current step.
 *
 * @param eventType The event to raise.
 */
function raise(event) {
    return {
        type: actionTypes.raise,
        event: event
    };
}
exports.raise = raise;
/**
 * Sends an event. This returns an action that will be read by an interpreter to
 * send the event in the next step, after the current step is finished executing.
 *
 * @param event The event to send.
 * @param options Options to pass into the send event:
 *  - `id` - The unique send event identifier (used with `cancel()`).
 *  - `delay` - The number of milliseconds to delay the sending of the event.
 *  - `target` - The target of this event (by default, the machine the event was sent from).
 */
function send(event, options) {
    return {
        to: options ? options.to : undefined,
        type: actionTypes.send,
        event: toEventObject(event),
        delay: options ? options.delay : undefined,
        id: options && options.id !== undefined
            ? options.id
            : utils_1.getEventType(event)
    };
}
exports.send = send;
/**
 * Sends an event to this machine's parent machine.
 *
 * @param event The event to send to the parent machine.
 * @param options Options to pass into the send event.
 */
function sendParent(event, options) {
    return send(event, __assign({}, options, { to: types_1.SpecialTargets.Parent }));
}
exports.sendParent = sendParent;
/**
 *
 * @param expr The expression function to evaluate which will be logged.
 *  Takes in 2 arguments:
 *  - `ctx` - the current state context
 *  - `event` - the event that caused this action to be executed.
 * @param label The label to give to the logged expression.
 */
function log(expr, label) {
    if (expr === void 0) { expr = function (context, event) { return ({
        context: context,
        event: event
    }); }; }
    return {
        type: actionTypes.log,
        label: label,
        expr: expr
    };
}
exports.log = log;
/**
 * Cancels an in-flight `send(...)` action. A canceled sent action will not
 * be executed, nor will its event be sent, unless it has already been sent
 * (e.g., if `cancel(...)` is called after the `send(...)` action's `delay`).
 *
 * @param sendId The `id` of the `send(...)` action to cancel.
 */
exports.cancel = function (sendId) {
    return {
        type: actionTypes.cancel,
        sendId: sendId
    };
};
/**
 * Starts an activity.
 *
 * @param activity The activity to start.
 */
function start(activity) {
    var activityDef = toActivityDefinition(activity);
    return {
        type: types_1.ActionTypes.Start,
        activity: activityDef,
        exec: undefined
    };
}
exports.start = start;
/**
 * Stops an activity.
 *
 * @param activity The activity to stop.
 */
function stop(activity) {
    var activityDef = toActivityDefinition(activity);
    return {
        type: types_1.ActionTypes.Stop,
        activity: activityDef,
        exec: undefined
    };
}
exports.stop = stop;
/**
 * Updates the current context of the machine.
 *
 * @param assignment An object that represents the partial context to update.
 */
exports.assign = function (assignment) {
    return {
        type: actionTypes.assign,
        assignment: assignment
    };
};
function isActionObject(action) {
    return typeof action === 'object' && 'type' in action;
}
exports.isActionObject = isActionObject;
/**
 * Returns an event type that represents an implicit event that
 * is sent after the specified `delay`.
 *
 * @param delay The delay in milliseconds
 * @param id The state node ID where this event is handled
 */
function after(delay, id) {
    var idSuffix = id ? "#" + id : '';
    return types_1.ActionTypes.After + "(" + delay + ")" + idSuffix;
}
exports.after = after;
/**
 * Returns an event that represents that a final state node
 * has been reached in the parent state node.
 *
 * @param id The final state node's parent state node `id`
 * @param data The data to pass into the event
 */
function done(id, data) {
    var type = types_1.ActionTypes.DoneState + "." + id;
    var eventObject = {
        type: type,
        data: data
    };
    eventObject.toString = function () { return type; };
    return eventObject;
}
exports.done = done;
/**
 * Returns an event that represents that an invoked service has terminated.
 *
 * An invoked service is terminated when it has reached a top-level final state node,
 * but not when it is canceled.
 *
 * @param id The final state node ID
 * @param data The data to pass into the event
 */
function doneInvoke(id, data) {
    var type = types_1.ActionTypes.DoneInvoke + "." + id;
    var eventObject = {
        type: type,
        data: data
    };
    eventObject.toString = function () { return type; };
    return eventObject;
}
exports.doneInvoke = doneInvoke;
/**
 * Invokes (spawns) a child service, as a separate interpreted machine.
 *
 * @param invokeConfig The string service to invoke, or a config object:
 *  - `src` - The source (URL) of the machine definition to invoke
 *  - `forward` - Whether events sent to this machine are sent (forwarded) to the
 *    invoked machine.
 * @param options
 */
function invoke(invokeConfig, options) {
    if (typeof invokeConfig === 'string') {
        return __assign({ id: invokeConfig, src: invokeConfig, type: types_1.ActionTypes.Invoke }, options);
    }
    if (!('src' in invokeConfig)) {
        var machine = invokeConfig;
        return {
            type: types_1.ActionTypes.Invoke,
            id: machine.id,
            src: machine
        };
    }
    return __assign({ type: types_1.ActionTypes.Invoke }, invokeConfig, { id: invokeConfig.id ||
            (typeof invokeConfig.src === 'string'
                ? invokeConfig.src
                : typeof invokeConfig.src === 'function'
                    ? 'promise'
                    : invokeConfig.src.id) });
}
exports.invoke = invoke;
function error(data, src) {
    return {
        src: src,
        type: types_1.ActionTypes.ErrorExecution,
        data: data
    };
}
exports.error = error;

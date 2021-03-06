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
var __rest = this && this.__rest || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0) t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function") for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) if (e.indexOf(p[i]) < 0) t[p[i]] = s[p[i]];
    return t;
};
import { ActionTypes, SpecialTargets } from './types';
import * as actionTypes from './actionTypes';
import { getEventType } from './utils';
export { actionTypes };
export function toEventObject(event
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
export function toActionObject(action, actionFunctionMap) {
    var actionObject;
    if (typeof action === 'string' || typeof action === 'number') {
        var exec = getActionFunction(action, actionFunctionMap);
        if (typeof exec === 'function') {
            actionObject = {
                type: action,
                exec: exec
            };
        } else if (exec) {
            actionObject = exec;
        } else {
            actionObject = { type: action, exec: undefined };
        }
    } else if (typeof action === 'function') {
        actionObject = {
            type: action.name,
            exec: action
        };
    } else {
        var exec = getActionFunction(action.type, actionFunctionMap);
        if (typeof exec === 'function') {
            actionObject = __assign({}, action, { exec: exec });
        } else if (exec) {
            var type = action.type,
                other = __rest(action, ["type"]);
            actionObject = __assign({ type: type }, exec, other);
        } else {
            actionObject = action;
        }
    }
    Object.defineProperty(actionObject, 'toString', {
        value: function () {
            return actionObject.type;
        },
        enumerable: false,
        configurable: true
    });
    return actionObject;
}
export function toActivityDefinition(action) {
    var actionObject = toActionObject(action);
    return __assign({ id: typeof action === 'string' ? action : actionObject.id }, actionObject, { type: actionObject.type });
}
export var toActionObjects = function (action, actionFunctionMap) {
    if (!action) {
        return [];
    }
    var actions = Array.isArray(action) ? action : [action];
    return actions.map(function (subAction) {
        return toActionObject(subAction, actionFunctionMap);
    });
};
/**
 * Raises an event. This places the event in the internal event queue, so that
 * the event is immediately consumed by the machine in the current step.
 *
 * @param eventType The event to raise.
 */
export function raise(event) {
    return {
        type: actionTypes.raise,
        event: event
    };
}
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
export function send(event, options) {
    return {
        to: options ? options.to : undefined,
        type: actionTypes.send,
        event: toEventObject(event),
        delay: options ? options.delay : undefined,
        id: options && options.id !== undefined ? options.id : getEventType(event)
    };
}
/**
 * Sends an event to this machine's parent machine.
 *
 * @param event The event to send to the parent machine.
 * @param options Options to pass into the send event.
 */
export function sendParent(event, options) {
    return send(event, __assign({}, options, { to: SpecialTargets.Parent }));
}
/**
 *
 * @param expr The expression function to evaluate which will be logged.
 *  Takes in 2 arguments:
 *  - `ctx` - the current state context
 *  - `event` - the event that caused this action to be executed.
 * @param label The label to give to the logged expression.
 */
export function log(expr, label) {
    if (expr === void 0) {
        expr = function (context, event) {
            return {
                context: context,
                event: event
            };
        };
    }
    return {
        type: actionTypes.log,
        label: label,
        expr: expr
    };
}
/**
 * Cancels an in-flight `send(...)` action. A canceled sent action will not
 * be executed, nor will its event be sent, unless it has already been sent
 * (e.g., if `cancel(...)` is called after the `send(...)` action's `delay`).
 *
 * @param sendId The `id` of the `send(...)` action to cancel.
 */
export var cancel = function (sendId) {
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
export function start(activity) {
    var activityDef = toActivityDefinition(activity);
    return {
        type: ActionTypes.Start,
        activity: activityDef,
        exec: undefined
    };
}
/**
 * Stops an activity.
 *
 * @param activity The activity to stop.
 */
export function stop(activity) {
    var activityDef = toActivityDefinition(activity);
    return {
        type: ActionTypes.Stop,
        activity: activityDef,
        exec: undefined
    };
}
/**
 * Updates the current context of the machine.
 *
 * @param assignment An object that represents the partial context to update.
 */
export var assign = function (assignment) {
    return {
        type: actionTypes.assign,
        assignment: assignment
    };
};
export function isActionObject(action) {
    return typeof action === 'object' && 'type' in action;
}
/**
 * Returns an event type that represents an implicit event that
 * is sent after the specified `delay`.
 *
 * @param delay The delay in milliseconds
 * @param id The state node ID where this event is handled
 */
export function after(delay, id) {
    var idSuffix = id ? "#" + id : '';
    return ActionTypes.After + "(" + delay + ")" + idSuffix;
}
/**
 * Returns an event that represents that a final state node
 * has been reached in the parent state node.
 *
 * @param id The final state node's parent state node `id`
 * @param data The data to pass into the event
 */
export function done(id, data) {
    var type = ActionTypes.DoneState + "." + id;
    var eventObject = {
        type: type,
        data: data
    };
    eventObject.toString = function () {
        return type;
    };
    return eventObject;
}
/**
 * Returns an event that represents that an invoked service has terminated.
 *
 * An invoked service is terminated when it has reached a top-level final state node,
 * but not when it is canceled.
 *
 * @param id The final state node ID
 * @param data The data to pass into the event
 */
export function doneInvoke(id, data) {
    var type = ActionTypes.DoneInvoke + "." + id;
    var eventObject = {
        type: type,
        data: data
    };
    eventObject.toString = function () {
        return type;
    };
    return eventObject;
}
/**
 * Invokes (spawns) a child service, as a separate interpreted machine.
 *
 * @param invokeConfig The string service to invoke, or a config object:
 *  - `src` - The source (URL) of the machine definition to invoke
 *  - `forward` - Whether events sent to this machine are sent (forwarded) to the
 *    invoked machine.
 * @param options
 */
export function invoke(invokeConfig, options) {
    if (typeof invokeConfig === 'string') {
        return __assign({ id: invokeConfig, src: invokeConfig, type: ActionTypes.Invoke }, options);
    }
    if (!('src' in invokeConfig)) {
        var machine = invokeConfig;
        return {
            type: ActionTypes.Invoke,
            id: machine.id,
            src: machine
        };
    }
    return __assign({ type: ActionTypes.Invoke }, invokeConfig, { id: invokeConfig.id || (typeof invokeConfig.src === 'string' ? invokeConfig.src : typeof invokeConfig.src === 'function' ? 'promise' : invokeConfig.src.id) });
}
export function error(data, src) {
    return {
        src: src,
        type: ActionTypes.ErrorExecution,
        data: data
    };
}
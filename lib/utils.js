"use strict";
var __values = (this && this.__values) || function (o) {
    var m = typeof Symbol === "function" && o[Symbol.iterator], i = 0;
    if (m) return m.call(o);
    return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
};
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __spread = (this && this.__spread) || function () {
    for (var ar = [], i = 0; i < arguments.length; i++) ar = ar.concat(__read(arguments[i]));
    return ar;
};
Object.defineProperty(exports, "__esModule", { value: true });
var constants_1 = require("./constants");
function isState(state) {
    if (typeof state === 'string') {
        return false;
    }
    return 'value' in state && 'tree' in state && 'history' in state;
}
function keys(value) {
    return Object.keys(value);
}
exports.keys = keys;
function matchesState(parentStateId, childStateId, delimiter) {
    if (delimiter === void 0) { delimiter = constants_1.STATE_DELIMITER; }
    var parentStateValue = toStateValue(parentStateId, delimiter);
    var childStateValue = toStateValue(childStateId, delimiter);
    if (typeof childStateValue === 'string') {
        if (typeof parentStateValue === 'string') {
            return childStateValue === parentStateValue;
        }
        // Parent more specific than child
        return false;
    }
    if (typeof parentStateValue === 'string') {
        return parentStateValue in childStateValue;
    }
    return keys(parentStateValue).every(function (key) {
        if (!(key in childStateValue)) {
            return false;
        }
        return matchesState(parentStateValue[key], childStateValue[key]);
    });
}
exports.matchesState = matchesState;
function getEventType(event) {
    try {
        return typeof event === 'string' || typeof event === 'number'
            ? "" + event
            : event.type;
    }
    catch (e) {
        throw new Error('Events must be strings or objects with a string event.type property.');
    }
}
exports.getEventType = getEventType;
function getActionType(action) {
    try {
        return typeof action === 'string' || typeof action === 'number'
            ? "" + action
            : typeof action === 'function'
                ? action.name
                : action.type;
    }
    catch (e) {
        throw new Error('Actions must be strings or objects with a string action.type property.');
    }
}
exports.getActionType = getActionType;
function toStatePath(stateId, delimiter) {
    try {
        if (Array.isArray(stateId)) {
            return stateId;
        }
        return stateId.toString().split(delimiter);
    }
    catch (e) {
        throw new Error("'" + stateId + "' is not a valid state path.");
    }
}
exports.toStatePath = toStatePath;
function toStateValue(stateValue, delimiter) {
    if (isState(stateValue)) {
        return stateValue.value;
    }
    if (Array.isArray(stateValue)) {
        return pathToStateValue(stateValue);
    }
    if (typeof stateValue !== 'string' && !isState(stateValue)) {
        return stateValue;
    }
    var statePath = toStatePath(stateValue, delimiter);
    return pathToStateValue(statePath);
}
exports.toStateValue = toStateValue;
function pathToStateValue(statePath) {
    if (statePath.length === 1) {
        return statePath[0];
    }
    var value = {};
    var marker = value;
    for (var i = 0; i < statePath.length - 1; i++) {
        if (i === statePath.length - 2) {
            marker[statePath[i]] = statePath[i + 1];
        }
        else {
            marker[statePath[i]] = {};
            marker = marker[statePath[i]];
        }
    }
    return value;
}
exports.pathToStateValue = pathToStateValue;
function mapValues(collection, iteratee) {
    var result = {};
    keys(collection).forEach(function (key, i) {
        result[key] = iteratee(collection[key], key, collection, i);
    });
    return result;
}
exports.mapValues = mapValues;
function mapFilterValues(collection, iteratee, predicate) {
    var result = {};
    keys(collection).forEach(function (key) {
        var item = collection[key];
        if (!predicate(item)) {
            return;
        }
        result[key] = iteratee(item, key, collection);
    });
    return result;
}
exports.mapFilterValues = mapFilterValues;
/**
 * Retrieves a value at the given path.
 * @param props The deep path to the prop of the desired value
 */
exports.path = function (props) { return function (object) {
    var e_1, _a;
    var result = object;
    try {
        for (var props_1 = __values(props), props_1_1 = props_1.next(); !props_1_1.done; props_1_1 = props_1.next()) {
            var prop = props_1_1.value;
            result = result[prop];
        }
    }
    catch (e_1_1) { e_1 = { error: e_1_1 }; }
    finally {
        try {
            if (props_1_1 && !props_1_1.done && (_a = props_1.return)) _a.call(props_1);
        }
        finally { if (e_1) throw e_1.error; }
    }
    return result;
}; };
/**
 * Retrieves a value at the given path via the nested accessor prop.
 * @param props The deep path to the prop of the desired value
 */
function nestedPath(props, accessorProp) {
    return function (object) {
        var e_2, _a;
        var result = object;
        try {
            for (var props_2 = __values(props), props_2_1 = props_2.next(); !props_2_1.done; props_2_1 = props_2.next()) {
                var prop = props_2_1.value;
                result = result[accessorProp][prop];
            }
        }
        catch (e_2_1) { e_2 = { error: e_2_1 }; }
        finally {
            try {
                if (props_2_1 && !props_2_1.done && (_a = props_2.return)) _a.call(props_2);
            }
            finally { if (e_2) throw e_2.error; }
        }
        return result;
    };
}
exports.nestedPath = nestedPath;
exports.toStatePaths = function (stateValue) {
    if (!stateValue) {
        return [[]];
    }
    if (typeof stateValue === 'string') {
        return [[stateValue]];
    }
    var result = flatten(keys(stateValue).map(function (key) {
        var subStateValue = stateValue[key];
        if (typeof subStateValue !== 'string' &&
            !Object.keys(subStateValue).length) {
            return [[key]];
        }
        return exports.toStatePaths(stateValue[key]).map(function (subPath) {
            return [key].concat(subPath);
        });
    }));
    return result;
};
exports.pathsToStateValue = function (paths) {
    var e_3, _a;
    var result = {};
    if (paths && paths.length === 1 && paths[0].length === 1) {
        return paths[0][0];
    }
    try {
        for (var paths_1 = __values(paths), paths_1_1 = paths_1.next(); !paths_1_1.done; paths_1_1 = paths_1.next()) {
            var currentPath = paths_1_1.value;
            var marker = result;
            // tslint:disable-next-line:prefer-for-of
            for (var i = 0; i < currentPath.length; i++) {
                var subPath = currentPath[i];
                if (i === currentPath.length - 2) {
                    marker[subPath] = currentPath[i + 1];
                    break;
                }
                marker[subPath] = marker[subPath] || {};
                marker = marker[subPath];
            }
        }
    }
    catch (e_3_1) { e_3 = { error: e_3_1 }; }
    finally {
        try {
            if (paths_1_1 && !paths_1_1.done && (_a = paths_1.return)) _a.call(paths_1);
        }
        finally { if (e_3) throw e_3.error; }
    }
    return result;
};
function flatten(array) {
    var _a;
    return (_a = []).concat.apply(_a, __spread(array));
}
exports.flatten = flatten;
function toArray(value) {
    if (Array.isArray(value)) {
        return value;
    }
    if (value === undefined) {
        return [];
    }
    return [value];
}
exports.toArray = toArray;
function mapContext(mapper, context, event) {
    if (typeof mapper === 'function') {
        return mapper(context, event);
    }
    return keys(mapper).reduce(function (acc, key) {
        var subMapper = mapper[key];
        if (typeof subMapper === 'function') {
            acc[key] = subMapper(context, event);
        }
        else {
            acc[key] = subMapper;
        }
        return acc;
    }, {});
}
exports.mapContext = mapContext;

"use strict";
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) if (e.indexOf(p[i]) < 0)
            t[p[i]] = s[p[i]];
    return t;
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
Object.defineProperty(exports, "__esModule", { value: true });
var index_1 = require("./index");
var utils_1 = require("./utils");
var EMPTY_MAP = {};
function getNodes(node) {
    var states = node.states;
    var nodes = utils_1.keys(states).reduce(function (accNodes, stateKey) {
        var subState = states[stateKey];
        var subNodes = getNodes(states[stateKey]);
        accNodes.push.apply(accNodes, __spread([subState], subNodes));
        return accNodes;
    }, []);
    return nodes;
}
exports.getNodes = getNodes;
function getEventEdges(node, event) {
    var transitions = node.definition.on[event];
    return utils_1.flatten(transitions.map(function (transition) {
        var targets = transition.target
            ? [].concat(transition.target)
            : undefined;
        if (!targets) {
            return [
                {
                    source: node,
                    target: node,
                    event: event,
                    actions: transition.actions
                        ? transition.actions.map(utils_1.getActionType)
                        : [],
                    cond: transition.cond,
                    transition: transition
                }
            ];
        }
        return targets
            .map(function (target) {
            try {
                var targetNode = target
                    ? node.getRelativeStateNodes(target, undefined, false)[0]
                    : node;
                return {
                    source: node,
                    target: targetNode,
                    event: event,
                    actions: transition.actions
                        ? transition.actions.map(utils_1.getActionType)
                        : [],
                    cond: transition.cond,
                    transition: transition
                };
            }
            catch (e) {
                // tslint:disable-next-line:no-console
                console.warn("Target '" + target + "' not found on '" + node.id + "'");
                return undefined;
            }
        })
            .filter(function (maybeEdge) { return maybeEdge !== undefined; });
    }));
}
exports.getEventEdges = getEventEdges;
function getEdges(node, options) {
    var _a = (options || {}).depth, depth = _a === void 0 ? null : _a;
    var edges = [];
    if (node.states && depth === null) {
        utils_1.keys(node.states).forEach(function (stateKey) {
            edges.push.apply(edges, __spread(getEdges(node.states[stateKey])));
        });
    }
    else if (depth && depth > 0) {
        utils_1.keys(node.states).forEach(function (stateKey) {
            edges.push.apply(edges, __spread(getEdges(node.states[stateKey], { depth: depth - 1 })));
        });
    }
    utils_1.keys(node.on).forEach(function (event) {
        edges.push.apply(edges, __spread(getEventEdges(node, event)));
    });
    return edges;
}
exports.getEdges = getEdges;
function getAdjacencyMap(node, context) {
    var adjacency = {};
    var events = node.events;
    function findAdjacencies(stateValue) {
        var e_1, _a;
        var stateKey = JSON.stringify(stateValue);
        if (adjacency[stateKey]) {
            return;
        }
        adjacency[stateKey] = {};
        try {
            for (var events_1 = __values(events), events_1_1 = events_1.next(); !events_1_1.done; events_1_1 = events_1.next()) {
                var event_1 = events_1_1.value;
                var nextState = node.transition(stateValue, event_1, context);
                adjacency[stateKey][event_1] = { state: nextState.value };
                findAdjacencies(nextState.value);
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (events_1_1 && !events_1_1.done && (_a = events_1.return)) _a.call(events_1);
            }
            finally { if (e_1) throw e_1.error; }
        }
    }
    findAdjacencies(node.initialState.value);
    return adjacency;
}
exports.getAdjacencyMap = getAdjacencyMap;
function eventToString(event) {
    if (typeof event === 'string' || typeof event === 'number') {
        return "" + event;
    }
    // @ts-ignore - TODO: fix?
    var type = event.type, rest = __rest(event, ["type"]);
    return type + " | " + JSON.stringify(rest);
}
function deserializeStateString(valueContextString) {
    var _a = __read(valueContextString.split(' | '), 2), valueString = _a[0], contextString = _a[1];
    return {
        value: JSON.parse(valueString),
        context: JSON.parse(contextString)
    };
}
exports.deserializeStateString = deserializeStateString;
function serializeState(state) {
    var value = state.value, context = state.context;
    return JSON.stringify(value) + ' | ' + JSON.stringify(context);
}
exports.serializeState = serializeState;
function getValueAdjacencyMap(node, options) {
    var events = options.events, filter = options.filter;
    var adjacency = {};
    var potentialEvents = utils_1.flatten(
    // @ts-ignore
    node.events.map(function (event) { return events[event] || [event]; }));
    function findAdjacencies(state) {
        var e_2, _a;
        var stateKey = serializeState(state);
        if (adjacency[stateKey]) {
            return;
        }
        adjacency[stateKey] = {};
        try {
            for (var potentialEvents_1 = __values(potentialEvents), potentialEvents_1_1 = potentialEvents_1.next(); !potentialEvents_1_1.done; potentialEvents_1_1 = potentialEvents_1.next()) {
                var event_2 = potentialEvents_1_1.value;
                var nextState = node.transition(state, event_2);
                if (!filter || filter(nextState)) {
                    adjacency[stateKey][eventToString(event_2)] = {
                        value: nextState.value,
                        context: nextState.context
                    };
                    findAdjacencies(nextState);
                }
            }
        }
        catch (e_2_1) { e_2 = { error: e_2_1 }; }
        finally {
            try {
                if (potentialEvents_1_1 && !potentialEvents_1_1.done && (_a = potentialEvents_1.return)) _a.call(potentialEvents_1);
            }
            finally { if (e_2) throw e_2.error; }
        }
    }
    findAdjacencies(node.initialState);
    return adjacency;
}
exports.getValueAdjacencyMap = getValueAdjacencyMap;
function getShortestValuePaths(machine, options) {
    if (!machine.states) {
        return EMPTY_MAP;
    }
    var adjacency = getValueAdjacencyMap(machine, options);
    var pathMap = {};
    var visited = new Set();
    function util(state) {
        var e_3, _a, e_4, _b;
        var stateKey = serializeState(state);
        visited.add(stateKey);
        var eventMap = adjacency[stateKey];
        try {
            for (var _c = __values(utils_1.keys(eventMap)), _d = _c.next(); !_d.done; _d = _c.next()) {
                var event_3 = _d.value;
                var _e = eventMap[event_3], value = _e.value, context_1 = _e.context;
                if (!value) {
                    continue;
                }
                var nextState = index_1.State.from(value, context_1);
                var nextStateId = serializeState(nextState);
                if (!pathMap[nextStateId] ||
                    pathMap[nextStateId].length > pathMap[stateKey].length + 1) {
                    pathMap[nextStateId] = __spread((pathMap[stateKey] || []), [
                        { state: value, event: event_3 }
                    ]);
                }
            }
        }
        catch (e_3_1) { e_3 = { error: e_3_1 }; }
        finally {
            try {
                if (_d && !_d.done && (_a = _c.return)) _a.call(_c);
            }
            finally { if (e_3) throw e_3.error; }
        }
        try {
            for (var _f = __values(utils_1.keys(eventMap)), _g = _f.next(); !_g.done; _g = _f.next()) {
                var event_4 = _g.value;
                var _h = eventMap[event_4], value = _h.value, context_2 = _h.context;
                if (!value) {
                    continue;
                }
                var nextState = index_1.State.from(value, context_2);
                var nextStateId = serializeState(index_1.State.from(value, context_2));
                if (visited.has(nextStateId)) {
                    continue;
                }
                util(nextState);
            }
        }
        catch (e_4_1) { e_4 = { error: e_4_1 }; }
        finally {
            try {
                if (_g && !_g.done && (_b = _f.return)) _b.call(_f);
            }
            finally { if (e_4) throw e_4.error; }
        }
        return pathMap;
    }
    util(machine.initialState);
    return pathMap;
}
exports.getShortestValuePaths = getShortestValuePaths;
function getShortestPaths(machine, context) {
    var _a;
    if (!machine.states) {
        return EMPTY_MAP;
    }
    var adjacency = getAdjacencyMap(machine, context);
    var initialStateId = JSON.stringify(machine.initialState.value);
    var pathMap = (_a = {},
        _a[initialStateId] = [],
        _a);
    var visited = new Set();
    function util(stateValue) {
        var e_5, _a, e_6, _b;
        var stateId = JSON.stringify(stateValue);
        visited.add(stateId);
        var eventMap = adjacency[stateId];
        try {
            for (var _c = __values(utils_1.keys(eventMap)), _d = _c.next(); !_d.done; _d = _c.next()) {
                var event_5 = _d.value;
                var nextStateValue = eventMap[event_5].state;
                if (!nextStateValue) {
                    continue;
                }
                var nextStateId = JSON.stringify(utils_1.toStateValue(nextStateValue, machine.delimiter));
                if (!pathMap[nextStateId] ||
                    pathMap[nextStateId].length > pathMap[stateId].length + 1) {
                    pathMap[nextStateId] = __spread((pathMap[stateId] || []), [
                        { state: stateValue, event: event_5 }
                    ]);
                }
            }
        }
        catch (e_5_1) { e_5 = { error: e_5_1 }; }
        finally {
            try {
                if (_d && !_d.done && (_a = _c.return)) _a.call(_c);
            }
            finally { if (e_5) throw e_5.error; }
        }
        try {
            for (var _e = __values(utils_1.keys(eventMap)), _f = _e.next(); !_f.done; _f = _e.next()) {
                var event_6 = _f.value;
                var nextStateValue = eventMap[event_6].state;
                if (!nextStateValue) {
                    continue;
                }
                var nextStateId = JSON.stringify(nextStateValue);
                if (visited.has(nextStateId)) {
                    continue;
                }
                util(nextStateValue);
            }
        }
        catch (e_6_1) { e_6 = { error: e_6_1 }; }
        finally {
            try {
                if (_f && !_f.done && (_b = _e.return)) _b.call(_e);
            }
            finally { if (e_6) throw e_6.error; }
        }
        return pathMap;
    }
    util(machine.initialState.value);
    return pathMap;
}
exports.getShortestPaths = getShortestPaths;
function getShortestPathsAsArray(machine, context) {
    var result = getShortestPaths(machine, context);
    return utils_1.keys(result).map(function (key) { return ({
        state: JSON.parse(key),
        path: result[key]
    }); });
}
exports.getShortestPathsAsArray = getShortestPathsAsArray;
function getSimplePaths(machine, context) {
    if (!machine.states) {
        return EMPTY_MAP;
    }
    var adjacency = getAdjacencyMap(machine, context);
    var visited = new Set();
    var path = [];
    var paths = {};
    function util(fromPathId, toPathId) {
        var e_7, _a;
        visited.add(fromPathId);
        if (fromPathId === toPathId) {
            paths[toPathId] = paths[toPathId] || [];
            paths[toPathId].push(__spread(path));
        }
        else {
            try {
                for (var _b = __values(utils_1.keys(adjacency[fromPathId])), _c = _b.next(); !_c.done; _c = _b.next()) {
                    var subEvent = _c.value;
                    var nextStateValue = adjacency[fromPathId][subEvent].state;
                    if (!nextStateValue) {
                        continue;
                    }
                    var nextStateId = JSON.stringify(nextStateValue);
                    if (!visited.has(nextStateId)) {
                        path.push({ state: JSON.parse(fromPathId), event: subEvent });
                        util(nextStateId, toPathId);
                    }
                }
            }
            catch (e_7_1) { e_7 = { error: e_7_1 }; }
            finally {
                try {
                    if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                }
                finally { if (e_7) throw e_7.error; }
            }
        }
        path.pop();
        visited.delete(fromPathId);
    }
    var initialStateId = JSON.stringify(machine.initialState.value);
    utils_1.keys(adjacency).forEach(function (nextStateId) {
        util(initialStateId, nextStateId);
    });
    return paths;
}
exports.getSimplePaths = getSimplePaths;
function getSimplePathsAsArray(machine, context) {
    var result = getSimplePaths(machine, context);
    return utils_1.keys(result).map(function (key) { return ({
        state: JSON.parse(key),
        paths: result[key]
    }); });
}
exports.getSimplePathsAsArray = getSimplePathsAsArray;

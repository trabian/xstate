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
var utils_1 = require("./utils");
var types_1 = require("./types");
var utils_2 = require("./utils");
var State_1 = require("./State");
var actionTypes = require("./actionTypes");
var actions_1 = require("./actions");
var StateTree_1 = require("./StateTree");
var STATE_DELIMITER = '.';
var NULL_EVENT = '';
var STATE_IDENTIFIER = '#';
var TARGETLESS_KEY = '';
var EMPTY_OBJECT = {};
var isStateId = function (str) { return str[0] === STATE_IDENTIFIER; };
var createDefaultOptions = function () { return ({
    guards: EMPTY_OBJECT
}); };
var IS_PRODUCTION = typeof process !== 'undefined' ? process.env.NODE_ENV === 'production' : true;
var StateNode = /** @class */ (function () {
    function StateNode(_config, options, 
    /**
     * The initial extended state
     */
    context) {
        if (options === void 0) { options = createDefaultOptions(); }
        var _this = this;
        this._config = _config;
        this.options = options;
        this.context = context;
        this.__cache = {
            events: undefined,
            relativeValue: new Map(),
            initialState: undefined
        };
        this.idMap = {};
        this.key = _config.key || _config.id || '(machine)';
        this.parent = _config.parent;
        this.machine = this.parent ? this.parent.machine : this;
        this.path = this.parent ? this.parent.path.concat(this.key) : [];
        this.delimiter =
            _config.delimiter ||
                (this.parent ? this.parent.delimiter : STATE_DELIMITER);
        this.id =
            _config.id ||
                (this.machine
                    ? __spread([this.machine.key], this.path).join(this.delimiter)
                    : this.key);
        this.type =
            _config.type ||
                (_config.parallel
                    ? 'parallel'
                    : _config.states && utils_1.keys(_config.states).length
                        ? 'compound'
                        : _config.history
                            ? 'history'
                            : 'atomic');
        if (!IS_PRODUCTION && 'parallel' in _config) {
            // tslint:disable-next-line:no-console
            console.warn("The \"parallel\" property is deprecated and will be removed in version 4.1. " + (_config.parallel
                ? "Replace with `type: 'parallel'`"
                : "Use `type: '" + this.type + "'`") + " in the config for state node '" + this.id + "' instead.");
        }
        this.initial = _config.initial;
        this.order = _config.order || -1;
        this.states = (_config.states
            ? utils_1.mapValues(_config.states, function (stateConfig, key, _, i) {
                var _a;
                var stateNode = new StateNode(__assign({}, stateConfig, { key: key, order: stateConfig.order === undefined ? stateConfig.order : i, parent: _this }));
                Object.assign(_this.idMap, __assign((_a = {}, _a[stateNode.id] = stateNode, _a), stateNode.idMap));
                return stateNode;
            })
            : EMPTY_OBJECT);
        // History config
        this.history =
            _config.history === true ? 'shallow' : _config.history || false;
        this.transient = !!(_config.on && _config.on[NULL_EVENT]);
        this.strict = !!_config.strict;
        this.onEntry = utils_1.toArray(_config.onEntry).map(function (action) {
            return actions_1.toActionObject(action);
        });
        this.onExit = utils_1.toArray(_config.onExit).map(function (action) { return actions_1.toActionObject(action); });
        this.meta = _config.meta;
        this.data =
            this.type === 'final'
                ? _config.data
                : undefined;
        this.invoke = utils_1.toArray(_config.invoke).map(function (invokeConfig) {
            return actions_1.invoke(invokeConfig);
        });
        this.activities = utils_1.toArray(_config.activities)
            .concat(this.invoke)
            .map(function (activity) { return _this.resolveActivity(activity); });
    }
    /**
     * Clones this state machine with custom options and context.
     *
     * @param options Options (actions, guards, activities, services) to recursively merge with the existing options.
     * @param context Custom context (will override predefined context)
     */
    StateNode.prototype.withConfig = function (options, context) {
        var _a = this.options, actions = _a.actions, activities = _a.activities, guards = _a.guards;
        return new StateNode(this.definition, {
            actions: __assign({}, actions, options.actions),
            activities: __assign({}, activities, options.activities),
            guards: __assign({}, guards, options.guards)
        }, context);
    };
    /**
     * Clones this state machine with custom context.
     *
     * @param context Custom context (will override predefined context, not recursive)
     */
    StateNode.prototype.withContext = function (context) {
        return new StateNode(this.definition, this.options, context);
    };
    Object.defineProperty(StateNode.prototype, "definition", {
        /**
         * The well-structured state node definition.
         */
        get: function () {
            return {
                id: this.id,
                key: this.key,
                type: this.type,
                initial: this.initial,
                history: this.history,
                states: utils_1.mapValues(this.states, function (state) { return state.definition; }),
                on: this.on,
                onEntry: this.onEntry,
                onExit: this.onExit,
                activities: this.activities || [],
                meta: this.meta,
                order: this.order || -1,
                data: this.data
            };
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(StateNode.prototype, "config", {
        /**
         * The raw config used to create the machine.
         */
        get: function () {
            var _a = this._config, parent = _a.parent, config = __rest(_a, ["parent"]);
            return config;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(StateNode.prototype, "on", {
        /**
         * The mapping of events to transitions.
         */
        get: function () {
            return this.formatTransitions();
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(StateNode.prototype, "transitions", {
        /**
         * All the transitions that can be taken from this state node.
         */
        get: function () {
            var _this = this;
            return utils_1.flatten(utils_1.keys(this.on).map(function (event) { return _this.on[event]; }));
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(StateNode.prototype, "after", {
        /**
         * All delayed transitions from the config.
         */
        get: function () {
            var _this = this;
            var afterConfig = this.config.after;
            if (!afterConfig) {
                return [];
            }
            if (Array.isArray(afterConfig)) {
                return afterConfig.map(function (delayedTransition) { return (__assign({ event: actions_1.after(delayedTransition.delay, _this.id) }, delayedTransition, { actions: utils_1.toArray(delayedTransition.actions).map(function (action) {
                        return actions_1.toActionObject(action);
                    }) })); });
            }
            var allDelayedTransitions = utils_1.flatten(utils_1.keys(afterConfig).map(function (delayKey) {
                var delayedTransition = afterConfig[delayKey];
                var delay = +delayKey;
                var event = actions_1.after(delay, _this.id);
                if (typeof delayedTransition === 'string') {
                    return [{ target: delayedTransition, delay: delay, event: event, actions: [] }];
                }
                var delayedTransitions = utils_1.toArray(delayedTransition);
                return delayedTransitions.map(function (transition) { return (__assign({ event: event,
                    delay: delay }, transition, { actions: utils_1.toArray(transition.actions).map(function (action) {
                        return actions_1.toActionObject(action);
                    }) })); });
            }));
            allDelayedTransitions.sort(function (a, b) { return a.delay - b.delay; });
            return allDelayedTransitions;
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Returns the state nodes represented by the current state value.
     *
     * @param state The state value or State instance
     */
    StateNode.prototype.getStateNodes = function (state) {
        var _this = this;
        var _a;
        if (!state) {
            return [];
        }
        var stateValue = state instanceof State_1.State
            ? state.value
            : utils_1.toStateValue(state, this.delimiter);
        if (typeof stateValue === 'string') {
            var initialStateValue = this.getStateNode(stateValue).initial;
            return initialStateValue
                ? this.getStateNodes((_a = {}, _a[stateValue] = initialStateValue, _a))
                : [this.states[stateValue]];
        }
        var subStateKeys = utils_1.keys(stateValue);
        var subStateNodes = subStateKeys.map(function (subStateKey) { return _this.getStateNode(subStateKey); });
        return subStateNodes.concat(subStateKeys.reduce(function (allSubStateNodes, subStateKey) {
            var subStateNode = _this.getStateNode(subStateKey).getStateNodes(stateValue[subStateKey]);
            return allSubStateNodes.concat(subStateNode);
        }, []));
    };
    /**
     * Whether this state node explicitly handles the given event.
     *
     * @param event The event in question
     */
    StateNode.prototype.handles = function (event) {
        var eventType = utils_1.getEventType(event);
        return this.events.indexOf(eventType) !== -1;
    };
    StateNode.prototype.transitionLeafNode = function (stateValue, state, eventObject, context) {
        var stateNode = this.getStateNode(stateValue);
        var next = stateNode.next(state, eventObject, context);
        if (!next.tree) {
            var _a = this.next(state, eventObject, context), reentryStates = _a.reentryStates, actions = _a.actions, tree = _a.tree;
            return {
                tree: tree,
                source: state,
                reentryStates: reentryStates,
                actions: actions
            };
        }
        return next;
    };
    StateNode.prototype.transitionCompoundNode = function (stateValue, state, eventObject, context) {
        var subStateKeys = utils_1.keys(stateValue);
        var stateNode = this.getStateNode(subStateKeys[0]);
        var next = stateNode._transition(stateValue[subStateKeys[0]], state, eventObject, context);
        if (!next.tree) {
            var _a = this.next(state, eventObject, context), reentryStates = _a.reentryStates, actions = _a.actions, tree = _a.tree;
            return {
                tree: tree,
                source: state,
                reentryStates: reentryStates,
                actions: actions
            };
        }
        return next;
    };
    StateNode.prototype.transitionParallelNode = function (stateValue, state, eventObject, context) {
        var _this = this;
        var noTransitionKeys = [];
        var transitionMap = {};
        utils_1.keys(stateValue).forEach(function (subStateKey) {
            var subStateValue = stateValue[subStateKey];
            if (!subStateValue) {
                return;
            }
            var subStateNode = _this.getStateNode(subStateKey);
            var next = subStateNode._transition(subStateValue, state, eventObject, context);
            if (!next.tree) {
                noTransitionKeys.push(subStateKey);
            }
            transitionMap[subStateKey] = next;
        });
        var willTransition = utils_1.keys(transitionMap).some(function (key) { return transitionMap[key].tree !== undefined; });
        if (!willTransition) {
            var _a = this.next(state, eventObject, context), reentryStates = _a.reentryStates, actions = _a.actions, tree = _a.tree;
            return {
                tree: tree,
                source: state,
                reentryStates: reentryStates,
                actions: actions
            };
        }
        var allTrees = utils_1.keys(transitionMap)
            .map(function (key) { return transitionMap[key].tree; })
            .filter(function (t) { return t !== undefined; });
        var combinedTree = allTrees.reduce(function (acc, t) {
            return acc.combine(t);
        });
        var allPaths = combinedTree.paths;
        // External transition that escapes orthogonal region
        if (allPaths.length === 1 &&
            !utils_2.matchesState(utils_1.toStateValue(this.path, this.delimiter), combinedTree.value)) {
            return {
                tree: combinedTree,
                source: state,
                reentryStates: utils_1.keys(transitionMap)
                    .map(function (key) { return transitionMap[key].reentryStates; })
                    .reduce(function (allReentryStates, reentryStates) {
                    return new Set(__spread(Array.from(allReentryStates || []), Array.from(reentryStates || [])));
                }, new Set()),
                actions: utils_1.flatten(utils_1.keys(transitionMap).map(function (key) {
                    return transitionMap[key].actions;
                }))
            };
        }
        var allResolvedTrees = utils_1.keys(transitionMap).map(function (key) {
            var transition = transitionMap[key];
            var subValue = utils_1.path(_this.path)(transition.tree ? transition.tree.value : state.value || state.value)[key];
            return new StateTree_1.StateTree(_this.getStateNode(key), subValue).absolute;
        });
        var finalCombinedTree = allResolvedTrees.reduce(function (acc, t) {
            return acc.combine(t);
        });
        return {
            tree: finalCombinedTree,
            source: state,
            reentryStates: utils_1.keys(transitionMap).reduce(function (allReentryStates, key) {
                var _a = transitionMap[key], tree = _a.tree, reentryStates = _a.reentryStates;
                // If the event was not handled (no subStateValue),
                // machine should still be in state without reentry/exit.
                if (!tree || !reentryStates) {
                    return allReentryStates;
                }
                return new Set(__spread(Array.from(allReentryStates), Array.from(reentryStates)));
            }, new Set()),
            actions: utils_1.flatten(utils_1.keys(transitionMap).map(function (key) {
                return transitionMap[key].actions;
            }))
        };
    };
    StateNode.prototype._transition = function (stateValue, state, event, context) {
        // leaf node
        if (typeof stateValue === 'string') {
            return this.transitionLeafNode(stateValue, state, event, context);
        }
        // hierarchical node
        if (utils_1.keys(stateValue).length === 1) {
            return this.transitionCompoundNode(stateValue, state, event, context);
        }
        // orthogonal node
        return this.transitionParallelNode(stateValue, state, event, context);
    };
    StateNode.prototype.next = function (state, eventObject, context) {
        var _this = this;
        var e_1, _a;
        var eventType = eventObject.type;
        var candidates = this.on[eventType];
        var actions = this.transient
            ? [{ type: actionTypes.nullEvent }]
            : [];
        if (!candidates || !candidates.length) {
            return {
                tree: undefined,
                source: state,
                reentryStates: undefined,
                actions: actions
            };
        }
        var nextStateStrings = [];
        var selectedTransition;
        try {
            for (var candidates_1 = __values(candidates), candidates_1_1 = candidates_1.next(); !candidates_1_1.done; candidates_1_1 = candidates_1.next()) {
                var candidate = candidates_1_1.value;
                var _b = candidate, cond = _b.cond, stateIn = _b.in;
                var resolvedContext = context || EMPTY_OBJECT;
                var isInState = stateIn
                    ? typeof stateIn === 'string' && isStateId(stateIn)
                        ? // Check if in state by ID
                            state.matches(utils_1.toStateValue(this.getStateNodeById(stateIn).path, this.delimiter))
                        : // Check if in state by relative grandparent
                            utils_2.matchesState(utils_1.toStateValue(stateIn, this.delimiter), utils_1.path(this.path.slice(0, -2))(state.value))
                    : true;
                if ((!cond ||
                    this.evaluateGuard(cond, resolvedContext, eventObject, state.value)) &&
                    isInState) {
                    nextStateStrings = utils_1.toArray(candidate.target);
                    actions.push.apply(actions, __spread(utils_1.toArray(candidate.actions)));
                    selectedTransition = candidate;
                    break;
                }
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (candidates_1_1 && !candidates_1_1.done && (_a = candidates_1.return)) _a.call(candidates_1);
            }
            finally { if (e_1) throw e_1.error; }
        }
        // targetless transition
        if (selectedTransition && nextStateStrings.length === 0) {
            var tree = state.value
                ? this.machine.getStateTree(state.value)
                : undefined;
            return {
                tree: tree,
                source: state,
                reentryStates: undefined,
                actions: actions
            };
        }
        if (!selectedTransition && nextStateStrings.length === 0) {
            return {
                tree: undefined,
                source: state,
                reentryStates: undefined,
                actions: actions
            };
        }
        var nextStateNodes = utils_1.flatten(nextStateStrings.map(function (str) {
            return _this.getRelativeStateNodes(str, state.historyValue);
        }));
        var isInternal = !!selectedTransition.internal;
        var reentryNodes = isInternal
            ? []
            : utils_1.flatten(nextStateNodes.map(function (n) { return _this.nodesFromChild(n); }));
        var trees = nextStateNodes.map(function (stateNode) { return stateNode.tree; });
        var combinedTree = trees.reduce(function (acc, t) {
            return acc.combine(t);
        });
        return {
            tree: combinedTree,
            source: state,
            reentryStates: new Set(reentryNodes),
            actions: actions
        };
    };
    Object.defineProperty(StateNode.prototype, "tree", {
        /**
         * The state tree represented by this state node.
         */
        get: function () {
            var stateValue = utils_1.toStateValue(this.path, this.delimiter);
            return new StateTree_1.StateTree(this.machine, stateValue);
        },
        enumerable: true,
        configurable: true
    });
    StateNode.prototype.nodesFromChild = function (childStateNode) {
        if (childStateNode.escapes(this)) {
            return [];
        }
        var nodes = [];
        var marker = childStateNode;
        while (marker && marker !== this) {
            nodes.push(marker);
            marker = marker.parent;
        }
        nodes.push(this); // inclusive
        return nodes;
    };
    StateNode.prototype.getStateTree = function (stateValue) {
        return new StateTree_1.StateTree(this, stateValue);
    };
    /**
     * Whether the given state node "escapes" this state node. If the `stateNode` is equal to or the parent of
     * this state node, it does not escape.
     */
    StateNode.prototype.escapes = function (stateNode) {
        if (this === stateNode) {
            return false;
        }
        var parent = this.parent;
        while (parent) {
            if (parent === stateNode) {
                return false;
            }
            parent = parent.parent;
        }
        return true;
    };
    StateNode.prototype.evaluateGuard = function (condition, context, eventObject, interimState) {
        var condFn;
        var guards = this.machine.options.guards;
        if (typeof condition === 'string') {
            if (!guards || !guards[condition]) {
                throw new Error("Condition '" + condition + "' is not implemented on machine '" + this.machine.id + "'.");
            }
            condFn = guards[condition];
        }
        else {
            condFn = condition;
        }
        return condFn(context, eventObject, interimState);
    };
    Object.defineProperty(StateNode.prototype, "delays", {
        /**
         * The array of all delayed transitions.
         */
        get: function () {
            var _this = this;
            var delays = Array.from(new Set(this.transitions
                .map(function (transition) { return transition.delay; })
                .filter((function (delay) { return delay !== undefined; }))));
            return delays.map(function (delay) { return ({
                id: _this.id,
                delay: delay
            }); });
        },
        enumerable: true,
        configurable: true
    });
    StateNode.prototype.getActions = function (transition, prevState) {
        var _this = this;
        var entryExitStates = transition.tree
            ? transition.tree.resolved.getEntryExitStates(this.getStateTree(prevState.value), transition.reentryStates ? transition.reentryStates : undefined)
            : { entry: [], exit: [] };
        var doneEvents = transition.tree
            ? transition.tree.getDoneEvents(new Set(entryExitStates.entry))
            : [];
        if (!transition.source) {
            entryExitStates.exit = [];
        }
        var entryExitActions = {
            entry: utils_1.flatten(Array.from(new Set(entryExitStates.entry)).map(function (stateNode) {
                return __spread(stateNode.onEntry, stateNode.activities.map(function (activity) { return actions_1.start(activity); }), stateNode.delays.map(function (_a) {
                    var delay = _a.delay, id = _a.id;
                    return actions_1.send(actions_1.after(delay, id), { delay: delay });
                }));
            })).concat(doneEvents.map(actions_1.raise)),
            exit: utils_1.flatten(Array.from(new Set(entryExitStates.exit)).map(function (stateNode) { return __spread(stateNode.onExit, stateNode.activities.map(function (activity) { return actions_1.stop(activity); }), stateNode.delays.map(function (_a) {
                var delay = _a.delay, id = _a.id;
                return actions_1.cancel(actions_1.after(delay, id));
            })); }))
        };
        var actions = entryExitActions.exit
            .concat(transition.actions)
            .concat(entryExitActions.entry)
            .map(function (action) { return _this.resolveAction(action); });
        return actions;
    };
    StateNode.prototype.resolveAction = function (action) {
        return actions_1.toActionObject(action, this.machine.options.actions);
    };
    StateNode.prototype.resolveActivity = function (activity) {
        var activityDefinition = actions_1.toActivityDefinition(activity);
        return activityDefinition;
    };
    StateNode.prototype.getActivities = function (entryExitStates, activities) {
        if (!entryExitStates) {
            return EMPTY_OBJECT;
        }
        var activityMap = __assign({}, activities);
        Array.from(entryExitStates.exit).forEach(function (stateNode) {
            stateNode.activities.forEach(function (activity) {
                activityMap[activity.type] = false;
            });
        });
        Array.from(entryExitStates.entry).forEach(function (stateNode) {
            stateNode.activities.forEach(function (activity) {
                activityMap[activity.type] = true;
            });
        });
        return activityMap;
    };
    /**
     * Determines the next state given the current `state` and sent `event`.
     *
     * @param state The current State instance or state value
     * @param event The event that was sent at the current state
     * @param context The current context (extended state) of the current state
     */
    StateNode.prototype.transition = function (state, event, context) {
        var resolvedStateValue = typeof state === 'string'
            ? this.resolve(utils_1.pathToStateValue(this.getResolvedPath(state)))
            : state instanceof State_1.State
                ? state
                : this.resolve(state);
        var resolvedContext = context
            ? context
            : state instanceof State_1.State
                ? state.context
                : this.machine.context;
        var eventObject = actions_1.toEventObject(event);
        var eventType = eventObject.type;
        if (this.strict) {
            if (this.events.indexOf(eventType) === -1) {
                throw new Error("Machine '" + this.id + "' does not accept event '" + eventType + "'");
            }
        }
        var currentState = State_1.State.from(resolvedStateValue, resolvedContext);
        var stateTransition = this._transition(currentState.value, currentState, eventObject, resolvedContext);
        var resolvedStateTransition = __assign({}, stateTransition, { tree: stateTransition.tree ? stateTransition.tree.resolved : undefined });
        return this.resolveTransition(resolvedStateTransition, currentState, eventObject);
    };
    StateNode.prototype.resolveTransition = function (stateTransition, currentState, event) {
        var _a;
        var resolvedStateValue = stateTransition.tree
            ? stateTransition.tree.value
            : undefined;
        var historyValue = currentState.historyValue
            ? currentState.historyValue
            : stateTransition.source
                ? this.machine.historyValue(currentState.value)
                : undefined;
        if (!IS_PRODUCTION && stateTransition.tree) {
            try {
                this.ensureValidPaths(stateTransition.tree.paths); // TODO: ensure code coverage for this
            }
            catch (e) {
                throw new Error("Event '" + (event ? event.type : 'none') + "' leads to an invalid configuration: " + e.message);
            }
        }
        var actions = this.getActions(stateTransition, currentState);
        var entryExitStates = stateTransition.tree
            ? stateTransition.tree.getEntryExitStates(this.getStateTree(currentState.value))
            : { entry: [], exit: [] };
        var activities = stateTransition.tree
            ? this.getActivities({
                entry: new Set(entryExitStates.entry),
                exit: new Set(entryExitStates.exit)
            }, currentState.activities)
            : {};
        var raisedEvents = actions.filter(function (action) {
            return action.type === actionTypes.raise ||
                action.type === actionTypes.nullEvent;
        });
        var nonEventActions = actions.filter(function (action) {
            return action.type !== actionTypes.raise &&
                action.type !== actionTypes.nullEvent &&
                action.type !== actionTypes.assign;
        });
        var assignActions = actions.filter(function (action) { return action.type === actionTypes.assign; });
        var updatedContext = StateNode.updateContext(currentState.context, event, assignActions);
        var stateNodes = resolvedStateValue
            ? this.getStateNodes(resolvedStateValue)
            : [];
        var isTransient = stateNodes.some(function (stateNode) { return stateNode.transient; });
        if (isTransient) {
            raisedEvents.push({ type: actionTypes.nullEvent });
        }
        var meta = __spread([this], stateNodes).reduce(function (acc, stateNode) {
            if (stateNode.meta !== undefined) {
                acc[stateNode.id] = stateNode.meta;
            }
            return acc;
        }, {});
        var nextState = resolvedStateValue
            ? new State_1.State({
                value: resolvedStateValue,
                context: updatedContext,
                historyValue: historyValue
                    ? StateNode.updateHistoryValue(historyValue, resolvedStateValue)
                    : undefined,
                history: stateTransition.source ? currentState : undefined,
                actions: actions_1.toActionObjects(nonEventActions, this.options.actions),
                activities: activities,
                meta: meta,
                events: raisedEvents,
                tree: stateTransition.tree
            })
            : undefined;
        if (!nextState) {
            // Unchanged state should be returned with no actions
            return State_1.State.inert(currentState, updatedContext);
        }
        // Dispose of penultimate histories to prevent memory leaks
        if (currentState.history) {
            delete currentState.history.history;
        }
        var maybeNextState = nextState;
        while (raisedEvents.length) {
            var currentActions = maybeNextState.actions;
            var raisedEvent = raisedEvents.shift();
            maybeNextState = this.transition(maybeNextState, raisedEvent.type === actionTypes.nullEvent
                ? NULL_EVENT
                : raisedEvent.event, maybeNextState.context);
            (_a = maybeNextState.actions).unshift.apply(_a, __spread(currentActions));
        }
        return maybeNextState;
    };
    StateNode.updateContext = function (context, event, assignActions) {
        var updatedContext = context
            ? assignActions.reduce(function (acc, assignAction) {
                var assignment = assignAction.assignment;
                var partialUpdate = {};
                if (typeof assignment === 'function') {
                    partialUpdate = assignment(acc, event || { type: types_1.ActionTypes.Init });
                }
                else {
                    utils_1.keys(assignment).forEach(function (key) {
                        var propAssignment = assignment[key];
                        partialUpdate[key] =
                            typeof propAssignment === 'function'
                                ? propAssignment(acc, event)
                                : propAssignment;
                    });
                }
                return Object.assign({}, acc, partialUpdate);
            }, context)
            : context;
        return updatedContext;
    };
    StateNode.prototype.ensureValidPaths = function (paths) {
        var _this = this;
        var e_2, _a;
        var visitedParents = new Map();
        var stateNodes = utils_1.flatten(paths.map(function (_path) { return _this.getRelativeStateNodes(_path); }));
        try {
            outer: for (var stateNodes_1 = __values(stateNodes), stateNodes_1_1 = stateNodes_1.next(); !stateNodes_1_1.done; stateNodes_1_1 = stateNodes_1.next()) {
                var stateNode = stateNodes_1_1.value;
                var marker = stateNode;
                while (marker.parent) {
                    if (visitedParents.has(marker.parent)) {
                        if (marker.parent.type === 'parallel') {
                            continue outer;
                        }
                        throw new Error("State node '" + stateNode.id + "' shares parent '" + marker.parent.id + "' with state node '" + visitedParents
                            .get(marker.parent)
                            .map(function (a) { return a.id; }) + "'");
                    }
                    if (!visitedParents.get(marker.parent)) {
                        visitedParents.set(marker.parent, [stateNode]);
                    }
                    else {
                        visitedParents.get(marker.parent).push(stateNode);
                    }
                    marker = marker.parent;
                }
            }
        }
        catch (e_2_1) { e_2 = { error: e_2_1 }; }
        finally {
            try {
                if (stateNodes_1_1 && !stateNodes_1_1.done && (_a = stateNodes_1.return)) _a.call(stateNodes_1);
            }
            finally { if (e_2) throw e_2.error; }
        }
    };
    /**
     * Returns the child state node from its relative `stateKey`, or throws.
     */
    StateNode.prototype.getStateNode = function (stateKey) {
        if (isStateId(stateKey)) {
            return this.machine.getStateNodeById(stateKey);
        }
        if (!this.states) {
            throw new Error("Unable to retrieve child state '" + stateKey + "' from '" + this.id + "'; no child states exist.");
        }
        var result = this.states[stateKey];
        if (!result) {
            throw new Error("Child state '" + stateKey + "' does not exist on '" + this.id + "'");
        }
        return result;
    };
    /**
     * Returns the state node with the given `stateId`, or throws.
     *
     * @param stateId The state ID. The prefix "#" is removed.
     */
    StateNode.prototype.getStateNodeById = function (stateId) {
        var resolvedStateId = isStateId(stateId)
            ? stateId.slice(STATE_IDENTIFIER.length)
            : stateId;
        if (resolvedStateId === this.id) {
            return this;
        }
        var stateNode = this.machine.idMap[resolvedStateId];
        if (!stateNode) {
            throw new Error("Substate '#" + resolvedStateId + "' does not exist on '" + this.id + "'");
        }
        return stateNode;
    };
    /**
     * Returns the relative state node from the given `statePath`, or throws.
     *
     * @param statePath The string or string array relative path to the state node.
     */
    StateNode.prototype.getStateNodeByPath = function (statePath) {
        var arrayStatePath = utils_1.toStatePath(statePath, this.delimiter).slice();
        var currentStateNode = this;
        while (arrayStatePath.length) {
            var key = arrayStatePath.shift();
            currentStateNode = currentStateNode.getStateNode(key);
        }
        return currentStateNode;
    };
    /**
     * Resolves a partial state value with its full representation in this machine.
     *
     * @param stateValue The partial state value to resolve.
     */
    StateNode.prototype.resolve = function (stateValue) {
        var _this = this;
        var _a;
        if (!stateValue) {
            return this.initialStateValue || EMPTY_OBJECT; // TODO: type-specific properties
        }
        switch (this.type) {
            case 'parallel':
                return utils_1.mapValues(this.initialStateValue, function (subStateValue, subStateKey) {
                    var sv = subStateValue
                        ? _this.getStateNode(subStateKey).resolve(stateValue[subStateKey] || subStateValue)
                        : EMPTY_OBJECT;
                    return sv;
                });
            case 'compound':
                if (typeof stateValue === 'string') {
                    var subStateNode = this.getStateNode(stateValue);
                    if (subStateNode.type === 'parallel' ||
                        subStateNode.type === 'compound') {
                        return _a = {}, _a[stateValue] = subStateNode.initialStateValue, _a;
                    }
                    return stateValue;
                }
                if (!utils_1.keys(stateValue).length) {
                    return this.initialStateValue || {};
                }
                return utils_1.mapValues(stateValue, function (subStateValue, subStateKey) {
                    return subStateValue
                        ? _this.getStateNode(subStateKey).resolve(subStateValue)
                        : EMPTY_OBJECT;
                });
            default:
                return stateValue || EMPTY_OBJECT;
        }
    };
    Object.defineProperty(StateNode.prototype, "resolvedStateValue", {
        get: function () {
            var _a, _b;
            var key = this.key;
            if (this.type === 'parallel') {
                return _a = {},
                    _a[key] = utils_1.mapFilterValues(this.states, function (stateNode) { return stateNode.resolvedStateValue[stateNode.key]; }, function (stateNode) { return !(stateNode.type === 'history'); }),
                    _a;
            }
            if (!this.initial) {
                // If leaf node, value is just the state node's key
                return key;
            }
            return _b = {},
                _b[key] = this.states[this.initial].resolvedStateValue,
                _b;
        },
        enumerable: true,
        configurable: true
    });
    StateNode.prototype.getResolvedPath = function (stateIdentifier) {
        if (isStateId(stateIdentifier)) {
            var stateNode = this.machine.idMap[stateIdentifier.slice(STATE_IDENTIFIER.length)];
            if (!stateNode) {
                throw new Error("Unable to find state node '" + stateIdentifier + "'");
            }
            return stateNode.path;
        }
        return utils_1.toStatePath(stateIdentifier, this.delimiter);
    };
    Object.defineProperty(StateNode.prototype, "initialStateValue", {
        get: function () {
            if (this.__cache.initialState) {
                return this.__cache.initialState;
            }
            var initialStateValue = (this.type === 'parallel'
                ? utils_1.mapFilterValues(this.states, function (state) { return state.initialStateValue || EMPTY_OBJECT; }, function (stateNode) { return !(stateNode.type === 'history'); })
                : typeof this.resolvedStateValue === 'string'
                    ? undefined
                    : this.resolvedStateValue[this.key]);
            this.__cache.initialState = initialStateValue;
            return this.__cache.initialState;
        },
        enumerable: true,
        configurable: true
    });
    StateNode.prototype.getInitialState = function (stateValue, context) {
        if (context === void 0) { context = this.machine.context; }
        var activityMap = {};
        var actions = [];
        this.getStateNodes(stateValue).forEach(function (stateNode) {
            if (stateNode.onEntry) {
                actions.push.apply(actions, __spread(stateNode.onEntry));
            }
            if (stateNode.activities) {
                stateNode.activities.forEach(function (activity) {
                    activityMap[utils_1.getEventType(activity)] = true;
                    actions.push(actions_1.start(activity));
                });
            }
        });
        var assignActions = actions.filter(function (action) { return typeof action === 'object' && action.type === actionTypes.assign; });
        var updatedContext = StateNode.updateContext(context, undefined, assignActions);
        var initialNextState = new State_1.State({
            value: stateValue,
            context: updatedContext,
            activities: activityMap
        });
        return initialNextState;
    };
    Object.defineProperty(StateNode.prototype, "initialState", {
        /**
         * The initial State instance, which includes all actions to be executed from
         * entering the initial state.
         */
        get: function () {
            var initialStateValue = this.initialStateValue;
            if (!initialStateValue) {
                throw new Error("Cannot retrieve initial state from simple state '" + this.id + "'.");
            }
            var state = this.getInitialState(initialStateValue);
            return this.resolveTransition({
                tree: this.getStateTree(initialStateValue),
                source: undefined,
                reentryStates: new Set(this.getStateNodes(initialStateValue)),
                actions: []
            }, state, undefined);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(StateNode.prototype, "target", {
        /**
         * The target state value of the history state node, if it exists. This represents the
         * default state value to transition to if no history value exists yet.
         */
        get: function () {
            var target;
            if (this.type === 'history') {
                var historyConfig = this.config;
                if (historyConfig.target && typeof historyConfig.target === 'string') {
                    target = isStateId(historyConfig.target)
                        ? utils_1.pathToStateValue(this.machine
                            .getStateNodeById(historyConfig.target)
                            .path.slice(this.path.length - 1))
                        : historyConfig.target;
                }
                else {
                    target = historyConfig.target;
                }
            }
            return target;
        },
        enumerable: true,
        configurable: true
    });
    StateNode.prototype.getStates = function (stateValue) {
        var _this = this;
        if (typeof stateValue === 'string') {
            return [this.states[stateValue]];
        }
        var stateNodes = [];
        utils_1.keys(stateValue).forEach(function (key) {
            stateNodes.push.apply(stateNodes, __spread(_this.states[key].getStates(stateValue[key])));
        });
        return stateNodes;
    };
    /**
     * Returns the leaf nodes from a state path relative to this state node.
     *
     * @param relativeStateId The relative state path to retrieve the state nodes
     * @param history The previous state to retrieve history
     * @param resolve Whether state nodes should resolve to initial child state nodes
     */
    StateNode.prototype.getRelativeStateNodes = function (relativeStateId, historyValue, resolve) {
        if (resolve === void 0) { resolve = true; }
        if (typeof relativeStateId === 'string' && isStateId(relativeStateId)) {
            var unresolvedStateNode = this.getStateNodeById(relativeStateId);
            return resolve
                ? unresolvedStateNode.type === 'history'
                    ? unresolvedStateNode.resolveHistory(historyValue)
                    : unresolvedStateNode.initialStateNodes
                : [unresolvedStateNode];
        }
        var statePath = utils_1.toStatePath(relativeStateId, this.delimiter);
        var rootStateNode = this.parent || this;
        var unresolvedStateNodes = rootStateNode.getFromRelativePath(statePath, historyValue);
        if (!resolve) {
            return unresolvedStateNodes;
        }
        return utils_1.flatten(unresolvedStateNodes.map(function (stateNode) { return stateNode.initialStateNodes; }));
    };
    Object.defineProperty(StateNode.prototype, "initialStateNodes", {
        get: function () {
            var _this = this;
            if (this.type === 'atomic' || this.type === 'final') {
                return [this];
            }
            // Case when state node is compound but no initial state is defined
            if (this.type === 'compound' && !this.initial) {
                if (!IS_PRODUCTION) {
                    // tslint:disable-next-line:no-console
                    console.warn("Compound state node '" + this.id + "' has no initial state.");
                }
                return [this];
            }
            var initialStateValue = this.initialStateValue;
            var initialStateNodePaths = utils_1.toStatePaths(initialStateValue);
            return utils_1.flatten(initialStateNodePaths.map(function (initialPath) {
                return _this.getFromRelativePath(initialPath);
            }));
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Retrieves state nodes from a relative path to this state node.
     *
     * @param relativePath The relative path from this state node
     * @param historyValue
     */
    StateNode.prototype.getFromRelativePath = function (relativePath, historyValue) {
        if (!relativePath.length) {
            return [this];
        }
        var _a = __read(relativePath), x = _a[0], xs = _a.slice(1);
        if (!this.states) {
            throw new Error("Cannot retrieve subPath '" + x + "' from node with no states");
        }
        var childStateNode = this.getStateNode(x);
        if (childStateNode.type === 'history') {
            return childStateNode.resolveHistory(historyValue);
        }
        if (!this.states[x]) {
            throw new Error("Child state '" + x + "' does not exist on '" + this.id + "'");
        }
        return this.states[x].getFromRelativePath(xs, historyValue);
    };
    StateNode.updateHistoryValue = function (hist, stateValue) {
        function update(_hist, _sv) {
            return utils_1.mapValues(_hist.states, function (subHist, key) {
                if (!subHist) {
                    return undefined;
                }
                var subStateValue = (typeof _sv === 'string' ? undefined : _sv[key]) ||
                    (subHist ? subHist.current : undefined);
                if (!subStateValue) {
                    return undefined;
                }
                return {
                    current: subStateValue,
                    states: update(subHist, subStateValue)
                };
            });
        }
        return {
            current: stateValue,
            states: update(hist, stateValue)
        };
    };
    StateNode.prototype.historyValue = function (relativeStateValue) {
        if (!utils_1.keys(this.states).length) {
            return undefined;
        }
        return {
            current: relativeStateValue || this.initialStateValue,
            states: utils_1.mapFilterValues(this.states, function (stateNode, key) {
                if (!relativeStateValue) {
                    return stateNode.historyValue();
                }
                var subStateValue = typeof relativeStateValue === 'string'
                    ? undefined
                    : relativeStateValue[key];
                return stateNode.historyValue(subStateValue || stateNode.initialStateValue);
            }, function (stateNode) { return !stateNode.history; })
        };
    };
    /**
     * Resolves to the historical value(s) of the parent state node,
     * represented by state nodes.
     *
     * @param historyValue
     */
    StateNode.prototype.resolveHistory = function (historyValue) {
        var _this = this;
        if (this.type !== 'history') {
            return [this];
        }
        var parent = this.parent;
        if (!historyValue) {
            return this.target
                ? utils_1.flatten(utils_1.toStatePaths(this.target).map(function (relativeChildPath) {
                    return parent.getFromRelativePath(relativeChildPath);
                }))
                : this.parent.initialStateNodes;
        }
        var subHistoryValue = utils_1.nestedPath(parent.path, 'states')(historyValue).current;
        if (typeof subHistoryValue === 'string') {
            return [parent.getStateNode(subHistoryValue)];
        }
        return utils_1.flatten(utils_1.toStatePaths(subHistoryValue).map(function (subStatePath) {
            return _this.history === 'deep'
                ? parent.getFromRelativePath(subStatePath)
                : [parent.states[subStatePath[0]]];
        }));
    };
    Object.defineProperty(StateNode.prototype, "stateIds", {
        /**
         * All the state node IDs of this state node and its descendant state nodes.
         */
        get: function () {
            var _this = this;
            var childStateIds = utils_1.flatten(utils_1.keys(this.states).map(function (stateKey) {
                return _this.states[stateKey].stateIds;
            }));
            return [this.id].concat(childStateIds);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(StateNode.prototype, "events", {
        /**
         * All the event types accepted by this state node and its descendants.
         */
        get: function () {
            if (this.__cache.events) {
                return this.__cache.events;
            }
            var states = this.states;
            var events = new Set(this.ownEvents);
            if (states) {
                utils_1.keys(states).forEach(function (stateId) {
                    var e_3, _a;
                    var state = states[stateId];
                    if (state.states) {
                        try {
                            for (var _b = __values(state.events), _c = _b.next(); !_c.done; _c = _b.next()) {
                                var event_1 = _c.value;
                                events.add("" + event_1);
                            }
                        }
                        catch (e_3_1) { e_3 = { error: e_3_1 }; }
                        finally {
                            try {
                                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                            }
                            finally { if (e_3) throw e_3.error; }
                        }
                    }
                });
            }
            return (this.__cache.events = Array.from(events));
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(StateNode.prototype, "ownEvents", {
        /**
         * All the events that have transitions directly from this state node.
         *
         * Excludes any inert events.
         */
        get: function () {
            var _this = this;
            var events = new Set(utils_1.keys(this.on).filter(function (key) {
                var transitions = _this.on[key];
                return transitions.some(function (transition) {
                    return !(!transition.target &&
                        !transition.actions.length &&
                        transition.internal);
                });
            }));
            return Array.from(events);
        },
        enumerable: true,
        configurable: true
    });
    StateNode.prototype.formatTransition = function (target, transitionConfig, event) {
        var _this = this;
        var internal = transitionConfig ? transitionConfig.internal : false;
        // Check if there is no target (targetless)
        // An undefined transition signals that the state node should not transition from that event.
        if (target === undefined || target === TARGETLESS_KEY) {
            return __assign({}, transitionConfig, { actions: transitionConfig
                    ? utils_1.toArray(transitionConfig.actions).map(function (action) {
                        return actions_1.toActionObject(action);
                    })
                    : [], target: undefined, internal: transitionConfig
                    ? transitionConfig.internal === undefined
                        ? true
                        : transitionConfig.internal
                    : true, event: event });
        }
        var targets = utils_1.toArray(target);
        // Format targets to their full string path
        var formattedTargets = targets.map(function (_target) {
            var internalTarget = typeof _target === 'string' && _target[0] === _this.delimiter;
            internal = internal || internalTarget;
            // If internal target is defined on machine,
            // do not include machine key on target
            if (internalTarget && !_this.parent) {
                return _target.slice(1);
            }
            return internalTarget ? _this.key + _target : "" + _target;
        });
        return __assign({}, transitionConfig, { actions: transitionConfig
                ? utils_1.toArray(transitionConfig.actions).map(function (action) {
                    return actions_1.toActionObject(action);
                })
                : [], target: formattedTargets, internal: internal,
            event: event });
    };
    StateNode.prototype.formatTransitions = function () {
        var _this = this;
        var _a;
        var onConfig = this.config.on || EMPTY_OBJECT;
        var doneConfig = this.config.onDone
            ? (_a = {},
                _a["" + actions_1.done(this.id)] = this.config.onDone,
                _a) : undefined;
        var invokeConfig = this.invoke.reduce(function (acc, singleInvokeConfig) {
            if (singleInvokeConfig.onDone) {
                acc[actions_1.doneInvoke(singleInvokeConfig.id)] = singleInvokeConfig.onDone;
            }
            if (singleInvokeConfig.onError) {
                acc[actionTypes.errorExecution] = singleInvokeConfig.onError;
            }
            return acc;
        }, {});
        var delayedTransitions = this.after;
        var formattedTransitions = utils_1.mapValues(__assign({}, onConfig, doneConfig, invokeConfig), function (value, event) {
            if (value === undefined) {
                return [{ target: undefined, event: event, actions: [], internal: true }];
            }
            if (Array.isArray(value)) {
                return value.map(function (targetTransitionConfig) {
                    return _this.formatTransition(targetTransitionConfig.target, targetTransitionConfig, event);
                });
            }
            if (typeof value === 'string') {
                return [_this.formatTransition([value], undefined, event)];
            }
            if (!IS_PRODUCTION) {
                utils_1.keys(value).forEach(function (key) {
                    if (['target', 'actions', 'internal', 'in', 'cond'].indexOf(key) ===
                        -1) {
                        throw new Error("State object mapping of transitions is deprecated. Check the config for event '" + event + "' on state '" + _this.id + "'.");
                    }
                });
            }
            return [
                _this.formatTransition(value.target, value, event)
            ];
        });
        delayedTransitions.forEach(function (delayedTransition) {
            formattedTransitions[delayedTransition.event] =
                formattedTransitions[delayedTransition.event] || [];
            formattedTransitions[delayedTransition.event].push(delayedTransition);
        });
        return formattedTransitions;
    };
    return StateNode;
}());
exports.StateNode = StateNode;

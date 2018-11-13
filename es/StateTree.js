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
var __read = this && this.__read || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o),
        r,
        ar = [],
        e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    } catch (error) {
        e = { error: error };
    } finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        } finally {
            if (e) throw e.error;
        }
    }
    return ar;
};
var __spread = this && this.__spread || function () {
    for (var ar = [], i = 0; i < arguments.length; i++) ar = ar.concat(__read(arguments[i]));
    return ar;
};
import { mapValues, flatten, toStatePaths, keys, mapContext } from './utils';
import { matchesState } from './utils';
import { done } from './actions';
var defaultStateTreeOptions = {
    resolved: false
};
var StateTree = /** @class */ /*#__PURE__*/function () {
    function StateTree(stateNode, _stateValue, options) {
        var _a;
        if (options === void 0) {
            options = defaultStateTreeOptions;
        }
        this.stateNode = stateNode;
        this._stateValue = _stateValue;
        this.nodes = _stateValue ? typeof _stateValue === 'string' ? (_a = {}, _a[_stateValue] = new StateTree(stateNode.getStateNode(_stateValue), undefined), _a) : mapValues(_stateValue, function (subValue, key) {
            return new StateTree(stateNode.getStateNode(key), subValue);
        }) : {};
        var resolvedOptions = __assign({}, defaultStateTreeOptions, options);
        this.isResolved = resolvedOptions.resolved;
    }
    Object.defineProperty(StateTree.prototype, "done", {
        get: function () {
            var _this = this;
            switch (this.stateNode.type) {
                case 'final':
                    return true;
                case 'compound':
                    var childTree = this.nodes[keys(this.nodes)[0]];
                    return childTree.stateNode.type === 'final';
                case 'parallel':
                    return keys(this.nodes).some(function (key) {
                        return _this.nodes[key].done;
                    });
                default:
                    return false;
            }
        },
        enumerable: true,
        configurable: true
    });
    StateTree.prototype.getDoneData = function (context, event) {
        if (!this.done) {
            return undefined;
        }
        if (this.stateNode.type === 'compound') {
            var childTree = this.nodes[keys(this.nodes)[0]];
            if (!childTree.stateNode.data) {
                return undefined;
            }
            // console.log(childTree.stateNode.id, (childTree.stateNode as any)._config);
            return mapContext(childTree.stateNode.data, context, event);
        }
        return undefined;
    };
    Object.defineProperty(StateTree.prototype, "atomicNodes", {
        get: function () {
            var _this = this;
            if (this.stateNode.type === 'atomic' || this.stateNode.type === 'final') {
                return [this.stateNode];
            }
            return flatten(keys(this.value).map(function (key) {
                return _this.value[key].atomicNodes;
            }));
        },
        enumerable: true,
        configurable: true
    });
    StateTree.prototype.getDoneEvents = function (entryStateNodes) {
        var _this = this;
        // If no state nodes are being entered, no done events will be fired
        if (!entryStateNodes || !entryStateNodes.size) {
            return [];
        }
        if (entryStateNodes.has(this.stateNode) && this.stateNode.type === 'final') {
            return [done(this.stateNode.id, this.stateNode.data)];
        }
        var childDoneEvents = flatten(keys(this.nodes).map(function (key) {
            return _this.nodes[key].getDoneEvents(entryStateNodes);
        }));
        if (this.stateNode.type === 'parallel') {
            var allChildrenDone = keys(this.nodes).every(function (key) {
                return _this.nodes[key].done;
            });
            if (childDoneEvents && allChildrenDone) {
                return [done(this.stateNode.id)].concat(childDoneEvents);
            } else {
                return childDoneEvents;
            }
        }
        if (!this.done || !childDoneEvents.length) {
            return childDoneEvents;
        }
        // TODO: handle merging strategy
        // For compound state nodes with final child state, there should be only
        // one done.state event (potentially with data).
        var doneData = childDoneEvents.length === 1 ? childDoneEvents[0].data : undefined;
        return [done(this.stateNode.id, doneData)].concat(childDoneEvents);
    };
    Object.defineProperty(StateTree.prototype, "resolved", {
        get: function () {
            return new StateTree(this.stateNode, this.stateNode.resolve(this.value), {
                resolved: true
            });
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(StateTree.prototype, "paths", {
        get: function () {
            return toStatePaths(this.value);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(StateTree.prototype, "absolute", {
        get: function () {
            var _this = this;
            var _stateValue = this._stateValue;
            var absoluteStateValue = {};
            var marker = absoluteStateValue;
            this.stateNode.path.forEach(function (key, i) {
                if (i === _this.stateNode.path.length - 1) {
                    marker[key] = _stateValue;
                } else {
                    marker[key] = {};
                    marker = marker[key];
                }
            });
            return new StateTree(this.stateNode.machine, absoluteStateValue);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(StateTree.prototype, "nextEvents", {
        get: function () {
            var _this = this;
            var ownEvents = this.stateNode.ownEvents;
            var childEvents = flatten(keys(this.nodes).map(function (key) {
                var subTree = _this.nodes[key];
                return subTree.nextEvents;
            }));
            return __spread(new Set(childEvents.concat(ownEvents)));
        },
        enumerable: true,
        configurable: true
    });
    StateTree.prototype.clone = function () {
        return new StateTree(this.stateNode, this.value);
    };
    StateTree.prototype.combine = function (tree) {
        var _this = this;
        var _a;
        if (tree.stateNode !== this.stateNode) {
            throw new Error('Cannot combine distinct trees');
        }
        if (this.stateNode.type === 'compound') {
            // Only combine if no child state is defined
            var newValue = void 0;
            if (!keys(this.nodes).length || !keys(tree.nodes).length) {
                newValue = Object.assign({}, this.nodes, tree.nodes);
                var newTree = this.clone();
                newTree.nodes = newValue;
                return newTree;
            } else {
                var childKey = keys(this.nodes)[0];
                newValue = (_a = {}, _a[childKey] = this.nodes[childKey].combine(tree.nodes[childKey]), _a);
                var newTree = this.clone();
                newTree.nodes = newValue;
                return newTree;
            }
        }
        if (this.stateNode.type === 'parallel') {
            var valueKeys = new Set(__spread(keys(this.nodes), keys(tree.nodes)));
            var newValue_1 = {};
            valueKeys.forEach(function (key) {
                if (!_this.nodes[key] || !tree.nodes[key]) {
                    newValue_1[key] = _this.nodes[key] || tree.nodes[key];
                } else {
                    newValue_1[key] = _this.nodes[key].combine(tree.nodes[key]);
                }
            });
            var newTree = this.clone();
            newTree.nodes = newValue_1;
            return newTree;
        }
        // nothing to do
        return this;
    };
    Object.defineProperty(StateTree.prototype, "value", {
        get: function () {
            if (this.stateNode.type === 'atomic' || this.stateNode.type === 'final') {
                return {};
            }
            if (this.stateNode.type === 'parallel') {
                return mapValues(this.nodes, function (st) {
                    return st.value;
                });
            }
            if (this.stateNode.type === 'compound') {
                if (keys(this.nodes).length === 0) {
                    return {};
                }
                var childStateNode = this.nodes[keys(this.nodes)[0]].stateNode;
                if (childStateNode.type === 'atomic' || childStateNode.type === 'final') {
                    return childStateNode.key;
                }
                return mapValues(this.nodes, function (st) {
                    return st.value;
                });
            }
            return {};
        },
        enumerable: true,
        configurable: true
    });
    StateTree.prototype.matches = function (parentValue) {
        return matchesState(parentValue, this.value);
    };
    StateTree.prototype.getEntryExitStates = function (prevTree, externalNodes) {
        var _this = this;
        if (prevTree.stateNode !== this.stateNode) {
            throw new Error('Cannot compare distinct trees');
        }
        switch (this.stateNode.type) {
            case 'compound':
                var r1 = {
                    exit: [],
                    entry: []
                };
                var currentChildKey = keys(this.nodes)[0];
                var prevChildKey = keys(prevTree.nodes)[0];
                if (currentChildKey !== prevChildKey) {
                    r1.exit = prevTree.nodes[prevChildKey].getExitStates();
                    r1.entry = this.nodes[currentChildKey].getEntryStates();
                } else {
                    r1 = this.nodes[currentChildKey].getEntryExitStates(prevTree.nodes[prevChildKey], externalNodes);
                }
                if (externalNodes && externalNodes.has(this.stateNode)) {
                    r1.exit.push(this.stateNode);
                    r1.entry.unshift(this.stateNode);
                }
                return r1;
            case 'parallel':
                var all = keys(this.nodes).map(function (key) {
                    return _this.nodes[key].getEntryExitStates(prevTree.nodes[key], externalNodes);
                });
                var result_1 = {
                    exit: [],
                    entry: []
                };
                all.forEach(function (ees) {
                    result_1.exit = __spread(result_1.exit, ees.exit);
                    result_1.entry = __spread(result_1.entry, ees.entry);
                });
                if (externalNodes && externalNodes.has(this.stateNode)) {
                    result_1.exit.push(this.stateNode);
                    result_1.entry.unshift(this.stateNode);
                }
                return result_1;
            case 'atomic':
            default:
                if (externalNodes && externalNodes.has(this.stateNode)) {
                    return {
                        exit: [this.stateNode],
                        entry: [this.stateNode]
                    };
                }
                return {
                    exit: [],
                    entry: []
                };
        }
    };
    StateTree.prototype.getEntryStates = function () {
        var _this = this;
        if (!this.nodes) {
            return [this.stateNode];
        }
        return [this.stateNode].concat(flatten(keys(this.nodes).map(function (key) {
            return _this.nodes[key].getEntryStates();
        })));
    };
    StateTree.prototype.getExitStates = function () {
        var _this = this;
        if (!this.nodes) {
            return [this.stateNode];
        }
        return flatten(keys(this.nodes).map(function (key) {
            return _this.nodes[key].getExitStates();
        })).concat(this.stateNode);
    };
    return StateTree;
}();
export { StateTree };
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
var xml_js_1 = require("xml-js");
// import * as xstate from './index';
var index_1 = require("./index");
var utils_1 = require("./utils");
var actions = require("./actions");
function getAttribute(element, attribute) {
    return element.attributes ? element.attributes[attribute] : undefined;
}
function stateNodeToSCXML(stateNode) {
    var parallel = stateNode.parallel;
    var scxmlElement = {
        type: 'element',
        name: parallel ? 'parallel' : 'state',
        attributes: {
            id: stateNode.id
        },
        elements: __spread([
            !parallel && stateNode.initial
                ? {
                    type: 'element',
                    name: 'initial',
                    elements: [
                        {
                            type: 'element',
                            name: 'transition',
                            attributes: {
                                target: stateNode.states[stateNode.initial].id
                            }
                        }
                    ]
                }
                : undefined,
            stateNode.onEntry && {
                type: 'element',
                name: 'onentry',
                elements: stateNode.onEntry.map(function (event) {
                    return {
                        type: 'element',
                        name: 'send',
                        attributes: {
                            event: utils_1.getActionType(event)
                        }
                    };
                })
            },
            stateNode.onExit && {
                type: 'element',
                name: 'onexit',
                elements: stateNode.onExit.map(function (event) {
                    return {
                        type: 'element',
                        name: 'send',
                        attributes: {
                            event: utils_1.getActionType(event)
                        }
                    };
                })
            }
        ], utils_1.keys(stateNode.states).map(function (stateKey) {
            var subStateNode = stateNode.states[stateKey];
            return stateNodeToSCXML(subStateNode);
        }), utils_1.keys(stateNode.on)
            .map(function (event) {
            var transition = stateNode.on[event];
            if (!transition) {
                return [];
            }
            return transition.map(function (targetTransition) {
                var target = targetTransition.target;
                return {
                    type: 'element',
                    name: 'transition',
                    attributes: __assign({}, (event ? { event: event } : undefined), (target
                        ? {
                            target: stateNode.parent.getRelativeStateNodes(target)[0].id
                        }
                        : undefined), (targetTransition.cond
                        ? { cond: targetTransition.cond.toString() }
                        : undefined)),
                    elements: targetTransition.actions
                        ? targetTransition.actions.map(function (action) { return ({
                            type: 'element',
                            name: 'send',
                            attributes: {
                                event: utils_1.getActionType(action)
                            }
                        }); })
                        : undefined
                };
            });
        })
            .reduce(function (a, b) { return a.concat(b); })).filter(Boolean)
    };
    return scxmlElement;
}
function fromMachine(machine) {
    var scxmlDocument = {
        declaration: { attributes: { version: '1.0', encoding: 'utf-8' } },
        elements: [
            { type: 'instruction', name: 'access-control', instruction: 'allow="*"' },
            {
                type: 'element',
                name: 'scxml',
                attributes: {
                    version: '1.0',
                    initial: machine.id
                }
            },
            stateNodeToSCXML(machine)
        ]
    };
    return xml_js_1.js2xml(scxmlDocument, { spaces: 2 });
}
exports.fromMachine = fromMachine;
function indexedRecord(items, identifier) {
    var record = {};
    var identifierFn = typeof identifier === 'string' ? function (item) { return item[identifier]; } : identifier;
    items.forEach(function (item) {
        var key = identifierFn(item);
        record[key] = item;
    });
    return record;
}
function indexedAggregateRecord(items, identifier) {
    var record = {};
    var identifierFn = typeof identifier === 'string' ? function (item) { return item[identifier]; } : identifier;
    items.forEach(function (item) {
        var key = identifierFn(item);
        (record[key] = record[key] || []).push(item);
    });
    return record;
}
function executableContent(elements) {
    var transition = {
        actions: mapActions(elements)
    };
    return transition;
}
function mapActions(elements) {
    return elements.map(function (element) {
        switch (element.name) {
            case 'raise':
                return actions.raise(element.attributes.event);
            case 'assign':
                return actions.assign(function (xs) {
                    var literalKeyExprs = xs
                        ? utils_1.keys(xs)
                            .map(function (key) { return "const " + key + " = xs['" + key + "'];"; })
                            .join('\n')
                        : '';
                    var fnStr = "\n          const xs = arguments[0];\n          " + literalKeyExprs + ";\n            return {'" + element.attributes.location + "': " + element.attributes.expr + "};\n          ";
                    var fn = new Function(fnStr);
                    return fn(xs);
                });
            case 'send':
                var delay_1 = element.attributes.delay;
                var numberDelay = delay_1
                    ? typeof delay_1 === 'number'
                        ? delay_1
                        : /(\d+)ms/.test(delay_1)
                            ? +/(\d+)ms/.exec(delay_1)[1]
                            : 0
                    : 0;
                return actions.send(element.attributes.event, {
                    delay: numberDelay
                });
            default:
                return { type: 'not-implemented' };
        }
    });
}
function toConfig(nodeJson, id, options, extState) {
    var evalCond = options.evalCond;
    var parallel = nodeJson.name === 'parallel';
    var initial = parallel ? undefined : nodeJson.attributes.initial;
    var states;
    var on;
    var elements = nodeJson.elements;
    switch (nodeJson.name) {
        case 'history': {
            if (!elements) {
                return {
                    id: id,
                    history: nodeJson.attributes.type || 'shallow'
                };
            }
            var _a = __read(elements.filter(function (element) { return element.name === 'transition'; }), 1), transitionElement = _a[0];
            var target = getAttribute(transitionElement, 'target');
            var history_1 = getAttribute(nodeJson, 'type') || 'shallow';
            return {
                id: id,
                history: history_1,
                target: target ? "#" + target : undefined
            };
        }
        default:
            break;
    }
    if (nodeJson.elements) {
        var stateElements = nodeJson.elements.filter(function (element) {
            return element.name === 'state' ||
                element.name === 'parallel' ||
                element.name === 'history';
        });
        var transitionElements = nodeJson.elements.filter(function (element) { return element.name === 'transition'; });
        var onEntryElement = nodeJson.elements.find(function (element) { return element.name === 'onentry'; });
        var onExitElement = nodeJson.elements.find(function (element) { return element.name === 'onexit'; });
        var initialElement = !initial
            ? nodeJson.elements.find(function (element) { return element.name === 'initial'; })
            : undefined;
        if (initialElement && initialElement.elements.length) {
            initial = initialElement.elements.find(function (element) { return element.name === 'transition'; }).attributes.target;
        }
        states = indexedRecord(stateElements, function (item) { return "" + item.attributes.id; });
        on = utils_1.mapValues(indexedAggregateRecord(transitionElements, function (item) { return (item.attributes ? item.attributes.event || '' : ''); }), function (values) {
            return values.map(function (value) {
                var target = getAttribute(value, 'target');
                return __assign({ target: target ? "#" + target : undefined }, (value.elements ? executableContent(value.elements) : undefined), (value.attributes && value.attributes.cond
                    ? {
                        cond: evalCond(value.attributes.cond, extState)
                    }
                    : undefined));
            });
        });
        var onEntry = onEntryElement
            ? mapActions(onEntryElement.elements)
            : undefined;
        var onExit = onExitElement
            ? mapActions(onExitElement.elements)
            : undefined;
        return __assign({ id: id }, (initial ? { initial: initial } : undefined), (parallel ? { type: 'parallel' } : undefined), (stateElements.length
            ? {
                states: utils_1.mapValues(states, function (state, key) {
                    return toConfig(state, key, options, extState);
                })
            }
            : undefined), (transitionElements.length ? { on: on } : undefined), (onEntry ? { onEntry: onEntry } : undefined), (onExit ? { onExit: onExit } : undefined));
    }
    return { id: id };
}
function toMachine(xml, options) {
    var json = xml_js_1.xml2js(xml);
    var machineElement = json.elements.filter(function (element) { return element.name === 'scxml'; })[0];
    var dataModelEl = machineElement.elements.filter(function (element) { return element.name === 'datamodel'; })[0];
    var extState = dataModelEl
        ? dataModelEl.elements.reduce(function (acc, element) {
            acc[element.attributes.id] = element.attributes.expr;
            return acc;
        }, {})
        : undefined;
    return index_1.Machine(__assign({}, toConfig(machineElement, '(machine)', options, extState), { delimiter: options.delimiter }), undefined, extState);
}
exports.toMachine = toMachine;

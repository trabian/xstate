"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var StateNode_1 = require("./StateNode");
function Machine(config, options, initialContext) {
    if (initialContext === void 0) { initialContext = config.context; }
    return new StateNode_1.StateNode(config, options, initialContext);
}
exports.Machine = Machine;

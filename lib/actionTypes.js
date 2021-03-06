"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var types_1 = require("./types");
// xstate-specific action types
exports.start = types_1.ActionTypes.Start;
exports.stop = types_1.ActionTypes.Stop;
exports.raise = types_1.ActionTypes.Raise;
exports.send = types_1.ActionTypes.Send;
exports.cancel = types_1.ActionTypes.Cancel;
exports.nullEvent = types_1.ActionTypes.NullEvent;
exports.assign = types_1.ActionTypes.Assign;
exports.after = types_1.ActionTypes.After;
exports.doneState = types_1.ActionTypes.DoneState;
exports.log = types_1.ActionTypes.Log;
exports.init = types_1.ActionTypes.Init;
exports.invoke = types_1.ActionTypes.Invoke;
exports.errorExecution = types_1.ActionTypes.ErrorExecution;

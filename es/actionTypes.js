import { ActionTypes } from './types';
// xstate-specific action types
export var start = ActionTypes.Start;
export var stop = ActionTypes.Stop;
export var raise = ActionTypes.Raise;
export var send = ActionTypes.Send;
export var cancel = ActionTypes.Cancel;
export var nullEvent = ActionTypes.NullEvent;
export var assign = ActionTypes.Assign;
export var after = ActionTypes.After;
export var doneState = ActionTypes.DoneState;
export var log = ActionTypes.Log;
export var init = ActionTypes.Init;
export var invoke = ActionTypes.Invoke;
export var errorExecution = ActionTypes.ErrorExecution;
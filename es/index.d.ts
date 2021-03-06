import { matchesState } from './utils';
import { mapState } from './mapState';
import { StateNode } from './StateNode';
import { State } from './State';
import { Machine } from './Machine';
import { raise, send, sendParent, log, start, stop, after, done, invoke } from './actions';
declare const actions: {
    raise: typeof raise;
    send: typeof send;
    sendParent: typeof sendParent;
    log: typeof log;
    cancel: (sendId: string | number) => import("./types").CancelAction;
    start: typeof start;
    stop: typeof stop;
    assign: <TContext, TEvent extends import("./types").EventObject = import("./types").EventObject>(assignment: import("./types").Assigner<TContext, TEvent> | Partial<{ [K in keyof TContext]: ((extState: TContext, event: TEvent) => TContext[K]) | TContext[K]; }>) => import("./types").AssignAction<TContext, TEvent>;
    after: typeof after;
    done: typeof done;
    invoke: typeof invoke;
};
export { Machine, StateNode, State, matchesState, mapState, actions };
export * from './types';

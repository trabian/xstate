import { StateValue, ActivityMap, EventObject, StateInterface, HistoryValue, ActionObject, EventType, StateConfig } from './types';
import { StateTree } from './StateTree';
export declare function stateValuesEqual(a: StateValue, b: StateValue): boolean;
export declare class State<TContext, TEvent extends EventObject = EventObject> implements StateInterface<TContext> {
    value: StateValue;
    context: TContext;
    historyValue?: HistoryValue | undefined;
    history?: State<TContext>;
    actions: Array<ActionObject<TContext>>;
    activities: ActivityMap;
    meta: any;
    events: TEvent[];
    /**
     * The state node tree representation of the state value.
     */
    tree?: StateTree;
    /**
     * Creates a new State instance for the given `stateValue` and `context`.
     * @param stateValue
     * @param context
     */
    static from<TC, TE extends EventObject = EventObject>(stateValue: State<TC, TE> | StateValue, context: TC): State<TC, TE>;
    /**
     * Creates a new State instance for the given `config`.
     * @param config The state config
     */
    static create<TC, TE extends EventObject = EventObject>(config: StateConfig<TC, TE>): State<TC, TE>;
    /**
     * Creates a new State instance for the given `stateValue` and `context` with no actions (side-effects).
     * @param stateValue
     * @param context
     */
    static inert<TC, TE extends EventObject = EventObject>(stateValue: State<TC> | StateValue, context: TC): State<TC, TE>;
    /**
     * Creates a new State instance.
     * @param value The state value
     * @param context The extended state
     * @param historyValue The tree representing historical values of the state nodes
     * @param history The previous state
     * @param actions An array of action objects to execute as side-effects
     * @param activities A mapping of activities and whether they are started (`true`) or stopped (`false`).
     * @param meta
     * @param events Internal event queue. Should be empty with run-to-completion semantics.
     * @param tree
     */
    constructor(config: StateConfig<TContext, TEvent>);
    /**
     * The next events that will cause a transition from the current state.
     */
    readonly nextEvents: EventType[];
    /**
     * Returns an array of all the string leaf state node paths.
     * @param stateValue
     * @param delimiter The character(s) that separate each subpath in the string state node path.
     */
    toStrings(stateValue?: StateValue, delimiter?: string): string[];
    /**
     * Whether the current state value is a subset of the given parent state value.
     * @param parentStateValue
     */
    matches(parentStateValue: StateValue): boolean;
    /**
     * Indicates whether the state has changed from the previous state. A state is considered "changed" if:
     *
     * - Its value is not equal to its previous value, or:
     * - It has any new actions (side-effects) to execute.
     *
     * An initial state (with no history) will return `undefined`.
     */
    readonly changed: boolean | undefined;
}

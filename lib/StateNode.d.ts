import { Event, StateValue, MachineOptions, EventObject, HistoryValue, DefaultContext, StateNodeDefinition, TransitionDefinition, DelayedTransitionDefinition, ActivityDefinition, Delay, StateTypes, StateNodeConfig, StateSchema, TransitionsDefinition, StateNodesConfig, OmniEventObject, InvokeDefinition, OmniEvent, ActionObject, Mapper, PropertyMapper } from './types';
import { State } from './State';
declare class StateNode<TContext = DefaultContext, TStateSchema extends StateSchema = any, TEvent extends OmniEventObject<EventObject> = OmniEventObject<EventObject>> {
    private _config;
    options: Readonly<MachineOptions<TContext, TEvent>>;
    /**
     * The initial extended state
     */
    context?: Readonly<TContext> | undefined;
    /**
     * The relative key of the state node, which represents its location in the overall state value.
     */
    key: string;
    /**
     * The unique ID of the state node.
     */
    id: string;
    /**
     * The type of this state node:
     *
     *  - `'atomic'` - no child state nodes
     *  - `'compound'` - nested child state nodes (XOR)
     *  - `'parallel'` - orthogonal nested child state nodes (AND)
     *  - `'history'` - history state node
     *  - `'final'` - final state node
     */
    type: StateTypes;
    /**
     * The string path from the root machine node to this node.
     */
    path: string[];
    /**
     * The initial state node key.
     */
    initial?: keyof TStateSchema['states'];
    /**
     * (DEPRECATED) Whether the state node is a parallel state node.
     *
     * Use `type: 'parallel'` instead.
     */
    parallel: boolean;
    /**
     * Whether the state node is "transient". A state node is considered transient if it has
     * an immediate transition from a "null event" (empty string), taken upon entering the state node.
     */
    transient: boolean;
    /**
     * The child state nodes.
     */
    states: StateNodesConfig<TContext, TStateSchema, TEvent>;
    /**
     * The type of history exhibited. Can be:
     *
     *  - `'shallow'` - recalls only top-level historical state value
     *  - `'deep'` - recalls historical state value at all levels
     */
    history: false | 'shallow' | 'deep';
    /**
     * The action(s) to be executed upon entering the state node.
     */
    onEntry: Array<ActionObject<TContext>>;
    /**
     * The action(s) to be executed upon exiting the state node.
     */
    onExit: Array<ActionObject<TContext>>;
    /**
     * The activities to be started upon entering the state node,
     * and stopped upon exiting the state node.
     */
    activities: Array<ActivityDefinition<TContext>>;
    strict: boolean;
    /**
     * The parent state node.
     */
    parent?: StateNode<TContext>;
    /**
     * The root machine node.
     */
    machine: StateNode<TContext>;
    /**
     * The meta data associated with this state node, which will be returned in State instances.
     */
    meta?: TStateSchema extends {
        meta: infer D;
    } ? D : any;
    /**
     * The data sent with the "done.state._id_" event if this is a final state node.
     */
    data?: Mapper<TContext, TEvent> | PropertyMapper<TContext, TEvent>;
    /**
     * The string delimiter for serializing the path to a string. The default is "."
     */
    delimiter: string;
    /**
     * The order this state node appears. Corresponds to the implicit SCXML document order.
     */
    order: number;
    /**
     * The services invoked by this state node.
     */
    invoke: Array<InvokeDefinition<TContext, TEvent>>;
    private __cache;
    private idMap;
    constructor(_config: StateNodeConfig<TContext, TStateSchema, TEvent>, options?: Readonly<MachineOptions<TContext, TEvent>>, 
    /**
     * The initial extended state
     */
    context?: Readonly<TContext> | undefined);
    /**
     * Clones this state machine with custom options and context.
     *
     * @param options Options (actions, guards, activities, services) to recursively merge with the existing options.
     * @param context Custom context (will override predefined context)
     */
    withConfig(options: MachineOptions<TContext, TEvent>, context?: TContext): StateNode<TContext, TStateSchema, TEvent>;
    /**
     * Clones this state machine with custom context.
     *
     * @param context Custom context (will override predefined context, not recursive)
     */
    withContext(context: TContext): StateNode<TContext, TStateSchema, TEvent>;
    /**
     * The well-structured state node definition.
     */
    readonly definition: StateNodeDefinition<TContext, TStateSchema, TEvent>;
    /**
     * The raw config used to create the machine.
     */
    readonly config: StateNodeConfig<TContext, TStateSchema, TEvent>;
    /**
     * The mapping of events to transitions.
     */
    readonly on: TransitionsDefinition<TContext, TEvent>;
    /**
     * All the transitions that can be taken from this state node.
     */
    readonly transitions: Array<TransitionDefinition<TContext, TEvent>>;
    /**
     * All delayed transitions from the config.
     */
    readonly after: Array<DelayedTransitionDefinition<TContext, TEvent>>;
    /**
     * Returns the state nodes represented by the current state value.
     *
     * @param state The state value or State instance
     */
    getStateNodes(state: StateValue | State<TContext, TEvent>): Array<StateNode<TContext>>;
    /**
     * Whether this state node explicitly handles the given event.
     *
     * @param event The event in question
     */
    handles(event: Event<TEvent>): boolean;
    private transitionLeafNode;
    private transitionCompoundNode;
    private transitionParallelNode;
    private _transition;
    private next;
    /**
     * The state tree represented by this state node.
     */
    private readonly tree;
    private nodesFromChild;
    private getStateTree;
    /**
     * Whether the given state node "escapes" this state node. If the `stateNode` is equal to or the parent of
     * this state node, it does not escape.
     */
    private escapes;
    private evaluateGuard;
    /**
     * The array of all delayed transitions.
     */
    readonly delays: Delay[];
    private getActions;
    private resolveAction;
    private resolveActivity;
    private getActivities;
    /**
     * Determines the next state given the current `state` and sent `event`.
     *
     * @param state The current State instance or state value
     * @param event The event that was sent at the current state
     * @param context The current context (extended state) of the current state
     */
    transition(state: StateValue | State<TContext, TEvent>, event: OmniEvent<TEvent>, context?: TContext): State<TContext, TEvent>;
    private resolveTransition;
    private static updateContext;
    private ensureValidPaths;
    /**
     * Returns the child state node from its relative `stateKey`, or throws.
     */
    getStateNode(stateKey: string): StateNode<TContext>;
    /**
     * Returns the state node with the given `stateId`, or throws.
     *
     * @param stateId The state ID. The prefix "#" is removed.
     */
    getStateNodeById(stateId: string): StateNode<TContext>;
    /**
     * Returns the relative state node from the given `statePath`, or throws.
     *
     * @param statePath The string or string array relative path to the state node.
     */
    getStateNodeByPath(statePath: string | string[]): StateNode<TContext>;
    /**
     * Resolves a partial state value with its full representation in this machine.
     *
     * @param stateValue The partial state value to resolve.
     */
    resolve(stateValue: StateValue): StateValue;
    private readonly resolvedStateValue;
    private getResolvedPath;
    private readonly initialStateValue;
    getInitialState(stateValue: StateValue, context?: TContext): State<TContext, TEvent>;
    /**
     * The initial State instance, which includes all actions to be executed from
     * entering the initial state.
     */
    readonly initialState: State<TContext, TEvent>;
    /**
     * The target state value of the history state node, if it exists. This represents the
     * default state value to transition to if no history value exists yet.
     */
    readonly target: StateValue | undefined;
    getStates(stateValue: StateValue): Array<StateNode<TContext>>;
    /**
     * Returns the leaf nodes from a state path relative to this state node.
     *
     * @param relativeStateId The relative state path to retrieve the state nodes
     * @param history The previous state to retrieve history
     * @param resolve Whether state nodes should resolve to initial child state nodes
     */
    getRelativeStateNodes(relativeStateId: string | string[], historyValue?: HistoryValue, resolve?: boolean): Array<StateNode<TContext>>;
    readonly initialStateNodes: Array<StateNode<TContext>>;
    /**
     * Retrieves state nodes from a relative path to this state node.
     *
     * @param relativePath The relative path from this state node
     * @param historyValue
     */
    getFromRelativePath(relativePath: string[], historyValue?: HistoryValue): Array<StateNode<TContext>>;
    private static updateHistoryValue;
    private historyValue;
    /**
     * Resolves to the historical value(s) of the parent state node,
     * represented by state nodes.
     *
     * @param historyValue
     */
    private resolveHistory;
    /**
     * All the state node IDs of this state node and its descendant state nodes.
     */
    readonly stateIds: string[];
    /**
     * All the event types accepted by this state node and its descendants.
     */
    readonly events: Array<TEvent['type']>;
    /**
     * All the events that have transitions directly from this state node.
     *
     * Excludes any inert events.
     */
    readonly ownEvents: Array<TEvent['type']>;
    private formatTransition;
    private formatTransitions;
}
export { StateNode };

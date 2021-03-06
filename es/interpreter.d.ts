import { StateMachine, Event, EventObject, DefaultContext, StateSchema, OmniEvent } from './types';
import { State } from './State';
export declare type StateListener = <TContext, TEvent extends EventObject>(state: State<TContext>, event: TEvent) => void;
export declare type ContextListener<TContext = DefaultContext> = (context: TContext, prevContext: TContext | undefined) => void;
export declare type EventListener = (event: EventObject) => void;
export declare type Listener = () => void;
export interface Clock {
    setTimeout(fn: (...args: any[]) => void, timeout: number): any;
    clearTimeout(id: any): void;
}
export interface SimulatedClock extends Clock {
    start(speed: number): void;
    increment(ms: number): void;
    set(ms: number): void;
}
interface InterpreterOptions {
    clock: Clock;
    logger: (...args: any[]) => void;
    parent?: Interpreter<any, any, any>;
    id?: string;
}
export declare class SimulatedClock implements SimulatedClock {
    private timeouts;
    private _now;
    private _id;
    now(): number;
    private getId;
    setTimeout(fn: (...args: any[]) => void, timeout: number): number;
    clearTimeout(id: number): void;
    private flushTimeouts;
}
export declare class Interpreter<TContext, TStateSchema extends StateSchema = any, TEvent extends EventObject = EventObject> {
    machine: StateMachine<TContext, TStateSchema, TEvent>;
    /**
     * The default interpreter options:
     *
     * - `clock` uses the global `setTimeout` and `clearTimeout` functions
     * - `logger` uses the global `console.log()` method
     */
    static defaultOptions: InterpreterOptions;
    /**
     * The current state of the interpreted machine.
     */
    state: State<TContext, TEvent>;
    /**
     * The clock that is responsible for setting and clearing timeouts, such as delayed events and transitions.
     */
    clock: Clock;
    private eventQueue;
    private delayedEventsMap;
    private activitiesMap;
    private listeners;
    private contextListeners;
    private stopListeners;
    private doneListeners;
    private eventListeners;
    private sendListeners;
    private logger;
    private initialized;
    parent?: Interpreter<any>;
    private children;
    private forwardTo;
    id: string;
    /**
     * Creates a new Interpreter instance (i.e., service) for the given machine with the provided options, if any.
     *
     * @param machine The machine to be interpreted
     * @param options Interpreter options
     */
    constructor(machine: StateMachine<TContext, TStateSchema, TEvent>, options?: Partial<InterpreterOptions>);
    static interpret: typeof interpret;
    /**
     * The initial state of the statechart.
     */
    readonly initialState: State<TContext, TEvent>;
    private update;
    onTransition(listener: StateListener): Interpreter<TContext>;
    /**
     * Adds an event listener that is notified whenever an event is sent to the running interpreter.
     * @param listener The event listener
     */
    onEvent(listener: EventListener): Interpreter<TContext>;
    /**
     * Adds an event listener that is notified whenever a `send` event occurs.
     * @param listener The event listener
     */
    onSend(listener: EventListener): Interpreter<TContext>;
    /**
     * Adds a context listener that is notified whenever the state context changes.
     * @param listener The context listener
     */
    onChange(listener: ContextListener<TContext>): Interpreter<TContext>;
    /**
     * Adds a listener that is notified when the machine is stopped.
     * @param listener The listener
     */
    onStop(listener: Listener): Interpreter<TContext>;
    /**
     * Adds a state listener that is notified when the statechart has reached its final state.
     * @param listener The state listener
     */
    onDone(listener: EventListener): Interpreter<TContext>;
    /**
     * Removes a listener.
     * @param listener The listener to remove
     */
    off(listener: StateListener): Interpreter<TContext>;
    /**
     * Alias for Interpreter.prototype.start
     */
    init: (initialState?: State<TContext, TEvent>) => Interpreter<TContext, any, EventObject>;
    /**
     * Starts the interpreter from the given state, or the initial state.
     * @param initialState The state to start the statechart from
     */
    start(initialState?: State<TContext, TEvent>): Interpreter<TContext>;
    /**
     * Stops the interpreter and unsubscribe all listeners.
     *
     * This will also notify the `onStop` listeners.
     */
    stop(): Interpreter<TContext>;
    /**
     * Sends an event to the running interpreter to trigger a transition,
     * and returns the immediate next state.
     *
     * @param event The event to send
     */
    send: (event: OmniEvent<TEvent>) => State<TContext, TEvent>;
    /**
     * Returns a send function bound to this interpreter instance.
     *
     * @param event The event to be sent by the sender.
     */
    sender: (event: Event<TEvent>) => () => State<TContext, TEvent>;
    sendTo: (event: Event<TEvent>, to: string) => void;
    /**
     * Returns the next state given the interpreter's current state and the event.
     *
     * This is a pure method that does _not_ update the interpreter's state.
     *
     * @param event The event to determine the next state
     */
    nextState(event: OmniEvent<TEvent>): State<TContext, TEvent>;
    private forward;
    private defer;
    private cancel;
    private exec;
    private spawn;
    private flushEventQueue;
}
/**
 * Creates a new Interpreter instance for the given machine with the provided options, if any.
 *
 * @param machine The machine to interpret
 * @param options Interpreter options
 */
export declare function interpret<TContext = DefaultContext, TStateSchema extends StateSchema = any, TEvent extends EventObject = EventObject>(machine: StateMachine<TContext, TStateSchema, TEvent>, options?: Partial<InterpreterOptions>): Interpreter<TContext, TStateSchema, TEvent>;
export {};

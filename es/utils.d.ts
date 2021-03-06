import { Event, StateValue, ActionType, Action, EventObject, StateInterface, PropertyMapper, Mapper } from './types';
export declare function keys<T extends object>(value: T): Array<keyof T & string>;
export declare function matchesState(parentStateId: StateValue, childStateId: StateValue, delimiter?: string): boolean;
export declare function getEventType<TEvent extends EventObject = EventObject>(event: Event<TEvent>): TEvent['type'];
export declare function getActionType(action: Action<any>): ActionType;
export declare function toStatePath(stateId: string | string[], delimiter: string): string[];
export declare function toStateValue(stateValue: StateInterface<any> | StateValue | string[], delimiter: string): StateValue;
export declare function pathToStateValue(statePath: string[]): StateValue;
export declare function mapValues<T, P>(collection: {
    [key: string]: T;
}, iteratee: (item: T, key: string, collection: {
    [key: string]: T;
}, i: number) => P): {
    [key: string]: P;
};
export declare function mapFilterValues<T, P>(collection: {
    [key: string]: T;
}, iteratee: (item: T, key: string, collection: {
    [key: string]: T;
}) => P, predicate: (item: T) => boolean): {
    [key: string]: P;
};
/**
 * Retrieves a value at the given path.
 * @param props The deep path to the prop of the desired value
 */
export declare const path: <T extends Record<string, any>>(props: string[]) => any;
/**
 * Retrieves a value at the given path via the nested accessor prop.
 * @param props The deep path to the prop of the desired value
 */
export declare function nestedPath<T extends Record<string, any>>(props: string[], accessorProp: keyof T): (object: T) => T;
export declare const toStatePaths: (stateValue: string | import("./types").StateValueMap | undefined) => string[][];
export declare const pathsToStateValue: (paths: string[][]) => StateValue;
export declare function flatten<T>(array: T[][]): T[];
export declare function toArray<T>(value: T[] | T | undefined): T[];
export declare function mapContext<TContext, TEvent extends EventObject>(mapper: Mapper<TContext, TEvent> | PropertyMapper<TContext, TEvent>, context: TContext, event: TEvent): any;

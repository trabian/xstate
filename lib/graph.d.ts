import { StateNode, State } from './index';
import { StateValue, Edge, PathMap, PathItem, PathsItem, PathsMap, AdjacencyMap, DefaultContext, ValueAdjacencyMap, Event, EventObject } from './types';
export declare function getNodes(node: StateNode): StateNode[];
export declare function getEventEdges<TContext = DefaultContext, TEvent extends EventObject = EventObject>(node: StateNode<TContext>, event: string): Array<Edge<TContext, TEvent>>;
export declare function getEdges<TContext = DefaultContext, TEvent extends EventObject = EventObject>(node: StateNode<TContext>, options?: {
    depth: null | number;
}): Array<Edge<TContext, TEvent>>;
export declare function getAdjacencyMap<TContext = DefaultContext>(node: StateNode<TContext>, context?: TContext): AdjacencyMap;
export declare function deserializeStateString(valueContextString: string): {
    value: StateValue;
    context: any;
};
export declare function serializeState<TContext>(state: State<TContext>): string;
export interface GetValueAdjacencyMapOptions<TContext, TEvent extends EventObject> {
    events: {
        [K in TEvent['type']]: Event<TEvent>;
    };
    filter?: (state: State<TContext>) => boolean;
}
export declare function getValueAdjacencyMap<TContext = DefaultContext, TEvent extends EventObject = EventObject>(node: StateNode<TContext, any, TEvent>, options: GetValueAdjacencyMapOptions<TContext, TEvent>): ValueAdjacencyMap;
export declare function getShortestValuePaths<TContext = DefaultContext, TEvent extends EventObject = EventObject>(machine: StateNode<TContext>, options: GetValueAdjacencyMapOptions<TContext, TEvent>): PathMap;
export declare function getShortestPaths<TContext = DefaultContext>(machine: StateNode<TContext>, context?: TContext): PathMap;
export declare function getShortestPathsAsArray<TContext = DefaultContext>(machine: StateNode<TContext>, context?: TContext): PathItem[];
export declare function getSimplePaths<TContext = DefaultContext>(machine: StateNode<TContext>, context?: TContext): PathsMap;
export declare function getSimplePathsAsArray<TContext = DefaultContext>(machine: StateNode<TContext>, context?: TContext): PathsItem[];

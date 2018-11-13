import { StateMachine, MachineOptions, DefaultContext, MachineConfig, StateSchema, EventObject } from './types';
export declare function Machine<TContext = DefaultContext, TStateSchema extends StateSchema = any, TEvent extends EventObject = EventObject>(config: MachineConfig<TContext, TStateSchema, TEvent>, options?: MachineOptions<TContext, TEvent>, initialContext?: TContext | undefined): StateMachine<TContext, TStateSchema, TEvent>;
import { AtomicStateNodeConfig } from './types';
export declare function toggle<TEventType extends string = string>(onState: string, offState: string, eventType: TEventType): Record<string, AtomicStateNodeConfig<any, {
    type: TEventType;
}>>;

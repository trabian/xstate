import { StateNode } from './StateNode';
export function Machine(config, options, initialContext) {
    if (initialContext === void 0) {
        initialContext = config.context;
    }
    return new StateNode(config, options, initialContext);
}
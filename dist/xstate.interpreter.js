!function(t,e){"object"==typeof exports&&"undefined"!=typeof module?e(exports):"function"==typeof define&&define.amd?define(["exports"],e):e(t.XStateInterpreter={})}(this,function(t){"use strict";var e,n,r=function(){return(r=Object.assign||function(t){for(var e,n=1,r=arguments.length;n<r;n++)for(var i in e=arguments[n])Object.prototype.hasOwnProperty.call(e,i)&&(t[i]=e[i]);return t}).apply(this,arguments)};function i(t,e){var n={};for(var r in t)Object.prototype.hasOwnProperty.call(t,r)&&e.indexOf(r)<0&&(n[r]=t[r]);if(null!=t&&"function"==typeof Object.getOwnPropertySymbols){var i=0;for(r=Object.getOwnPropertySymbols(t);i<r.length;i++)e.indexOf(r[i])<0&&(n[r[i]]=t[r[i]])}return n}function o(t){var e="function"==typeof Symbol&&t[Symbol.iterator],n=0;return e?e.call(t):{next:function(){return t&&n>=t.length&&(t=void 0),{value:t&&t[n++],done:!t}}}}function a(t,e){var n="function"==typeof Symbol&&t[Symbol.iterator];if(!n)return t;var r,i,o=n.call(t),a=[];try{for(;(void 0===e||e-- >0)&&!(r=o.next()).done;)a.push(r.value)}catch(t){i={error:t}}finally{try{r&&!r.done&&(n=o.return)&&n.call(o)}finally{if(i)throw i.error}}return a}function s(){for(var t=[],e=0;e<arguments.length;e++)t=t.concat(a(arguments[e]));return t}!function(t){t.Start="xstate.start",t.Stop="xstate.stop",t.Raise="xstate.raise",t.Send="xstate.send",t.Cancel="xstate.cancel",t.NullEvent="",t.Assign="xstate.assign",t.After="xstate.after",t.DoneState="done.state",t.DoneInvoke="done.invoke",t.Log="xstate.log",t.Init="xstate.init",t.Invoke="xstate.invoke",t.ErrorExecution="error.execution",t.ErrorCommunication="error.communication"}(e||(e={})),function(t){t.Parent="#_parent",t.Internal="#_internal"}(n||(n={}));var u=e.Start,c=e.Stop,h=e.Raise,f=e.Send,d=e.Cancel,p=e.NullEvent,l=e.Assign,y=(e.After,e.DoneState,e.Log),v=e.Init,g=(e.Invoke,e.ErrorExecution),m=".",S={};function w(t){return"string"!=typeof t&&("value"in t&&"tree"in t&&"history"in t)}function b(t){return Object.keys(t)}function x(t,e,n){void 0===n&&(n=m);var r=O(t,n),i=O(e,n);return"string"==typeof i?"string"==typeof r&&i===r:"string"==typeof r?r in i:b(r).every(function(t){return t in i&&x(r[t],i[t])})}function E(t){try{return"string"==typeof t||"number"==typeof t?""+t:t.type}catch(t){throw new Error("Events must be strings or objects with a string event.type property.")}}function N(t,e){try{return Array.isArray(t)?t:t.toString().split(e)}catch(e){throw new Error("'"+t+"' is not a valid state path.")}}function O(t,e){return w(t)?t.value:Array.isArray(t)?P(t):"string"==typeof t||w(t)?P(N(t,e)):t}function P(t){if(1===t.length)return t[0];for(var e={},n=e,r=0;r<t.length-1;r++)r===t.length-2?n[t[r]]=t[r+1]:(n[t[r]]={},n=n[t[r]]);return e}function j(t,e){var n={};return b(t).forEach(function(r,i){n[r]=e(t[r],r,t,i)}),n}function k(t,e,n){var r={};return b(t).forEach(function(i){var o=t[i];n(o)&&(r[i]=e(o,i,t))}),r}var V=function(t){return function(e){var n,r,i=e;try{for(var a=o(t),s=a.next();!s.done;s=a.next()){i=i[s.value]}}catch(t){n={error:t}}finally{try{s&&!s.done&&(r=a.return)&&r.call(a)}finally{if(n)throw n.error}}return i}};var A=function(t){return t?"string"==typeof t?[[t]]:_(b(t).map(function(e){var n=t[e];return"string"==typeof n||Object.keys(n).length?A(t[e]).map(function(t){return[e].concat(t)}):[[e]]})):[[]]};function _(t){var e;return(e=[]).concat.apply(e,s(t))}function T(t){return Array.isArray(t)?t:void 0===t?[]:[t]}function I(t,e,n){return"function"==typeof t?t(e,n):b(t).reduce(function(r,i){var o=t[i];return r[i]="function"==typeof o?o(e,n):o,r},{})}function C(t){return"string"==typeof t||"number"==typeof t?{type:t}:t}function L(t,e){if(e){var n=e[t];if(n)return n}}function M(t,e){var n;if("string"==typeof t||"number"==typeof t){var o=L(t,e);n="function"==typeof o?{type:t,exec:o}:o||{type:t,exec:void 0}}else if("function"==typeof t)n={type:t.name,exec:t};else{if("function"==typeof(o=L(t.type,e)))n=r({},t,{exec:o});else if(o){var a=t.type,s=i(t,["type"]);n=r({type:a},o,s)}else n=t}return Object.defineProperty(n,"toString",{value:function(){return n.type},enumerable:!1,configurable:!0}),n}function D(t){var e=M(t);return r({id:"string"==typeof t?t:e.id},e,{type:e.type})}function R(t){return{type:h,event:t}}function F(t){var n=D(t);return{type:e.Start,activity:n,exec:void 0}}function U(t,n){var r=n?"#"+n:"";return e.After+"("+t+")"+r}function B(t,n){var r=e.DoneState+"."+t,i={type:r,data:n,toString:function(){return r}};return i}function z(t,n){var r=e.DoneInvoke+"."+t,i={type:r,data:n,toString:function(){return r}};return i}var H=function(){function t(t){this.actions=[],this.activities=S,this.meta={},this.events=[],this.value=t.value,this.context=t.context,this.historyValue=t.historyValue,this.history=t.history,this.actions=t.actions||[],this.activities=t.activities||S,this.meta=t.meta||{},this.events=t.events||[],Object.defineProperty(this,"tree",{value:t.tree,enumerable:!1})}return t.from=function(e,n){return e instanceof t?e.context!==n?new t({value:e.value,context:n,historyValue:e.historyValue,history:e.history,actions:[],activities:e.activities,meta:{},events:[],tree:e.tree}):e:new t({value:e,context:n,historyValue:void 0,history:void 0,actions:[],activities:void 0,meta:void 0,events:[]})},t.create=function(e){return new t(e)},t.inert=function(e,n){return e instanceof t?e.actions.length?new t({value:e.value,context:n,historyValue:e.historyValue,history:e.history,activities:e.activities,tree:e.tree}):e:t.from(e,n)},Object.defineProperty(t.prototype,"nextEvents",{get:function(){return this.tree?this.tree.nextEvents:[]},enumerable:!0,configurable:!0}),t.prototype.toStrings=function(t,e){var n=this;if(void 0===t&&(t=this.value),void 0===e&&(e="."),"string"==typeof t)return[t];var r=b(t);return r.concat.apply(r,s(r.map(function(r){return n.toStrings(t[r]).map(function(t){return r+e+t})})))},t.prototype.matches=function(t){return x(t,this.value)},Object.defineProperty(t.prototype,"changed",{get:function(){if(this.history)return!!this.actions.length||typeof this.history.value!=typeof this.value||("string"==typeof this.value?this.value!==this.history.value:function t(e,n){if(e===n)return!0;var r=b(e),i=b(n);return r.length===i.length&&r.every(function(r){return t(e[r],n[r])})}(this.value,this.history.value))},enumerable:!0,configurable:!0}),t}(),Q={resolved:!1},G=function(){function t(e,n,i){var o;void 0===i&&(i=Q),this.stateNode=e,this._stateValue=n,this.nodes=n?"string"==typeof n?((o={})[n]=new t(e.getStateNode(n),void 0),o):j(n,function(n,r){return new t(e.getStateNode(r),n)}):{};var a=r({},Q,i);this.isResolved=a.resolved}return Object.defineProperty(t.prototype,"done",{get:function(){var t=this;switch(this.stateNode.type){case"final":return!0;case"compound":return"final"===this.nodes[b(this.nodes)[0]].stateNode.type;case"parallel":return b(this.nodes).some(function(e){return t.nodes[e].done});default:return!1}},enumerable:!0,configurable:!0}),t.prototype.getDoneData=function(t,e){if(this.done&&"compound"===this.stateNode.type){var n=this.nodes[b(this.nodes)[0]];if(!n.stateNode.data)return;return I(n.stateNode.data,t,e)}},Object.defineProperty(t.prototype,"atomicNodes",{get:function(){var t=this;return"atomic"===this.stateNode.type||"final"===this.stateNode.type?[this.stateNode]:_(b(this.value).map(function(e){return t.value[e].atomicNodes}))},enumerable:!0,configurable:!0}),t.prototype.getDoneEvents=function(t){var e=this;if(!t||!t.size)return[];if(t.has(this.stateNode)&&"final"===this.stateNode.type)return[B(this.stateNode.id,this.stateNode.data)];var n=_(b(this.nodes).map(function(n){return e.nodes[n].getDoneEvents(t)}));if("parallel"===this.stateNode.type){var r=b(this.nodes).every(function(t){return e.nodes[t].done});return n&&r?[B(this.stateNode.id)].concat(n):n}if(!this.done||!n.length)return n;var i=1===n.length?n[0].data:void 0;return[B(this.stateNode.id,i)].concat(n)},Object.defineProperty(t.prototype,"resolved",{get:function(){return new t(this.stateNode,this.stateNode.resolve(this.value),{resolved:!0})},enumerable:!0,configurable:!0}),Object.defineProperty(t.prototype,"paths",{get:function(){return A(this.value)},enumerable:!0,configurable:!0}),Object.defineProperty(t.prototype,"absolute",{get:function(){var e=this,n=this._stateValue,r={},i=r;return this.stateNode.path.forEach(function(t,r){r===e.stateNode.path.length-1?i[t]=n:(i[t]={},i=i[t])}),new t(this.stateNode.machine,r)},enumerable:!0,configurable:!0}),Object.defineProperty(t.prototype,"nextEvents",{get:function(){var t=this,e=this.stateNode.ownEvents,n=_(b(this.nodes).map(function(e){return t.nodes[e].nextEvents}));return s(new Set(n.concat(e)))},enumerable:!0,configurable:!0}),t.prototype.clone=function(){return new t(this.stateNode,this.value)},t.prototype.combine=function(t){var e,n=this;if(t.stateNode!==this.stateNode)throw new Error("Cannot combine distinct trees");if("compound"===this.stateNode.type){var r=void 0;if(b(this.nodes).length&&b(t.nodes).length){var i=b(this.nodes)[0];return(e={})[i]=this.nodes[i].combine(t.nodes[i]),r=e,(o=this.clone()).nodes=r,o}return r=Object.assign({},this.nodes,t.nodes),(o=this.clone()).nodes=r,o}if("parallel"===this.stateNode.type){var o,a=new Set(s(b(this.nodes),b(t.nodes))),u={};return a.forEach(function(e){n.nodes[e]&&t.nodes[e]?u[e]=n.nodes[e].combine(t.nodes[e]):u[e]=n.nodes[e]||t.nodes[e]}),(o=this.clone()).nodes=u,o}return this},Object.defineProperty(t.prototype,"value",{get:function(){if("atomic"===this.stateNode.type||"final"===this.stateNode.type)return{};if("parallel"===this.stateNode.type)return j(this.nodes,function(t){return t.value});if("compound"===this.stateNode.type){if(0===b(this.nodes).length)return{};var t=this.nodes[b(this.nodes)[0]].stateNode;return"atomic"===t.type||"final"===t.type?t.key:j(this.nodes,function(t){return t.value})}return{}},enumerable:!0,configurable:!0}),t.prototype.matches=function(t){return x(t,this.value)},t.prototype.getEntryExitStates=function(t,e){var n=this;if(t.stateNode!==this.stateNode)throw new Error("Cannot compare distinct trees");switch(this.stateNode.type){case"compound":var r={exit:[],entry:[]},i=b(this.nodes)[0],o=b(t.nodes)[0];return i!==o?(r.exit=t.nodes[o].getExitStates(),r.entry=this.nodes[i].getEntryStates()):r=this.nodes[i].getEntryExitStates(t.nodes[o],e),e&&e.has(this.stateNode)&&(r.exit.push(this.stateNode),r.entry.unshift(this.stateNode)),r;case"parallel":var a=b(this.nodes).map(function(r){return n.nodes[r].getEntryExitStates(t.nodes[r],e)}),u={exit:[],entry:[]};return a.forEach(function(t){u.exit=s(u.exit,t.exit),u.entry=s(u.entry,t.entry)}),e&&e.has(this.stateNode)&&(u.exit.push(this.stateNode),u.entry.unshift(this.stateNode)),u;case"atomic":default:return e&&e.has(this.stateNode)?{exit:[this.stateNode],entry:[this.stateNode]}:{exit:[],entry:[]}}},t.prototype.getEntryStates=function(){var t=this;return this.nodes?[this.stateNode].concat(_(b(this.nodes).map(function(e){return t.nodes[e].getEntryStates()}))):[this.stateNode]},t.prototype.getExitStates=function(){var t=this;return this.nodes?_(b(this.nodes).map(function(e){return t.nodes[e].getExitStates()})).concat(this.stateNode):[this.stateNode]},t}(),J=".",X="",q={},K=function(t){return"#"===t[0]},W=function(){return{guards:q}},Y=!0,Z=function(){function t(n,i,o){void 0===i&&(i=W());var a=this;this._config=n,this.options=i,this.context=o,this.__cache={events:void 0,relativeValue:new Map,initialState:void 0},this.idMap={},this.key=n.key||n.id||"(machine)",this.parent=n.parent,this.machine=this.parent?this.parent.machine:this,this.path=this.parent?this.parent.path.concat(this.key):[],this.delimiter=n.delimiter||(this.parent?this.parent.delimiter:J),this.id=n.id||(this.machine?s([this.machine.key],this.path).join(this.delimiter):this.key),this.type=n.type||(n.parallel?"parallel":n.states&&b(n.states).length?"compound":n.history?"history":"atomic"),!Y&&"parallel"in n&&console.warn('The "parallel" property is deprecated and will be removed in version 4.1. '+(n.parallel?"Replace with `type: 'parallel'`":"Use `type: '"+this.type+"'`")+" in the config for state node '"+this.id+"' instead."),this.initial=n.initial,this.order=n.order||-1,this.states=n.states?j(n.states,function(e,n,i,o){var s,u=new t(r({},e,{key:n,order:void 0===e.order?e.order:o,parent:a}));return Object.assign(a.idMap,r(((s={})[u.id]=u,s),u.idMap)),u}):q,this.history=!0===n.history?"shallow":n.history||!1,this.transient=!(!n.on||!n.on[X]),this.strict=!!n.strict,this.onEntry=T(n.onEntry).map(function(t){return M(t)}),this.onExit=T(n.onExit).map(function(t){return M(t)}),this.meta=n.meta,this.data="final"===this.type?n.data:void 0,this.invoke=T(n.invoke).map(function(t){return function(t,n){if("string"==typeof t)return r({id:t,src:t,type:e.Invoke},n);if(!("src"in t)){var i=t;return{type:e.Invoke,id:i.id,src:i}}return r({type:e.Invoke},t,{id:t.id||("string"==typeof t.src?t.src:"function"==typeof t.src?"promise":t.src.id)})}(t)}),this.activities=T(n.activities).concat(this.invoke).map(function(t){return a.resolveActivity(t)})}return t.prototype.withConfig=function(e,n){var i=this.options,o=i.actions,a=i.activities,s=i.guards;return new t(this.definition,{actions:r({},o,e.actions),activities:r({},a,e.activities),guards:r({},s,e.guards)},n)},t.prototype.withContext=function(e){return new t(this.definition,this.options,e)},Object.defineProperty(t.prototype,"definition",{get:function(){return{id:this.id,key:this.key,type:this.type,initial:this.initial,history:this.history,states:j(this.states,function(t){return t.definition}),on:this.on,onEntry:this.onEntry,onExit:this.onExit,activities:this.activities||[],meta:this.meta,order:this.order||-1,data:this.data}},enumerable:!0,configurable:!0}),Object.defineProperty(t.prototype,"config",{get:function(){var t=this._config;t.parent;return i(t,["parent"])},enumerable:!0,configurable:!0}),Object.defineProperty(t.prototype,"on",{get:function(){return this.formatTransitions()},enumerable:!0,configurable:!0}),Object.defineProperty(t.prototype,"transitions",{get:function(){var t=this;return _(b(this.on).map(function(e){return t.on[e]}))},enumerable:!0,configurable:!0}),Object.defineProperty(t.prototype,"after",{get:function(){var t=this,e=this.config.after;if(!e)return[];if(Array.isArray(e))return e.map(function(e){return r({event:U(e.delay,t.id)},e,{actions:T(e.actions).map(function(t){return M(t)})})});var n=_(b(e).map(function(n){var i=e[n],o=+n,a=U(o,t.id);return"string"==typeof i?[{target:i,delay:o,event:a,actions:[]}]:T(i).map(function(t){return r({event:a,delay:o},t,{actions:T(t.actions).map(function(t){return M(t)})})})}));return n.sort(function(t,e){return t.delay-e.delay}),n},enumerable:!0,configurable:!0}),t.prototype.getStateNodes=function(t){var e,n=this;if(!t)return[];var r=t instanceof H?t.value:O(t,this.delimiter);if("string"==typeof r){var i=this.getStateNode(r).initial;return i?this.getStateNodes(((e={})[r]=i,e)):[this.states[r]]}var o=b(r);return o.map(function(t){return n.getStateNode(t)}).concat(o.reduce(function(t,e){var i=n.getStateNode(e).getStateNodes(r[e]);return t.concat(i)},[]))},t.prototype.handles=function(t){var e=E(t);return-1!==this.events.indexOf(e)},t.prototype.transitionLeafNode=function(t,e,n,r){var i=this.getStateNode(t).next(e,n,r);if(!i.tree){var o=this.next(e,n,r),a=o.reentryStates,s=o.actions;return{tree:o.tree,source:e,reentryStates:a,actions:s}}return i},t.prototype.transitionCompoundNode=function(t,e,n,r){var i=b(t),o=this.getStateNode(i[0])._transition(t[i[0]],e,n,r);if(!o.tree){var a=this.next(e,n,r),s=a.reentryStates,u=a.actions;return{tree:a.tree,source:e,reentryStates:s,actions:u}}return o},t.prototype.transitionParallelNode=function(t,e,n,r){var i=this,o={};if(b(t).forEach(function(a){var s=t[a];if(s){var u=i.getStateNode(a)._transition(s,e,n,r);u.tree,o[a]=u}}),!b(o).some(function(t){return void 0!==o[t].tree})){var a=this.next(e,n,r),u=a.reentryStates,c=a.actions;return{tree:a.tree,source:e,reentryStates:u,actions:c}}var h=b(o).map(function(t){return o[t].tree}).filter(function(t){return void 0!==t}).reduce(function(t,e){return t.combine(e)});return 1!==h.paths.length||x(O(this.path,this.delimiter),h.value)?{tree:b(o).map(function(t){var n=o[t],r=V(i.path)(n.tree?n.tree.value:e.value||e.value)[t];return new G(i.getStateNode(t),r).absolute}).reduce(function(t,e){return t.combine(e)}),source:e,reentryStates:b(o).reduce(function(t,e){var n=o[e],r=n.tree,i=n.reentryStates;return r&&i?new Set(s(Array.from(t),Array.from(i))):t},new Set),actions:_(b(o).map(function(t){return o[t].actions}))}:{tree:h,source:e,reentryStates:b(o).map(function(t){return o[t].reentryStates}).reduce(function(t,e){return new Set(s(Array.from(t||[]),Array.from(e||[])))},new Set),actions:_(b(o).map(function(t){return o[t].actions}))}},t.prototype._transition=function(t,e,n,r){return"string"==typeof t?this.transitionLeafNode(t,e,n,r):1===b(t).length?this.transitionCompoundNode(t,e,n,r):this.transitionParallelNode(t,e,n,r)},t.prototype.next=function(t,e,n){var r,i,a=this,u=e.type,c=this.on[u],h=this.transient?[{type:p}]:[];if(!c||!c.length)return{tree:void 0,source:t,reentryStates:void 0,actions:h};var f,d=[];try{for(var l=o(c),y=l.next();!y.done;y=l.next()){var v=y.value,g=v,m=g.cond,S=g.in,w=n||q,b=!S||("string"==typeof S&&K(S)?t.matches(O(this.getStateNodeById(S).path,this.delimiter)):x(O(S,this.delimiter),V(this.path.slice(0,-2))(t.value)));if((!m||this.evaluateGuard(m,w,e,t.value))&&b){d=T(v.target),h.push.apply(h,s(T(v.actions))),f=v;break}}}catch(t){r={error:t}}finally{try{y&&!y.done&&(i=l.return)&&i.call(l)}finally{if(r)throw r.error}}if(f&&0===d.length)return{tree:t.value?this.machine.getStateTree(t.value):void 0,source:t,reentryStates:void 0,actions:h};if(!f&&0===d.length)return{tree:void 0,source:t,reentryStates:void 0,actions:h};var E=_(d.map(function(e){return a.getRelativeStateNodes(e,t.historyValue)})),N=!!f.internal?[]:_(E.map(function(t){return a.nodesFromChild(t)}));return{tree:E.map(function(t){return t.tree}).reduce(function(t,e){return t.combine(e)}),source:t,reentryStates:new Set(N),actions:h}},Object.defineProperty(t.prototype,"tree",{get:function(){var t=O(this.path,this.delimiter);return new G(this.machine,t)},enumerable:!0,configurable:!0}),t.prototype.nodesFromChild=function(t){if(t.escapes(this))return[];for(var e=[],n=t;n&&n!==this;)e.push(n),n=n.parent;return e.push(this),e},t.prototype.getStateTree=function(t){return new G(this,t)},t.prototype.escapes=function(t){if(this===t)return!1;for(var e=this.parent;e;){if(e===t)return!1;e=e.parent}return!0},t.prototype.evaluateGuard=function(t,e,n,r){var i,o=this.machine.options.guards;if("string"==typeof t){if(!o||!o[t])throw new Error("Condition '"+t+"' is not implemented on machine '"+this.machine.id+"'.");i=o[t]}else i=t;return i(e,n,r)},Object.defineProperty(t.prototype,"delays",{get:function(){var t=this;return Array.from(new Set(this.transitions.map(function(t){return t.delay}).filter(function(t){return void 0!==t}))).map(function(e){return{id:t.id,delay:e}})},enumerable:!0,configurable:!0}),t.prototype.getActions=function(t,n){var r=this,i=t.tree?t.tree.resolved.getEntryExitStates(this.getStateTree(n.value),t.reentryStates?t.reentryStates:void 0):{entry:[],exit:[]},o=t.tree?t.tree.getDoneEvents(new Set(i.entry)):[];t.source||(i.exit=[]);var a={entry:_(Array.from(new Set(i.entry)).map(function(t){return s(t.onEntry,t.activities.map(function(t){return F(t)}),t.delays.map(function(t){var e,n,r=t.delay,i=t.id;return e=U(r,i),{to:(n={delay:r})?n.to:void 0,type:f,event:C(e),delay:n?n.delay:void 0,id:n&&void 0!==n.id?n.id:E(e)}}))})).concat(o.map(R)),exit:_(Array.from(new Set(i.exit)).map(function(t){return s(t.onExit,t.activities.map(function(t){return function(t){var n=D(t);return{type:e.Stop,activity:n,exec:void 0}}(t)}),t.delays.map(function(t){var e,n=t.delay,r=t.id;return e=U(n,r),{type:d,sendId:e}}))}))};return a.exit.concat(t.actions).concat(a.entry).map(function(t){return r.resolveAction(t)})},t.prototype.resolveAction=function(t){return M(t,this.machine.options.actions)},t.prototype.resolveActivity=function(t){return D(t)},t.prototype.getActivities=function(t,e){if(!t)return q;var n=r({},e);return Array.from(t.exit).forEach(function(t){t.activities.forEach(function(t){n[t.type]=!1})}),Array.from(t.entry).forEach(function(t){t.activities.forEach(function(t){n[t.type]=!0})}),n},t.prototype.transition=function(t,e,n){var i="string"==typeof t?this.resolve(P(this.getResolvedPath(t))):t instanceof H?t:this.resolve(t),o=n||(t instanceof H?t.context:this.machine.context),a=C(e),s=a.type;if(this.strict&&-1===this.events.indexOf(s))throw new Error("Machine '"+this.id+"' does not accept event '"+s+"'");var u=H.from(i,o),c=this._transition(u.value,u,a,o),h=r({},c,{tree:c.tree?c.tree.resolved:void 0});return this.resolveTransition(h,u,a)},t.prototype.resolveTransition=function(e,n,r){var i,o=e.tree?e.tree.value:void 0,a=n.historyValue?n.historyValue:e.source?this.machine.historyValue(n.value):void 0;if(!Y&&e.tree)try{this.ensureValidPaths(e.tree.paths)}catch(t){throw new Error("Event '"+(r?r.type:"none")+"' leads to an invalid configuration: "+t.message)}var u=this.getActions(e,n),c=e.tree?e.tree.getEntryExitStates(this.getStateTree(n.value)):{entry:[],exit:[]},f=e.tree?this.getActivities({entry:new Set(c.entry),exit:new Set(c.exit)},n.activities):{},d=u.filter(function(t){return t.type===h||t.type===p}),y=u.filter(function(t){return t.type!==h&&t.type!==p&&t.type!==l}),v=u.filter(function(t){return t.type===l}),g=t.updateContext(n.context,r,v),m=o?this.getStateNodes(o):[];m.some(function(t){return t.transient})&&d.push({type:p});var S,w,b=s([this],m).reduce(function(t,e){return void 0!==e.meta&&(t[e.id]=e.meta),t},{}),x=o?new H({value:o,context:g,historyValue:a?t.updateHistoryValue(a,o):void 0,history:e.source?n:void 0,actions:(S=y,w=this.options.actions,S?(Array.isArray(S)?S:[S]).map(function(t){return M(t,w)}):[]),activities:f,meta:b,events:d,tree:e.tree}):void 0;if(!x)return H.inert(n,g);n.history&&delete n.history.history;for(var E=x;d.length;){var N=E.actions,O=d.shift();(i=(E=this.transition(E,O.type===p?X:O.event,E.context)).actions).unshift.apply(i,s(N))}return E},t.updateContext=function(t,n,r){return t?r.reduce(function(t,r){var i=r.assignment,o={};return"function"==typeof i?o=i(t,n||{type:e.Init}):b(i).forEach(function(e){var r=i[e];o[e]="function"==typeof r?r(t,n):r}),Object.assign({},t,o)},t):t},t.prototype.ensureValidPaths=function(t){var e,n,r=this,i=new Map,a=_(t.map(function(t){return r.getRelativeStateNodes(t)}));try{t:for(var s=o(a),u=s.next();!u.done;u=s.next())for(var c=u.value,h=c;h.parent;){if(i.has(h.parent)){if("parallel"===h.parent.type)continue t;throw new Error("State node '"+c.id+"' shares parent '"+h.parent.id+"' with state node '"+i.get(h.parent).map(function(t){return t.id})+"'")}i.get(h.parent)?i.get(h.parent).push(c):i.set(h.parent,[c]),h=h.parent}}catch(t){e={error:t}}finally{try{u&&!u.done&&(n=s.return)&&n.call(s)}finally{if(e)throw e.error}}},t.prototype.getStateNode=function(t){if(K(t))return this.machine.getStateNodeById(t);if(!this.states)throw new Error("Unable to retrieve child state '"+t+"' from '"+this.id+"'; no child states exist.");var e=this.states[t];if(!e)throw new Error("Child state '"+t+"' does not exist on '"+this.id+"'");return e},t.prototype.getStateNodeById=function(t){var e=K(t)?t.slice("#".length):t;if(e===this.id)return this;var n=this.machine.idMap[e];if(!n)throw new Error("Substate '#"+e+"' does not exist on '"+this.id+"'");return n},t.prototype.getStateNodeByPath=function(t){for(var e=N(t,this.delimiter).slice(),n=this;e.length;){var r=e.shift();n=n.getStateNode(r)}return n},t.prototype.resolve=function(t){var e,n=this;if(!t)return this.initialStateValue||q;switch(this.type){case"parallel":return j(this.initialStateValue,function(e,r){return e?n.getStateNode(r).resolve(t[r]||e):q});case"compound":if("string"==typeof t){var r=this.getStateNode(t);return"parallel"===r.type||"compound"===r.type?((e={})[t]=r.initialStateValue,e):t}return b(t).length?j(t,function(t,e){return t?n.getStateNode(e).resolve(t):q}):this.initialStateValue||{};default:return t||q}},Object.defineProperty(t.prototype,"resolvedStateValue",{get:function(){var t,e,n=this.key;return"parallel"===this.type?((t={})[n]=k(this.states,function(t){return t.resolvedStateValue[t.key]},function(t){return!("history"===t.type)}),t):this.initial?((e={})[n]=this.states[this.initial].resolvedStateValue,e):n},enumerable:!0,configurable:!0}),t.prototype.getResolvedPath=function(t){if(K(t)){var e=this.machine.idMap[t.slice("#".length)];if(!e)throw new Error("Unable to find state node '"+t+"'");return e.path}return N(t,this.delimiter)},Object.defineProperty(t.prototype,"initialStateValue",{get:function(){if(this.__cache.initialState)return this.__cache.initialState;var t="parallel"===this.type?k(this.states,function(t){return t.initialStateValue||q},function(t){return!("history"===t.type)}):"string"==typeof this.resolvedStateValue?void 0:this.resolvedStateValue[this.key];return this.__cache.initialState=t,this.__cache.initialState},enumerable:!0,configurable:!0}),t.prototype.getInitialState=function(e,n){void 0===n&&(n=this.machine.context);var r={},i=[];this.getStateNodes(e).forEach(function(t){t.onEntry&&i.push.apply(i,s(t.onEntry)),t.activities&&t.activities.forEach(function(t){r[E(t)]=!0,i.push(F(t))})});var o=i.filter(function(t){return"object"==typeof t&&t.type===l}),a=t.updateContext(n,void 0,o);return new H({value:e,context:a,activities:r})},Object.defineProperty(t.prototype,"initialState",{get:function(){var t=this.initialStateValue;if(!t)throw new Error("Cannot retrieve initial state from simple state '"+this.id+"'.");var e=this.getInitialState(t);return this.resolveTransition({tree:this.getStateTree(t),source:void 0,reentryStates:new Set(this.getStateNodes(t)),actions:[]},e,void 0)},enumerable:!0,configurable:!0}),Object.defineProperty(t.prototype,"target",{get:function(){var t;if("history"===this.type){var e=this.config;t=e.target&&"string"==typeof e.target&&K(e.target)?P(this.machine.getStateNodeById(e.target).path.slice(this.path.length-1)):e.target}return t},enumerable:!0,configurable:!0}),t.prototype.getStates=function(t){var e=this;if("string"==typeof t)return[this.states[t]];var n=[];return b(t).forEach(function(r){n.push.apply(n,s(e.states[r].getStates(t[r])))}),n},t.prototype.getRelativeStateNodes=function(t,e,n){if(void 0===n&&(n=!0),"string"==typeof t&&K(t)){var r=this.getStateNodeById(t);return n?"history"===r.type?r.resolveHistory(e):r.initialStateNodes:[r]}var i=N(t,this.delimiter),o=(this.parent||this).getFromRelativePath(i,e);return n?_(o.map(function(t){return t.initialStateNodes})):o},Object.defineProperty(t.prototype,"initialStateNodes",{get:function(){var t=this;if("atomic"===this.type||"final"===this.type)return[this];if("compound"===this.type&&!this.initial)return Y||console.warn("Compound state node '"+this.id+"' has no initial state."),[this];var e=this.initialStateValue;return _(A(e).map(function(e){return t.getFromRelativePath(e)}))},enumerable:!0,configurable:!0}),t.prototype.getFromRelativePath=function(t,e){if(!t.length)return[this];var n=a(t),r=n[0],i=n.slice(1);if(!this.states)throw new Error("Cannot retrieve subPath '"+r+"' from node with no states");var o=this.getStateNode(r);if("history"===o.type)return o.resolveHistory(e);if(!this.states[r])throw new Error("Child state '"+r+"' does not exist on '"+this.id+"'");return this.states[r].getFromRelativePath(i,e)},t.updateHistoryValue=function(t,e){return{current:e,states:function t(e,n){return j(e.states,function(e,r){if(e){var i=("string"==typeof n?void 0:n[r])||(e?e.current:void 0);if(i)return{current:i,states:t(e,i)}}})}(t,e)}},t.prototype.historyValue=function(t){if(b(this.states).length)return{current:t||this.initialStateValue,states:k(this.states,function(e,n){if(!t)return e.historyValue();var r="string"==typeof t?void 0:t[n];return e.historyValue(r||e.initialStateValue)},function(t){return!t.history})}},t.prototype.resolveHistory=function(t){var e=this;if("history"!==this.type)return[this];var n=this.parent;if(!t)return this.target?_(A(this.target).map(function(t){return n.getFromRelativePath(t)})):this.parent.initialStateNodes;var r,i,a=(r=n.path,i="states",function(t){var e,n,a=t;try{for(var s=o(r),u=s.next();!u.done;u=s.next()){var c=u.value;a=a[i][c]}}catch(t){e={error:t}}finally{try{u&&!u.done&&(n=s.return)&&n.call(s)}finally{if(e)throw e.error}}return a})(t).current;return"string"==typeof a?[n.getStateNode(a)]:_(A(a).map(function(t){return"deep"===e.history?n.getFromRelativePath(t):[n.states[t[0]]]}))},Object.defineProperty(t.prototype,"stateIds",{get:function(){var t=this,e=_(b(this.states).map(function(e){return t.states[e].stateIds}));return[this.id].concat(e)},enumerable:!0,configurable:!0}),Object.defineProperty(t.prototype,"events",{get:function(){if(this.__cache.events)return this.__cache.events;var t=this.states,e=new Set(this.ownEvents);return t&&b(t).forEach(function(n){var r,i,a=t[n];if(a.states)try{for(var s=o(a.events),u=s.next();!u.done;u=s.next()){var c=u.value;e.add(""+c)}}catch(t){r={error:t}}finally{try{u&&!u.done&&(i=s.return)&&i.call(s)}finally{if(r)throw r.error}}}),this.__cache.events=Array.from(e)},enumerable:!0,configurable:!0}),Object.defineProperty(t.prototype,"ownEvents",{get:function(){var t=this,e=new Set(b(this.on).filter(function(e){return t.on[e].some(function(t){return!(!t.target&&!t.actions.length&&t.internal)})}));return Array.from(e)},enumerable:!0,configurable:!0}),t.prototype.formatTransition=function(t,e,n){var i=this,o=!!e&&e.internal;if(void 0===t||""===t)return r({},e,{actions:e?T(e.actions).map(function(t){return M(t)}):[],target:void 0,internal:!e||(void 0===e.internal||e.internal),event:n});var a=T(t).map(function(t){var e="string"==typeof t&&t[0]===i.delimiter;return o=o||e,e&&!i.parent?t.slice(1):e?i.key+t:""+t});return r({},e,{actions:e?T(e.actions).map(function(t){return M(t)}):[],target:a,internal:o,event:n})},t.prototype.formatTransitions=function(){var t,e=this,n=this.config.on||q,i=this.config.onDone?((t={})[""+B(this.id)]=this.config.onDone,t):void 0,o=this.invoke.reduce(function(t,e){return e.onDone&&(t[z(e.id)]=e.onDone),e.onError&&(t[g]=e.onError),t},{}),a=this.after,s=j(r({},n,i,o),function(t,n){return void 0===t?[{target:void 0,event:n,actions:[],internal:!0}]:Array.isArray(t)?t.map(function(t){return e.formatTransition(t.target,t,n)}):"string"==typeof t?[e.formatTransition([t],void 0,n)]:(Y||b(t).forEach(function(t){if(-1===["target","actions","internal","in","cond"].indexOf(t))throw new Error("State object mapping of transitions is deprecated. Check the config for event '"+n+"' on state '"+e.id+"'.")}),[e.formatTransition(t.target,t,n)])});return a.forEach(function(t){s[t.event]=s[t.event]||[],s[t.event].push(t)}),s},t}();var $=function(){function t(){this.timeouts=new Map,this._now=0,this._id=0}return t.prototype.now=function(){return this._now},t.prototype.getId=function(){return this._id++},t.prototype.setTimeout=function(t,e){var n=this.getId();return this.timeouts.set(n,{start:this.now(),timeout:e,fn:t}),n},t.prototype.clearTimeout=function(t){this.timeouts.delete(t)},t.prototype.set=function(t){if(this._now>t)throw new Error("Unable to travel back in time");this._now=t,this.flushTimeouts()},t.prototype.flushTimeouts=function(){var t=this;this.timeouts.forEach(function(e,n){t.now()-e.start>=e.timeout&&(e.fn.call(null),t.timeouts.delete(n))})},t.prototype.increment=function(t){this._now+=t,this.flushTimeouts()},t}(),tt=function(){function t(e,i){void 0===i&&(i=t.defaultOptions);var o=this;this.machine=e,this.eventQueue=[],this.delayedEventsMap={},this.activitiesMap={},this.listeners=new Set,this.contextListeners=new Set,this.stopListeners=new Set,this.doneListeners=new Set,this.eventListeners=new Set,this.sendListeners=new Set,this.initialized=!1,this.children=new Map,this.forwardTo=new Set,this.init=this.start,this.send=function(t){var e=C(t),n=o.nextState(e);return o.update(n,t),o.forward(e),n},this.sender=function(t){return function(){return this.send(t)}.bind(o)},this.sendTo=function(t,e){var r=e===n.Parent?o.parent:o.children.get(e);if(!r)throw new Error("Unable to send event to child '"+e+"' from interpreter '"+o.id+"'.");r.send(t)};var a=r({},t.defaultOptions,i);this.clock=a.clock,this.logger=a.logger,this.parent=a.parent,this.id=a.id||""+Math.round(99999*Math.random())}return Object.defineProperty(t.prototype,"initialState",{get:function(){return this.machine.initialState},enumerable:!0,configurable:!0}),t.prototype.update=function(t,e){var n=this;this.state=t;var r=this.state.context,i=C(e);if(this.state.actions.forEach(function(t){n.exec(t,r,i)},r),i&&this.eventListeners.forEach(function(t){return t(i)}),this.listeners.forEach(function(e){return e(t,i)}),this.contextListeners.forEach(function(t){return t(n.state.context,n.state.history?n.state.history.context:void 0)}),this.state.tree&&this.state.tree.done){var o=this.state.tree.getDoneData(this.state.context,C(e));this.doneListeners.forEach(function(t){return t(z(n.id,o))}),this.stop()}this.flushEventQueue()},t.prototype.onTransition=function(t){return this.listeners.add(t),this},t.prototype.onEvent=function(t){return this.eventListeners.add(t),this},t.prototype.onSend=function(t){return this.sendListeners.add(t),this},t.prototype.onChange=function(t){return this.contextListeners.add(t),this},t.prototype.onStop=function(t){return this.stopListeners.add(t),this},t.prototype.onDone=function(t){return this.doneListeners.add(t),this},t.prototype.off=function(t){return this.listeners.delete(t),this},t.prototype.start=function(t){return void 0===t&&(t=this.machine.initialState),this.initialized=!0,this.update(t,{type:v}),this},t.prototype.stop=function(){var t=this;return this.listeners.forEach(function(e){return t.off(e)}),this.stopListeners.forEach(function(e){e(),t.stopListeners.delete(e)}),this.contextListeners.forEach(function(e){return t.contextListeners.delete(e)}),this.doneListeners.forEach(function(e){return t.doneListeners.delete(e)}),this},t.prototype.nextState=function(t){var e=C(t);if(!this.initialized)throw new Error('Unable to send event "'+e.type+'" to an uninitialized interpreter (ID: '+this.machine.id+"). Event: "+JSON.stringify(t));return this.machine.transition(this.state,e,this.state.context)},t.prototype.forward=function(t){var e=this;this.forwardTo.forEach(function(n){var r=e.children.get(n);if(!r)throw new Error("Unable to forward event '"+t+"' from interpreter '"+e.id+"' to nonexistant child '"+n+"'.");r.send(t)})},t.prototype.defer=function(t){var e=this;return this.clock.setTimeout(function(){t.to?e.sendTo(t.event,t.to):e.send(t.event)},t.delay||0)},t.prototype.cancel=function(t){this.clock.clearTimeout(this.delayedEventsMap[t]),delete this.delayedEventsMap[t]},t.prototype.exec=function(t,n,r){var i,o,a,s=this;if(t.exec)return t.exec(n,r,{action:t});switch(t.type){case f:var h=t;if(h.delay)return void(this.delayedEventsMap[h.id]=this.defer(h));h.to?this.sendTo(h.event,h.to):this.eventQueue.push(h.event);break;case d:this.cancel(t.sendId);break;case u:var p=t.activity;if(p.type===e.Invoke){var l=p.src?p.src instanceof Z?p.src:"function"==typeof p.src?p.src:this.machine.options.services?this.machine.options.services[p.src]:void 0:void 0,v=p.id,g=p.data,m=!!p.forward;if(!l)return void console.warn("No service found for invocation '"+p.src+"' in machine '"+this.machine.id+"'.");if("function"==typeof l){var S=l(n,r),w=!1;S.then(function(t){w||s.send(z(p.id,t))}).catch(function(t){var n;s.send((n=t,{src:v,type:e.ErrorExecution,data:n}))}),this.activitiesMap[p.id]=function(){w=!0}}else if("string"!=typeof l){var b=l instanceof Z?l:(i=l,void 0===a&&(a=i.context),new Z(i,o,a)),x=this.spawn(g?b.withContext(I(g,n,r)):b,{id:v,autoForward:m}).onDone(function(t){s.send(t)});x.start(),this.activitiesMap[p.id]=function(){s.children.delete(x.id),s.forwardTo.delete(x.id),x.stop()}}}else{var E=this.machine.options&&this.machine.options.activities?this.machine.options.activities[p.type]:void 0;if(!E)return void console.warn("No implementation found for activity '"+p.type+"'");this.activitiesMap[p.id]=E(n,p)}break;case c:var N=t.activity,O=this.activitiesMap[N.id];O&&O();break;case y:var P=t.expr?t.expr(n,r):void 0;t.label?this.logger(t.label,P):this.logger(P);break;default:console.warn("No implementation found for action type '"+t.type+"'")}},t.prototype.spawn=function(e,n){void 0===n&&(n={});var r=new t(e,{parent:this,id:n.id||e.id});return this.children.set(r.id,r),n.autoForward&&this.forwardTo.add(r.id),r},t.prototype.flushEventQueue=function(){var t=this.eventQueue.shift();t&&this.send(t)},t.defaultOptions=function(t){return{clock:{setTimeout:function(e,n){return t.setTimeout.call(null,e,n)},clearTimeout:function(e){return t.clearTimeout.call(null,e)}},logger:t.console.log.bind(console)}}("undefined"==typeof window?global:window),t.interpret=et,t}();function et(t,e){return new tt(t,e)}t.SimulatedClock=$,t.Interpreter=tt,t.interpret=et,Object.defineProperty(t,"__esModule",{value:!0})});

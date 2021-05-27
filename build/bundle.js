
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(window.document);
var app = (function () {
    'use strict';

    function noop() { }
    function assign(tar, src) {
        // @ts-ignore
        for (const k in src)
            tar[k] = src[k];
        return tar;
    }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function validate_store(store, name) {
        if (store != null && typeof store.subscribe !== 'function') {
            throw new Error(`'${name}' is not a store with a 'subscribe' method`);
        }
    }
    function subscribe(store, ...callbacks) {
        if (store == null) {
            return noop;
        }
        const unsub = store.subscribe(...callbacks);
        return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
    }
    function component_subscribe(component, store, callback) {
        component.$$.on_destroy.push(subscribe(store, callback));
    }
    function create_slot(definition, ctx, $$scope, fn) {
        if (definition) {
            const slot_ctx = get_slot_context(definition, ctx, $$scope, fn);
            return definition[0](slot_ctx);
        }
    }
    function get_slot_context(definition, ctx, $$scope, fn) {
        return definition[1] && fn
            ? assign($$scope.ctx.slice(), definition[1](fn(ctx)))
            : $$scope.ctx;
    }
    function get_slot_changes(definition, $$scope, dirty, fn) {
        if (definition[2] && fn) {
            const lets = definition[2](fn(dirty));
            if ($$scope.dirty === undefined) {
                return lets;
            }
            if (typeof lets === 'object') {
                const merged = [];
                const len = Math.max($$scope.dirty.length, lets.length);
                for (let i = 0; i < len; i += 1) {
                    merged[i] = $$scope.dirty[i] | lets[i];
                }
                return merged;
            }
            return $$scope.dirty | lets;
        }
        return $$scope.dirty;
    }
    function update_slot(slot, slot_definition, ctx, $$scope, dirty, get_slot_changes_fn, get_slot_context_fn) {
        const slot_changes = get_slot_changes(slot_definition, $$scope, dirty, get_slot_changes_fn);
        if (slot_changes) {
            const slot_context = get_slot_context(slot_definition, ctx, $$scope, get_slot_context_fn);
            slot.p(slot_context, slot_changes);
        }
    }
    function exclude_internal_props(props) {
        const result = {};
        for (const k in props)
            if (k[0] !== '$')
                result[k] = props[k];
        return result;
    }
    function compute_rest_props(props, keys) {
        const rest = {};
        keys = new Set(keys);
        for (const k in props)
            if (!keys.has(k) && k[0] !== '$')
                rest[k] = props[k];
        return rest;
    }
    function action_destroyer(action_result) {
        return action_result && is_function(action_result.destroy) ? action_result.destroy : noop;
    }

    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function empty() {
        return text('');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function set_attributes(node, attributes) {
        // @ts-ignore
        const descriptors = Object.getOwnPropertyDescriptors(node.__proto__);
        for (const key in attributes) {
            if (attributes[key] == null) {
                node.removeAttribute(key);
            }
            else if (key === 'style') {
                node.style.cssText = attributes[key];
            }
            else if (key === '__value') {
                node.value = node[key] = attributes[key];
            }
            else if (descriptors[key] && descriptors[key].set) {
                node[key] = attributes[key];
            }
            else {
                attr(node, key, attributes[key]);
            }
        }
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function toggle_class(element, name, toggle) {
        element.classList[toggle ? 'add' : 'remove'](name);
    }
    function custom_event(type, detail) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, false, false, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error('Function called outside component initialization');
        return current_component;
    }
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
    }
    function onDestroy(fn) {
        get_current_component().$$.on_destroy.push(fn);
    }
    function createEventDispatcher() {
        const component = get_current_component();
        return (type, detail) => {
            const callbacks = component.$$.callbacks[type];
            if (callbacks) {
                // TODO are there situations where events could be dispatched
                // in a server (non-DOM) environment?
                const event = custom_event(type, detail);
                callbacks.slice().forEach(fn => {
                    fn.call(component, event);
                });
            }
        };
    }
    function setContext(key, context) {
        get_current_component().$$.context.set(key, context);
    }
    function getContext(key) {
        return get_current_component().$$.context.get(key);
    }
    // TODO figure out if we still want to support
    // shorthand events, or if we want to implement
    // a real bubbling mechanism
    function bubble(component, event) {
        const callbacks = component.$$.callbacks[event.type];
        if (callbacks) {
            callbacks.slice().forEach(fn => fn(event));
        }
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    let flushing = false;
    const seen_callbacks = new Set();
    function flush() {
        if (flushing)
            return;
        flushing = true;
        do {
            // first, call beforeUpdate functions
            // and update components
            for (let i = 0; i < dirty_components.length; i += 1) {
                const component = dirty_components[i];
                set_current_component(component);
                update(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        flushing = false;
        seen_callbacks.clear();
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }

    function get_spread_update(levels, updates) {
        const update = {};
        const to_null_out = {};
        const accounted_for = { $$scope: 1 };
        let i = levels.length;
        while (i--) {
            const o = levels[i];
            const n = updates[i];
            if (n) {
                for (const key in o) {
                    if (!(key in n))
                        to_null_out[key] = 1;
                }
                for (const key in n) {
                    if (!accounted_for[key]) {
                        update[key] = n[key];
                        accounted_for[key] = 1;
                    }
                }
                levels[i] = n;
            }
            else {
                for (const key in o) {
                    accounted_for[key] = 1;
                }
            }
        }
        for (const key in to_null_out) {
            if (!(key in update))
                update[key] = undefined;
        }
        return update;
    }
    function get_spread_object(spread_props) {
        return typeof spread_props === 'object' && spread_props !== null ? spread_props : {};
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        // onMount happens before the initial afterUpdate
        add_render_callback(() => {
            const new_on_destroy = on_mount.map(run).filter(is_function);
            if (on_destroy) {
                on_destroy.push(...new_on_destroy);
            }
            else {
                // Edge case - component was destroyed immediately,
                // most likely as a result of a binding initialising
                run_all(new_on_destroy);
            }
            component.$$.on_mount = [];
        });
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            before_update: [],
            after_update: [],
            context: new Map(parent_component ? parent_component.$$.context : []),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, options.props || {}, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor);
            flush();
        }
        set_current_component(parent_component);
    }
    /**
     * Base class for Svelte components. Used when dev=false.
     */
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.32.3' }, detail)));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev('SvelteDOMAddEventListener', { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev('SvelteDOMRemoveEventListener', { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.wholeText === data)
            return;
        dispatch_dev('SvelteDOMSetData', { node: text, data });
        text.data = data;
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    /**
     * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
     */
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    /*! OpenPGP.js v5.0.0-2 - 2021-04-27 - this is LGPL licensed code, see LICENSE/our website https://openpgpjs.org/ for more information. */
    const e="undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof self?self:{},t=Symbol("doneWritingPromise"),r=Symbol("doneWritingResolve"),i=Symbol("doneWritingReject");class n extends Array{constructor(){super(),this[t]=new Promise((e,t)=>{this[r]=e,this[i]=t;}),this[t].catch(()=>{});}}function a(e){return n.prototype.isPrototypeOf(e)}function s(e){if(!a(e)){const t=e.getWriter(),r=t.releaseLock;return t.releaseLock=()=>{t.closed.catch((function(){})),r.call(t);},t}this.stream=e;}n.prototype.getReader=function(){return {read:async()=>(await this[t],this.length?{value:this.shift(),done:!1}:{value:void 0,done:!0})}},s.prototype.write=async function(e){this.stream.push(e);},s.prototype.close=async function(){this.stream[r]();},s.prototype.abort=async function(e){return this.stream[i](e),e},s.prototype.releaseLock=function(){};const o="object"==typeof e.process&&"object"==typeof e.process.versions,c=o&&void 0;function u(t){return e.ReadableStream&&e.ReadableStream.prototype.isPrototypeOf(t)?"web":_&&_.prototype.isPrototypeOf(t)?"ponyfill":c&&c.prototype.isPrototypeOf(t)?"node":!!a(t)&&"array"}function h(e){return Uint8Array.prototype.isPrototypeOf(e)}function d(e){if(1===e.length)return e[0];let t=0;for(let r=0;r<e.length;r++){if(!h(e[r]))throw Error("concatUint8Array: Data must be in the form of a Uint8Array");t+=e[r].length;}const r=new Uint8Array(t);let i=0;return e.forEach((function(e){r.set(e,i),i+=e.length;})),r}const f=o&&void 0,l=o&&void 0;let p,y;if(l){p=function(e){let t=!1;return new _({start(r){e.pause(),e.on("data",i=>{t||(f.isBuffer(i)&&(i=new Uint8Array(i.buffer,i.byteOffset,i.byteLength)),r.enqueue(i),e.pause());}),e.on("end",()=>{t||r.close();}),e.on("error",e=>r.error(e));},pull(){e.resume();},cancel(r){t=!0,e.destroy(r);}})};class e extends l{constructor(e,t){super(t),this._reader=K(e);}async _read(e){try{for(;;){const{done:e,value:t}=await this._reader.read();if(e){this.push(null);break}if(!this.push(t)||this._cancelling){this._reading=!1;break}}}catch(e){this.emit("error",e);}}_destroy(e){this._reader.cancel(e);}}y=function(t,r){return new e(t,r)};}const b=new WeakSet,m=Symbol("externalBuffer");function g(e){if(this.stream=e,e[m]&&(this[m]=e[m].slice()),a(e)){const t=e.getReader();return this._read=t.read.bind(t),this._releaseLock=()=>{},void(this._cancel=()=>{})}let t=u(e);if("node"===t&&(e=p(e)),t){const t=e.getReader();return this._read=t.read.bind(t),this._releaseLock=()=>{t.closed.catch((function(){})),t.releaseLock();},void(this._cancel=t.cancel.bind(t))}let r=!1;this._read=async()=>r||b.has(e)?{value:void 0,done:!0}:(r=!0,{value:e,done:!1}),this._releaseLock=()=>{if(r)try{b.add(e);}catch(e){}};}g.prototype.read=async function(){if(this[m]&&this[m].length){return {done:!1,value:this[m].shift()}}return this._read()},g.prototype.releaseLock=function(){this[m]&&(this.stream[m]=this[m]),this._releaseLock();},g.prototype.cancel=function(e){return this._cancel(e)},g.prototype.readLine=async function(){let e,t=[];for(;!e;){let{done:r,value:i}=await this.read();if(i+="",r)return t.length?M(t):void 0;const n=i.indexOf("\n")+1;n&&(e=M(t.concat(i.substr(0,n))),t=[]),n!==i.length&&t.push(i.substr(n));}return this.unshift(...t),e},g.prototype.readByte=async function(){const{done:e,value:t}=await this.read();if(e)return;const r=t[0];return this.unshift(N(t,1)),r},g.prototype.readBytes=async function(e){const t=[];let r=0;for(;;){const{done:i,value:n}=await this.read();if(i)return t.length?M(t):void 0;if(t.push(n),r+=n.length,r>=e){const r=M(t);return this.unshift(N(r,e)),N(r,0,e)}}},g.prototype.peekBytes=async function(e){const t=await this.readBytes(e);return this.unshift(t),t},g.prototype.unshift=function(...e){this[m]||(this[m]=[]),1===e.length&&h(e[0])&&this[m].length&&e[0].length&&this[m][0].byteOffset>=e[0].length?this[m][0]=new Uint8Array(this[m][0].buffer,this[m][0].byteOffset-e[0].length,this[m][0].byteLength+e[0].length):this[m].unshift(...e.filter(e=>e&&e.length));},g.prototype.readToEnd=async function(e=M){const t=[];for(;;){const{done:e,value:r}=await this.read();if(e)break;t.push(r);}return e(t)};let w,v,{ReadableStream:_,WritableStream:k,TransformStream:A}=e;async function S(){if(A)return;const[t,r]=await Promise.all([Promise.resolve().then((function(){return _d})),Promise.resolve().then((function(){return Ld}))]);({ReadableStream:_,WritableStream:k,TransformStream:A}=t);const{createReadableStreamWrapper:i}=r;e.ReadableStream&&_!==e.ReadableStream&&(w=i(_),v=i(e.ReadableStream));}const E=o&&void 0;function x(e){let t=u(e);return "node"===t?p(e):"web"===t&&w?w(e):t?e:new _({start(t){t.enqueue(e),t.close();}})}function P(e){if(u(e))return e;const t=new n;return (async()=>{const r=D(t);await r.write(e),await r.close();})(),t}function M(e){return e.some(e=>u(e)&&!a(e))?C(e):e.some(e=>a(e))?function(e){const t=new n;let r=Promise.resolve();return e.forEach((i,n)=>(r=r.then(()=>R(i,t,{preventClose:n!==e.length-1})),r)),t}(e):"string"==typeof e[0]?e.join(""):E&&E.isBuffer(e[0])?E.concat(e):d(e)}function C(e){e=e.map(x);const t=U((async function(e){await Promise.all(i.map(t=>j(t,e)));}));let r=Promise.resolve();const i=e.map((i,n)=>T(i,(i,a)=>(r=r.then(()=>R(i,t.writable,{preventClose:n!==e.length-1})),r)));return t.readable}function K(e){return new g(e)}function D(e){return new s(e)}async function R(e,t,{preventClose:r=!1,preventAbort:i=!1,preventCancel:n=!1}={}){if(u(e)&&!a(e)){e=x(e);try{if(e[m]){const r=D(t);for(let t=0;t<e[m].length;t++)await r.ready,await r.write(e[m][t]);r.releaseLock();}await e.pipeTo(t,{preventClose:r,preventAbort:i,preventCancel:n});}catch(e){}return}const s=K(e=P(e)),o=D(t);try{for(;;){await o.ready;const{done:e,value:t}=await s.read();if(e){r||await o.close();break}await o.write(t);}}catch(e){i||await o.abort(e);}finally{s.releaseLock(),o.releaseLock();}}function I(e,t){const r=new A(t);return R(e,r.writable),r.readable}function U(e){let t,r,i=!1;return {readable:new _({start(e){r=e;},pull(){t?t():i=!0;},cancel:e},{highWaterMark:0}),writable:new k({write:async function(e){r.enqueue(e),i?i=!1:(await new Promise(e=>{t=e;}),t=null);},close:r.close.bind(r),abort:r.error.bind(r)})}}function B(e,t=(()=>{}),r=(()=>{})){if(a(e)){const i=new n;return (async()=>{const n=await L(e),a=t(n),s=r();let o;o=void 0!==a&&void 0!==s?M([a,s]):void 0!==a?a:s;const c=D(i);await c.write(o),await c.close();})(),i}if(u(e))return I(e,{async transform(e,r){try{const i=await t(e);void 0!==i&&r.enqueue(i);}catch(e){r.error(e);}},async flush(e){try{const t=await r();void 0!==t&&e.enqueue(t);}catch(t){e.error(t);}}});const i=t(e),s=r();return void 0!==i&&void 0!==s?M([i,s]):void 0!==i?i:s}function T(e,t){if(u(e)&&!a(e)){let r;const i=new A({start(e){r=e;}}),n=R(e,i.writable),a=U((async function(){r.error(Error("Readable side was canceled.")),await n,await new Promise(setTimeout);}));return t(i.readable,a.writable),a.readable}e=P(e);const r=new n;return t(e,r),r}function z(e,t){let r;const i=T(e,(e,n)=>{const a=K(e);a.remainder=()=>(a.releaseLock(),R(e,n),i),r=t(a);});return r}function q(e){if(u(e)){const t=function(e){if(a(e)){const t=new n,r=new n;return (async()=>{const i=K(e),n=D(t),a=D(r);try{for(;;){await n.ready,await a.ready;const{done:e,value:t}=await i.read();if(e){await n.close(),await a.close();break}await n.write(t),await a.write(t);}}catch(e){await n.abort(e),await a.abort(e);}finally{i.releaseLock(),n.releaseLock(),a.releaseLock();}})(),[t,r]}if(u(e)){const t=x(e).tee();return t[0][m]=t[1][m]=e[m],t}return [N(e),N(e)]}(e);return O(e,t[0]),t[1]}return N(e)}function F(e){return a(e)?q(e):u(e)?new _({start(t){const r=T(e,async(e,r)=>{const i=K(e),n=D(r);try{for(;;){await n.ready;const{done:e,value:r}=await i.read();if(e){try{t.close();}catch(e){}return void await n.close()}try{t.enqueue(r);}catch(e){}await n.write(r);}}catch(e){t.error(e),await n.abort(e);}});O(e,r);}}):N(e)}function O(e,t){Object.entries(Object.getOwnPropertyDescriptors(e.constructor.prototype)).forEach(([r,i])=>{"constructor"!==r&&(i.value?i.value=i.value.bind(t):i.get=i.get.bind(t),Object.defineProperty(e,r,i));});}function N(e,t=0,r=1/0){if(a(e))throw Error("Not implemented");if(u(e)){if(t>=0&&r>=0){let i=0;return I(e,{transform(e,n){i<r?(i+e.length>=t&&n.enqueue(N(e,Math.max(t-i,0),r-i)),i+=e.length):n.terminate();}})}if(t<0&&(r<0||r===1/0)){let i=[];return B(e,e=>{e.length>=-t?i=[e]:i.push(e);},()=>N(M(i),t,r))}if(0===t&&r<0){let i;return B(e,e=>{const n=i?M([i,e]):e;if(n.length>=-r)return i=N(n,r),N(n,t,r);i=n;})}return console.warn(`stream.slice(input, ${t}, ${r}) not implemented efficiently.`),W(async()=>N(await L(e),t,r))}return e[m]&&(e=M(e[m].concat([e]))),!h(e)||E&&E.isBuffer(e)?e.slice(t,r):(r===1/0&&(r=e.length),e.subarray(t,r))}async function L(e,t=M){return u(e)?K(e).readToEnd(t):e}async function j(e,t){if(u(e)){if(e.cancel)return e.cancel(t);if(e.destroy)return e.destroy(t),await new Promise(setTimeout),t}}function W(e){const t=new n;return (async()=>{const r=D(t);try{await r.write(await e()),await r.close();}catch(e){await r.abort(e);}})(),t}class G{constructor(e){if(void 0===e)throw Error("Invalid BigInteger input");if(e instanceof Uint8Array){const t=e,r=Array(t.length);for(let e=0;e<t.length;e++){const i=t[e].toString(16);r[e]=t[e]<=15?"0"+i:i;}this.value=BigInt("0x0"+r.join(""));}else this.value=BigInt(e);}clone(){return new G(this.value)}iinc(){return this.value++,this}inc(){return this.clone().iinc()}idec(){return this.value--,this}dec(){return this.clone().idec()}iadd(e){return this.value+=e.value,this}add(e){return this.clone().iadd(e)}isub(e){return this.value-=e.value,this}sub(e){return this.clone().isub(e)}imul(e){return this.value*=e.value,this}mul(e){return this.clone().imul(e)}imod(e){return this.value%=e.value,this.isNegative()&&this.iadd(e),this}mod(e){return this.clone().imod(e)}modExp(e,t){if(t.isZero())throw Error("Modulo cannot be zero");if(t.isOne())return new G(0);if(e.isNegative())throw Error("Unsopported negative exponent");let r=e.value,i=this.value;i%=t.value;let n=BigInt(1);for(;r>BigInt(0);){const e=r&BigInt(1);r>>=BigInt(1);const a=n*i%t.value;n=e?a:n,i=i*i%t.value;}return new G(n)}modInv(e){const{gcd:t,x:r}=this._egcd(e);if(!t.isOne())throw Error("Inverse does not exist");return r.add(e).mod(e)}_egcd(e){let t=BigInt(0),r=BigInt(1),i=BigInt(1),n=BigInt(0),a=this.value;for(e=e.value;e!==BigInt(0);){const s=a/e;let o=t;t=i-s*t,i=o,o=r,r=n-s*r,n=o,o=e,e=a%e,a=o;}return {x:new G(i),y:new G(n),gcd:new G(a)}}gcd(e){let t=this.value;for(e=e.value;e!==BigInt(0);){const r=e;e=t%e,t=r;}return new G(t)}ileftShift(e){return this.value<<=e.value,this}leftShift(e){return this.clone().ileftShift(e)}irightShift(e){return this.value>>=e.value,this}rightShift(e){return this.clone().irightShift(e)}equal(e){return this.value===e.value}lt(e){return this.value<e.value}lte(e){return this.value<=e.value}gt(e){return this.value>e.value}gte(e){return this.value>=e.value}isZero(){return this.value===BigInt(0)}isOne(){return this.value===BigInt(1)}isNegative(){return this.value<BigInt(0)}isEven(){return !(this.value&BigInt(1))}abs(){const e=this.clone();return this.isNegative()&&(e.value=-e.value),e}toString(){return this.value.toString()}toNumber(){const e=Number(this.value);if(e>Number.MAX_SAFE_INTEGER)throw Error("Number can only safely store up to 53 bits");return e}getBit(e){return (this.value>>BigInt(e)&BigInt(1))===BigInt(0)?0:1}bitLength(){const e=new G(0),t=new G(1),r=new G(-1),i=this.isNegative()?r:e;let n=1;const a=this.clone();for(;!a.irightShift(t).equal(i);)n++;return n}byteLength(){const e=new G(0),t=new G(-1),r=this.isNegative()?t:e,i=new G(8);let n=1;const a=this.clone();for(;!a.irightShift(i).equal(r);)n++;return n}toUint8Array(e="be",t){let r=this.value.toString(16);r.length%2==1&&(r="0"+r);const i=r.length/2,n=new Uint8Array(t||i),a=t?t-i:0;let s=0;for(;s<i;)n[s+a]=parseInt(r.slice(2*s,2*s+2),16),s++;return "be"!==e&&n.reverse(),n}}const V=e.process&&"development"===e.process.env.NODE_ENV,Z={isString:function(e){return "string"==typeof e||String.prototype.isPrototypeOf(e)},isArray:function(e){return Array.prototype.isPrototypeOf(e)},isUint8Array:h,isStream:u,readNumber:function(e){let t=0;for(let r=0;r<e.length;r++)t+=256**r*e[e.length-1-r];return t},writeNumber:function(e,t){const r=new Uint8Array(t);for(let i=0;i<t;i++)r[i]=e>>8*(t-i-1)&255;return r},readDate:function(e){const t=Z.readNumber(e);return new Date(1e3*t)},writeDate:function(e){const t=Math.floor(e.getTime()/1e3);return Z.writeNumber(t,4)},normalizeDate:function(e=Date.now()){return null===e||e===1/0?e:new Date(1e3*Math.floor(+e/1e3))},readMPI:function(e){const t=(e[0]<<8|e[1])+7>>>3;return e.subarray(2,2+t)},leftPad(e,t){const r=new Uint8Array(t),i=t-e.length;return r.set(e,i),r},uint8ArrayToMPI:function(e){const t=Z.uint8ArrayBitLength(e);if(0===t)throw Error("Zero MPI");const r=e.subarray(e.length-Math.ceil(t/8)),i=Uint8Array.from([(65280&t)>>8,255&t]);return Z.concatUint8Array([i,r])},uint8ArrayBitLength:function(e){let t;for(t=0;t<e.length&&0===e[t];t++);if(t===e.length)return 0;const r=e.subarray(t);return 8*(r.length-1)+Z.nbits(r[0])},hexToUint8Array:function(e){const t=new Uint8Array(e.length>>1);for(let r=0;r<e.length>>1;r++)t[r]=parseInt(e.substr(r<<1,2),16);return t},uint8ArrayToHex:function(e){const t=[],r=e.length;let i,n=0;for(;n<r;){for(i=e[n++].toString(16);i.length<2;)i="0"+i;t.push(""+i);}return t.join("")},stringToUint8Array:function(e){return B(e,e=>{if(!Z.isString(e))throw Error("stringToUint8Array: Data must be in the form of a string");const t=new Uint8Array(e.length);for(let r=0;r<e.length;r++)t[r]=e.charCodeAt(r);return t})},uint8ArrayToString:function(e){const t=[],r=(e=new Uint8Array(e)).length;for(let i=0;i<r;i+=16384)t.push(String.fromCharCode.apply(String,e.subarray(i,i+16384<r?i+16384:r)));return t.join("")},encodeUTF8:function(e){const t=new TextEncoder("utf-8");function r(e,r=!1){return t.encode(e,{stream:!r})}return B(e,r,()=>r("",!0))},decodeUTF8:function(e){const t=new TextDecoder("utf-8");function r(e,r=!1){return t.decode(e,{stream:!r})}return B(e,r,()=>r(new Uint8Array,!0))},concat:M,concatUint8Array:d,equalsUint8Array:function(e,t){if(!Z.isUint8Array(e)||!Z.isUint8Array(t))throw Error("Data must be in the form of a Uint8Array");if(e.length!==t.length)return !1;for(let r=0;r<e.length;r++)if(e[r]!==t[r])return !1;return !0},writeChecksum:function(e){let t=0;for(let r=0;r<e.length;r++)t=t+e[r]&65535;return Z.writeNumber(t,2)},printDebug:function(e){V&&console.log(e);},printDebugError:function(e){V&&console.error(e);},nbits:function(e){let t=1,r=e>>>16;return 0!==r&&(e=r,t+=16),r=e>>8,0!==r&&(e=r,t+=8),r=e>>4,0!==r&&(e=r,t+=4),r=e>>2,0!==r&&(e=r,t+=2),r=e>>1,0!==r&&(e=r,t+=1),t},double:function(e){const t=new Uint8Array(e.length),r=e.length-1;for(let i=0;i<r;i++)t[i]=e[i]<<1^e[i+1]>>7;return t[r]=e[r]<<1^135*(e[0]>>7),t},shiftRight:function(e,t){if(t)for(let r=e.length-1;r>=0;r--)e[r]>>=t,r>0&&(e[r]|=e[r-1]<<8-t);return e},getWebCrypto:function(){return void 0!==e&&e.crypto&&e.crypto.subtle},detectNode:function(){return "object"==typeof e.process&&"object"==typeof e.process.versions},detectBigInt:()=>"undefined"!=typeof BigInt,getBigInteger:async function(){if(Z.detectBigInt())return G;{const{default:e}=await Promise.resolve().then((function(){return Vd}));return e}},getNodeCrypto:function(){},getNodeZlib:function(){},getNodeBuffer:function(){return {}.Buffer},getHardwareConcurrency:function(){if(Z.detectNode()){return (void 0).cpus().length}return navigator.hardwareConcurrency||1},isEmailAddress:function(e){if(!Z.isString(e))return !1;return /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+([a-zA-Z]{2,}|xn--[a-zA-Z\-0-9]+)))$/.test(e)},canonicalizeEOL:function(e){let t=!1;return B(e,e=>{let r;t&&(e=Z.concatUint8Array([new Uint8Array([13]),e])),13===e[e.length-1]?(t=!0,e=e.subarray(0,-1)):t=!1;const i=[];for(let t=0;r=e.indexOf(10,t)+1,r;t=r)13!==e[r-2]&&i.push(r);if(!i.length)return e;const n=new Uint8Array(e.length+i.length);let a=0;for(let t=0;t<i.length;t++){const r=e.subarray(i[t-1]||0,i[t]);n.set(r,a),a+=r.length,n[a-1]=13,n[a]=10,a++;}return n.set(e.subarray(i[i.length-1]||0),a),n},()=>t?new Uint8Array([13]):void 0)},nativeEOL:function(e){let t=!1;return B(e,e=>{let r;13===(e=t&&10!==e[0]?Z.concatUint8Array([new Uint8Array([13]),e]):new Uint8Array(e))[e.length-1]?(t=!0,e=e.subarray(0,-1)):t=!1;let i=0;for(let t=0;t!==e.length;t=r){r=e.indexOf(13,t)+1,r||(r=e.length);const n=r-(10===e[r]?1:0);t&&e.copyWithin(i,t,n),i+=n-t;}return e.subarray(0,i)},()=>t?new Uint8Array([13]):void 0)},removeTrailingSpaces:function(e){return e.split("\n").map(e=>{let t=e.length-1;for(;t>=0&&(" "===e[t]||"\t"===e[t]);t--);return e.substr(0,t+1)}).join("\n")},wrapError:function(e,t){if(!t)return Error(e);try{t.message=e+": "+t.message;}catch(e){}return t},constructAllowedPackets:function(e){const t={};return e.forEach(e=>{if(!e.tag)throw Error("Invalid input: expected a packet class");t[e.tag]=e;}),t},anyPromise:function(e){return new Promise(async(t,r)=>{let i;await Promise.all(e.map(async e=>{try{t(await e);}catch(e){i=e;}})),r(i);})}},Y=Z.getNodeBuffer();let $,X;function J(e){let t=new Uint8Array;return B(e,e=>{t=Z.concatUint8Array([t,e]);const r=[],i=Math.floor(t.length/45),n=45*i,a=$(t.subarray(0,n));for(let e=0;e<i;e++)r.push(a.substr(60*e,60)),r.push("\n");return t=t.subarray(n),r.join("")},()=>t.length?$(t)+"\n":"")}function Q(e){let t="";return B(e,e=>{t+=e;let r=0;const i=[" ","\t","\r","\n"];for(let e=0;e<i.length;e++){const n=i[e];for(let e=t.indexOf(n);-1!==e;e=t.indexOf(n,e+1))r++;}let n=t.length;for(;n>0&&(n-r)%4!=0;n--)i.includes(t[n])&&r--;const a=X(t.substr(0,n));return t=t.substr(n),a},()=>X(t))}function ee(e){return Q(e.replace(/-/g,"+").replace(/_/g,"/"))}function te(e,t){let r=J(e).replace(/[\r\n]/g,"");return t&&(r=r.replace(/[+]/g,"-").replace(/[/]/g,"_").replace(/[=]/g,"")),r}Y?($=e=>Y.from(e).toString("base64"),X=e=>{const t=Y.from(e,"base64");return new Uint8Array(t.buffer,t.byteOffset,t.byteLength)}):($=e=>btoa(Z.uint8ArrayToString(e)),X=e=>Z.stringToUint8Array(atob(e)));const re=Symbol("byValue");var ie={curve:{p256:"p256","P-256":"p256",secp256r1:"p256",prime256v1:"p256","1.2.840.10045.3.1.7":"p256","2a8648ce3d030107":"p256","2A8648CE3D030107":"p256",p384:"p384","P-384":"p384",secp384r1:"p384","1.3.132.0.34":"p384","2b81040022":"p384","2B81040022":"p384",p521:"p521","P-521":"p521",secp521r1:"p521","1.3.132.0.35":"p521","2b81040023":"p521","2B81040023":"p521",secp256k1:"secp256k1","1.3.132.0.10":"secp256k1","2b8104000a":"secp256k1","2B8104000A":"secp256k1",ED25519:"ed25519",ed25519:"ed25519",Ed25519:"ed25519","1.3.6.1.4.1.11591.15.1":"ed25519","2b06010401da470f01":"ed25519","2B06010401DA470F01":"ed25519",X25519:"curve25519",cv25519:"curve25519",curve25519:"curve25519",Curve25519:"curve25519","1.3.6.1.4.1.3029.1.5.1":"curve25519","2b060104019755010501":"curve25519","2B060104019755010501":"curve25519",brainpoolP256r1:"brainpoolP256r1","1.3.36.3.3.2.8.1.1.7":"brainpoolP256r1","2b2403030208010107":"brainpoolP256r1","2B2403030208010107":"brainpoolP256r1",brainpoolP384r1:"brainpoolP384r1","1.3.36.3.3.2.8.1.1.11":"brainpoolP384r1","2b240303020801010b":"brainpoolP384r1","2B240303020801010B":"brainpoolP384r1",brainpoolP512r1:"brainpoolP512r1","1.3.36.3.3.2.8.1.1.13":"brainpoolP512r1","2b240303020801010d":"brainpoolP512r1","2B240303020801010D":"brainpoolP512r1"},s2k:{simple:0,salted:1,iterated:3,gnu:101},publicKey:{rsaEncryptSign:1,rsaEncrypt:2,rsaSign:3,elgamal:16,dsa:17,ecdh:18,ecdsa:19,eddsa:22,aedh:23,aedsa:24},symmetric:{plaintext:0,idea:1,tripledes:2,cast5:3,blowfish:4,aes128:7,aes192:8,aes256:9,twofish:10},compression:{uncompressed:0,zip:1,zlib:2,bzip2:3},hash:{md5:1,sha1:2,ripemd:3,sha256:8,sha384:9,sha512:10,sha224:11},webHash:{"SHA-1":2,"SHA-256":8,"SHA-384":9,"SHA-512":10},aead:{eax:1,ocb:2,experimentalGCM:100},packet:{publicKeyEncryptedSessionKey:1,signature:2,symEncryptedSessionKey:3,onePassSignature:4,secretKey:5,publicKey:6,secretSubkey:7,compressedData:8,symmetricallyEncryptedData:9,marker:10,literalData:11,trust:12,userID:13,publicSubkey:14,userAttribute:17,symEncryptedIntegrityProtectedData:18,modificationDetectionCode:19,aeadEncryptedData:20},literal:{binary:98,text:116,utf8:117,mime:109},signature:{binary:0,text:1,standalone:2,certGeneric:16,certPersona:17,certCasual:18,certPositive:19,certRevocation:48,subkeyBinding:24,keyBinding:25,key:31,keyRevocation:32,subkeyRevocation:40,timestamp:64,thirdParty:80},signatureSubpacket:{signatureCreationTime:2,signatureExpirationTime:3,exportableCertification:4,trustSignature:5,regularExpression:6,revocable:7,keyExpirationTime:9,placeholderBackwardsCompatibility:10,preferredSymmetricAlgorithms:11,revocationKey:12,issuer:16,notationData:20,preferredHashAlgorithms:21,preferredCompressionAlgorithms:22,keyServerPreferences:23,preferredKeyServer:24,primaryUserID:25,policyURI:26,keyFlags:27,signersUserID:28,reasonForRevocation:29,features:30,signatureTarget:31,embeddedSignature:32,issuerFingerprint:33,preferredAEADAlgorithms:34},keyFlags:{certifyKeys:1,signData:2,encryptCommunication:4,encryptStorage:8,splitPrivateKey:16,authentication:32,sharedPrivateKey:128},armor:{multipartSection:0,multipartLast:1,signed:2,message:3,publicKey:4,privateKey:5,signature:6},reasonForRevocation:{noReason:0,keySuperseded:1,keyCompromised:2,keyRetired:3,userIDInvalid:32},features:{modificationDetection:1,aead:2,v5Keys:4},write:function(e,t){if("number"==typeof t&&(t=this.read(e,t)),void 0!==e[t])return e[t];throw Error("Invalid enum value.")},read:function(e,t){if(e[re]||(e[re]=[],Object.entries(e).forEach(([t,r])=>{e[re][r]=t;})),void 0!==e[re][t])return e[re][t];throw Error("Invalid enum value.")}},ne={preferredHashAlgorithm:ie.hash.sha256,preferredSymmetricAlgorithm:ie.symmetric.aes256,preferredCompressionAlgorithm:ie.compression.uncompressed,deflateLevel:6,aeadProtect:!1,preferredAEADAlgorithm:ie.aead.eax,aeadChunkSizeByte:12,v5Keys:!1,s2kIterationCountByte:224,allowUnauthenticatedMessages:!1,allowUnauthenticatedStream:!1,checksumRequired:!1,minRSABits:2048,passwordCollisionCheck:!1,revocationsExpire:!1,allowInsecureDecryptionWithSigningKeys:!1,minBytesForWebCrypto:1e3,tolerant:!0,showVersion:!1,showComment:!1,versionString:"OpenPGP.js 5.0.0-2",commentString:"https://openpgpjs.org",maxUserIDLength:5120,knownNotations:["preferred-email-encoding@pgp.com","pka-address@gnupg.org"],useIndutnyElliptic:!0,rejectHashAlgorithms:new Set([ie.hash.md5,ie.hash.ripemd]),rejectMessageHashAlgorithms:new Set([ie.hash.md5,ie.hash.ripemd,ie.hash.sha1]),rejectPublicKeyAlgorithms:new Set([ie.publicKey.elgamal,ie.publicKey.dsa])};function ae(e){const t=e.match(/^-----BEGIN PGP (MESSAGE, PART \d+\/\d+|MESSAGE, PART \d+|SIGNED MESSAGE|MESSAGE|PUBLIC KEY BLOCK|PRIVATE KEY BLOCK|SIGNATURE)-----$/m);if(!t)throw Error("Unknown ASCII armor type");return /MESSAGE, PART \d+\/\d+/.test(t[1])?ie.armor.multipartSection:/MESSAGE, PART \d+/.test(t[1])?ie.armor.multipartLast:/SIGNED MESSAGE/.test(t[1])?ie.armor.signed:/MESSAGE/.test(t[1])?ie.armor.message:/PUBLIC KEY BLOCK/.test(t[1])?ie.armor.publicKey:/PRIVATE KEY BLOCK/.test(t[1])?ie.armor.privateKey:/SIGNATURE/.test(t[1])?ie.armor.signature:void 0}function se(e,t){let r="";return t.showVersion&&(r+="Version: "+t.versionString+"\n"),t.showComment&&(r+="Comment: "+t.commentString+"\n"),e&&(r+="Comment: "+e+"\n"),r+="\n",r}function oe(e){return J(function(e){let t=13501623;return B(e,e=>{const r=ue?Math.floor(e.length/4):0,i=new Uint32Array(e.buffer,e.byteOffset,r);for(let e=0;e<r;e++)t^=i[e],t=ce[0][t>>24&255]^ce[1][t>>16&255]^ce[2][t>>8&255]^ce[3][t>>0&255];for(let i=4*r;i<e.length;i++)t=t>>8^ce[0][255&t^e[i]];},()=>new Uint8Array([t,t>>8,t>>16]))}(e))}const ce=[Array(255),Array(255),Array(255),Array(255)];for(let e=0;e<=255;e++){let t=e<<16;for(let e=0;e<8;e++)t=t<<1^(0!=(8388608&t)?8801531:0);ce[0][e]=(16711680&t)>>16|65280&t|(255&t)<<16;}for(let e=0;e<=255;e++)ce[1][e]=ce[0][e]>>8^ce[0][255&ce[0][e]];for(let e=0;e<=255;e++)ce[2][e]=ce[1][e]>>8^ce[0][255&ce[1][e]];for(let e=0;e<=255;e++)ce[3][e]=ce[2][e]>>8^ce[0][255&ce[2][e]];const ue=function(){const e=new ArrayBuffer(2);return new DataView(e).setInt16(0,255,!0),255===new Int16Array(e)[0]}();function he(e){for(let t=0;t<e.length;t++){if(!/^([^\s:]|[^\s:][^:]*[^\s:]): .+$/.test(e[t]))throw Error("Improperly formatted armor header: "+e[t]);/^(Version|Comment|MessageID|Hash|Charset): .+$/.test(e[t])||Z.printDebugError(Error("Unknown header: "+e[t]));}}function de(e){let t=e,r="";const i=e.lastIndexOf("=");return i>=0&&i!==e.length-1&&(t=e.slice(0,i),r=e.slice(i+1).substr(0,4)),{body:t,checksum:r}}function fe(e,t=ne){return new Promise(async(r,i)=>{try{const n=/^-----[^-]+-----$/m,a=/^[ \f\r\t\u00a0\u2000-\u200a\u202f\u205f\u3000]*$/;let s;const o=[];let c,u,h,d=o,f=[],l=Q(T(e,async(e,t)=>{const p=K(e);try{for(;;){let e=await p.readLine();if(void 0===e)throw Error("Misformed armored text");if(e=Z.removeTrailingSpaces(e.replace(/[\r\n]/g,"")),s)if(c)u||2!==s||(n.test(e)?(f=f.join("\r\n"),u=!0,he(d),d=[],c=!1):f.push(e.replace(/^- /,"")));else if(n.test(e)&&i(Error("Mandatory blank line missing between armor headers and armor data")),a.test(e)){if(he(d),c=!0,u||2!==s){r({text:f,data:l,headers:o,type:s});break}}else d.push(e);else n.test(e)&&(s=ae(e));}}catch(e){return void i(e)}const y=D(t);try{for(;;){await y.ready;const{done:e,value:t}=await p.read();if(e)throw Error("Misformed armored text");const r=t+"";if(-1!==r.indexOf("=")||-1!==r.indexOf("-")){let e=await p.readToEnd();e.length||(e=""),e=r+e,e=Z.removeTrailingSpaces(e.replace(/\r/g,""));const t=e.split(n);if(1===t.length)throw Error("Misformed armored text");const i=de(t[0].slice(0,-1));h=i.checksum,await y.write(i.body);break}await y.write(r);}await y.ready,await y.close();}catch(e){await y.abort(e);}}));l=T(l,async(e,r)=>{const i=L(oe(F(e)));i.catch(()=>{}),await R(e,r,{preventClose:!0});const n=D(r);try{const e=(await i).replace("\n","");if(h!==e&&(h||t.checksumRequired))throw Error("Ascii armor integrity check on message failed: '"+h+"' should be '"+e+"'");await n.ready,await n.close();}catch(e){await n.abort(e);}});}catch(e){i(e);}})}function le(e,t,r,i,n,a=ne){let s,o;e===ie.armor.signed&&(s=t.text,o=t.hash,t=t.data);const c=F(t),u=[];switch(e){case ie.armor.multipartSection:u.push("-----BEGIN PGP MESSAGE, PART "+r+"/"+i+"-----\n"),u.push(se(n,a)),u.push(J(t)),u.push("=",oe(c)),u.push("-----END PGP MESSAGE, PART "+r+"/"+i+"-----\n");break;case ie.armor.multipartLast:u.push("-----BEGIN PGP MESSAGE, PART "+r+"-----\n"),u.push(se(n,a)),u.push(J(t)),u.push("=",oe(c)),u.push("-----END PGP MESSAGE, PART "+r+"-----\n");break;case ie.armor.signed:u.push("\n-----BEGIN PGP SIGNED MESSAGE-----\n"),u.push("Hash: "+o+"\n\n"),u.push(s.replace(/^-/gm,"- -")),u.push("\n-----BEGIN PGP SIGNATURE-----\n"),u.push(se(n,a)),u.push(J(t)),u.push("=",oe(c)),u.push("-----END PGP SIGNATURE-----\n");break;case ie.armor.message:u.push("-----BEGIN PGP MESSAGE-----\n"),u.push(se(n,a)),u.push(J(t)),u.push("=",oe(c)),u.push("-----END PGP MESSAGE-----\n");break;case ie.armor.publicKey:u.push("-----BEGIN PGP PUBLIC KEY BLOCK-----\n"),u.push(se(n,a)),u.push(J(t)),u.push("=",oe(c)),u.push("-----END PGP PUBLIC KEY BLOCK-----\n");break;case ie.armor.privateKey:u.push("-----BEGIN PGP PRIVATE KEY BLOCK-----\n"),u.push(se(n,a)),u.push(J(t)),u.push("=",oe(c)),u.push("-----END PGP PRIVATE KEY BLOCK-----\n");break;case ie.armor.signature:u.push("-----BEGIN PGP SIGNATURE-----\n"),u.push(se(n,a)),u.push(J(t)),u.push("=",oe(c)),u.push("-----END PGP SIGNATURE-----\n");}return Z.concat(u)}class pe{constructor(){this.bytes="";}read(e){this.bytes=Z.uint8ArrayToString(e.subarray(0,8));}write(){return Z.stringToUint8Array(this.bytes)}toHex(){return Z.uint8ArrayToHex(Z.stringToUint8Array(this.bytes))}equals(e,t=!1){return t&&(e.isWildcard()||this.isWildcard())||this.bytes===e.bytes}isNull(){return ""===this.bytes}isWildcard(){return /^0+$/.test(this.toHex())}static mapToHex(e){return e.toHex()}static fromID(e){const t=new pe;return t.read(Z.hexToUint8Array(e)),t}static wildcard(){const e=new pe;return e.read(new Uint8Array(8)),e}}var ye=function(){var e,t,r=!1;function i(r,i){var n=e[(t[r]+t[i])%255];return 0!==r&&0!==i||(n=0),n}var n,a,s,o,c=!1;function u(){function u(r){var i,n,a;for(n=a=function(r){var i=e[255-t[r]];return 0===r&&(i=0),i}(r),i=0;i<4;i++)a^=n=255&(n<<1|n>>>7);return a^=99}r||function(){e=[],t=[];var i,n,a=1;for(i=0;i<255;i++)e[i]=a,n=128&a,a<<=1,a&=255,128===n&&(a^=27),a^=e[i],t[e[i]]=i;e[255]=e[0],t[0]=0,r=!0;}(),n=[],a=[],s=[[],[],[],[]],o=[[],[],[],[]];for(var h=0;h<256;h++){var d=u(h);n[h]=d,a[d]=h,s[0][h]=i(2,d)<<24|d<<16|d<<8|i(3,d),o[0][d]=i(14,h)<<24|i(9,h)<<16|i(13,h)<<8|i(11,h);for(var f=1;f<4;f++)s[f][h]=s[f-1][h]>>>8|s[f-1][h]<<24,o[f][d]=o[f-1][d]>>>8|o[f-1][d]<<24;}c=!0;}var h=function(e,t){c||u();var r=new Uint32Array(t);r.set(n,512),r.set(a,768);for(var i=0;i<4;i++)r.set(s[i],4096+1024*i>>2),r.set(o[i],8192+1024*i>>2);var h=function(e,t,r){"use asm";var i=0,n=0,a=0,s=0,o=0,c=0,u=0,h=0,d=0,f=0,l=0,p=0,y=0,b=0,m=0,g=0,w=0,v=0,_=0,k=0,A=0;var S=new e.Uint32Array(r),E=new e.Uint8Array(r);function x(e,t,r,o,c,u,h,d){e=e|0;t=t|0;r=r|0;o=o|0;c=c|0;u=u|0;h=h|0;d=d|0;var f=0,l=0,p=0,y=0,b=0,m=0,g=0,w=0;f=r|0x400,l=r|0x800,p=r|0xc00;c=c^S[(e|0)>>2],u=u^S[(e|4)>>2],h=h^S[(e|8)>>2],d=d^S[(e|12)>>2];for(w=16;(w|0)<=o<<4;w=w+16|0){y=S[(r|c>>22&1020)>>2]^S[(f|u>>14&1020)>>2]^S[(l|h>>6&1020)>>2]^S[(p|d<<2&1020)>>2]^S[(e|w|0)>>2],b=S[(r|u>>22&1020)>>2]^S[(f|h>>14&1020)>>2]^S[(l|d>>6&1020)>>2]^S[(p|c<<2&1020)>>2]^S[(e|w|4)>>2],m=S[(r|h>>22&1020)>>2]^S[(f|d>>14&1020)>>2]^S[(l|c>>6&1020)>>2]^S[(p|u<<2&1020)>>2]^S[(e|w|8)>>2],g=S[(r|d>>22&1020)>>2]^S[(f|c>>14&1020)>>2]^S[(l|u>>6&1020)>>2]^S[(p|h<<2&1020)>>2]^S[(e|w|12)>>2];c=y,u=b,h=m,d=g;}i=S[(t|c>>22&1020)>>2]<<24^S[(t|u>>14&1020)>>2]<<16^S[(t|h>>6&1020)>>2]<<8^S[(t|d<<2&1020)>>2]^S[(e|w|0)>>2],n=S[(t|u>>22&1020)>>2]<<24^S[(t|h>>14&1020)>>2]<<16^S[(t|d>>6&1020)>>2]<<8^S[(t|c<<2&1020)>>2]^S[(e|w|4)>>2],a=S[(t|h>>22&1020)>>2]<<24^S[(t|d>>14&1020)>>2]<<16^S[(t|c>>6&1020)>>2]<<8^S[(t|u<<2&1020)>>2]^S[(e|w|8)>>2],s=S[(t|d>>22&1020)>>2]<<24^S[(t|c>>14&1020)>>2]<<16^S[(t|u>>6&1020)>>2]<<8^S[(t|h<<2&1020)>>2]^S[(e|w|12)>>2];}function P(e,t,r,i){e=e|0;t=t|0;r=r|0;i=i|0;x(0x0000,0x0800,0x1000,A,e,t,r,i);}function M(e,t,r,i){e=e|0;t=t|0;r=r|0;i=i|0;var a=0;x(0x0400,0x0c00,0x2000,A,e,i,r,t);a=n,n=s,s=a;}function C(e,t,r,d){e=e|0;t=t|0;r=r|0;d=d|0;x(0x0000,0x0800,0x1000,A,o^e,c^t,u^r,h^d);o=i,c=n,u=a,h=s;}function K(e,t,r,d){e=e|0;t=t|0;r=r|0;d=d|0;var f=0;x(0x0400,0x0c00,0x2000,A,e,d,r,t);f=n,n=s,s=f;i=i^o,n=n^c,a=a^u,s=s^h;o=e,c=t,u=r,h=d;}function D(e,t,r,d){e=e|0;t=t|0;r=r|0;d=d|0;x(0x0000,0x0800,0x1000,A,o,c,u,h);o=i=i^e,c=n=n^t,u=a=a^r,h=s=s^d;}function R(e,t,r,d){e=e|0;t=t|0;r=r|0;d=d|0;x(0x0000,0x0800,0x1000,A,o,c,u,h);i=i^e,n=n^t,a=a^r,s=s^d;o=e,c=t,u=r,h=d;}function I(e,t,r,d){e=e|0;t=t|0;r=r|0;d=d|0;x(0x0000,0x0800,0x1000,A,o,c,u,h);o=i,c=n,u=a,h=s;i=i^e,n=n^t,a=a^r,s=s^d;}function U(e,t,r,o){e=e|0;t=t|0;r=r|0;o=o|0;x(0x0000,0x0800,0x1000,A,d,f,l,p);p=~g&p|g&p+1;l=~m&l|m&l+((p|0)==0);f=~b&f|b&f+((l|0)==0);d=~y&d|y&d+((f|0)==0);i=i^e;n=n^t;a=a^r;s=s^o;}function B(e,t,r,i){e=e|0;t=t|0;r=r|0;i=i|0;var n=0,a=0,s=0,d=0,f=0,l=0,p=0,y=0,b=0,m=0;e=e^o,t=t^c,r=r^u,i=i^h;n=w|0,a=v|0,s=_|0,d=k|0;for(;(b|0)<128;b=b+1|0){if(n>>>31){f=f^e,l=l^t,p=p^r,y=y^i;}n=n<<1|a>>>31,a=a<<1|s>>>31,s=s<<1|d>>>31,d=d<<1;m=i&1;i=i>>>1|r<<31,r=r>>>1|t<<31,t=t>>>1|e<<31,e=e>>>1;if(m)e=e^0xe1000000;}o=f,c=l,u=p,h=y;}function T(e){e=e|0;A=e;}function z(e,t,r,o){e=e|0;t=t|0;r=r|0;o=o|0;i=e,n=t,a=r,s=o;}function q(e,t,r,i){e=e|0;t=t|0;r=r|0;i=i|0;o=e,c=t,u=r,h=i;}function F(e,t,r,i){e=e|0;t=t|0;r=r|0;i=i|0;d=e,f=t,l=r,p=i;}function O(e,t,r,i){e=e|0;t=t|0;r=r|0;i=i|0;y=e,b=t,m=r,g=i;}function N(e,t,r,i){e=e|0;t=t|0;r=r|0;i=i|0;p=~g&p|g&i,l=~m&l|m&r,f=~b&f|b&t,d=~y&d|y&e;}function L(e){e=e|0;if(e&15)return -1;E[e|0]=i>>>24,E[e|1]=i>>>16&255,E[e|2]=i>>>8&255,E[e|3]=i&255,E[e|4]=n>>>24,E[e|5]=n>>>16&255,E[e|6]=n>>>8&255,E[e|7]=n&255,E[e|8]=a>>>24,E[e|9]=a>>>16&255,E[e|10]=a>>>8&255,E[e|11]=a&255,E[e|12]=s>>>24,E[e|13]=s>>>16&255,E[e|14]=s>>>8&255,E[e|15]=s&255;return 16}function j(e){e=e|0;if(e&15)return -1;E[e|0]=o>>>24,E[e|1]=o>>>16&255,E[e|2]=o>>>8&255,E[e|3]=o&255,E[e|4]=c>>>24,E[e|5]=c>>>16&255,E[e|6]=c>>>8&255,E[e|7]=c&255,E[e|8]=u>>>24,E[e|9]=u>>>16&255,E[e|10]=u>>>8&255,E[e|11]=u&255,E[e|12]=h>>>24,E[e|13]=h>>>16&255,E[e|14]=h>>>8&255,E[e|15]=h&255;return 16}function W(){P(0,0,0,0);w=i,v=n,_=a,k=s;}function H(e,t,r){e=e|0;t=t|0;r=r|0;var o=0;if(t&15)return -1;while((r|0)>=16){V[e&7](E[t|0]<<24|E[t|1]<<16|E[t|2]<<8|E[t|3],E[t|4]<<24|E[t|5]<<16|E[t|6]<<8|E[t|7],E[t|8]<<24|E[t|9]<<16|E[t|10]<<8|E[t|11],E[t|12]<<24|E[t|13]<<16|E[t|14]<<8|E[t|15]);E[t|0]=i>>>24,E[t|1]=i>>>16&255,E[t|2]=i>>>8&255,E[t|3]=i&255,E[t|4]=n>>>24,E[t|5]=n>>>16&255,E[t|6]=n>>>8&255,E[t|7]=n&255,E[t|8]=a>>>24,E[t|9]=a>>>16&255,E[t|10]=a>>>8&255,E[t|11]=a&255,E[t|12]=s>>>24,E[t|13]=s>>>16&255,E[t|14]=s>>>8&255,E[t|15]=s&255;o=o+16|0,t=t+16|0,r=r-16|0;}return o|0}function G(e,t,r){e=e|0;t=t|0;r=r|0;var i=0;if(t&15)return -1;while((r|0)>=16){Z[e&1](E[t|0]<<24|E[t|1]<<16|E[t|2]<<8|E[t|3],E[t|4]<<24|E[t|5]<<16|E[t|6]<<8|E[t|7],E[t|8]<<24|E[t|9]<<16|E[t|10]<<8|E[t|11],E[t|12]<<24|E[t|13]<<16|E[t|14]<<8|E[t|15]);i=i+16|0,t=t+16|0,r=r-16|0;}return i|0}var V=[P,M,C,K,D,R,I,U];var Z=[C,B];return {set_rounds:T,set_state:z,set_iv:q,set_nonce:F,set_mask:O,set_counter:N,get_state:L,get_iv:j,gcm_init:W,cipher:H,mac:G}}({Uint8Array,Uint32Array},e,t);return h.set_key=function(e,t,i,a,s,c,u,d,f){var l=r.subarray(0,60),p=r.subarray(256,316);l.set([t,i,a,s,c,u,d,f]);for(var y=e,b=1;y<4*e+28;y++){var m=l[y-1];(y%e==0||8===e&&y%e==4)&&(m=n[m>>>24]<<24^n[m>>>16&255]<<16^n[m>>>8&255]<<8^n[255&m]),y%e==0&&(m=m<<8^m>>>24^b<<24,b=b<<1^(128&b?27:0)),l[y]=l[y-e]^m;}for(var g=0;g<y;g+=4)for(var w=0;w<4;w++){m=l[y-(4+g)+(4-w)%4];p[g+w]=g<4||g>=y-4?m:o[0][n[m>>>24]]^o[1][n[m>>>16&255]]^o[2][n[m>>>8&255]]^o[3][n[255&m]];}h.set_rounds(e+5);},h};return h.ENC={ECB:0,CBC:2,CFB:4,OFB:6,CTR:7},h.DEC={ECB:1,CBC:3,CFB:5,OFB:6,CTR:7},h.MAC={CBC:0,GCM:1},h.HEAP_DATA=16384,h}();function be(e){return e instanceof Uint8Array}function me(e,t){const r=e?e.byteLength:t||65536;if(4095&r||r<=0)throw Error("heap size must be a positive integer and a multiple of 4096");return e=e||new Uint8Array(new ArrayBuffer(r))}function ge(e,t,r,i,n){const a=e.length-t,s=a<n?a:n;return e.set(r.subarray(i,i+s),t),s}function we(...e){const t=e.reduce((e,t)=>e+t.length,0),r=new Uint8Array(t);let i=0;for(let t=0;t<e.length;t++)r.set(e[t],i),i+=e[t].length;return r}class ve extends Error{constructor(...e){super(...e);}}class _e extends Error{constructor(...e){super(...e);}}class ke extends Error{constructor(...e){super(...e);}}const Ae=[],Se=[];class Ee{constructor(e,t,r=!0,i,n,a){this.pos=0,this.len=0,this.mode=i,this.pos=0,this.len=0,this.key=e,this.iv=t,this.padding=r,this.acquire_asm(n,a);}acquire_asm(e,t){return void 0!==this.heap&&void 0!==this.asm||(this.heap=e||Ae.pop()||me().subarray(ye.HEAP_DATA),this.asm=t||Se.pop()||new ye(null,this.heap.buffer),this.reset(this.key,this.iv)),{heap:this.heap,asm:this.asm}}release_asm(){void 0!==this.heap&&void 0!==this.asm&&(Ae.push(this.heap),Se.push(this.asm)),this.heap=void 0,this.asm=void 0;}reset(e,t){const{asm:r}=this.acquire_asm(),i=e.length;if(16!==i&&24!==i&&32!==i)throw new _e("illegal key size");const n=new DataView(e.buffer,e.byteOffset,e.byteLength);if(r.set_key(i>>2,n.getUint32(0),n.getUint32(4),n.getUint32(8),n.getUint32(12),i>16?n.getUint32(16):0,i>16?n.getUint32(20):0,i>24?n.getUint32(24):0,i>24?n.getUint32(28):0),void 0!==t){if(16!==t.length)throw new _e("illegal iv size");let e=new DataView(t.buffer,t.byteOffset,t.byteLength);r.set_iv(e.getUint32(0),e.getUint32(4),e.getUint32(8),e.getUint32(12));}else r.set_iv(0,0,0,0);}AES_Encrypt_process(e){if(!be(e))throw new TypeError("data isn't of expected type");let{heap:t,asm:r}=this.acquire_asm(),i=ye.ENC[this.mode],n=ye.HEAP_DATA,a=this.pos,s=this.len,o=0,c=e.length||0,u=0,h=0,d=new Uint8Array(s+c&-16);for(;c>0;)h=ge(t,a+s,e,o,c),s+=h,o+=h,c-=h,h=r.cipher(i,n+a,s),h&&d.set(t.subarray(a,a+h),u),u+=h,h<s?(a+=h,s-=h):(a=0,s=0);return this.pos=a,this.len=s,d}AES_Encrypt_finish(){let{heap:e,asm:t}=this.acquire_asm(),r=ye.ENC[this.mode],i=ye.HEAP_DATA,n=this.pos,a=this.len,s=16-a%16,o=a;if(this.hasOwnProperty("padding")){if(this.padding){for(let t=0;t<s;++t)e[n+a+t]=s;a+=s,o=a;}else if(a%16)throw new _e("data length must be a multiple of the block size")}else a+=s;const c=new Uint8Array(o);return a&&t.cipher(r,i+n,a),o&&c.set(e.subarray(n,n+o)),this.pos=0,this.len=0,this.release_asm(),c}AES_Decrypt_process(e){if(!be(e))throw new TypeError("data isn't of expected type");let{heap:t,asm:r}=this.acquire_asm(),i=ye.DEC[this.mode],n=ye.HEAP_DATA,a=this.pos,s=this.len,o=0,c=e.length||0,u=0,h=s+c&-16,d=0,f=0;this.padding&&(d=s+c-h||16,h-=d);const l=new Uint8Array(h);for(;c>0;)f=ge(t,a+s,e,o,c),s+=f,o+=f,c-=f,f=r.cipher(i,n+a,s-(c?0:d)),f&&l.set(t.subarray(a,a+f),u),u+=f,f<s?(a+=f,s-=f):(a=0,s=0);return this.pos=a,this.len=s,l}AES_Decrypt_finish(){let{heap:e,asm:t}=this.acquire_asm(),r=ye.DEC[this.mode],i=ye.HEAP_DATA,n=this.pos,a=this.len,s=a;if(a>0){if(a%16){if(this.hasOwnProperty("padding"))throw new _e("data length must be a multiple of the block size");a+=16-a%16;}if(t.cipher(r,i+n,a),this.hasOwnProperty("padding")&&this.padding){let t=e[n+s-1];if(t<1||t>16||t>s)throw new ke("bad padding");let r=0;for(let i=t;i>1;i--)r|=t^e[n+s-i];if(r)throw new ke("bad padding");s-=t;}}const o=new Uint8Array(s);return s>0&&o.set(e.subarray(n,n+s)),this.pos=0,this.len=0,this.release_asm(),o}}class xe{static encrypt(e,t,r=!1){return new xe(t,r).encrypt(e)}static decrypt(e,t,r=!1){return new xe(t,r).decrypt(e)}constructor(e,t=!1,r){this.aes=r||new Ee(e,void 0,t,"ECB");}encrypt(e){return we(this.aes.AES_Encrypt_process(e),this.aes.AES_Encrypt_finish())}decrypt(e){return we(this.aes.AES_Decrypt_process(e),this.aes.AES_Decrypt_finish())}}function Pe(e){const t=function(e){const t=new xe(e);this.encrypt=function(e){return t.encrypt(e)},this.decrypt=function(e){return t.decrypt(e)};};return t.blockSize=t.prototype.blockSize=16,t.keySize=t.prototype.keySize=e/8,t}function Me(e,t,r,i,n,a){const s=[16843776,0,65536,16843780,16842756,66564,4,65536,1024,16843776,16843780,1024,16778244,16842756,16777216,4,1028,16778240,16778240,66560,66560,16842752,16842752,16778244,65540,16777220,16777220,65540,0,1028,66564,16777216,65536,16843780,4,16842752,16843776,16777216,16777216,1024,16842756,65536,66560,16777220,1024,4,16778244,66564,16843780,65540,16842752,16778244,16777220,1028,66564,16843776,1028,16778240,16778240,0,65540,66560,0,16842756],o=[-2146402272,-2147450880,32768,1081376,1048576,32,-2146435040,-2147450848,-2147483616,-2146402272,-2146402304,-2147483648,-2147450880,1048576,32,-2146435040,1081344,1048608,-2147450848,0,-2147483648,32768,1081376,-2146435072,1048608,-2147483616,0,1081344,32800,-2146402304,-2146435072,32800,0,1081376,-2146435040,1048576,-2147450848,-2146435072,-2146402304,32768,-2146435072,-2147450880,32,-2146402272,1081376,32,32768,-2147483648,32800,-2146402304,1048576,-2147483616,1048608,-2147450848,-2147483616,1048608,1081344,0,-2147450880,32800,-2147483648,-2146435040,-2146402272,1081344],c=[520,134349312,0,134348808,134218240,0,131592,134218240,131080,134217736,134217736,131072,134349320,131080,134348800,520,134217728,8,134349312,512,131584,134348800,134348808,131592,134218248,131584,131072,134218248,8,134349320,512,134217728,134349312,134217728,131080,520,131072,134349312,134218240,0,512,131080,134349320,134218240,134217736,512,0,134348808,134218248,131072,134217728,134349320,8,131592,131584,134217736,134348800,134218248,520,134348800,131592,8,134348808,131584],u=[8396801,8321,8321,128,8396928,8388737,8388609,8193,0,8396800,8396800,8396929,129,0,8388736,8388609,1,8192,8388608,8396801,128,8388608,8193,8320,8388737,1,8320,8388736,8192,8396928,8396929,129,8388736,8388609,8396800,8396929,129,0,0,8396800,8320,8388736,8388737,1,8396801,8321,8321,128,8396929,129,1,8192,8388609,8193,8396928,8388737,8193,8320,8388608,8396801,128,8388608,8192,8396928],h=[256,34078976,34078720,1107296512,524288,256,1073741824,34078720,1074266368,524288,33554688,1074266368,1107296512,1107820544,524544,1073741824,33554432,1074266112,1074266112,0,1073742080,1107820800,1107820800,33554688,1107820544,1073742080,0,1107296256,34078976,33554432,1107296256,524544,524288,1107296512,256,33554432,1073741824,34078720,1107296512,1074266368,33554688,1073741824,1107820544,34078976,1074266368,256,33554432,1107820544,1107820800,524544,1107296256,1107820800,34078720,0,1074266112,1107296256,524544,33554688,1073742080,524288,0,1074266112,34078976,1073742080],d=[536870928,541065216,16384,541081616,541065216,16,541081616,4194304,536887296,4210704,4194304,536870928,4194320,536887296,536870912,16400,0,4194320,536887312,16384,4210688,536887312,16,541065232,541065232,0,4210704,541081600,16400,4210688,541081600,536870912,536887296,16,541065232,4210688,541081616,4194304,16400,536870928,4194304,536887296,536870912,16400,536870928,541081616,4210688,541065216,4210704,541081600,0,541065232,16,16384,541065216,4210704,16384,4194320,536887312,0,541081600,536870912,4194320,536887312],f=[2097152,69206018,67110914,0,2048,67110914,2099202,69208064,69208066,2097152,0,67108866,2,67108864,69206018,2050,67110912,2099202,2097154,67110912,67108866,69206016,69208064,2097154,69206016,2048,2050,69208066,2099200,2,67108864,2099200,67108864,2099200,2097152,67110914,67110914,69206018,69206018,2,2097154,67108864,67110912,2097152,69208064,2050,2099202,69208064,2050,67108866,69208066,69206016,2099200,0,2,69208066,0,2099202,69206016,2048,67108866,67110912,2048,2097154],l=[268439616,4096,262144,268701760,268435456,268439616,64,268435456,262208,268697600,268701760,266240,268701696,266304,4096,64,268697600,268435520,268439552,4160,266240,262208,268697664,268701696,4160,0,0,268697664,268435520,268439552,266304,262144,266304,262144,268701696,4096,64,268697664,4096,266304,268439552,64,268435520,268697600,268697664,268435456,262144,268439616,0,268701760,262208,268435520,268697600,268439552,268439616,0,268701760,266240,266240,4160,4160,262208,268435456,268701696];let p,y,b,m,g,w,v,_,k,A,S,E,x,P,M=0,C=t.length;const K=32===e.length?3:9;_=3===K?r?[0,32,2]:[30,-2,-2]:r?[0,32,2,62,30,-2,64,96,2]:[94,62,-2,32,64,2,30,-2,-2],r&&(C=(t=function(e,t){const r=8-e.length%8;let i;if(2===t&&r<8)i=32;else if(1===t)i=r;else {if(t||!(r<8)){if(8===r)return e;throw Error("des: invalid padding")}i=0;}const n=new Uint8Array(e.length+r);for(let t=0;t<e.length;t++)n[t]=e[t];for(let t=0;t<r;t++)n[e.length+t]=i;return n}(t,a)).length);let D=new Uint8Array(C),R=0;for(1===i&&(k=n[M++]<<24|n[M++]<<16|n[M++]<<8|n[M++],S=n[M++]<<24|n[M++]<<16|n[M++]<<8|n[M++],M=0);M<C;){for(w=t[M++]<<24|t[M++]<<16|t[M++]<<8|t[M++],v=t[M++]<<24|t[M++]<<16|t[M++]<<8|t[M++],1===i&&(r?(w^=k,v^=S):(A=k,E=S,k=w,S=v)),b=252645135&(w>>>4^v),v^=b,w^=b<<4,b=65535&(w>>>16^v),v^=b,w^=b<<16,b=858993459&(v>>>2^w),w^=b,v^=b<<2,b=16711935&(v>>>8^w),w^=b,v^=b<<8,b=1431655765&(w>>>1^v),v^=b,w^=b<<1,w=w<<1|w>>>31,v=v<<1|v>>>31,y=0;y<K;y+=3){for(x=_[y+1],P=_[y+2],p=_[y];p!==x;p+=P)m=v^e[p],g=(v>>>4|v<<28)^e[p+1],b=w,w=v,v=b^(o[m>>>24&63]|u[m>>>16&63]|d[m>>>8&63]|l[63&m]|s[g>>>24&63]|c[g>>>16&63]|h[g>>>8&63]|f[63&g]);b=w,w=v,v=b;}w=w>>>1|w<<31,v=v>>>1|v<<31,b=1431655765&(w>>>1^v),v^=b,w^=b<<1,b=16711935&(v>>>8^w),w^=b,v^=b<<8,b=858993459&(v>>>2^w),w^=b,v^=b<<2,b=65535&(w>>>16^v),v^=b,w^=b<<16,b=252645135&(w>>>4^v),v^=b,w^=b<<4,1===i&&(r?(k=w,S=v):(w^=A,v^=E)),D[R++]=w>>>24,D[R++]=w>>>16&255,D[R++]=w>>>8&255,D[R++]=255&w,D[R++]=v>>>24,D[R++]=v>>>16&255,D[R++]=v>>>8&255,D[R++]=255&v;}return r||(D=function(e,t){let r,i=null;if(2===t)r=32;else if(1===t)i=e[e.length-1];else {if(t)throw Error("des: invalid padding");r=0;}if(!i){for(i=1;e[e.length-i]===r;)i++;i--;}return e.subarray(0,e.length-i)}(D,a)),D}function Ce(e){const t=[0,4,536870912,536870916,65536,65540,536936448,536936452,512,516,536871424,536871428,66048,66052,536936960,536936964],r=[0,1,1048576,1048577,67108864,67108865,68157440,68157441,256,257,1048832,1048833,67109120,67109121,68157696,68157697],i=[0,8,2048,2056,16777216,16777224,16779264,16779272,0,8,2048,2056,16777216,16777224,16779264,16779272],n=[0,2097152,134217728,136314880,8192,2105344,134225920,136323072,131072,2228224,134348800,136445952,139264,2236416,134356992,136454144],a=[0,262144,16,262160,0,262144,16,262160,4096,266240,4112,266256,4096,266240,4112,266256],s=[0,1024,32,1056,0,1024,32,1056,33554432,33555456,33554464,33555488,33554432,33555456,33554464,33555488],o=[0,268435456,524288,268959744,2,268435458,524290,268959746,0,268435456,524288,268959744,2,268435458,524290,268959746],c=[0,65536,2048,67584,536870912,536936448,536872960,536938496,131072,196608,133120,198656,537001984,537067520,537004032,537069568],u=[0,262144,0,262144,2,262146,2,262146,33554432,33816576,33554432,33816576,33554434,33816578,33554434,33816578],h=[0,268435456,8,268435464,0,268435456,8,268435464,1024,268436480,1032,268436488,1024,268436480,1032,268436488],d=[0,32,0,32,1048576,1048608,1048576,1048608,8192,8224,8192,8224,1056768,1056800,1056768,1056800],f=[0,16777216,512,16777728,2097152,18874368,2097664,18874880,67108864,83886080,67109376,83886592,69206016,85983232,69206528,85983744],l=[0,4096,134217728,134221824,524288,528384,134742016,134746112,16,4112,134217744,134221840,524304,528400,134742032,134746128],p=[0,4,256,260,0,4,256,260,1,5,257,261,1,5,257,261],y=e.length>8?3:1,b=Array(32*y),m=[0,0,1,1,1,1,1,1,0,1,1,1,1,1,1,0];let g,w,v,_=0,k=0;for(let A=0;A<y;A++){let y=e[_++]<<24|e[_++]<<16|e[_++]<<8|e[_++],A=e[_++]<<24|e[_++]<<16|e[_++]<<8|e[_++];v=252645135&(y>>>4^A),A^=v,y^=v<<4,v=65535&(A>>>-16^y),y^=v,A^=v<<-16,v=858993459&(y>>>2^A),A^=v,y^=v<<2,v=65535&(A>>>-16^y),y^=v,A^=v<<-16,v=1431655765&(y>>>1^A),A^=v,y^=v<<1,v=16711935&(A>>>8^y),y^=v,A^=v<<8,v=1431655765&(y>>>1^A),A^=v,y^=v<<1,v=y<<8|A>>>20&240,y=A<<24|A<<8&16711680|A>>>8&65280|A>>>24&240,A=v;for(let e=0;e<16;e++)m[e]?(y=y<<2|y>>>26,A=A<<2|A>>>26):(y=y<<1|y>>>27,A=A<<1|A>>>27),y&=-15,A&=-15,g=t[y>>>28]|r[y>>>24&15]|i[y>>>20&15]|n[y>>>16&15]|a[y>>>12&15]|s[y>>>8&15]|o[y>>>4&15],w=c[A>>>28]|u[A>>>24&15]|h[A>>>20&15]|d[A>>>16&15]|f[A>>>12&15]|l[A>>>8&15]|p[A>>>4&15],v=65535&(w>>>16^g),b[k++]=g^v,b[k++]=w^v<<16;}return b}function Ke(e){this.key=[];for(let t=0;t<3;t++)this.key.push(new Uint8Array(e.subarray(8*t,8*t+8)));this.encrypt=function(e){return Me(Ce(this.key[2]),Me(Ce(this.key[1]),Me(Ce(this.key[0]),e,!0,0,null,null),!1,0,null,null),!0,0,null,null)};}function De(){this.BlockSize=8,this.KeySize=16,this.setKey=function(e){if(this.masking=Array(16),this.rotate=Array(16),this.reset(),e.length!==this.KeySize)throw Error("CAST-128: keys must be 16 bytes");return this.keySchedule(e),!0},this.reset=function(){for(let e=0;e<16;e++)this.masking[e]=0,this.rotate[e]=0;},this.getBlockSize=function(){return this.BlockSize},this.encrypt=function(e){const t=Array(e.length);for(let a=0;a<e.length;a+=8){let s,o=e[a]<<24|e[a+1]<<16|e[a+2]<<8|e[a+3],c=e[a+4]<<24|e[a+5]<<16|e[a+6]<<8|e[a+7];s=c,c=o^r(c,this.masking[0],this.rotate[0]),o=s,s=c,c=o^i(c,this.masking[1],this.rotate[1]),o=s,s=c,c=o^n(c,this.masking[2],this.rotate[2]),o=s,s=c,c=o^r(c,this.masking[3],this.rotate[3]),o=s,s=c,c=o^i(c,this.masking[4],this.rotate[4]),o=s,s=c,c=o^n(c,this.masking[5],this.rotate[5]),o=s,s=c,c=o^r(c,this.masking[6],this.rotate[6]),o=s,s=c,c=o^i(c,this.masking[7],this.rotate[7]),o=s,s=c,c=o^n(c,this.masking[8],this.rotate[8]),o=s,s=c,c=o^r(c,this.masking[9],this.rotate[9]),o=s,s=c,c=o^i(c,this.masking[10],this.rotate[10]),o=s,s=c,c=o^n(c,this.masking[11],this.rotate[11]),o=s,s=c,c=o^r(c,this.masking[12],this.rotate[12]),o=s,s=c,c=o^i(c,this.masking[13],this.rotate[13]),o=s,s=c,c=o^n(c,this.masking[14],this.rotate[14]),o=s,s=c,c=o^r(c,this.masking[15],this.rotate[15]),o=s,t[a]=c>>>24&255,t[a+1]=c>>>16&255,t[a+2]=c>>>8&255,t[a+3]=255&c,t[a+4]=o>>>24&255,t[a+5]=o>>>16&255,t[a+6]=o>>>8&255,t[a+7]=255&o;}return t},this.decrypt=function(e){const t=Array(e.length);for(let a=0;a<e.length;a+=8){let s,o=e[a]<<24|e[a+1]<<16|e[a+2]<<8|e[a+3],c=e[a+4]<<24|e[a+5]<<16|e[a+6]<<8|e[a+7];s=c,c=o^r(c,this.masking[15],this.rotate[15]),o=s,s=c,c=o^n(c,this.masking[14],this.rotate[14]),o=s,s=c,c=o^i(c,this.masking[13],this.rotate[13]),o=s,s=c,c=o^r(c,this.masking[12],this.rotate[12]),o=s,s=c,c=o^n(c,this.masking[11],this.rotate[11]),o=s,s=c,c=o^i(c,this.masking[10],this.rotate[10]),o=s,s=c,c=o^r(c,this.masking[9],this.rotate[9]),o=s,s=c,c=o^n(c,this.masking[8],this.rotate[8]),o=s,s=c,c=o^i(c,this.masking[7],this.rotate[7]),o=s,s=c,c=o^r(c,this.masking[6],this.rotate[6]),o=s,s=c,c=o^n(c,this.masking[5],this.rotate[5]),o=s,s=c,c=o^i(c,this.masking[4],this.rotate[4]),o=s,s=c,c=o^r(c,this.masking[3],this.rotate[3]),o=s,s=c,c=o^n(c,this.masking[2],this.rotate[2]),o=s,s=c,c=o^i(c,this.masking[1],this.rotate[1]),o=s,s=c,c=o^r(c,this.masking[0],this.rotate[0]),o=s,t[a]=c>>>24&255,t[a+1]=c>>>16&255,t[a+2]=c>>>8&255,t[a+3]=255&c,t[a+4]=o>>>24&255,t[a+5]=o>>16&255,t[a+6]=o>>8&255,t[a+7]=255&o;}return t};const e=[,,,,];e[0]=[,,,,],e[0][0]=[4,0,13,15,12,14,8],e[0][1]=[5,2,16,18,17,19,10],e[0][2]=[6,3,23,22,21,20,9],e[0][3]=[7,1,26,25,27,24,11],e[1]=[,,,,],e[1][0]=[0,6,21,23,20,22,16],e[1][1]=[1,4,0,2,1,3,18],e[1][2]=[2,5,7,6,5,4,17],e[1][3]=[3,7,10,9,11,8,19],e[2]=[,,,,],e[2][0]=[4,0,13,15,12,14,8],e[2][1]=[5,2,16,18,17,19,10],e[2][2]=[6,3,23,22,21,20,9],e[2][3]=[7,1,26,25,27,24,11],e[3]=[,,,,],e[3][0]=[0,6,21,23,20,22,16],e[3][1]=[1,4,0,2,1,3,18],e[3][2]=[2,5,7,6,5,4,17],e[3][3]=[3,7,10,9,11,8,19];const t=[,,,,];function r(e,t,r){const i=t+e,n=i<<r|i>>>32-r;return (a[0][n>>>24]^a[1][n>>>16&255])-a[2][n>>>8&255]+a[3][255&n]}function i(e,t,r){const i=t^e,n=i<<r|i>>>32-r;return a[0][n>>>24]-a[1][n>>>16&255]+a[2][n>>>8&255]^a[3][255&n]}function n(e,t,r){const i=t-e,n=i<<r|i>>>32-r;return (a[0][n>>>24]+a[1][n>>>16&255]^a[2][n>>>8&255])-a[3][255&n]}t[0]=[,,,,],t[0][0]=[24,25,23,22,18],t[0][1]=[26,27,21,20,22],t[0][2]=[28,29,19,18,25],t[0][3]=[30,31,17,16,28],t[1]=[,,,,],t[1][0]=[3,2,12,13,8],t[1][1]=[1,0,14,15,13],t[1][2]=[7,6,8,9,3],t[1][3]=[5,4,10,11,7],t[2]=[,,,,],t[2][0]=[19,18,28,29,25],t[2][1]=[17,16,30,31,28],t[2][2]=[23,22,24,25,18],t[2][3]=[21,20,26,27,22],t[3]=[,,,,],t[3][0]=[8,9,7,6,3],t[3][1]=[10,11,5,4,7],t[3][2]=[12,13,3,2,8],t[3][3]=[14,15,1,0,13],this.keySchedule=function(r){const i=[,,,,,,,,],n=Array(32);let s;for(let e=0;e<4;e++)s=4*e,i[e]=r[s]<<24|r[s+1]<<16|r[s+2]<<8|r[s+3];const o=[6,7,4,5];let c,u=0;for(let r=0;r<2;r++)for(let r=0;r<4;r++){for(s=0;s<4;s++){const t=e[r][s];c=i[t[1]],c^=a[4][i[t[2]>>>2]>>>24-8*(3&t[2])&255],c^=a[5][i[t[3]>>>2]>>>24-8*(3&t[3])&255],c^=a[6][i[t[4]>>>2]>>>24-8*(3&t[4])&255],c^=a[7][i[t[5]>>>2]>>>24-8*(3&t[5])&255],c^=a[o[s]][i[t[6]>>>2]>>>24-8*(3&t[6])&255],i[t[0]]=c;}for(s=0;s<4;s++){const e=t[r][s];c=a[4][i[e[0]>>>2]>>>24-8*(3&e[0])&255],c^=a[5][i[e[1]>>>2]>>>24-8*(3&e[1])&255],c^=a[6][i[e[2]>>>2]>>>24-8*(3&e[2])&255],c^=a[7][i[e[3]>>>2]>>>24-8*(3&e[3])&255],c^=a[4+s][i[e[4]>>>2]>>>24-8*(3&e[4])&255],n[u]=c,u++;}}for(let e=0;e<16;e++)this.masking[e]=n[e],this.rotate[e]=31&n[16+e];};const a=[,,,,,,,,];a[0]=[821772500,2678128395,1810681135,1059425402,505495343,2617265619,1610868032,3483355465,3218386727,2294005173,3791863952,2563806837,1852023008,365126098,3269944861,584384398,677919599,3229601881,4280515016,2002735330,1136869587,3744433750,2289869850,2731719981,2714362070,879511577,1639411079,575934255,717107937,2857637483,576097850,2731753936,1725645e3,2810460463,5111599,767152862,2543075244,1251459544,1383482551,3052681127,3089939183,3612463449,1878520045,1510570527,2189125840,2431448366,582008916,3163445557,1265446783,1354458274,3529918736,3202711853,3073581712,3912963487,3029263377,1275016285,4249207360,2905708351,3304509486,1442611557,3585198765,2712415662,2731849581,3248163920,2283946226,208555832,2766454743,1331405426,1447828783,3315356441,3108627284,2957404670,2981538698,3339933917,1669711173,286233437,1465092821,1782121619,3862771680,710211251,980974943,1651941557,430374111,2051154026,704238805,4128970897,3144820574,2857402727,948965521,3333752299,2227686284,718756367,2269778983,2731643755,718440111,2857816721,3616097120,1113355533,2478022182,410092745,1811985197,1944238868,2696854588,1415722873,1682284203,1060277122,1998114690,1503841958,82706478,2315155686,1068173648,845149890,2167947013,1768146376,1993038550,3566826697,3390574031,940016341,3355073782,2328040721,904371731,1205506512,4094660742,2816623006,825647681,85914773,2857843460,1249926541,1417871568,3287612,3211054559,3126306446,1975924523,1353700161,2814456437,2438597621,1800716203,722146342,2873936343,1151126914,4160483941,2877670899,458611604,2866078500,3483680063,770352098,2652916994,3367839148,3940505011,3585973912,3809620402,718646636,2504206814,2914927912,3631288169,2857486607,2860018678,575749918,2857478043,718488780,2069512688,3548183469,453416197,1106044049,3032691430,52586708,3378514636,3459808877,3211506028,1785789304,218356169,3571399134,3759170522,1194783844,1523787992,3007827094,1975193539,2555452411,1341901877,3045838698,3776907964,3217423946,2802510864,2889438986,1057244207,1636348243,3761863214,1462225785,2632663439,481089165,718503062,24497053,3332243209,3344655856,3655024856,3960371065,1195698900,2971415156,3710176158,2115785917,4027663609,3525578417,2524296189,2745972565,3564906415,1372086093,1452307862,2780501478,1476592880,3389271281,18495466,2378148571,901398090,891748256,3279637769,3157290713,2560960102,1447622437,4284372637,216884176,2086908623,1879786977,3588903153,2242455666,2938092967,3559082096,2810645491,758861177,1121993112,215018983,642190776,4169236812,1196255959,2081185372,3508738393,941322904,4124243163,2877523539,1848581667,2205260958,3180453958,2589345134,3694731276,550028657,2519456284,3789985535,2973870856,2093648313,443148163,46942275,2734146937,1117713533,1115362972,1523183689,3717140224,1551984063],a[1]=[522195092,4010518363,1776537470,960447360,4267822970,4005896314,1435016340,1929119313,2913464185,1310552629,3579470798,3724818106,2579771631,1594623892,417127293,2715217907,2696228731,1508390405,3994398868,3925858569,3695444102,4019471449,3129199795,3770928635,3520741761,990456497,4187484609,2783367035,21106139,3840405339,631373633,3783325702,532942976,396095098,3548038825,4267192484,2564721535,2011709262,2039648873,620404603,3776170075,2898526339,3612357925,4159332703,1645490516,223693667,1567101217,3362177881,1029951347,3470931136,3570957959,1550265121,119497089,972513919,907948164,3840628539,1613718692,3594177948,465323573,2659255085,654439692,2575596212,2699288441,3127702412,277098644,624404830,4100943870,2717858591,546110314,2403699828,3655377447,1321679412,4236791657,1045293279,4010672264,895050893,2319792268,494945126,1914543101,2777056443,3894764339,2219737618,311263384,4275257268,3458730721,669096869,3584475730,3835122877,3319158237,3949359204,2005142349,2713102337,2228954793,3769984788,569394103,3855636576,1425027204,108000370,2736431443,3671869269,3043122623,1750473702,2211081108,762237499,3972989403,2798899386,3061857628,2943854345,867476300,964413654,1591880597,1594774276,2179821409,552026980,3026064248,3726140315,2283577634,3110545105,2152310760,582474363,1582640421,1383256631,2043843868,3322775884,1217180674,463797851,2763038571,480777679,2718707717,2289164131,3118346187,214354409,200212307,3810608407,3025414197,2674075964,3997296425,1847405948,1342460550,510035443,4080271814,815934613,833030224,1620250387,1945732119,2703661145,3966000196,1388869545,3456054182,2687178561,2092620194,562037615,1356438536,3409922145,3261847397,1688467115,2150901366,631725691,3840332284,549916902,3455104640,394546491,837744717,2114462948,751520235,2221554606,2415360136,3999097078,2063029875,803036379,2702586305,821456707,3019566164,360699898,4018502092,3511869016,3677355358,2402471449,812317050,49299192,2570164949,3259169295,2816732080,3331213574,3101303564,2156015656,3705598920,3546263921,143268808,3200304480,1638124008,3165189453,3341807610,578956953,2193977524,3638120073,2333881532,807278310,658237817,2969561766,1641658566,11683945,3086995007,148645947,1138423386,4158756760,1981396783,2401016740,3699783584,380097457,2680394679,2803068651,3334260286,441530178,4016580796,1375954390,761952171,891809099,2183123478,157052462,3683840763,1592404427,341349109,2438483839,1417898363,644327628,2233032776,2353769706,2201510100,220455161,1815641738,182899273,2995019788,3627381533,3702638151,2890684138,1052606899,588164016,1681439879,4038439418,2405343923,4229449282,167996282,1336969661,1688053129,2739224926,1543734051,1046297529,1138201970,2121126012,115334942,1819067631,1902159161,1941945968,2206692869,1159982321],a[2]=[2381300288,637164959,3952098751,3893414151,1197506559,916448331,2350892612,2932787856,3199334847,4009478890,3905886544,1373570990,2450425862,4037870920,3778841987,2456817877,286293407,124026297,3001279700,1028597854,3115296800,4208886496,2691114635,2188540206,1430237888,1218109995,3572471700,308166588,570424558,2187009021,2455094765,307733056,1310360322,3135275007,1384269543,2388071438,863238079,2359263624,2801553128,3380786597,2831162807,1470087780,1728663345,4072488799,1090516929,532123132,2389430977,1132193179,2578464191,3051079243,1670234342,1434557849,2711078940,1241591150,3314043432,3435360113,3091448339,1812415473,2198440252,267246943,796911696,3619716990,38830015,1526438404,2806502096,374413614,2943401790,1489179520,1603809326,1920779204,168801282,260042626,2358705581,1563175598,2397674057,1356499128,2217211040,514611088,2037363785,2186468373,4022173083,2792511869,2913485016,1173701892,4200428547,3896427269,1334932762,2455136706,602925377,2835607854,1613172210,41346230,2499634548,2457437618,2188827595,41386358,4172255629,1313404830,2405527007,3801973774,2217704835,873260488,2528884354,2478092616,4012915883,2555359016,2006953883,2463913485,575479328,2218240648,2099895446,660001756,2341502190,3038761536,3888151779,3848713377,3286851934,1022894237,1620365795,3449594689,1551255054,15374395,3570825345,4249311020,4151111129,3181912732,310226346,1133119310,530038928,136043402,2476768958,3107506709,2544909567,1036173560,2367337196,1681395281,1758231547,3641649032,306774401,1575354324,3716085866,1990386196,3114533736,2455606671,1262092282,3124342505,2768229131,4210529083,1833535011,423410938,660763973,2187129978,1639812e3,3508421329,3467445492,310289298,272797111,2188552562,2456863912,310240523,677093832,1013118031,901835429,3892695601,1116285435,3036471170,1337354835,243122523,520626091,277223598,4244441197,4194248841,1766575121,594173102,316590669,742362309,3536858622,4176435350,3838792410,2501204839,1229605004,3115755532,1552908988,2312334149,979407927,3959474601,1148277331,176638793,3614686272,2083809052,40992502,1340822838,2731552767,3535757508,3560899520,1354035053,122129617,7215240,2732932949,3118912700,2718203926,2539075635,3609230695,3725561661,1928887091,2882293555,1988674909,2063640240,2491088897,1459647954,4189817080,2302804382,1113892351,2237858528,1927010603,4002880361,1856122846,1594404395,2944033133,3855189863,3474975698,1643104450,4054590833,3431086530,1730235576,2984608721,3084664418,2131803598,4178205752,267404349,1617849798,1616132681,1462223176,736725533,2327058232,551665188,2945899023,1749386277,2575514597,1611482493,674206544,2201269090,3642560800,728599968,1680547377,2620414464,1388111496,453204106,4156223445,1094905244,2754698257,2201108165,3757000246,2704524545,3922940700,3996465027],a[3]=[2645754912,532081118,2814278639,3530793624,1246723035,1689095255,2236679235,4194438865,2116582143,3859789411,157234593,2045505824,4245003587,1687664561,4083425123,605965023,672431967,1336064205,3376611392,214114848,4258466608,3232053071,489488601,605322005,3998028058,264917351,1912574028,756637694,436560991,202637054,135989450,85393697,2152923392,3896401662,2895836408,2145855233,3535335007,115294817,3147733898,1922296357,3464822751,4117858305,1037454084,2725193275,2127856640,1417604070,1148013728,1827919605,642362335,2929772533,909348033,1346338451,3547799649,297154785,1917849091,4161712827,2883604526,3968694238,1469521537,3780077382,3375584256,1763717519,136166297,4290970789,1295325189,2134727907,2798151366,1566297257,3672928234,2677174161,2672173615,965822077,2780786062,289653839,1133871874,3491843819,35685304,1068898316,418943774,672553190,642281022,2346158704,1954014401,3037126780,4079815205,2030668546,3840588673,672283427,1776201016,359975446,3750173538,555499703,2769985273,1324923,69110472,152125443,3176785106,3822147285,1340634837,798073664,1434183902,15393959,216384236,1303690150,3881221631,3711134124,3960975413,106373927,2578434224,1455997841,1801814300,1578393881,1854262133,3188178946,3258078583,2302670060,1539295533,3505142565,3078625975,2372746020,549938159,3278284284,2620926080,181285381,2865321098,3970029511,68876850,488006234,1728155692,2608167508,836007927,2435231793,919367643,3339422534,3655756360,1457871481,40520939,1380155135,797931188,234455205,2255801827,3990488299,397000196,739833055,3077865373,2871719860,4022553888,772369276,390177364,3853951029,557662966,740064294,1640166671,1699928825,3535942136,622006121,3625353122,68743880,1742502,219489963,1664179233,1577743084,1236991741,410585305,2366487942,823226535,1050371084,3426619607,3586839478,212779912,4147118561,1819446015,1911218849,530248558,3486241071,3252585495,2886188651,3410272728,2342195030,20547779,2982490058,3032363469,3631753222,312714466,1870521650,1493008054,3491686656,615382978,4103671749,2534517445,1932181,2196105170,278426614,6369430,3274544417,2913018367,697336853,2143000447,2946413531,701099306,1558357093,2805003052,3500818408,2321334417,3567135975,216290473,3591032198,23009561,1996984579,3735042806,2024298078,3739440863,569400510,2339758983,3016033873,3097871343,3639523026,3844324983,3256173865,795471839,2951117563,4101031090,4091603803,3603732598,971261452,534414648,428311343,3389027175,2844869880,694888862,1227866773,2456207019,3043454569,2614353370,3749578031,3676663836,459166190,4132644070,1794958188,51825668,2252611902,3084671440,2036672799,3436641603,1099053433,2469121526,3059204941,1323291266,2061838604,1018778475,2233344254,2553501054,334295216,3556750194,1065731521,183467730],a[4]=[2127105028,745436345,2601412319,2788391185,3093987327,500390133,1155374404,389092991,150729210,3891597772,3523549952,1935325696,716645080,946045387,2901812282,1774124410,3869435775,4039581901,3293136918,3438657920,948246080,363898952,3867875531,1286266623,1598556673,68334250,630723836,1104211938,1312863373,613332731,2377784574,1101634306,441780740,3129959883,1917973735,2510624549,3238456535,2544211978,3308894634,1299840618,4076074851,1756332096,3977027158,297047435,3790297736,2265573040,3621810518,1311375015,1667687725,47300608,3299642885,2474112369,201668394,1468347890,576830978,3594690761,3742605952,1958042578,1747032512,3558991340,1408974056,3366841779,682131401,1033214337,1545599232,4265137049,206503691,103024618,2855227313,1337551222,2428998917,2963842932,4015366655,3852247746,2796956967,3865723491,3747938335,247794022,3755824572,702416469,2434691994,397379957,851939612,2314769512,218229120,1380406772,62274761,214451378,3170103466,2276210409,3845813286,28563499,446592073,1693330814,3453727194,29968656,3093872512,220656637,2470637031,77972100,1667708854,1358280214,4064765667,2395616961,325977563,4277240721,4220025399,3605526484,3355147721,811859167,3069544926,3962126810,652502677,3075892249,4132761541,3498924215,1217549313,3250244479,3858715919,3053989961,1538642152,2279026266,2875879137,574252750,3324769229,2651358713,1758150215,141295887,2719868960,3515574750,4093007735,4194485238,1082055363,3417560400,395511885,2966884026,179534037,3646028556,3738688086,1092926436,2496269142,257381841,3772900718,1636087230,1477059743,2499234752,3811018894,2675660129,3285975680,90732309,1684827095,1150307763,1723134115,3237045386,1769919919,1240018934,815675215,750138730,2239792499,1234303040,1995484674,138143821,675421338,1145607174,1936608440,3238603024,2345230278,2105974004,323969391,779555213,3004902369,2861610098,1017501463,2098600890,2628620304,2940611490,2682542546,1171473753,3656571411,3687208071,4091869518,393037935,159126506,1662887367,1147106178,391545844,3452332695,1891500680,3016609650,1851642611,546529401,1167818917,3194020571,2848076033,3953471836,575554290,475796850,4134673196,450035699,2351251534,844027695,1080539133,86184846,1554234488,3692025454,1972511363,2018339607,1491841390,1141460869,1061690759,4244549243,2008416118,2351104703,2868147542,1598468138,722020353,1027143159,212344630,1387219594,1725294528,3745187956,2500153616,458938280,4129215917,1828119673,544571780,3503225445,2297937496,1241802790,267843827,2694610800,1397140384,1558801448,3782667683,1806446719,929573330,2234912681,400817706,616011623,4121520928,3603768725,1761550015,1968522284,4053731006,4192232858,4005120285,872482584,3140537016,3894607381,2287405443,1963876937,3663887957,1584857e3,2975024454,1833426440,4025083860],a[5]=[4143615901,749497569,1285769319,3795025788,2514159847,23610292,3974978748,844452780,3214870880,3751928557,2213566365,1676510905,448177848,3730751033,4086298418,2307502392,871450977,3222878141,4110862042,3831651966,2735270553,1310974780,2043402188,1218528103,2736035353,4274605013,2702448458,3936360550,2693061421,162023535,2827510090,687910808,23484817,3784910947,3371371616,779677500,3503626546,3473927188,4157212626,3500679282,4248902014,2466621104,3899384794,1958663117,925738300,1283408968,3669349440,1840910019,137959847,2679828185,1239142320,1315376211,1547541505,1690155329,739140458,3128809933,3933172616,3876308834,905091803,1548541325,4040461708,3095483362,144808038,451078856,676114313,2861728291,2469707347,993665471,373509091,2599041286,4025009006,4170239449,2149739950,3275793571,3749616649,2794760199,1534877388,572371878,2590613551,1753320020,3467782511,1405125690,4270405205,633333386,3026356924,3475123903,632057672,2846462855,1404951397,3882875879,3915906424,195638627,2385783745,3902872553,1233155085,3355999740,2380578713,2702246304,2144565621,3663341248,3894384975,2502479241,4248018925,3094885567,1594115437,572884632,3385116731,767645374,1331858858,1475698373,3793881790,3532746431,1321687957,619889600,1121017241,3440213920,2070816767,2833025776,1933951238,4095615791,890643334,3874130214,859025556,360630002,925594799,1764062180,3920222280,4078305929,979562269,2810700344,4087740022,1949714515,546639971,1165388173,3069891591,1495988560,922170659,1291546247,2107952832,1813327274,3406010024,3306028637,4241950635,153207855,2313154747,1608695416,1150242611,1967526857,721801357,1220138373,3691287617,3356069787,2112743302,3281662835,1111556101,1778980689,250857638,2298507990,673216130,2846488510,3207751581,3562756981,3008625920,3417367384,2198807050,529510932,3547516680,3426503187,2364944742,102533054,2294910856,1617093527,1204784762,3066581635,1019391227,1069574518,1317995090,1691889997,3661132003,510022745,3238594800,1362108837,1817929911,2184153760,805817662,1953603311,3699844737,120799444,2118332377,207536705,2282301548,4120041617,145305846,2508124933,3086745533,3261524335,1877257368,2977164480,3160454186,2503252186,4221677074,759945014,254147243,2767453419,3801518371,629083197,2471014217,907280572,3900796746,940896768,2751021123,2625262786,3161476951,3661752313,3260732218,1425318020,2977912069,1496677566,3988592072,2140652971,3126511541,3069632175,977771578,1392695845,1698528874,1411812681,1369733098,1343739227,3620887944,1142123638,67414216,3102056737,3088749194,1626167401,2546293654,3941374235,697522451,33404913,143560186,2595682037,994885535,1247667115,3859094837,2699155541,3547024625,4114935275,2968073508,3199963069,2732024527,1237921620,951448369,1898488916,1211705605,2790989240,2233243581,3598044975],a[6]=[2246066201,858518887,1714274303,3485882003,713916271,2879113490,3730835617,539548191,36158695,1298409750,419087104,1358007170,749914897,2989680476,1261868530,2995193822,2690628854,3443622377,3780124940,3796824509,2976433025,4259637129,1551479e3,512490819,1296650241,951993153,2436689437,2460458047,144139966,3136204276,310820559,3068840729,643875328,1969602020,1680088954,2185813161,3283332454,672358534,198762408,896343282,276269502,3014846926,84060815,197145886,376173866,3943890818,3813173521,3545068822,1316698879,1598252827,2633424951,1233235075,859989710,2358460855,3503838400,3409603720,1203513385,1193654839,2792018475,2060853022,207403770,1144516871,3068631394,1121114134,177607304,3785736302,326409831,1929119770,2983279095,4183308101,3474579288,3200513878,3228482096,119610148,1170376745,3378393471,3163473169,951863017,3337026068,3135789130,2907618374,1183797387,2015970143,4045674555,2182986399,2952138740,3928772205,384012900,2454997643,10178499,2879818989,2596892536,111523738,2995089006,451689641,3196290696,235406569,1441906262,3890558523,3013735005,4158569349,1644036924,376726067,1006849064,3664579700,2041234796,1021632941,1374734338,2566452058,371631263,4007144233,490221539,206551450,3140638584,1053219195,1853335209,3412429660,3562156231,735133835,1623211703,3104214392,2738312436,4096837757,3366392578,3110964274,3956598718,3196820781,2038037254,3877786376,2339753847,300912036,3766732888,2372630639,1516443558,4200396704,1574567987,4069441456,4122592016,2699739776,146372218,2748961456,2043888151,35287437,2596680554,655490400,1132482787,110692520,1031794116,2188192751,1324057718,1217253157,919197030,686247489,3261139658,1028237775,3135486431,3059715558,2460921700,986174950,2661811465,4062904701,2752986992,3709736643,367056889,1353824391,731860949,1650113154,1778481506,784341916,357075625,3608602432,1074092588,2480052770,3811426202,92751289,877911070,3600361838,1231880047,480201094,3756190983,3094495953,434011822,87971354,363687820,1717726236,1901380172,3926403882,2481662265,400339184,1490350766,2661455099,1389319756,2558787174,784598401,1983468483,30828846,3550527752,2716276238,3841122214,1765724805,1955612312,1277890269,1333098070,1564029816,2704417615,1026694237,3287671188,1260819201,3349086767,1016692350,1582273796,1073413053,1995943182,694588404,1025494639,3323872702,3551898420,4146854327,453260480,1316140391,1435673405,3038941953,3486689407,1622062951,403978347,817677117,950059133,4246079218,3278066075,1486738320,1417279718,481875527,2549965225,3933690356,760697757,1452955855,3897451437,1177426808,1702951038,4085348628,2447005172,1084371187,3516436277,3068336338,1073369276,1027665953,3284188590,1230553676,1368340146,2226246512,267243139,2274220762,4070734279,2497715176,2423353163,2504755875],a[7]=[3793104909,3151888380,2817252029,895778965,2005530807,3871412763,237245952,86829237,296341424,3851759377,3974600970,2475086196,709006108,1994621201,2972577594,937287164,3734691505,168608556,3189338153,2225080640,3139713551,3033610191,3025041904,77524477,185966941,1208824168,2344345178,1721625922,3354191921,1066374631,1927223579,1971335949,2483503697,1551748602,2881383779,2856329572,3003241482,48746954,1398218158,2050065058,313056748,4255789917,393167848,1912293076,940740642,3465845460,3091687853,2522601570,2197016661,1727764327,364383054,492521376,1291706479,3264136376,1474851438,1685747964,2575719748,1619776915,1814040067,970743798,1561002147,2925768690,2123093554,1880132620,3151188041,697884420,2550985770,2607674513,2659114323,110200136,1489731079,997519150,1378877361,3527870668,478029773,2766872923,1022481122,431258168,1112503832,897933369,2635587303,669726182,3383752315,918222264,163866573,3246985393,3776823163,114105080,1903216136,761148244,3571337562,1690750982,3166750252,1037045171,1888456500,2010454850,642736655,616092351,365016990,1185228132,4174898510,1043824992,2023083429,2241598885,3863320456,3279669087,3674716684,108438443,2132974366,830746235,606445527,4173263986,2204105912,1844756978,2532684181,4245352700,2969441100,3796921661,1335562986,4061524517,2720232303,2679424040,634407289,885462008,3294724487,3933892248,2094100220,339117932,4048830727,3202280980,1458155303,2689246273,1022871705,2464987878,3714515309,353796843,2822958815,4256850100,4052777845,551748367,618185374,3778635579,4020649912,1904685140,3069366075,2670879810,3407193292,2954511620,4058283405,2219449317,3135758300,1120655984,3447565834,1474845562,3577699062,550456716,3466908712,2043752612,881257467,869518812,2005220179,938474677,3305539448,3850417126,1315485940,3318264702,226533026,965733244,321539988,1136104718,804158748,573969341,3708209826,937399083,3290727049,2901666755,1461057207,4013193437,4066861423,3242773476,2421326174,1581322155,3028952165,786071460,3900391652,3918438532,1485433313,4023619836,3708277595,3678951060,953673138,1467089153,1930354364,1533292819,2492563023,1346121658,1685000834,1965281866,3765933717,4190206607,2052792609,3515332758,690371149,3125873887,2180283551,2903598061,3933952357,436236910,289419410,14314871,1242357089,2904507907,1616633776,2666382180,585885352,3471299210,2699507360,1432659641,277164553,3354103607,770115018,2303809295,3741942315,3177781868,2853364978,2269453327,3774259834,987383833,1290892879,225909803,1741533526,890078084,1496906255,1111072499,916028167,243534141,1252605537,2204162171,531204876,290011180,3916834213,102027703,237315147,209093447,1486785922,220223953,2758195998,4175039106,82940208,3127791296,2569425252,518464269,1353887104,3941492737,2377294467,3935040926];}function Re(e){this.cast5=new De,this.cast5.setKey(e),this.encrypt=function(e){return this.cast5.encrypt(e)};}Ke.keySize=Ke.prototype.keySize=24,Ke.blockSize=Ke.prototype.blockSize=8,Re.blockSize=Re.prototype.blockSize=8,Re.keySize=Re.prototype.keySize=16;const Ie=4294967295;function Ue(e,t){return (e<<t|e>>>32-t)&Ie}function Be(e,t){return e[t]|e[t+1]<<8|e[t+2]<<16|e[t+3]<<24}function Te(e,t,r){e.splice(t,4,255&r,r>>>8&255,r>>>16&255,r>>>24&255);}function ze(e,t){return e>>>8*t&255}function qe(e){this.tf=function(){let e=null,t=null,r=-1,i=[],n=[[],[],[],[]];function a(e){return n[0][ze(e,0)]^n[1][ze(e,1)]^n[2][ze(e,2)]^n[3][ze(e,3)]}function s(e){return n[0][ze(e,3)]^n[1][ze(e,0)]^n[2][ze(e,1)]^n[3][ze(e,2)]}function o(e,t){let r=a(t[0]),n=s(t[1]);t[2]=Ue(t[2]^r+n+i[4*e+8]&Ie,31),t[3]=Ue(t[3],1)^r+2*n+i[4*e+9]&Ie,r=a(t[2]),n=s(t[3]),t[0]=Ue(t[0]^r+n+i[4*e+10]&Ie,31),t[1]=Ue(t[1],1)^r+2*n+i[4*e+11]&Ie;}function c(e,t){let r=a(t[0]),n=s(t[1]);t[2]=Ue(t[2],1)^r+n+i[4*e+10]&Ie,t[3]=Ue(t[3]^r+2*n+i[4*e+11]&Ie,31),r=a(t[2]),n=s(t[3]),t[0]=Ue(t[0],1)^r+n+i[4*e+8]&Ie,t[1]=Ue(t[1]^r+2*n+i[4*e+9]&Ie,31);}return {name:"twofish",blocksize:16,open:function(t){let r,a,s,o,c;e=t;const u=[],h=[],d=[];let f;const l=[];let p,y,b;const m=[[8,1,7,13,6,15,3,2,0,11,5,9,14,12,10,4],[2,8,11,13,15,7,6,14,3,1,9,4,0,10,12,5]],g=[[14,12,11,8,1,2,3,5,15,4,10,6,7,0,9,13],[1,14,2,11,4,12,3,7,6,13,10,5,15,9,0,8]],w=[[11,10,5,14,6,13,9,0,12,8,15,3,2,4,7,1],[4,12,7,5,1,6,9,10,0,14,13,8,2,11,3,15]],v=[[13,7,15,4,1,2,6,14,9,11,3,0,8,5,12,10],[11,9,5,1,12,3,13,14,6,4,7,15,2,0,8,10]],_=[0,8,1,9,2,10,3,11,4,12,5,13,6,14,7,15],k=[0,9,2,11,4,13,6,15,8,1,10,3,12,5,14,7],A=[[],[]],S=[[],[],[],[]];function E(e){return e^e>>2^[0,90,180,238][3&e]}function x(e){return e^e>>1^e>>2^[0,238,180,90][3&e]}function P(e,t){let r,i,n;for(r=0;r<8;r++)i=t>>>24,t=t<<8&Ie|e>>>24,e=e<<8&Ie,n=i<<1,128&i&&(n^=333),t^=i^n<<16,n^=i>>>1,1&i&&(n^=166),t^=n<<24|n<<8;return t}function M(e,t){const r=t>>4,i=15&t,n=m[e][r^i],a=g[e][_[i]^k[r]];return v[e][_[a]^k[n]]<<4|w[e][n^a]}function C(e,t){let r=ze(e,0),i=ze(e,1),n=ze(e,2),a=ze(e,3);switch(f){case 4:r=A[1][r]^ze(t[3],0),i=A[0][i]^ze(t[3],1),n=A[0][n]^ze(t[3],2),a=A[1][a]^ze(t[3],3);case 3:r=A[1][r]^ze(t[2],0),i=A[1][i]^ze(t[2],1),n=A[0][n]^ze(t[2],2),a=A[0][a]^ze(t[2],3);case 2:r=A[0][A[0][r]^ze(t[1],0)]^ze(t[0],0),i=A[0][A[1][i]^ze(t[1],1)]^ze(t[0],1),n=A[1][A[0][n]^ze(t[1],2)]^ze(t[0],2),a=A[1][A[1][a]^ze(t[1],3)]^ze(t[0],3);}return S[0][r]^S[1][i]^S[2][n]^S[3][a]}for(e=e.slice(0,32),r=e.length;16!==r&&24!==r&&32!==r;)e[r++]=0;for(r=0;r<e.length;r+=4)d[r>>2]=Be(e,r);for(r=0;r<256;r++)A[0][r]=M(0,r),A[1][r]=M(1,r);for(r=0;r<256;r++)p=A[1][r],y=E(p),b=x(p),S[0][r]=p+(y<<8)+(b<<16)+(b<<24),S[2][r]=y+(b<<8)+(p<<16)+(b<<24),p=A[0][r],y=E(p),b=x(p),S[1][r]=b+(b<<8)+(y<<16)+(p<<24),S[3][r]=y+(p<<8)+(b<<16)+(y<<24);for(f=d.length/2,r=0;r<f;r++)a=d[r+r],u[r]=a,s=d[r+r+1],h[r]=s,l[f-r-1]=P(a,s);for(r=0;r<40;r+=2)a=16843009*r,s=a+16843009,a=C(a,u),s=Ue(C(s,h),8),i[r]=a+s&Ie,i[r+1]=Ue(a+2*s,9);for(r=0;r<256;r++)switch(a=s=o=c=r,f){case 4:a=A[1][a]^ze(l[3],0),s=A[0][s]^ze(l[3],1),o=A[0][o]^ze(l[3],2),c=A[1][c]^ze(l[3],3);case 3:a=A[1][a]^ze(l[2],0),s=A[1][s]^ze(l[2],1),o=A[0][o]^ze(l[2],2),c=A[0][c]^ze(l[2],3);case 2:n[0][r]=S[0][A[0][A[0][a]^ze(l[1],0)]^ze(l[0],0)],n[1][r]=S[1][A[0][A[1][s]^ze(l[1],1)]^ze(l[0],1)],n[2][r]=S[2][A[1][A[0][o]^ze(l[1],2)]^ze(l[0],2)],n[3][r]=S[3][A[1][A[1][c]^ze(l[1],3)]^ze(l[0],3)];}},close:function(){i=[],n=[[],[],[],[]];},encrypt:function(e,n){t=e,r=n;const a=[Be(t,r)^i[0],Be(t,r+4)^i[1],Be(t,r+8)^i[2],Be(t,r+12)^i[3]];for(let e=0;e<8;e++)o(e,a);return Te(t,r,a[2]^i[4]),Te(t,r+4,a[3]^i[5]),Te(t,r+8,a[0]^i[6]),Te(t,r+12,a[1]^i[7]),r+=16,t},decrypt:function(e,n){t=e,r=n;const a=[Be(t,r)^i[4],Be(t,r+4)^i[5],Be(t,r+8)^i[6],Be(t,r+12)^i[7]];for(let e=7;e>=0;e--)c(e,a);Te(t,r,a[2]^i[0]),Te(t,r+4,a[3]^i[1]),Te(t,r+8,a[0]^i[2]),Te(t,r+12,a[1]^i[3]),r+=16;},finalize:function(){return t}}}(),this.tf.open(Array.from(e),0),this.encrypt=function(e){return this.tf.encrypt(Array.from(e),0)};}function Fe(){}function Oe(e){this.bf=new Fe,this.bf.init(e),this.encrypt=function(e){return this.bf.encryptBlock(e)};}qe.keySize=qe.prototype.keySize=32,qe.blockSize=qe.prototype.blockSize=16,Fe.prototype.BLOCKSIZE=8,Fe.prototype.SBOXES=[[3509652390,2564797868,805139163,3491422135,3101798381,1780907670,3128725573,4046225305,614570311,3012652279,134345442,2240740374,1667834072,1901547113,2757295779,4103290238,227898511,1921955416,1904987480,2182433518,2069144605,3260701109,2620446009,720527379,3318853667,677414384,3393288472,3101374703,2390351024,1614419982,1822297739,2954791486,3608508353,3174124327,2024746970,1432378464,3864339955,2857741204,1464375394,1676153920,1439316330,715854006,3033291828,289532110,2706671279,2087905683,3018724369,1668267050,732546397,1947742710,3462151702,2609353502,2950085171,1814351708,2050118529,680887927,999245976,1800124847,3300911131,1713906067,1641548236,4213287313,1216130144,1575780402,4018429277,3917837745,3693486850,3949271944,596196993,3549867205,258830323,2213823033,772490370,2760122372,1774776394,2652871518,566650946,4142492826,1728879713,2882767088,1783734482,3629395816,2517608232,2874225571,1861159788,326777828,3124490320,2130389656,2716951837,967770486,1724537150,2185432712,2364442137,1164943284,2105845187,998989502,3765401048,2244026483,1075463327,1455516326,1322494562,910128902,469688178,1117454909,936433444,3490320968,3675253459,1240580251,122909385,2157517691,634681816,4142456567,3825094682,3061402683,2540495037,79693498,3249098678,1084186820,1583128258,426386531,1761308591,1047286709,322548459,995290223,1845252383,2603652396,3431023940,2942221577,3202600964,3727903485,1712269319,422464435,3234572375,1170764815,3523960633,3117677531,1434042557,442511882,3600875718,1076654713,1738483198,4213154764,2393238008,3677496056,1014306527,4251020053,793779912,2902807211,842905082,4246964064,1395751752,1040244610,2656851899,3396308128,445077038,3742853595,3577915638,679411651,2892444358,2354009459,1767581616,3150600392,3791627101,3102740896,284835224,4246832056,1258075500,768725851,2589189241,3069724005,3532540348,1274779536,3789419226,2764799539,1660621633,3471099624,4011903706,913787905,3497959166,737222580,2514213453,2928710040,3937242737,1804850592,3499020752,2949064160,2386320175,2390070455,2415321851,4061277028,2290661394,2416832540,1336762016,1754252060,3520065937,3014181293,791618072,3188594551,3933548030,2332172193,3852520463,3043980520,413987798,3465142937,3030929376,4245938359,2093235073,3534596313,375366246,2157278981,2479649556,555357303,3870105701,2008414854,3344188149,4221384143,3956125452,2067696032,3594591187,2921233993,2428461,544322398,577241275,1471733935,610547355,4027169054,1432588573,1507829418,2025931657,3646575487,545086370,48609733,2200306550,1653985193,298326376,1316178497,3007786442,2064951626,458293330,2589141269,3591329599,3164325604,727753846,2179363840,146436021,1461446943,4069977195,705550613,3059967265,3887724982,4281599278,3313849956,1404054877,2845806497,146425753,1854211946],[1266315497,3048417604,3681880366,3289982499,290971e4,1235738493,2632868024,2414719590,3970600049,1771706367,1449415276,3266420449,422970021,1963543593,2690192192,3826793022,1062508698,1531092325,1804592342,2583117782,2714934279,4024971509,1294809318,4028980673,1289560198,2221992742,1669523910,35572830,157838143,1052438473,1016535060,1802137761,1753167236,1386275462,3080475397,2857371447,1040679964,2145300060,2390574316,1461121720,2956646967,4031777805,4028374788,33600511,2920084762,1018524850,629373528,3691585981,3515945977,2091462646,2486323059,586499841,988145025,935516892,3367335476,2599673255,2839830854,265290510,3972581182,2759138881,3795373465,1005194799,847297441,406762289,1314163512,1332590856,1866599683,4127851711,750260880,613907577,1450815602,3165620655,3734664991,3650291728,3012275730,3704569646,1427272223,778793252,1343938022,2676280711,2052605720,1946737175,3164576444,3914038668,3967478842,3682934266,1661551462,3294938066,4011595847,840292616,3712170807,616741398,312560963,711312465,1351876610,322626781,1910503582,271666773,2175563734,1594956187,70604529,3617834859,1007753275,1495573769,4069517037,2549218298,2663038764,504708206,2263041392,3941167025,2249088522,1514023603,1998579484,1312622330,694541497,2582060303,2151582166,1382467621,776784248,2618340202,3323268794,2497899128,2784771155,503983604,4076293799,907881277,423175695,432175456,1378068232,4145222326,3954048622,3938656102,3820766613,2793130115,2977904593,26017576,3274890735,3194772133,1700274565,1756076034,4006520079,3677328699,720338349,1533947780,354530856,688349552,3973924725,1637815568,332179504,3949051286,53804574,2852348879,3044236432,1282449977,3583942155,3416972820,4006381244,1617046695,2628476075,3002303598,1686838959,431878346,2686675385,1700445008,1080580658,1009431731,832498133,3223435511,2605976345,2271191193,2516031870,1648197032,4164389018,2548247927,300782431,375919233,238389289,3353747414,2531188641,2019080857,1475708069,455242339,2609103871,448939670,3451063019,1395535956,2413381860,1841049896,1491858159,885456874,4264095073,4001119347,1565136089,3898914787,1108368660,540939232,1173283510,2745871338,3681308437,4207628240,3343053890,4016749493,1699691293,1103962373,3625875870,2256883143,3830138730,1031889488,3479347698,1535977030,4236805024,3251091107,2132092099,1774941330,1199868427,1452454533,157007616,2904115357,342012276,595725824,1480756522,206960106,497939518,591360097,863170706,2375253569,3596610801,1814182875,2094937945,3421402208,1082520231,3463918190,2785509508,435703966,3908032597,1641649973,2842273706,3305899714,1510255612,2148256476,2655287854,3276092548,4258621189,236887753,3681803219,274041037,1734335097,3815195456,3317970021,1899903192,1026095262,4050517792,356393447,2410691914,3873677099,3682840055],[3913112168,2491498743,4132185628,2489919796,1091903735,1979897079,3170134830,3567386728,3557303409,857797738,1136121015,1342202287,507115054,2535736646,337727348,3213592640,1301675037,2528481711,1895095763,1721773893,3216771564,62756741,2142006736,835421444,2531993523,1442658625,3659876326,2882144922,676362277,1392781812,170690266,3921047035,1759253602,3611846912,1745797284,664899054,1329594018,3901205900,3045908486,2062866102,2865634940,3543621612,3464012697,1080764994,553557557,3656615353,3996768171,991055499,499776247,1265440854,648242737,3940784050,980351604,3713745714,1749149687,3396870395,4211799374,3640570775,1161844396,3125318951,1431517754,545492359,4268468663,3499529547,1437099964,2702547544,3433638243,2581715763,2787789398,1060185593,1593081372,2418618748,4260947970,69676912,2159744348,86519011,2512459080,3838209314,1220612927,3339683548,133810670,1090789135,1078426020,1569222167,845107691,3583754449,4072456591,1091646820,628848692,1613405280,3757631651,526609435,236106946,48312990,2942717905,3402727701,1797494240,859738849,992217954,4005476642,2243076622,3870952857,3732016268,765654824,3490871365,2511836413,1685915746,3888969200,1414112111,2273134842,3281911079,4080962846,172450625,2569994100,980381355,4109958455,2819808352,2716589560,2568741196,3681446669,3329971472,1835478071,660984891,3704678404,4045999559,3422617507,3040415634,1762651403,1719377915,3470491036,2693910283,3642056355,3138596744,1364962596,2073328063,1983633131,926494387,3423689081,2150032023,4096667949,1749200295,3328846651,309677260,2016342300,1779581495,3079819751,111262694,1274766160,443224088,298511866,1025883608,3806446537,1145181785,168956806,3641502830,3584813610,1689216846,3666258015,3200248200,1692713982,2646376535,4042768518,1618508792,1610833997,3523052358,4130873264,2001055236,3610705100,2202168115,4028541809,2961195399,1006657119,2006996926,3186142756,1430667929,3210227297,1314452623,4074634658,4101304120,2273951170,1399257539,3367210612,3027628629,1190975929,2062231137,2333990788,2221543033,2438960610,1181637006,548689776,2362791313,3372408396,3104550113,3145860560,296247880,1970579870,3078560182,3769228297,1714227617,3291629107,3898220290,166772364,1251581989,493813264,448347421,195405023,2709975567,677966185,3703036547,1463355134,2715995803,1338867538,1343315457,2802222074,2684532164,233230375,2599980071,2000651841,3277868038,1638401717,4028070440,3237316320,6314154,819756386,300326615,590932579,1405279636,3267499572,3150704214,2428286686,3959192993,3461946742,1862657033,1266418056,963775037,2089974820,2263052895,1917689273,448879540,3550394620,3981727096,150775221,3627908307,1303187396,508620638,2975983352,2726630617,1817252668,1876281319,1457606340,908771278,3720792119,3617206836,2455994898,1729034894,1080033504],[976866871,3556439503,2881648439,1522871579,1555064734,1336096578,3548522304,2579274686,3574697629,3205460757,3593280638,3338716283,3079412587,564236357,2993598910,1781952180,1464380207,3163844217,3332601554,1699332808,1393555694,1183702653,3581086237,1288719814,691649499,2847557200,2895455976,3193889540,2717570544,1781354906,1676643554,2592534050,3230253752,1126444790,2770207658,2633158820,2210423226,2615765581,2414155088,3127139286,673620729,2805611233,1269405062,4015350505,3341807571,4149409754,1057255273,2012875353,2162469141,2276492801,2601117357,993977747,3918593370,2654263191,753973209,36408145,2530585658,25011837,3520020182,2088578344,530523599,2918365339,1524020338,1518925132,3760827505,3759777254,1202760957,3985898139,3906192525,674977740,4174734889,2031300136,2019492241,3983892565,4153806404,3822280332,352677332,2297720250,60907813,90501309,3286998549,1016092578,2535922412,2839152426,457141659,509813237,4120667899,652014361,1966332200,2975202805,55981186,2327461051,676427537,3255491064,2882294119,3433927263,1307055953,942726286,933058658,2468411793,3933900994,4215176142,1361170020,2001714738,2830558078,3274259782,1222529897,1679025792,2729314320,3714953764,1770335741,151462246,3013232138,1682292957,1483529935,471910574,1539241949,458788160,3436315007,1807016891,3718408830,978976581,1043663428,3165965781,1927990952,4200891579,2372276910,3208408903,3533431907,1412390302,2931980059,4132332400,1947078029,3881505623,4168226417,2941484381,1077988104,1320477388,886195818,18198404,3786409e3,2509781533,112762804,3463356488,1866414978,891333506,18488651,661792760,1628790961,3885187036,3141171499,876946877,2693282273,1372485963,791857591,2686433993,3759982718,3167212022,3472953795,2716379847,445679433,3561995674,3504004811,3574258232,54117162,3331405415,2381918588,3769707343,4154350007,1140177722,4074052095,668550556,3214352940,367459370,261225585,2610173221,4209349473,3468074219,3265815641,314222801,3066103646,3808782860,282218597,3406013506,3773591054,379116347,1285071038,846784868,2669647154,3771962079,3550491691,2305946142,453669953,1268987020,3317592352,3279303384,3744833421,2610507566,3859509063,266596637,3847019092,517658769,3462560207,3443424879,370717030,4247526661,2224018117,4143653529,4112773975,2788324899,2477274417,1456262402,2901442914,1517677493,1846949527,2295493580,3734397586,2176403920,1280348187,1908823572,3871786941,846861322,1172426758,3287448474,3383383037,1655181056,3139813346,901632758,1897031941,2986607138,3066810236,3447102507,1393639104,373351379,950779232,625454576,3124240540,4148612726,2007998917,544563296,2244738638,2330496472,2058025392,1291430526,424198748,50039436,29584100,3605783033,2429876329,2791104160,1057563949,3255363231,3075367218,3463963227,1469046755,985887462]],Fe.prototype.PARRAY=[608135816,2242054355,320440878,57701188,2752067618,698298832,137296536,3964562569,1160258022,953160567,3193202383,887688300,3232508343,3380367581,1065670069,3041331479,2450970073,2306472731],Fe.prototype.NN=16,Fe.prototype._clean=function(e){if(e<0){e=(2147483647&e)+2147483648;}return e},Fe.prototype._F=function(e){let t;const r=255&e,i=255&(e>>>=8),n=255&(e>>>=8),a=255&(e>>>=8);return t=this.sboxes[0][a]+this.sboxes[1][n],t^=this.sboxes[2][i],t+=this.sboxes[3][r],t},Fe.prototype._encryptBlock=function(e){let t,r=e[0],i=e[1];for(t=0;t<this.NN;++t){r^=this.parray[t],i=this._F(r)^i;const e=r;r=i,i=e;}r^=this.parray[this.NN+0],i^=this.parray[this.NN+1],e[0]=this._clean(i),e[1]=this._clean(r);},Fe.prototype.encryptBlock=function(e){let t;const r=[0,0],i=this.BLOCKSIZE/2;for(t=0;t<this.BLOCKSIZE/2;++t)r[0]=r[0]<<8|255&e[t+0],r[1]=r[1]<<8|255&e[t+i];this._encryptBlock(r);const n=[];for(t=0;t<this.BLOCKSIZE/2;++t)n[t+0]=r[0]>>>24-8*t&255,n[t+i]=r[1]>>>24-8*t&255;return n},Fe.prototype._decryptBlock=function(e){let t,r=e[0],i=e[1];for(t=this.NN+1;t>1;--t){r^=this.parray[t],i=this._F(r)^i;const e=r;r=i,i=e;}r^=this.parray[1],i^=this.parray[0],e[0]=this._clean(i),e[1]=this._clean(r);},Fe.prototype.init=function(e){let t,r=0;for(this.parray=[],t=0;t<this.NN+2;++t){let i=0;for(let t=0;t<4;++t)i=i<<8|255&e[r],++r>=e.length&&(r=0);this.parray[t]=this.PARRAY[t]^i;}for(this.sboxes=[],t=0;t<4;++t)for(this.sboxes[t]=[],r=0;r<256;++r)this.sboxes[t][r]=this.SBOXES[t][r];const i=[0,0];for(t=0;t<this.NN+2;t+=2)this._encryptBlock(i),this.parray[t+0]=i[0],this.parray[t+1]=i[1];for(t=0;t<4;++t)for(r=0;r<256;r+=2)this._encryptBlock(i),this.sboxes[t][r+0]=i[0],this.sboxes[t][r+1]=i[1];},Oe.keySize=Oe.prototype.keySize=16,Oe.blockSize=Oe.prototype.blockSize=8;const Ne=Pe(128),Le=Pe(192),je=Pe(256);var We=/*#__PURE__*/Object.freeze({__proto__:null,aes128:Ne,aes192:Le,aes256:je,des:function(e){this.key=e,this.encrypt=function(e,t){return Me(Ce(this.key),e,!0,0,null,t)},this.decrypt=function(e,t){return Me(Ce(this.key),e,!1,0,null,t)};},tripledes:Ke,cast5:Re,twofish:qe,blowfish:Oe,idea:function(){throw Error("IDEA symmetric-key algorithm not implemented")}}),He=function(e,t,r){"use asm";var i=0,n=0,a=0,s=0,o=0,c=0,u=0;var h=0,d=0,f=0,l=0,p=0,y=0,b=0,m=0,g=0,w=0;var v=new e.Uint8Array(r);function _(e,t,r,c,u,h,d,f,l,p,y,b,m,g,w,v){e=e|0;t=t|0;r=r|0;c=c|0;u=u|0;h=h|0;d=d|0;f=f|0;l=l|0;p=p|0;y=y|0;b=b|0;m=m|0;g=g|0;w=w|0;v=v|0;var _=0,k=0,A=0,S=0,E=0,x=0,P=0,M=0,C=0,K=0,D=0,R=0,I=0,U=0,B=0,T=0,z=0,q=0,F=0,O=0,N=0,L=0,j=0,W=0,H=0,G=0,V=0,Z=0,Y=0,$=0,X=0,J=0,Q=0,ee=0,te=0,re=0,ie=0,ne=0,ae=0,se=0,oe=0,ce=0,ue=0,he=0,de=0,fe=0,le=0,pe=0,ye=0,be=0,me=0,ge=0,we=0,ve=0,_e=0,ke=0,Ae=0,Se=0,Ee=0,xe=0,Pe=0,Me=0,Ce=0,Ke=0,De=0,Re=0,Ie=0,Ue=0,Be=0,Te=0,ze=0;_=i;k=n;A=a;S=s;E=o;P=e+(_<<5|_>>>27)+E+(k&A|~k&S)+0x5a827999|0;E=S;S=A;A=k<<30|k>>>2;k=_;_=P;P=t+(_<<5|_>>>27)+E+(k&A|~k&S)+0x5a827999|0;E=S;S=A;A=k<<30|k>>>2;k=_;_=P;P=r+(_<<5|_>>>27)+E+(k&A|~k&S)+0x5a827999|0;E=S;S=A;A=k<<30|k>>>2;k=_;_=P;P=c+(_<<5|_>>>27)+E+(k&A|~k&S)+0x5a827999|0;E=S;S=A;A=k<<30|k>>>2;k=_;_=P;P=u+(_<<5|_>>>27)+E+(k&A|~k&S)+0x5a827999|0;E=S;S=A;A=k<<30|k>>>2;k=_;_=P;P=h+(_<<5|_>>>27)+E+(k&A|~k&S)+0x5a827999|0;E=S;S=A;A=k<<30|k>>>2;k=_;_=P;P=d+(_<<5|_>>>27)+E+(k&A|~k&S)+0x5a827999|0;E=S;S=A;A=k<<30|k>>>2;k=_;_=P;P=f+(_<<5|_>>>27)+E+(k&A|~k&S)+0x5a827999|0;E=S;S=A;A=k<<30|k>>>2;k=_;_=P;P=l+(_<<5|_>>>27)+E+(k&A|~k&S)+0x5a827999|0;E=S;S=A;A=k<<30|k>>>2;k=_;_=P;P=p+(_<<5|_>>>27)+E+(k&A|~k&S)+0x5a827999|0;E=S;S=A;A=k<<30|k>>>2;k=_;_=P;P=y+(_<<5|_>>>27)+E+(k&A|~k&S)+0x5a827999|0;E=S;S=A;A=k<<30|k>>>2;k=_;_=P;P=b+(_<<5|_>>>27)+E+(k&A|~k&S)+0x5a827999|0;E=S;S=A;A=k<<30|k>>>2;k=_;_=P;P=m+(_<<5|_>>>27)+E+(k&A|~k&S)+0x5a827999|0;E=S;S=A;A=k<<30|k>>>2;k=_;_=P;P=g+(_<<5|_>>>27)+E+(k&A|~k&S)+0x5a827999|0;E=S;S=A;A=k<<30|k>>>2;k=_;_=P;P=w+(_<<5|_>>>27)+E+(k&A|~k&S)+0x5a827999|0;E=S;S=A;A=k<<30|k>>>2;k=_;_=P;P=v+(_<<5|_>>>27)+E+(k&A|~k&S)+0x5a827999|0;E=S;S=A;A=k<<30|k>>>2;k=_;_=P;x=g^l^r^e;M=x<<1|x>>>31;P=M+(_<<5|_>>>27)+E+(k&A|~k&S)+0x5a827999|0;E=S;S=A;A=k<<30|k>>>2;k=_;_=P;x=w^p^c^t;C=x<<1|x>>>31;P=C+(_<<5|_>>>27)+E+(k&A|~k&S)+0x5a827999|0;E=S;S=A;A=k<<30|k>>>2;k=_;_=P;x=v^y^u^r;K=x<<1|x>>>31;P=K+(_<<5|_>>>27)+E+(k&A|~k&S)+0x5a827999|0;E=S;S=A;A=k<<30|k>>>2;k=_;_=P;x=M^b^h^c;D=x<<1|x>>>31;P=D+(_<<5|_>>>27)+E+(k&A|~k&S)+0x5a827999|0;E=S;S=A;A=k<<30|k>>>2;k=_;_=P;x=C^m^d^u;R=x<<1|x>>>31;P=R+(_<<5|_>>>27)+E+(k^A^S)+0x6ed9eba1|0;E=S;S=A;A=k<<30|k>>>2;k=_;_=P;x=K^g^f^h;I=x<<1|x>>>31;P=I+(_<<5|_>>>27)+E+(k^A^S)+0x6ed9eba1|0;E=S;S=A;A=k<<30|k>>>2;k=_;_=P;x=D^w^l^d;U=x<<1|x>>>31;P=U+(_<<5|_>>>27)+E+(k^A^S)+0x6ed9eba1|0;E=S;S=A;A=k<<30|k>>>2;k=_;_=P;x=R^v^p^f;B=x<<1|x>>>31;P=B+(_<<5|_>>>27)+E+(k^A^S)+0x6ed9eba1|0;E=S;S=A;A=k<<30|k>>>2;k=_;_=P;x=I^M^y^l;T=x<<1|x>>>31;P=T+(_<<5|_>>>27)+E+(k^A^S)+0x6ed9eba1|0;E=S;S=A;A=k<<30|k>>>2;k=_;_=P;x=U^C^b^p;z=x<<1|x>>>31;P=z+(_<<5|_>>>27)+E+(k^A^S)+0x6ed9eba1|0;E=S;S=A;A=k<<30|k>>>2;k=_;_=P;x=B^K^m^y;q=x<<1|x>>>31;P=q+(_<<5|_>>>27)+E+(k^A^S)+0x6ed9eba1|0;E=S;S=A;A=k<<30|k>>>2;k=_;_=P;x=T^D^g^b;F=x<<1|x>>>31;P=F+(_<<5|_>>>27)+E+(k^A^S)+0x6ed9eba1|0;E=S;S=A;A=k<<30|k>>>2;k=_;_=P;x=z^R^w^m;O=x<<1|x>>>31;P=O+(_<<5|_>>>27)+E+(k^A^S)+0x6ed9eba1|0;E=S;S=A;A=k<<30|k>>>2;k=_;_=P;x=q^I^v^g;N=x<<1|x>>>31;P=N+(_<<5|_>>>27)+E+(k^A^S)+0x6ed9eba1|0;E=S;S=A;A=k<<30|k>>>2;k=_;_=P;x=F^U^M^w;L=x<<1|x>>>31;P=L+(_<<5|_>>>27)+E+(k^A^S)+0x6ed9eba1|0;E=S;S=A;A=k<<30|k>>>2;k=_;_=P;x=O^B^C^v;j=x<<1|x>>>31;P=j+(_<<5|_>>>27)+E+(k^A^S)+0x6ed9eba1|0;E=S;S=A;A=k<<30|k>>>2;k=_;_=P;x=N^T^K^M;W=x<<1|x>>>31;P=W+(_<<5|_>>>27)+E+(k^A^S)+0x6ed9eba1|0;E=S;S=A;A=k<<30|k>>>2;k=_;_=P;x=L^z^D^C;H=x<<1|x>>>31;P=H+(_<<5|_>>>27)+E+(k^A^S)+0x6ed9eba1|0;E=S;S=A;A=k<<30|k>>>2;k=_;_=P;x=j^q^R^K;G=x<<1|x>>>31;P=G+(_<<5|_>>>27)+E+(k^A^S)+0x6ed9eba1|0;E=S;S=A;A=k<<30|k>>>2;k=_;_=P;x=W^F^I^D;V=x<<1|x>>>31;P=V+(_<<5|_>>>27)+E+(k^A^S)+0x6ed9eba1|0;E=S;S=A;A=k<<30|k>>>2;k=_;_=P;x=H^O^U^R;Z=x<<1|x>>>31;P=Z+(_<<5|_>>>27)+E+(k^A^S)+0x6ed9eba1|0;E=S;S=A;A=k<<30|k>>>2;k=_;_=P;x=G^N^B^I;Y=x<<1|x>>>31;P=Y+(_<<5|_>>>27)+E+(k^A^S)+0x6ed9eba1|0;E=S;S=A;A=k<<30|k>>>2;k=_;_=P;x=V^L^T^U;$=x<<1|x>>>31;P=$+(_<<5|_>>>27)+E+(k^A^S)+0x6ed9eba1|0;E=S;S=A;A=k<<30|k>>>2;k=_;_=P;x=Z^j^z^B;X=x<<1|x>>>31;P=X+(_<<5|_>>>27)+E+(k^A^S)+0x6ed9eba1|0;E=S;S=A;A=k<<30|k>>>2;k=_;_=P;x=Y^W^q^T;J=x<<1|x>>>31;P=J+(_<<5|_>>>27)+E+(k&A|k&S|A&S)-0x70e44324|0;E=S;S=A;A=k<<30|k>>>2;k=_;_=P;x=$^H^F^z;Q=x<<1|x>>>31;P=Q+(_<<5|_>>>27)+E+(k&A|k&S|A&S)-0x70e44324|0;E=S;S=A;A=k<<30|k>>>2;k=_;_=P;x=X^G^O^q;ee=x<<1|x>>>31;P=ee+(_<<5|_>>>27)+E+(k&A|k&S|A&S)-0x70e44324|0;E=S;S=A;A=k<<30|k>>>2;k=_;_=P;x=J^V^N^F;te=x<<1|x>>>31;P=te+(_<<5|_>>>27)+E+(k&A|k&S|A&S)-0x70e44324|0;E=S;S=A;A=k<<30|k>>>2;k=_;_=P;x=Q^Z^L^O;re=x<<1|x>>>31;P=re+(_<<5|_>>>27)+E+(k&A|k&S|A&S)-0x70e44324|0;E=S;S=A;A=k<<30|k>>>2;k=_;_=P;x=ee^Y^j^N;ie=x<<1|x>>>31;P=ie+(_<<5|_>>>27)+E+(k&A|k&S|A&S)-0x70e44324|0;E=S;S=A;A=k<<30|k>>>2;k=_;_=P;x=te^$^W^L;ne=x<<1|x>>>31;P=ne+(_<<5|_>>>27)+E+(k&A|k&S|A&S)-0x70e44324|0;E=S;S=A;A=k<<30|k>>>2;k=_;_=P;x=re^X^H^j;ae=x<<1|x>>>31;P=ae+(_<<5|_>>>27)+E+(k&A|k&S|A&S)-0x70e44324|0;E=S;S=A;A=k<<30|k>>>2;k=_;_=P;x=ie^J^G^W;se=x<<1|x>>>31;P=se+(_<<5|_>>>27)+E+(k&A|k&S|A&S)-0x70e44324|0;E=S;S=A;A=k<<30|k>>>2;k=_;_=P;x=ne^Q^V^H;oe=x<<1|x>>>31;P=oe+(_<<5|_>>>27)+E+(k&A|k&S|A&S)-0x70e44324|0;E=S;S=A;A=k<<30|k>>>2;k=_;_=P;x=ae^ee^Z^G;ce=x<<1|x>>>31;P=ce+(_<<5|_>>>27)+E+(k&A|k&S|A&S)-0x70e44324|0;E=S;S=A;A=k<<30|k>>>2;k=_;_=P;x=se^te^Y^V;ue=x<<1|x>>>31;P=ue+(_<<5|_>>>27)+E+(k&A|k&S|A&S)-0x70e44324|0;E=S;S=A;A=k<<30|k>>>2;k=_;_=P;x=oe^re^$^Z;he=x<<1|x>>>31;P=he+(_<<5|_>>>27)+E+(k&A|k&S|A&S)-0x70e44324|0;E=S;S=A;A=k<<30|k>>>2;k=_;_=P;x=ce^ie^X^Y;de=x<<1|x>>>31;P=de+(_<<5|_>>>27)+E+(k&A|k&S|A&S)-0x70e44324|0;E=S;S=A;A=k<<30|k>>>2;k=_;_=P;x=ue^ne^J^$;fe=x<<1|x>>>31;P=fe+(_<<5|_>>>27)+E+(k&A|k&S|A&S)-0x70e44324|0;E=S;S=A;A=k<<30|k>>>2;k=_;_=P;x=he^ae^Q^X;le=x<<1|x>>>31;P=le+(_<<5|_>>>27)+E+(k&A|k&S|A&S)-0x70e44324|0;E=S;S=A;A=k<<30|k>>>2;k=_;_=P;x=de^se^ee^J;pe=x<<1|x>>>31;P=pe+(_<<5|_>>>27)+E+(k&A|k&S|A&S)-0x70e44324|0;E=S;S=A;A=k<<30|k>>>2;k=_;_=P;x=fe^oe^te^Q;ye=x<<1|x>>>31;P=ye+(_<<5|_>>>27)+E+(k&A|k&S|A&S)-0x70e44324|0;E=S;S=A;A=k<<30|k>>>2;k=_;_=P;x=le^ce^re^ee;be=x<<1|x>>>31;P=be+(_<<5|_>>>27)+E+(k&A|k&S|A&S)-0x70e44324|0;E=S;S=A;A=k<<30|k>>>2;k=_;_=P;x=pe^ue^ie^te;me=x<<1|x>>>31;P=me+(_<<5|_>>>27)+E+(k&A|k&S|A&S)-0x70e44324|0;E=S;S=A;A=k<<30|k>>>2;k=_;_=P;x=ye^he^ne^re;ge=x<<1|x>>>31;P=ge+(_<<5|_>>>27)+E+(k^A^S)-0x359d3e2a|0;E=S;S=A;A=k<<30|k>>>2;k=_;_=P;x=be^de^ae^ie;we=x<<1|x>>>31;P=we+(_<<5|_>>>27)+E+(k^A^S)-0x359d3e2a|0;E=S;S=A;A=k<<30|k>>>2;k=_;_=P;x=me^fe^se^ne;ve=x<<1|x>>>31;P=ve+(_<<5|_>>>27)+E+(k^A^S)-0x359d3e2a|0;E=S;S=A;A=k<<30|k>>>2;k=_;_=P;x=ge^le^oe^ae;_e=x<<1|x>>>31;P=_e+(_<<5|_>>>27)+E+(k^A^S)-0x359d3e2a|0;E=S;S=A;A=k<<30|k>>>2;k=_;_=P;x=we^pe^ce^se;ke=x<<1|x>>>31;P=ke+(_<<5|_>>>27)+E+(k^A^S)-0x359d3e2a|0;E=S;S=A;A=k<<30|k>>>2;k=_;_=P;x=ve^ye^ue^oe;Ae=x<<1|x>>>31;P=Ae+(_<<5|_>>>27)+E+(k^A^S)-0x359d3e2a|0;E=S;S=A;A=k<<30|k>>>2;k=_;_=P;x=_e^be^he^ce;Se=x<<1|x>>>31;P=Se+(_<<5|_>>>27)+E+(k^A^S)-0x359d3e2a|0;E=S;S=A;A=k<<30|k>>>2;k=_;_=P;x=ke^me^de^ue;Ee=x<<1|x>>>31;P=Ee+(_<<5|_>>>27)+E+(k^A^S)-0x359d3e2a|0;E=S;S=A;A=k<<30|k>>>2;k=_;_=P;x=Ae^ge^fe^he;xe=x<<1|x>>>31;P=xe+(_<<5|_>>>27)+E+(k^A^S)-0x359d3e2a|0;E=S;S=A;A=k<<30|k>>>2;k=_;_=P;x=Se^we^le^de;Pe=x<<1|x>>>31;P=Pe+(_<<5|_>>>27)+E+(k^A^S)-0x359d3e2a|0;E=S;S=A;A=k<<30|k>>>2;k=_;_=P;x=Ee^ve^pe^fe;Me=x<<1|x>>>31;P=Me+(_<<5|_>>>27)+E+(k^A^S)-0x359d3e2a|0;E=S;S=A;A=k<<30|k>>>2;k=_;_=P;x=xe^_e^ye^le;Ce=x<<1|x>>>31;P=Ce+(_<<5|_>>>27)+E+(k^A^S)-0x359d3e2a|0;E=S;S=A;A=k<<30|k>>>2;k=_;_=P;x=Pe^ke^be^pe;Ke=x<<1|x>>>31;P=Ke+(_<<5|_>>>27)+E+(k^A^S)-0x359d3e2a|0;E=S;S=A;A=k<<30|k>>>2;k=_;_=P;x=Me^Ae^me^ye;De=x<<1|x>>>31;P=De+(_<<5|_>>>27)+E+(k^A^S)-0x359d3e2a|0;E=S;S=A;A=k<<30|k>>>2;k=_;_=P;x=Ce^Se^ge^be;Re=x<<1|x>>>31;P=Re+(_<<5|_>>>27)+E+(k^A^S)-0x359d3e2a|0;E=S;S=A;A=k<<30|k>>>2;k=_;_=P;x=Ke^Ee^we^me;Ie=x<<1|x>>>31;P=Ie+(_<<5|_>>>27)+E+(k^A^S)-0x359d3e2a|0;E=S;S=A;A=k<<30|k>>>2;k=_;_=P;x=De^xe^ve^ge;Ue=x<<1|x>>>31;P=Ue+(_<<5|_>>>27)+E+(k^A^S)-0x359d3e2a|0;E=S;S=A;A=k<<30|k>>>2;k=_;_=P;x=Re^Pe^_e^we;Be=x<<1|x>>>31;P=Be+(_<<5|_>>>27)+E+(k^A^S)-0x359d3e2a|0;E=S;S=A;A=k<<30|k>>>2;k=_;_=P;x=Ie^Me^ke^ve;Te=x<<1|x>>>31;P=Te+(_<<5|_>>>27)+E+(k^A^S)-0x359d3e2a|0;E=S;S=A;A=k<<30|k>>>2;k=_;_=P;x=Ue^Ce^Ae^_e;ze=x<<1|x>>>31;P=ze+(_<<5|_>>>27)+E+(k^A^S)-0x359d3e2a|0;E=S;S=A;A=k<<30|k>>>2;k=_;_=P;i=i+_|0;n=n+k|0;a=a+A|0;s=s+S|0;o=o+E|0;}function k(e){e=e|0;_(v[e|0]<<24|v[e|1]<<16|v[e|2]<<8|v[e|3],v[e|4]<<24|v[e|5]<<16|v[e|6]<<8|v[e|7],v[e|8]<<24|v[e|9]<<16|v[e|10]<<8|v[e|11],v[e|12]<<24|v[e|13]<<16|v[e|14]<<8|v[e|15],v[e|16]<<24|v[e|17]<<16|v[e|18]<<8|v[e|19],v[e|20]<<24|v[e|21]<<16|v[e|22]<<8|v[e|23],v[e|24]<<24|v[e|25]<<16|v[e|26]<<8|v[e|27],v[e|28]<<24|v[e|29]<<16|v[e|30]<<8|v[e|31],v[e|32]<<24|v[e|33]<<16|v[e|34]<<8|v[e|35],v[e|36]<<24|v[e|37]<<16|v[e|38]<<8|v[e|39],v[e|40]<<24|v[e|41]<<16|v[e|42]<<8|v[e|43],v[e|44]<<24|v[e|45]<<16|v[e|46]<<8|v[e|47],v[e|48]<<24|v[e|49]<<16|v[e|50]<<8|v[e|51],v[e|52]<<24|v[e|53]<<16|v[e|54]<<8|v[e|55],v[e|56]<<24|v[e|57]<<16|v[e|58]<<8|v[e|59],v[e|60]<<24|v[e|61]<<16|v[e|62]<<8|v[e|63]);}function A(e){e=e|0;v[e|0]=i>>>24;v[e|1]=i>>>16&255;v[e|2]=i>>>8&255;v[e|3]=i&255;v[e|4]=n>>>24;v[e|5]=n>>>16&255;v[e|6]=n>>>8&255;v[e|7]=n&255;v[e|8]=a>>>24;v[e|9]=a>>>16&255;v[e|10]=a>>>8&255;v[e|11]=a&255;v[e|12]=s>>>24;v[e|13]=s>>>16&255;v[e|14]=s>>>8&255;v[e|15]=s&255;v[e|16]=o>>>24;v[e|17]=o>>>16&255;v[e|18]=o>>>8&255;v[e|19]=o&255;}function S(){i=0x67452301;n=0xefcdab89;a=0x98badcfe;s=0x10325476;o=0xc3d2e1f0;c=u=0;}function E(e,t,r,h,d,f,l){e=e|0;t=t|0;r=r|0;h=h|0;d=d|0;f=f|0;l=l|0;i=e;n=t;a=r;s=h;o=d;c=f;u=l;}function x(e,t){e=e|0;t=t|0;var r=0;if(e&63)return -1;while((t|0)>=64){k(e);e=e+64|0;t=t-64|0;r=r+64|0;}c=c+r|0;if(c>>>0<r>>>0)u=u+1|0;return r|0}function P(e,t,r){e=e|0;t=t|0;r=r|0;var i=0,n=0;if(e&63)return -1;if(~r)if(r&31)return -1;if((t|0)>=64){i=x(e,t)|0;if((i|0)==-1)return -1;e=e+i|0;t=t-i|0;}i=i+t|0;c=c+t|0;if(c>>>0<t>>>0)u=u+1|0;v[e|t]=0x80;if((t|0)>=56){for(n=t+1|0;(n|0)<64;n=n+1|0)v[e|n]=0x00;k(e);t=0;v[e|0]=0;}for(n=t+1|0;(n|0)<59;n=n+1|0)v[e|n]=0;v[e|56]=u>>>21&255;v[e|57]=u>>>13&255;v[e|58]=u>>>5&255;v[e|59]=u<<3&255|c>>>29;v[e|60]=c>>>21&255;v[e|61]=c>>>13&255;v[e|62]=c>>>5&255;v[e|63]=c<<3&255;k(e);if(~r)A(r);return i|0}function M(){i=h;n=d;a=f;s=l;o=p;c=64;u=0;}function C(){i=y;n=b;a=m;s=g;o=w;c=64;u=0;}function K(e,t,r,v,k,A,E,x,P,M,C,K,D,R,I,U){e=e|0;t=t|0;r=r|0;v=v|0;k=k|0;A=A|0;E=E|0;x=x|0;P=P|0;M=M|0;C=C|0;K=K|0;D=D|0;R=R|0;I=I|0;U=U|0;S();_(e^0x5c5c5c5c,t^0x5c5c5c5c,r^0x5c5c5c5c,v^0x5c5c5c5c,k^0x5c5c5c5c,A^0x5c5c5c5c,E^0x5c5c5c5c,x^0x5c5c5c5c,P^0x5c5c5c5c,M^0x5c5c5c5c,C^0x5c5c5c5c,K^0x5c5c5c5c,D^0x5c5c5c5c,R^0x5c5c5c5c,I^0x5c5c5c5c,U^0x5c5c5c5c);y=i;b=n;m=a;g=s;w=o;S();_(e^0x36363636,t^0x36363636,r^0x36363636,v^0x36363636,k^0x36363636,A^0x36363636,E^0x36363636,x^0x36363636,P^0x36363636,M^0x36363636,C^0x36363636,K^0x36363636,D^0x36363636,R^0x36363636,I^0x36363636,U^0x36363636);h=i;d=n;f=a;l=s;p=o;c=64;u=0;}function D(e,t,r){e=e|0;t=t|0;r=r|0;var c=0,u=0,h=0,d=0,f=0,l=0;if(e&63)return -1;if(~r)if(r&31)return -1;l=P(e,t,-1)|0;c=i,u=n,h=a,d=s,f=o;C();_(c,u,h,d,f,0x80000000,0,0,0,0,0,0,0,0,0,672);if(~r)A(r);return l|0}function R(e,t,r,c,u){e=e|0;t=t|0;r=r|0;c=c|0;u=u|0;var h=0,d=0,f=0,l=0,p=0,y=0,b=0,m=0,g=0,w=0;if(e&63)return -1;if(~u)if(u&31)return -1;v[e+t|0]=r>>>24;v[e+t+1|0]=r>>>16&255;v[e+t+2|0]=r>>>8&255;v[e+t+3|0]=r&255;D(e,t+4|0,-1)|0;h=y=i,d=b=n,f=m=a,l=g=s,p=w=o;c=c-1|0;while((c|0)>0){M();_(y,b,m,g,w,0x80000000,0,0,0,0,0,0,0,0,0,672);y=i,b=n,m=a,g=s,w=o;C();_(y,b,m,g,w,0x80000000,0,0,0,0,0,0,0,0,0,672);y=i,b=n,m=a,g=s,w=o;h=h^i;d=d^n;f=f^a;l=l^s;p=p^o;c=c-1|0;}i=h;n=d;a=f;s=l;o=p;if(~u)A(u);return 0}return {reset:S,init:E,process:x,finish:P,hmac_reset:M,hmac_init:K,hmac_finish:D,pbkdf2_generate_block:R}};class Ge{constructor(){this.pos=0,this.len=0;}reset(){const{asm:e}=this.acquire_asm();return this.result=null,this.pos=0,this.len=0,e.reset(),this}process(e){if(null!==this.result)throw new ve("state must be reset before processing new data");const{asm:t,heap:r}=this.acquire_asm();let i=this.pos,n=this.len,a=0,s=e.length,o=0;for(;s>0;)o=ge(r,i+n,e,a,s),n+=o,a+=o,s-=o,o=t.process(i,n),i+=o,n-=o,n||(i=0);return this.pos=i,this.len=n,this}finish(){if(null!==this.result)throw new ve("state must be reset before processing new data");const{asm:e,heap:t}=this.acquire_asm();return e.finish(this.pos,this.len,0),this.result=new Uint8Array(this.HASH_SIZE),this.result.set(t.subarray(0,this.HASH_SIZE)),this.pos=0,this.len=0,this.release_asm(),this}}const Ve=[],Ze=[];class Ye extends Ge{constructor(){super(),this.NAME="sha1",this.BLOCK_SIZE=64,this.HASH_SIZE=20,this.acquire_asm();}acquire_asm(){return void 0!==this.heap&&void 0!==this.asm||(this.heap=Ve.pop()||me(),this.asm=Ze.pop()||He({Uint8Array},null,this.heap.buffer),this.reset()),{heap:this.heap,asm:this.asm}}release_asm(){void 0!==this.heap&&void 0!==this.asm&&(Ve.push(this.heap),Ze.push(this.asm)),this.heap=void 0,this.asm=void 0;}static bytes(e){return (new Ye).process(e).finish().result}}Ye.NAME="sha1",Ye.heap_pool=[],Ye.asm_pool=[],Ye.asm_function=He;const $e=[],Xe=[];class Je extends Ge{constructor(){super(),this.NAME="sha256",this.BLOCK_SIZE=64,this.HASH_SIZE=32,this.acquire_asm();}acquire_asm(){return void 0!==this.heap&&void 0!==this.asm||(this.heap=$e.pop()||me(),this.asm=Xe.pop()||function(e,t,r){"use asm";var i=0,n=0,a=0,s=0,o=0,c=0,u=0,h=0,d=0,f=0,l=0,p=0,y=0,b=0,m=0,g=0,w=0,v=0,_=0,k=0,A=0,S=0,E=0,x=0,P=0,M=0,C=new e.Uint8Array(r);function K(e,t,r,d,f,l,p,y,b,m,g,w,v,_,k,A){e=e|0;t=t|0;r=r|0;d=d|0;f=f|0;l=l|0;p=p|0;y=y|0;b=b|0;m=m|0;g=g|0;w=w|0;v=v|0;_=_|0;k=k|0;A=A|0;var S=0,E=0,x=0,P=0,M=0,C=0,K=0,D=0;S=i;E=n;x=a;P=s;M=o;C=c;K=u;D=h;D=e+D+(M>>>6^M>>>11^M>>>25^M<<26^M<<21^M<<7)+(K^M&(C^K))+0x428a2f98|0;P=P+D|0;D=D+(S&E^x&(S^E))+(S>>>2^S>>>13^S>>>22^S<<30^S<<19^S<<10)|0;K=t+K+(P>>>6^P>>>11^P>>>25^P<<26^P<<21^P<<7)+(C^P&(M^C))+0x71374491|0;x=x+K|0;K=K+(D&S^E&(D^S))+(D>>>2^D>>>13^D>>>22^D<<30^D<<19^D<<10)|0;C=r+C+(x>>>6^x>>>11^x>>>25^x<<26^x<<21^x<<7)+(M^x&(P^M))+0xb5c0fbcf|0;E=E+C|0;C=C+(K&D^S&(K^D))+(K>>>2^K>>>13^K>>>22^K<<30^K<<19^K<<10)|0;M=d+M+(E>>>6^E>>>11^E>>>25^E<<26^E<<21^E<<7)+(P^E&(x^P))+0xe9b5dba5|0;S=S+M|0;M=M+(C&K^D&(C^K))+(C>>>2^C>>>13^C>>>22^C<<30^C<<19^C<<10)|0;P=f+P+(S>>>6^S>>>11^S>>>25^S<<26^S<<21^S<<7)+(x^S&(E^x))+0x3956c25b|0;D=D+P|0;P=P+(M&C^K&(M^C))+(M>>>2^M>>>13^M>>>22^M<<30^M<<19^M<<10)|0;x=l+x+(D>>>6^D>>>11^D>>>25^D<<26^D<<21^D<<7)+(E^D&(S^E))+0x59f111f1|0;K=K+x|0;x=x+(P&M^C&(P^M))+(P>>>2^P>>>13^P>>>22^P<<30^P<<19^P<<10)|0;E=p+E+(K>>>6^K>>>11^K>>>25^K<<26^K<<21^K<<7)+(S^K&(D^S))+0x923f82a4|0;C=C+E|0;E=E+(x&P^M&(x^P))+(x>>>2^x>>>13^x>>>22^x<<30^x<<19^x<<10)|0;S=y+S+(C>>>6^C>>>11^C>>>25^C<<26^C<<21^C<<7)+(D^C&(K^D))+0xab1c5ed5|0;M=M+S|0;S=S+(E&x^P&(E^x))+(E>>>2^E>>>13^E>>>22^E<<30^E<<19^E<<10)|0;D=b+D+(M>>>6^M>>>11^M>>>25^M<<26^M<<21^M<<7)+(K^M&(C^K))+0xd807aa98|0;P=P+D|0;D=D+(S&E^x&(S^E))+(S>>>2^S>>>13^S>>>22^S<<30^S<<19^S<<10)|0;K=m+K+(P>>>6^P>>>11^P>>>25^P<<26^P<<21^P<<7)+(C^P&(M^C))+0x12835b01|0;x=x+K|0;K=K+(D&S^E&(D^S))+(D>>>2^D>>>13^D>>>22^D<<30^D<<19^D<<10)|0;C=g+C+(x>>>6^x>>>11^x>>>25^x<<26^x<<21^x<<7)+(M^x&(P^M))+0x243185be|0;E=E+C|0;C=C+(K&D^S&(K^D))+(K>>>2^K>>>13^K>>>22^K<<30^K<<19^K<<10)|0;M=w+M+(E>>>6^E>>>11^E>>>25^E<<26^E<<21^E<<7)+(P^E&(x^P))+0x550c7dc3|0;S=S+M|0;M=M+(C&K^D&(C^K))+(C>>>2^C>>>13^C>>>22^C<<30^C<<19^C<<10)|0;P=v+P+(S>>>6^S>>>11^S>>>25^S<<26^S<<21^S<<7)+(x^S&(E^x))+0x72be5d74|0;D=D+P|0;P=P+(M&C^K&(M^C))+(M>>>2^M>>>13^M>>>22^M<<30^M<<19^M<<10)|0;x=_+x+(D>>>6^D>>>11^D>>>25^D<<26^D<<21^D<<7)+(E^D&(S^E))+0x80deb1fe|0;K=K+x|0;x=x+(P&M^C&(P^M))+(P>>>2^P>>>13^P>>>22^P<<30^P<<19^P<<10)|0;E=k+E+(K>>>6^K>>>11^K>>>25^K<<26^K<<21^K<<7)+(S^K&(D^S))+0x9bdc06a7|0;C=C+E|0;E=E+(x&P^M&(x^P))+(x>>>2^x>>>13^x>>>22^x<<30^x<<19^x<<10)|0;S=A+S+(C>>>6^C>>>11^C>>>25^C<<26^C<<21^C<<7)+(D^C&(K^D))+0xc19bf174|0;M=M+S|0;S=S+(E&x^P&(E^x))+(E>>>2^E>>>13^E>>>22^E<<30^E<<19^E<<10)|0;e=(t>>>7^t>>>18^t>>>3^t<<25^t<<14)+(k>>>17^k>>>19^k>>>10^k<<15^k<<13)+e+m|0;D=e+D+(M>>>6^M>>>11^M>>>25^M<<26^M<<21^M<<7)+(K^M&(C^K))+0xe49b69c1|0;P=P+D|0;D=D+(S&E^x&(S^E))+(S>>>2^S>>>13^S>>>22^S<<30^S<<19^S<<10)|0;t=(r>>>7^r>>>18^r>>>3^r<<25^r<<14)+(A>>>17^A>>>19^A>>>10^A<<15^A<<13)+t+g|0;K=t+K+(P>>>6^P>>>11^P>>>25^P<<26^P<<21^P<<7)+(C^P&(M^C))+0xefbe4786|0;x=x+K|0;K=K+(D&S^E&(D^S))+(D>>>2^D>>>13^D>>>22^D<<30^D<<19^D<<10)|0;r=(d>>>7^d>>>18^d>>>3^d<<25^d<<14)+(e>>>17^e>>>19^e>>>10^e<<15^e<<13)+r+w|0;C=r+C+(x>>>6^x>>>11^x>>>25^x<<26^x<<21^x<<7)+(M^x&(P^M))+0x0fc19dc6|0;E=E+C|0;C=C+(K&D^S&(K^D))+(K>>>2^K>>>13^K>>>22^K<<30^K<<19^K<<10)|0;d=(f>>>7^f>>>18^f>>>3^f<<25^f<<14)+(t>>>17^t>>>19^t>>>10^t<<15^t<<13)+d+v|0;M=d+M+(E>>>6^E>>>11^E>>>25^E<<26^E<<21^E<<7)+(P^E&(x^P))+0x240ca1cc|0;S=S+M|0;M=M+(C&K^D&(C^K))+(C>>>2^C>>>13^C>>>22^C<<30^C<<19^C<<10)|0;f=(l>>>7^l>>>18^l>>>3^l<<25^l<<14)+(r>>>17^r>>>19^r>>>10^r<<15^r<<13)+f+_|0;P=f+P+(S>>>6^S>>>11^S>>>25^S<<26^S<<21^S<<7)+(x^S&(E^x))+0x2de92c6f|0;D=D+P|0;P=P+(M&C^K&(M^C))+(M>>>2^M>>>13^M>>>22^M<<30^M<<19^M<<10)|0;l=(p>>>7^p>>>18^p>>>3^p<<25^p<<14)+(d>>>17^d>>>19^d>>>10^d<<15^d<<13)+l+k|0;x=l+x+(D>>>6^D>>>11^D>>>25^D<<26^D<<21^D<<7)+(E^D&(S^E))+0x4a7484aa|0;K=K+x|0;x=x+(P&M^C&(P^M))+(P>>>2^P>>>13^P>>>22^P<<30^P<<19^P<<10)|0;p=(y>>>7^y>>>18^y>>>3^y<<25^y<<14)+(f>>>17^f>>>19^f>>>10^f<<15^f<<13)+p+A|0;E=p+E+(K>>>6^K>>>11^K>>>25^K<<26^K<<21^K<<7)+(S^K&(D^S))+0x5cb0a9dc|0;C=C+E|0;E=E+(x&P^M&(x^P))+(x>>>2^x>>>13^x>>>22^x<<30^x<<19^x<<10)|0;y=(b>>>7^b>>>18^b>>>3^b<<25^b<<14)+(l>>>17^l>>>19^l>>>10^l<<15^l<<13)+y+e|0;S=y+S+(C>>>6^C>>>11^C>>>25^C<<26^C<<21^C<<7)+(D^C&(K^D))+0x76f988da|0;M=M+S|0;S=S+(E&x^P&(E^x))+(E>>>2^E>>>13^E>>>22^E<<30^E<<19^E<<10)|0;b=(m>>>7^m>>>18^m>>>3^m<<25^m<<14)+(p>>>17^p>>>19^p>>>10^p<<15^p<<13)+b+t|0;D=b+D+(M>>>6^M>>>11^M>>>25^M<<26^M<<21^M<<7)+(K^M&(C^K))+0x983e5152|0;P=P+D|0;D=D+(S&E^x&(S^E))+(S>>>2^S>>>13^S>>>22^S<<30^S<<19^S<<10)|0;m=(g>>>7^g>>>18^g>>>3^g<<25^g<<14)+(y>>>17^y>>>19^y>>>10^y<<15^y<<13)+m+r|0;K=m+K+(P>>>6^P>>>11^P>>>25^P<<26^P<<21^P<<7)+(C^P&(M^C))+0xa831c66d|0;x=x+K|0;K=K+(D&S^E&(D^S))+(D>>>2^D>>>13^D>>>22^D<<30^D<<19^D<<10)|0;g=(w>>>7^w>>>18^w>>>3^w<<25^w<<14)+(b>>>17^b>>>19^b>>>10^b<<15^b<<13)+g+d|0;C=g+C+(x>>>6^x>>>11^x>>>25^x<<26^x<<21^x<<7)+(M^x&(P^M))+0xb00327c8|0;E=E+C|0;C=C+(K&D^S&(K^D))+(K>>>2^K>>>13^K>>>22^K<<30^K<<19^K<<10)|0;w=(v>>>7^v>>>18^v>>>3^v<<25^v<<14)+(m>>>17^m>>>19^m>>>10^m<<15^m<<13)+w+f|0;M=w+M+(E>>>6^E>>>11^E>>>25^E<<26^E<<21^E<<7)+(P^E&(x^P))+0xbf597fc7|0;S=S+M|0;M=M+(C&K^D&(C^K))+(C>>>2^C>>>13^C>>>22^C<<30^C<<19^C<<10)|0;v=(_>>>7^_>>>18^_>>>3^_<<25^_<<14)+(g>>>17^g>>>19^g>>>10^g<<15^g<<13)+v+l|0;P=v+P+(S>>>6^S>>>11^S>>>25^S<<26^S<<21^S<<7)+(x^S&(E^x))+0xc6e00bf3|0;D=D+P|0;P=P+(M&C^K&(M^C))+(M>>>2^M>>>13^M>>>22^M<<30^M<<19^M<<10)|0;_=(k>>>7^k>>>18^k>>>3^k<<25^k<<14)+(w>>>17^w>>>19^w>>>10^w<<15^w<<13)+_+p|0;x=_+x+(D>>>6^D>>>11^D>>>25^D<<26^D<<21^D<<7)+(E^D&(S^E))+0xd5a79147|0;K=K+x|0;x=x+(P&M^C&(P^M))+(P>>>2^P>>>13^P>>>22^P<<30^P<<19^P<<10)|0;k=(A>>>7^A>>>18^A>>>3^A<<25^A<<14)+(v>>>17^v>>>19^v>>>10^v<<15^v<<13)+k+y|0;E=k+E+(K>>>6^K>>>11^K>>>25^K<<26^K<<21^K<<7)+(S^K&(D^S))+0x06ca6351|0;C=C+E|0;E=E+(x&P^M&(x^P))+(x>>>2^x>>>13^x>>>22^x<<30^x<<19^x<<10)|0;A=(e>>>7^e>>>18^e>>>3^e<<25^e<<14)+(_>>>17^_>>>19^_>>>10^_<<15^_<<13)+A+b|0;S=A+S+(C>>>6^C>>>11^C>>>25^C<<26^C<<21^C<<7)+(D^C&(K^D))+0x14292967|0;M=M+S|0;S=S+(E&x^P&(E^x))+(E>>>2^E>>>13^E>>>22^E<<30^E<<19^E<<10)|0;e=(t>>>7^t>>>18^t>>>3^t<<25^t<<14)+(k>>>17^k>>>19^k>>>10^k<<15^k<<13)+e+m|0;D=e+D+(M>>>6^M>>>11^M>>>25^M<<26^M<<21^M<<7)+(K^M&(C^K))+0x27b70a85|0;P=P+D|0;D=D+(S&E^x&(S^E))+(S>>>2^S>>>13^S>>>22^S<<30^S<<19^S<<10)|0;t=(r>>>7^r>>>18^r>>>3^r<<25^r<<14)+(A>>>17^A>>>19^A>>>10^A<<15^A<<13)+t+g|0;K=t+K+(P>>>6^P>>>11^P>>>25^P<<26^P<<21^P<<7)+(C^P&(M^C))+0x2e1b2138|0;x=x+K|0;K=K+(D&S^E&(D^S))+(D>>>2^D>>>13^D>>>22^D<<30^D<<19^D<<10)|0;r=(d>>>7^d>>>18^d>>>3^d<<25^d<<14)+(e>>>17^e>>>19^e>>>10^e<<15^e<<13)+r+w|0;C=r+C+(x>>>6^x>>>11^x>>>25^x<<26^x<<21^x<<7)+(M^x&(P^M))+0x4d2c6dfc|0;E=E+C|0;C=C+(K&D^S&(K^D))+(K>>>2^K>>>13^K>>>22^K<<30^K<<19^K<<10)|0;d=(f>>>7^f>>>18^f>>>3^f<<25^f<<14)+(t>>>17^t>>>19^t>>>10^t<<15^t<<13)+d+v|0;M=d+M+(E>>>6^E>>>11^E>>>25^E<<26^E<<21^E<<7)+(P^E&(x^P))+0x53380d13|0;S=S+M|0;M=M+(C&K^D&(C^K))+(C>>>2^C>>>13^C>>>22^C<<30^C<<19^C<<10)|0;f=(l>>>7^l>>>18^l>>>3^l<<25^l<<14)+(r>>>17^r>>>19^r>>>10^r<<15^r<<13)+f+_|0;P=f+P+(S>>>6^S>>>11^S>>>25^S<<26^S<<21^S<<7)+(x^S&(E^x))+0x650a7354|0;D=D+P|0;P=P+(M&C^K&(M^C))+(M>>>2^M>>>13^M>>>22^M<<30^M<<19^M<<10)|0;l=(p>>>7^p>>>18^p>>>3^p<<25^p<<14)+(d>>>17^d>>>19^d>>>10^d<<15^d<<13)+l+k|0;x=l+x+(D>>>6^D>>>11^D>>>25^D<<26^D<<21^D<<7)+(E^D&(S^E))+0x766a0abb|0;K=K+x|0;x=x+(P&M^C&(P^M))+(P>>>2^P>>>13^P>>>22^P<<30^P<<19^P<<10)|0;p=(y>>>7^y>>>18^y>>>3^y<<25^y<<14)+(f>>>17^f>>>19^f>>>10^f<<15^f<<13)+p+A|0;E=p+E+(K>>>6^K>>>11^K>>>25^K<<26^K<<21^K<<7)+(S^K&(D^S))+0x81c2c92e|0;C=C+E|0;E=E+(x&P^M&(x^P))+(x>>>2^x>>>13^x>>>22^x<<30^x<<19^x<<10)|0;y=(b>>>7^b>>>18^b>>>3^b<<25^b<<14)+(l>>>17^l>>>19^l>>>10^l<<15^l<<13)+y+e|0;S=y+S+(C>>>6^C>>>11^C>>>25^C<<26^C<<21^C<<7)+(D^C&(K^D))+0x92722c85|0;M=M+S|0;S=S+(E&x^P&(E^x))+(E>>>2^E>>>13^E>>>22^E<<30^E<<19^E<<10)|0;b=(m>>>7^m>>>18^m>>>3^m<<25^m<<14)+(p>>>17^p>>>19^p>>>10^p<<15^p<<13)+b+t|0;D=b+D+(M>>>6^M>>>11^M>>>25^M<<26^M<<21^M<<7)+(K^M&(C^K))+0xa2bfe8a1|0;P=P+D|0;D=D+(S&E^x&(S^E))+(S>>>2^S>>>13^S>>>22^S<<30^S<<19^S<<10)|0;m=(g>>>7^g>>>18^g>>>3^g<<25^g<<14)+(y>>>17^y>>>19^y>>>10^y<<15^y<<13)+m+r|0;K=m+K+(P>>>6^P>>>11^P>>>25^P<<26^P<<21^P<<7)+(C^P&(M^C))+0xa81a664b|0;x=x+K|0;K=K+(D&S^E&(D^S))+(D>>>2^D>>>13^D>>>22^D<<30^D<<19^D<<10)|0;g=(w>>>7^w>>>18^w>>>3^w<<25^w<<14)+(b>>>17^b>>>19^b>>>10^b<<15^b<<13)+g+d|0;C=g+C+(x>>>6^x>>>11^x>>>25^x<<26^x<<21^x<<7)+(M^x&(P^M))+0xc24b8b70|0;E=E+C|0;C=C+(K&D^S&(K^D))+(K>>>2^K>>>13^K>>>22^K<<30^K<<19^K<<10)|0;w=(v>>>7^v>>>18^v>>>3^v<<25^v<<14)+(m>>>17^m>>>19^m>>>10^m<<15^m<<13)+w+f|0;M=w+M+(E>>>6^E>>>11^E>>>25^E<<26^E<<21^E<<7)+(P^E&(x^P))+0xc76c51a3|0;S=S+M|0;M=M+(C&K^D&(C^K))+(C>>>2^C>>>13^C>>>22^C<<30^C<<19^C<<10)|0;v=(_>>>7^_>>>18^_>>>3^_<<25^_<<14)+(g>>>17^g>>>19^g>>>10^g<<15^g<<13)+v+l|0;P=v+P+(S>>>6^S>>>11^S>>>25^S<<26^S<<21^S<<7)+(x^S&(E^x))+0xd192e819|0;D=D+P|0;P=P+(M&C^K&(M^C))+(M>>>2^M>>>13^M>>>22^M<<30^M<<19^M<<10)|0;_=(k>>>7^k>>>18^k>>>3^k<<25^k<<14)+(w>>>17^w>>>19^w>>>10^w<<15^w<<13)+_+p|0;x=_+x+(D>>>6^D>>>11^D>>>25^D<<26^D<<21^D<<7)+(E^D&(S^E))+0xd6990624|0;K=K+x|0;x=x+(P&M^C&(P^M))+(P>>>2^P>>>13^P>>>22^P<<30^P<<19^P<<10)|0;k=(A>>>7^A>>>18^A>>>3^A<<25^A<<14)+(v>>>17^v>>>19^v>>>10^v<<15^v<<13)+k+y|0;E=k+E+(K>>>6^K>>>11^K>>>25^K<<26^K<<21^K<<7)+(S^K&(D^S))+0xf40e3585|0;C=C+E|0;E=E+(x&P^M&(x^P))+(x>>>2^x>>>13^x>>>22^x<<30^x<<19^x<<10)|0;A=(e>>>7^e>>>18^e>>>3^e<<25^e<<14)+(_>>>17^_>>>19^_>>>10^_<<15^_<<13)+A+b|0;S=A+S+(C>>>6^C>>>11^C>>>25^C<<26^C<<21^C<<7)+(D^C&(K^D))+0x106aa070|0;M=M+S|0;S=S+(E&x^P&(E^x))+(E>>>2^E>>>13^E>>>22^E<<30^E<<19^E<<10)|0;e=(t>>>7^t>>>18^t>>>3^t<<25^t<<14)+(k>>>17^k>>>19^k>>>10^k<<15^k<<13)+e+m|0;D=e+D+(M>>>6^M>>>11^M>>>25^M<<26^M<<21^M<<7)+(K^M&(C^K))+0x19a4c116|0;P=P+D|0;D=D+(S&E^x&(S^E))+(S>>>2^S>>>13^S>>>22^S<<30^S<<19^S<<10)|0;t=(r>>>7^r>>>18^r>>>3^r<<25^r<<14)+(A>>>17^A>>>19^A>>>10^A<<15^A<<13)+t+g|0;K=t+K+(P>>>6^P>>>11^P>>>25^P<<26^P<<21^P<<7)+(C^P&(M^C))+0x1e376c08|0;x=x+K|0;K=K+(D&S^E&(D^S))+(D>>>2^D>>>13^D>>>22^D<<30^D<<19^D<<10)|0;r=(d>>>7^d>>>18^d>>>3^d<<25^d<<14)+(e>>>17^e>>>19^e>>>10^e<<15^e<<13)+r+w|0;C=r+C+(x>>>6^x>>>11^x>>>25^x<<26^x<<21^x<<7)+(M^x&(P^M))+0x2748774c|0;E=E+C|0;C=C+(K&D^S&(K^D))+(K>>>2^K>>>13^K>>>22^K<<30^K<<19^K<<10)|0;d=(f>>>7^f>>>18^f>>>3^f<<25^f<<14)+(t>>>17^t>>>19^t>>>10^t<<15^t<<13)+d+v|0;M=d+M+(E>>>6^E>>>11^E>>>25^E<<26^E<<21^E<<7)+(P^E&(x^P))+0x34b0bcb5|0;S=S+M|0;M=M+(C&K^D&(C^K))+(C>>>2^C>>>13^C>>>22^C<<30^C<<19^C<<10)|0;f=(l>>>7^l>>>18^l>>>3^l<<25^l<<14)+(r>>>17^r>>>19^r>>>10^r<<15^r<<13)+f+_|0;P=f+P+(S>>>6^S>>>11^S>>>25^S<<26^S<<21^S<<7)+(x^S&(E^x))+0x391c0cb3|0;D=D+P|0;P=P+(M&C^K&(M^C))+(M>>>2^M>>>13^M>>>22^M<<30^M<<19^M<<10)|0;l=(p>>>7^p>>>18^p>>>3^p<<25^p<<14)+(d>>>17^d>>>19^d>>>10^d<<15^d<<13)+l+k|0;x=l+x+(D>>>6^D>>>11^D>>>25^D<<26^D<<21^D<<7)+(E^D&(S^E))+0x4ed8aa4a|0;K=K+x|0;x=x+(P&M^C&(P^M))+(P>>>2^P>>>13^P>>>22^P<<30^P<<19^P<<10)|0;p=(y>>>7^y>>>18^y>>>3^y<<25^y<<14)+(f>>>17^f>>>19^f>>>10^f<<15^f<<13)+p+A|0;E=p+E+(K>>>6^K>>>11^K>>>25^K<<26^K<<21^K<<7)+(S^K&(D^S))+0x5b9cca4f|0;C=C+E|0;E=E+(x&P^M&(x^P))+(x>>>2^x>>>13^x>>>22^x<<30^x<<19^x<<10)|0;y=(b>>>7^b>>>18^b>>>3^b<<25^b<<14)+(l>>>17^l>>>19^l>>>10^l<<15^l<<13)+y+e|0;S=y+S+(C>>>6^C>>>11^C>>>25^C<<26^C<<21^C<<7)+(D^C&(K^D))+0x682e6ff3|0;M=M+S|0;S=S+(E&x^P&(E^x))+(E>>>2^E>>>13^E>>>22^E<<30^E<<19^E<<10)|0;b=(m>>>7^m>>>18^m>>>3^m<<25^m<<14)+(p>>>17^p>>>19^p>>>10^p<<15^p<<13)+b+t|0;D=b+D+(M>>>6^M>>>11^M>>>25^M<<26^M<<21^M<<7)+(K^M&(C^K))+0x748f82ee|0;P=P+D|0;D=D+(S&E^x&(S^E))+(S>>>2^S>>>13^S>>>22^S<<30^S<<19^S<<10)|0;m=(g>>>7^g>>>18^g>>>3^g<<25^g<<14)+(y>>>17^y>>>19^y>>>10^y<<15^y<<13)+m+r|0;K=m+K+(P>>>6^P>>>11^P>>>25^P<<26^P<<21^P<<7)+(C^P&(M^C))+0x78a5636f|0;x=x+K|0;K=K+(D&S^E&(D^S))+(D>>>2^D>>>13^D>>>22^D<<30^D<<19^D<<10)|0;g=(w>>>7^w>>>18^w>>>3^w<<25^w<<14)+(b>>>17^b>>>19^b>>>10^b<<15^b<<13)+g+d|0;C=g+C+(x>>>6^x>>>11^x>>>25^x<<26^x<<21^x<<7)+(M^x&(P^M))+0x84c87814|0;E=E+C|0;C=C+(K&D^S&(K^D))+(K>>>2^K>>>13^K>>>22^K<<30^K<<19^K<<10)|0;w=(v>>>7^v>>>18^v>>>3^v<<25^v<<14)+(m>>>17^m>>>19^m>>>10^m<<15^m<<13)+w+f|0;M=w+M+(E>>>6^E>>>11^E>>>25^E<<26^E<<21^E<<7)+(P^E&(x^P))+0x8cc70208|0;S=S+M|0;M=M+(C&K^D&(C^K))+(C>>>2^C>>>13^C>>>22^C<<30^C<<19^C<<10)|0;v=(_>>>7^_>>>18^_>>>3^_<<25^_<<14)+(g>>>17^g>>>19^g>>>10^g<<15^g<<13)+v+l|0;P=v+P+(S>>>6^S>>>11^S>>>25^S<<26^S<<21^S<<7)+(x^S&(E^x))+0x90befffa|0;D=D+P|0;P=P+(M&C^K&(M^C))+(M>>>2^M>>>13^M>>>22^M<<30^M<<19^M<<10)|0;_=(k>>>7^k>>>18^k>>>3^k<<25^k<<14)+(w>>>17^w>>>19^w>>>10^w<<15^w<<13)+_+p|0;x=_+x+(D>>>6^D>>>11^D>>>25^D<<26^D<<21^D<<7)+(E^D&(S^E))+0xa4506ceb|0;K=K+x|0;x=x+(P&M^C&(P^M))+(P>>>2^P>>>13^P>>>22^P<<30^P<<19^P<<10)|0;k=(A>>>7^A>>>18^A>>>3^A<<25^A<<14)+(v>>>17^v>>>19^v>>>10^v<<15^v<<13)+k+y|0;E=k+E+(K>>>6^K>>>11^K>>>25^K<<26^K<<21^K<<7)+(S^K&(D^S))+0xbef9a3f7|0;C=C+E|0;E=E+(x&P^M&(x^P))+(x>>>2^x>>>13^x>>>22^x<<30^x<<19^x<<10)|0;A=(e>>>7^e>>>18^e>>>3^e<<25^e<<14)+(_>>>17^_>>>19^_>>>10^_<<15^_<<13)+A+b|0;S=A+S+(C>>>6^C>>>11^C>>>25^C<<26^C<<21^C<<7)+(D^C&(K^D))+0xc67178f2|0;M=M+S|0;S=S+(E&x^P&(E^x))+(E>>>2^E>>>13^E>>>22^E<<30^E<<19^E<<10)|0;i=i+S|0;n=n+E|0;a=a+x|0;s=s+P|0;o=o+M|0;c=c+C|0;u=u+K|0;h=h+D|0;}function D(e){e=e|0;K(C[e|0]<<24|C[e|1]<<16|C[e|2]<<8|C[e|3],C[e|4]<<24|C[e|5]<<16|C[e|6]<<8|C[e|7],C[e|8]<<24|C[e|9]<<16|C[e|10]<<8|C[e|11],C[e|12]<<24|C[e|13]<<16|C[e|14]<<8|C[e|15],C[e|16]<<24|C[e|17]<<16|C[e|18]<<8|C[e|19],C[e|20]<<24|C[e|21]<<16|C[e|22]<<8|C[e|23],C[e|24]<<24|C[e|25]<<16|C[e|26]<<8|C[e|27],C[e|28]<<24|C[e|29]<<16|C[e|30]<<8|C[e|31],C[e|32]<<24|C[e|33]<<16|C[e|34]<<8|C[e|35],C[e|36]<<24|C[e|37]<<16|C[e|38]<<8|C[e|39],C[e|40]<<24|C[e|41]<<16|C[e|42]<<8|C[e|43],C[e|44]<<24|C[e|45]<<16|C[e|46]<<8|C[e|47],C[e|48]<<24|C[e|49]<<16|C[e|50]<<8|C[e|51],C[e|52]<<24|C[e|53]<<16|C[e|54]<<8|C[e|55],C[e|56]<<24|C[e|57]<<16|C[e|58]<<8|C[e|59],C[e|60]<<24|C[e|61]<<16|C[e|62]<<8|C[e|63]);}function R(e){e=e|0;C[e|0]=i>>>24;C[e|1]=i>>>16&255;C[e|2]=i>>>8&255;C[e|3]=i&255;C[e|4]=n>>>24;C[e|5]=n>>>16&255;C[e|6]=n>>>8&255;C[e|7]=n&255;C[e|8]=a>>>24;C[e|9]=a>>>16&255;C[e|10]=a>>>8&255;C[e|11]=a&255;C[e|12]=s>>>24;C[e|13]=s>>>16&255;C[e|14]=s>>>8&255;C[e|15]=s&255;C[e|16]=o>>>24;C[e|17]=o>>>16&255;C[e|18]=o>>>8&255;C[e|19]=o&255;C[e|20]=c>>>24;C[e|21]=c>>>16&255;C[e|22]=c>>>8&255;C[e|23]=c&255;C[e|24]=u>>>24;C[e|25]=u>>>16&255;C[e|26]=u>>>8&255;C[e|27]=u&255;C[e|28]=h>>>24;C[e|29]=h>>>16&255;C[e|30]=h>>>8&255;C[e|31]=h&255;}function I(){i=0x6a09e667;n=0xbb67ae85;a=0x3c6ef372;s=0xa54ff53a;o=0x510e527f;c=0x9b05688c;u=0x1f83d9ab;h=0x5be0cd19;d=f=0;}function U(e,t,r,l,p,y,b,m,g,w){e=e|0;t=t|0;r=r|0;l=l|0;p=p|0;y=y|0;b=b|0;m=m|0;g=g|0;w=w|0;i=e;n=t;a=r;s=l;o=p;c=y;u=b;h=m;d=g;f=w;}function B(e,t){e=e|0;t=t|0;var r=0;if(e&63)return -1;while((t|0)>=64){D(e);e=e+64|0;t=t-64|0;r=r+64|0;}d=d+r|0;if(d>>>0<r>>>0)f=f+1|0;return r|0}function T(e,t,r){e=e|0;t=t|0;r=r|0;var i=0,n=0;if(e&63)return -1;if(~r)if(r&31)return -1;if((t|0)>=64){i=B(e,t)|0;if((i|0)==-1)return -1;e=e+i|0;t=t-i|0;}i=i+t|0;d=d+t|0;if(d>>>0<t>>>0)f=f+1|0;C[e|t]=0x80;if((t|0)>=56){for(n=t+1|0;(n|0)<64;n=n+1|0)C[e|n]=0x00;D(e);t=0;C[e|0]=0;}for(n=t+1|0;(n|0)<59;n=n+1|0)C[e|n]=0;C[e|56]=f>>>21&255;C[e|57]=f>>>13&255;C[e|58]=f>>>5&255;C[e|59]=f<<3&255|d>>>29;C[e|60]=d>>>21&255;C[e|61]=d>>>13&255;C[e|62]=d>>>5&255;C[e|63]=d<<3&255;D(e);if(~r)R(r);return i|0}function z(){i=l;n=p;a=y;s=b;o=m;c=g;u=w;h=v;d=64;f=0;}function q(){i=_;n=k;a=A;s=S;o=E;c=x;u=P;h=M;d=64;f=0;}function F(e,t,r,C,D,R,U,B,T,z,q,F,O,N,L,j){e=e|0;t=t|0;r=r|0;C=C|0;D=D|0;R=R|0;U=U|0;B=B|0;T=T|0;z=z|0;q=q|0;F=F|0;O=O|0;N=N|0;L=L|0;j=j|0;I();K(e^0x5c5c5c5c,t^0x5c5c5c5c,r^0x5c5c5c5c,C^0x5c5c5c5c,D^0x5c5c5c5c,R^0x5c5c5c5c,U^0x5c5c5c5c,B^0x5c5c5c5c,T^0x5c5c5c5c,z^0x5c5c5c5c,q^0x5c5c5c5c,F^0x5c5c5c5c,O^0x5c5c5c5c,N^0x5c5c5c5c,L^0x5c5c5c5c,j^0x5c5c5c5c);_=i;k=n;A=a;S=s;E=o;x=c;P=u;M=h;I();K(e^0x36363636,t^0x36363636,r^0x36363636,C^0x36363636,D^0x36363636,R^0x36363636,U^0x36363636,B^0x36363636,T^0x36363636,z^0x36363636,q^0x36363636,F^0x36363636,O^0x36363636,N^0x36363636,L^0x36363636,j^0x36363636);l=i;p=n;y=a;b=s;m=o;g=c;w=u;v=h;d=64;f=0;}function O(e,t,r){e=e|0;t=t|0;r=r|0;var d=0,f=0,l=0,p=0,y=0,b=0,m=0,g=0,w=0;if(e&63)return -1;if(~r)if(r&31)return -1;w=T(e,t,-1)|0;d=i,f=n,l=a,p=s,y=o,b=c,m=u,g=h;q();K(d,f,l,p,y,b,m,g,0x80000000,0,0,0,0,0,0,768);if(~r)R(r);return w|0}function N(e,t,r,d,f){e=e|0;t=t|0;r=r|0;d=d|0;f=f|0;var l=0,p=0,y=0,b=0,m=0,g=0,w=0,v=0,_=0,k=0,A=0,S=0,E=0,x=0,P=0,M=0;if(e&63)return -1;if(~f)if(f&31)return -1;C[e+t|0]=r>>>24;C[e+t+1|0]=r>>>16&255;C[e+t+2|0]=r>>>8&255;C[e+t+3|0]=r&255;O(e,t+4|0,-1)|0;l=_=i,p=k=n,y=A=a,b=S=s,m=E=o,g=x=c,w=P=u,v=M=h;d=d-1|0;while((d|0)>0){z();K(_,k,A,S,E,x,P,M,0x80000000,0,0,0,0,0,0,768);_=i,k=n,A=a,S=s,E=o,x=c,P=u,M=h;q();K(_,k,A,S,E,x,P,M,0x80000000,0,0,0,0,0,0,768);_=i,k=n,A=a,S=s,E=o,x=c,P=u,M=h;l=l^i;p=p^n;y=y^a;b=b^s;m=m^o;g=g^c;w=w^u;v=v^h;d=d-1|0;}i=l;n=p;a=y;s=b;o=m;c=g;u=w;h=v;if(~f)R(f);return 0}return {reset:I,init:U,process:B,finish:T,hmac_reset:z,hmac_init:F,hmac_finish:O,pbkdf2_generate_block:N}}({Uint8Array},null,this.heap.buffer),this.reset()),{heap:this.heap,asm:this.asm}}release_asm(){void 0!==this.heap&&void 0!==this.asm&&($e.push(this.heap),Xe.push(this.asm)),this.heap=void 0,this.asm=void 0;}static bytes(e){return (new Je).process(e).finish().result}}Je.NAME="sha256";var Qe=et;function et(e,t){if(!e)throw Error(t||"Assertion failed")}et.equal=function(e,t,r){if(e!=t)throw Error(r||"Assertion failed: "+e+" != "+t)};var tt=void 0!==e?e:"undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof self?self:{};function rt(e,t){return e(t={exports:{}},t.exports),t.exports}var it=rt((function(e){e.exports="function"==typeof Object.create?function(e,t){e.super_=t,e.prototype=Object.create(t.prototype,{constructor:{value:e,enumerable:!1,writable:!0,configurable:!0}});}:function(e,t){e.super_=t;var r=function(){};r.prototype=t.prototype,e.prototype=new r,e.prototype.constructor=e;};}));function nt(e){return (e>>>24|e>>>8&65280|e<<8&16711680|(255&e)<<24)>>>0}function at(e){return 1===e.length?"0"+e:e}function st(e){return 7===e.length?"0"+e:6===e.length?"00"+e:5===e.length?"000"+e:4===e.length?"0000"+e:3===e.length?"00000"+e:2===e.length?"000000"+e:1===e.length?"0000000"+e:e}var ot={inherits:it,toArray:function(e,t){if(Array.isArray(e))return e.slice();if(!e)return [];var r=[];if("string"==typeof e)if(t){if("hex"===t)for((e=e.replace(/[^a-z0-9]+/gi,"")).length%2!=0&&(e="0"+e),i=0;i<e.length;i+=2)r.push(parseInt(e[i]+e[i+1],16));}else for(var i=0;i<e.length;i++){var n=e.charCodeAt(i),a=n>>8,s=255&n;a?r.push(a,s):r.push(s);}else for(i=0;i<e.length;i++)r[i]=0|e[i];return r},toHex:function(e){for(var t="",r=0;r<e.length;r++)t+=at(e[r].toString(16));return t},htonl:nt,toHex32:function(e,t){for(var r="",i=0;i<e.length;i++){var n=e[i];"little"===t&&(n=nt(n)),r+=st(n.toString(16));}return r},zero2:at,zero8:st,join32:function(e,t,r,i){var n=r-t;Qe(n%4==0);for(var a=Array(n/4),s=0,o=t;s<a.length;s++,o+=4){var c;c="big"===i?e[o]<<24|e[o+1]<<16|e[o+2]<<8|e[o+3]:e[o+3]<<24|e[o+2]<<16|e[o+1]<<8|e[o],a[s]=c>>>0;}return a},split32:function(e,t){for(var r=Array(4*e.length),i=0,n=0;i<e.length;i++,n+=4){var a=e[i];"big"===t?(r[n]=a>>>24,r[n+1]=a>>>16&255,r[n+2]=a>>>8&255,r[n+3]=255&a):(r[n+3]=a>>>24,r[n+2]=a>>>16&255,r[n+1]=a>>>8&255,r[n]=255&a);}return r},rotr32:function(e,t){return e>>>t|e<<32-t},rotl32:function(e,t){return e<<t|e>>>32-t},sum32:function(e,t){return e+t>>>0},sum32_3:function(e,t,r){return e+t+r>>>0},sum32_4:function(e,t,r,i){return e+t+r+i>>>0},sum32_5:function(e,t,r,i,n){return e+t+r+i+n>>>0},sum64:function(e,t,r,i){var n=e[t],a=i+e[t+1]>>>0,s=(a<i?1:0)+r+n;e[t]=s>>>0,e[t+1]=a;},sum64_hi:function(e,t,r,i){return (t+i>>>0<t?1:0)+e+r>>>0},sum64_lo:function(e,t,r,i){return t+i>>>0},sum64_4_hi:function(e,t,r,i,n,a,s,o){var c=0,u=t;return c+=(u=u+i>>>0)<t?1:0,c+=(u=u+a>>>0)<a?1:0,e+r+n+s+(c+=(u=u+o>>>0)<o?1:0)>>>0},sum64_4_lo:function(e,t,r,i,n,a,s,o){return t+i+a+o>>>0},sum64_5_hi:function(e,t,r,i,n,a,s,o,c,u){var h=0,d=t;return h+=(d=d+i>>>0)<t?1:0,h+=(d=d+a>>>0)<a?1:0,h+=(d=d+o>>>0)<o?1:0,e+r+n+s+c+(h+=(d=d+u>>>0)<u?1:0)>>>0},sum64_5_lo:function(e,t,r,i,n,a,s,o,c,u){return t+i+a+o+u>>>0},rotr64_hi:function(e,t,r){return (t<<32-r|e>>>r)>>>0},rotr64_lo:function(e,t,r){return (e<<32-r|t>>>r)>>>0},shr64_hi:function(e,t,r){return e>>>r},shr64_lo:function(e,t,r){return (e<<32-r|t>>>r)>>>0}};function ct(){this.pending=null,this.pendingTotal=0,this.blockSize=this.constructor.blockSize,this.outSize=this.constructor.outSize,this.hmacStrength=this.constructor.hmacStrength,this.padLength=this.constructor.padLength/8,this.endian="big",this._delta8=this.blockSize/8,this._delta32=this.blockSize/32;}var ut=ct;ct.prototype.update=function(e,t){if(e=ot.toArray(e,t),this.pending?this.pending=this.pending.concat(e):this.pending=e,this.pendingTotal+=e.length,this.pending.length>=this._delta8){var r=(e=this.pending).length%this._delta8;this.pending=e.slice(e.length-r,e.length),0===this.pending.length&&(this.pending=null),e=ot.join32(e,0,e.length-r,this.endian);for(var i=0;i<e.length;i+=this._delta32)this._update(e,i,i+this._delta32);}return this},ct.prototype.digest=function(e){return this.update(this._pad()),Qe(null===this.pending),this._digest(e)},ct.prototype._pad=function(){var e=this.pendingTotal,t=this._delta8,r=t-(e+this.padLength)%t,i=Array(r+this.padLength);i[0]=128;for(var n=1;n<r;n++)i[n]=0;if(e<<=3,"big"===this.endian){for(var a=8;a<this.padLength;a++)i[n++]=0;i[n++]=0,i[n++]=0,i[n++]=0,i[n++]=0,i[n++]=e>>>24&255,i[n++]=e>>>16&255,i[n++]=e>>>8&255,i[n++]=255&e;}else for(i[n++]=255&e,i[n++]=e>>>8&255,i[n++]=e>>>16&255,i[n++]=e>>>24&255,i[n++]=0,i[n++]=0,i[n++]=0,i[n++]=0,a=8;a<this.padLength;a++)i[n++]=0;return i};var ht={BlockHash:ut},dt=ot.rotr32;function ft(e,t,r){return e&t^~e&r}function lt(e,t,r){return e&t^e&r^t&r}function pt(e,t,r){return e^t^r}var yt={ft_1:function(e,t,r,i){return 0===e?ft(t,r,i):1===e||3===e?pt(t,r,i):2===e?lt(t,r,i):void 0},ch32:ft,maj32:lt,p32:pt,s0_256:function(e){return dt(e,2)^dt(e,13)^dt(e,22)},s1_256:function(e){return dt(e,6)^dt(e,11)^dt(e,25)},g0_256:function(e){return dt(e,7)^dt(e,18)^e>>>3},g1_256:function(e){return dt(e,17)^dt(e,19)^e>>>10}},bt=ot.sum32,mt=ot.sum32_4,gt=ot.sum32_5,wt=yt.ch32,vt=yt.maj32,_t=yt.s0_256,kt=yt.s1_256,At=yt.g0_256,St=yt.g1_256,Et=ht.BlockHash,xt=[1116352408,1899447441,3049323471,3921009573,961987163,1508970993,2453635748,2870763221,3624381080,310598401,607225278,1426881987,1925078388,2162078206,2614888103,3248222580,3835390401,4022224774,264347078,604807628,770255983,1249150122,1555081692,1996064986,2554220882,2821834349,2952996808,3210313671,3336571891,3584528711,113926993,338241895,666307205,773529912,1294757372,1396182291,1695183700,1986661051,2177026350,2456956037,2730485921,2820302411,3259730800,3345764771,3516065817,3600352804,4094571909,275423344,430227734,506948616,659060556,883997877,958139571,1322822218,1537002063,1747873779,1955562222,2024104815,2227730452,2361852424,2428436474,2756734187,3204031479,3329325298];function Pt(){if(!(this instanceof Pt))return new Pt;Et.call(this),this.h=[1779033703,3144134277,1013904242,2773480762,1359893119,2600822924,528734635,1541459225],this.k=xt,this.W=Array(64);}ot.inherits(Pt,Et);var Mt=Pt;function Ct(){if(!(this instanceof Ct))return new Ct;Mt.call(this),this.h=[3238371032,914150663,812702999,4144912697,4290775857,1750603025,1694076839,3204075428];}Pt.blockSize=512,Pt.outSize=256,Pt.hmacStrength=192,Pt.padLength=64,Pt.prototype._update=function(e,t){for(var r=this.W,i=0;i<16;i++)r[i]=e[t+i];for(;i<r.length;i++)r[i]=mt(St(r[i-2]),r[i-7],At(r[i-15]),r[i-16]);var n=this.h[0],a=this.h[1],s=this.h[2],o=this.h[3],c=this.h[4],u=this.h[5],h=this.h[6],d=this.h[7];for(Qe(this.k.length===r.length),i=0;i<r.length;i++){var f=gt(d,kt(c),wt(c,u,h),this.k[i],r[i]),l=bt(_t(n),vt(n,a,s));d=h,h=u,u=c,c=bt(o,f),o=s,s=a,a=n,n=bt(f,l);}this.h[0]=bt(this.h[0],n),this.h[1]=bt(this.h[1],a),this.h[2]=bt(this.h[2],s),this.h[3]=bt(this.h[3],o),this.h[4]=bt(this.h[4],c),this.h[5]=bt(this.h[5],u),this.h[6]=bt(this.h[6],h),this.h[7]=bt(this.h[7],d);},Pt.prototype._digest=function(e){return "hex"===e?ot.toHex32(this.h,"big"):ot.split32(this.h,"big")},ot.inherits(Ct,Mt);var Kt=Ct;Ct.blockSize=512,Ct.outSize=224,Ct.hmacStrength=192,Ct.padLength=64,Ct.prototype._digest=function(e){return "hex"===e?ot.toHex32(this.h.slice(0,7),"big"):ot.split32(this.h.slice(0,7),"big")};var Dt=ot.rotr64_hi,Rt=ot.rotr64_lo,It=ot.shr64_hi,Ut=ot.shr64_lo,Bt=ot.sum64,Tt=ot.sum64_hi,zt=ot.sum64_lo,qt=ot.sum64_4_hi,Ft=ot.sum64_4_lo,Ot=ot.sum64_5_hi,Nt=ot.sum64_5_lo,Lt=ht.BlockHash,jt=[1116352408,3609767458,1899447441,602891725,3049323471,3964484399,3921009573,2173295548,961987163,4081628472,1508970993,3053834265,2453635748,2937671579,2870763221,3664609560,3624381080,2734883394,310598401,1164996542,607225278,1323610764,1426881987,3590304994,1925078388,4068182383,2162078206,991336113,2614888103,633803317,3248222580,3479774868,3835390401,2666613458,4022224774,944711139,264347078,2341262773,604807628,2007800933,770255983,1495990901,1249150122,1856431235,1555081692,3175218132,1996064986,2198950837,2554220882,3999719339,2821834349,766784016,2952996808,2566594879,3210313671,3203337956,3336571891,1034457026,3584528711,2466948901,113926993,3758326383,338241895,168717936,666307205,1188179964,773529912,1546045734,1294757372,1522805485,1396182291,2643833823,1695183700,2343527390,1986661051,1014477480,2177026350,1206759142,2456956037,344077627,2730485921,1290863460,2820302411,3158454273,3259730800,3505952657,3345764771,106217008,3516065817,3606008344,3600352804,1432725776,4094571909,1467031594,275423344,851169720,430227734,3100823752,506948616,1363258195,659060556,3750685593,883997877,3785050280,958139571,3318307427,1322822218,3812723403,1537002063,2003034995,1747873779,3602036899,1955562222,1575990012,2024104815,1125592928,2227730452,2716904306,2361852424,442776044,2428436474,593698344,2756734187,3733110249,3204031479,2999351573,3329325298,3815920427,3391569614,3928383900,3515267271,566280711,3940187606,3454069534,4118630271,4000239992,116418474,1914138554,174292421,2731055270,289380356,3203993006,460393269,320620315,685471733,587496836,852142971,1086792851,1017036298,365543100,1126000580,2618297676,1288033470,3409855158,1501505948,4234509866,1607167915,987167468,1816402316,1246189591];function Wt(){if(!(this instanceof Wt))return new Wt;Lt.call(this),this.h=[1779033703,4089235720,3144134277,2227873595,1013904242,4271175723,2773480762,1595750129,1359893119,2917565137,2600822924,725511199,528734635,4215389547,1541459225,327033209],this.k=jt,this.W=Array(160);}ot.inherits(Wt,Lt);var Ht=Wt;function Gt(e,t,r,i,n){var a=e&r^~e&n;return a<0&&(a+=4294967296),a}function Vt(e,t,r,i,n,a){var s=t&i^~t&a;return s<0&&(s+=4294967296),s}function Zt(e,t,r,i,n){var a=e&r^e&n^r&n;return a<0&&(a+=4294967296),a}function Yt(e,t,r,i,n,a){var s=t&i^t&a^i&a;return s<0&&(s+=4294967296),s}function $t(e,t){var r=Dt(e,t,28)^Dt(t,e,2)^Dt(t,e,7);return r<0&&(r+=4294967296),r}function Xt(e,t){var r=Rt(e,t,28)^Rt(t,e,2)^Rt(t,e,7);return r<0&&(r+=4294967296),r}function Jt(e,t){var r=Dt(e,t,14)^Dt(e,t,18)^Dt(t,e,9);return r<0&&(r+=4294967296),r}function Qt(e,t){var r=Rt(e,t,14)^Rt(e,t,18)^Rt(t,e,9);return r<0&&(r+=4294967296),r}function er(e,t){var r=Dt(e,t,1)^Dt(e,t,8)^It(e,t,7);return r<0&&(r+=4294967296),r}function tr(e,t){var r=Rt(e,t,1)^Rt(e,t,8)^Ut(e,t,7);return r<0&&(r+=4294967296),r}function rr(e,t){var r=Dt(e,t,19)^Dt(t,e,29)^It(e,t,6);return r<0&&(r+=4294967296),r}function ir(e,t){var r=Rt(e,t,19)^Rt(t,e,29)^Ut(e,t,6);return r<0&&(r+=4294967296),r}function nr(){if(!(this instanceof nr))return new nr;Ht.call(this),this.h=[3418070365,3238371032,1654270250,914150663,2438529370,812702999,355462360,4144912697,1731405415,4290775857,2394180231,1750603025,3675008525,1694076839,1203062813,3204075428];}Wt.blockSize=1024,Wt.outSize=512,Wt.hmacStrength=192,Wt.padLength=128,Wt.prototype._prepareBlock=function(e,t){for(var r=this.W,i=0;i<32;i++)r[i]=e[t+i];for(;i<r.length;i+=2){var n=rr(r[i-4],r[i-3]),a=ir(r[i-4],r[i-3]),s=r[i-14],o=r[i-13],c=er(r[i-30],r[i-29]),u=tr(r[i-30],r[i-29]),h=r[i-32],d=r[i-31];r[i]=qt(n,a,s,o,c,u,h,d),r[i+1]=Ft(n,a,s,o,c,u,h,d);}},Wt.prototype._update=function(e,t){this._prepareBlock(e,t);var r=this.W,i=this.h[0],n=this.h[1],a=this.h[2],s=this.h[3],o=this.h[4],c=this.h[5],u=this.h[6],h=this.h[7],d=this.h[8],f=this.h[9],l=this.h[10],p=this.h[11],y=this.h[12],b=this.h[13],m=this.h[14],g=this.h[15];Qe(this.k.length===r.length);for(var w=0;w<r.length;w+=2){var v=m,_=g,k=Jt(d,f),A=Qt(d,f),S=Gt(d,f,l,p,y),E=Vt(d,f,l,p,y,b),x=this.k[w],P=this.k[w+1],M=r[w],C=r[w+1],K=Ot(v,_,k,A,S,E,x,P,M,C),D=Nt(v,_,k,A,S,E,x,P,M,C);v=$t(i,n),_=Xt(i,n),k=Zt(i,n,a,s,o),A=Yt(i,n,a,s,o,c);var R=Tt(v,_,k,A),I=zt(v,_,k,A);m=y,g=b,y=l,b=p,l=d,p=f,d=Tt(u,h,K,D),f=zt(h,h,K,D),u=o,h=c,o=a,c=s,a=i,s=n,i=Tt(K,D,R,I),n=zt(K,D,R,I);}Bt(this.h,0,i,n),Bt(this.h,2,a,s),Bt(this.h,4,o,c),Bt(this.h,6,u,h),Bt(this.h,8,d,f),Bt(this.h,10,l,p),Bt(this.h,12,y,b),Bt(this.h,14,m,g);},Wt.prototype._digest=function(e){return "hex"===e?ot.toHex32(this.h,"big"):ot.split32(this.h,"big")},ot.inherits(nr,Ht);var ar=nr;nr.blockSize=1024,nr.outSize=384,nr.hmacStrength=192,nr.padLength=128,nr.prototype._digest=function(e){return "hex"===e?ot.toHex32(this.h.slice(0,12),"big"):ot.split32(this.h.slice(0,12),"big")};var sr=ot.rotl32,or=ot.sum32,cr=ot.sum32_3,ur=ot.sum32_4,hr=ht.BlockHash;function dr(){if(!(this instanceof dr))return new dr;hr.call(this),this.h=[1732584193,4023233417,2562383102,271733878,3285377520],this.endian="little";}ot.inherits(dr,hr);var fr=dr;function lr(e,t,r,i){return e<=15?t^r^i:e<=31?t&r|~t&i:e<=47?(t|~r)^i:e<=63?t&i|r&~i:t^(r|~i)}function pr(e){return e<=15?0:e<=31?1518500249:e<=47?1859775393:e<=63?2400959708:2840853838}function yr(e){return e<=15?1352829926:e<=31?1548603684:e<=47?1836072691:e<=63?2053994217:0}dr.blockSize=512,dr.outSize=160,dr.hmacStrength=192,dr.padLength=64,dr.prototype._update=function(e,t){for(var r=this.h[0],i=this.h[1],n=this.h[2],a=this.h[3],s=this.h[4],o=r,c=i,u=n,h=a,d=s,f=0;f<80;f++){var l=or(sr(ur(r,lr(f,i,n,a),e[br[f]+t],pr(f)),gr[f]),s);r=s,s=a,a=sr(n,10),n=i,i=l,l=or(sr(ur(o,lr(79-f,c,u,h),e[mr[f]+t],yr(f)),wr[f]),d),o=d,d=h,h=sr(u,10),u=c,c=l;}l=cr(this.h[1],n,h),this.h[1]=cr(this.h[2],a,d),this.h[2]=cr(this.h[3],s,o),this.h[3]=cr(this.h[4],r,c),this.h[4]=cr(this.h[0],i,u),this.h[0]=l;},dr.prototype._digest=function(e){return "hex"===e?ot.toHex32(this.h,"little"):ot.split32(this.h,"little")};var br=[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,7,4,13,1,10,6,15,3,12,0,9,5,2,14,11,8,3,10,14,4,9,15,8,1,2,7,0,6,13,11,5,12,1,9,11,10,0,8,12,4,13,3,7,15,14,5,6,2,4,0,5,9,7,12,2,10,14,1,3,8,11,6,15,13],mr=[5,14,7,0,9,2,11,4,13,6,15,8,1,10,3,12,6,11,3,7,0,13,5,10,14,15,8,12,4,9,1,2,15,5,1,3,7,14,6,9,11,8,12,2,10,0,4,13,8,6,4,1,3,11,15,0,5,12,2,13,9,7,10,14,12,15,10,4,1,5,8,7,6,2,13,14,0,3,9,11],gr=[11,14,15,12,5,8,7,9,11,13,14,15,6,7,9,8,7,6,8,13,11,9,7,15,7,12,15,9,11,7,13,12,11,13,6,7,14,9,13,15,14,8,13,6,5,12,7,5,11,12,14,15,14,15,9,8,9,14,5,6,8,6,5,12,9,15,5,11,6,8,13,12,5,12,13,14,11,8,5,6],wr=[8,9,9,11,13,15,15,5,7,7,8,11,14,14,12,6,9,13,15,7,12,8,9,11,7,7,12,7,6,15,13,11,9,7,15,11,8,6,6,14,12,13,5,14,13,13,7,5,15,5,8,11,14,14,6,14,6,9,12,9,12,5,15,8,8,5,12,9,12,5,14,6,8,13,6,5,15,13,11,11],vr={ripemd160:fr};function _r(e,t){let r=e[0],i=e[1],n=e[2],a=e[3];r=Ar(r,i,n,a,t[0],7,-680876936),a=Ar(a,r,i,n,t[1],12,-389564586),n=Ar(n,a,r,i,t[2],17,606105819),i=Ar(i,n,a,r,t[3],22,-1044525330),r=Ar(r,i,n,a,t[4],7,-176418897),a=Ar(a,r,i,n,t[5],12,1200080426),n=Ar(n,a,r,i,t[6],17,-1473231341),i=Ar(i,n,a,r,t[7],22,-45705983),r=Ar(r,i,n,a,t[8],7,1770035416),a=Ar(a,r,i,n,t[9],12,-1958414417),n=Ar(n,a,r,i,t[10],17,-42063),i=Ar(i,n,a,r,t[11],22,-1990404162),r=Ar(r,i,n,a,t[12],7,1804603682),a=Ar(a,r,i,n,t[13],12,-40341101),n=Ar(n,a,r,i,t[14],17,-1502002290),i=Ar(i,n,a,r,t[15],22,1236535329),r=Sr(r,i,n,a,t[1],5,-165796510),a=Sr(a,r,i,n,t[6],9,-1069501632),n=Sr(n,a,r,i,t[11],14,643717713),i=Sr(i,n,a,r,t[0],20,-373897302),r=Sr(r,i,n,a,t[5],5,-701558691),a=Sr(a,r,i,n,t[10],9,38016083),n=Sr(n,a,r,i,t[15],14,-660478335),i=Sr(i,n,a,r,t[4],20,-405537848),r=Sr(r,i,n,a,t[9],5,568446438),a=Sr(a,r,i,n,t[14],9,-1019803690),n=Sr(n,a,r,i,t[3],14,-187363961),i=Sr(i,n,a,r,t[8],20,1163531501),r=Sr(r,i,n,a,t[13],5,-1444681467),a=Sr(a,r,i,n,t[2],9,-51403784),n=Sr(n,a,r,i,t[7],14,1735328473),i=Sr(i,n,a,r,t[12],20,-1926607734),r=Er(r,i,n,a,t[5],4,-378558),a=Er(a,r,i,n,t[8],11,-2022574463),n=Er(n,a,r,i,t[11],16,1839030562),i=Er(i,n,a,r,t[14],23,-35309556),r=Er(r,i,n,a,t[1],4,-1530992060),a=Er(a,r,i,n,t[4],11,1272893353),n=Er(n,a,r,i,t[7],16,-155497632),i=Er(i,n,a,r,t[10],23,-1094730640),r=Er(r,i,n,a,t[13],4,681279174),a=Er(a,r,i,n,t[0],11,-358537222),n=Er(n,a,r,i,t[3],16,-722521979),i=Er(i,n,a,r,t[6],23,76029189),r=Er(r,i,n,a,t[9],4,-640364487),a=Er(a,r,i,n,t[12],11,-421815835),n=Er(n,a,r,i,t[15],16,530742520),i=Er(i,n,a,r,t[2],23,-995338651),r=xr(r,i,n,a,t[0],6,-198630844),a=xr(a,r,i,n,t[7],10,1126891415),n=xr(n,a,r,i,t[14],15,-1416354905),i=xr(i,n,a,r,t[5],21,-57434055),r=xr(r,i,n,a,t[12],6,1700485571),a=xr(a,r,i,n,t[3],10,-1894986606),n=xr(n,a,r,i,t[10],15,-1051523),i=xr(i,n,a,r,t[1],21,-2054922799),r=xr(r,i,n,a,t[8],6,1873313359),a=xr(a,r,i,n,t[15],10,-30611744),n=xr(n,a,r,i,t[6],15,-1560198380),i=xr(i,n,a,r,t[13],21,1309151649),r=xr(r,i,n,a,t[4],6,-145523070),a=xr(a,r,i,n,t[11],10,-1120210379),n=xr(n,a,r,i,t[2],15,718787259),i=xr(i,n,a,r,t[9],21,-343485551),e[0]=Kr(r,e[0]),e[1]=Kr(i,e[1]),e[2]=Kr(n,e[2]),e[3]=Kr(a,e[3]);}function kr(e,t,r,i,n,a){return t=Kr(Kr(t,e),Kr(i,a)),Kr(t<<n|t>>>32-n,r)}function Ar(e,t,r,i,n,a,s){return kr(t&r|~t&i,e,t,n,a,s)}function Sr(e,t,r,i,n,a,s){return kr(t&i|r&~i,e,t,n,a,s)}function Er(e,t,r,i,n,a,s){return kr(t^r^i,e,t,n,a,s)}function xr(e,t,r,i,n,a,s){return kr(r^(t|~i),e,t,n,a,s)}function Pr(e){const t=[];let r;for(r=0;r<64;r+=4)t[r>>2]=e.charCodeAt(r)+(e.charCodeAt(r+1)<<8)+(e.charCodeAt(r+2)<<16)+(e.charCodeAt(r+3)<<24);return t}const Mr="0123456789abcdef".split("");function Cr(e){let t="",r=0;for(;r<4;r++)t+=Mr[e>>8*r+4&15]+Mr[e>>8*r&15];return t}function Kr(e,t){return e+t&4294967295}const Dr=Z.getWebCrypto(),Rr=Z.getNodeCrypto();function Ir(e){return async function(t){const r=Rr.createHash(e);return B(t,e=>{r.update(e);},()=>new Uint8Array(r.digest()))}}function Ur(e,t){return async function(r,i=ne){if(a(r)&&(r=await L(r)),!Z.isStream(r)&&Dr&&t&&r.length>=i.minBytesForWebCrypto)return new Uint8Array(await Dr.digest(t,r));const n=e();return B(r,e=>{n.update(e);},()=>new Uint8Array(n.digest()))}}function Br(e,t){return async function(r,i=ne){if(a(r)&&(r=await L(r)),Z.isStream(r)){const t=new e;return B(r,e=>{t.process(e);},()=>t.finish().result)}return Dr&&t&&r.length>=i.minBytesForWebCrypto?new Uint8Array(await Dr.digest(t,r)):e.bytes(r)}}let Tr;Tr=Rr?{md5:Ir("md5"),sha1:Ir("sha1"),sha224:Ir("sha224"),sha256:Ir("sha256"),sha384:Ir("sha384"),sha512:Ir("sha512"),ripemd:Ir("ripemd160")}:{md5:async function(e){const t=function(e){const t=e.length,r=[1732584193,-271733879,-1732584194,271733878];let i;for(i=64;i<=e.length;i+=64)_r(r,Pr(e.substring(i-64,i)));e=e.substring(i-64);const n=[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];for(i=0;i<e.length;i++)n[i>>2]|=e.charCodeAt(i)<<(i%4<<3);if(n[i>>2]|=128<<(i%4<<3),i>55)for(_r(r,n),i=0;i<16;i++)n[i]=0;return n[14]=8*t,_r(r,n),r}(Z.uint8ArrayToString(e));return Z.hexToUint8Array(function(e){for(let t=0;t<e.length;t++)e[t]=Cr(e[t]);return e.join("")}(t))},sha1:Br(Ye,-1===navigator.userAgent.indexOf("Edge")&&"SHA-1"),sha224:Ur(Kt),sha256:Br(Je,"SHA-256"),sha384:Ur(ar,"SHA-384"),sha512:Ur(Ht,"SHA-512"),ripemd:Ur(fr)};var zr={md5:Tr.md5,sha1:Tr.sha1,sha224:Tr.sha224,sha256:Tr.sha256,sha384:Tr.sha384,sha512:Tr.sha512,ripemd:Tr.ripemd,digest:function(e,t){switch(e){case 1:return this.md5(t);case 2:return this.sha1(t);case 3:return this.ripemd(t);case 8:return this.sha256(t);case 9:return this.sha384(t);case 10:return this.sha512(t);case 11:return this.sha224(t);default:throw Error("Invalid hash function.")}},getHashByteLength:function(e){switch(e){case 1:return 16;case 2:case 3:return 20;case 8:return 32;case 9:return 48;case 10:return 64;case 11:return 28;default:throw Error("Invalid hash algorithm.")}}};class qr{static encrypt(e,t,r){return new qr(t,r).encrypt(e)}static decrypt(e,t,r){return new qr(t,r).decrypt(e)}constructor(e,t,r){this.aes=r||new Ee(e,t,!0,"CFB"),delete this.aes.padding;}encrypt(e){return we(this.aes.AES_Encrypt_process(e),this.aes.AES_Encrypt_finish())}decrypt(e){return we(this.aes.AES_Decrypt_process(e),this.aes.AES_Decrypt_finish())}}const Fr=Z.getWebCrypto(),Or=Z.getNodeCrypto(),Nr=Or?Or.getCiphers():[],Lr={idea:Nr.includes("idea-cfb")?"idea-cfb":void 0,tripledes:Nr.includes("des-ede3-cfb")?"des-ede3-cfb":void 0,cast5:Nr.includes("cast5-cfb")?"cast5-cfb":void 0,blowfish:Nr.includes("bf-cfb")?"bf-cfb":void 0,aes128:Nr.includes("aes-128-cfb")?"aes-128-cfb":void 0,aes192:Nr.includes("aes-192-cfb")?"aes-192-cfb":void 0,aes256:Nr.includes("aes-256-cfb")?"aes-256-cfb":void 0};var jr=/*#__PURE__*/Object.freeze({__proto__:null,encrypt:async function(e,t,r,i,n){if(Z.getNodeCrypto()&&Lr[e])return function(e,t,r,i){const n=new Or.createCipheriv(Lr[e],t,i);return B(r,e=>new Uint8Array(n.update(e)))}(e,t,r,i);if("aes"===e.substr(0,3))return function(e,t,r,i,n){if(Z.getWebCrypto()&&24!==t.length&&!Z.isStream(r)&&r.length>=3e3*n.minBytesForWebCrypto)return async function(e,t,r,i){const n=await Fr.importKey("raw",t,{name:"AES-CBC"},!1,["encrypt"]),{blockSize:a}=We[e],s=Z.concatUint8Array([new Uint8Array(a),r]),o=new Uint8Array(await Fr.encrypt({name:"AES-CBC",iv:i},n,s)).subarray(0,r.length);return function(e,t){for(let r=0;r<e.length;r++)e[r]=e[r]^t[r];}(o,r),o}(e,t,r,i);const a=new qr(t,i);return B(r,e=>a.aes.AES_Encrypt_process(e),()=>a.aes.AES_Encrypt_finish())}(e,t,r,i,n);const a=new We[e](t),s=a.blockSize,o=i.slice();let c=new Uint8Array;const u=e=>{e&&(c=Z.concatUint8Array([c,e]));const t=new Uint8Array(c.length);let r,i=0;for(;e?c.length>=s:c.length;){const e=a.encrypt(o);for(r=0;r<s;r++)o[r]=c[r]^e[r],t[i++]=o[r];c=c.subarray(s);}return t.subarray(0,i)};return B(r,u,u)},decrypt:async function(e,t,r,i){if(Z.getNodeCrypto()&&Lr[e])return function(e,t,r,i){const n=new Or.createDecipheriv(Lr[e],t,i);return B(r,e=>new Uint8Array(n.update(e)))}(e,t,r,i);if("aes"===e.substr(0,3))return function(e,t,r,i){if(Z.isStream(r)){const e=new qr(t,i);return B(r,t=>e.aes.AES_Decrypt_process(t),()=>e.aes.AES_Decrypt_finish())}return qr.decrypt(r,t,i)}(0,t,r,i);const n=new We[e](t),a=n.blockSize;let s=i,o=new Uint8Array;const c=e=>{e&&(o=Z.concatUint8Array([o,e]));const t=new Uint8Array(o.length);let r,i=0;for(;e?o.length>=a:o.length;){const e=n.encrypt(s);for(s=o,r=0;r<a;r++)t[i++]=s[r]^e[r];o=o.subarray(a);}return t.subarray(0,i)};return B(r,c,c)}});class Wr{static encrypt(e,t,r){return new Wr(t,r).encrypt(e)}static decrypt(e,t,r){return new Wr(t,r).encrypt(e)}constructor(e,t,r){this.aes=r||new Ee(e,void 0,!1,"CTR"),delete this.aes.padding,this.AES_CTR_set_options(t);}encrypt(e){return we(this.aes.AES_Encrypt_process(e),this.aes.AES_Encrypt_finish())}decrypt(e){return we(this.aes.AES_Encrypt_process(e),this.aes.AES_Encrypt_finish())}AES_CTR_set_options(e,t,r){let{asm:i}=this.aes.acquire_asm();if(void 0!==r){if(r<8||r>48)throw new _e("illegal counter size");let e=Math.pow(2,r)-1;i.set_mask(0,0,e/4294967296|0,0|e);}else r=48,i.set_mask(0,0,65535,4294967295);if(void 0===e)throw Error("nonce is required");{let t=e.length;if(!t||t>16)throw new _e("illegal nonce size");let r=new DataView(new ArrayBuffer(16));new Uint8Array(r.buffer).set(e),i.set_nonce(r.getUint32(0),r.getUint32(4),r.getUint32(8),r.getUint32(12));}if(void 0!==t){if(t<0||t>=Math.pow(2,r))throw new _e("illegal counter value");i.set_counter(0,0,t/4294967296|0,0|t);}}}class Hr{static encrypt(e,t,r=!0,i){return new Hr(t,i,r).encrypt(e)}static decrypt(e,t,r=!0,i){return new Hr(t,i,r).decrypt(e)}constructor(e,t,r=!0,i){this.aes=i||new Ee(e,t,r,"CBC");}encrypt(e){return we(this.aes.AES_Encrypt_process(e),this.aes.AES_Encrypt_finish())}decrypt(e){return we(this.aes.AES_Decrypt_process(e),this.aes.AES_Decrypt_finish())}}const Gr=Z.getWebCrypto(),Vr=Z.getNodeCrypto();function Zr(e,t){const r=e.length-16;for(let i=0;i<16;i++)e[i+r]^=t[i];return e}const Yr=new Uint8Array(16);async function $r(e){const t=await async function(e){if(Z.getWebCrypto()&&24!==e.length)return e=await Gr.importKey("raw",e,{name:"AES-CBC",length:8*e.length},!1,["encrypt"]),async function(t){const r=await Gr.encrypt({name:"AES-CBC",iv:Yr,length:128},e,t);return new Uint8Array(r).subarray(0,r.byteLength-16)};if(Z.getNodeCrypto())return async function(t){const r=new Vr.createCipheriv("aes-"+8*e.length+"-cbc",e,Yr).update(t);return new Uint8Array(r)};return async function(t){return Hr.encrypt(t,e,!1,Yr)}}(e),r=Z.double(await t(Yr)),i=Z.double(r);return async function(e){return (await t(function(e,t,r){if(e.length&&e.length%16==0)return Zr(e,t);const i=new Uint8Array(e.length+(16-e.length%16));return i.set(e),i[e.length]=128,Zr(i,r)}(e,r,i))).subarray(-16)}}const Xr=Z.getWebCrypto(),Jr=Z.getNodeCrypto(),Qr=Z.getNodeBuffer(),ei=new Uint8Array(16),ti=new Uint8Array(16);ti[15]=1;const ri=new Uint8Array(16);async function ii(e){const t=await $r(e);return function(e,r){return t(Z.concatUint8Array([e,r]))}}async function ni(e){return Z.getWebCrypto()&&24!==e.length&&-1===navigator.userAgent.indexOf("Edge")?(e=await Xr.importKey("raw",e,{name:"AES-CTR",length:8*e.length},!1,["encrypt"]),async function(t,r){const i=await Xr.encrypt({name:"AES-CTR",counter:r,length:128},e,t);return new Uint8Array(i)}):Z.getNodeCrypto()?async function(t,r){const i=new Jr.createCipheriv("aes-"+8*e.length+"-ctr",e,r),n=Qr.concat([i.update(t),i.final()]);return new Uint8Array(n)}:async function(t,r){return Wr.encrypt(t,e,r)}}async function ai(e,t){if("aes"!==e.substr(0,3))throw Error("EAX mode supports only AES cipher");const[r,i]=await Promise.all([ii(t),ni(t)]);return {encrypt:async function(e,t,n){const[a,s]=await Promise.all([r(ei,t),r(ti,n)]),o=await i(e,a),c=await r(ri,o);for(let e=0;e<16;e++)c[e]^=s[e]^a[e];return Z.concatUint8Array([o,c])},decrypt:async function(e,t,n){if(e.length<16)throw Error("Invalid EAX ciphertext");const a=e.subarray(0,-16),s=e.subarray(-16),[o,c,u]=await Promise.all([r(ei,t),r(ti,n),r(ri,a)]),h=u;for(let e=0;e<16;e++)h[e]^=c[e]^o[e];if(!Z.equalsUint8Array(s,h))throw Error("Authentication tag mismatch");return await i(a,o)}}}ri[15]=2,ai.getNonce=function(e,t){const r=e.slice();for(let e=0;e<t.length;e++)r[8+e]^=t[e];return r},ai.blockLength=16,ai.ivLength=16,ai.tagLength=16;function si(e){let t=0;for(let r=1;0==(e&r);r<<=1)t++;return t}function oi(e,t){for(let r=0;r<e.length;r++)e[r]^=t[r];return e}function ci(e,t){return oi(e.slice(),t)}const ui=new Uint8Array(16),hi=new Uint8Array([1]);async function di(e,t){let r,i,n,a=0;function s(e,t,i,s){const o=t.length/16|0;!function(e,t){const r=Z.nbits(Math.max(e.length,t.length)/16|0)-1;for(let e=a+1;e<=r;e++)n[e]=Z.double(n[e-1]);a=r;}(t,s);const c=Z.concatUint8Array([ui.subarray(0,15-i.length),hi,i]),u=63&c[15];c[15]&=192;const h=r(c),d=Z.concatUint8Array([h,ci(h.subarray(0,8),h.subarray(1,9))]),f=Z.shiftRight(d.subarray(0+(u>>3),17+(u>>3)),8-(7&u)).subarray(1),l=new Uint8Array(16),p=new Uint8Array(t.length+16);let y,b=0;for(y=0;y<o;y++)oi(f,n[si(y+1)]),p.set(oi(e(ci(f,t)),f),b),oi(l,e===r?t:p.subarray(b)),t=t.subarray(16),b+=16;if(t.length){oi(f,n.x);const i=r(f);p.set(ci(t,i),b);const a=new Uint8Array(16);a.set(e===r?t:p.subarray(b,-16),0),a[t.length]=128,oi(l,a),b+=t.length;}const m=oi(r(oi(oi(l,f),n.$)),function(e){if(!e.length)return ui;const t=e.length/16|0,i=new Uint8Array(16),a=new Uint8Array(16);for(let s=0;s<t;s++)oi(i,n[si(s+1)]),oi(a,r(ci(i,e))),e=e.subarray(16);if(e.length){oi(i,n.x);const t=new Uint8Array(16);t.set(e,0),t[e.length]=128,oi(t,i),oi(a,r(t));}return a}(s));return p.set(m,b),p}return function(e,t){const a=new We[e](t);r=a.encrypt.bind(a),i=a.decrypt.bind(a);const s=r(ui),o=Z.double(s);n=[],n[0]=Z.double(o),n.x=s,n.$=o;}(e,t),{encrypt:async function(e,t,i){return s(r,e,t,i)},decrypt:async function(e,t,r){if(e.length<16)throw Error("Invalid OCB ciphertext");const n=e.subarray(-16);e=e.subarray(0,-16);const a=s(i,e,t,r);if(Z.equalsUint8Array(n,a.subarray(-16)))return a.subarray(0,-16);throw Error("Authentication tag mismatch")}}}di.getNonce=function(e,t){const r=e.slice();for(let e=0;e<t.length;e++)r[7+e]^=t[e];return r},di.blockLength=16,di.ivLength=15,di.tagLength=16;class fi{constructor(e,t,r,i=16,n){this.tagSize=i,this.gamma0=0,this.counter=1,this.aes=n||new Ee(e,void 0,!1,"CTR");let{asm:a,heap:s}=this.aes.acquire_asm();if(a.gcm_init(),this.tagSize<4||this.tagSize>16)throw new _e("illegal tagSize value");const o=t.length||0,c=new Uint8Array(16);12!==o?(this._gcm_mac_process(t),s[0]=0,s[1]=0,s[2]=0,s[3]=0,s[4]=0,s[5]=0,s[6]=0,s[7]=0,s[8]=0,s[9]=0,s[10]=0,s[11]=o>>>29,s[12]=o>>>21&255,s[13]=o>>>13&255,s[14]=o>>>5&255,s[15]=o<<3&255,a.mac(ye.MAC.GCM,ye.HEAP_DATA,16),a.get_iv(ye.HEAP_DATA),a.set_iv(0,0,0,0),c.set(s.subarray(0,16))):(c.set(t),c[15]=1);const u=new DataView(c.buffer);if(this.gamma0=u.getUint32(12),a.set_nonce(u.getUint32(0),u.getUint32(4),u.getUint32(8),0),a.set_mask(0,0,0,4294967295),void 0!==r){if(r.length>68719476704)throw new _e("illegal adata length");r.length?(this.adata=r,this._gcm_mac_process(r)):this.adata=void 0;}else this.adata=void 0;if(this.counter<1||this.counter>4294967295)throw new RangeError("counter must be a positive 32-bit integer");a.set_counter(0,0,0,this.gamma0+this.counter|0);}static encrypt(e,t,r,i,n){return new fi(t,r,i,n).encrypt(e)}static decrypt(e,t,r,i,n){return new fi(t,r,i,n).decrypt(e)}encrypt(e){return this.AES_GCM_encrypt(e)}decrypt(e){return this.AES_GCM_decrypt(e)}AES_GCM_Encrypt_process(e){let t=0,r=e.length||0,{asm:i,heap:n}=this.aes.acquire_asm(),a=this.counter,s=this.aes.pos,o=this.aes.len,c=0,u=o+r&-16,h=0;if((a-1<<4)+o+r>68719476704)throw new RangeError("counter overflow");const d=new Uint8Array(u);for(;r>0;)h=ge(n,s+o,e,t,r),o+=h,t+=h,r-=h,h=i.cipher(ye.ENC.CTR,ye.HEAP_DATA+s,o),h=i.mac(ye.MAC.GCM,ye.HEAP_DATA+s,h),h&&d.set(n.subarray(s,s+h),c),a+=h>>>4,c+=h,h<o?(s+=h,o-=h):(s=0,o=0);return this.counter=a,this.aes.pos=s,this.aes.len=o,d}AES_GCM_Encrypt_finish(){let{asm:e,heap:t}=this.aes.acquire_asm(),r=this.counter,i=this.tagSize,n=this.adata,a=this.aes.pos,s=this.aes.len;const o=new Uint8Array(s+i);e.cipher(ye.ENC.CTR,ye.HEAP_DATA+a,s+15&-16),s&&o.set(t.subarray(a,a+s));let c=s;for(;15&c;c++)t[a+c]=0;e.mac(ye.MAC.GCM,ye.HEAP_DATA+a,c);const u=void 0!==n?n.length:0,h=(r-1<<4)+s;return t[0]=0,t[1]=0,t[2]=0,t[3]=u>>>29,t[4]=u>>>21,t[5]=u>>>13&255,t[6]=u>>>5&255,t[7]=u<<3&255,t[8]=t[9]=t[10]=0,t[11]=h>>>29,t[12]=h>>>21&255,t[13]=h>>>13&255,t[14]=h>>>5&255,t[15]=h<<3&255,e.mac(ye.MAC.GCM,ye.HEAP_DATA,16),e.get_iv(ye.HEAP_DATA),e.set_counter(0,0,0,this.gamma0),e.cipher(ye.ENC.CTR,ye.HEAP_DATA,16),o.set(t.subarray(0,i),s),this.counter=1,this.aes.pos=0,this.aes.len=0,o}AES_GCM_Decrypt_process(e){let t=0,r=e.length||0,{asm:i,heap:n}=this.aes.acquire_asm(),a=this.counter,s=this.tagSize,o=this.aes.pos,c=this.aes.len,u=0,h=c+r>s?c+r-s&-16:0,d=c+r-h,f=0;if((a-1<<4)+c+r>68719476704)throw new RangeError("counter overflow");const l=new Uint8Array(h);for(;r>d;)f=ge(n,o+c,e,t,r-d),c+=f,t+=f,r-=f,f=i.mac(ye.MAC.GCM,ye.HEAP_DATA+o,f),f=i.cipher(ye.DEC.CTR,ye.HEAP_DATA+o,f),f&&l.set(n.subarray(o,o+f),u),a+=f>>>4,u+=f,o=0,c=0;return r>0&&(c+=ge(n,0,e,t,r)),this.counter=a,this.aes.pos=o,this.aes.len=c,l}AES_GCM_Decrypt_finish(){let{asm:e,heap:t}=this.aes.acquire_asm(),r=this.tagSize,i=this.adata,n=this.counter,a=this.aes.pos,s=this.aes.len,o=s-r;if(s<r)throw new ve("authentication tag not found");const c=new Uint8Array(o),u=new Uint8Array(t.subarray(a+o,a+s));let h=o;for(;15&h;h++)t[a+h]=0;e.mac(ye.MAC.GCM,ye.HEAP_DATA+a,h),e.cipher(ye.DEC.CTR,ye.HEAP_DATA+a,h),o&&c.set(t.subarray(a,a+o));const d=void 0!==i?i.length:0,f=(n-1<<4)+s-r;t[0]=0,t[1]=0,t[2]=0,t[3]=d>>>29,t[4]=d>>>21,t[5]=d>>>13&255,t[6]=d>>>5&255,t[7]=d<<3&255,t[8]=t[9]=t[10]=0,t[11]=f>>>29,t[12]=f>>>21&255,t[13]=f>>>13&255,t[14]=f>>>5&255,t[15]=f<<3&255,e.mac(ye.MAC.GCM,ye.HEAP_DATA,16),e.get_iv(ye.HEAP_DATA),e.set_counter(0,0,0,this.gamma0),e.cipher(ye.ENC.CTR,ye.HEAP_DATA,16);let l=0;for(let e=0;e<r;++e)l|=u[e]^t[e];if(l)throw new ke("data integrity check failed");return this.counter=1,this.aes.pos=0,this.aes.len=0,c}AES_GCM_decrypt(e){const t=this.AES_GCM_Decrypt_process(e),r=this.AES_GCM_Decrypt_finish(),i=new Uint8Array(t.length+r.length);return t.length&&i.set(t),r.length&&i.set(r,t.length),i}AES_GCM_encrypt(e){const t=this.AES_GCM_Encrypt_process(e),r=this.AES_GCM_Encrypt_finish(),i=new Uint8Array(t.length+r.length);return t.length&&i.set(t),r.length&&i.set(r,t.length),i}_gcm_mac_process(e){let{asm:t,heap:r}=this.aes.acquire_asm(),i=0,n=e.length||0,a=0;for(;n>0;){for(a=ge(r,0,e,i,n),i+=a,n-=a;15&a;)r[a++]=0;t.mac(ye.MAC.GCM,ye.HEAP_DATA,a);}}}const li=Z.getWebCrypto(),pi=Z.getNodeCrypto(),yi=Z.getNodeBuffer();async function bi(e,t){if("aes"!==e.substr(0,3))throw Error("GCM mode supports only AES cipher");if(Z.getWebCrypto()&&24!==t.length){const e=await li.importKey("raw",t,{name:"AES-GCM"},!1,["encrypt","decrypt"]);return {encrypt:async function(r,i,n=new Uint8Array){if(!r.length||!n.length&&-1!==navigator.userAgent.indexOf("Edge"))return fi.encrypt(r,t,i,n);const a=await li.encrypt({name:"AES-GCM",iv:i,additionalData:n,tagLength:128},e,r);return new Uint8Array(a)},decrypt:async function(r,i,n=new Uint8Array){if(16===r.length||!n.length&&-1!==navigator.userAgent.indexOf("Edge"))return fi.decrypt(r,t,i,n);const a=await li.decrypt({name:"AES-GCM",iv:i,additionalData:n,tagLength:128},e,r);return new Uint8Array(a)}}}return Z.getNodeCrypto()?{encrypt:async function(e,r,i=new Uint8Array){const n=new pi.createCipheriv("aes-"+8*t.length+"-gcm",t,r);n.setAAD(i);const a=yi.concat([n.update(e),n.final(),n.getAuthTag()]);return new Uint8Array(a)},decrypt:async function(e,r,i=new Uint8Array){const n=new pi.createDecipheriv("aes-"+8*t.length+"-gcm",t,r);n.setAAD(i),n.setAuthTag(e.slice(e.length-16,e.length));const a=yi.concat([n.update(e.slice(0,e.length-16)),n.final()]);return new Uint8Array(a)}}:{encrypt:async function(e,r,i){return fi.encrypt(e,t,r,i)},decrypt:async function(e,r,i){return fi.decrypt(e,t,r,i)}}}bi.getNonce=function(e,t){const r=e.slice();for(let e=0;e<t.length;e++)r[4+e]^=t[e];return r},bi.blockLength=16,bi.ivLength=12,bi.tagLength=16;var mi={cfb:jr,gcm:bi,experimentalGCM:bi,eax:ai,ocb:di},gi=rt((function(e){!function(e){var t=function(e){var t,r=new Float64Array(16);if(e)for(t=0;t<e.length;t++)r[t]=e[t];return r},r=function(){throw Error("no PRNG")},i=new Uint8Array(32);i[0]=9;var n=t(),a=t([1]),s=t([56129,1]),o=t([30883,4953,19914,30187,55467,16705,2637,112,59544,30585,16505,36039,65139,11119,27886,20995]),c=t([61785,9906,39828,60374,45398,33411,5274,224,53552,61171,33010,6542,64743,22239,55772,9222]),u=t([54554,36645,11616,51542,42930,38181,51040,26924,56412,64982,57905,49316,21502,52590,14035,8553]),h=t([26200,26214,26214,26214,26214,26214,26214,26214,26214,26214,26214,26214,26214,26214,26214,26214]),d=t([41136,18958,6951,50414,58488,44335,6150,12099,55207,15867,153,11085,57099,20417,9344,11139]);function f(e,t,r,i){return function(e,t,r,i,n){var a,s=0;for(a=0;a<n;a++)s|=e[t+a]^r[i+a];return (1&s-1>>>8)-1}(e,t,r,i,32)}function l(e,t){var r;for(r=0;r<16;r++)e[r]=0|t[r];}function p(e){var t,r,i=1;for(t=0;t<16;t++)r=e[t]+i+65535,i=Math.floor(r/65536),e[t]=r-65536*i;e[0]+=i-1+37*(i-1);}function y(e,t,r){for(var i,n=~(r-1),a=0;a<16;a++)i=n&(e[a]^t[a]),e[a]^=i,t[a]^=i;}function b(e,r){var i,n,a,s=t(),o=t();for(i=0;i<16;i++)o[i]=r[i];for(p(o),p(o),p(o),n=0;n<2;n++){for(s[0]=o[0]-65517,i=1;i<15;i++)s[i]=o[i]-65535-(s[i-1]>>16&1),s[i-1]&=65535;s[15]=o[15]-32767-(s[14]>>16&1),a=s[15]>>16&1,s[14]&=65535,y(o,s,1-a);}for(i=0;i<16;i++)e[2*i]=255&o[i],e[2*i+1]=o[i]>>8;}function m(e,t){var r=new Uint8Array(32),i=new Uint8Array(32);return b(r,e),b(i,t),f(r,0,i,0)}function g(e){var t=new Uint8Array(32);return b(t,e),1&t[0]}function w(e,t){var r;for(r=0;r<16;r++)e[r]=t[2*r]+(t[2*r+1]<<8);e[15]&=32767;}function v(e,t,r){for(var i=0;i<16;i++)e[i]=t[i]+r[i];}function _(e,t,r){for(var i=0;i<16;i++)e[i]=t[i]-r[i];}function k(e,t,r){var i,n,a=0,s=0,o=0,c=0,u=0,h=0,d=0,f=0,l=0,p=0,y=0,b=0,m=0,g=0,w=0,v=0,_=0,k=0,A=0,S=0,E=0,x=0,P=0,M=0,C=0,K=0,D=0,R=0,I=0,U=0,B=0,T=r[0],z=r[1],q=r[2],F=r[3],O=r[4],N=r[5],L=r[6],j=r[7],W=r[8],H=r[9],G=r[10],V=r[11],Z=r[12],Y=r[13],$=r[14],X=r[15];a+=(i=t[0])*T,s+=i*z,o+=i*q,c+=i*F,u+=i*O,h+=i*N,d+=i*L,f+=i*j,l+=i*W,p+=i*H,y+=i*G,b+=i*V,m+=i*Z,g+=i*Y,w+=i*$,v+=i*X,s+=(i=t[1])*T,o+=i*z,c+=i*q,u+=i*F,h+=i*O,d+=i*N,f+=i*L,l+=i*j,p+=i*W,y+=i*H,b+=i*G,m+=i*V,g+=i*Z,w+=i*Y,v+=i*$,_+=i*X,o+=(i=t[2])*T,c+=i*z,u+=i*q,h+=i*F,d+=i*O,f+=i*N,l+=i*L,p+=i*j,y+=i*W,b+=i*H,m+=i*G,g+=i*V,w+=i*Z,v+=i*Y,_+=i*$,k+=i*X,c+=(i=t[3])*T,u+=i*z,h+=i*q,d+=i*F,f+=i*O,l+=i*N,p+=i*L,y+=i*j,b+=i*W,m+=i*H,g+=i*G,w+=i*V,v+=i*Z,_+=i*Y,k+=i*$,A+=i*X,u+=(i=t[4])*T,h+=i*z,d+=i*q,f+=i*F,l+=i*O,p+=i*N,y+=i*L,b+=i*j,m+=i*W,g+=i*H,w+=i*G,v+=i*V,_+=i*Z,k+=i*Y,A+=i*$,S+=i*X,h+=(i=t[5])*T,d+=i*z,f+=i*q,l+=i*F,p+=i*O,y+=i*N,b+=i*L,m+=i*j,g+=i*W,w+=i*H,v+=i*G,_+=i*V,k+=i*Z,A+=i*Y,S+=i*$,E+=i*X,d+=(i=t[6])*T,f+=i*z,l+=i*q,p+=i*F,y+=i*O,b+=i*N,m+=i*L,g+=i*j,w+=i*W,v+=i*H,_+=i*G,k+=i*V,A+=i*Z,S+=i*Y,E+=i*$,x+=i*X,f+=(i=t[7])*T,l+=i*z,p+=i*q,y+=i*F,b+=i*O,m+=i*N,g+=i*L,w+=i*j,v+=i*W,_+=i*H,k+=i*G,A+=i*V,S+=i*Z,E+=i*Y,x+=i*$,P+=i*X,l+=(i=t[8])*T,p+=i*z,y+=i*q,b+=i*F,m+=i*O,g+=i*N,w+=i*L,v+=i*j,_+=i*W,k+=i*H,A+=i*G,S+=i*V,E+=i*Z,x+=i*Y,P+=i*$,M+=i*X,p+=(i=t[9])*T,y+=i*z,b+=i*q,m+=i*F,g+=i*O,w+=i*N,v+=i*L,_+=i*j,k+=i*W,A+=i*H,S+=i*G,E+=i*V,x+=i*Z,P+=i*Y,M+=i*$,C+=i*X,y+=(i=t[10])*T,b+=i*z,m+=i*q,g+=i*F,w+=i*O,v+=i*N,_+=i*L,k+=i*j,A+=i*W,S+=i*H,E+=i*G,x+=i*V,P+=i*Z,M+=i*Y,C+=i*$,K+=i*X,b+=(i=t[11])*T,m+=i*z,g+=i*q,w+=i*F,v+=i*O,_+=i*N,k+=i*L,A+=i*j,S+=i*W,E+=i*H,x+=i*G,P+=i*V,M+=i*Z,C+=i*Y,K+=i*$,D+=i*X,m+=(i=t[12])*T,g+=i*z,w+=i*q,v+=i*F,_+=i*O,k+=i*N,A+=i*L,S+=i*j,E+=i*W,x+=i*H,P+=i*G,M+=i*V,C+=i*Z,K+=i*Y,D+=i*$,R+=i*X,g+=(i=t[13])*T,w+=i*z,v+=i*q,_+=i*F,k+=i*O,A+=i*N,S+=i*L,E+=i*j,x+=i*W,P+=i*H,M+=i*G,C+=i*V,K+=i*Z,D+=i*Y,R+=i*$,I+=i*X,w+=(i=t[14])*T,v+=i*z,_+=i*q,k+=i*F,A+=i*O,S+=i*N,E+=i*L,x+=i*j,P+=i*W,M+=i*H,C+=i*G,K+=i*V,D+=i*Z,R+=i*Y,I+=i*$,U+=i*X,v+=(i=t[15])*T,s+=38*(k+=i*q),o+=38*(A+=i*F),c+=38*(S+=i*O),u+=38*(E+=i*N),h+=38*(x+=i*L),d+=38*(P+=i*j),f+=38*(M+=i*W),l+=38*(C+=i*H),p+=38*(K+=i*G),y+=38*(D+=i*V),b+=38*(R+=i*Z),m+=38*(I+=i*Y),g+=38*(U+=i*$),w+=38*(B+=i*X),a=(i=(a+=38*(_+=i*z))+(n=1)+65535)-65536*(n=Math.floor(i/65536)),s=(i=s+n+65535)-65536*(n=Math.floor(i/65536)),o=(i=o+n+65535)-65536*(n=Math.floor(i/65536)),c=(i=c+n+65535)-65536*(n=Math.floor(i/65536)),u=(i=u+n+65535)-65536*(n=Math.floor(i/65536)),h=(i=h+n+65535)-65536*(n=Math.floor(i/65536)),d=(i=d+n+65535)-65536*(n=Math.floor(i/65536)),f=(i=f+n+65535)-65536*(n=Math.floor(i/65536)),l=(i=l+n+65535)-65536*(n=Math.floor(i/65536)),p=(i=p+n+65535)-65536*(n=Math.floor(i/65536)),y=(i=y+n+65535)-65536*(n=Math.floor(i/65536)),b=(i=b+n+65535)-65536*(n=Math.floor(i/65536)),m=(i=m+n+65535)-65536*(n=Math.floor(i/65536)),g=(i=g+n+65535)-65536*(n=Math.floor(i/65536)),w=(i=w+n+65535)-65536*(n=Math.floor(i/65536)),v=(i=v+n+65535)-65536*(n=Math.floor(i/65536)),a=(i=(a+=n-1+37*(n-1))+(n=1)+65535)-65536*(n=Math.floor(i/65536)),s=(i=s+n+65535)-65536*(n=Math.floor(i/65536)),o=(i=o+n+65535)-65536*(n=Math.floor(i/65536)),c=(i=c+n+65535)-65536*(n=Math.floor(i/65536)),u=(i=u+n+65535)-65536*(n=Math.floor(i/65536)),h=(i=h+n+65535)-65536*(n=Math.floor(i/65536)),d=(i=d+n+65535)-65536*(n=Math.floor(i/65536)),f=(i=f+n+65535)-65536*(n=Math.floor(i/65536)),l=(i=l+n+65535)-65536*(n=Math.floor(i/65536)),p=(i=p+n+65535)-65536*(n=Math.floor(i/65536)),y=(i=y+n+65535)-65536*(n=Math.floor(i/65536)),b=(i=b+n+65535)-65536*(n=Math.floor(i/65536)),m=(i=m+n+65535)-65536*(n=Math.floor(i/65536)),g=(i=g+n+65535)-65536*(n=Math.floor(i/65536)),w=(i=w+n+65535)-65536*(n=Math.floor(i/65536)),v=(i=v+n+65535)-65536*(n=Math.floor(i/65536)),a+=n-1+37*(n-1),e[0]=a,e[1]=s,e[2]=o,e[3]=c,e[4]=u,e[5]=h,e[6]=d,e[7]=f,e[8]=l,e[9]=p,e[10]=y,e[11]=b,e[12]=m,e[13]=g,e[14]=w,e[15]=v;}function A(e,t){k(e,t,t);}function S(e,r){var i,n=t();for(i=0;i<16;i++)n[i]=r[i];for(i=253;i>=0;i--)A(n,n),2!==i&&4!==i&&k(n,n,r);for(i=0;i<16;i++)e[i]=n[i];}function E(e,r,i){var n,a,o=new Uint8Array(32),c=new Float64Array(80),u=t(),h=t(),d=t(),f=t(),l=t(),p=t();for(a=0;a<31;a++)o[a]=r[a];for(o[31]=127&r[31]|64,o[0]&=248,w(c,i),a=0;a<16;a++)h[a]=c[a],f[a]=u[a]=d[a]=0;for(u[0]=f[0]=1,a=254;a>=0;--a)y(u,h,n=o[a>>>3]>>>(7&a)&1),y(d,f,n),v(l,u,d),_(u,u,d),v(d,h,f),_(h,h,f),A(f,l),A(p,u),k(u,d,u),k(d,h,l),v(l,u,d),_(u,u,d),A(h,u),_(d,f,p),k(u,d,s),v(u,u,f),k(d,d,u),k(u,f,p),k(f,h,c),A(h,l),y(u,h,n),y(d,f,n);for(a=0;a<16;a++)c[a+16]=u[a],c[a+32]=d[a],c[a+48]=h[a],c[a+64]=f[a];var m=c.subarray(32),g=c.subarray(16);return S(m,m),k(g,g,m),b(e,g),0}function x(e,t){return E(e,t,i)}function P(e,r){var i=t(),n=t(),a=t(),s=t(),o=t(),u=t(),h=t(),d=t(),f=t();_(i,e[1],e[0]),_(f,r[1],r[0]),k(i,i,f),v(n,e[0],e[1]),v(f,r[0],r[1]),k(n,n,f),k(a,e[3],r[3]),k(a,a,c),k(s,e[2],r[2]),v(s,s,s),_(o,n,i),_(u,s,a),v(h,s,a),v(d,n,i),k(e[0],o,u),k(e[1],d,h),k(e[2],h,u),k(e[3],o,d);}function M(e,t,r){var i;for(i=0;i<4;i++)y(e[i],t[i],r);}function C(e,r){var i=t(),n=t(),a=t();S(a,r[2]),k(i,r[0],a),k(n,r[1],a),b(e,n),e[31]^=g(i)<<7;}function K(e,t,r){var i,s;for(l(e[0],n),l(e[1],a),l(e[2],a),l(e[3],n),s=255;s>=0;--s)M(e,t,i=r[s/8|0]>>(7&s)&1),P(t,e),P(e,e),M(e,t,i);}function D(e,r){var i=[t(),t(),t(),t()];l(i[0],u),l(i[1],h),l(i[2],a),k(i[3],u,h),K(e,i,r);}function R(i,n,a){var s,o,c=[t(),t(),t(),t()];for(a||r(n,32),(s=e.hash(n.subarray(0,32)))[0]&=248,s[31]&=127,s[31]|=64,D(c,s),C(i,c),o=0;o<32;o++)n[o+32]=i[o];return 0}var I=new Float64Array([237,211,245,92,26,99,18,88,214,156,247,162,222,249,222,20,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,16]);function U(e,t){var r,i,n,a;for(i=63;i>=32;--i){for(r=0,n=i-32,a=i-12;n<a;++n)t[n]+=r-16*t[i]*I[n-(i-32)],r=Math.floor((t[n]+128)/256),t[n]-=256*r;t[n]+=r,t[i]=0;}for(r=0,n=0;n<32;n++)t[n]+=r-(t[31]>>4)*I[n],r=t[n]>>8,t[n]&=255;for(n=0;n<32;n++)t[n]-=r*I[n];for(i=0;i<32;i++)t[i+1]+=t[i]>>8,e[i]=255&t[i];}function B(e){var t,r=new Float64Array(64);for(t=0;t<64;t++)r[t]=e[t];for(t=0;t<64;t++)e[t]=0;U(e,r);}function T(e,r){var i=t(),s=t(),c=t(),u=t(),h=t(),f=t(),p=t();return l(e[2],a),w(e[1],r),A(c,e[1]),k(u,c,o),_(c,c,e[2]),v(u,e[2],u),A(h,u),A(f,h),k(p,f,h),k(i,p,c),k(i,i,u),function(e,r){var i,n=t();for(i=0;i<16;i++)n[i]=r[i];for(i=250;i>=0;i--)A(n,n),1!==i&&k(n,n,r);for(i=0;i<16;i++)e[i]=n[i];}(i,i),k(i,i,c),k(i,i,u),k(i,i,u),k(e[0],i,u),A(s,e[0]),k(s,s,u),m(s,c)&&k(e[0],e[0],d),A(s,e[0]),k(s,s,u),m(s,c)?-1:(g(e[0])===r[31]>>7&&_(e[0],n,e[0]),k(e[3],e[0],e[1]),0)}function z(){for(var e=0;e<arguments.length;e++)if(!(arguments[e]instanceof Uint8Array))throw new TypeError("unexpected type, use Uint8Array")}function q(e){for(var t=0;t<e.length;t++)e[t]=0;}e.scalarMult=function(e,t){if(z(e,t),32!==e.length)throw Error("bad n size");if(32!==t.length)throw Error("bad p size");var r=new Uint8Array(32);return E(r,e,t),r},e.box={},e.box.keyPair=function(){var e,t,i=new Uint8Array(32),n=new Uint8Array(32);return e=i,r(t=n,32),x(e,t),{publicKey:i,secretKey:n}},e.box.keyPair.fromSecretKey=function(e){if(z(e),32!==e.length)throw Error("bad secret key size");var t=new Uint8Array(32);return x(t,e),{publicKey:t,secretKey:new Uint8Array(e)}},e.sign=function(r,i){if(z(r,i),64!==i.length)throw Error("bad secret key size");var n=new Uint8Array(64+r.length);return function(r,i,n,a){var s,o,c,u,h,d=new Float64Array(64),f=[t(),t(),t(),t()];(s=e.hash(a.subarray(0,32)))[0]&=248,s[31]&=127,s[31]|=64;var l=n+64;for(u=0;u<n;u++)r[64+u]=i[u];for(u=0;u<32;u++)r[32+u]=s[32+u];for(B(c=e.hash(r.subarray(32,l))),D(f,c),C(r,f),u=32;u<64;u++)r[u]=a[u];for(B(o=e.hash(r.subarray(0,l))),u=0;u<64;u++)d[u]=0;for(u=0;u<32;u++)d[u]=c[u];for(u=0;u<32;u++)for(h=0;h<32;h++)d[u+h]+=o[u]*s[h];U(r.subarray(32),d);}(n,r,r.length,i),n},e.sign.detached=function(t,r){for(var i=e.sign(t,r),n=new Uint8Array(64),a=0;a<n.length;a++)n[a]=i[a];return n},e.sign.detached.verify=function(r,i,n){if(z(r,i,n),64!==i.length)throw Error("bad signature size");if(32!==n.length)throw Error("bad public key size");var a,s=new Uint8Array(64+r.length),o=new Uint8Array(64+r.length);for(a=0;a<64;a++)s[a]=i[a];for(a=0;a<r.length;a++)s[a+64]=r[a];return function(r,i,n,a){var s,o,c=new Uint8Array(32),u=[t(),t(),t(),t()],h=[t(),t(),t(),t()];if(n<64)return -1;if(T(h,a))return -1;for(s=0;s<n;s++)r[s]=i[s];for(s=0;s<32;s++)r[s+32]=a[s];if(B(o=e.hash(r.subarray(0,n))),K(u,h,o),D(h,i.subarray(32)),P(u,h),C(c,u),n-=64,f(i,0,c,0)){for(s=0;s<n;s++)r[s]=0;return -1}for(s=0;s<n;s++)r[s]=i[s+64];return n}(o,s,s.length,n)>=0},e.sign.keyPair=function(){var e=new Uint8Array(32),t=new Uint8Array(64);return R(e,t),{publicKey:e,secretKey:t}},e.sign.keyPair.fromSecretKey=function(e){if(z(e),64!==e.length)throw Error("bad secret key size");for(var t=new Uint8Array(32),r=0;r<t.length;r++)t[r]=e[32+r];return {publicKey:t,secretKey:new Uint8Array(e)}},e.sign.keyPair.fromSeed=function(e){if(z(e),32!==e.length)throw Error("bad seed size");for(var t=new Uint8Array(32),r=new Uint8Array(64),i=0;i<32;i++)r[i]=e[i];return R(t,r,!0),{publicKey:t,secretKey:r}},e.setPRNG=function(e){r=e;},function(){var t="undefined"!=typeof self?self.crypto||self.msCrypto:null;if(t&&t.getRandomValues){e.setPRNG((function(e,r){var i,n=new Uint8Array(r);for(i=0;i<r;i+=65536)t.getRandomValues(n.subarray(i,i+Math.min(r-i,65536)));for(i=0;i<r;i++)e[i]=n[i];q(n);}));}else (t=void 0)&&t.randomBytes&&e.setPRNG((function(e,r){var i,n=t.randomBytes(r);for(i=0;i<r;i++)e[i]=n[i];q(n);}));}();}(e.exports?e.exports:self.nacl=self.nacl||{});}));const wi=Z.getNodeCrypto();async function vi(t){const r=new Uint8Array(t);if("undefined"!=typeof crypto&&crypto.getRandomValues)crypto.getRandomValues(r);else if(void 0!==e&&"object"==typeof e.msCrypto&&"function"==typeof e.msCrypto.getRandomValues)e.msCrypto.getRandomValues(r);else if(wi){const e=wi.randomBytes(r.length);r.set(e);}else {if(!ki.buffer)throw Error("No secure random number generator available.");await ki.get(r);}return r}async function _i(e,t){const r=await Z.getBigInteger();if(t.lt(e))throw Error("Illegal parameter value: max <= min");const i=t.sub(e),n=i.byteLength();return new r(await vi(n+8)).mod(i).add(e)}const ki=new class{constructor(){this.buffer=null,this.size=null,this.callback=null;}init(e,t){this.buffer=new Uint8Array(e),this.size=0,this.callback=t;}set(e){if(!this.buffer)throw Error("RandomBuffer is not initialized");if(!(e instanceof Uint8Array))throw Error("Invalid type: buf not an Uint8Array");const t=this.buffer.length-this.size;e.length>t&&(e=e.subarray(0,t)),this.buffer.set(e,this.size),this.size+=e.length;}async get(e){if(!this.buffer)throw Error("RandomBuffer is not initialized");if(!(e instanceof Uint8Array))throw Error("Invalid type: buf not an Uint8Array");if(this.size<e.length){if(!this.callback)throw Error("Random number buffer depleted");return await this.callback(),this.get(e)}for(let t=0;t<e.length;t++)e[t]=this.buffer[--this.size],this.buffer[this.size]=0;}};var Ai=/*#__PURE__*/Object.freeze({__proto__:null,getRandomBytes:vi,getRandomBigInteger:_i,randomBuffer:ki});async function Si(e,t,r){const i=await Z.getBigInteger(),n=new i(1),a=n.leftShift(new i(e-1)),s=new i(30),o=[1,6,5,4,3,2,1,4,3,2,1,2,1,4,3,2,1,2,1,4,3,2,1,6,5,4,3,2,1,2],c=await _i(a,a.leftShift(n));let u=c.mod(s).toNumber();do{c.iadd(new i(o[u])),u=(u+o[u])%o.length,c.bitLength()>e&&(c.imod(a.leftShift(n)).iadd(a),u=c.mod(s).toNumber());}while(!await Ei(c,t,r));return c}async function Ei(e,t,r){return !(t&&!e.dec().gcd(t).isOne())&&(!!await async function(e){const t=await Z.getBigInteger();return xi.every(r=>0!==e.mod(new t(r)))}(e)&&(!!await async function(e,t){const r=await Z.getBigInteger();return (t=t||new r(2)).modExp(e.dec(),e).isOne()}(e)&&!!await async function(e,t,r){const i=await Z.getBigInteger(),n=e.bitLength();t||(t=Math.max(1,n/48|0));const a=e.dec();let s=0;for(;!a.getBit(s);)s++;const o=e.rightShift(new i(s));for(;t>0;t--){let t,n=(r?r():await _i(new i(2),a)).modExp(o,e);if(!n.isOne()&&!n.equal(a)){for(t=1;t<s;t++){if(n=n.mul(n).mod(e),n.isOne())return !1;if(n.equal(a))break}if(t===s)return !1}}return !0}(e,r)))}const xi=[7,11,13,17,19,23,29,31,37,41,43,47,53,59,61,67,71,73,79,83,89,97,101,103,107,109,113,127,131,137,139,149,151,157,163,167,173,179,181,191,193,197,199,211,223,227,229,233,239,241,251,257,263,269,271,277,281,283,293,307,311,313,317,331,337,347,349,353,359,367,373,379,383,389,397,401,409,419,421,431,433,439,443,449,457,461,463,467,479,487,491,499,503,509,521,523,541,547,557,563,569,571,577,587,593,599,601,607,613,617,619,631,641,643,647,653,659,661,673,677,683,691,701,709,719,727,733,739,743,751,757,761,769,773,787,797,809,811,821,823,827,829,839,853,857,859,863,877,881,883,887,907,911,919,929,937,941,947,953,967,971,977,983,991,997,1009,1013,1019,1021,1031,1033,1039,1049,1051,1061,1063,1069,1087,1091,1093,1097,1103,1109,1117,1123,1129,1151,1153,1163,1171,1181,1187,1193,1201,1213,1217,1223,1229,1231,1237,1249,1259,1277,1279,1283,1289,1291,1297,1301,1303,1307,1319,1321,1327,1361,1367,1373,1381,1399,1409,1423,1427,1429,1433,1439,1447,1451,1453,1459,1471,1481,1483,1487,1489,1493,1499,1511,1523,1531,1543,1549,1553,1559,1567,1571,1579,1583,1597,1601,1607,1609,1613,1619,1621,1627,1637,1657,1663,1667,1669,1693,1697,1699,1709,1721,1723,1733,1741,1747,1753,1759,1777,1783,1787,1789,1801,1811,1823,1831,1847,1861,1867,1871,1873,1877,1879,1889,1901,1907,1913,1931,1933,1949,1951,1973,1979,1987,1993,1997,1999,2003,2011,2017,2027,2029,2039,2053,2063,2069,2081,2083,2087,2089,2099,2111,2113,2129,2131,2137,2141,2143,2153,2161,2179,2203,2207,2213,2221,2237,2239,2243,2251,2267,2269,2273,2281,2287,2293,2297,2309,2311,2333,2339,2341,2347,2351,2357,2371,2377,2381,2383,2389,2393,2399,2411,2417,2423,2437,2441,2447,2459,2467,2473,2477,2503,2521,2531,2539,2543,2549,2551,2557,2579,2591,2593,2609,2617,2621,2633,2647,2657,2659,2663,2671,2677,2683,2687,2689,2693,2699,2707,2711,2713,2719,2729,2731,2741,2749,2753,2767,2777,2789,2791,2797,2801,2803,2819,2833,2837,2843,2851,2857,2861,2879,2887,2897,2903,2909,2917,2927,2939,2953,2957,2963,2969,2971,2999,3001,3011,3019,3023,3037,3041,3049,3061,3067,3079,3083,3089,3109,3119,3121,3137,3163,3167,3169,3181,3187,3191,3203,3209,3217,3221,3229,3251,3253,3257,3259,3271,3299,3301,3307,3313,3319,3323,3329,3331,3343,3347,3359,3361,3371,3373,3389,3391,3407,3413,3433,3449,3457,3461,3463,3467,3469,3491,3499,3511,3517,3527,3529,3533,3539,3541,3547,3557,3559,3571,3581,3583,3593,3607,3613,3617,3623,3631,3637,3643,3659,3671,3673,3677,3691,3697,3701,3709,3719,3727,3733,3739,3761,3767,3769,3779,3793,3797,3803,3821,3823,3833,3847,3851,3853,3863,3877,3881,3889,3907,3911,3917,3919,3923,3929,3931,3943,3947,3967,3989,4001,4003,4007,4013,4019,4021,4027,4049,4051,4057,4073,4079,4091,4093,4099,4111,4127,4129,4133,4139,4153,4157,4159,4177,4201,4211,4217,4219,4229,4231,4241,4243,4253,4259,4261,4271,4273,4283,4289,4297,4327,4337,4339,4349,4357,4363,4373,4391,4397,4409,4421,4423,4441,4447,4451,4457,4463,4481,4483,4493,4507,4513,4517,4519,4523,4547,4549,4561,4567,4583,4591,4597,4603,4621,4637,4639,4643,4649,4651,4657,4663,4673,4679,4691,4703,4721,4723,4729,4733,4751,4759,4783,4787,4789,4793,4799,4801,4813,4817,4831,4861,4871,4877,4889,4903,4909,4919,4931,4933,4937,4943,4951,4957,4967,4969,4973,4987,4993,4999];const Pi=[];async function Mi(e,t){const r=e.length;if(r>t-11)throw Error("Message too long");const i=await async function(e){const t=new Uint8Array(e);let r=0;for(;r<e;){const i=await vi(e-r);for(let e=0;e<i.length;e++)0!==i[e]&&(t[r++]=i[e]);}return t}(t-r-3),n=new Uint8Array(t);return n[1]=2,n.set(i,2),n.set(e,t-r),n}function Ci(e){let t=2;for(;0!==e[t]&&t<e.length;)t++;const r=t-2,i=e[t++];if(0===e[0]&&2===e[1]&&r>=8&&0===i)return e.subarray(t);throw Error("Decryption error")}async function Ki(e,t,r){let i;if(t.length!==zr.getHashByteLength(e))throw Error("Invalid hash length");const n=new Uint8Array(Pi[e].length);for(i=0;i<Pi[e].length;i++)n[i]=Pi[e][i];const a=n.length+t.length;if(r<a+11)throw Error("Intended encoded message length too short");const s=new Uint8Array(r-a-3).fill(255),o=new Uint8Array(r);return o[1]=1,o.set(s,2),o.set(n,r-a),o.set(t,r-t.length),o}Pi[1]=[48,32,48,12,6,8,42,134,72,134,247,13,2,5,5,0,4,16],Pi[2]=[48,33,48,9,6,5,43,14,3,2,26,5,0,4,20],Pi[3]=[48,33,48,9,6,5,43,36,3,2,1,5,0,4,20],Pi[8]=[48,49,48,13,6,9,96,134,72,1,101,3,4,2,1,5,0,4,32],Pi[9]=[48,65,48,13,6,9,96,134,72,1,101,3,4,2,2,5,0,4,48],Pi[10]=[48,81,48,13,6,9,96,134,72,1,101,3,4,2,3,5,0,4,64],Pi[11]=[48,45,48,13,6,9,96,134,72,1,101,3,4,2,4,5,0,4,28];var Di=/*#__PURE__*/Object.freeze({__proto__:null,emeEncode:Mi,emeDecode:Ci,emsaEncode:Ki});const Ri=Z.getWebCrypto(),Ii=Z.getNodeCrypto(),Ui=void 0;function Bi(e,t){return "function"!=typeof e.then?new Promise((function(r,i){e.onerror=function(){i(Error(t));},e.oncomplete=function(e){r(e.target.result);};})):e}const Ti=Z.detectNode()?Ui.define("RSAPrivateKey",(function(){this.seq().obj(this.key("version").int(),this.key("modulus").int(),this.key("publicExponent").int(),this.key("privateExponent").int(),this.key("prime1").int(),this.key("prime2").int(),this.key("exponent1").int(),this.key("exponent2").int(),this.key("coefficient").int());})):void 0,zi=Z.detectNode()?Ui.define("RSAPubliceKey",(function(){this.seq().obj(this.key("modulus").int(),this.key("publicExponent").int());})):void 0;var qi=/*#__PURE__*/Object.freeze({__proto__:null,sign:async function(e,t,r,i,n,a,s,o,c){if(t&&!Z.isStream(t))if(Z.getWebCrypto())try{return await async function(e,t,r,i,n,a,s,o){const c=await async function(e,t,r,i,n,a){const s=await Z.getBigInteger(),o=new s(i),c=new s(n),u=new s(r);let h=u.mod(c.dec()),d=u.mod(o.dec());return d=d.toUint8Array(),h=h.toUint8Array(),{kty:"RSA",n:te(e,!0),e:te(t,!0),d:te(r,!0),p:te(n,!0),q:te(i,!0),dp:te(h,!0),dq:te(d,!0),qi:te(a,!0),ext:!0}}(r,i,n,a,s,o),u={name:"RSASSA-PKCS1-v1_5",hash:{name:e}},h=await Ri.importKey("jwk",c,u,!1,["sign"]);return new Uint8Array(await Ri.sign({name:"RSASSA-PKCS1-v1_5",hash:e},h,t))}(ie.read(ie.webHash,e),t,r,i,n,a,s,o)}catch(e){Z.printDebugError(e);}else if(Z.getNodeCrypto())return async function(e,t,r,i,n,a,s,o){const{default:c}=await Promise.resolve().then((function(){return Wd})),u=new c(a),h=new c(s),d=new c(n),f=d.mod(h.subn(1)),l=d.mod(u.subn(1)),p=Ii.createSign(ie.read(ie.hash,e));p.write(t),p.end();const y={version:0,modulus:new c(r),publicExponent:new c(i),privateExponent:new c(n),prime1:new c(s),prime2:new c(a),exponent1:f,exponent2:l,coefficient:new c(o)};if(void 0!==Ii.createPrivateKey){const e=Ti.encode(y,"der");return new Uint8Array(p.sign({key:e,format:"der",type:"pkcs1"}))}const b=Ti.encode(y,"pem",{label:"RSA PRIVATE KEY"});return new Uint8Array(p.sign(b))}(e,t,r,i,n,a,s,o);return async function(e,t,r,i){const n=await Z.getBigInteger();t=new n(t);const a=new n(await Ki(e,i,t.byteLength()));if(r=new n(r),a.gte(t))throw Error("Message size cannot exceed modulus size");return a.modExp(r,t).toUint8Array("be",t.byteLength())}(e,r,n,c)},verify:async function(e,t,r,i,n,a){if(t&&!Z.isStream(t))if(Z.getWebCrypto())try{return await async function(e,t,r,i,n){const a=function(e,t){return {kty:"RSA",n:te(e,!0),e:te(t,!0),ext:!0}}(i,n),s=await Ri.importKey("jwk",a,{name:"RSASSA-PKCS1-v1_5",hash:{name:e}},!1,["verify"]);return Ri.verify({name:"RSASSA-PKCS1-v1_5",hash:e},s,r,t)}(ie.read(ie.webHash,e),t,r,i,n)}catch(e){Z.printDebugError(e);}else if(Z.getNodeCrypto())return async function(e,t,r,i,n){const{default:a}=await Promise.resolve().then((function(){return Wd})),s=Ii.createVerify(ie.read(ie.hash,e));s.write(t),s.end();const o={modulus:new a(i),publicExponent:new a(n)};let c;if(void 0!==Ii.createPrivateKey){const e=zi.encode(o,"der");c={key:e,format:"der",type:"pkcs1"};}else c=zi.encode(o,"pem",{label:"RSA PUBLIC KEY"});try{return await s.verify(c,r)}catch(e){return !1}}(e,t,r,i,n);return async function(e,t,r,i,n){const a=await Z.getBigInteger();if(r=new a(r),t=new a(t),i=new a(i),t.gte(r))throw Error("Signature size cannot exceed modulus size");const s=t.modExp(i,r).toUint8Array("be",r.byteLength()),o=await Ki(e,n,r.byteLength());return Z.equalsUint8Array(s,o)}(e,r,i,n,a)},encrypt:async function(e,t,r){return Z.getNodeCrypto()?async function(e,t,r){const{default:i}=await Promise.resolve().then((function(){return Wd})),n={modulus:new i(t),publicExponent:new i(r)};let a;if(void 0!==Ii.createPrivateKey){const e=zi.encode(n,"der");a={key:e,format:"der",type:"pkcs1",padding:Ii.constants.RSA_PKCS1_PADDING};}else {const e=zi.encode(n,"pem",{label:"RSA PUBLIC KEY"});a={key:e,padding:Ii.constants.RSA_PKCS1_PADDING};}return new Uint8Array(Ii.publicEncrypt(a,e))}(e,t,r):async function(e,t,r){const i=await Z.getBigInteger();if(t=new i(t),e=new i(await Mi(e,t.byteLength())),r=new i(r),e.gte(t))throw Error("Message size cannot exceed modulus size");return e.modExp(r,t).toUint8Array("be",t.byteLength())}(e,t,r)},decrypt:async function(e,t,r,i,n,a,s){return Z.getNodeCrypto()?async function(e,t,r,i,n,a,s){const{default:o}=await Promise.resolve().then((function(){return Wd})),c=new o(n),u=new o(a),h=new o(i),d=h.mod(u.subn(1)),f=h.mod(c.subn(1)),l={version:0,modulus:new o(t),publicExponent:new o(r),privateExponent:new o(i),prime1:new o(a),prime2:new o(n),exponent1:d,exponent2:f,coefficient:new o(s)};let p;if(void 0!==Ii.createPrivateKey){const e=Ti.encode(l,"der");p={key:e,format:"der",type:"pkcs1",padding:Ii.constants.RSA_PKCS1_PADDING};}else {const e=Ti.encode(l,"pem",{label:"RSA PRIVATE KEY"});p={key:e,padding:Ii.constants.RSA_PKCS1_PADDING};}try{return new Uint8Array(Ii.privateDecrypt(p,e))}catch(e){throw Error("Decryption error")}}(e,t,r,i,n,a,s):async function(e,t,r,i,n,a,s){const o=await Z.getBigInteger();if(e=new o(e),t=new o(t),r=new o(r),i=new o(i),n=new o(n),a=new o(a),s=new o(s),e.gte(t))throw Error("Data too large.");const c=i.mod(a.dec()),u=i.mod(n.dec()),h=(await _i(new o(2),t)).mod(t),d=h.modInv(t).modExp(r,t),f=(e=e.mul(d).mod(t)).modExp(u,n),l=e.modExp(c,a);let p=s.mul(l.sub(f)).mod(a).mul(n).add(f);return p=p.mul(h).mod(t),Ci(p.toUint8Array("be",t.byteLength()))}(e,t,r,i,n,a,s)},generate:async function(t,r){if(r=new(await Z.getBigInteger())(r),Z.getWebCrypto()){let i,n;if(e.crypto&&e.crypto.subtle||e.msCrypto)n={name:"RSASSA-PKCS1-v1_5",modulusLength:t,publicExponent:r.toUint8Array(),hash:{name:"SHA-1"}},i=Ri.generateKey(n,!0,["sign","verify"]),i=await Bi(i,"Error generating RSA key pair.");else {if(!e.crypto||!e.crypto.webkitSubtle)throw Error("Unknown WebCrypto implementation");n={name:"RSA-OAEP",modulusLength:t,publicExponent:r.toUint8Array(),hash:{name:"SHA-1"}},i=await Ri.generateKey(n,!0,["encrypt","decrypt"]);}let a=Ri.exportKey("jwk",i.privateKey);return a=await Bi(a,"Error exporting RSA key pair."),a instanceof ArrayBuffer&&(a=JSON.parse(String.fromCharCode.apply(null,new Uint8Array(a)))),{n:ee(a.n),e:r.toUint8Array(),d:ee(a.d),p:ee(a.q),q:ee(a.p),u:ee(a.qi)}}if(Z.getNodeCrypto()&&Ii.generateKeyPair&&Ti){const e={modulusLength:t,publicExponent:r.toNumber(),publicKeyEncoding:{type:"pkcs1",format:"der"},privateKeyEncoding:{type:"pkcs1",format:"der"}},i=await new Promise((t,r)=>Ii.generateKeyPair("rsa",e,(e,i,n)=>{e?r(e):t(Ti.decode(n,"der"));}));return {n:i.modulus.toArrayLike(Uint8Array),e:i.publicExponent.toArrayLike(Uint8Array),d:i.privateExponent.toArrayLike(Uint8Array),p:i.prime2.toArrayLike(Uint8Array),q:i.prime1.toArrayLike(Uint8Array),u:i.coefficient.toArrayLike(Uint8Array)}}let i=await Si(t-(t>>1),r,40),n=await Si(t>>1,r,40);i.lt(n)&&([n,i]=[i,n]);const a=n.dec().imul(i.dec());return {n:n.mul(i).toUint8Array(),e:r.toUint8Array(),d:r.modInv(a).toUint8Array(),p:n.toUint8Array(),q:i.toUint8Array(),u:n.modInv(i).toUint8Array()}},validateParams:async function(e,t,r,i,n,a){const s=await Z.getBigInteger();if(e=new s(e),i=new s(i),n=new s(n),!i.mul(n).equal(e))return !1;const o=new s(2);if(a=new s(a),!i.mul(a).mod(n).isOne())return !1;t=new s(t),r=new s(r);const c=new s(Math.floor(e.bitLength()/3)),u=await _i(o,o.leftShift(c)),h=u.mul(r).mul(t);return !(!h.mod(i.dec()).equal(u)||!h.mod(n.dec()).equal(u))}});var Fi=/*#__PURE__*/Object.freeze({__proto__:null,encrypt:async function(e,t,r,i){const n=await Z.getBigInteger();t=new n(t),r=new n(r),i=new n(i);const a=new n(await Mi(e,t.byteLength())),s=await _i(new n(1),t.dec());return {c1:r.modExp(s,t).toUint8Array(),c2:i.modExp(s,t).imul(a).imod(t).toUint8Array()}},decrypt:async function(e,t,r,i){const n=await Z.getBigInteger();return e=new n(e),t=new n(t),r=new n(r),i=new n(i),Ci(e.modExp(i,r).modInv(r).imul(t).imod(r).toUint8Array("be",r.byteLength()))},validateParams:async function(e,t,r,i){const n=await Z.getBigInteger();e=new n(e),t=new n(t),r=new n(r);const a=new n(1);if(t.lte(a)||t.gte(e))return !1;const s=new n(e.bitLength()),o=new n(1023);if(s.lt(o))return !1;if(!t.modExp(e.dec(),e).isOne())return !1;let c=t;const u=new n(1),h=new n(2).leftShift(new n(17));for(;u.lt(h);){if(c=c.mul(t).imod(e),c.isOne())return !1;u.iinc();}i=new n(i);const d=new n(2),f=await _i(d.leftShift(s.dec()),d.leftShift(s)),l=e.dec().imul(f).iadd(i);return !!r.equal(t.modExp(l,e))}});class Oi{constructor(e){if(e instanceof Oi)this.oid=e.oid;else if(Z.isArray(e)||Z.isUint8Array(e)){if(6===(e=new Uint8Array(e))[0]){if(e[1]!==e.length-2)throw Error("Length mismatch in DER encoded oid");e=e.subarray(2);}this.oid=e;}else this.oid="";}read(e){if(e.length>=1){const t=e[0];if(e.length>=1+t)return this.oid=e.subarray(1,1+t),1+this.oid.length}throw Error("Invalid oid")}write(){return Z.concatUint8Array([new Uint8Array([this.oid.length]),this.oid])}toHex(){return Z.uint8ArrayToHex(this.oid)}getName(){const e=this.toHex();if(ie.curve[e])return ie.write(ie.curve,e);throw Error("Unknown curve object identifier.")}}function Ni(e,t){return e.keyPair({priv:t})}function Li(e,t){const r=e.keyPair({pub:t});if(!0!==r.validate().result)throw Error("Invalid elliptic public key");return r}async function ji(e){if(!ne.useIndutnyElliptic)throw Error("This curve is only supported in the full build of OpenPGP.js");const{default:t}=await Promise.resolve().then((function(){return ul}));return new t.ec(e)}const Wi=Z.getWebCrypto(),Hi=Z.getNodeCrypto(),Gi={p256:"P-256",p384:"P-384",p521:"P-521"},Vi=Hi?Hi.getCurves():[],Zi=Hi?{secp256k1:Vi.includes("secp256k1")?"secp256k1":void 0,p256:Vi.includes("prime256v1")?"prime256v1":void 0,p384:Vi.includes("secp384r1")?"secp384r1":void 0,p521:Vi.includes("secp521r1")?"secp521r1":void 0,ed25519:Vi.includes("ED25519")?"ED25519":void 0,curve25519:Vi.includes("X25519")?"X25519":void 0,brainpoolP256r1:Vi.includes("brainpoolP256r1")?"brainpoolP256r1":void 0,brainpoolP384r1:Vi.includes("brainpoolP384r1")?"brainpoolP384r1":void 0,brainpoolP512r1:Vi.includes("brainpoolP512r1")?"brainpoolP512r1":void 0}:{},Yi={p256:{oid:[6,8,42,134,72,206,61,3,1,7],keyType:ie.publicKey.ecdsa,hash:ie.hash.sha256,cipher:ie.symmetric.aes128,node:Zi.p256,web:Gi.p256,payloadSize:32,sharedSize:256},p384:{oid:[6,5,43,129,4,0,34],keyType:ie.publicKey.ecdsa,hash:ie.hash.sha384,cipher:ie.symmetric.aes192,node:Zi.p384,web:Gi.p384,payloadSize:48,sharedSize:384},p521:{oid:[6,5,43,129,4,0,35],keyType:ie.publicKey.ecdsa,hash:ie.hash.sha512,cipher:ie.symmetric.aes256,node:Zi.p521,web:Gi.p521,payloadSize:66,sharedSize:528},secp256k1:{oid:[6,5,43,129,4,0,10],keyType:ie.publicKey.ecdsa,hash:ie.hash.sha256,cipher:ie.symmetric.aes128,node:Zi.secp256k1,payloadSize:32},ed25519:{oid:[6,9,43,6,1,4,1,218,71,15,1],keyType:ie.publicKey.eddsa,hash:ie.hash.sha512,node:!1,payloadSize:32},curve25519:{oid:[6,10,43,6,1,4,1,151,85,1,5,1],keyType:ie.publicKey.ecdh,hash:ie.hash.sha256,cipher:ie.symmetric.aes128,node:!1,payloadSize:32},brainpoolP256r1:{oid:[6,9,43,36,3,3,2,8,1,1,7],keyType:ie.publicKey.ecdsa,hash:ie.hash.sha256,cipher:ie.symmetric.aes128,node:Zi.brainpoolP256r1,payloadSize:32},brainpoolP384r1:{oid:[6,9,43,36,3,3,2,8,1,1,11],keyType:ie.publicKey.ecdsa,hash:ie.hash.sha384,cipher:ie.symmetric.aes192,node:Zi.brainpoolP384r1,payloadSize:48},brainpoolP512r1:{oid:[6,9,43,36,3,3,2,8,1,1,13],keyType:ie.publicKey.ecdsa,hash:ie.hash.sha512,cipher:ie.symmetric.aes256,node:Zi.brainpoolP512r1,payloadSize:64}};class $i{constructor(e,t){try{(Z.isArray(e)||Z.isUint8Array(e))&&(e=new Oi(e)),e instanceof Oi&&(e=e.getName()),this.name=ie.write(ie.curve,e);}catch(e){throw Error("Not valid curve")}t=t||Yi[this.name],this.keyType=t.keyType,this.oid=t.oid,this.hash=t.hash,this.cipher=t.cipher,this.node=t.node&&Yi[this.name],this.web=t.web&&Yi[this.name],this.payloadSize=t.payloadSize,this.web&&Z.getWebCrypto()?this.type="web":this.node&&Z.getNodeCrypto()?this.type="node":"curve25519"===this.name?this.type="curve25519":"ed25519"===this.name&&(this.type="ed25519");}async genKeyPair(){let e;switch(this.type){case"web":try{return await async function(e){const t=await Wi.generateKey({name:"ECDSA",namedCurve:Gi[e]},!0,["sign","verify"]),r=await Wi.exportKey("jwk",t.privateKey);return {publicKey:Ji(await Wi.exportKey("jwk",t.publicKey)),privateKey:ee(r.d)}}(this.name)}catch(e){Z.printDebugError("Browser did not support generating ec key "+e.message);break}case"node":return async function(e){const t=Hi.createECDH(Zi[e]);return await t.generateKeys(),{publicKey:new Uint8Array(t.getPublicKey()),privateKey:new Uint8Array(t.getPrivateKey())}}(this.name);case"curve25519":{const t=await vi(32);t[0]=127&t[0]|64,t[31]&=248;const r=t.slice().reverse();return e=gi.box.keyPair.fromSecretKey(r),{publicKey:Z.concatUint8Array([new Uint8Array([64]),e.publicKey]),privateKey:t}}case"ed25519":{const e=await vi(32),t=gi.sign.keyPair.fromSeed(e);return {publicKey:Z.concatUint8Array([new Uint8Array([64]),t.publicKey]),privateKey:e}}}const t=await ji(this.name);return e=await t.genKeyPair({entropy:Z.uint8ArrayToString(await vi(32))}),{publicKey:new Uint8Array(e.getPublic("array",!1)),privateKey:e.getPrivate().toArrayLike(Uint8Array)}}}async function Xi(e,t,r,i){const n={p256:!0,p384:!0,p521:!0,secp256k1:!0,curve25519:e===ie.publicKey.ecdh,brainpoolP256r1:!0,brainpoolP384r1:!0,brainpoolP512r1:!0},a=t.getName();if(!n[a])return !1;if("curve25519"===a){i=i.slice().reverse();const{publicKey:e}=gi.box.keyPair.fromSecretKey(i);r=new Uint8Array(r);const t=new Uint8Array([64,...e]);return !!Z.equalsUint8Array(t,r)}const s=await ji(a);try{r=Li(s,r).getPublic();}catch(e){return !1}return !!Ni(s,i).getPublic().eq(r)}function Ji(e){const t=ee(e.x),r=ee(e.y),i=new Uint8Array(t.length+r.length+1);return i[0]=4,i.set(t,1),i.set(r,t.length+1),i}function Qi(e,t,r){const i=e,n=r.slice(1,i+1),a=r.slice(i+1,2*i+1);return {kty:"EC",crv:t,x:te(n,!0),y:te(a,!0),ext:!0}}function en(e,t,r,i){const n=Qi(e,t,r);return n.d=te(i,!0),n}const tn=Z.getWebCrypto(),rn=Z.getNodeCrypto();async function nn(e,t,r,i,n,a){const s=new $i(e);if(r&&!Z.isStream(r)){const e={publicKey:i,privateKey:n};switch(s.type){case"web":try{return await async function(e,t,r,i){const n=e.payloadSize,a=en(e.payloadSize,Gi[e.name],i.publicKey,i.privateKey),s=await tn.importKey("jwk",a,{name:"ECDSA",namedCurve:Gi[e.name],hash:{name:ie.read(ie.webHash,e.hash)}},!1,["sign"]),o=new Uint8Array(await tn.sign({name:"ECDSA",namedCurve:Gi[e.name],hash:{name:ie.read(ie.webHash,t)}},s,r));return {r:o.slice(0,n),s:o.slice(n,n<<1)}}(s,t,r,e)}catch(e){if("p521"!==s.name&&("DataError"===e.name||"OperationError"===e.name))throw e;Z.printDebugError("Browser did not support signing: "+e.message);}break;case"node":{const i=await async function(e,t,r,i){const n=rn.createSign(ie.read(ie.hash,t));n.write(r),n.end();const a=cn.encode({version:1,parameters:e.oid,privateKey:Array.from(i.privateKey),publicKey:{unused:0,data:Array.from(i.publicKey)}},"pem",{label:"EC PRIVATE KEY"});return on.decode(n.sign(a),"der")}(s,t,r,e);return {r:i.r.toArrayLike(Uint8Array),s:i.s.toArrayLike(Uint8Array)}}}}return async function(e,t,r){const i=Ni(await ji(e.name),r).sign(t);return {r:i.r.toArrayLike(Uint8Array),s:i.s.toArrayLike(Uint8Array)}}(s,a,n)}async function an(e,t,r,i,n,a){const s=new $i(e);if(i&&!Z.isStream(i))switch(s.type){case"web":try{return await async function(e,t,{r,s:i},n,a){const s=Qi(e.payloadSize,Gi[e.name],a),o=await tn.importKey("jwk",s,{name:"ECDSA",namedCurve:Gi[e.name],hash:{name:ie.read(ie.webHash,e.hash)}},!1,["verify"]),c=Z.concatUint8Array([r,i]).buffer;return tn.verify({name:"ECDSA",namedCurve:Gi[e.name],hash:{name:ie.read(ie.webHash,t)}},o,c,n)}(s,t,r,i,n)}catch(e){if("p521"!==s.name&&("DataError"===e.name||"OperationError"===e.name))throw e;Z.printDebugError("Browser did not support verifying: "+e.message);}break;case"node":return async function(e,t,{r,s:i},n,a){const{default:s}=await Promise.resolve().then((function(){return Wd})),o=rn.createVerify(ie.read(ie.hash,t));o.write(n),o.end();const c=hn.encode({algorithm:{algorithm:[1,2,840,10045,2,1],parameters:e.oid},subjectPublicKey:{unused:0,data:Array.from(a)}},"pem",{label:"PUBLIC KEY"}),u=on.encode({r:new s(r),s:new s(i)},"der");try{return o.verify(c,u)}catch(e){return !1}}(s,t,r,i,n)}return async function(e,t,r,i){return Li(await ji(e.name),i).verify(r,t)}(s,r,void 0===t?i:a,n)}const sn=void 0,on=rn?sn.define("ECDSASignature",(function(){this.seq().obj(this.key("r").int(),this.key("s").int());})):void 0,cn=rn?sn.define("ECPrivateKey",(function(){this.seq().obj(this.key("version").int(),this.key("privateKey").octstr(),this.key("parameters").explicit(0).optional().any(),this.key("publicKey").explicit(1).optional().bitstr());})):void 0,un=rn?sn.define("AlgorithmIdentifier",(function(){this.seq().obj(this.key("algorithm").objid(),this.key("parameters").optional().any());})):void 0,hn=rn?sn.define("SubjectPublicKeyInfo",(function(){this.seq().obj(this.key("algorithm").use(un),this.key("subjectPublicKey").bitstr());})):void 0;var dn=/*#__PURE__*/Object.freeze({__proto__:null,sign:nn,verify:an,validateParams:async function(e,t,r){const i=new $i(e);if(i.keyType!==ie.publicKey.ecdsa)return !1;switch(i.type){case"web":case"node":{const i=await vi(8),n=ie.hash.sha256,a=await zr.digest(n,i);try{const s=await nn(e,n,i,t,r,a);return await an(e,n,s,i,t,a)}catch(e){return !1}}default:return Xi(ie.publicKey.ecdsa,e,t,r)}}});gi.hash=e=>new Uint8Array(Ht().update(e).digest());var fn=/*#__PURE__*/Object.freeze({__proto__:null,sign:async function(e,t,r,i,n,a){if(zr.getHashByteLength(t)<zr.getHashByteLength(ie.hash.sha256))throw Error("Hash algorithm too weak: sha256 or stronger is required for EdDSA.");const s=Z.concatUint8Array([n,i.subarray(1)]),o=gi.sign.detached(a,s);return {r:o.subarray(0,32),s:o.subarray(32)}},verify:async function(e,t,{r,s:i},n,a,s){const o=Z.concatUint8Array([r,i]);return gi.sign.detached.verify(s,o,a.subarray(1))},validateParams:async function(e,t,r){if("ed25519"!==e.getName())return !1;const{publicKey:i}=gi.sign.keyPair.fromSeed(r),n=new Uint8Array([64,...i]);return Z.equalsUint8Array(t,n)}});function ln(e,t){const r=new We["aes"+8*e.length](e),i=new Uint32Array([2795939494,2795939494]),n=yn(t);let a=i;const s=n,o=n.length/2,c=new Uint32Array([0,0]);let u=new Uint32Array(4);for(let e=0;e<=5;++e)for(let t=0;t<o;++t)c[1]=o*e+(1+t),u[0]=a[0],u[1]=a[1],u[2]=s[2*t],u[3]=s[2*t+1],u=yn(r.encrypt(bn(u))),a=u.subarray(0,2),a[0]^=c[0],a[1]^=c[1],s[2*t]=u[2],s[2*t+1]=u[3];return bn(a,s)}function pn(e,t){const r=new We["aes"+8*e.length](e),i=new Uint32Array([2795939494,2795939494]),n=yn(t);let a=n.subarray(0,2);const s=n.subarray(2),o=n.length/2-1,c=new Uint32Array([0,0]);let u=new Uint32Array(4);for(let e=5;e>=0;--e)for(let t=o-1;t>=0;--t)c[1]=o*e+(t+1),u[0]=a[0]^c[0],u[1]=a[1]^c[1],u[2]=s[2*t],u[3]=s[2*t+1],u=yn(r.decrypt(bn(u))),a=u.subarray(0,2),s[2*t]=u[2],s[2*t+1]=u[3];if(a[0]===i[0]&&a[1]===i[1])return bn(s);throw Error("Key Data Integrity failed")}function yn(e){const{length:t}=e,r=function(e){if(Z.isString(e)){const{length:t}=e,r=new ArrayBuffer(t),i=new Uint8Array(r);for(let r=0;r<t;++r)i[r]=e.charCodeAt(r);return r}return new Uint8Array(e).buffer}(e),i=new DataView(r),n=new Uint32Array(t/4);for(let e=0;e<t/4;++e)n[e]=i.getUint32(4*e);return n}function bn(){let e=0;for(let t=0;t<arguments.length;++t)e+=4*arguments[t].length;const t=new ArrayBuffer(e),r=new DataView(t);let i=0;for(let e=0;e<arguments.length;++e){for(let t=0;t<arguments[e].length;++t)r.setUint32(i+4*t,arguments[e][t]);i+=4*arguments[e].length;}return new Uint8Array(t)}var mn=/*#__PURE__*/Object.freeze({__proto__:null,wrap:ln,unwrap:pn});function gn(e){const t=8-e.length%8,r=new Uint8Array(e.length+t).fill(t);return r.set(e),r}function wn(e){const t=e.length;if(t>0){const r=e[t-1];if(r>=1){const i=e.subarray(t-r),n=new Uint8Array(r).fill(r);if(Z.equalsUint8Array(i,n))return e.subarray(0,t-r)}}throw Error("Invalid padding")}var vn=/*#__PURE__*/Object.freeze({__proto__:null,encode:gn,decode:wn});const _n=Z.getWebCrypto(),kn=Z.getNodeCrypto();function An(e,t,r,i){return Z.concatUint8Array([t.write(),new Uint8Array([e]),r.write(),Z.stringToUint8Array("Anonymous Sender    "),i.subarray(0,20)])}async function Sn(e,t,r,i,n=!1,a=!1){let s;if(n){for(s=0;s<t.length&&0===t[s];s++);t=t.subarray(s);}if(a){for(s=t.length-1;s>=0&&0===t[s];s--);t=t.subarray(0,s+1);}return (await zr.digest(e,Z.concatUint8Array([new Uint8Array([0,0,0,1]),t,i]))).subarray(0,r)}async function En(e,t){switch(e.type){case"curve25519":{const r=await vi(32),{secretKey:i,sharedKey:n}=await xn(e,t,null,r);let{publicKey:a}=gi.box.keyPair.fromSecretKey(i);return a=Z.concatUint8Array([new Uint8Array([64]),a]),{publicKey:a,sharedKey:n}}case"web":if(e.web&&Z.getWebCrypto())try{return await async function(e,t){const r=Qi(e.payloadSize,e.web.web,t);let i=_n.generateKey({name:"ECDH",namedCurve:e.web.web},!0,["deriveKey","deriveBits"]),n=_n.importKey("jwk",r,{name:"ECDH",namedCurve:e.web.web},!1,[]);[i,n]=await Promise.all([i,n]);let a=_n.deriveBits({name:"ECDH",namedCurve:e.web.web,public:n},i.privateKey,e.web.sharedSize),s=_n.exportKey("jwk",i.publicKey);[a,s]=await Promise.all([a,s]);const o=new Uint8Array(a);return {publicKey:new Uint8Array(Ji(s)),sharedKey:o}}(e,t)}catch(e){Z.printDebugError(e);}break;case"node":return async function(e,t){const r=kn.createECDH(e.node.node);r.generateKeys();const i=new Uint8Array(r.computeSecret(t));return {publicKey:new Uint8Array(r.getPublicKey()),sharedKey:i}}(e,t)}return async function(e,t){const r=await ji(e.name),i=await e.genKeyPair();t=Li(r,t);const n=Ni(r,i.privateKey),a=i.publicKey,s=n.derive(t.getPublic()),o=r.curve.p.byteLength(),c=s.toArrayLike(Uint8Array,"be",o);return {publicKey:a,sharedKey:c}}(e,t)}async function xn(e,t,r,i){if(i.length!==e.payloadSize){const t=new Uint8Array(e.payloadSize);t.set(i,e.payloadSize-i.length),i=t;}switch(e.type){case"curve25519":{const e=i.slice().reverse();return {secretKey:e,sharedKey:gi.scalarMult(e,t.subarray(1))}}case"web":if(e.web&&Z.getWebCrypto())try{return await async function(e,t,r,i){const n=en(e.payloadSize,e.web.web,r,i);let a=_n.importKey("jwk",n,{name:"ECDH",namedCurve:e.web.web},!0,["deriveKey","deriveBits"]);const s=Qi(e.payloadSize,e.web.web,t);let o=_n.importKey("jwk",s,{name:"ECDH",namedCurve:e.web.web},!0,[]);[a,o]=await Promise.all([a,o]);let c=_n.deriveBits({name:"ECDH",namedCurve:e.web.web,public:o},a,e.web.sharedSize),u=_n.exportKey("jwk",a);[c,u]=await Promise.all([c,u]);const h=new Uint8Array(c);return {secretKey:ee(u.d),sharedKey:h}}(e,t,r,i)}catch(e){Z.printDebugError(e);}break;case"node":return async function(e,t,r){const i=kn.createECDH(e.node.node);i.setPrivateKey(r);const n=new Uint8Array(i.computeSecret(t));return {secretKey:new Uint8Array(i.getPrivateKey()),sharedKey:n}}(e,t,i)}return async function(e,t,r){const i=await ji(e.name);t=Li(i,t),r=Ni(i,r);const n=new Uint8Array(r.getPrivate()),a=r.derive(t.getPublic()),s=i.curve.p.byteLength(),o=a.toArrayLike(Uint8Array,"be",s);return {secretKey:n,sharedKey:o}}(e,t,i)}var Pn=/*#__PURE__*/Object.freeze({__proto__:null,validateParams:async function(e,t,r){return Xi(ie.publicKey.ecdh,e,t,r)},encrypt:async function(e,t,r,i,n){const a=gn(r),s=new $i(e),{publicKey:o,sharedKey:c}=await En(s,i),u=An(ie.publicKey.ecdh,e,t,n),h=ie.read(ie.symmetric,t.cipher);return {publicKey:o,wrappedKey:ln(await Sn(t.hash,c,We[h].keySize,u),a)}},decrypt:async function(e,t,r,i,n,a,s){const o=new $i(e),{sharedKey:c}=await xn(o,r,n,a),u=An(ie.publicKey.ecdh,e,t,s),h=ie.read(ie.symmetric,t.cipher);let d;for(let e=0;e<3;e++)try{return wn(pn(await Sn(t.hash,c,We[h].keySize,u,1===e,2===e),i))}catch(e){d=e;}throw d}});var Mn={rsa:qi,elgamal:Fi,elliptic:/*#__PURE__*/Object.freeze({__proto__:null,Curve:$i,ecdh:Pn,ecdsa:dn,eddsa:fn,generate:async function(e){const t=await Z.getBigInteger();e=new $i(e);const r=await e.genKeyPair(),i=new t(r.publicKey).toUint8Array(),n=new t(r.privateKey).toUint8Array("be",e.payloadSize);return {oid:e.oid,Q:i,secret:n,hash:e.hash,cipher:e.cipher}},getPreferredHashAlgo:function(e){return Yi[ie.write(ie.curve,e.toHex())].hash}}),dsa:/*#__PURE__*/Object.freeze({__proto__:null,sign:async function(e,t,r,i,n,a){const s=await Z.getBigInteger(),o=new s(1);let c,u,h,d;i=new s(i),n=new s(n),r=new s(r),a=new s(a),r=r.mod(i),a=a.mod(n);const f=new s(t.subarray(0,n.byteLength())).mod(n);for(;;){if(c=await _i(o,n),u=r.modExp(c,i).imod(n),u.isZero())continue;const e=a.mul(u).imod(n);if(d=f.add(e).imod(n),h=c.modInv(n).imul(d).imod(n),!h.isZero())break}return {r:u.toUint8Array("be",n.byteLength()),s:h.toUint8Array("be",n.byteLength())}},verify:async function(e,t,r,i,n,a,s,o){const c=await Z.getBigInteger(),u=new c(0);if(t=new c(t),r=new c(r),a=new c(a),s=new c(s),n=new c(n),o=new c(o),t.lte(u)||t.gte(s)||r.lte(u)||r.gte(s))return Z.printDebug("invalid DSA Signature"),!1;const h=new c(i.subarray(0,s.byteLength())).imod(s),d=r.modInv(s);if(d.isZero())return Z.printDebug("invalid DSA Signature"),!1;n=n.mod(a),o=o.mod(a);const f=h.mul(d).imod(s),l=t.mul(d).imod(s),p=n.modExp(f,a),y=o.modExp(l,a);return p.mul(y).imod(a).imod(s).equal(t)},validateParams:async function(e,t,r,i,n){const a=await Z.getBigInteger();e=new a(e),t=new a(t),r=new a(r),i=new a(i);const s=new a(1);if(r.lte(s)||r.gte(e))return !1;if(!e.dec().mod(t).isZero())return !1;if(!r.modExp(t,e).isOne())return !1;const o=new a(t.bitLength()),c=new a(150);if(o.lt(c)||!await Ei(t,null,32))return !1;n=new a(n);const u=new a(2),h=await _i(u.leftShift(o.dec()),u.leftShift(o)),d=t.mul(h).add(n);return !!i.equal(r.modExp(d,e))}}),nacl:gi};var Cn=/*#__PURE__*/Object.freeze({__proto__:null,parseSignatureParams:function(e,t){let r=0;switch(e){case ie.publicKey.rsaEncryptSign:case ie.publicKey.rsaEncrypt:case ie.publicKey.rsaSign:return {s:Z.readMPI(t.subarray(r))};case ie.publicKey.dsa:case ie.publicKey.ecdsa:{const e=Z.readMPI(t.subarray(r));return r+=e.length+2,{r:e,s:Z.readMPI(t.subarray(r))}}case ie.publicKey.eddsa:{let e=Z.readMPI(t.subarray(r));r+=e.length+2,e=Z.leftPad(e,32);let i=Z.readMPI(t.subarray(r));return i=Z.leftPad(i,32),{r:e,s:i}}default:throw Error("Invalid signature algorithm.")}},verify:async function(e,t,r,i,n,a){switch(e){case ie.publicKey.rsaEncryptSign:case ie.publicKey.rsaEncrypt:case ie.publicKey.rsaSign:{const{n:e,e:s}=i,o=Z.leftPad(r.s,e.length);return Mn.rsa.verify(t,n,o,e,s,a)}case ie.publicKey.dsa:{const{g:e,p:n,q:s,y:o}=i,{r:c,s:u}=r;return Mn.dsa.verify(t,c,u,a,e,n,s,o)}case ie.publicKey.ecdsa:{const{oid:e,Q:s}=i,o=new Mn.elliptic.Curve(e).payloadSize,c=Z.leftPad(r.r,o),u=Z.leftPad(r.s,o);return Mn.elliptic.ecdsa.verify(e,t,{r:c,s:u},n,s,a)}case ie.publicKey.eddsa:{const{oid:e,Q:s}=i;return Mn.elliptic.eddsa.verify(e,t,r,n,s,a)}default:throw Error("Invalid signature algorithm.")}},sign:async function(e,t,r,i,n,a){if(!r||!i)throw Error("Missing key parameters");switch(e){case ie.publicKey.rsaEncryptSign:case ie.publicKey.rsaEncrypt:case ie.publicKey.rsaSign:{const{n:e,e:s}=r,{d:o,p:c,q:u,u:h}=i;return {s:await Mn.rsa.sign(t,n,e,s,o,c,u,h,a)}}case ie.publicKey.dsa:{const{g:e,p:n,q:s}=r,{x:o}=i;return Mn.dsa.sign(t,a,e,n,s,o)}case ie.publicKey.elgamal:throw Error("Signing with Elgamal is not defined in the OpenPGP standard.");case ie.publicKey.ecdsa:{const{oid:e,Q:s}=r,{d:o}=i;return Mn.elliptic.ecdsa.sign(e,t,n,s,o,a)}case ie.publicKey.eddsa:{const{oid:e,Q:s}=r,{seed:o}=i;return Mn.elliptic.eddsa.sign(e,t,n,s,o,a)}default:throw Error("Invalid signature algorithm.")}}});class Kn{constructor(e){e=void 0===e?new Uint8Array([]):Z.isString(e)?Z.stringToUint8Array(e):new Uint8Array(e),this.data=e;}read(e){if(e.length>=1){const t=e[0];if(e.length>=1+t)return this.data=e.subarray(1,1+t),1+this.data.length}throw Error("Invalid symmetric key")}write(){return Z.concatUint8Array([new Uint8Array([this.data.length]),this.data])}}class Dn{constructor(e){if(e){const{hash:t,cipher:r}=e;this.hash=t,this.cipher=r;}else this.hash=null,this.cipher=null;}read(e){if(e.length<4||3!==e[0]||1!==e[1])throw Error("Cannot read KDFParams");return this.hash=e[2],this.cipher=e[3],4}write(){return new Uint8Array([3,1,this.hash,this.cipher])}}var Rn=/*#__PURE__*/Object.freeze({__proto__:null,publicKeyEncrypt:async function(e,t,r,i){switch(e){case ie.publicKey.rsaEncrypt:case ie.publicKey.rsaEncryptSign:{const{n:e,e:i}=t;return {c:await Mn.rsa.encrypt(r,e,i)}}case ie.publicKey.elgamal:{const{p:e,g:i,y:n}=t;return Mn.elgamal.encrypt(r,e,i,n)}case ie.publicKey.ecdh:{const{oid:e,Q:n,kdfParams:a}=t,{publicKey:s,wrappedKey:o}=await Mn.elliptic.ecdh.encrypt(e,a,r,n,i);return {V:s,C:new Kn(o)}}default:return []}},publicKeyDecrypt:async function(e,t,r,i,n){switch(e){case ie.publicKey.rsaEncryptSign:case ie.publicKey.rsaEncrypt:{const{c:e}=i,{n,e:a}=t,{d:s,p:o,q:c,u}=r;return Mn.rsa.decrypt(e,n,a,s,o,c,u)}case ie.publicKey.elgamal:{const{c1:e,c2:n}=i,a=t.p,s=r.x;return Mn.elgamal.decrypt(e,n,a,s)}case ie.publicKey.ecdh:{const{oid:e,Q:a,kdfParams:s}=t,{d:o}=r,{V:c,C:u}=i;return Mn.elliptic.ecdh.decrypt(e,s,c,u.data,a,o,n)}default:throw Error("Invalid public key encryption algorithm.")}},parsePublicKeyParams:function(e,t){let r=0;switch(e){case ie.publicKey.rsaEncrypt:case ie.publicKey.rsaEncryptSign:case ie.publicKey.rsaSign:{const e=Z.readMPI(t.subarray(r));r+=e.length+2;const i=Z.readMPI(t.subarray(r));return r+=i.length+2,{read:r,publicParams:{n:e,e:i}}}case ie.publicKey.dsa:{const e=Z.readMPI(t.subarray(r));r+=e.length+2;const i=Z.readMPI(t.subarray(r));r+=i.length+2;const n=Z.readMPI(t.subarray(r));r+=n.length+2;const a=Z.readMPI(t.subarray(r));return r+=a.length+2,{read:r,publicParams:{p:e,q:i,g:n,y:a}}}case ie.publicKey.elgamal:{const e=Z.readMPI(t.subarray(r));r+=e.length+2;const i=Z.readMPI(t.subarray(r));r+=i.length+2;const n=Z.readMPI(t.subarray(r));return r+=n.length+2,{read:r,publicParams:{p:e,g:i,y:n}}}case ie.publicKey.ecdsa:{const e=new Oi;r+=e.read(t);const i=Z.readMPI(t.subarray(r));return r+=i.length+2,{read:r,publicParams:{oid:e,Q:i}}}case ie.publicKey.eddsa:{const e=new Oi;r+=e.read(t);let i=Z.readMPI(t.subarray(r));return r+=i.length+2,i=Z.leftPad(i,33),{read:r,publicParams:{oid:e,Q:i}}}case ie.publicKey.ecdh:{const e=new Oi;r+=e.read(t);const i=Z.readMPI(t.subarray(r));r+=i.length+2;const n=new Dn;return r+=n.read(t.subarray(r)),{read:r,publicParams:{oid:e,Q:i,kdfParams:n}}}default:throw Error("Invalid public key encryption algorithm.")}},parsePrivateKeyParams:function(e,t,r){let i=0;switch(e){case ie.publicKey.rsaEncrypt:case ie.publicKey.rsaEncryptSign:case ie.publicKey.rsaSign:{const e=Z.readMPI(t.subarray(i));i+=e.length+2;const r=Z.readMPI(t.subarray(i));i+=r.length+2;const n=Z.readMPI(t.subarray(i));i+=n.length+2;const a=Z.readMPI(t.subarray(i));return i+=a.length+2,{read:i,privateParams:{d:e,p:r,q:n,u:a}}}case ie.publicKey.dsa:case ie.publicKey.elgamal:{const e=Z.readMPI(t.subarray(i));return i+=e.length+2,{read:i,privateParams:{x:e}}}case ie.publicKey.ecdsa:case ie.publicKey.ecdh:{const e=new $i(r.oid);let n=Z.readMPI(t.subarray(i));return i+=n.length+2,n=Z.leftPad(n,e.payloadSize),{read:i,privateParams:{d:n}}}case ie.publicKey.eddsa:{let e=Z.readMPI(t.subarray(i));return i+=e.length+2,e=Z.leftPad(e,32),{read:i,privateParams:{seed:e}}}default:throw Error("Invalid public key encryption algorithm.")}},parseEncSessionKeyParams:function(e,t){let r=0;switch(e){case ie.publicKey.rsaEncrypt:case ie.publicKey.rsaEncryptSign:return {c:Z.readMPI(t.subarray(r))};case ie.publicKey.elgamal:{const e=Z.readMPI(t.subarray(r));return r+=e.length+2,{c1:e,c2:Z.readMPI(t.subarray(r))}}case ie.publicKey.ecdh:{const e=Z.readMPI(t.subarray(r));r+=e.length+2;const i=new Kn;return i.read(t.subarray(r)),{V:e,C:i}}default:throw Error("Invalid public key encryption algorithm.")}},serializeParams:function(e,t){const r=Object.keys(t).map(e=>{const r=t[e];return Z.isUint8Array(r)?Z.uint8ArrayToMPI(r):r.write()});return Z.concatUint8Array(r)},generateParams:function(e,t,r){switch(e){case ie.publicKey.rsaEncrypt:case ie.publicKey.rsaEncryptSign:case ie.publicKey.rsaSign:return Mn.rsa.generate(t,65537).then(({n:e,e:t,d:r,p:i,q:n,u:a})=>({privateParams:{d:r,p:i,q:n,u:a},publicParams:{n:e,e:t}}));case ie.publicKey.ecdsa:return Mn.elliptic.generate(r).then(({oid:e,Q:t,secret:r})=>({privateParams:{d:r},publicParams:{oid:new Oi(e),Q:t}}));case ie.publicKey.eddsa:return Mn.elliptic.generate(r).then(({oid:e,Q:t,secret:r})=>({privateParams:{seed:r},publicParams:{oid:new Oi(e),Q:t}}));case ie.publicKey.ecdh:return Mn.elliptic.generate(r).then(({oid:e,Q:t,secret:r,hash:i,cipher:n})=>({privateParams:{d:r},publicParams:{oid:new Oi(e),Q:t,kdfParams:new Dn({hash:i,cipher:n})}}));case ie.publicKey.dsa:case ie.publicKey.elgamal:throw Error("Unsupported algorithm for key generation.");default:throw Error("Invalid public key algorithm.")}},validateParams:async function(e,t,r){if(!t||!r)throw Error("Missing key parameters");switch(e){case ie.publicKey.rsaEncrypt:case ie.publicKey.rsaEncryptSign:case ie.publicKey.rsaSign:{const{n:e,e:i}=t,{d:n,p:a,q:s,u:o}=r;return Mn.rsa.validateParams(e,i,n,a,s,o)}case ie.publicKey.dsa:{const{p:e,q:i,g:n,y:a}=t,{x:s}=r;return Mn.dsa.validateParams(e,i,n,a,s)}case ie.publicKey.elgamal:{const{p:e,g:i,y:n}=t,{x:a}=r;return Mn.elgamal.validateParams(e,i,n,a)}case ie.publicKey.ecdsa:case ie.publicKey.ecdh:{const i=Mn.elliptic[ie.read(ie.publicKey,e)],{oid:n,Q:a}=t,{d:s}=r;return i.validateParams(n,a,s)}case ie.publicKey.eddsa:{const{oid:e,Q:i}=t,{seed:n}=r;return Mn.elliptic.eddsa.validateParams(e,i,n)}default:throw Error("Invalid public key algorithm.")}},getPrefixRandom:async function(e){const t=await vi(We[e].blockSize),r=new Uint8Array([t[t.length-2],t[t.length-1]]);return Z.concat([t,r])},generateSessionKey:function(e){return vi(We[e].keySize)}});const In={cipher:We,hash:zr,mode:mi,publicKey:Mn,signature:Cn,random:Ai,pkcs1:Di,pkcs5:vn,aesKW:mn};Object.assign(In,Rn);var Un="undefined"!=typeof Uint8Array&&"undefined"!=typeof Uint16Array&&"undefined"!=typeof Int32Array;function Bn(e,t){return e.length===t?e:e.subarray?e.subarray(0,t):(e.length=t,e)}const Tn={arraySet:function(e,t,r,i,n){if(t.subarray&&e.subarray)e.set(t.subarray(r,r+i),n);else for(let a=0;a<i;a++)e[n+a]=t[r+a];},flattenChunks:function(e){let t,r,i,n,a;for(i=0,t=0,r=e.length;t<r;t++)i+=e[t].length;const s=new Uint8Array(i);for(n=0,t=0,r=e.length;t<r;t++)a=e[t],s.set(a,n),n+=a.length;return s}},zn={arraySet:function(e,t,r,i,n){for(let a=0;a<i;a++)e[n+a]=t[r+a];},flattenChunks:function(e){return [].concat.apply([],e)}};let qn=Un?Uint8Array:Array,Fn=Un?Uint16Array:Array,On=Un?Int32Array:Array,Nn=Un?Tn.flattenChunks:zn.flattenChunks,Ln=Un?Tn.arraySet:zn.arraySet;function jn(e){let t=e.length;for(;--t>=0;)e[t]=0;}const Wn=[0,0,0,0,0,0,0,0,1,1,1,1,2,2,2,2,3,3,3,3,4,4,4,4,5,5,5,5,0],Hn=[0,0,0,0,1,1,2,2,3,3,4,4,5,5,6,6,7,7,8,8,9,9,10,10,11,11,12,12,13,13],Gn=[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,3,7],Vn=[16,17,18,0,8,7,9,6,10,5,11,4,12,3,13,2,14,1,15],Zn=Array(576);jn(Zn);const Yn=Array(60);jn(Yn);const $n=Array(512);jn($n);const Xn=Array(256);jn(Xn);const Jn=Array(29);jn(Jn);const Qn=Array(30);function ea(e,t,r,i,n){this.static_tree=e,this.extra_bits=t,this.extra_base=r,this.elems=i,this.max_length=n,this.has_stree=e&&e.length;}let ta,ra,ia;function na(e,t){this.dyn_tree=e,this.max_code=0,this.stat_desc=t;}function aa(e){return e<256?$n[e]:$n[256+(e>>>7)]}function sa(e,t){e.pending_buf[e.pending++]=255&t,e.pending_buf[e.pending++]=t>>>8&255;}function oa(e,t,r){e.bi_valid>16-r?(e.bi_buf|=t<<e.bi_valid&65535,sa(e,e.bi_buf),e.bi_buf=t>>16-e.bi_valid,e.bi_valid+=r-16):(e.bi_buf|=t<<e.bi_valid&65535,e.bi_valid+=r);}function ca(e,t,r){oa(e,r[2*t],r[2*t+1]);}function ua(e,t){let r=0;do{r|=1&e,e>>>=1,r<<=1;}while(--t>0);return r>>>1}function ha(e,t,r){const i=Array(16);let n,a,s=0;for(n=1;n<=15;n++)i[n]=s=s+r[n-1]<<1;for(a=0;a<=t;a++){const t=e[2*a+1];0!==t&&(e[2*a]=ua(i[t]++,t));}}function da(e){let t;for(t=0;t<286;t++)e.dyn_ltree[2*t]=0;for(t=0;t<30;t++)e.dyn_dtree[2*t]=0;for(t=0;t<19;t++)e.bl_tree[2*t]=0;e.dyn_ltree[512]=1,e.opt_len=e.static_len=0,e.last_lit=e.matches=0;}function fa(e){e.bi_valid>8?sa(e,e.bi_buf):e.bi_valid>0&&(e.pending_buf[e.pending++]=e.bi_buf),e.bi_buf=0,e.bi_valid=0;}function la(e,t,r,i){const n=2*t,a=2*r;return e[n]<e[a]||e[n]===e[a]&&i[t]<=i[r]}function pa(e,t,r){const i=e.heap[r];let n=r<<1;for(;n<=e.heap_len&&(n<e.heap_len&&la(t,e.heap[n+1],e.heap[n],e.depth)&&n++,!la(t,i,e.heap[n],e.depth));)e.heap[r]=e.heap[n],r=n,n<<=1;e.heap[r]=i;}function ya(e,t,r){let i,n,a,s,o=0;if(0!==e.last_lit)do{i=e.pending_buf[e.d_buf+2*o]<<8|e.pending_buf[e.d_buf+2*o+1],n=e.pending_buf[e.l_buf+o],o++,0===i?ca(e,n,t):(a=Xn[n],ca(e,a+256+1,t),s=Wn[a],0!==s&&(n-=Jn[a],oa(e,n,s)),i--,a=aa(i),ca(e,a,r),s=Hn[a],0!==s&&(i-=Qn[a],oa(e,i,s)));}while(o<e.last_lit);ca(e,256,t);}function ba(e,t){const r=t.dyn_tree,i=t.stat_desc.static_tree,n=t.stat_desc.has_stree,a=t.stat_desc.elems;let s,o,c,u=-1;for(e.heap_len=0,e.heap_max=573,s=0;s<a;s++)0!==r[2*s]?(e.heap[++e.heap_len]=u=s,e.depth[s]=0):r[2*s+1]=0;for(;e.heap_len<2;)c=e.heap[++e.heap_len]=u<2?++u:0,r[2*c]=1,e.depth[c]=0,e.opt_len--,n&&(e.static_len-=i[2*c+1]);for(t.max_code=u,s=e.heap_len>>1;s>=1;s--)pa(e,r,s);c=a;do{s=e.heap[1],e.heap[1]=e.heap[e.heap_len--],pa(e,r,1),o=e.heap[1],e.heap[--e.heap_max]=s,e.heap[--e.heap_max]=o,r[2*c]=r[2*s]+r[2*o],e.depth[c]=(e.depth[s]>=e.depth[o]?e.depth[s]:e.depth[o])+1,r[2*s+1]=r[2*o+1]=c,e.heap[1]=c++,pa(e,r,1);}while(e.heap_len>=2);e.heap[--e.heap_max]=e.heap[1],function(e,t){const r=t.dyn_tree,i=t.max_code,n=t.stat_desc.static_tree,a=t.stat_desc.has_stree,s=t.stat_desc.extra_bits,o=t.stat_desc.extra_base,c=t.stat_desc.max_length;let u,h,d,f,l,p,y=0;for(f=0;f<=15;f++)e.bl_count[f]=0;for(r[2*e.heap[e.heap_max]+1]=0,u=e.heap_max+1;u<573;u++)h=e.heap[u],f=r[2*r[2*h+1]+1]+1,f>c&&(f=c,y++),r[2*h+1]=f,h>i||(e.bl_count[f]++,l=0,h>=o&&(l=s[h-o]),p=r[2*h],e.opt_len+=p*(f+l),a&&(e.static_len+=p*(n[2*h+1]+l)));if(0!==y){do{for(f=c-1;0===e.bl_count[f];)f--;e.bl_count[f]--,e.bl_count[f+1]+=2,e.bl_count[c]--,y-=2;}while(y>0);for(f=c;0!==f;f--)for(h=e.bl_count[f];0!==h;)d=e.heap[--u],d>i||(r[2*d+1]!==f&&(e.opt_len+=(f-r[2*d+1])*r[2*d],r[2*d+1]=f),h--);}}(e,t),ha(r,u,e.bl_count);}function ma(e,t,r){let i,n,a=-1,s=t[1],o=0,c=7,u=4;for(0===s&&(c=138,u=3),t[2*(r+1)+1]=65535,i=0;i<=r;i++)n=s,s=t[2*(i+1)+1],++o<c&&n===s||(o<u?e.bl_tree[2*n]+=o:0!==n?(n!==a&&e.bl_tree[2*n]++,e.bl_tree[32]++):o<=10?e.bl_tree[34]++:e.bl_tree[36]++,o=0,a=n,0===s?(c=138,u=3):n===s?(c=6,u=3):(c=7,u=4));}function ga(e,t,r){let i,n,a=-1,s=t[1],o=0,c=7,u=4;for(0===s&&(c=138,u=3),i=0;i<=r;i++)if(n=s,s=t[2*(i+1)+1],!(++o<c&&n===s)){if(o<u)do{ca(e,n,e.bl_tree);}while(0!=--o);else 0!==n?(n!==a&&(ca(e,n,e.bl_tree),o--),ca(e,16,e.bl_tree),oa(e,o-3,2)):o<=10?(ca(e,17,e.bl_tree),oa(e,o-3,3)):(ca(e,18,e.bl_tree),oa(e,o-11,7));o=0,a=n,0===s?(c=138,u=3):n===s?(c=6,u=3):(c=7,u=4);}}jn(Qn);let wa=!1;function va(e){wa||(!function(){let e,t,r,i,n;const a=Array(16);for(r=0,i=0;i<28;i++)for(Jn[i]=r,e=0;e<1<<Wn[i];e++)Xn[r++]=i;for(Xn[r-1]=i,n=0,i=0;i<16;i++)for(Qn[i]=n,e=0;e<1<<Hn[i];e++)$n[n++]=i;for(n>>=7;i<30;i++)for(Qn[i]=n<<7,e=0;e<1<<Hn[i]-7;e++)$n[256+n++]=i;for(t=0;t<=15;t++)a[t]=0;for(e=0;e<=143;)Zn[2*e+1]=8,e++,a[8]++;for(;e<=255;)Zn[2*e+1]=9,e++,a[9]++;for(;e<=279;)Zn[2*e+1]=7,e++,a[7]++;for(;e<=287;)Zn[2*e+1]=8,e++,a[8]++;for(ha(Zn,287,a),e=0;e<30;e++)Yn[2*e+1]=5,Yn[2*e]=ua(e,5);ta=new ea(Zn,Wn,257,286,15),ra=new ea(Yn,Hn,0,30,15),ia=new ea([],Gn,0,19,7);}(),wa=!0),e.l_desc=new na(e.dyn_ltree,ta),e.d_desc=new na(e.dyn_dtree,ra),e.bl_desc=new na(e.bl_tree,ia),e.bi_buf=0,e.bi_valid=0,da(e);}function _a(e,t,r,i){oa(e,0+(i?1:0),3),function(e,t,r,i){fa(e),i&&(sa(e,r),sa(e,~r)),Ln(e.pending_buf,e.window,t,r,e.pending),e.pending+=r;}(e,t,r,!0);}function ka(e){oa(e,2,3),ca(e,256,Zn),function(e){16===e.bi_valid?(sa(e,e.bi_buf),e.bi_buf=0,e.bi_valid=0):e.bi_valid>=8&&(e.pending_buf[e.pending++]=255&e.bi_buf,e.bi_buf>>=8,e.bi_valid-=8);}(e);}function Aa(e,t,r,i){let n,a,s=0;e.level>0?(2===e.strm.data_type&&(e.strm.data_type=function(e){let t,r=4093624447;for(t=0;t<=31;t++,r>>>=1)if(1&r&&0!==e.dyn_ltree[2*t])return 0;if(0!==e.dyn_ltree[18]||0!==e.dyn_ltree[20]||0!==e.dyn_ltree[26])return 1;for(t=32;t<256;t++)if(0!==e.dyn_ltree[2*t])return 1;return 0}(e)),ba(e,e.l_desc),ba(e,e.d_desc),s=function(e){let t;for(ma(e,e.dyn_ltree,e.l_desc.max_code),ma(e,e.dyn_dtree,e.d_desc.max_code),ba(e,e.bl_desc),t=18;t>=3&&0===e.bl_tree[2*Vn[t]+1];t--);return e.opt_len+=3*(t+1)+5+5+4,t}(e),n=e.opt_len+3+7>>>3,a=e.static_len+3+7>>>3,a<=n&&(n=a)):n=a=r+5,r+4<=n&&-1!==t?_a(e,t,r,i):4===e.strategy||a===n?(oa(e,2+(i?1:0),3),ya(e,Zn,Yn)):(oa(e,4+(i?1:0),3),function(e,t,r,i){let n;for(oa(e,t-257,5),oa(e,r-1,5),oa(e,i-4,4),n=0;n<i;n++)oa(e,e.bl_tree[2*Vn[n]+1],3);ga(e,e.dyn_ltree,t-1),ga(e,e.dyn_dtree,r-1);}(e,e.l_desc.max_code+1,e.d_desc.max_code+1,s+1),ya(e,e.dyn_ltree,e.dyn_dtree)),da(e),i&&fa(e);}function Sa(e,t,r){return e.pending_buf[e.d_buf+2*e.last_lit]=t>>>8&255,e.pending_buf[e.d_buf+2*e.last_lit+1]=255&t,e.pending_buf[e.l_buf+e.last_lit]=255&r,e.last_lit++,0===t?e.dyn_ltree[2*r]++:(e.matches++,t--,e.dyn_ltree[2*(Xn[r]+256+1)]++,e.dyn_dtree[2*aa(t)]++),e.last_lit===e.lit_bufsize-1}function Ea(e,t,r,i){let n=65535&e|0,a=e>>>16&65535|0,s=0;for(;0!==r;){s=r>2e3?2e3:r,r-=s;do{n=n+t[i++]|0,a=a+n|0;}while(--s);n%=65521,a%=65521;}return n|a<<16|0}const xa=function(){let e;const t=[];for(let r=0;r<256;r++){e=r;for(let t=0;t<8;t++)e=1&e?3988292384^e>>>1:e>>>1;t[r]=e;}return t}();function Pa(e,t,r,i){const n=xa,a=i+r;e^=-1;for(let r=i;r<a;r++)e=e>>>8^n[255&(e^t[r])];return -1^e}var Ma={2:"need dictionary",1:"stream end",0:"","-1":"file error","-2":"stream error","-3":"data error","-4":"insufficient memory","-5":"buffer error","-6":"incompatible version"};function Ca(e,t){return e.msg=Ma[t],t}function Ka(e){return (e<<1)-(e>4?9:0)}function Da(e){let t=e.length;for(;--t>=0;)e[t]=0;}function Ra(e){const t=e.state;let r=t.pending;r>e.avail_out&&(r=e.avail_out),0!==r&&(Ln(e.output,t.pending_buf,t.pending_out,r,e.next_out),e.next_out+=r,t.pending_out+=r,e.total_out+=r,e.avail_out-=r,t.pending-=r,0===t.pending&&(t.pending_out=0));}function Ia(e,t){Aa(e,e.block_start>=0?e.block_start:-1,e.strstart-e.block_start,t),e.block_start=e.strstart,Ra(e.strm);}function Ua(e,t){e.pending_buf[e.pending++]=t;}function Ba(e,t){e.pending_buf[e.pending++]=t>>>8&255,e.pending_buf[e.pending++]=255&t;}function Ta(e,t,r,i){let n=e.avail_in;return n>i&&(n=i),0===n?0:(e.avail_in-=n,Ln(t,e.input,e.next_in,n,r),1===e.state.wrap?e.adler=Ea(e.adler,t,n,r):2===e.state.wrap&&(e.adler=Pa(e.adler,t,n,r)),e.next_in+=n,e.total_in+=n,n)}function za(e,t){let r,i,n=e.max_chain_length,a=e.strstart,s=e.prev_length,o=e.nice_match;const c=e.strstart>e.w_size-262?e.strstart-(e.w_size-262):0,u=e.window,h=e.w_mask,d=e.prev,f=e.strstart+258;let l=u[a+s-1],p=u[a+s];e.prev_length>=e.good_match&&(n>>=2),o>e.lookahead&&(o=e.lookahead);do{if(r=t,u[r+s]===p&&u[r+s-1]===l&&u[r]===u[a]&&u[++r]===u[a+1]){a+=2,r++;do{}while(u[++a]===u[++r]&&u[++a]===u[++r]&&u[++a]===u[++r]&&u[++a]===u[++r]&&u[++a]===u[++r]&&u[++a]===u[++r]&&u[++a]===u[++r]&&u[++a]===u[++r]&&a<f);if(i=258-(f-a),a=f-258,i>s){if(e.match_start=t,s=i,i>=o)break;l=u[a+s-1],p=u[a+s];}}}while((t=d[t&h])>c&&0!=--n);return s<=e.lookahead?s:e.lookahead}function qa(e){const t=e.w_size;let r,i,n,a,s;do{if(a=e.window_size-e.lookahead-e.strstart,e.strstart>=t+(t-262)){Ln(e.window,e.window,t,t,0),e.match_start-=t,e.strstart-=t,e.block_start-=t,i=e.hash_size,r=i;do{n=e.head[--r],e.head[r]=n>=t?n-t:0;}while(--i);i=t,r=i;do{n=e.prev[--r],e.prev[r]=n>=t?n-t:0;}while(--i);a+=t;}if(0===e.strm.avail_in)break;if(i=Ta(e.strm,e.window,e.strstart+e.lookahead,a),e.lookahead+=i,e.lookahead+e.insert>=3)for(s=e.strstart-e.insert,e.ins_h=e.window[s],e.ins_h=(e.ins_h<<e.hash_shift^e.window[s+1])&e.hash_mask;e.insert&&(e.ins_h=(e.ins_h<<e.hash_shift^e.window[s+3-1])&e.hash_mask,e.prev[s&e.w_mask]=e.head[e.ins_h],e.head[e.ins_h]=s,s++,e.insert--,!(e.lookahead+e.insert<3)););}while(e.lookahead<262&&0!==e.strm.avail_in)}function Fa(e,t){let r,i;for(;;){if(e.lookahead<262){if(qa(e),e.lookahead<262&&0===t)return 1;if(0===e.lookahead)break}if(r=0,e.lookahead>=3&&(e.ins_h=(e.ins_h<<e.hash_shift^e.window[e.strstart+3-1])&e.hash_mask,r=e.prev[e.strstart&e.w_mask]=e.head[e.ins_h],e.head[e.ins_h]=e.strstart),0!==r&&e.strstart-r<=e.w_size-262&&(e.match_length=za(e,r)),e.match_length>=3)if(i=Sa(e,e.strstart-e.match_start,e.match_length-3),e.lookahead-=e.match_length,e.match_length<=e.max_lazy_match&&e.lookahead>=3){e.match_length--;do{e.strstart++,e.ins_h=(e.ins_h<<e.hash_shift^e.window[e.strstart+3-1])&e.hash_mask,r=e.prev[e.strstart&e.w_mask]=e.head[e.ins_h],e.head[e.ins_h]=e.strstart;}while(0!=--e.match_length);e.strstart++;}else e.strstart+=e.match_length,e.match_length=0,e.ins_h=e.window[e.strstart],e.ins_h=(e.ins_h<<e.hash_shift^e.window[e.strstart+1])&e.hash_mask;else i=Sa(e,0,e.window[e.strstart]),e.lookahead--,e.strstart++;if(i&&(Ia(e,!1),0===e.strm.avail_out))return 1}return e.insert=e.strstart<2?e.strstart:2,4===t?(Ia(e,!0),0===e.strm.avail_out?3:4):e.last_lit&&(Ia(e,!1),0===e.strm.avail_out)?1:2}function Oa(e,t){let r,i,n;for(;;){if(e.lookahead<262){if(qa(e),e.lookahead<262&&0===t)return 1;if(0===e.lookahead)break}if(r=0,e.lookahead>=3&&(e.ins_h=(e.ins_h<<e.hash_shift^e.window[e.strstart+3-1])&e.hash_mask,r=e.prev[e.strstart&e.w_mask]=e.head[e.ins_h],e.head[e.ins_h]=e.strstart),e.prev_length=e.match_length,e.prev_match=e.match_start,e.match_length=2,0!==r&&e.prev_length<e.max_lazy_match&&e.strstart-r<=e.w_size-262&&(e.match_length=za(e,r),e.match_length<=5&&(1===e.strategy||3===e.match_length&&e.strstart-e.match_start>4096)&&(e.match_length=2)),e.prev_length>=3&&e.match_length<=e.prev_length){n=e.strstart+e.lookahead-3,i=Sa(e,e.strstart-1-e.prev_match,e.prev_length-3),e.lookahead-=e.prev_length-1,e.prev_length-=2;do{++e.strstart<=n&&(e.ins_h=(e.ins_h<<e.hash_shift^e.window[e.strstart+3-1])&e.hash_mask,r=e.prev[e.strstart&e.w_mask]=e.head[e.ins_h],e.head[e.ins_h]=e.strstart);}while(0!=--e.prev_length);if(e.match_available=0,e.match_length=2,e.strstart++,i&&(Ia(e,!1),0===e.strm.avail_out))return 1}else if(e.match_available){if(i=Sa(e,0,e.window[e.strstart-1]),i&&Ia(e,!1),e.strstart++,e.lookahead--,0===e.strm.avail_out)return 1}else e.match_available=1,e.strstart++,e.lookahead--;}return e.match_available&&(i=Sa(e,0,e.window[e.strstart-1]),e.match_available=0),e.insert=e.strstart<2?e.strstart:2,4===t?(Ia(e,!0),0===e.strm.avail_out?3:4):e.last_lit&&(Ia(e,!1),0===e.strm.avail_out)?1:2}class Na{constructor(e,t,r,i,n){this.good_length=e,this.max_lazy=t,this.nice_length=r,this.max_chain=i,this.func=n;}}const La=[new Na(0,0,0,0,(function(e,t){let r=65535;for(r>e.pending_buf_size-5&&(r=e.pending_buf_size-5);;){if(e.lookahead<=1){if(qa(e),0===e.lookahead&&0===t)return 1;if(0===e.lookahead)break}e.strstart+=e.lookahead,e.lookahead=0;const i=e.block_start+r;if((0===e.strstart||e.strstart>=i)&&(e.lookahead=e.strstart-i,e.strstart=i,Ia(e,!1),0===e.strm.avail_out))return 1;if(e.strstart-e.block_start>=e.w_size-262&&(Ia(e,!1),0===e.strm.avail_out))return 1}return e.insert=0,4===t?(Ia(e,!0),0===e.strm.avail_out?3:4):(e.strstart>e.block_start&&(Ia(e,!1),e.strm.avail_out),1)})),new Na(4,4,8,4,Fa),new Na(4,5,16,8,Fa),new Na(4,6,32,32,Fa),new Na(4,4,16,16,Oa),new Na(8,16,32,32,Oa),new Na(8,16,128,128,Oa),new Na(8,32,128,256,Oa),new Na(32,128,258,1024,Oa),new Na(32,258,258,4096,Oa)];class ja{constructor(){this.strm=null,this.status=0,this.pending_buf=null,this.pending_buf_size=0,this.pending_out=0,this.pending=0,this.wrap=0,this.gzhead=null,this.gzindex=0,this.method=8,this.last_flush=-1,this.w_size=0,this.w_bits=0,this.w_mask=0,this.window=null,this.window_size=0,this.prev=null,this.head=null,this.ins_h=0,this.hash_size=0,this.hash_bits=0,this.hash_mask=0,this.hash_shift=0,this.block_start=0,this.match_length=0,this.prev_match=0,this.match_available=0,this.strstart=0,this.match_start=0,this.lookahead=0,this.prev_length=0,this.max_chain_length=0,this.max_lazy_match=0,this.level=0,this.strategy=0,this.good_match=0,this.nice_match=0,this.dyn_ltree=new Fn(1146),this.dyn_dtree=new Fn(122),this.bl_tree=new Fn(78),Da(this.dyn_ltree),Da(this.dyn_dtree),Da(this.bl_tree),this.l_desc=null,this.d_desc=null,this.bl_desc=null,this.bl_count=new Fn(16),this.heap=new Fn(573),Da(this.heap),this.heap_len=0,this.heap_max=0,this.depth=new Fn(573),Da(this.depth),this.l_buf=0,this.lit_bufsize=0,this.last_lit=0,this.d_buf=0,this.opt_len=0,this.static_len=0,this.matches=0,this.insert=0,this.bi_buf=0,this.bi_valid=0;}}function Wa(e){const t=function(e){let t;return e&&e.state?(e.total_in=e.total_out=0,e.data_type=2,t=e.state,t.pending=0,t.pending_out=0,t.wrap<0&&(t.wrap=-t.wrap),t.status=t.wrap?42:113,e.adler=2===t.wrap?0:1,t.last_flush=0,va(t),0):Ca(e,-2)}(e);return 0===t&&function(e){e.window_size=2*e.w_size,Da(e.head),e.max_lazy_match=La[e.level].max_lazy,e.good_match=La[e.level].good_length,e.nice_match=La[e.level].nice_length,e.max_chain_length=La[e.level].max_chain,e.strstart=0,e.block_start=0,e.lookahead=0,e.insert=0,e.match_length=e.prev_length=2,e.match_available=0,e.ins_h=0;}(e.state),t}function Ha(e,t){let r,i,n,a;if(!e||!e.state||t>5||t<0)return e?Ca(e,-2):-2;if(i=e.state,!e.output||!e.input&&0!==e.avail_in||666===i.status&&4!==t)return Ca(e,0===e.avail_out?-5:-2);if(i.strm=e,r=i.last_flush,i.last_flush=t,42===i.status)if(2===i.wrap)e.adler=0,Ua(i,31),Ua(i,139),Ua(i,8),i.gzhead?(Ua(i,(i.gzhead.text?1:0)+(i.gzhead.hcrc?2:0)+(i.gzhead.extra?4:0)+(i.gzhead.name?8:0)+(i.gzhead.comment?16:0)),Ua(i,255&i.gzhead.time),Ua(i,i.gzhead.time>>8&255),Ua(i,i.gzhead.time>>16&255),Ua(i,i.gzhead.time>>24&255),Ua(i,9===i.level?2:i.strategy>=2||i.level<2?4:0),Ua(i,255&i.gzhead.os),i.gzhead.extra&&i.gzhead.extra.length&&(Ua(i,255&i.gzhead.extra.length),Ua(i,i.gzhead.extra.length>>8&255)),i.gzhead.hcrc&&(e.adler=Pa(e.adler,i.pending_buf,i.pending,0)),i.gzindex=0,i.status=69):(Ua(i,0),Ua(i,0),Ua(i,0),Ua(i,0),Ua(i,0),Ua(i,9===i.level?2:i.strategy>=2||i.level<2?4:0),Ua(i,3),i.status=113);else {let t=8+(i.w_bits-8<<4)<<8,r=-1;r=i.strategy>=2||i.level<2?0:i.level<6?1:6===i.level?2:3,t|=r<<6,0!==i.strstart&&(t|=32),t+=31-t%31,i.status=113,Ba(i,t),0!==i.strstart&&(Ba(i,e.adler>>>16),Ba(i,65535&e.adler)),e.adler=1;}if(69===i.status)if(i.gzhead.extra){for(n=i.pending;i.gzindex<(65535&i.gzhead.extra.length)&&(i.pending!==i.pending_buf_size||(i.gzhead.hcrc&&i.pending>n&&(e.adler=Pa(e.adler,i.pending_buf,i.pending-n,n)),Ra(e),n=i.pending,i.pending!==i.pending_buf_size));)Ua(i,255&i.gzhead.extra[i.gzindex]),i.gzindex++;i.gzhead.hcrc&&i.pending>n&&(e.adler=Pa(e.adler,i.pending_buf,i.pending-n,n)),i.gzindex===i.gzhead.extra.length&&(i.gzindex=0,i.status=73);}else i.status=73;if(73===i.status)if(i.gzhead.name){n=i.pending;do{if(i.pending===i.pending_buf_size&&(i.gzhead.hcrc&&i.pending>n&&(e.adler=Pa(e.adler,i.pending_buf,i.pending-n,n)),Ra(e),n=i.pending,i.pending===i.pending_buf_size)){a=1;break}a=i.gzindex<i.gzhead.name.length?255&i.gzhead.name.charCodeAt(i.gzindex++):0,Ua(i,a);}while(0!==a);i.gzhead.hcrc&&i.pending>n&&(e.adler=Pa(e.adler,i.pending_buf,i.pending-n,n)),0===a&&(i.gzindex=0,i.status=91);}else i.status=91;if(91===i.status)if(i.gzhead.comment){n=i.pending;do{if(i.pending===i.pending_buf_size&&(i.gzhead.hcrc&&i.pending>n&&(e.adler=Pa(e.adler,i.pending_buf,i.pending-n,n)),Ra(e),n=i.pending,i.pending===i.pending_buf_size)){a=1;break}a=i.gzindex<i.gzhead.comment.length?255&i.gzhead.comment.charCodeAt(i.gzindex++):0,Ua(i,a);}while(0!==a);i.gzhead.hcrc&&i.pending>n&&(e.adler=Pa(e.adler,i.pending_buf,i.pending-n,n)),0===a&&(i.status=103);}else i.status=103;if(103===i.status&&(i.gzhead.hcrc?(i.pending+2>i.pending_buf_size&&Ra(e),i.pending+2<=i.pending_buf_size&&(Ua(i,255&e.adler),Ua(i,e.adler>>8&255),e.adler=0,i.status=113)):i.status=113),0!==i.pending){if(Ra(e),0===e.avail_out)return i.last_flush=-1,0}else if(0===e.avail_in&&Ka(t)<=Ka(r)&&4!==t)return Ca(e,-5);if(666===i.status&&0!==e.avail_in)return Ca(e,-5);if(0!==e.avail_in||0!==i.lookahead||0!==t&&666!==i.status){var s=2===i.strategy?function(e,t){let r;for(;;){if(0===e.lookahead&&(qa(e),0===e.lookahead)){if(0===t)return 1;break}if(e.match_length=0,r=Sa(e,0,e.window[e.strstart]),e.lookahead--,e.strstart++,r&&(Ia(e,!1),0===e.strm.avail_out))return 1}return e.insert=0,4===t?(Ia(e,!0),0===e.strm.avail_out?3:4):e.last_lit&&(Ia(e,!1),0===e.strm.avail_out)?1:2}(i,t):3===i.strategy?function(e,t){let r,i,n,a;const s=e.window;for(;;){if(e.lookahead<=258){if(qa(e),e.lookahead<=258&&0===t)return 1;if(0===e.lookahead)break}if(e.match_length=0,e.lookahead>=3&&e.strstart>0&&(n=e.strstart-1,i=s[n],i===s[++n]&&i===s[++n]&&i===s[++n])){a=e.strstart+258;do{}while(i===s[++n]&&i===s[++n]&&i===s[++n]&&i===s[++n]&&i===s[++n]&&i===s[++n]&&i===s[++n]&&i===s[++n]&&n<a);e.match_length=258-(a-n),e.match_length>e.lookahead&&(e.match_length=e.lookahead);}if(e.match_length>=3?(r=Sa(e,1,e.match_length-3),e.lookahead-=e.match_length,e.strstart+=e.match_length,e.match_length=0):(r=Sa(e,0,e.window[e.strstart]),e.lookahead--,e.strstart++),r&&(Ia(e,!1),0===e.strm.avail_out))return 1}return e.insert=0,4===t?(Ia(e,!0),0===e.strm.avail_out?3:4):e.last_lit&&(Ia(e,!1),0===e.strm.avail_out)?1:2}(i,t):La[i.level].func(i,t);if(3!==s&&4!==s||(i.status=666),1===s||3===s)return 0===e.avail_out&&(i.last_flush=-1),0;if(2===s&&(1===t?ka(i):5!==t&&(_a(i,0,0,!1),3===t&&(Da(i.head),0===i.lookahead&&(i.strstart=0,i.block_start=0,i.insert=0))),Ra(e),0===e.avail_out))return i.last_flush=-1,0}return 4!==t?0:i.wrap<=0?1:(2===i.wrap?(Ua(i,255&e.adler),Ua(i,e.adler>>8&255),Ua(i,e.adler>>16&255),Ua(i,e.adler>>24&255),Ua(i,255&e.total_in),Ua(i,e.total_in>>8&255),Ua(i,e.total_in>>16&255),Ua(i,e.total_in>>24&255)):(Ba(i,e.adler>>>16),Ba(i,65535&e.adler)),Ra(e),i.wrap>0&&(i.wrap=-i.wrap),0!==i.pending?0:1)}try{String.fromCharCode.call(null,0);}catch(e){}try{String.fromCharCode.apply(null,new Uint8Array(1));}catch(e){}const Ga=new qn(256);for(let e=0;e<256;e++)Ga[e]=e>=252?6:e>=248?5:e>=240?4:e>=224?3:e>=192?2:1;function Va(e){let t,r,i,n,a=0;const s=e.length;for(i=0;i<s;i++)t=e.charCodeAt(i),55296==(64512&t)&&i+1<s&&(r=e.charCodeAt(i+1),56320==(64512&r)&&(t=65536+(t-55296<<10)+(r-56320),i++)),a+=t<128?1:t<2048?2:t<65536?3:4;const o=new qn(a);for(n=0,i=0;n<a;i++)t=e.charCodeAt(i),55296==(64512&t)&&i+1<s&&(r=e.charCodeAt(i+1),56320==(64512&r)&&(t=65536+(t-55296<<10)+(r-56320),i++)),t<128?o[n++]=t:t<2048?(o[n++]=192|t>>>6,o[n++]=128|63&t):t<65536?(o[n++]=224|t>>>12,o[n++]=128|t>>>6&63,o[n++]=128|63&t):(o[n++]=240|t>>>18,o[n++]=128|t>>>12&63,o[n++]=128|t>>>6&63,o[n++]=128|63&t);return o}Ga[254]=Ga[254]=1;class Za{constructor(){this.input=null,this.next_in=0,this.avail_in=0,this.total_in=0,this.output=null,this.next_out=0,this.avail_out=0,this.total_out=0,this.msg="",this.state=null,this.data_type=2,this.adler=0;}}class Ya{constructor(e){this.options={level:-1,method:8,chunkSize:16384,windowBits:15,memLevel:8,strategy:0,...e||{}};const t=this.options;t.raw&&t.windowBits>0?t.windowBits=-t.windowBits:t.gzip&&t.windowBits>0&&t.windowBits<16&&(t.windowBits+=16),this.err=0,this.msg="",this.ended=!1,this.chunks=[],this.strm=new Za,this.strm.avail_out=0;var r,i,n=function(e,t,r,i,n,a){if(!e)return -2;let s=1;if(-1===t&&(t=6),i<0?(s=0,i=-i):i>15&&(s=2,i-=16),n<1||n>9||8!==r||i<8||i>15||t<0||t>9||a<0||a>4)return Ca(e,-2);8===i&&(i=9);const o=new ja;return e.state=o,o.strm=e,o.wrap=s,o.gzhead=null,o.w_bits=i,o.w_size=1<<o.w_bits,o.w_mask=o.w_size-1,o.hash_bits=n+7,o.hash_size=1<<o.hash_bits,o.hash_mask=o.hash_size-1,o.hash_shift=~~((o.hash_bits+3-1)/3),o.window=new qn(2*o.w_size),o.head=new Fn(o.hash_size),o.prev=new Fn(o.w_size),o.lit_bufsize=1<<n+6,o.pending_buf_size=4*o.lit_bufsize,o.pending_buf=new qn(o.pending_buf_size),o.d_buf=1*o.lit_bufsize,o.l_buf=3*o.lit_bufsize,o.level=t,o.strategy=a,o.method=r,Wa(e)}(this.strm,t.level,t.method,t.windowBits,t.memLevel,t.strategy);if(0!==n)throw Error(Ma[n]);if(t.header&&(r=this.strm,i=t.header,r&&r.state&&(2!==r.state.wrap||(r.state.gzhead=i))),t.dictionary){let e;if(e="string"==typeof t.dictionary?Va(t.dictionary):t.dictionary instanceof ArrayBuffer?new Uint8Array(t.dictionary):t.dictionary,0!==(n=function(e,t){const r=t.length;let i,n,a,s,o,c,u,h;if(!e||!e.state)return -2;if(i=e.state,s=i.wrap,2===s||1===s&&42!==i.status||i.lookahead)return -2;for(1===s&&(e.adler=Ea(e.adler,t,r,0)),i.wrap=0,r>=i.w_size&&(0===s&&(Da(i.head),i.strstart=0,i.block_start=0,i.insert=0),h=new qn(i.w_size),Ln(h,t,r-i.w_size,i.w_size,0),t=h,r=i.w_size),o=e.avail_in,c=e.next_in,u=e.input,e.avail_in=r,e.next_in=0,e.input=t,qa(i);i.lookahead>=3;){n=i.strstart,a=i.lookahead-2;do{i.ins_h=(i.ins_h<<i.hash_shift^i.window[n+3-1])&i.hash_mask,i.prev[n&i.w_mask]=i.head[i.ins_h],i.head[i.ins_h]=n,n++;}while(--a);i.strstart=n,i.lookahead=2,qa(i);}return i.strstart+=i.lookahead,i.block_start=i.strstart,i.insert=i.lookahead,i.lookahead=0,i.match_length=i.prev_length=2,i.match_available=0,e.next_in=c,e.input=u,e.avail_in=o,i.wrap=s,0}(this.strm,e)))throw Error(Ma[n]);this._dict_set=!0;}}push(e,t){const{strm:r,options:{chunkSize:i}}=this;var n,a;if(this.ended)return !1;a=t===~~t?t:!0===t?4:0,"string"==typeof e?r.input=Va(e):e instanceof ArrayBuffer?r.input=new Uint8Array(e):r.input=e,r.next_in=0,r.avail_in=r.input.length;do{if(0===r.avail_out&&(r.output=new qn(i),r.next_out=0,r.avail_out=i),1!==(n=Ha(r,a))&&0!==n)return this.onEnd(n),this.ended=!0,!1;0!==r.avail_out&&(0!==r.avail_in||4!==a&&2!==a)||this.onData(Bn(r.output,r.next_out));}while((r.avail_in>0||0===r.avail_out)&&1!==n);return 4===a?(n=function(e){let t;return e&&e.state?(t=e.state.status,42!==t&&69!==t&&73!==t&&91!==t&&103!==t&&113!==t&&666!==t?Ca(e,-2):(e.state=null,113===t?Ca(e,-3):0)):-2}(this.strm),this.onEnd(n),this.ended=!0,0===n):2!==a||(this.onEnd(0),r.avail_out=0,!0)}onData(e){this.chunks.push(e);}onEnd(e){0===e&&(this.result=Nn(this.chunks)),this.chunks=[],this.err=e,this.msg=this.strm.msg;}}function $a(e,t){let r,i,n,a,s,o,c,u,h,d;const f=e.state;r=e.next_in;const l=e.input,p=r+(e.avail_in-5);i=e.next_out;const y=e.output,b=i-(t-e.avail_out),m=i+(e.avail_out-257),g=f.dmax,w=f.wsize,v=f.whave,_=f.wnext,k=f.window;n=f.hold,a=f.bits;const A=f.lencode,S=f.distcode,E=(1<<f.lenbits)-1,x=(1<<f.distbits)-1;e:do{a<15&&(n+=l[r++]<<a,a+=8,n+=l[r++]<<a,a+=8),s=A[n&E];t:for(;;){if(o=s>>>24,n>>>=o,a-=o,o=s>>>16&255,0===o)y[i++]=65535&s;else {if(!(16&o)){if(0==(64&o)){s=A[(65535&s)+(n&(1<<o)-1)];continue t}if(32&o){f.mode=12;break e}e.msg="invalid literal/length code",f.mode=30;break e}c=65535&s,o&=15,o&&(a<o&&(n+=l[r++]<<a,a+=8),c+=n&(1<<o)-1,n>>>=o,a-=o),a<15&&(n+=l[r++]<<a,a+=8,n+=l[r++]<<a,a+=8),s=S[n&x];r:for(;;){if(o=s>>>24,n>>>=o,a-=o,o=s>>>16&255,!(16&o)){if(0==(64&o)){s=S[(65535&s)+(n&(1<<o)-1)];continue r}e.msg="invalid distance code",f.mode=30;break e}if(u=65535&s,o&=15,a<o&&(n+=l[r++]<<a,a+=8,a<o&&(n+=l[r++]<<a,a+=8)),u+=n&(1<<o)-1,u>g){e.msg="invalid distance too far back",f.mode=30;break e}if(n>>>=o,a-=o,o=i-b,u>o){if(o=u-o,o>v&&f.sane){e.msg="invalid distance too far back",f.mode=30;break e}if(h=0,d=k,0===_){if(h+=w-o,o<c){c-=o;do{y[i++]=k[h++];}while(--o);h=i-u,d=y;}}else if(_<o){if(h+=w+_-o,o-=_,o<c){c-=o;do{y[i++]=k[h++];}while(--o);if(h=0,_<c){o=_,c-=o;do{y[i++]=k[h++];}while(--o);h=i-u,d=y;}}}else if(h+=_-o,o<c){c-=o;do{y[i++]=k[h++];}while(--o);h=i-u,d=y;}for(;c>2;)y[i++]=d[h++],y[i++]=d[h++],y[i++]=d[h++],c-=3;c&&(y[i++]=d[h++],c>1&&(y[i++]=d[h++]));}else {h=i-u;do{y[i++]=y[h++],y[i++]=y[h++],y[i++]=y[h++],c-=3;}while(c>2);c&&(y[i++]=y[h++],c>1&&(y[i++]=y[h++]));}break}}break}}while(r<p&&i<m);c=a>>3,r-=c,a-=c<<3,n&=(1<<a)-1,e.next_in=r,e.next_out=i,e.avail_in=r<p?p-r+5:5-(r-p),e.avail_out=i<m?m-i+257:257-(i-m),f.hold=n,f.bits=a;}const Xa=[3,4,5,6,7,8,9,10,11,13,15,17,19,23,27,31,35,43,51,59,67,83,99,115,131,163,195,227,258,0,0],Ja=[16,16,16,16,16,16,16,16,17,17,17,17,18,18,18,18,19,19,19,19,20,20,20,20,21,21,21,21,16,72,78],Qa=[1,2,3,4,5,7,9,13,17,25,33,49,65,97,129,193,257,385,513,769,1025,1537,2049,3073,4097,6145,8193,12289,16385,24577,0,0],es=[16,16,16,16,17,17,18,18,19,19,20,20,21,21,22,22,23,23,24,24,25,25,26,26,27,27,28,28,29,29,64,64];function ts(e,t,r,i,n,a,s,o){const c=o.bits;let u,h,d,f,l,p=0,y=0,b=0,m=0,g=0,w=0,v=0,_=0,k=0,A=0,S=null,E=0;const x=new Fn(16),P=new Fn(16);let M,C,K,D=null,R=0;for(p=0;p<=15;p++)x[p]=0;for(y=0;y<i;y++)x[t[r+y]]++;for(g=c,m=15;m>=1&&0===x[m];m--);if(g>m&&(g=m),0===m)return n[a++]=20971520,n[a++]=20971520,o.bits=1,0;for(b=1;b<m&&0===x[b];b++);for(g<b&&(g=b),_=1,p=1;p<=15;p++)if(_<<=1,_-=x[p],_<0)return -1;if(_>0&&(0===e||1!==m))return -1;for(P[1]=0,p=1;p<15;p++)P[p+1]=P[p]+x[p];for(y=0;y<i;y++)0!==t[r+y]&&(s[P[t[r+y]]++]=y);0===e?(S=D=s,l=19):1===e?(S=Xa,E-=257,D=Ja,R-=257,l=256):(S=Qa,D=es,l=-1),A=0,y=0,p=b,f=a,w=g,v=0,d=-1,k=1<<g;const I=k-1;if(1===e&&k>852||2===e&&k>592)return 1;for(;;){M=p-v,s[y]<l?(C=0,K=s[y]):s[y]>l?(C=D[R+s[y]],K=S[E+s[y]]):(C=96,K=0),u=1<<p-v,h=1<<w,b=h;do{h-=u,n[f+(A>>v)+h]=M<<24|C<<16|K|0;}while(0!==h);for(u=1<<p-1;A&u;)u>>=1;if(0!==u?(A&=u-1,A+=u):A=0,y++,0==--x[p]){if(p===m)break;p=t[r+s[y]];}if(p>g&&(A&I)!==d){for(0===v&&(v=g),f+=b,w=p-v,_=1<<w;w+v<m&&(_-=x[w+v],!(_<=0));)w++,_<<=1;if(k+=1<<w,1===e&&k>852||2===e&&k>592)return 1;d=A&I,n[d]=g<<24|w<<16|f-a|0;}}return 0!==A&&(n[f+A]=p-v<<24|64<<16|0),o.bits=g,0}function rs(e){return (e>>>24&255)+(e>>>8&65280)+((65280&e)<<8)+((255&e)<<24)}class is{constructor(){this.mode=0,this.last=!1,this.wrap=0,this.havedict=!1,this.flags=0,this.dmax=0,this.check=0,this.total=0,this.head=null,this.wbits=0,this.wsize=0,this.whave=0,this.wnext=0,this.window=null,this.hold=0,this.bits=0,this.length=0,this.offset=0,this.extra=0,this.lencode=null,this.distcode=null,this.lenbits=0,this.distbits=0,this.ncode=0,this.nlen=0,this.ndist=0,this.have=0,this.next=null,this.lens=new Fn(320),this.work=new Fn(288),this.lendyn=null,this.distdyn=null,this.sane=0,this.back=0,this.was=0;}}function ns(e){let t;return e&&e.state?(t=e.state,t.wsize=0,t.whave=0,t.wnext=0,function(e){let t;return e&&e.state?(t=e.state,e.total_in=e.total_out=t.total=0,e.msg="",t.wrap&&(e.adler=1&t.wrap),t.mode=1,t.last=0,t.havedict=0,t.dmax=32768,t.head=null,t.hold=0,t.bits=0,t.lencode=t.lendyn=new On(852),t.distcode=t.distdyn=new On(592),t.sane=1,t.back=-1,0):-2}(e)):-2}function as(e,t){let r,i;return e?(i=new is,e.state=i,i.window=null,r=function(e,t){let r,i;return e&&e.state?(i=e.state,t<0?(r=0,t=-t):(r=1+(t>>4),t<48&&(t&=15)),t&&(t<8||t>15)?-2:(null!==i.window&&i.wbits!==t&&(i.window=null),i.wrap=r,i.wbits=t,ns(e))):-2}(e,t),0!==r&&(e.state=null),r):-2}let ss,os,cs=!0;function us(e){if(cs){let t;for(ss=new On(512),os=new On(32),t=0;t<144;)e.lens[t++]=8;for(;t<256;)e.lens[t++]=9;for(;t<280;)e.lens[t++]=7;for(;t<288;)e.lens[t++]=8;for(ts(1,e.lens,0,288,ss,0,e.work,{bits:9}),t=0;t<32;)e.lens[t++]=5;ts(2,e.lens,0,32,os,0,e.work,{bits:5}),cs=!1;}e.lencode=ss,e.lenbits=9,e.distcode=os,e.distbits=5;}function hs(e,t,r,i){let n;const a=e.state;return null===a.window&&(a.wsize=1<<a.wbits,a.wnext=0,a.whave=0,a.window=new qn(a.wsize)),i>=a.wsize?(Ln(a.window,t,r-a.wsize,a.wsize,0),a.wnext=0,a.whave=a.wsize):(n=a.wsize-a.wnext,n>i&&(n=i),Ln(a.window,t,r-i,n,a.wnext),(i-=n)?(Ln(a.window,t,r-i,i,0),a.wnext=i,a.whave=a.wsize):(a.wnext+=n,a.wnext===a.wsize&&(a.wnext=0),a.whave<a.wsize&&(a.whave+=n))),0}function ds(e,t){let r,i,n,a,s,o,c,u,h,d,f,l,p,y,b,m,g,w,v,_,k,A,S,E,x=0,P=new qn(4);const M=[16,17,18,0,8,7,9,6,10,5,11,4,12,3,13,2,14,1,15];if(!e||!e.state||!e.output||!e.input&&0!==e.avail_in)return -2;r=e.state,12===r.mode&&(r.mode=13),s=e.next_out,n=e.output,c=e.avail_out,a=e.next_in,i=e.input,o=e.avail_in,u=r.hold,h=r.bits,d=o,f=c,A=0;e:for(;;)switch(r.mode){case 1:if(0===r.wrap){r.mode=13;break}for(;h<16;){if(0===o)break e;o--,u+=i[a++]<<h,h+=8;}if(2&r.wrap&&35615===u){r.check=0,P[0]=255&u,P[1]=u>>>8&255,r.check=Pa(r.check,P,2,0),u=0,h=0,r.mode=2;break}if(r.flags=0,r.head&&(r.head.done=!1),!(1&r.wrap)||(((255&u)<<8)+(u>>8))%31){e.msg="incorrect header check",r.mode=30;break}if(8!=(15&u)){e.msg="unknown compression method",r.mode=30;break}if(u>>>=4,h-=4,k=8+(15&u),0===r.wbits)r.wbits=k;else if(k>r.wbits){e.msg="invalid window size",r.mode=30;break}r.dmax=1<<k,e.adler=r.check=1,r.mode=512&u?10:12,u=0,h=0;break;case 2:for(;h<16;){if(0===o)break e;o--,u+=i[a++]<<h,h+=8;}if(r.flags=u,8!=(255&r.flags)){e.msg="unknown compression method",r.mode=30;break}if(57344&r.flags){e.msg="unknown header flags set",r.mode=30;break}r.head&&(r.head.text=u>>8&1),512&r.flags&&(P[0]=255&u,P[1]=u>>>8&255,r.check=Pa(r.check,P,2,0)),u=0,h=0,r.mode=3;case 3:for(;h<32;){if(0===o)break e;o--,u+=i[a++]<<h,h+=8;}r.head&&(r.head.time=u),512&r.flags&&(P[0]=255&u,P[1]=u>>>8&255,P[2]=u>>>16&255,P[3]=u>>>24&255,r.check=Pa(r.check,P,4,0)),u=0,h=0,r.mode=4;case 4:for(;h<16;){if(0===o)break e;o--,u+=i[a++]<<h,h+=8;}r.head&&(r.head.xflags=255&u,r.head.os=u>>8),512&r.flags&&(P[0]=255&u,P[1]=u>>>8&255,r.check=Pa(r.check,P,2,0)),u=0,h=0,r.mode=5;case 5:if(1024&r.flags){for(;h<16;){if(0===o)break e;o--,u+=i[a++]<<h,h+=8;}r.length=u,r.head&&(r.head.extra_len=u),512&r.flags&&(P[0]=255&u,P[1]=u>>>8&255,r.check=Pa(r.check,P,2,0)),u=0,h=0;}else r.head&&(r.head.extra=null);r.mode=6;case 6:if(1024&r.flags&&(l=r.length,l>o&&(l=o),l&&(r.head&&(k=r.head.extra_len-r.length,r.head.extra||(r.head.extra=Array(r.head.extra_len)),Ln(r.head.extra,i,a,l,k)),512&r.flags&&(r.check=Pa(r.check,i,l,a)),o-=l,a+=l,r.length-=l),r.length))break e;r.length=0,r.mode=7;case 7:if(2048&r.flags){if(0===o)break e;l=0;do{k=i[a+l++],r.head&&k&&r.length<65536&&(r.head.name+=String.fromCharCode(k));}while(k&&l<o);if(512&r.flags&&(r.check=Pa(r.check,i,l,a)),o-=l,a+=l,k)break e}else r.head&&(r.head.name=null);r.length=0,r.mode=8;case 8:if(4096&r.flags){if(0===o)break e;l=0;do{k=i[a+l++],r.head&&k&&r.length<65536&&(r.head.comment+=String.fromCharCode(k));}while(k&&l<o);if(512&r.flags&&(r.check=Pa(r.check,i,l,a)),o-=l,a+=l,k)break e}else r.head&&(r.head.comment=null);r.mode=9;case 9:if(512&r.flags){for(;h<16;){if(0===o)break e;o--,u+=i[a++]<<h,h+=8;}if(u!==(65535&r.check)){e.msg="header crc mismatch",r.mode=30;break}u=0,h=0;}r.head&&(r.head.hcrc=r.flags>>9&1,r.head.done=!0),e.adler=r.check=0,r.mode=12;break;case 10:for(;h<32;){if(0===o)break e;o--,u+=i[a++]<<h,h+=8;}e.adler=r.check=rs(u),u=0,h=0,r.mode=11;case 11:if(0===r.havedict)return e.next_out=s,e.avail_out=c,e.next_in=a,e.avail_in=o,r.hold=u,r.bits=h,2;e.adler=r.check=1,r.mode=12;case 12:if(5===t||6===t)break e;case 13:if(r.last){u>>>=7&h,h-=7&h,r.mode=27;break}for(;h<3;){if(0===o)break e;o--,u+=i[a++]<<h,h+=8;}switch(r.last=1&u,u>>>=1,h-=1,3&u){case 0:r.mode=14;break;case 1:if(us(r),r.mode=20,6===t){u>>>=2,h-=2;break e}break;case 2:r.mode=17;break;case 3:e.msg="invalid block type",r.mode=30;}u>>>=2,h-=2;break;case 14:for(u>>>=7&h,h-=7&h;h<32;){if(0===o)break e;o--,u+=i[a++]<<h,h+=8;}if((65535&u)!=(u>>>16^65535)){e.msg="invalid stored block lengths",r.mode=30;break}if(r.length=65535&u,u=0,h=0,r.mode=15,6===t)break e;case 15:r.mode=16;case 16:if(l=r.length,l){if(l>o&&(l=o),l>c&&(l=c),0===l)break e;Ln(n,i,a,l,s),o-=l,a+=l,c-=l,s+=l,r.length-=l;break}r.mode=12;break;case 17:for(;h<14;){if(0===o)break e;o--,u+=i[a++]<<h,h+=8;}if(r.nlen=257+(31&u),u>>>=5,h-=5,r.ndist=1+(31&u),u>>>=5,h-=5,r.ncode=4+(15&u),u>>>=4,h-=4,r.nlen>286||r.ndist>30){e.msg="too many length or distance symbols",r.mode=30;break}r.have=0,r.mode=18;case 18:for(;r.have<r.ncode;){for(;h<3;){if(0===o)break e;o--,u+=i[a++]<<h,h+=8;}r.lens[M[r.have++]]=7&u,u>>>=3,h-=3;}for(;r.have<19;)r.lens[M[r.have++]]=0;if(r.lencode=r.lendyn,r.lenbits=7,S={bits:r.lenbits},A=ts(0,r.lens,0,19,r.lencode,0,r.work,S),r.lenbits=S.bits,A){e.msg="invalid code lengths set",r.mode=30;break}r.have=0,r.mode=19;case 19:for(;r.have<r.nlen+r.ndist;){for(;x=r.lencode[u&(1<<r.lenbits)-1],b=x>>>24,m=x>>>16&255,g=65535&x,!(b<=h);){if(0===o)break e;o--,u+=i[a++]<<h,h+=8;}if(g<16)u>>>=b,h-=b,r.lens[r.have++]=g;else {if(16===g){for(E=b+2;h<E;){if(0===o)break e;o--,u+=i[a++]<<h,h+=8;}if(u>>>=b,h-=b,0===r.have){e.msg="invalid bit length repeat",r.mode=30;break}k=r.lens[r.have-1],l=3+(3&u),u>>>=2,h-=2;}else if(17===g){for(E=b+3;h<E;){if(0===o)break e;o--,u+=i[a++]<<h,h+=8;}u>>>=b,h-=b,k=0,l=3+(7&u),u>>>=3,h-=3;}else {for(E=b+7;h<E;){if(0===o)break e;o--,u+=i[a++]<<h,h+=8;}u>>>=b,h-=b,k=0,l=11+(127&u),u>>>=7,h-=7;}if(r.have+l>r.nlen+r.ndist){e.msg="invalid bit length repeat",r.mode=30;break}for(;l--;)r.lens[r.have++]=k;}}if(30===r.mode)break;if(0===r.lens[256]){e.msg="invalid code -- missing end-of-block",r.mode=30;break}if(r.lenbits=9,S={bits:r.lenbits},A=ts(1,r.lens,0,r.nlen,r.lencode,0,r.work,S),r.lenbits=S.bits,A){e.msg="invalid literal/lengths set",r.mode=30;break}if(r.distbits=6,r.distcode=r.distdyn,S={bits:r.distbits},A=ts(2,r.lens,r.nlen,r.ndist,r.distcode,0,r.work,S),r.distbits=S.bits,A){e.msg="invalid distances set",r.mode=30;break}if(r.mode=20,6===t)break e;case 20:r.mode=21;case 21:if(o>=6&&c>=258){e.next_out=s,e.avail_out=c,e.next_in=a,e.avail_in=o,r.hold=u,r.bits=h,$a(e,f),s=e.next_out,n=e.output,c=e.avail_out,a=e.next_in,i=e.input,o=e.avail_in,u=r.hold,h=r.bits,12===r.mode&&(r.back=-1);break}for(r.back=0;x=r.lencode[u&(1<<r.lenbits)-1],b=x>>>24,m=x>>>16&255,g=65535&x,!(b<=h);){if(0===o)break e;o--,u+=i[a++]<<h,h+=8;}if(m&&0==(240&m)){for(w=b,v=m,_=g;x=r.lencode[_+((u&(1<<w+v)-1)>>w)],b=x>>>24,m=x>>>16&255,g=65535&x,!(w+b<=h);){if(0===o)break e;o--,u+=i[a++]<<h,h+=8;}u>>>=w,h-=w,r.back+=w;}if(u>>>=b,h-=b,r.back+=b,r.length=g,0===m){r.mode=26;break}if(32&m){r.back=-1,r.mode=12;break}if(64&m){e.msg="invalid literal/length code",r.mode=30;break}r.extra=15&m,r.mode=22;case 22:if(r.extra){for(E=r.extra;h<E;){if(0===o)break e;o--,u+=i[a++]<<h,h+=8;}r.length+=u&(1<<r.extra)-1,u>>>=r.extra,h-=r.extra,r.back+=r.extra;}r.was=r.length,r.mode=23;case 23:for(;x=r.distcode[u&(1<<r.distbits)-1],b=x>>>24,m=x>>>16&255,g=65535&x,!(b<=h);){if(0===o)break e;o--,u+=i[a++]<<h,h+=8;}if(0==(240&m)){for(w=b,v=m,_=g;x=r.distcode[_+((u&(1<<w+v)-1)>>w)],b=x>>>24,m=x>>>16&255,g=65535&x,!(w+b<=h);){if(0===o)break e;o--,u+=i[a++]<<h,h+=8;}u>>>=w,h-=w,r.back+=w;}if(u>>>=b,h-=b,r.back+=b,64&m){e.msg="invalid distance code",r.mode=30;break}r.offset=g,r.extra=15&m,r.mode=24;case 24:if(r.extra){for(E=r.extra;h<E;){if(0===o)break e;o--,u+=i[a++]<<h,h+=8;}r.offset+=u&(1<<r.extra)-1,u>>>=r.extra,h-=r.extra,r.back+=r.extra;}if(r.offset>r.dmax){e.msg="invalid distance too far back",r.mode=30;break}r.mode=25;case 25:if(0===c)break e;if(l=f-c,r.offset>l){if(l=r.offset-l,l>r.whave&&r.sane){e.msg="invalid distance too far back",r.mode=30;break}l>r.wnext?(l-=r.wnext,p=r.wsize-l):p=r.wnext-l,l>r.length&&(l=r.length),y=r.window;}else y=n,p=s-r.offset,l=r.length;l>c&&(l=c),c-=l,r.length-=l;do{n[s++]=y[p++];}while(--l);0===r.length&&(r.mode=21);break;case 26:if(0===c)break e;n[s++]=r.length,c--,r.mode=21;break;case 27:if(r.wrap){for(;h<32;){if(0===o)break e;o--,u|=i[a++]<<h,h+=8;}if(f-=c,e.total_out+=f,r.total+=f,f&&(e.adler=r.check=r.flags?Pa(r.check,n,f,s-f):Ea(r.check,n,f,s-f)),f=c,(r.flags?u:rs(u))!==r.check){e.msg="incorrect data check",r.mode=30;break}u=0,h=0;}r.mode=28;case 28:if(r.wrap&&r.flags){for(;h<32;){if(0===o)break e;o--,u+=i[a++]<<h,h+=8;}if(u!==(4294967295&r.total)){e.msg="incorrect length check",r.mode=30;break}u=0,h=0;}r.mode=29;case 29:A=1;break e;case 30:A=-3;break e;case 32:default:return -2}return e.next_out=s,e.avail_out=c,e.next_in=a,e.avail_in=o,r.hold=u,r.bits=h,(r.wsize||f!==e.avail_out&&r.mode<30&&(r.mode<27||4!==t))&&hs(e,e.output,e.next_out,f-e.avail_out),d-=e.avail_in,f-=e.avail_out,e.total_in+=d,e.total_out+=f,r.total+=f,r.wrap&&f&&(e.adler=r.check=r.flags?Pa(r.check,n,f,e.next_out-f):Ea(r.check,n,f,e.next_out-f)),e.data_type=r.bits+(r.last?64:0)+(12===r.mode?128:0)+(20===r.mode||15===r.mode?256:0),(0===d&&0===f||4===t)&&0===A&&(A=-5),A}function fs(e,t){const r=t.length;let i,n;return e&&e.state?(i=e.state,0!==i.wrap&&11!==i.mode?-2:11===i.mode&&(n=1,n=Ea(n,t,r,0),n!==i.check)?-3:(hs(e,t,r,r),i.havedict=1,0)):-2}class ls{constructor(){this.text=0,this.time=0,this.xflags=0,this.os=0,this.extra=null,this.extra_len=0,this.name="",this.comment="",this.hcrc=0,this.done=!1;}}class ps{constructor(e){this.options={chunkSize:16384,windowBits:0,...e||{}};const t=this.options;t.raw&&t.windowBits>=0&&t.windowBits<16&&(t.windowBits=-t.windowBits,0===t.windowBits&&(t.windowBits=-15)),!(t.windowBits>=0&&t.windowBits<16)||e&&e.windowBits||(t.windowBits+=32),t.windowBits>15&&t.windowBits<48&&0==(15&t.windowBits)&&(t.windowBits|=15),this.err=0,this.msg="",this.ended=!1,this.chunks=[],this.strm=new Za,this.strm.avail_out=0;let r=as(this.strm,t.windowBits);if(0!==r)throw Error(Ma[r]);if(this.header=new ls,function(e,t){let r;e&&e.state&&(r=e.state,0==(2&r.wrap)||(r.head=t,t.done=!1));}(this.strm,this.header),t.dictionary&&("string"==typeof t.dictionary?t.dictionary=Va(t.dictionary):t.dictionary instanceof ArrayBuffer&&(t.dictionary=new Uint8Array(t.dictionary)),t.raw&&(r=fs(this.strm,t.dictionary),0!==r)))throw Error(Ma[r])}push(e,t){const{strm:r,options:{chunkSize:i,dictionary:n}}=this;let a,s,o=!1;if(this.ended)return !1;s=t===~~t?t:!0===t?4:0,"string"==typeof e?r.input=function(e){const t=new qn(e.length);for(let r=0,i=t.length;r<i;r++)t[r]=e.charCodeAt(r);return t}(e):e instanceof ArrayBuffer?r.input=new Uint8Array(e):r.input=e,r.next_in=0,r.avail_in=r.input.length;do{if(0===r.avail_out&&(r.output=new qn(i),r.next_out=0,r.avail_out=i),a=ds(r,0),2===a&&n&&(a=fs(this.strm,n)),-5===a&&!0===o&&(a=0,o=!1),1!==a&&0!==a)return this.onEnd(a),this.ended=!0,!1;r.next_out&&(0!==r.avail_out&&1!==a&&(0!==r.avail_in||4!==s&&2!==s)||this.onData(Bn(r.output,r.next_out))),0===r.avail_in&&0===r.avail_out&&(o=!0);}while((r.avail_in>0||0===r.avail_out)&&1!==a);return 1===a&&(s=4),4===s?(a=function(e){if(!e||!e.state)return -2;const t=e.state;return t.window&&(t.window=null),e.state=null,0}(this.strm),this.onEnd(a),this.ended=!0,0===a):2!==s||(this.onEnd(0),r.avail_out=0,!0)}onData(e){this.chunks.push(e);}onEnd(e){0===e&&(this.result=Nn(this.chunks)),this.chunks=[],this.err=e,this.msg=this.strm.msg;}}var ys=[0,1,3,7,15,31,63,127,255],bs=function(e){this.stream=e,this.bitOffset=0,this.curByte=0,this.hasByte=!1;};bs.prototype._ensureByte=function(){this.hasByte||(this.curByte=this.stream.readByte(),this.hasByte=!0);},bs.prototype.read=function(e){for(var t=0;e>0;){this._ensureByte();var r=8-this.bitOffset;if(e>=r)t<<=r,t|=ys[r]&this.curByte,this.hasByte=!1,this.bitOffset=0,e-=r;else {t<<=e;var i=r-e;t|=(this.curByte&ys[e]<<i)>>i,this.bitOffset+=e,e=0;}}return t},bs.prototype.seek=function(e){var t=e%8,r=(e-t)/8;this.bitOffset=t,this.stream.seek(r),this.hasByte=!1;},bs.prototype.pi=function(){var e,t=new Uint8Array(6);for(e=0;e<t.length;e++)t[e]=this.read(8);return function(e){return Array.prototype.map.call(e,e=>("00"+e.toString(16)).slice(-2)).join("")}(t)};var ms=bs,gs=function(){};gs.prototype.readByte=function(){throw Error("abstract method readByte() not implemented")},gs.prototype.read=function(e,t,r){for(var i=0;i<r;){var n=this.readByte();if(n<0)return 0===i?-1:i;e[t++]=n,i++;}return i},gs.prototype.seek=function(e){throw Error("abstract method seek() not implemented")},gs.prototype.writeByte=function(e){throw Error("abstract method readByte() not implemented")},gs.prototype.write=function(e,t,r){var i;for(i=0;i<r;i++)this.writeByte(e[t++]);return r},gs.prototype.flush=function(){};var ws,vs=gs,_s=(ws=new Uint32Array([0,79764919,159529838,222504665,319059676,398814059,445009330,507990021,638119352,583659535,797628118,726387553,890018660,835552979,1015980042,944750013,1276238704,1221641927,1167319070,1095957929,1595256236,1540665371,1452775106,1381403509,1780037320,1859660671,1671105958,1733955601,2031960084,2111593891,1889500026,1952343757,2552477408,2632100695,2443283854,2506133561,2334638140,2414271883,2191915858,2254759653,3190512472,3135915759,3081330742,3009969537,2905550212,2850959411,2762807018,2691435357,3560074640,3505614887,3719321342,3648080713,3342211916,3287746299,3467911202,3396681109,4063920168,4143685023,4223187782,4286162673,3779000052,3858754371,3904687514,3967668269,881225847,809987520,1023691545,969234094,662832811,591600412,771767749,717299826,311336399,374308984,453813921,533576470,25881363,88864420,134795389,214552010,2023205639,2086057648,1897238633,1976864222,1804852699,1867694188,1645340341,1724971778,1587496639,1516133128,1461550545,1406951526,1302016099,1230646740,1142491917,1087903418,2896545431,2825181984,2770861561,2716262478,3215044683,3143675388,3055782693,3001194130,2326604591,2389456536,2200899649,2280525302,2578013683,2640855108,2418763421,2498394922,3769900519,3832873040,3912640137,3992402750,4088425275,4151408268,4197601365,4277358050,3334271071,3263032808,3476998961,3422541446,3585640067,3514407732,3694837229,3640369242,1762451694,1842216281,1619975040,1682949687,2047383090,2127137669,1938468188,2001449195,1325665622,1271206113,1183200824,1111960463,1543535498,1489069629,1434599652,1363369299,622672798,568075817,748617968,677256519,907627842,853037301,1067152940,995781531,51762726,131386257,177728840,240578815,269590778,349224269,429104020,491947555,4046411278,4126034873,4172115296,4234965207,3794477266,3874110821,3953728444,4016571915,3609705398,3555108353,3735388376,3664026991,3290680682,3236090077,3449943556,3378572211,3174993278,3120533705,3032266256,2961025959,2923101090,2868635157,2813903052,2742672763,2604032198,2683796849,2461293480,2524268063,2284983834,2364738477,2175806836,2238787779,1569362073,1498123566,1409854455,1355396672,1317987909,1246755826,1192025387,1137557660,2072149281,2135122070,1912620623,1992383480,1753615357,1816598090,1627664531,1707420964,295390185,358241886,404320391,483945776,43990325,106832002,186451547,266083308,932423249,861060070,1041341759,986742920,613929101,542559546,756411363,701822548,3316196985,3244833742,3425377559,3370778784,3601682597,3530312978,3744426955,3689838204,3819031489,3881883254,3928223919,4007849240,4037393693,4100235434,4180117107,4259748804,2310601993,2373574846,2151335527,2231098320,2596047829,2659030626,2470359227,2550115596,2947551409,2876312838,2788305887,2733848168,3165939309,3094707162,3040238851,2985771188]),function(){var e=4294967295;this.getCRC=function(){return ~e>>>0},this.updateCRC=function(t){e=e<<8^ws[255&(e>>>24^t)];},this.updateCRCRun=function(t,r){for(;r-- >0;)e=e<<8^ws[255&(e>>>24^t)];};}),ks=function(e,t){var r,i=e[t];for(r=t;r>0;r--)e[r]=e[r-1];return e[0]=i,i},As={OK:0,LAST_BLOCK:-1,NOT_BZIP_DATA:-2,UNEXPECTED_INPUT_EOF:-3,UNEXPECTED_OUTPUT_EOF:-4,DATA_ERROR:-5,OUT_OF_MEMORY:-6,OBSOLETE_INPUT:-7,END_OF_BLOCK:-8},Ss={};Ss[As.LAST_BLOCK]="Bad file checksum",Ss[As.NOT_BZIP_DATA]="Not bzip data",Ss[As.UNEXPECTED_INPUT_EOF]="Unexpected input EOF",Ss[As.UNEXPECTED_OUTPUT_EOF]="Unexpected output EOF",Ss[As.DATA_ERROR]="Data error",Ss[As.OUT_OF_MEMORY]="Out of memory",Ss[As.OBSOLETE_INPUT]="Obsolete (pre 0.9.5) bzip format not supported.";var Es=function(e,t){var r=Ss[e]||"unknown error";t&&(r+=": "+t);var i=new TypeError(r);throw i.errorCode=e,i},xs=function(e,t){this.writePos=this.writeCurrent=this.writeCount=0,this._start_bunzip(e,t);};xs.prototype._init_block=function(){return this._get_next_block()?(this.blockCRC=new _s,!0):(this.writeCount=-1,!1)},xs.prototype._start_bunzip=function(e,t){var r=new Uint8Array(4);4===e.read(r,0,4)&&"BZh"===String.fromCharCode(r[0],r[1],r[2])||Es(As.NOT_BZIP_DATA,"bad magic");var i=r[3]-48;(i<1||i>9)&&Es(As.NOT_BZIP_DATA,"level out of range"),this.reader=new ms(e),this.dbufSize=1e5*i,this.nextoutput=0,this.outputStream=t,this.streamCRC=0;},xs.prototype._get_next_block=function(){var e,t,r,i=this.reader,n=i.pi();if("177245385090"===n)return !1;"314159265359"!==n&&Es(As.NOT_BZIP_DATA),this.targetBlockCRC=i.read(32)>>>0,this.streamCRC=(this.targetBlockCRC^(this.streamCRC<<1|this.streamCRC>>>31))>>>0,i.read(1)&&Es(As.OBSOLETE_INPUT);var a=i.read(24);a>this.dbufSize&&Es(As.DATA_ERROR,"initial position out of bounds");var s=i.read(16),o=new Uint8Array(256),c=0;for(e=0;e<16;e++)if(s&1<<15-e){var u=16*e;for(r=i.read(16),t=0;t<16;t++)r&1<<15-t&&(o[c++]=u+t);}var h=i.read(3);(h<2||h>6)&&Es(As.DATA_ERROR);var d=i.read(15);0===d&&Es(As.DATA_ERROR);var f=new Uint8Array(256);for(e=0;e<h;e++)f[e]=e;var l=new Uint8Array(d);for(e=0;e<d;e++){for(t=0;i.read(1);t++)t>=h&&Es(As.DATA_ERROR);l[e]=ks(f,t);}var p,y=c+2,b=[];for(t=0;t<h;t++){var m,g,w=new Uint8Array(y),v=new Uint16Array(21);for(s=i.read(5),e=0;e<y;e++){for(;(s<1||s>20)&&Es(As.DATA_ERROR),i.read(1);)i.read(1)?s--:s++;w[e]=s;}for(m=g=w[0],e=1;e<y;e++)w[e]>g?g=w[e]:w[e]<m&&(m=w[e]);p={},b.push(p),p.permute=new Uint16Array(258),p.limit=new Uint32Array(22),p.base=new Uint32Array(21),p.minLen=m,p.maxLen=g;var _=0;for(e=m;e<=g;e++)for(v[e]=p.limit[e]=0,s=0;s<y;s++)w[s]===e&&(p.permute[_++]=s);for(e=0;e<y;e++)v[w[e]]++;for(_=s=0,e=m;e<g;e++)_+=v[e],p.limit[e]=_-1,_<<=1,s+=v[e],p.base[e+1]=_-s;p.limit[g+1]=Number.MAX_VALUE,p.limit[g]=_+v[g]-1,p.base[m]=0;}var k=new Uint32Array(256);for(e=0;e<256;e++)f[e]=e;var A,S=0,E=0,x=0,P=this.dbuf=new Uint32Array(this.dbufSize);for(y=0;;){for(y--||(y=49,x>=d&&Es(As.DATA_ERROR),p=b[l[x++]]),e=p.minLen,t=i.read(e);e>p.maxLen&&Es(As.DATA_ERROR),!(t<=p.limit[e]);e++)t=t<<1|i.read(1);((t-=p.base[e])<0||t>=258)&&Es(As.DATA_ERROR);var M=p.permute[t];if(0!==M&&1!==M){if(S)for(S=0,E+s>this.dbufSize&&Es(As.DATA_ERROR),k[A=o[f[0]]]+=s;s--;)P[E++]=A;if(M>c)break;E>=this.dbufSize&&Es(As.DATA_ERROR),k[A=o[A=ks(f,e=M-1)]]++,P[E++]=A;}else S||(S=1,s=0),s+=0===M?S:2*S,S<<=1;}for((a<0||a>=E)&&Es(As.DATA_ERROR),t=0,e=0;e<256;e++)r=t+k[e],k[e]=t,t=r;for(e=0;e<E;e++)P[k[A=255&P[e]]]|=e<<8,k[A]++;var C=0,K=0,D=0;return E&&(K=255&(C=P[a]),C>>=8,D=-1),this.writePos=C,this.writeCurrent=K,this.writeCount=E,this.writeRun=D,!0},xs.prototype._read_bunzip=function(e,t){var r,i,n;if(this.writeCount<0)return 0;var a=this.dbuf,s=this.writePos,o=this.writeCurrent,c=this.writeCount;this.outputsize;for(var u=this.writeRun;c;){for(c--,i=o,o=255&(s=a[s]),s>>=8,3==u++?(r=o,n=i,o=-1):(r=1,n=o),this.blockCRC.updateCRCRun(n,r);r--;)this.outputStream.writeByte(n),this.nextoutput++;o!=i&&(u=0);}return this.writeCount=c,this.blockCRC.getCRC()!==this.targetBlockCRC&&Es(As.DATA_ERROR,"Bad block CRC (got "+this.blockCRC.getCRC().toString(16)+" expected "+this.targetBlockCRC.toString(16)+")"),this.nextoutput};var Ps=function(e){if("readByte"in e)return e;var t=new vs;return t.pos=0,t.readByte=function(){return e[this.pos++]},t.seek=function(e){this.pos=e;},t.eof=function(){return this.pos>=e.length},t},Ms=function(e){var t=new vs,r=!0;if(e)if("number"==typeof e)t.buffer=new Uint8Array(e),r=!1;else {if("writeByte"in e)return e;t.buffer=e,r=!1;}else t.buffer=new Uint8Array(16384);return t.pos=0,t.writeByte=function(e){if(r&&this.pos>=this.buffer.length){var t=new Uint8Array(2*this.buffer.length);t.set(this.buffer),this.buffer=t;}this.buffer[this.pos++]=e;},t.getBuffer=function(){if(this.pos!==this.buffer.length){if(!r)throw new TypeError("outputsize does not match decoded input");var e=new Uint8Array(this.pos);e.set(this.buffer.subarray(0,this.pos)),this.buffer=e;}return this.buffer},t._coerced=!0,t};var Cs=function(e,t,r){for(var i=Ps(e),n=Ms(t),a=new xs(i,n);!("eof"in i)||!i.eof();)if(a._init_block())a._read_bunzip();else {var s=a.reader.read(32)>>>0;if(s!==a.streamCRC&&Es(As.DATA_ERROR,"Bad stream CRC (got "+a.streamCRC.toString(16)+" expected "+s.toString(16)+")"),!r||!("eof"in i)||i.eof())break;a._start_bunzip(i,n);}if("getBuffer"in n)return n.getBuffer()};class Ks{static get tag(){return ie.packet.literalData}constructor(e=new Date){this.format="utf8",this.date=Z.normalizeDate(e),this.text=null,this.data=null,this.filename="";}setText(e,t="utf8"){this.format=t,this.text=e,this.data=null;}getText(e=!1){return (null===this.text||Z.isStream(this.text))&&(this.text=Z.decodeUTF8(Z.nativeEOL(this.getBytes(e)))),this.text}setBytes(e,t){this.format=t,this.data=e,this.text=null;}getBytes(e=!1){return null===this.data&&(this.data=Z.canonicalizeEOL(Z.encodeUTF8(this.text))),e?F(this.data):this.data}setFilename(e){this.filename=e;}getFilename(){return this.filename}async read(e){await z(e,async e=>{const t=ie.read(ie.literal,await e.readByte()),r=await e.readByte();this.filename=Z.decodeUTF8(await e.readBytes(r)),this.date=Z.readDate(await e.readBytes(4));const i=e.remainder();this.setBytes(i,t);});}writeHeader(){const e=Z.encodeUTF8(this.filename),t=new Uint8Array([e.length]),r=new Uint8Array([ie.write(ie.literal,this.format)]),i=Z.writeDate(this.date);return Z.concatUint8Array([r,t,e,i])}write(){const e=this.writeHeader(),t=this.getBytes();return Z.concat([e,t])}}function Ds(e){let t,r=0;const i=e[0];return i<192?([r]=e,t=1):i<255?(r=(e[0]-192<<8)+e[1]+192,t=2):255===i&&(r=Z.readNumber(e.subarray(1,5)),t=5),{len:r,offset:t}}function Rs(e){return e<192?new Uint8Array([e]):e>191&&e<8384?new Uint8Array([192+(e-192>>8),e-192&255]):Z.concatUint8Array([new Uint8Array([255]),Z.writeNumber(e,4)])}function Is(e){if(e<0||e>30)throw Error("Partial Length power must be between 1 and 30");return new Uint8Array([224+e])}function Us(e){return new Uint8Array([192|e])}function Bs(e,t){return Z.concatUint8Array([Us(e),Rs(t)])}function Ts(e){return [ie.packet.literalData,ie.packet.compressedData,ie.packet.symmetricallyEncryptedData,ie.packet.symEncryptedIntegrityProtectedData,ie.packet.aeadEncryptedData].includes(e)}async function zs(e,t){const r=K(e);let i,a;try{const s=await r.peekBytes(2);if(!s||s.length<2||0==(128&s[0]))throw Error("Error during parsing. This message / key probably does not conform to a valid OpenPGP format.");const o=await r.readByte();let c,u,h=-1,d=-1;d=0,0!=(64&o)&&(d=1),d?h=63&o:(h=(63&o)>>2,u=3&o);const f=Ts(h);let l,p=null;if(f){if("array"===Z.isStream(e)){const e=new n;i=D(e),p=e;}else {const e=new A;i=D(e.writable),p=e.readable;}a=t({tag:h,packet:p});}else p=[];do{if(d){const e=await r.readByte();if(l=!1,e<192)c=e;else if(e>=192&&e<224)c=(e-192<<8)+await r.readByte()+192;else if(e>223&&e<255){if(c=1<<(31&e),l=!0,!f)throw new TypeError("This packet type does not support partial lengths.")}else c=await r.readByte()<<24|await r.readByte()<<16|await r.readByte()<<8|await r.readByte();}else switch(u){case 0:c=await r.readByte();break;case 1:c=await r.readByte()<<8|await r.readByte();break;case 2:c=await r.readByte()<<24|await r.readByte()<<16|await r.readByte()<<8|await r.readByte();break;default:c=1/0;}if(c>0){let e=0;for(;;){i&&await i.ready;const{done:t,value:n}=await r.read();if(t){if(c===1/0)break;throw Error("Unexpected end of packet")}const a=c===1/0?n:n.subarray(0,c-e);if(i?await i.write(a):p.push(a),e+=n.length,e>=c){r.unshift(n.subarray(c-e+n.length));break}}}}while(l);const y=await r.peekBytes(f?1/0:2);return i?(await i.ready,await i.close()):(p=Z.concatUint8Array(p),await t({tag:h,packet:p})),!y||!y.length}catch(e){if(i)return await i.abort(e),!0;throw e}finally{i&&await a,r.releaseLock();}}class qs{static get tag(){return ie.packet.signature}constructor(e=new Date){this.version=4,this.signatureType=null,this.hashAlgorithm=null,this.publicKeyAlgorithm=null,this.signatureData=null,this.unhashedSubpackets=[],this.signedHashValue=null,this.created=Z.normalizeDate(e),this.signatureExpirationTime=null,this.signatureNeverExpires=!0,this.exportable=null,this.trustLevel=null,this.trustAmount=null,this.regularExpression=null,this.revocable=null,this.keyExpirationTime=null,this.keyNeverExpires=null,this.preferredSymmetricAlgorithms=null,this.revocationKeyClass=null,this.revocationKeyAlgorithm=null,this.revocationKeyFingerprint=null,this.issuerKeyID=new pe,this.rawNotations=[],this.notations={},this.preferredHashAlgorithms=null,this.preferredCompressionAlgorithms=null,this.keyServerPreferences=null,this.preferredKeyServer=null,this.isPrimaryUserID=null,this.policyURI=null,this.keyFlags=null,this.signersUserID=null,this.reasonForRevocationFlag=null,this.reasonForRevocationString=null,this.features=null,this.signatureTargetPublicKeyAlgorithm=null,this.signatureTargetHashAlgorithm=null,this.signatureTargetHash=null,this.embeddedSignature=null,this.issuerKeyVersion=null,this.issuerFingerprint=null,this.preferredAEADAlgorithms=null,this.verified=null,this.revoked=null;}read(e){let t=0;if(this.version=e[t++],4!==this.version&&5!==this.version)throw Error("Version "+this.version+" of the signature is unsupported.");this.signatureType=e[t++],this.publicKeyAlgorithm=e[t++],this.hashAlgorithm=e[t++],t+=this.readSubPackets(e.subarray(t,e.length),!0),this.signatureData=e.subarray(0,t),t+=this.readSubPackets(e.subarray(t,e.length),!1),this.signedHashValue=e.subarray(t,t+2),t+=2,this.params=In.signature.parseSignatureParams(this.publicKeyAlgorithm,e.subarray(t,e.length));}writeParams(){return this.params instanceof Promise?W(async()=>In.serializeParams(this.publicKeyAlgorithm,await this.params)):In.serializeParams(this.publicKeyAlgorithm,this.params)}write(){const e=[];return e.push(this.signatureData),e.push(this.writeUnhashedSubPackets()),e.push(this.signedHashValue),e.push(this.writeParams()),Z.concat(e)}async sign(e,t,r=!1){const i=ie.write(ie.signature,this.signatureType),n=ie.write(ie.publicKey,this.publicKeyAlgorithm),a=ie.write(ie.hash,this.hashAlgorithm);5===e.version&&(this.version=5);const s=[new Uint8Array([this.version,i,n,a])];this.issuerKeyVersion=e.version,this.issuerFingerprint=e.getFingerprintBytes(),this.issuerKeyID=e.getKeyID(),s.push(this.writeHashedSubPackets()),this.signatureData=Z.concat(s);const o=this.toHash(i,t,r),c=await this.hash(i,t,o,r);this.signedHashValue=N(q(c),0,2);const u=async()=>In.signature.sign(n,a,e.publicParams,e.privateParams,o,await L(c));Z.isStream(c)?this.params=u():(this.params=await u(),this.verified=!0);}writeHashedSubPackets(){const e=ie.signatureSubpacket,t=[];let r;null!==this.created&&t.push(Fs(e.signatureCreationTime,Z.writeDate(this.created))),null!==this.signatureExpirationTime&&t.push(Fs(e.signatureExpirationTime,Z.writeNumber(this.signatureExpirationTime,4))),null!==this.exportable&&t.push(Fs(e.exportableCertification,new Uint8Array([this.exportable?1:0]))),null!==this.trustLevel&&(r=new Uint8Array([this.trustLevel,this.trustAmount]),t.push(Fs(e.trustSignature,r))),null!==this.regularExpression&&t.push(Fs(e.regularExpression,this.regularExpression)),null!==this.revocable&&t.push(Fs(e.revocable,new Uint8Array([this.revocable?1:0]))),null!==this.keyExpirationTime&&t.push(Fs(e.keyExpirationTime,Z.writeNumber(this.keyExpirationTime,4))),null!==this.preferredSymmetricAlgorithms&&(r=Z.stringToUint8Array(Z.uint8ArrayToString(this.preferredSymmetricAlgorithms)),t.push(Fs(e.preferredSymmetricAlgorithms,r))),null!==this.revocationKeyClass&&(r=new Uint8Array([this.revocationKeyClass,this.revocationKeyAlgorithm]),r=Z.concat([r,this.revocationKeyFingerprint]),t.push(Fs(e.revocationKey,r))),this.rawNotations.forEach(([{name:i,value:n,humanReadable:a}])=>{r=[new Uint8Array([a?128:0,0,0,0])],r.push(Z.writeNumber(i.length,2)),r.push(Z.writeNumber(n.length,2)),r.push(Z.stringToUint8Array(i)),r.push(n),r=Z.concat(r),t.push(Fs(e.notationData,r));}),null!==this.preferredHashAlgorithms&&(r=Z.stringToUint8Array(Z.uint8ArrayToString(this.preferredHashAlgorithms)),t.push(Fs(e.preferredHashAlgorithms,r))),null!==this.preferredCompressionAlgorithms&&(r=Z.stringToUint8Array(Z.uint8ArrayToString(this.preferredCompressionAlgorithms)),t.push(Fs(e.preferredCompressionAlgorithms,r))),null!==this.keyServerPreferences&&(r=Z.stringToUint8Array(Z.uint8ArrayToString(this.keyServerPreferences)),t.push(Fs(e.keyServerPreferences,r))),null!==this.preferredKeyServer&&t.push(Fs(e.preferredKeyServer,Z.stringToUint8Array(this.preferredKeyServer))),null!==this.isPrimaryUserID&&t.push(Fs(e.primaryUserID,new Uint8Array([this.isPrimaryUserID?1:0]))),null!==this.policyURI&&t.push(Fs(e.policyURI,Z.stringToUint8Array(this.policyURI))),null!==this.keyFlags&&(r=Z.stringToUint8Array(Z.uint8ArrayToString(this.keyFlags)),t.push(Fs(e.keyFlags,r))),null!==this.signersUserID&&t.push(Fs(e.signersUserID,Z.stringToUint8Array(this.signersUserID))),null!==this.reasonForRevocationFlag&&(r=Z.stringToUint8Array(String.fromCharCode(this.reasonForRevocationFlag)+this.reasonForRevocationString),t.push(Fs(e.reasonForRevocation,r))),null!==this.features&&(r=Z.stringToUint8Array(Z.uint8ArrayToString(this.features)),t.push(Fs(e.features,r))),null!==this.signatureTargetPublicKeyAlgorithm&&(r=[new Uint8Array([this.signatureTargetPublicKeyAlgorithm,this.signatureTargetHashAlgorithm])],r.push(Z.stringToUint8Array(this.signatureTargetHash)),r=Z.concat(r),t.push(Fs(e.signatureTarget,r))),null!==this.preferredAEADAlgorithms&&(r=Z.stringToUint8Array(Z.uint8ArrayToString(this.preferredAEADAlgorithms)),t.push(Fs(e.preferredAEADAlgorithms,r)));const i=Z.concat(t),n=Z.writeNumber(i.length,2);return Z.concat([n,i])}writeUnhashedSubPackets(){const e=ie.signatureSubpacket,t=[];let r;this.issuerKeyID.isNull()||5===this.issuerKeyVersion||t.push(Fs(e.issuer,this.issuerKeyID.write())),null!==this.embeddedSignature&&t.push(Fs(e.embeddedSignature,this.embeddedSignature.write())),null!==this.issuerFingerprint&&(r=[new Uint8Array([this.issuerKeyVersion]),this.issuerFingerprint],r=Z.concat(r),t.push(Fs(e.issuerFingerprint,r))),this.unhashedSubpackets.forEach(e=>{t.push(Rs(e.length)),t.push(e);});const i=Z.concat(t),n=Z.writeNumber(i.length,2);return Z.concat([n,i])}readSubPacket(e,t=!0){let r=0;const i=(e,t)=>{this[e]=[];for(let r=0;r<t.length;r++)this[e].push(t[r]);},n=128&e[r],a=127&e[r];if(t||[ie.signatureSubpacket.issuer,ie.signatureSubpacket.issuerFingerprint,ie.signatureSubpacket.embeddedSignature].includes(a))switch(r++,a){case 2:this.created=Z.readDate(e.subarray(r,e.length));break;case 3:{const t=Z.readNumber(e.subarray(r,e.length));this.signatureNeverExpires=0===t,this.signatureExpirationTime=t;break}case 4:this.exportable=1===e[r++];break;case 5:this.trustLevel=e[r++],this.trustAmount=e[r++];break;case 6:this.regularExpression=e[r];break;case 7:this.revocable=1===e[r++];break;case 9:{const t=Z.readNumber(e.subarray(r,e.length));this.keyExpirationTime=t,this.keyNeverExpires=0===t;break}case 11:i("preferredSymmetricAlgorithms",e.subarray(r,e.length));break;case 12:this.revocationKeyClass=e[r++],this.revocationKeyAlgorithm=e[r++],this.revocationKeyFingerprint=e.subarray(r,r+20);break;case 16:this.issuerKeyID.read(e.subarray(r,e.length));break;case 20:{const t=!!(128&e[r]);r+=4;const i=Z.readNumber(e.subarray(r,r+2));r+=2;const a=Z.readNumber(e.subarray(r,r+2));r+=2;const s=Z.uint8ArrayToString(e.subarray(r,r+i)),o=e.subarray(r+i,r+i+a);this.rawNotations.push({name:s,humanReadable:t,value:o,critical:n}),t&&(this.notations[s]=Z.uint8ArrayToString(o));break}case 21:i("preferredHashAlgorithms",e.subarray(r,e.length));break;case 22:i("preferredCompressionAlgorithms",e.subarray(r,e.length));break;case 23:i("keyServerPreferences",e.subarray(r,e.length));break;case 24:this.preferredKeyServer=Z.uint8ArrayToString(e.subarray(r,e.length));break;case 25:this.isPrimaryUserID=0!==e[r++];break;case 26:this.policyURI=Z.uint8ArrayToString(e.subarray(r,e.length));break;case 27:i("keyFlags",e.subarray(r,e.length));break;case 28:this.signersUserID=Z.uint8ArrayToString(e.subarray(r,e.length));break;case 29:this.reasonForRevocationFlag=e[r++],this.reasonForRevocationString=Z.uint8ArrayToString(e.subarray(r,e.length));break;case 30:i("features",e.subarray(r,e.length));break;case 31:{this.signatureTargetPublicKeyAlgorithm=e[r++],this.signatureTargetHashAlgorithm=e[r++];const t=In.getHashByteLength(this.signatureTargetHashAlgorithm);this.signatureTargetHash=Z.uint8ArrayToString(e.subarray(r,r+t));break}case 32:this.embeddedSignature=new qs,this.embeddedSignature.read(e.subarray(r,e.length));break;case 33:this.issuerKeyVersion=e[r++],this.issuerFingerprint=e.subarray(r,e.length),5===this.issuerKeyVersion?this.issuerKeyID.read(this.issuerFingerprint):this.issuerKeyID.read(this.issuerFingerprint.subarray(-8));break;case 34:i.call(this,"preferredAEADAlgorithms",e.subarray(r,e.length));break;default:{const e=Error("Unknown signature subpacket type "+a+" @:"+r);if(n)throw e;Z.printDebug(e);}}else this.unhashedSubpackets.push(e.subarray(r,e.length));}readSubPackets(e,t=!0,r){const i=Z.readNumber(e.subarray(0,2));let n=2;for(;n<2+i;){const i=Ds(e.subarray(n,e.length));n+=i.offset,this.readSubPacket(e.subarray(n,n+i.len),t,r),n+=i.len;}return n}toSign(e,t){const r=ie.signature;switch(e){case r.binary:return null!==t.text?Z.encodeUTF8(t.getText(!0)):t.getBytes(!0);case r.text:{const e=t.getBytes(!0);return Z.canonicalizeEOL(e)}case r.standalone:return new Uint8Array(0);case r.certGeneric:case r.certPersona:case r.certCasual:case r.certPositive:case r.certRevocation:{let e,i;if(t.userID)i=180,e=t.userID;else {if(!t.userAttribute)throw Error("Either a userID or userAttribute packet needs to be supplied for certification.");i=209,e=t.userAttribute;}const n=e.write();return Z.concat([this.toSign(r.key,t),new Uint8Array([i]),Z.writeNumber(n.length,4),n])}case r.subkeyBinding:case r.subkeyRevocation:case r.keyBinding:return Z.concat([this.toSign(r.key,t),this.toSign(r.key,{key:t.bind})]);case r.key:if(void 0===t.key)throw Error("Key packet is required for this signature.");return t.key.writeForHash(this.version);case r.keyRevocation:return this.toSign(r.key,t);case r.timestamp:return new Uint8Array(0);case r.thirdParty:throw Error("Not implemented");default:throw Error("Unknown signature type.")}}calculateTrailer(e,t){let r=0;return B(q(this.signatureData),e=>{r+=e.length;},()=>{const i=[];return 5!==this.version||this.signatureType!==ie.signature.binary&&this.signatureType!==ie.signature.text||(t?i.push(new Uint8Array(6)):i.push(e.writeHeader())),i.push(new Uint8Array([this.version,255])),5===this.version&&i.push(new Uint8Array(4)),i.push(Z.writeNumber(r,4)),Z.concat(i)})}toHash(e,t,r=!1){const i=this.toSign(e,t);return Z.concat([i,this.signatureData,this.calculateTrailer(t,r)])}async hash(e,t,r,i=!1){const n=ie.write(ie.hash,this.hashAlgorithm);return r||(r=this.toHash(e,t,i)),In.hash.digest(n,r)}async verify(e,t,r,i=!1,n=ne){const a=ie.write(ie.publicKey,this.publicKeyAlgorithm),s=ie.write(ie.hash,this.hashAlgorithm);if(a!==ie.write(ie.publicKey,e.algorithm))throw Error("Public key algorithm used to sign signature does not match issuer key algorithm.");let o,c;if(this.hashed?c=await this.hashed:(o=this.toHash(t,r,i),c=await this.hash(t,r,o)),c=await L(c),this.signedHashValue[0]!==c[0]||this.signedHashValue[1]!==c[1])throw Error("Message digest did not match");if(this.params=await this.params,!await In.signature.verify(a,s,this.params,e.publicParams,o,c))throw Error("Signature verification failed");if(n.rejectHashAlgorithms.has(s))throw Error("Insecure hash algorithm: "+ie.read(ie.hash,s).toUpperCase());if(n.rejectMessageHashAlgorithms.has(s)&&[ie.signature.binary,ie.signature.text].includes(this.signatureType))throw Error("Insecure message hash algorithm: "+ie.read(ie.hash,s).toUpperCase());if(this.rawNotations.forEach(({name:e,critical:t})=>{if(t&&n.knownNotations.indexOf(e)<0)throw Error("Unknown critical notation: "+e)}),null!==this.revocationKeyClass)throw Error("This key is intended to be revoked with an authorized key, which OpenPGP.js does not support.");this.verified=!0;}isExpired(e=new Date){const t=Z.normalizeDate(e);if(null!==t){const e=this.getExpirationTime();return !(this.created<=t&&t<=e)}return !1}getExpirationTime(){return this.signatureNeverExpires?1/0:new Date(this.created.getTime()+1e3*this.signatureExpirationTime)}}function Fs(e,t){const r=[];return r.push(Rs(t.length+1)),r.push(new Uint8Array([e])),r.push(t),Z.concat(r)}class Os{static get tag(){return ie.packet.onePassSignature}constructor(){this.version=null,this.signatureType=null,this.hashAlgorithm=null,this.publicKeyAlgorithm=null,this.issuerKeyID=null,this.flags=null;}read(e){let t=0;return this.version=e[t++],this.signatureType=e[t++],this.hashAlgorithm=e[t++],this.publicKeyAlgorithm=e[t++],this.issuerKeyID=new pe,this.issuerKeyID.read(e.subarray(t,t+8)),t+=8,this.flags=e[t++],this}write(){const e=new Uint8Array([3,ie.write(ie.signature,this.signatureType),ie.write(ie.hash,this.hashAlgorithm),ie.write(ie.publicKey,this.publicKeyAlgorithm)]),t=new Uint8Array([this.flags]);return Z.concatUint8Array([e,this.issuerKeyID.write(),t])}calculateTrailer(...e){return W(async()=>qs.prototype.calculateTrailer.apply(await this.correspondingSig,e))}async verify(){const e=await this.correspondingSig;if(!e||e.constructor.tag!==ie.packet.signature)throw Error("Corresponding signature packet missing");if(e.signatureType!==this.signatureType||e.hashAlgorithm!==this.hashAlgorithm||e.publicKeyAlgorithm!==this.publicKeyAlgorithm||!e.issuerKeyID.equals(this.issuerKeyID))throw Error("Corresponding signature packet does not match one-pass signature packet");return e.hashed=this.hashed,e.verify.apply(e,arguments)}}Os.prototype.hash=qs.prototype.hash,Os.prototype.toHash=qs.prototype.toHash,Os.prototype.toSign=qs.prototype.toSign;const Ns=/*#__PURE__*/Z.constructAllowedPackets([Ks,Os,qs]);class Ls{static get tag(){return ie.packet.compressedData}constructor(e=ne){this.packets=null,this.algorithm=ie.read(ie.compression,e.preferredCompressionAlgorithm),this.compressed=null,this.deflateLevel=e.deflateLevel;}async read(e){await z(e,async e=>{this.algorithm=ie.read(ie.compression,await e.readByte()),this.compressed=e.remainder(),await this.decompress();});}write(){return null===this.compressed&&this.compress(),Z.concat([new Uint8Array([ie.write(ie.compression,this.algorithm)]),this.compressed])}async decompress(){if(!Ys[this.algorithm])throw Error(this.algorithm+" decompression not supported");await this.packets.read(Ys[this.algorithm](this.compressed),Ns);}compress(){if(!Zs[this.algorithm])throw Error(this.algorithm+" compression not supported");this.compressed=Zs[this.algorithm](this.packets.write(),this.deflateLevel);}}const js=Z.getNodeZlib();function Ws(e){return e}function Hs(e,t,r={}){return function(i){return !Z.isStream(i)||a(i)?W(()=>L(i).then(t=>new Promise((i,n)=>{e(t,r,(e,t)=>{if(e)return n(e);i(t);});}))):p(y(i).pipe(t(r)))}}function Gs(e,t={}){return function(r){const i=new e(t);return B(r,e=>{if(e.length)return i.push(e,2),i.result},()=>{if(e===Ya)return i.push([],4),i.result})}}function Vs(e){return function(t){return W(async()=>e(await L(t)))}}const Zs=js?{zip:/*#__PURE__*/(e,t)=>Hs(js.deflateRaw,js.createDeflateRaw,{level:t})(e),zlib:/*#__PURE__*/(e,t)=>Hs(js.deflate,js.createDeflate,{level:t})(e)}:{zip:/*#__PURE__*/(e,t)=>Gs(Ya,{raw:!0,level:t})(e),zlib:/*#__PURE__*/(e,t)=>Gs(Ya,{level:t})(e)},Ys=js?{uncompressed:Ws,zip:/*#__PURE__*/Hs(js.inflateRaw,js.createInflateRaw),zlib:/*#__PURE__*/Hs(js.inflate,js.createInflate),bzip2:/*#__PURE__*/Vs(Cs)}:{uncompressed:Ws,zip:/*#__PURE__*/Gs(ps,{raw:!0}),zlib:/*#__PURE__*/Gs(ps),bzip2:/*#__PURE__*/Vs(Cs)},$s=/*#__PURE__*/Z.constructAllowedPackets([Ks,Ls,Os,qs]);class Xs{static get tag(){return ie.packet.symEncryptedIntegrityProtectedData}constructor(){this.version=1,this.encrypted=null,this.modification=!1,this.packets=null;}async read(e){await z(e,async e=>{if(1!==await e.readByte())throw Error("Invalid packet version.");this.encrypted=e.remainder();});}write(){return Z.concat([new Uint8Array([1]),this.encrypted])}async encrypt(e,t,r=ne){let i=this.packets.write();a(i)&&(i=await L(i));const n=await In.getPrefixRandom(e),s=new Uint8Array([211,20]),o=Z.concat([n,i,s]),c=await In.hash.sha1(F(o)),u=Z.concat([o,c]);return this.encrypted=await In.mode.cfb.encrypt(e,t,u,new Uint8Array(In.cipher[e].blockSize),r),!0}async decrypt(e,t,r=ne){let i=q(this.encrypted);a(i)&&(i=await L(i));const n=await In.mode.cfb.decrypt(e,t,i,new Uint8Array(In.cipher[e].blockSize)),s=N(F(n),-20),o=N(n,0,-20),c=Promise.all([L(await In.hash.sha1(F(o))),L(s)]).then(([e,t])=>{if(!Z.equalsUint8Array(e,t))throw Error("Modification detected.");return new Uint8Array}),u=N(o,In.cipher[e].blockSize+2);let h=N(u,0,-2);return h=M([h,W(()=>c)]),Z.isStream(i)&&r.allowUnauthenticatedStream||(h=await L(h)),await this.packets.read(h,$s),!0}}const Js=/*#__PURE__*/Z.constructAllowedPackets([Ks,Ls,Os,qs]);class Qs{static get tag(){return ie.packet.aeadEncryptedData}constructor(){this.version=1,this.cipherAlgo=null,this.aeadAlgorithm="eax",this.aeadAlgo=null,this.chunkSizeByte=null,this.iv=null,this.encrypted=null,this.packets=null;}async read(e){await z(e,async e=>{if(1!==await e.readByte())throw Error("Invalid packet version.");this.cipherAlgo=await e.readByte(),this.aeadAlgo=await e.readByte(),this.chunkSizeByte=await e.readByte();const t=In.mode[ie.read(ie.aead,this.aeadAlgo)];this.iv=await e.readBytes(t.ivLength),this.encrypted=e.remainder();});}write(){return Z.concat([new Uint8Array([this.version,this.cipherAlgo,this.aeadAlgo,this.chunkSizeByte]),this.iv,this.encrypted])}async decrypt(e,t){await this.packets.read(await this.crypt("decrypt",t,q(this.encrypted)),Js);}async encrypt(e,t,r=ne){this.cipherAlgo=ie.write(ie.symmetric,e),this.aeadAlgo=ie.write(ie.aead,this.aeadAlgorithm);const i=In.mode[ie.read(ie.aead,this.aeadAlgo)];this.iv=await In.random.getRandomBytes(i.ivLength),this.chunkSizeByte=r.aeadChunkSizeByte;const n=this.packets.write();this.encrypted=await this.crypt("encrypt",t,n);}async crypt(e,t,r){const i=ie.read(ie.symmetric,this.cipherAlgo),n=In.mode[ie.read(ie.aead,this.aeadAlgo)],a=await n(i,t),s="decrypt"===e?n.tagLength:0,o="encrypt"===e?n.tagLength:0,c=2**(this.chunkSizeByte+6)+s,u=new ArrayBuffer(21),h=new Uint8Array(u,0,13),d=new Uint8Array(u),f=new DataView(u),l=new Uint8Array(u,5,8);h.set([192|Qs.tag,this.version,this.cipherAlgo,this.aeadAlgo,this.chunkSizeByte],0);let p=0,y=Promise.resolve(),b=0,m=0;const g=this.iv;return T(r,async(t,r)=>{if("array"!==Z.isStream(t)){const e=new A({},{highWaterMark:Z.getHardwareConcurrency()*2**(this.chunkSizeByte+6),size:e=>e.length});R(e.readable,r),r=e.writable;}const i=K(t),u=D(r);try{for(;;){let t=await i.readBytes(c+s)||new Uint8Array;const r=t.subarray(t.length-s);let w,v;if(t=t.subarray(0,t.length-s),!p||t.length?(i.unshift(r),w=a[e](t,n.getNonce(g,l),h),m+=t.length-s+o):(f.setInt32(17,b),w=a[e](r,n.getNonce(g,l),d),m+=o,v=!0),b+=t.length-s,y=y.then(()=>w).then(async e=>{await u.ready,await u.write(e),m-=e.length;}).catch(e=>u.abort(e)),(v||m>u.desiredSize)&&await y,v){await u.close();break}f.setInt32(9,++p);}}catch(e){await u.abort(e);}})}}class eo{static get tag(){return ie.packet.publicKeyEncryptedSessionKey}constructor(){this.version=3,this.publicKeyID=new pe,this.publicKeyAlgorithm=null,this.sessionKey=null,this.sessionKeyAlgorithm=null,this.encrypted={};}read(e){this.version=e[0],this.publicKeyID.read(e.subarray(1,e.length)),this.publicKeyAlgorithm=ie.read(ie.publicKey,e[9]);const t=ie.write(ie.publicKey,this.publicKeyAlgorithm);this.encrypted=In.parseEncSessionKeyParams(t,e.subarray(10));}write(){const e=ie.write(ie.publicKey,this.publicKeyAlgorithm),t=[new Uint8Array([this.version]),this.publicKeyID.write(),new Uint8Array([ie.write(ie.publicKey,this.publicKeyAlgorithm)]),In.serializeParams(e,this.encrypted)];return Z.concatUint8Array(t)}async encrypt(e){const t=Z.concatUint8Array([new Uint8Array([ie.write(ie.symmetric,this.sessionKeyAlgorithm)]),this.sessionKey,Z.writeChecksum(this.sessionKey)]),r=ie.write(ie.publicKey,this.publicKeyAlgorithm);return this.encrypted=await In.publicKeyEncrypt(r,e.publicParams,t,e.getFingerprintBytes()),!0}async decrypt(e){const t=ie.write(ie.publicKey,this.publicKeyAlgorithm);if(t!==ie.write(ie.publicKey,e.algorithm))throw Error("Decryption error");const r=await In.publicKeyDecrypt(t,e.publicParams,e.privateParams,this.encrypted,e.getFingerprintBytes()),i=r.subarray(r.length-2),n=r.subarray(1,r.length-2);if(!Z.equalsUint8Array(i,Z.writeChecksum(n)))throw Error("Decryption error");return this.sessionKey=n,this.sessionKeyAlgorithm=ie.read(ie.symmetric,r[0]),!0}}class to{constructor(e=ne){this.algorithm="sha256",this.type="iterated",this.c=e.s2kIterationCountByte,this.salt=null;}getCount(){return 16+(15&this.c)<<6+(this.c>>4)}read(e){let t=0;switch(this.type=ie.read(ie.s2k,e[t++]),this.algorithm=e[t++],"gnu"!==this.type&&(this.algorithm=ie.read(ie.hash,this.algorithm)),this.type){case"simple":break;case"salted":this.salt=e.subarray(t,t+8),t+=8;break;case"iterated":this.salt=e.subarray(t,t+8),t+=8,this.c=e[t++];break;case"gnu":if("GNU"!==Z.uint8ArrayToString(e.subarray(t,t+3)))throw Error("Unknown s2k type.");if(t+=3,1001!==1e3+e[t++])throw Error("Unknown s2k gnu protection mode.");this.type="gnu-dummy";break;default:throw Error("Unknown s2k type.")}return t}write(){if("gnu-dummy"===this.type)return new Uint8Array([101,0,...Z.stringToUint8Array("GNU"),1]);const e=[new Uint8Array([ie.write(ie.s2k,this.type),ie.write(ie.hash,this.algorithm)])];switch(this.type){case"simple":break;case"salted":e.push(this.salt);break;case"iterated":e.push(this.salt),e.push(new Uint8Array([this.c]));break;case"gnu":throw Error("GNU s2k type not supported.");default:throw Error("Unknown s2k type.")}return Z.concatUint8Array(e)}async produceKey(e,t){e=Z.encodeUTF8(e);const r=ie.write(ie.hash,this.algorithm),i=[];let n=0,a=0;for(;n<t;){let t;switch(this.type){case"simple":t=Z.concatUint8Array([new Uint8Array(a),e]);break;case"salted":t=Z.concatUint8Array([new Uint8Array(a),this.salt,e]);break;case"iterated":{const r=Z.concatUint8Array([this.salt,e]);let i=r.length;const n=Math.max(this.getCount(),i);t=new Uint8Array(a+n),t.set(r,a);for(let e=a+i;e<n;e+=i,i*=2)t.copyWithin(e,a,e);break}case"gnu":throw Error("GNU s2k type not supported.");default:throw Error("Unknown s2k type.")}const s=await In.hash.digest(r,t);i.push(s),n+=s.length,a++;}return Z.concatUint8Array(i).subarray(0,t)}}class ro{static get tag(){return ie.packet.symEncryptedSessionKey}constructor(e=ne){this.version=e.aeadProtect?5:4,this.sessionKey=null,this.sessionKeyEncryptionAlgorithm=null,this.sessionKeyAlgorithm="aes256",this.aeadAlgorithm=ie.read(ie.aead,e.preferredAEADAlgorithm),this.encrypted=null,this.s2k=null,this.iv=null;}read(e){let t=0;this.version=e[t++];const r=ie.read(ie.symmetric,e[t++]);if(5===this.version&&(this.aeadAlgorithm=ie.read(ie.aead,e[t++])),this.s2k=new to,t+=this.s2k.read(e.subarray(t,e.length)),5===this.version){const r=In.mode[this.aeadAlgorithm];this.iv=e.subarray(t,t+=r.ivLength);}5===this.version||t<e.length?(this.encrypted=e.subarray(t,e.length),this.sessionKeyEncryptionAlgorithm=r):this.sessionKeyAlgorithm=r;}write(){const e=null===this.encrypted?this.sessionKeyAlgorithm:this.sessionKeyEncryptionAlgorithm;let t;return 5===this.version?t=Z.concatUint8Array([new Uint8Array([this.version,ie.write(ie.symmetric,e),ie.write(ie.aead,this.aeadAlgorithm)]),this.s2k.write(),this.iv,this.encrypted]):(t=Z.concatUint8Array([new Uint8Array([this.version,ie.write(ie.symmetric,e)]),this.s2k.write()]),null!==this.encrypted&&(t=Z.concatUint8Array([t,this.encrypted]))),t}async decrypt(e){const t=null!==this.sessionKeyEncryptionAlgorithm?this.sessionKeyEncryptionAlgorithm:this.sessionKeyAlgorithm,r=In.cipher[t].keySize,i=await this.s2k.produceKey(e,r);if(5===this.version){const e=In.mode[this.aeadAlgorithm],r=new Uint8Array([192|ro.tag,this.version,ie.write(ie.symmetric,this.sessionKeyEncryptionAlgorithm),ie.write(ie.aead,this.aeadAlgorithm)]),n=await e(t,i);this.sessionKey=await n.decrypt(this.encrypted,this.iv,r);}else if(null!==this.encrypted){const e=await In.mode.cfb.decrypt(t,i,this.encrypted,new Uint8Array(In.cipher[t].blockSize));this.sessionKeyAlgorithm=ie.read(ie.symmetric,e[0]),this.sessionKey=e.subarray(1,e.length);}else this.sessionKey=i;}async encrypt(e,t=ne){const r=null!==this.sessionKeyEncryptionAlgorithm?this.sessionKeyEncryptionAlgorithm:this.sessionKeyAlgorithm;this.sessionKeyEncryptionAlgorithm=r,this.s2k=new to(t),this.s2k.salt=await In.random.getRandomBytes(8);const i=In.cipher[r].keySize,n=await this.s2k.produceKey(e,i);if(null===this.sessionKey&&(this.sessionKey=await In.generateSessionKey(this.sessionKeyAlgorithm)),5===this.version){const e=In.mode[this.aeadAlgorithm];this.iv=await In.random.getRandomBytes(e.ivLength);const t=new Uint8Array([192|ro.tag,this.version,ie.write(ie.symmetric,this.sessionKeyEncryptionAlgorithm),ie.write(ie.aead,this.aeadAlgorithm)]),i=await e(r,n);this.encrypted=await i.encrypt(this.sessionKey,this.iv,t);}else {const e=new Uint8Array([ie.write(ie.symmetric,this.sessionKeyAlgorithm)]),i=Z.concatUint8Array([e,this.sessionKey]);this.encrypted=await In.mode.cfb.encrypt(r,n,i,new Uint8Array(In.cipher[r].blockSize),t);}}}class io{static get tag(){return ie.packet.publicKey}constructor(e=new Date,t=ne){this.version=t.v5Keys?5:4,this.created=Z.normalizeDate(e),this.algorithm=null,this.publicParams=null,this.expirationTimeV3=0,this.fingerprint=null,this.keyID=null;}read(e){let t=0;if(this.version=e[t++],4===this.version||5===this.version){this.created=Z.readDate(e.subarray(t,t+4)),t+=4,this.algorithm=ie.read(ie.publicKey,e[t++]);const r=ie.write(ie.publicKey,this.algorithm);5===this.version&&(t+=4);try{const{read:i,publicParams:n}=In.parsePublicKeyParams(r,e.subarray(t));this.publicParams=n,t+=i;}catch(e){throw Error("Error reading MPIs")}return t}throw Error("Version "+this.version+" of the key packet is unsupported.")}write(){const e=[];e.push(new Uint8Array([this.version])),e.push(Z.writeDate(this.created));const t=ie.write(ie.publicKey,this.algorithm);e.push(new Uint8Array([t]));const r=In.serializeParams(t,this.publicParams);return 5===this.version&&e.push(Z.writeNumber(r.length,4)),e.push(r),Z.concatUint8Array(e)}writeForHash(e){const t=this.writePublicKey();return 5===e?Z.concatUint8Array([new Uint8Array([154]),Z.writeNumber(t.length,4),t]):Z.concatUint8Array([new Uint8Array([153]),Z.writeNumber(t.length,2),t])}isDecrypted(){return null}getCreationTime(){return this.created}getKeyID(){return this.keyID||(this.keyID=new pe,5===this.version?this.keyID.read(Z.hexToUint8Array(this.getFingerprint()).subarray(0,8)):4===this.version&&this.keyID.read(Z.hexToUint8Array(this.getFingerprint()).subarray(12,20))),this.keyID}getFingerprintBytes(){if(this.fingerprint)return this.fingerprint;const e=this.writeForHash(this.version);return 5===this.version?this.fingerprint=Je.bytes(e):4===this.version&&(this.fingerprint=Ye.bytes(e)),this.fingerprint}getFingerprint(){return Z.uint8ArrayToHex(this.getFingerprintBytes())}hasSameFingerprintAs(e){return this.version===e.version&&Z.equalsUint8Array(this.writePublicKey(),e.writePublicKey())}getAlgorithmInfo(){const e={};e.algorithm=this.algorithm;const t=this.publicParams.n||this.publicParams.p;return t?e.bits=Z.uint8ArrayBitLength(t):e.curve=this.publicParams.oid.getName(),e}}io.prototype.readPublicKey=io.prototype.read,io.prototype.writePublicKey=io.prototype.write;const no=/*#__PURE__*/Z.constructAllowedPackets([Ks,Ls,Os,qs]);class ao{static get tag(){return ie.packet.symmetricallyEncryptedData}constructor(){this.encrypted=null,this.packets=null;}read(e){this.encrypted=e;}write(){return this.encrypted}async decrypt(e,t,r=ne){if(!r.allowUnauthenticatedMessages)throw Error("Message is not authenticated.");const i=await L(q(this.encrypted)),n=await In.mode.cfb.decrypt(e,t,i.subarray(In.cipher[e].blockSize+2),i.subarray(2,In.cipher[e].blockSize+2));await this.packets.read(n,no);}async encrypt(e,t,r=ne){const i=this.packets.write(),n=await In.getPrefixRandom(e),a=await In.mode.cfb.encrypt(e,t,n,new Uint8Array(In.cipher[e].blockSize),r),s=await In.mode.cfb.encrypt(e,t,i,a.subarray(2),r);this.encrypted=Z.concat([a,s]);}}class oo extends io{static get tag(){return ie.packet.publicSubkey}constructor(e,t){super(e,t);}}class co{static get tag(){return ie.packet.userAttribute}constructor(){this.attributes=[];}read(e){let t=0;for(;t<e.length;){const r=Ds(e.subarray(t,e.length));t+=r.offset,this.attributes.push(Z.uint8ArrayToString(e.subarray(t,t+r.len))),t+=r.len;}}write(){const e=[];for(let t=0;t<this.attributes.length;t++)e.push(Rs(this.attributes[t].length)),e.push(Z.stringToUint8Array(this.attributes[t]));return Z.concatUint8Array(e)}equals(e){return !!(e&&e instanceof co)&&this.attributes.every((function(t,r){return t===e.attributes[r]}))}}class uo extends io{static get tag(){return ie.packet.secretKey}constructor(e=new Date,t=ne){super(e,t),this.keyMaterial=null,this.isEncrypted=null,this.s2kUsage=0,this.s2k=null,this.symmetric=null,this.aead=null,this.privateParams=null;}read(e){let t=this.readPublicKey(e);if(this.s2kUsage=e[t++],5===this.version&&t++,255===this.s2kUsage||254===this.s2kUsage||253===this.s2kUsage){if(this.symmetric=e[t++],this.symmetric=ie.read(ie.symmetric,this.symmetric),253===this.s2kUsage&&(this.aead=e[t++],this.aead=ie.read(ie.aead,this.aead)),this.s2k=new to,t+=this.s2k.read(e.subarray(t,e.length)),"gnu-dummy"===this.s2k.type)return}else this.s2kUsage&&(this.symmetric=this.s2kUsage,this.symmetric=ie.read(ie.symmetric,this.symmetric));if(this.s2kUsage&&(this.iv=e.subarray(t,t+In.cipher[this.symmetric].blockSize),t+=this.iv.length),5===this.version&&(t+=4),this.keyMaterial=e.subarray(t),this.isEncrypted=!!this.s2kUsage,!this.isEncrypted){const e=this.keyMaterial.subarray(0,-2);if(!Z.equalsUint8Array(Z.writeChecksum(e),this.keyMaterial.subarray(-2)))throw Error("Key checksum mismatch");try{const t=ie.write(ie.publicKey,this.algorithm),{privateParams:r}=In.parsePrivateKeyParams(t,e,this.publicParams);this.privateParams=r;}catch(e){throw Error("Error reading MPIs")}}}write(){const e=[this.writePublicKey()];e.push(new Uint8Array([this.s2kUsage]));const t=[];if(255!==this.s2kUsage&&254!==this.s2kUsage&&253!==this.s2kUsage||(t.push(ie.write(ie.symmetric,this.symmetric)),253===this.s2kUsage&&t.push(ie.write(ie.aead,this.aead)),t.push(...this.s2k.write())),this.s2kUsage&&"gnu-dummy"!==this.s2k.type&&t.push(...this.iv),5===this.version&&e.push(new Uint8Array([t.length])),e.push(new Uint8Array(t)),!this.isDummy()){if(!this.s2kUsage){const e=ie.write(ie.publicKey,this.algorithm);this.keyMaterial=In.serializeParams(e,this.privateParams);}5===this.version&&e.push(Z.writeNumber(this.keyMaterial.length,4)),e.push(this.keyMaterial),this.s2kUsage||e.push(Z.writeChecksum(this.keyMaterial));}return Z.concatUint8Array(e)}isDecrypted(){return !1===this.isEncrypted}isDummy(){return !(!this.s2k||"gnu-dummy"!==this.s2k.type)}makeDummy(e=ne){this.isDummy()||(this.isDecrypted()&&this.clearPrivateParams(),this.isEncrypted=null,this.keyMaterial=null,this.s2k=new to(e),this.s2k.algorithm=0,this.s2k.c=0,this.s2k.type="gnu-dummy",this.s2kUsage=254,this.symmetric="aes256");}async encrypt(e,t=ne){if(this.isDummy())return;if(!this.isDecrypted())throw Error("Key packet is already encrypted");if(this.isDecrypted()&&!e)return void(this.s2kUsage=0);if(!e)throw Error("The key must be decrypted before removing passphrase protection.");this.s2k=new to(t),this.s2k.salt=await In.random.getRandomBytes(8);const r=ie.write(ie.publicKey,this.algorithm),i=In.serializeParams(r,this.privateParams);this.symmetric="aes256";const n=await ho(this.s2k,e,this.symmetric),a=In.cipher[this.symmetric].blockSize;if(this.iv=await In.random.getRandomBytes(a),t.aeadProtect){this.s2kUsage=253,this.aead="eax";const e=In.mode[this.aead],t=await e(this.symmetric,n);this.keyMaterial=await t.encrypt(i,this.iv.subarray(0,e.ivLength),new Uint8Array);}else this.s2kUsage=254,this.keyMaterial=await In.mode.cfb.encrypt(this.symmetric,n,Z.concatUint8Array([i,await In.hash.sha1(i,t)]),this.iv,t);}async decrypt(e){if(this.isDummy())return !1;if(this.isDecrypted())throw Error("Key packet is already decrypted.");let t,r;if(254!==this.s2kUsage&&253!==this.s2kUsage)throw 255===this.s2kUsage?Error("Encrypted private key is authenticated using an insecure two-byte hash"):Error("Private key is encrypted using an insecure S2K function: unsalted MD5");if(t=await ho(this.s2k,e,this.symmetric),253===this.s2kUsage){const e=In.mode[this.aead];try{const i=await e(this.symmetric,t);r=await i.decrypt(this.keyMaterial,this.iv.subarray(0,e.ivLength),new Uint8Array);}catch(e){if("Authentication tag mismatch"===e.message)throw Error("Incorrect key passphrase: "+e.message);throw e}}else {const e=await In.mode.cfb.decrypt(this.symmetric,t,this.keyMaterial,this.iv);r=e.subarray(0,-20);const i=await In.hash.sha1(r);if(!Z.equalsUint8Array(i,e.subarray(-20)))throw Error("Incorrect key passphrase")}try{const e=ie.write(ie.publicKey,this.algorithm),{privateParams:t}=In.parsePrivateKeyParams(e,r,this.publicParams);this.privateParams=t;}catch(e){throw Error("Error reading MPIs")}this.isEncrypted=!1,this.keyMaterial=null,this.s2kUsage=0;}async validate(){if(this.isDummy())return;if(!this.isDecrypted())throw Error("Key is not decrypted");const e=ie.write(ie.publicKey,this.algorithm);let t;try{t=await In.validateParams(e,this.publicParams,this.privateParams);}catch(e){t=!1;}if(!t)throw Error("Key is invalid")}async generate(e,t){const r=ie.write(ie.publicKey,this.algorithm),{privateParams:i,publicParams:n}=await In.generateParams(r,e,t);this.privateParams=i,this.publicParams=n,this.isEncrypted=!1;}clearPrivateParams(){this.isDummy()||(Object.keys(this.privateParams).forEach(e=>{this.privateParams[e].fill(0),delete this.privateParams[e];}),this.privateParams=null,this.isEncrypted=!0);}}async function ho(e,t,r){return e.produceKey(t,In.cipher[r].keySize)}var fo=rt((function(e){!function(t){function r(e){function t(){return Ae<Se}function r(){return Ae}function n(e){Ae=e;}function a(){Ae=0,Se=ke.length;}function s(e,t){return {name:e,tokens:t||"",semantic:t||"",children:[]}}function o(e,t){var r;return null===t?null:((r=s(e)).tokens=t.tokens,r.semantic=t.semantic,r.children.push(t),r)}function c(e,t){return null!==t&&(e.tokens+=t.tokens,e.semantic+=t.semantic),e.children.push(t),e}function u(e){var r;return t()&&e(r=ke[Ae])?(Ae+=1,s("token",r)):null}function h(e){return function(){return o("literal",u((function(t){return t===e})))}}function d(){var e=arguments;return function(){var t,i,a,o;for(o=r(),i=s("and"),t=0;t<e.length;t+=1){if(null===(a=e[t]()))return n(o),null;c(i,a);}return i}}function f(){var e=arguments;return function(){var t,i,a;for(a=r(),t=0;t<e.length;t+=1){if(null!==(i=e[t]()))return i;n(a);}return null}}function l(e){return function(){var t,i;return i=r(),null!==(t=e())?t:(n(i),s("opt"))}}function p(e){return function(){var t=e();return null!==t&&(t.semantic=""),t}}function y(e){return function(){var t=e();return null!==t&&t.semantic.length>0&&(t.semantic=" "),t}}function b(e,t){return function(){var i,a,o,u,h;for(u=r(),i=s("star"),o=0,h=void 0===t?0:t;null!==(a=e());)o+=1,c(i,a);return o>=h?i:(n(u),null)}}function m(e){return e.charCodeAt(0)>=128}function g(){return o("cr",h("\r")())}function w(){return o("crlf",d(g,k)())}function v(){return o("dquote",h('"')())}function _(){return o("htab",h("\t")())}function k(){return o("lf",h("\n")())}function A(){return o("sp",h(" ")())}function S(){return o("vchar",u((function(t){var r=t.charCodeAt(0),i=33<=r&&r<=126;return e.rfc6532&&(i=i||m(t)),i})))}function E(){return o("wsp",f(A,_)())}function x(){var e=o("quoted-pair",f(d(h("\\"),f(S,E)),ie)());return null===e?null:(e.semantic=e.semantic[1],e)}function P(){return o("fws",f(ae,d(l(d(b(E),p(w))),b(E,1)))())}function M(){return o("ctext",f((function(){return u((function(t){var r=t.charCodeAt(0),i=33<=r&&r<=39||42<=r&&r<=91||93<=r&&r<=126;return e.rfc6532&&(i=i||m(t)),i}))}),te)())}function C(){return o("ccontent",f(M,x,K)())}function K(){return o("comment",d(h("("),b(d(l(P),C)),l(P),h(")"))())}function D(){return o("cfws",f(d(b(d(l(P),K),1),l(P)),P)())}function R(){return o("atext",u((function(t){var r="a"<=t&&t<="z"||"A"<=t&&t<="Z"||"0"<=t&&t<="9"||["!","#","$","%","&","'","*","+","-","/","=","?","^","_","`","{","|","}","~"].indexOf(t)>=0;return e.rfc6532&&(r=r||m(t)),r})))}function I(){return o("atom",d(y(l(D)),b(R,1),y(l(D)))())}function U(){var e,t;return null===(e=o("dot-atom-text",b(R,1)()))||null!==(t=b(d(h("."),b(R,1)))())&&c(e,t),e}function B(){return o("dot-atom",d(p(l(D)),U,p(l(D)))())}function T(){return o("qtext",f((function(){return u((function(t){var r=t.charCodeAt(0),i=33===r||35<=r&&r<=91||93<=r&&r<=126;return e.rfc6532&&(i=i||m(t)),i}))}),re)())}function z(){return o("qcontent",f(T,x)())}function q(){return o("quoted-string",d(p(l(D)),p(v),b(d(l(y(P)),z)),l(p(P)),p(v),p(l(D)))())}function F(){return o("word",f(I,q)())}function O(){return o("address",f(N,W)())}function N(){return o("mailbox",f(L,Q)())}function L(){return o("name-addr",d(l(H),j)())}function j(){return o("angle-addr",f(d(p(l(D)),h("<"),Q,h(">"),p(l(D))),se)())}function W(){return o("group",d(H,h(":"),l(Z),h(";"),p(l(D)))())}function H(){return o("display-name",(null!==(e=o("phrase",f(ne,b(F,1))()))&&(e.semantic=function(e){return e.replace(/([ \t]|\r\n)+/g," ").replace(/^\s*/,"").replace(/\s*$/,"")}(e.semantic)),e));var e;}function G(){return o("mailbox-list",f(d(N,b(d(h(","),N))),ue)())}function V(){return o("address-list",f(d(O,b(d(h(","),O))),he)())}function Z(){return o("group-list",f(G,p(D),de)())}function Y(){return o("local-part",f(fe,B,q)())}function $(){return o("dtext",f((function(){return u((function(t){var r=t.charCodeAt(0),i=33<=r&&r<=90||94<=r&&r<=126;return e.rfc6532&&(i=i||m(t)),i}))}),pe)())}function X(){return o("domain-literal",d(p(l(D)),h("["),b(d(l(P),$)),l(P),h("]"),p(l(D)))())}function J(){return o("domain",(t=f(le,B,X)(),e.rejectTLD&&t&&t.semantic&&t.semantic.indexOf(".")<0?null:(t&&(t.semantic=t.semantic.replace(/\s+/g,"")),t)));var t;}function Q(){return o("addr-spec",d(Y,h("@"),J)())}function ee(){return e.strict?null:o("obs-NO-WS-CTL",u((function(e){var t=e.charCodeAt(0);return 1<=t&&t<=8||11===t||12===t||14<=t&&t<=31||127===t})))}function te(){return e.strict?null:o("obs-ctext",ee())}function re(){return e.strict?null:o("obs-qtext",ee())}function ie(){return e.strict?null:o("obs-qp",d(h("\\"),f(h("\0"),ee,k,g))())}function ne(){return e.strict?null:e.atInDisplayName?o("obs-phrase",d(F,b(f(F,h("."),h("@"),y(D))))()):o("obs-phrase",d(F,b(f(F,h("."),y(D))))())}function ae(){return e.strict?null:o("obs-FWS",b(d(p(l(w)),E),1)())}function se(){return e.strict?null:o("obs-angle-addr",d(p(l(D)),h("<"),oe,Q,h(">"),p(l(D)))())}function oe(){return e.strict?null:o("obs-route",d(ce,h(":"))())}function ce(){return e.strict?null:o("obs-domain-list",d(b(f(p(D),h(","))),h("@"),J,b(d(h(","),p(l(D)),l(d(h("@"),J)))))())}function ue(){return e.strict?null:o("obs-mbox-list",d(b(d(p(l(D)),h(","))),N,b(d(h(","),l(d(N,p(D))))))())}function he(){return e.strict?null:o("obs-addr-list",d(b(d(p(l(D)),h(","))),O,b(d(h(","),l(d(O,p(D))))))())}function de(){return e.strict?null:o("obs-group-list",d(b(d(p(l(D)),h(",")),1),p(l(D)))())}function fe(){return e.strict?null:o("obs-local-part",d(F,b(d(h("."),F)))())}function le(){return e.strict?null:o("obs-domain",d(I,b(d(h("."),I)))())}function pe(){return e.strict?null:o("obs-dtext",f(ee,x)())}function ye(e,t){var r,i,n;if(null==t)return null;for(i=[t];i.length>0;){if((n=i.pop()).name===e)return n;for(r=n.children.length-1;r>=0;r-=1)i.push(n.children[r]);}return null}function be(e,t){var r,i,n,a,s;if(null==t)return null;for(i=[t],a=[],s={},r=0;r<e.length;r+=1)s[e[r]]=!0;for(;i.length>0;)if((n=i.pop()).name in s)a.push(n);else for(r=n.children.length-1;r>=0;r-=1)i.push(n.children[r]);return a}function me(t){var r,i,n,a,s;if(null===t)return null;for(r=[],i=be(["group","mailbox"],t),n=0;n<i.length;n+=1)"group"===(a=i[n]).name?r.push(ge(a)):"mailbox"===a.name&&r.push(we(a));return s={ast:t,addresses:r},e.simple&&(s=function(e){var t;if(e&&e.addresses)for(t=0;t<e.addresses.length;t+=1)delete e.addresses[t].node;return e}(s)),e.oneResult?function(t){if(!t)return null;if(!e.partial&&t.addresses.length>1)return null;return t.addresses&&t.addresses[0]}(s):e.simple?s&&s.addresses:s}function ge(e){var t,r=ye("display-name",e),i=[],n=be(["mailbox"],e);for(t=0;t<n.length;t+=1)i.push(we(n[t]));return {node:e,parts:{name:r},type:e.name,name:ve(r),addresses:i}}function we(e){var t=ye("display-name",e),r=ye("addr-spec",e),i=function(e,t){var r,i,n,a;if(null==t)return null;for(i=[t],a=[];i.length>0;)for((n=i.pop()).name===e&&a.push(n),r=n.children.length-1;r>=0;r-=1)i.push(n.children[r]);return a}("cfws",e),n=be(["comment"],e),a=ye("local-part",r),s=ye("domain",r);return {node:e,parts:{name:t,address:r,local:a,domain:s,comments:i},type:e.name,name:ve(t),address:ve(r),local:ve(a),domain:ve(s),comments:_e(n),groupName:ve(e.groupName)}}function ve(e){return null!=e?e.semantic:null}function _e(e){var t="";if(e)for(var r=0;r<e.length;r+=1)t+=ve(e[r]);return t}var ke,Ae,Se,Ee,xe;if(null===(e=i(e,{})))return null;if(ke=e.input,xe={address:O,"address-list":V,"angle-addr":j,from:function(){return o("from",f(G,V)())},group:W,mailbox:N,"mailbox-list":G,"reply-to":function(){return o("reply-to",V())},sender:function(){return o("sender",f(N,O)())}}[e.startAt]||V,!e.strict){if(a(),e.strict=!0,Ee=xe(ke),e.partial||!t())return me(Ee);e.strict=!1;}return a(),Ee=xe(ke),!e.partial&&t()?null:me(Ee)}function i(e,t){function r(e){return "[object String]"===Object.prototype.toString.call(e)}function i(e){return null==e}var n,a;if(r(e))e={input:e};else if(!function(e){return e===Object(e)}(e))return null;if(!r(e.input))return null;if(!t)return null;for(a in n={oneResult:!1,partial:!1,rejectTLD:!1,rfc6532:!1,simple:!1,startAt:"address-list",strict:!1,atInDisplayName:!1})i(e[a])&&(e[a]=i(t[a])?n[a]:t[a]);return e}r.parseOneAddress=function(e){return r(i(e,{oneResult:!0,rfc6532:!0,simple:!0,startAt:"address-list"}))},r.parseAddressList=function(e){return r(i(e,{rfc6532:!0,simple:!0,startAt:"address-list"}))},r.parseFrom=function(e){return r(i(e,{rfc6532:!0,simple:!0,startAt:"from"}))},r.parseSender=function(e){return r(i(e,{oneResult:!0,rfc6532:!0,simple:!0,startAt:"sender"}))},r.parseReplyTo=function(e){return r(i(e,{rfc6532:!0,simple:!0,startAt:"reply-to"}))},e.exports=r;}();}));class lo{static get tag(){return ie.packet.userID}constructor(){this.userID="",this.name="",this.email="",this.comment="";}static fromObject(e){if(Z.isString(e)||e.name&&!Z.isString(e.name)||e.email&&!Z.isEmailAddress(e.email)||e.comment&&!Z.isString(e.comment))throw Error("Invalid user ID format");const t=new lo;Object.assign(t,e);const r=[];return t.name&&r.push(t.name),t.comment&&r.push(`(${t.comment})`),t.email&&r.push(`<${t.email}>`),t.userID=r.join(" "),t}read(e,t=ne){const r=Z.decodeUTF8(e);if(r.length>t.maxUserIDLength)throw Error("User ID string is too long");try{const{name:e,address:t,comments:i}=fo.parseOneAddress({input:r,atInDisplayName:!0});this.comment=i.replace(/^\(|\)$/g,""),this.name=e,this.email=t;}catch(e){}this.userID=r;}write(){return Z.encodeUTF8(this.userID)}}class po extends uo{static get tag(){return ie.packet.secretSubkey}constructor(e=new Date,t=ne){super(e,t);}}function bo(e,t){if(!t[e])throw Error("Packet not allowed in this context: "+ie.read(ie.packets,e));return new t[e]}class mo extends Array{async read(e,t,r=ne){this.stream=T(e,async(e,i)=>{const n=D(i);try{for(;;){if(await n.ready,await zs(e,async e=>{try{const i=bo(e.tag,t);i.packets=new mo,i.fromStream=Z.isStream(e.packet),await i.read(e.packet,r),await n.write(i);}catch(t){r.tolerant&&!Ts(e.tag)||await n.abort(t),Z.printDebugError(t);}}))return await n.ready,void await n.close()}}catch(e){await n.abort(e);}});const i=K(this.stream);for(;;){const{done:e,value:t}=await i.read();if(e?this.stream=null:this.push(t),e||Ts(t.constructor.tag))break}i.releaseLock();}write(){const e=[];for(let t=0;t<this.length;t++){const r=this[t].write();if(Z.isStream(r)&&Ts(this[t].constructor.tag)){let i=[],n=0;const a=512;e.push(Us(this[t].constructor.tag)),e.push(B(r,e=>{if(i.push(e),n+=e.length,n>=a){const e=Math.min(Math.log(n)/Math.LN2|0,30),t=2**e,r=Z.concat([Is(e)].concat(i));return i=[r.subarray(1+t)],n=i[0].length,r.subarray(0,1+t)}},()=>Z.concat([Rs(n)].concat(i))));}else {if(Z.isStream(r)){let i=0;e.push(B(q(r),e=>{i+=e.length;},()=>Bs(this[t].constructor.tag,i)));}else e.push(Bs(this[t].constructor.tag,r.length));e.push(r);}}return Z.concat(e)}push(e){e&&(e.packets=e.packets||new mo,super.push(e));}filterByTag(...e){const t=new mo,r=e=>t=>e===t;for(let i=0;i<this.length;i++)e.some(r(this[i].constructor.tag))&&t.push(this[i]);return t}findPacket(e){return this.find(t=>t.constructor.tag===e)}indexOfTag(...e){const t=[],r=this,i=e=>t=>e===t;for(let n=0;n<this.length;n++)e.some(i(r[n].constructor.tag))&&t.push(n);return t}concat(e){if(e)for(let t=0;t<e.length;t++)this.push(e[t]);return this}}class wo{constructor(e){this.packets=e||new mo;}write(){return this.packets.write()}armor(e=ne){return le(ie.armor.signature,this.write(),void 0,void 0,void 0,e)}}async function _o(e,t){const r=new po(e.date,t);return r.packets=null,r.algorithm=ie.read(ie.publicKey,e.algorithm),await r.generate(e.rsaBits,e.curve),r}async function Ao(e,t,r,i,n=new Date,a){let s,o;for(let c=e.length-1;c>=0;c--)try{s&&!(e[c].created>=s.created)||e[c].isExpired(n)||(e[c].verified||await e[c].verify(t,r,i,void 0,a),s=e[c]);}catch(e){o=e;}if(!s)throw Z.wrapError(`Could not find valid ${ie.read(ie.signature,r)} signature in key ${t.getKeyID().toHex()}`.replace("certGeneric ","self-").replace(/([a-z])([A-Z])/g,(e,t,r)=>t+" "+r.toLowerCase()),o);return s}function So(e,t,r=new Date){const i=Z.normalizeDate(r);if(null!==i){const n=Do(e,t);return !(e.created<=i&&i<=n)||t&&t.isExpired(r)}return !1}async function Eo(e,t,r,i){const n={};n.key=t,n.bind=e;const a=new qs(r.date);return a.signatureType=ie.signature.subkeyBinding,a.publicKeyAlgorithm=t.algorithm,a.hashAlgorithm=await xo(null,e,void 0,void 0,i),r.sign?(a.keyFlags=[ie.keyFlags.signData],a.embeddedSignature=await Mo(n,null,e,{signatureType:ie.signature.keyBinding},r.date,void 0,void 0,i)):a.keyFlags=[ie.keyFlags.encryptCommunication|ie.keyFlags.encryptStorage],r.keyExpirationTime>0&&(a.keyExpirationTime=r.keyExpirationTime,a.keyNeverExpires=!1),await a.sign(t,n),a}async function xo(e,t,r=new Date,i={},n){let a=n.preferredHashAlgorithm,s=a;if(e){const t=await e.getPrimaryUser(r,i,n);t.selfCertification.preferredHashAlgorithms&&([s]=t.selfCertification.preferredHashAlgorithms,a=In.hash.getHashByteLength(a)<=In.hash.getHashByteLength(s)?s:a);}switch(Object.getPrototypeOf(t)){case uo.prototype:case io.prototype:case po.prototype:case oo.prototype:switch(t.algorithm){case"ecdh":case"ecdsa":case"eddsa":s=In.publicKey.elliptic.getPreferredHashAlgo(t.publicParams.oid);}}return In.hash.getHashByteLength(a)<=In.hash.getHashByteLength(s)?s:a}async function Po(e,t=[],r=new Date,i=[],n=ne){const a={symmetric:ie.symmetric.aes128,aead:ie.aead.eax,compression:ie.compression.uncompressed}[e],s={symmetric:n.preferredSymmetricAlgorithm,aead:n.preferredAEADAlgorithm,compression:n.preferredCompressionAlgorithm}[e],o={symmetric:"preferredSymmetricAlgorithms",aead:"preferredAEADAlgorithms",compression:"preferredCompressionAlgorithms"}[e];return (await Promise.all(t.map((async function(e,t){const a=(await e.getPrimaryUser(r,i[t],n)).selfCertification[o];return !!a&&a.indexOf(s)>=0})))).every(Boolean)?s:a}async function Mo(e,t,r,i,n,a,s=!1,o){if(r.isDummy())throw Error("Cannot sign with a gnu-dummy key.");if(!r.isDecrypted())throw Error("Private key is not decrypted.");const c=new qs(n);return Object.assign(c,i),c.publicKeyAlgorithm=r.algorithm,c.hashAlgorithm=await xo(t,r,n,a,o),await c.sign(r,e,s),c}async function Co(e,t,r,i){(e=e[r])&&(t[r].length?await Promise.all(e.map((async function(e){e.isExpired()||i&&!await i(e)||t[r].some((function(t){return Z.equalsUint8Array(t.writeParams(),e.writeParams())}))||t[r].push(e);}))):t[r]=e);}async function Ko(e,t,r,i,n,a,s=new Date,o){a=a||e;const c=Z.normalizeDate(s),u=[];return await Promise.all(i.map((async function(e){try{n&&!e.issuerKeyID.equals(n.issuerKeyID)||o.revocationsExpire&&e.isExpired(c)||(e.verified||await e.verify(a,t,r,void 0,o),u.push(e.issuerKeyID));}catch(e){}}))),n?(n.revoked=!!u.some(e=>e.equals(n.issuerKeyID))||(n.revoked||!1),n.revoked):u.length>0}function Do(e,t){let r;return !1===t.keyNeverExpires&&(r=e.created.getTime()+1e3*t.keyExpirationTime),r?new Date(r):1/0}function Ro(e,t={}){switch(e.type=e.type||t.type,e.curve=e.curve||t.curve,e.rsaBits=e.rsaBits||t.rsaBits,e.keyExpirationTime=void 0!==e.keyExpirationTime?e.keyExpirationTime:t.keyExpirationTime,e.passphrase=Z.isString(e.passphrase)?e.passphrase:t.passphrase,e.date=e.date||t.date,e.sign=e.sign||!1,e.type){case"ecc":try{e.curve=ie.write(ie.curve,e.curve);}catch(e){throw Error("Invalid curve")}e.curve!==ie.curve.ed25519&&e.curve!==ie.curve.curve25519||(e.curve=e.sign?ie.curve.ed25519:ie.curve.curve25519),e.sign?e.algorithm=e.curve===ie.curve.ed25519?ie.publicKey.eddsa:ie.publicKey.ecdsa:e.algorithm=ie.publicKey.ecdh;break;case"rsa":e.algorithm=ie.publicKey.rsaEncryptSign;break;default:throw Error("Unsupported key type "+e.type)}return e}function Io(e,t){if(!t.verified||!1!==t.revoked)throw Error("Signature not verified");const r=ie.write(ie.publicKey,e.algorithm);return r!==ie.publicKey.rsaEncrypt&&r!==ie.publicKey.elgamal&&r!==ie.publicKey.ecdh&&(!t.keyFlags||0!=(t.keyFlags[0]&ie.keyFlags.signData))}function Uo(e,t){if(!t.verified||!1!==t.revoked)throw Error("Signature not verified");const r=ie.write(ie.publicKey,e.algorithm);return r!==ie.publicKey.dsa&&r!==ie.publicKey.rsaSign&&r!==ie.publicKey.ecdsa&&r!==ie.publicKey.eddsa&&(!t.keyFlags||0!=(t.keyFlags[0]&ie.keyFlags.encryptCommunication)||0!=(t.keyFlags[0]&ie.keyFlags.encryptStorage))}function Bo(e,t){if(!e.verified)throw Error("Signature not verified");return !!t.allowInsecureDecryptionWithSigningKeys||(!e.keyFlags||0!=(e.keyFlags[0]&ie.keyFlags.encryptCommunication)||0!=(e.keyFlags[0]&ie.keyFlags.encryptStorage))}function To(e,t){const r=ie.write(ie.publicKey,e.algorithm);if(t.rejectPublicKeyAlgorithms.has(r))throw Error(e.algorithm+" keys are considered too weak.");if(new Set([ie.publicKey.rsaEncryptSign,ie.publicKey.rsaSign,ie.publicKey.rsaEncrypt]).has(r)&&Z.uint8ArrayBitLength(e.publicParams.n)<t.minRSABits)throw Error(`RSA keys shorter than ${t.minRSABits} bits are considered too weak.`)}class zo{constructor(e){if(!(this instanceof zo))return new zo(e);this.userID=e.constructor.tag===ie.packet.userID?e:null,this.userAttribute=e.constructor.tag===ie.packet.userAttribute?e:null,this.selfCertifications=[],this.otherCertifications=[],this.revocationSignatures=[];}toPacketlist(){const e=new mo;return e.push(this.userID||this.userAttribute),e.concat(this.revocationSignatures),e.concat(this.selfCertifications),e.concat(this.otherCertifications),e}async sign(e,t,r){const i={userID:this.userID,userAttribute:this.userAttribute,key:e},n=new zo(i.userID||i.userAttribute);return n.otherCertifications=await Promise.all(t.map((async function(t){if(t.isPublic())throw Error("Need private key for signing");if(t.hasSameFingerprintAs(e))throw Error("Not implemented for self signing");const n=await t.getSigningKey(void 0,void 0,void 0,r);return Mo(i,t,n.keyPacket,{signatureType:ie.signature.certGeneric,keyFlags:[ie.keyFlags.certifyKeys|ie.keyFlags.signData]},void 0,void 0,void 0,r)}))),await n.update(this,e),n}async isRevoked(e,t,r,i=new Date,n){return Ko(e,ie.signature.certRevocation,{key:e,userID:this.userID,userAttribute:this.userAttribute},this.revocationSignatures,t,r,i,n)}async verifyCertificate(e,t,r,i=new Date,n){const a=this,s=t.issuerKeyID,o={userID:this.userID,userAttribute:this.userAttribute,key:e};return (await Promise.all(r.map((async function(r){if(!r.getKeyIDs().some(e=>e.equals(s)))return null;const c=await r.getSigningKey(s,i,void 0,n);if(t.revoked||await a.isRevoked(e,t,c.keyPacket,i,n))throw Error("User certificate is revoked");try{t.verified||await t.verify(c.keyPacket,ie.signature.certGeneric,o,void 0,n);}catch(e){throw Z.wrapError("User certificate is invalid",e)}if(t.isExpired(i))throw Error("User certificate is expired");return !0})))).find(e=>null!==e)||null}async verifyAllCertifications(e,t,r=new Date,i){const n=this,a=this.selfCertifications.concat(this.otherCertifications);return Promise.all(a.map((async function(a){return {keyID:a.issuerKeyID,valid:await n.verifyCertificate(e,a,t,r,i).catch(()=>!1)}})))}async verify(e,t=new Date,r){if(!this.selfCertifications.length)throw Error("No self-certifications");const i=this,n={userID:this.userID,userAttribute:this.userAttribute,key:e};let a;for(let s=this.selfCertifications.length-1;s>=0;s--)try{const a=this.selfCertifications[s];if(a.revoked||await i.isRevoked(e,a,void 0,t,r))throw Error("Self-certification is revoked");try{a.verified||await a.verify(e,ie.signature.certGeneric,n,void 0,r);}catch(e){throw Z.wrapError("Self-certification is invalid",e)}if(a.isExpired(t))throw Error("Self-certification is expired");return !0}catch(e){a=e;}throw a}async update(e,t,r){const i={userID:this.userID,userAttribute:this.userAttribute,key:t};await Co(e,this,"selfCertifications",(async function(e){try{return e.verified||await e.verify(t,ie.signature.certGeneric,i,void 0,r),!0}catch(e){return !1}})),await Co(e,this,"otherCertifications"),await Co(e,this,"revocationSignatures",(function(e){return Ko(t,ie.signature.certRevocation,i,[e],void 0,void 0,void 0,r)}));}}class qo{constructor(e){if(!(this instanceof qo))return new qo(e);this.keyPacket=e,this.bindingSignatures=[],this.revocationSignatures=[];}toPacketlist(){const e=new mo;return e.push(this.keyPacket),e.concat(this.revocationSignatures),e.concat(this.bindingSignatures),e}async isRevoked(e,t,r,i=new Date,n=ne){return Ko(e,ie.signature.subkeyRevocation,{key:e,bind:this.keyPacket},this.revocationSignatures,t,r,i,n)}async verify(e,t=new Date,r=ne){const i={key:e,bind:this.keyPacket},n=await Ao(this.bindingSignatures,e,ie.signature.subkeyBinding,i,t,r);if(n.revoked||await this.isRevoked(e,n,null,t,r))throw Error("Subkey is revoked");if(So(this.keyPacket,n,t))throw Error("Subkey is expired");return n}async getExpirationTime(e,t=new Date,r=ne){const i={key:e,bind:this.keyPacket};let n;try{n=await Ao(this.bindingSignatures,e,ie.signature.subkeyBinding,i,t,r);}catch(e){return null}const a=Do(this.keyPacket,n),s=n.getExpirationTime();return a<s?a:s}async update(e,t,r=ne){if(!this.hasSameFingerprintAs(e))throw Error("SubKey update method: fingerprints of subkeys not equal");this.keyPacket.constructor.tag===ie.packet.publicSubkey&&e.keyPacket.constructor.tag===ie.packet.secretSubkey&&(this.keyPacket=e.keyPacket);const i=this,n={key:t,bind:i.keyPacket};await Co(e,this,"bindingSignatures",(async function(e){for(let t=0;t<i.bindingSignatures.length;t++)if(i.bindingSignatures[t].issuerKeyID.equals(e.issuerKeyID))return e.created>i.bindingSignatures[t].created&&(i.bindingSignatures[t]=e),!1;try{return e.verified||await e.verify(t,ie.signature.subkeyBinding,n,void 0,r),!0}catch(e){return !1}})),await Co(e,this,"revocationSignatures",(function(e){return Ko(t,ie.signature.subkeyRevocation,n,[e],void 0,void 0,void 0,r)}));}async revoke(e,{flag:t=ie.reasonForRevocation.noReason,string:r=""}={},i=new Date,n=ne){const a={key:e,bind:this.keyPacket},s=new qo(this.keyPacket);return s.revocationSignatures.push(await Mo(a,null,e,{signatureType:ie.signature.subkeyRevocation,reasonForRevocationFlag:ie.write(ie.reasonForRevocation,t),reasonForRevocationString:r},i,void 0,void 0,n)),await s.update(this,e),s}hasSameFingerprintAs(e){return this.keyPacket.hasSameFingerprintAs(e.keyPacket||e)}}["getKeyID","getFingerprint","getAlgorithmInfo","getCreationTime","isDecrypted"].forEach(e=>{qo.prototype[e]=function(){return this.keyPacket[e]()};});const Fo=/*#__PURE__*/Z.constructAllowedPackets([qs]);class Oo{constructor(e){if(!(this instanceof Oo))return new Oo(e);if(this.keyPacket=null,this.revocationSignatures=[],this.directSignatures=[],this.users=[],this.subKeys=[],this.packetlist2structure(e),!this.keyPacket)throw Error("Invalid key: need at least key packet")}get primaryKey(){return this.keyPacket}packetlist2structure(e){let t,r,i;for(let n=0;n<e.length;n++)switch(e[n].constructor.tag){case ie.packet.publicKey:case ie.packet.secretKey:if(this.keyPacket)throw Error("Key block contains multiple keys");this.keyPacket=e[n],r=this.getKeyID();break;case ie.packet.userID:case ie.packet.userAttribute:t=new zo(e[n]),this.users.push(t);break;case ie.packet.publicSubkey:case ie.packet.secretSubkey:t=null,i=new qo(e[n]),this.subKeys.push(i);break;case ie.packet.signature:switch(e[n].signatureType){case ie.signature.certGeneric:case ie.signature.certPersona:case ie.signature.certCasual:case ie.signature.certPositive:if(!t){Z.printDebug("Dropping certification signatures without preceding user packet");continue}e[n].issuerKeyID.equals(r)?t.selfCertifications.push(e[n]):t.otherCertifications.push(e[n]);break;case ie.signature.certRevocation:t?t.revocationSignatures.push(e[n]):this.directSignatures.push(e[n]);break;case ie.signature.key:this.directSignatures.push(e[n]);break;case ie.signature.subkeyBinding:if(!i){Z.printDebug("Dropping subkey binding signature without preceding subkey packet");continue}i.bindingSignatures.push(e[n]);break;case ie.signature.keyRevocation:this.revocationSignatures.push(e[n]);break;case ie.signature.subkeyRevocation:if(!i){Z.printDebug("Dropping subkey revocation signature without preceding subkey packet");continue}i.revocationSignatures.push(e[n]);}}}toPacketlist(){const e=new mo;return e.push(this.keyPacket),e.concat(this.revocationSignatures),e.concat(this.directSignatures),this.users.map(t=>e.concat(t.toPacketlist())),this.subKeys.map(t=>e.concat(t.toPacketlist())),e}async clone(e=!1){const t=new Oo(this.toPacketlist());return e&&t.getKeys().forEach(e=>{if(e.keyPacket=Object.create(Object.getPrototypeOf(e.keyPacket),Object.getOwnPropertyDescriptors(e.keyPacket)),!e.keyPacket.isDecrypted())return;const t={};Object.keys(e.keyPacket.privateParams).forEach(r=>{t[r]=new Uint8Array(e.keyPacket.privateParams[r]);}),e.keyPacket.privateParams=t;}),t}getSubkeys(e=null){const t=[];return this.subKeys.forEach(r=>{e&&!r.getKeyID().equals(e,!0)||t.push(r);}),t}getKeys(e=null){const t=[];return e&&!this.getKeyID().equals(e,!0)||t.push(this),t.concat(this.getSubkeys(e))}getKeyIDs(){return this.getKeys().map(e=>e.getKeyID())}getUserIDs(){return this.users.map(e=>e.userID?e.userID.userID:null).filter(e=>null!==e)}isPublic(){return this.keyPacket.constructor.tag===ie.packet.publicKey}isPrivate(){return this.keyPacket.constructor.tag===ie.packet.secretKey}toPublic(){const e=new mo,t=this.toPacketlist();let r,i,n;for(let a=0;a<t.length;a++)switch(t[a].constructor.tag){case ie.packet.secretKey:r=t[a].writePublicKey(),i=new io,i.read(r),e.push(i);break;case ie.packet.secretSubkey:r=t[a].writePublicKey(),n=new oo,n.read(r),e.push(n);break;default:e.push(t[a]);}return new Oo(e)}write(){return this.toPacketlist().write()}armor(e=ne){return le(this.isPublic()?ie.armor.publicKey:ie.armor.privateKey,this.toPacketlist().write(),void 0,void 0,void 0,e)}async getSigningKey(e=null,t=new Date,r={},i=ne){await this.verifyPrimaryKey(t,r,i);const n=this.keyPacket,a=this.subKeys.slice().sort((e,t)=>t.keyPacket.created-e.keyPacket.created);let s;for(const r of a)if(!e||r.getKeyID().equals(e))try{await r.verify(n,t,i);const e={key:n,bind:r.keyPacket},a=await Ao(r.bindingSignatures,n,ie.signature.subkeyBinding,e,t,i);if(!Io(r.keyPacket,a))continue;if(!a.embeddedSignature)throw Error("Missing embedded signature");return await Ao([a.embeddedSignature],r.keyPacket,ie.signature.keyBinding,e,t,i),To(r.keyPacket,i),r}catch(e){s=e;}try{const a=await this.getPrimaryUser(t,r,i);if((!e||n.getKeyID().equals(e))&&Io(n,a.selfCertification))return To(n,i),this}catch(e){s=e;}throw Z.wrapError("Could not find valid signing key packet in key "+this.getKeyID().toHex(),s)}async getEncryptionKey(e,t=new Date,r={},i=ne){await this.verifyPrimaryKey(t,r,i);const n=this.keyPacket,a=this.subKeys.slice().sort((e,t)=>t.keyPacket.created-e.keyPacket.created);let s;for(const r of a)if(!e||r.getKeyID().equals(e))try{await r.verify(n,t,i);const e={key:n,bind:r.keyPacket},a=await Ao(r.bindingSignatures,n,ie.signature.subkeyBinding,e,t,i);if(Uo(r.keyPacket,a))return To(r.keyPacket,i),r}catch(e){s=e;}try{const a=await this.getPrimaryUser(t,r,i);if((!e||n.getKeyID().equals(e))&&Uo(n,a.selfCertification))return To(n,i),this}catch(e){s=e;}throw Z.wrapError("Could not find valid encryption key packet in key "+this.getKeyID().toHex(),s)}async getDecryptionKeys(e,t=new Date,r={},i=ne){const n=this.keyPacket,a=[];for(let r=0;r<this.subKeys.length;r++)if(!e||this.subKeys[r].getKeyID().equals(e,!0))try{const e={key:n,bind:this.subKeys[r].keyPacket};Bo(await Ao(this.subKeys[r].bindingSignatures,n,ie.signature.subkeyBinding,e,t,i),i)&&a.push(this.subKeys[r]);}catch(e){}const s=await this.getPrimaryUser(t,r,i);return e&&!n.getKeyID().equals(e,!0)||!Bo(s.selfCertification,i)||a.push(this),a}isDecrypted(){return this.getKeys().some(({keyPacket:e})=>e.isDecrypted())}async validate(e=ne){if(!this.isPrivate())throw Error("Cannot validate a public key");let t;if(this.primaryKey.isDummy()){const r=await this.getSigningKey(null,null,void 0,{...e,rejectPublicKeyAlgorithms:new Set,minRSABits:0});r&&!r.keyPacket.isDummy()&&(t=r.keyPacket);}else t=this.primaryKey;if(t)return t.validate();{const e=this.getKeys();if(e.map(e=>e.keyPacket.isDummy()).every(Boolean))throw Error("Cannot validate an all-gnu-dummy key");return Promise.all(e.map(async e=>e.keyPacket.validate()))}}clearPrivateParams(){if(!this.isPrivate())throw Error("Can't clear private parameters of a public key");this.getKeys().forEach(({keyPacket:e})=>{e.isDecrypted()&&e.clearPrivateParams();});}async isRevoked(e,t,r=new Date,i=ne){return Ko(this.keyPacket,ie.signature.keyRevocation,{key:this.keyPacket},this.revocationSignatures,e,t,r,i)}async verifyPrimaryKey(e=new Date,t={},r=ne){const i=this.keyPacket;if(await this.isRevoked(null,null,e,r))throw Error("Primary key is revoked");const{selfCertification:n}=await this.getPrimaryUser(e,t,r);if(So(i,n,e))throw Error("Primary key is expired")}async getExpirationTime(e,t,r,i=ne){const n=(await this.getPrimaryUser(null,r,i)).selfCertification,a=Do(this.keyPacket,n),s=n.getExpirationTime();let o=a<s?a:s;if("encrypt"===e||"encrypt_sign"===e){const e=await this.getEncryptionKey(t,o,r,{...i,rejectPublicKeyAlgorithms:new Set,minRSABits:0}).catch(()=>{})||await this.getEncryptionKey(t,null,r,{...i,rejectPublicKeyAlgorithms:new Set,minRSABits:0}).catch(()=>{});if(!e)return null;const n=await e.getExpirationTime(this.keyPacket,void 0,i);n<o&&(o=n);}if("sign"===e||"encrypt_sign"===e){const e=await this.getSigningKey(t,o,r,{...i,rejectPublicKeyAlgorithms:new Set,minRSABits:0}).catch(()=>{})||await this.getSigningKey(t,null,r,{...i,rejectPublicKeyAlgorithms:new Set,minRSABits:0}).catch(()=>{});if(!e)return null;const n=await e.getExpirationTime(this.keyPacket,void 0,i);n<o&&(o=n);}return o}async getPrimaryUser(e=new Date,t={},r=ne){const i=this.keyPacket,n=[];let a;for(let s=0;s<this.users.length;s++)try{const a=this.users[s];if(!a.userID)continue;if(void 0!==t.name&&a.userID.name!==t.name||void 0!==t.email&&a.userID.email!==t.email||void 0!==t.comment&&a.userID.comment!==t.comment)throw Error("Could not find user that matches that user ID");const o={userID:a.userID,key:i},c=await Ao(a.selfCertifications,i,ie.signature.certGeneric,o,e,r);n.push({index:s,user:a,selfCertification:c});}catch(e){a=e;}if(!n.length)throw a||Error("Could not find primary user");await Promise.all(n.map((async function(t){return t.user.revoked||t.user.isRevoked(i,t.selfCertification,null,e,r)})));const s=n.sort((function(e,t){const r=e.selfCertification,i=t.selfCertification;return i.revoked-r.revoked||r.isPrimaryUserID-i.isPrimaryUserID||r.created-i.created})).pop(),{user:o,selfCertification:c}=s;if(c.revoked||await o.isRevoked(i,c,null,e,r))throw Error("Primary user is revoked");return s}async update(e,t=ne){if(!this.hasSameFingerprintAs(e))throw Error("Key update method: fingerprints of keys not equal");if(this.isPublic()&&e.isPrivate()){if(!(this.subKeys.length===e.subKeys.length&&this.subKeys.every(t=>e.subKeys.some(e=>t.hasSameFingerprintAs(e)))))throw Error("Cannot update public key with private key if subkey mismatch");this.keyPacket=e.keyPacket;}await Co(e,this,"revocationSignatures",r=>Ko(this.keyPacket,ie.signature.keyRevocation,this,[r],null,e.keyPacket,void 0,t)),await Co(e,this,"directSignatures"),await Promise.all(e.users.map(async e=>{let r=!1;await Promise.all(this.users.map(async i=>{(e.userID&&i.userID&&e.userID.userID===i.userID.userID||e.userAttribute&&e.userAttribute.equals(i.userAttribute))&&(await i.update(e,this.keyPacket,t),r=!0);})),r||this.users.push(e);})),await Promise.all(e.subKeys.map(async e=>{let r=!1;await Promise.all(this.subKeys.map(async i=>{i.hasSameFingerprintAs(e)&&(await i.update(e,this.keyPacket,t),r=!0);})),r||this.subKeys.push(e);}));}async revoke({flag:e=ie.reasonForRevocation.noReason,string:t=""}={},r=new Date,i=ne){if(this.isPublic())throw Error("Need private key for revoking");const n={key:this.keyPacket},a=await this.clone();return a.revocationSignatures.push(await Mo(n,null,this.keyPacket,{signatureType:ie.signature.keyRevocation,reasonForRevocationFlag:ie.write(ie.reasonForRevocation,e),reasonForRevocationString:t},r,void 0,void 0,i)),a}async getRevocationCertificate(e=new Date,t=ne){const r={key:this.keyPacket},i=await Ao(this.revocationSignatures,this.keyPacket,ie.signature.keyRevocation,r,e,t),n=new mo;return n.push(i),le(ie.armor.publicKey,n.write(),null,null,"This is a revocation certificate")}async applyRevocationCertificate(e,t=ne){const r=await fe(e,t),i=new mo;await i.read(r.data,Fo,void 0,t);const n=i.findPacket(ie.packet.signature);if(!n||n.signatureType!==ie.signature.keyRevocation)throw Error("Could not find revocation signature packet");if(!n.issuerKeyID.equals(this.getKeyID()))throw Error("Revocation signature does not match key");if(n.isExpired())throw Error("Revocation signature is expired");try{await n.verify(this.keyPacket,ie.signature.keyRevocation,{key:this.keyPacket},void 0,t);}catch(e){throw Z.wrapError("Could not verify revocation signature",e)}const a=await this.clone();return a.revocationSignatures.push(n),a}async signPrimaryUser(e,t,r,i=ne){const{index:n,user:a}=await this.getPrimaryUser(t,r,i),s=await a.sign(this.keyPacket,e,i),o=await this.clone();return o.users[n]=s,o}async signAllUsers(e,t=ne){const r=this,i=await this.clone();return i.users=await Promise.all(this.users.map((function(i){return i.sign(r.keyPacket,e,t)}))),i}async verifyPrimaryUser(e,t,r,i=ne){const n=this.keyPacket,{user:a}=await this.getPrimaryUser(t,r,i);return e?await a.verifyAllCertifications(n,e,void 0,i):[{keyID:n.keyID,valid:await a.verify(n,void 0,i).catch(()=>!1)}]}async verifyAllUsers(e,t=ne){const r=[],i=this.keyPacket;return await Promise.all(this.users.map((async function(n){(e?await n.verifyAllCertifications(i,e,void 0,t):[{keyID:i.keyID,valid:await n.verify(i,void 0,t).catch(()=>!1)}]).forEach(e=>{r.push({userID:n.userID.userID,keyID:e.keyID,valid:e.valid});});}))),r}async addSubkey(e={}){const t={...ne,...e.config};if(!this.isPrivate())throw Error("Cannot add a subkey to a public key");if(e.passphrase)throw Error("Subkey could not be encrypted here, please encrypt whole key");if(e.rsaBits<t.minRSABits)throw Error(`rsaBits should be at least ${t.minRSABits}, got: ${e.rsaBits}`);const r=this.primaryKey;if(r.isDummy())throw Error("Cannot add subkey to gnu-dummy primary key");if(!r.isDecrypted())throw Error("Key is not decrypted");const i=r.getAlgorithmInfo();i.type=i.curve?"ecc":"rsa",i.rsaBits=i.bits||4096,i.curve=i.curve||"curve25519",e=Ro(e,i);const n=await _o(e),a=await Eo(n,r,e,t),s=this.toPacketlist();return s.push(n),s.push(a),new Oo(s)}}["getKeyID","getFingerprint","getAlgorithmInfo","getCreationTime","hasSameFingerprintAs"].forEach(e=>{Oo.prototype[e]=qo.prototype[e];});const No=/*#__PURE__*/Z.constructAllowedPackets([io,oo,uo,po,lo,co,qs]);async function jo({armoredKey:e,binaryKey:t,config:r}){if(r={...ne,...r},!e&&!t)throw Error("readKey: must pass options object containing `armoredKey` or `binaryKey`");if(e&&!Z.isString(e))throw Error("readKey: options.armoredKey must be a string");if(t&&!Z.isUint8Array(t))throw Error("readKey: options.binaryKey must be a Uint8Array");let i;if(e){const{type:t,data:n}=await fe(e,r);if(t!==ie.armor.publicKey&&t!==ie.armor.privateKey)throw Error("Armored text not of type key");i=n;}else i=t;const n=new mo;return await n.read(i,No,void 0,r),new Oo(n)}const Ho=/*#__PURE__*/Z.constructAllowedPackets([Ks,Ls,Qs,Xs,ao,eo,ro,Os,qs]),Go=/*#__PURE__*/Z.constructAllowedPackets([ro]),Vo=/*#__PURE__*/Z.constructAllowedPackets([qs]);class Zo{constructor(e){this.packets=e||new mo;}getEncryptionKeyIDs(){const e=[];return this.packets.filterByTag(ie.packet.publicKeyEncryptedSessionKey).forEach((function(t){e.push(t.publicKeyID);})),e}getSigningKeyIDs(){const e=[],t=this.unwrapCompressed();if(t.packets.filterByTag(ie.packet.onePassSignature).forEach((function(t){e.push(t.issuerKeyID);})),!e.length){t.packets.filterByTag(ie.packet.signature).forEach((function(t){e.push(t.issuerKeyID);}));}return e}async decrypt(e,t,r,i=ne){const n=r||await this.decryptSessionKeys(e,t,i),a=this.packets.filterByTag(ie.packet.symmetricallyEncryptedData,ie.packet.symEncryptedIntegrityProtectedData,ie.packet.aeadEncryptedData);if(0===a.length)return this;const s=a[0];let o=null;const c=Promise.all(n.map(async e=>{if(!e||!Z.isUint8Array(e.data)||!Z.isString(e.algorithm))throw Error("Invalid session key for decryption.");try{await s.decrypt(e.algorithm,e.data,i);}catch(e){Z.printDebugError(e),o=e;}}));if(j(s.encrypted),s.encrypted=null,await c,!s.packets||!s.packets.length)throw o||Error("Decryption failed.");const u=new Zo(s.packets);return s.packets=new mo,u}async decryptSessionKeys(e,t,r=ne){let i,n=[];if(t){const e=this.packets.filterByTag(ie.packet.symEncryptedSessionKey);if(!e)throw Error("No symmetrically encrypted session key packet found.");await Promise.all(t.map((async function(t,r){let i;r?(i=new mo,await i.read(e.write(),Go)):i=e,await Promise.all(i.map((async function(e){try{await e.decrypt(t),n.push(e);}catch(e){Z.printDebugError(e);}})));})));}else {if(!e)throw Error("No key or password specified.");{const t=this.packets.filterByTag(ie.packet.publicKeyEncryptedSessionKey);if(!t)throw Error("No public key encrypted session key packet found.");await Promise.all(t.map((async function(t){await Promise.all(e.map((async function(e){let a=[ie.symmetric.aes256,ie.symmetric.aes128,ie.symmetric.tripledes,ie.symmetric.cast5];try{const t=await e.getPrimaryUser(void 0,void 0,r);t.selfCertification.preferredSymmetricAlgorithms&&(a=a.concat(t.selfCertification.preferredSymmetricAlgorithms));}catch(e){}const s=(await e.getDecryptionKeys(t.publicKeyID,null,void 0,r)).map(e=>e.keyPacket);await Promise.all(s.map((async function(e){if(e&&!e.isDummy()){if(!e.isDecrypted())throw Error("Private key is not decrypted.");try{if(await t.decrypt(e),!a.includes(ie.write(ie.symmetric,t.sessionKeyAlgorithm)))throw Error("A non-preferred symmetric algorithm was used.");n.push(t);}catch(e){Z.printDebugError(e),i=e;}}})));}))),j(t.encrypted),t.encrypted=null;})));}}if(n.length){if(n.length>1){const e={};n=n.filter((function(t){const r=t.sessionKeyAlgorithm+Z.uint8ArrayToString(t.sessionKey);return !e.hasOwnProperty(r)&&(e[r]=!0,!0)}));}return n.map(e=>({data:e.sessionKey,algorithm:e.sessionKeyAlgorithm}))}throw i||Error("Session key decryption failed.")}getLiteralData(){const e=this.unwrapCompressed().packets.findPacket(ie.packet.literalData);return e&&e.getBytes()||null}getFilename(){const e=this.unwrapCompressed().packets.findPacket(ie.packet.literalData);return e&&e.getFilename()||null}getText(){const e=this.unwrapCompressed().packets.findPacket(ie.packet.literalData);return e?e.getText():null}static async generateSessionKey(e=[],t=new Date,r=[],i=ne){const n=ie.read(ie.symmetric,await Po("symmetric",e,t,r,i)),a=i.aeadProtect&&await async function(e,t=new Date,r=[],i=ne){let n=!0;return await Promise.all(e.map((async function(e,a){const s=await e.getPrimaryUser(t,r[a],i);s.selfCertification.features&&s.selfCertification.features[0]&ie.features.aead||(n=!1);}))),n}(e,t,r,i)?ie.read(ie.aead,await Po("aead",e,t,r,i)):void 0;return {data:await In.generateSessionKey(n),algorithm:n,aeadAlgorithm:a}}async encrypt(e,t,r,i=!1,n=[],a=new Date,s=[],o=ne){if(r){if(!Z.isUint8Array(r.data)||!Z.isString(r.algorithm))throw Error("Invalid session key for encryption.")}else if(e&&e.length)r=await Zo.generateSessionKey(e,a,s,o);else {if(!t||!t.length)throw Error("No keys, passwords, or session key provided.");r=await Zo.generateSessionKey(void 0,void 0,void 0,o);}const{data:c,algorithm:u,aeadAlgorithm:h}=r,d=await Zo.encryptSessionKey(c,u,h,e,t,i,n,a,s,o);let f;return h?(f=new Qs,f.aeadAlgorithm=h):f=new Xs,f.packets=this.packets,await f.encrypt(u,c,o),d.packets.push(f),f.packets=new mo,d}static async encryptSessionKey(e,t,r,i,n,a=!1,s=[],o=new Date,c=[],u=ne){const h=new mo;if(i){const r=await Promise.all(i.map((async function(r,i){const n=await r.getEncryptionKey(s[i],o,c,u),h=new eo;return h.publicKeyID=a?pe.wildcard():n.getKeyID(),h.publicKeyAlgorithm=n.keyPacket.algorithm,h.sessionKey=e,h.sessionKeyAlgorithm=t,await h.encrypt(n.keyPacket),delete h.sessionKey,h})));h.concat(r);}if(n){const i=async function(e,t){try{return await e.decrypt(t),1}catch(e){return 0}},a=(e,t)=>e+t,s=async function(e,t,r,o){const c=new ro(u);if(c.sessionKey=e,c.sessionKeyAlgorithm=t,r&&(c.aeadAlgorithm=r),await c.encrypt(o,u),u.passwordCollisionCheck){if(1!==(await Promise.all(n.map(e=>i(c,e)))).reduce(a))return s(e,t,o)}return delete c.sessionKey,c},o=await Promise.all(n.map(i=>s(e,t,r,i)));h.concat(o);}return new Zo(h)}async sign(e=[],t=null,r=[],i=new Date,n=[],a=ne){const s=new mo,o=this.packets.findPacket(ie.packet.literalData);if(!o)throw Error("No literal data packet to sign.");let c,u;const h=null===o.text?ie.signature.binary:ie.signature.text;if(t)for(u=t.packets.filterByTag(ie.packet.signature),c=u.length-1;c>=0;c--){const t=u[c],r=new Os;r.signatureType=t.signatureType,r.hashAlgorithm=t.hashAlgorithm,r.publicKeyAlgorithm=t.publicKeyAlgorithm,r.issuerKeyID=t.issuerKeyID,e.length||0!==c||(r.flags=1),s.push(r);}return await Promise.all(Array.from(e).reverse().map((async function(t,s){if(t.isPublic())throw Error("Need private key for signing");const o=r[e.length-1-s],c=await t.getSigningKey(o,i,n,a),u=new Os;return u.signatureType=h,u.hashAlgorithm=await xo(t,c.keyPacket,i,n,a),u.publicKeyAlgorithm=c.keyPacket.algorithm,u.issuerKeyID=c.getKeyID(),s===e.length-1&&(u.flags=1),u}))).then(e=>{e.forEach(e=>s.push(e));}),s.push(o),s.concat(await Yo(o,e,t,r,i,n,!1,a)),new Zo(s)}compress(e,t=ne){if(e===ie.compression.uncompressed)return this;const r=new Ls(t);r.algorithm=ie.read(ie.compression,e),r.packets=this.packets;const i=new mo;return i.push(r),new Zo(i)}async signDetached(e=[],t=null,r=[],i=new Date,n=[],a=ne){const s=this.packets.findPacket(ie.packet.literalData);if(!s)throw Error("No literal data packet to sign.");return new wo(await Yo(s,e,t,r,i,n,!0,a))}async verify(e,t=new Date,r=ne){const i=this.unwrapCompressed(),n=i.packets.filterByTag(ie.packet.literalData);if(1!==n.length)throw Error("Can only verify message with one literal data packet.");a(i.packets.stream)&&i.packets.concat(await L(i.packets.stream,e=>e));const s=i.packets.filterByTag(ie.packet.onePassSignature).reverse(),o=i.packets.filterByTag(ie.packet.signature);return s.length&&!o.length&&Z.isStream(i.packets.stream)&&!a(i.packets.stream)?(await Promise.all(s.map(async e=>{e.correspondingSig=new Promise((t,r)=>{e.correspondingSigResolve=t,e.correspondingSigReject=r;}),e.signatureData=W(async()=>(await e.correspondingSig).signatureData),e.hashed=L(await e.hash(e.signatureType,n[0],void 0,!1)),e.hashed.catch(()=>{});})),i.packets.stream=T(i.packets.stream,async(e,t)=>{const r=K(e),i=D(t);try{for(let e=0;e<s.length;e++){const{value:t}=await r.read();s[e].correspondingSigResolve(t);}await r.readToEnd(),await i.ready,await i.close();}catch(e){s.forEach(t=>{t.correspondingSigReject(e);}),await i.abort(e);}}),$o(s,n,e,t,!1,r)):$o(o,n,e,t,!1,r)}verifyDetached(e,t,r=new Date,i=ne){const n=this.unwrapCompressed().packets.filterByTag(ie.packet.literalData);if(1!==n.length)throw Error("Can only verify message with one literal data packet.");return $o(e.packets,n,t,r,!0,i)}unwrapCompressed(){const e=this.packets.filterByTag(ie.packet.compressedData);return e.length?new Zo(e[0].packets):this}async appendSignature(e){await this.packets.read(Z.isUint8Array(e)?e:(await fe(e)).data,Vo);}write(){return this.packets.write()}armor(e=ne){return le(ie.armor.message,this.write(),null,null,null,e)}}async function Yo(e,t,r=null,i=[],n=new Date,a=[],s=!1,o=ne){const c=new mo,u=null===e.text?ie.signature.binary:ie.signature.text;if(await Promise.all(t.map(async(t,r)=>{const c=a[r];if(t.isPublic())throw Error("Need private key for signing");const h=await t.getSigningKey(i[r],n,c,o);return Mo(e,t,h.keyPacket,{signatureType:u},n,c,s,o)})).then(e=>{e.forEach(e=>c.push(e));}),r){const e=r.packets.filterByTag(ie.packet.signature);c.concat(e);}return c}async function $o(e,t,r,i=new Date,n=!1,a=ne){return Promise.all(e.filter((function(e){return ["text","binary"].includes(ie.read(ie.signature,e.signatureType))})).map((async function(e){return async function(e,t,r,i=new Date,n=!1,a=ne){let s,o,c;for(const t of r){if(t.getKeys(e.issuerKeyID).length>0){s=t;break}}if(s)try{o=await s.getSigningKey(e.issuerKeyID,null,void 0,a);}catch(e){c=e;}else c=Error("Could not find signing key with key ID "+e.issuerKeyID.toHex());const u=e.correspondingSig||e,h={keyID:e.issuerKeyID,verified:(async()=>{if(c)throw c;await e.verify(o.keyPacket,e.signatureType,t[0],n,a);const r=await u;if(r.isExpired(i)||!(r.created>=o.getCreationTime()&&r.created<await(o===s?o.getExpirationTime(void 0,void 0,void 0,a):o.getExpirationTime(s,i,void 0,a))))throw Error("Signature is expired");return !0})(),signature:(async()=>{const e=await u,t=new mo;return t.push(e),new wo(t)})()};return h.signature.catch(()=>{}),h.verified.catch(()=>{}),h}(e,t,r,i,n,a)})))}async function Xo({armoredMessage:e,binaryMessage:t,config:r}){r={...ne,...r};let i=e||t;if(!i)throw Error("readMessage: must pass options object containing `armoredMessage` or `binaryMessage`");if(e&&!Z.isString(e)&&!Z.isStream(e))throw Error("readMessage: options.armoredMessage must be a string or stream");if(t&&!Z.isUint8Array(t)&&!Z.isStream(t))throw Error("readMessage: options.binaryMessage must be a Uint8Array or stream");const n=Z.isStream(i);if(n&&(await S(),i=x(i)),e){const{type:e,data:t}=await fe(i,r);if(e!==ie.armor.message)throw Error("Armored text not of type message");i=t;}const a=new mo;await a.read(i,Ho,n,r);const s=new Zo(a);return s.fromStream=n,s}class ec{constructor(e,t){if(this.text=Z.removeTrailingSpaces(e).replace(/\r?\n/g,"\r\n"),t&&!(t instanceof wo))throw Error("Invalid signature input");this.signature=t||new wo(new mo);}getSigningKeyIDs(){const e=[];return this.signature.packets.forEach((function(t){e.push(t.issuerKeyID);})),e}async sign(e,t=null,r=[],i=new Date,n=[],a=ne){const s=new Ks;s.setText(this.text);const o=new wo(await Yo(s,e,t,r,i,n,!0,a));return new ec(this.text,o)}verify(e,t=new Date,r=ne){const i=this.signature.packets,n=new Ks;return n.setText(this.text),$o(i,[n],e,t,!0,r)}getText(){return this.text.replace(/\r\n/g,"\n")}armor(e=ne){let t=this.signature.packets.map((function(e){return ie.read(ie.hash,e.hashAlgorithm).toUpperCase()}));t=t.filter((function(e,t,r){return r.indexOf(e)===t}));const r={hash:t.join(),text:this.text,data:this.signature.packets.write()};return le(ie.armor.signed,r,void 0,void 0,void 0,e)}}function uc({message:e,privateKeys:t,passwords:r,sessionKeys:i,publicKeys:n,expectSigned:a=!1,format:s="utf8",signature:o=null,date:c=new Date,config:u}){return u={...ne,...u},yc(e),n=mc(n),t=mc(t),r=mc(r),i=mc(i),e.decrypt(t,r,i,u).then((async function(t){n||(n=[]);const r={};if(r.signatures=o?await t.verifyDetached(o,n,c,u):await t.verify(n,c,u),r.data="binary"===s?t.getLiteralData():t.getText(),r.filename=t.getFilename(),wc(r,e),a){if(0===n.length)throw Error("Public keys are required to verify message signatures");if(0===r.signatures.length)throw Error("Message is not signed");r.data=M([r.data,W(async()=>{await Z.anyPromise(r.signatures.map(e=>e.verified));})]);}return r.data=await gc(r.data,e.fromStream,s),e.fromStream||await vc(r.signatures),r})).catch(_c.bind(null,"Error decrypting message"))}function dc({message:e,publicKeys:t,expectSigned:r=!1,format:i="utf8",signature:n=null,date:a=new Date,config:s}){if(s={...ne,...s},bc(e),e instanceof ec&&"binary"===i)throw Error("Can't return cleartext message data as binary");if(e instanceof ec&&n)throw Error("Can't verify detached cleartext signature");return t=mc(t),Promise.resolve().then((async function(){const o={};if(o.signatures=n?await e.verifyDetached(n,t,a,s):await e.verify(t,a,s),o.data="binary"===i?e.getLiteralData():e.getText(),e.fromStream&&wc(o,e),r){if(0===o.signatures.length)throw Error("Message is not signed");o.data=M([o.data,W(async()=>{await Z.anyPromise(o.signatures.map(e=>e.verified));})]);}return o.data=await gc(o.data,e.fromStream,i),e.fromStream||await vc(o.signatures),o})).catch(_c.bind(null,"Error verifying signed message"))}function yc(e){if(!(e instanceof Zo))throw Error("Parameter [message] needs to be of type Message")}function bc(e){if(!(e instanceof ec||e instanceof Zo))throw Error("Parameter [message] needs to be of type Message or CleartextMessage")}function mc(e){return e&&!Z.isArray(e)&&(e=[e]),e}async function gc(e,t,r="utf8"){const i=Z.isStream(e);return "array"===i?L(e):"node"===t?(e=y(e),"binary"!==r&&e.setEncoding(r),e):"web"===t&&"ponyfill"===i?v(e):e}function wc(e,t){e.data=T(t.packets.stream,async(t,r)=>{await R(e.data,r,{preventClose:!0});const i=D(r);try{await L(t,e=>e),await i.close();}catch(e){await i.abort(e);}});}async function vc(e){await Promise.all(e.map(async e=>{e.signature=await e.signature;try{e.valid=await e.verified;}catch(t){e.valid=!1,e.error=t,Z.printDebugError(t);}}));}function _c(e,t){Z.printDebugError(t);try{t.message=e+": "+t.message;}catch(e){}throw t}const Ac="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?Symbol:e=>`Symbol(${e})`;function Sc(){}const Ec=Number.isNaN||function(e){return e!=e},xc=Sc;function Pc(e){return "object"==typeof e&&null!==e||"function"==typeof e}function Mc(e){return e.slice()}function Cc(e){return !1!==function(e){if("number"!=typeof e)return !1;if(Ec(e))return !1;if(e<0)return !1;return !0}(e)&&e!==1/0}function Kc(e,t,r){if("function"!=typeof e)throw new TypeError("Argument is not a function");return Function.prototype.apply.call(e,t,r)}function Dc(e,t,r,i){const n=e[t];if(void 0!==n){if("function"!=typeof n)throw new TypeError(n+" is not a method");switch(r){case 0:return ()=>Ic(n,e,i);case 1:return t=>{const r=[t].concat(i);return Ic(n,e,r)}}}return ()=>Nc(void 0)}function Rc(e,t,r){const i=e[t];if(void 0!==i)return Kc(i,e,r)}function Ic(e,t,r){try{return Nc(Kc(e,t,r))}catch(e){return Lc(e)}}function Uc(e){if(Ec(e=Number(e))||e<0)throw new RangeError("highWaterMark property of a queuing strategy must be non-negative and non-NaN");return e}function Bc(e){if(void 0===e)return ()=>1;if("function"!=typeof e)throw new TypeError("size property of a queuing strategy must be a function");return t=>e(t)}const Tc=Promise,zc=Promise.prototype.then,qc=Promise.resolve.bind(Tc),Fc=Promise.reject.bind(Tc);function Oc(e){return new Tc(e)}function Nc(e){return qc(e)}function Lc(e){return Fc(e)}function jc(e,t,r){return zc.call(e,t,r)}function Wc(e,t,r){jc(jc(e,t,r),void 0,xc);}function Hc(e,t){Wc(e,t);}function Gc(e,t){Wc(e,void 0,t);}function Vc(e,t,r){return jc(e,t,r)}function Zc(e){jc(e,void 0,xc);}class Yc{constructor(){this._cursor=0,this._size=0,this._front={_elements:[],_next:void 0},this._back=this._front,this._cursor=0,this._size=0;}get length(){return this._size}push(e){const t=this._back;let r=t;16383===t._elements.length&&(r={_elements:[],_next:void 0}),t._elements.push(e),r!==t&&(this._back=r,t._next=r),++this._size;}shift(){const e=this._front;let t=e;const r=this._cursor;let i=r+1;const n=e._elements,a=n[r];return 16384===i&&(t=e._next,i=0),--this._size,this._cursor=i,e!==t&&(this._front=t),n[r]=void 0,a}forEach(e){let t=this._cursor,r=this._front,i=r._elements;for(;!(t===i.length&&void 0===r._next||t===i.length&&(r=r._next,i=r._elements,t=0,0===i.length));)e(i[t]),++t;}peek(){const e=this._front,t=this._cursor;return e._elements[t]}}function $c(e,t,r){let i=null;!0===r&&(i=Object.prototype);const n=Object.create(i);return n.value=e,n.done=t,n}function Xc(e,t){e._forAuthorCode=!0,e._ownerReadableStream=t,t._reader=e,"readable"===t._state?tu(e):"closed"===t._state?function(e){tu(e),nu(e);}(e):ru(e,t._storedError);}function Jc(e,t){return sd(e._ownerReadableStream,t)}function Qc(e){"readable"===e._ownerReadableStream._state?iu(e,new TypeError("Reader was released and can no longer be used to monitor the stream's closedness")):function(e,t){ru(e,t);}(e,new TypeError("Reader was released and can no longer be used to monitor the stream's closedness")),e._ownerReadableStream._reader=void 0,e._ownerReadableStream=void 0;}function eu(e){return new TypeError("Cannot "+e+" a stream using a released reader")}function tu(e){e._closedPromise=Oc((t,r)=>{e._closedPromise_resolve=t,e._closedPromise_reject=r;});}function ru(e,t){tu(e),iu(e,t);}function iu(e,t){Zc(e._closedPromise),e._closedPromise_reject(t),e._closedPromise_resolve=void 0,e._closedPromise_reject=void 0;}function nu(e){e._closedPromise_resolve(void 0),e._closedPromise_resolve=void 0,e._closedPromise_reject=void 0;}const au=Ac("[[CancelSteps]]"),su=Ac("[[PullSteps]]");function ou(e,t=!1){const r=new fu(e);return r._forAuthorCode=t,r}function cu(e){return Oc((t,r)=>{const i={_resolve:t,_reject:r};e._reader._readRequests.push(i);})}function uu(e,t,r){const i=e._reader;i._readRequests.shift()._resolve($c(t,r,i._forAuthorCode));}function hu(e){return e._reader._readRequests.length}function du(e){const t=e._reader;return void 0!==t&&!!lu(t)}class fu{constructor(e){if(!1===nd(e))throw new TypeError("ReadableStreamDefaultReader can only be constructed with a ReadableStream instance");if(!0===ad(e))throw new TypeError("This stream has already been locked for exclusive reading by another reader");Xc(this,e),this._readRequests=new Yc;}get closed(){return lu(this)?this._closedPromise:Lc(yu("closed"))}cancel(e){return lu(this)?void 0===this._ownerReadableStream?Lc(eu("cancel")):Jc(this,e):Lc(yu("cancel"))}read(){return lu(this)?void 0===this._ownerReadableStream?Lc(eu("read from")):pu(this):Lc(yu("read"))}releaseLock(){if(!lu(this))throw yu("releaseLock");if(void 0!==this._ownerReadableStream){if(this._readRequests.length>0)throw new TypeError("Tried to release a reader lock when that reader has pending read() calls un-settled");Qc(this);}}}function lu(e){return !!Pc(e)&&!!Object.prototype.hasOwnProperty.call(e,"_readRequests")}function pu(e){const t=e._ownerReadableStream;return t._disturbed=!0,"closed"===t._state?Nc($c(void 0,!0,e._forAuthorCode)):"errored"===t._state?Lc(t._storedError):t._readableStreamController[su]()}function yu(e){return new TypeError(`ReadableStreamDefaultReader.prototype.${e} can only be used on a ReadableStreamDefaultReader`)}let bu;"symbol"==typeof Ac.asyncIterator&&(bu={[Ac.asyncIterator](){return this}},Object.defineProperty(bu,Ac.asyncIterator,{enumerable:!1}));const mu={next(){if(!1===gu(this))return Lc(wu("next"));const e=this._asyncIteratorReader;return void 0===e._ownerReadableStream?Lc(eu("iterate")):Vc(pu(e),t=>{const r=t.done;return r&&Qc(e),$c(t.value,r,!0)})},return(e){if(!1===gu(this))return Lc(wu("next"));const t=this._asyncIteratorReader;if(void 0===t._ownerReadableStream)return Lc(eu("finish iterating"));if(t._readRequests.length>0)return Lc(new TypeError("Tried to release a reader lock when that reader has pending read() calls un-settled"));if(!1===this._preventCancel){const r=Jc(t,e);return Qc(t),Vc(r,()=>$c(e,!0,!0))}return Qc(t),Nc($c(e,!0,!0))}};function gu(e){return !!Pc(e)&&!!Object.prototype.hasOwnProperty.call(e,"_asyncIteratorReader")}function wu(e){return new TypeError(`ReadableStreamAsyncIterator.${e} can only be used on a ReadableSteamAsyncIterator`)}function vu(e){const t=e._queue.shift();return e._queueTotalSize-=t.size,e._queueTotalSize<0&&(e._queueTotalSize=0),t.value}function _u(e,t,r){if(!Cc(r=Number(r)))throw new RangeError("Size must be a finite, non-NaN, non-negative number.");e._queue.push({value:t,size:r}),e._queueTotalSize+=r;}function ku(e){e._queue=new Yc,e._queueTotalSize=0;}void 0!==bu&&Object.setPrototypeOf(mu,bu),Object.defineProperty(mu,"next",{enumerable:!1}),Object.defineProperty(mu,"return",{enumerable:!1});const Au=Ac("[[AbortSteps]]"),Su=Ac("[[ErrorSteps]]");class Eu{constructor(e={},t={}){Pu(this);const r=t.size;let i=t.highWaterMark;if(void 0!==e.type)throw new RangeError("Invalid type is specified");const n=Bc(r);void 0===i&&(i=1),i=Uc(i),function(e,t,r,i){const n=Object.create(Hu.prototype);const a=Dc(t,"write",1,[n]),s=Dc(t,"close",0,[]),o=Dc(t,"abort",1,[]);Gu(e,n,(function(){return Rc(t,"start",[n])}),a,s,o,r,i);}(this,e,i,n);}get locked(){if(!1===Mu(this))throw Qu("locked");return Cu(this)}abort(e){return !1===Mu(this)?Lc(Qu("abort")):!0===Cu(this)?Lc(new TypeError("Cannot abort a stream that already has a writer")):Ku(this,e)}close(){return !1===Mu(this)?Lc(Qu("close")):!0===Cu(this)?Lc(new TypeError("Cannot close a stream that already has a writer")):!0===Bu(this)?Lc(new TypeError("Cannot close an already-closing stream")):Du(this)}getWriter(){if(!1===Mu(this))throw Qu("getWriter");return xu(this)}}function xu(e){return new qu(e)}function Pu(e){e._state="writable",e._storedError=void 0,e._writer=void 0,e._writableStreamController=void 0,e._writeRequests=new Yc,e._inFlightWriteRequest=void 0,e._closeRequest=void 0,e._inFlightCloseRequest=void 0,e._pendingAbortRequest=void 0,e._backpressure=!1;}function Mu(e){return !!Pc(e)&&!!Object.prototype.hasOwnProperty.call(e,"_writableStreamController")}function Cu(e){return void 0!==e._writer}function Ku(e,t){const r=e._state;if("closed"===r||"errored"===r)return Nc(void 0);if(void 0!==e._pendingAbortRequest)return e._pendingAbortRequest._promise;let i=!1;"erroring"===r&&(i=!0,t=void 0);const n=Oc((r,n)=>{e._pendingAbortRequest={_promise:void 0,_resolve:r,_reject:n,_reason:t,_wasAlreadyErroring:i};});return e._pendingAbortRequest._promise=n,!1===i&&Iu(e,t),n}function Du(e){const t=e._state;if("closed"===t||"errored"===t)return Lc(new TypeError(`The stream (in ${t} state) is not in the writable state and cannot be closed`));const r=Oc((t,r)=>{const i={_resolve:t,_reject:r};e._closeRequest=i;}),i=e._writer;var n;return void 0!==i&&!0===e._backpressure&&"writable"===t&&hh(i),_u(n=e._writableStreamController,"close",0),Yu(n),r}function Ru(e,t){"writable"!==e._state?Uu(e):Iu(e,t);}function Iu(e,t){const r=e._writableStreamController;e._state="erroring",e._storedError=t;const i=e._writer;void 0!==i&&Lu(i,t),!1===function(e){if(void 0===e._inFlightWriteRequest&&void 0===e._inFlightCloseRequest)return !1;return !0}(e)&&!0===r._started&&Uu(e);}function Uu(e){e._state="errored",e._writableStreamController[Su]();const t=e._storedError;if(e._writeRequests.forEach(e=>{e._reject(t);}),e._writeRequests=new Yc,void 0===e._pendingAbortRequest)return void Tu(e);const r=e._pendingAbortRequest;if(e._pendingAbortRequest=void 0,!0===r._wasAlreadyErroring)return r._reject(t),void Tu(e);Wc(e._writableStreamController[Au](r._reason),()=>{r._resolve(),Tu(e);},t=>{r._reject(t),Tu(e);});}function Bu(e){return void 0!==e._closeRequest||void 0!==e._inFlightCloseRequest}function Tu(e){void 0!==e._closeRequest&&(e._closeRequest._reject(e._storedError),e._closeRequest=void 0);const t=e._writer;void 0!==t&&nh(t,e._storedError);}function zu(e,t){const r=e._writer;void 0!==r&&t!==e._backpressure&&(!0===t?function(e){sh(e);}(r):hh(r)),e._backpressure=t;}class qu{constructor(e){if(!1===Mu(e))throw new TypeError("WritableStreamDefaultWriter can only be constructed with a WritableStream instance");if(!0===Cu(e))throw new TypeError("This stream has already been locked for exclusive writing by another writer");this._ownerWritableStream=e,e._writer=this;const t=e._state;if("writable"===t)!1===Bu(e)&&!0===e._backpressure?sh(this):ch(this),rh(this);else if("erroring"===t)oh(this,e._storedError),rh(this);else if("closed"===t)ch(this),rh(r=this),ah(r);else {const t=e._storedError;oh(this,t),ih(this,t);}var r;}get closed(){return !1===Fu(this)?Lc(eh("closed")):this._closedPromise}get desiredSize(){if(!1===Fu(this))throw eh("desiredSize");if(void 0===this._ownerWritableStream)throw th("desiredSize");return function(e){const t=e._ownerWritableStream,r=t._state;if("errored"===r||"erroring"===r)return null;if("closed"===r)return 0;return Zu(t._writableStreamController)}(this)}get ready(){return !1===Fu(this)?Lc(eh("ready")):this._readyPromise}abort(e){return !1===Fu(this)?Lc(eh("abort")):void 0===this._ownerWritableStream?Lc(th("abort")):function(e,t){return Ku(e._ownerWritableStream,t)}(this,e)}close(){if(!1===Fu(this))return Lc(eh("close"));const e=this._ownerWritableStream;return void 0===e?Lc(th("close")):!0===Bu(e)?Lc(new TypeError("Cannot close an already-closing stream")):Ou(this)}releaseLock(){if(!1===Fu(this))throw eh("releaseLock");void 0!==this._ownerWritableStream&&ju(this);}write(e){return !1===Fu(this)?Lc(eh("write")):void 0===this._ownerWritableStream?Lc(th("write to")):Wu(this,e)}}function Fu(e){return !!Pc(e)&&!!Object.prototype.hasOwnProperty.call(e,"_ownerWritableStream")}function Ou(e){return Du(e._ownerWritableStream)}function Nu(e,t){"pending"===e._closedPromiseState?nh(e,t):function(e,t){ih(e,t);}(e,t);}function Lu(e,t){"pending"===e._readyPromiseState?uh(e,t):function(e,t){oh(e,t);}(e,t);}function ju(e){const t=e._ownerWritableStream,r=new TypeError("Writer was released and can no longer be used to monitor the stream's closedness");Lu(e,r),Nu(e,r),t._writer=void 0,e._ownerWritableStream=void 0;}function Wu(e,t){const r=e._ownerWritableStream,i=r._writableStreamController,n=function(e,t){try{return e._strategySizeAlgorithm(t)}catch(t){return $u(e,t),1}}(i,t);if(r!==e._ownerWritableStream)return Lc(th("write to"));const a=r._state;if("errored"===a)return Lc(r._storedError);if(!0===Bu(r)||"closed"===a)return Lc(new TypeError("The stream is closing or closed and cannot be written to"));if("erroring"===a)return Lc(r._storedError);const s=function(e){return Oc((t,r)=>{const i={_resolve:t,_reject:r};e._writeRequests.push(i);})}(r);return function(e,t,r){const i={chunk:t};try{_u(e,i,r);}catch(t){return void $u(e,t)}const n=e._controlledWritableStream;if(!1===Bu(n)&&"writable"===n._state){const t=Xu(e);zu(n,t);}Yu(e);}(i,t,n),s}class Hu{constructor(){throw new TypeError("WritableStreamDefaultController cannot be constructed explicitly")}error(e){if(!1===function(e){if(!Pc(e))return !1;if(!Object.prototype.hasOwnProperty.call(e,"_controlledWritableStream"))return !1;return !0}(this))throw new TypeError("WritableStreamDefaultController.prototype.error can only be used on a WritableStreamDefaultController");"writable"===this._controlledWritableStream._state&&Ju(this,e);}[Au](e){const t=this._abortAlgorithm(e);return Vu(this),t}[Su](){ku(this);}}function Gu(e,t,r,i,n,a,s,o){t._controlledWritableStream=e,e._writableStreamController=t,t._queue=void 0,t._queueTotalSize=void 0,ku(t),t._started=!1,t._strategySizeAlgorithm=o,t._strategyHWM=s,t._writeAlgorithm=i,t._closeAlgorithm=n,t._abortAlgorithm=a;const c=Xu(t);zu(e,c),Wc(Nc(r()),()=>{t._started=!0,Yu(t);},r=>{t._started=!0,Ru(e,r);});}function Vu(e){e._writeAlgorithm=void 0,e._closeAlgorithm=void 0,e._abortAlgorithm=void 0,e._strategySizeAlgorithm=void 0;}function Zu(e){return e._strategyHWM-e._queueTotalSize}function Yu(e){const t=e._controlledWritableStream;if(!1===e._started)return;if(void 0!==t._inFlightWriteRequest)return;if("erroring"===t._state)return void Uu(t);if(0===e._queue.length)return;const r=e._queue.peek().value;"close"===r?function(e){const t=e._controlledWritableStream;(function(e){e._inFlightCloseRequest=e._closeRequest,e._closeRequest=void 0;})(t),vu(e);const r=e._closeAlgorithm();Vu(e),Wc(r,()=>{!function(e){e._inFlightCloseRequest._resolve(void 0),e._inFlightCloseRequest=void 0,"erroring"===e._state&&(e._storedError=void 0,void 0!==e._pendingAbortRequest&&(e._pendingAbortRequest._resolve(),e._pendingAbortRequest=void 0)),e._state="closed";const t=e._writer;void 0!==t&&ah(t);}(t);},e=>{!function(e,t){e._inFlightCloseRequest._reject(t),e._inFlightCloseRequest=void 0,void 0!==e._pendingAbortRequest&&(e._pendingAbortRequest._reject(t),e._pendingAbortRequest=void 0),Ru(e,t);}(t,e);});}(e):function(e,t){const r=e._controlledWritableStream;(function(e){e._inFlightWriteRequest=e._writeRequests.shift();})(r),Wc(e._writeAlgorithm(t),()=>{!function(e){e._inFlightWriteRequest._resolve(void 0),e._inFlightWriteRequest=void 0;}(r);const t=r._state;if(vu(e),!1===Bu(r)&&"writable"===t){const t=Xu(e);zu(r,t);}Yu(e);},t=>{"writable"===r._state&&Vu(e),function(e,t){e._inFlightWriteRequest._reject(t),e._inFlightWriteRequest=void 0,Ru(e,t);}(r,t);});}(e,r.chunk);}function $u(e,t){"writable"===e._controlledWritableStream._state&&Ju(e,t);}function Xu(e){return Zu(e)<=0}function Ju(e,t){const r=e._controlledWritableStream;Vu(e),Iu(r,t);}function Qu(e){return new TypeError(`WritableStream.prototype.${e} can only be used on a WritableStream`)}function eh(e){return new TypeError(`WritableStreamDefaultWriter.prototype.${e} can only be used on a WritableStreamDefaultWriter`)}function th(e){return new TypeError("Cannot "+e+" a stream using a released writer")}function rh(e){e._closedPromise=Oc((t,r)=>{e._closedPromise_resolve=t,e._closedPromise_reject=r,e._closedPromiseState="pending";});}function ih(e,t){rh(e),nh(e,t);}function nh(e,t){Zc(e._closedPromise),e._closedPromise_reject(t),e._closedPromise_resolve=void 0,e._closedPromise_reject=void 0,e._closedPromiseState="rejected";}function ah(e){e._closedPromise_resolve(void 0),e._closedPromise_resolve=void 0,e._closedPromise_reject=void 0,e._closedPromiseState="resolved";}function sh(e){e._readyPromise=Oc((t,r)=>{e._readyPromise_resolve=t,e._readyPromise_reject=r;}),e._readyPromiseState="pending";}function oh(e,t){sh(e),uh(e,t);}function ch(e){sh(e),hh(e);}function uh(e,t){Zc(e._readyPromise),e._readyPromise_reject(t),e._readyPromise_resolve=void 0,e._readyPromise_reject=void 0,e._readyPromiseState="rejected";}function hh(e){e._readyPromise_resolve(void 0),e._readyPromise_resolve=void 0,e._readyPromise_reject=void 0,e._readyPromiseState="fulfilled";}function dh(e){if("object"!=typeof e||null===e)return !1;try{return "boolean"==typeof e.aborted}catch(e){return !1}}const fh="undefined"!=typeof DOMException?DOMException:void 0;const lh=function(e){if("function"!=typeof e&&"object"!=typeof e)return !1;try{return new e,!0}catch(e){return !1}}(fh)?fh:function(){const e=function(e,t){this.message=e||"",this.name=t||"Error",Error.captureStackTrace&&Error.captureStackTrace(this,this.constructor);};return Object.defineProperty(e.prototype=Object.create(Error.prototype),"constructor",{value:e,writable:!0,configurable:!0}),e}();function ph(e,t,r,i,n,a){const s=ou(e),o=xu(t);e._disturbed=!0;let c=!1,u=Nc(void 0);return Oc((h,d)=>{let f;if(void 0!==a){if(f=()=>{const r=new lh("Aborted","AbortError"),a=[];!1===i&&a.push(()=>"writable"===t._state?Ku(t,r):Nc(void 0)),!1===n&&a.push(()=>"readable"===e._state?sd(e,r):Nc(void 0)),y(()=>Promise.all(a.map(e=>e())),!0,r);},!0===a.aborted)return void f();a.addEventListener("abort",f);}if(p(e,s._closedPromise,e=>{!1===i?y(()=>Ku(t,e),!0,e):b(!0,e);}),p(t,o._closedPromise,t=>{!1===n?y(()=>sd(e,t),!0,t):b(!0,t);}),function(e,t,r){"closed"===e._state?r():Hc(t,r);}(e,s._closedPromise,()=>{!1===r?y(()=>function(e){const t=e._ownerWritableStream,r=t._state;return !0===Bu(t)||"closed"===r?Nc(void 0):"errored"===r?Lc(t._storedError):Ou(e)}(o)):b();}),!0===Bu(t)||"closed"===t._state){const t=new TypeError("the destination writable stream closed before all data could be piped to it");!1===n?y(()=>sd(e,t),!0,t):b(!0,t);}function l(){const e=u;return jc(u,()=>e!==u?l():void 0)}function p(e,t,r){"errored"===e._state?r(e._storedError):Gc(t,r);}function y(e,r,i){function n(){Wc(e(),()=>m(r,i),e=>m(!0,e));}!0!==c&&(c=!0,"writable"===t._state&&!1===Bu(t)?Hc(l(),n):n());}function b(e,r){!0!==c&&(c=!0,"writable"===t._state&&!1===Bu(t)?Hc(l(),()=>m(e,r)):m(e,r));}function m(e,t){ju(o),Qc(s),void 0!==a&&a.removeEventListener("abort",f),e?d(t):h(void 0);}Zc(Oc((e,t)=>{!function r(i){i?e():jc(!0===c?Nc(!0):jc(o._readyPromise,()=>jc(pu(s),e=>!0===e.done||(u=jc(Wu(o,e.value),void 0,Sc),!1))),r,t);}(!1);}));})}class yh{constructor(){throw new TypeError}get desiredSize(){if(!1===bh(this))throw xh("desiredSize");return Ah(this)}close(){if(!1===bh(this))throw xh("close");if(!1===Sh(this))throw new TypeError("The stream is not in a state that permits close");vh(this);}enqueue(e){if(!1===bh(this))throw xh("enqueue");if(!1===Sh(this))throw new TypeError("The stream is not in a state that permits enqueue");return _h(this,e)}error(e){if(!1===bh(this))throw xh("error");kh(this,e);}[au](e){ku(this);const t=this._cancelAlgorithm(e);return wh(this),t}[su](){const e=this._controlledReadableStream;if(this._queue.length>0){const t=vu(this);return !0===this._closeRequested&&0===this._queue.length?(wh(this),od(e)):mh(this),Nc($c(t,!1,e._reader._forAuthorCode))}const t=cu(e);return mh(this),t}}function bh(e){return !!Pc(e)&&!!Object.prototype.hasOwnProperty.call(e,"_controlledReadableStream")}function mh(e){!1!==gh(e)&&(!0!==e._pulling?(e._pulling=!0,Wc(e._pullAlgorithm(),()=>{e._pulling=!1,!0===e._pullAgain&&(e._pullAgain=!1,mh(e));},t=>{kh(e,t);})):e._pullAgain=!0);}function gh(e){const t=e._controlledReadableStream;return !1!==Sh(e)&&(!1!==e._started&&(!0===ad(t)&&hu(t)>0||Ah(e)>0))}function wh(e){e._pullAlgorithm=void 0,e._cancelAlgorithm=void 0,e._strategySizeAlgorithm=void 0;}function vh(e){const t=e._controlledReadableStream;e._closeRequested=!0,0===e._queue.length&&(wh(e),od(t));}function _h(e,t){const r=e._controlledReadableStream;if(!0===ad(r)&&hu(r)>0)uu(r,t,!1);else {let r;try{r=e._strategySizeAlgorithm(t);}catch(t){throw kh(e,t),t}try{_u(e,t,r);}catch(t){throw kh(e,t),t}}mh(e);}function kh(e,t){const r=e._controlledReadableStream;"readable"===r._state&&(ku(e),wh(e),cd(r,t));}function Ah(e){const t=e._controlledReadableStream._state;return "errored"===t?null:"closed"===t?0:e._strategyHWM-e._queueTotalSize}function Sh(e){const t=e._controlledReadableStream._state;return !1===e._closeRequested&&"readable"===t}function Eh(e,t,r,i,n,a,s){t._controlledReadableStream=e,t._queue=void 0,t._queueTotalSize=void 0,ku(t),t._started=!1,t._closeRequested=!1,t._pullAgain=!1,t._pulling=!1,t._strategySizeAlgorithm=s,t._strategyHWM=a,t._pullAlgorithm=i,t._cancelAlgorithm=n,e._readableStreamController=t,Wc(Nc(r()),()=>{t._started=!0,mh(t);},e=>{kh(t,e);});}function xh(e){return new TypeError(`ReadableStreamDefaultController.prototype.${e} can only be used on a ReadableStreamDefaultController`)}const Ph=Number.isInteger||function(e){return "number"==typeof e&&isFinite(e)&&Math.floor(e)===e};class Mh{constructor(){throw new TypeError("ReadableStreamBYOBRequest cannot be used directly")}get view(){if(!1===Dh(this))throw Vh("view");return this._view}respond(e){if(!1===Dh(this))throw Vh("respond");if(void 0===this._associatedReadableByteStreamController)throw new TypeError("This BYOB request has been invalidated");this._view.buffer,function(e,t){if(!1===Cc(t=Number(t)))throw new RangeError("bytesWritten must be a finite");Nh(e,t);}(this._associatedReadableByteStreamController,e);}respondWithNewView(e){if(!1===Dh(this))throw Vh("respond");if(void 0===this._associatedReadableByteStreamController)throw new TypeError("This BYOB request has been invalidated");if(!ArrayBuffer.isView(e))throw new TypeError("You can only respond with array buffer views");e.buffer,function(e,t){const r=e._pendingPullIntos.peek();if(r.byteOffset+r.bytesFilled!==t.byteOffset)throw new RangeError("The region specified by view does not match byobRequest");if(r.byteLength!==t.byteLength)throw new RangeError("The buffer of view has different capacity than byobRequest");r.buffer=t.buffer,Nh(e,t.byteLength);}(this._associatedReadableByteStreamController,e);}}class Ch{constructor(){throw new TypeError("ReadableByteStreamController constructor cannot be used directly")}get byobRequest(){if(!1===Kh(this))throw Zh("byobRequest");if(void 0===this._byobRequest&&this._pendingPullIntos.length>0){const e=this._pendingPullIntos.peek(),t=new Uint8Array(e.buffer,e.byteOffset+e.bytesFilled,e.byteLength-e.bytesFilled),r=Object.create(Mh.prototype);!function(e,t,r){e._associatedReadableByteStreamController=t,e._view=r;}(r,this,t),this._byobRequest=r;}return this._byobRequest}get desiredSize(){if(!1===Kh(this))throw Zh("desiredSize");return Hh(this)}close(){if(!1===Kh(this))throw Zh("close");if(!0===this._closeRequested)throw new TypeError("The stream has already been closed; do not close it again!");const e=this._controlledReadableByteStream._state;if("readable"!==e)throw new TypeError(`The stream (in ${e} state) is not in the readable state and cannot be closed`);!function(e){const t=e._controlledReadableByteStream;if(e._queueTotalSize>0)return void(e._closeRequested=!0);if(e._pendingPullIntos.length>0){if(e._pendingPullIntos.peek().bytesFilled>0){const t=new TypeError("Insufficient bytes to fill elements in the given buffer");throw Wh(e,t),t}}jh(e),od(t);}(this);}enqueue(e){if(!1===Kh(this))throw Zh("enqueue");if(!0===this._closeRequested)throw new TypeError("stream is closed or draining");const t=this._controlledReadableByteStream._state;if("readable"!==t)throw new TypeError(`The stream (in ${t} state) is not in the readable state and cannot be enqueued to`);if(!ArrayBuffer.isView(e))throw new TypeError("You can only enqueue array buffer views when using a ReadableByteStreamController");e.buffer,function(e,t){const r=e._controlledReadableByteStream,i=t.buffer,n=t.byteOffset,a=t.byteLength,s=i;if(!0===du(r))if(0===hu(r))Bh(e,s,n,a);else {const e=new Uint8Array(s,n,a);uu(r,e,!1);}else !0===Xh(r)?(Bh(e,s,n,a),Oh(e)):Bh(e,s,n,a);Rh(e);}(this,e);}error(e){if(!1===Kh(this))throw Zh("error");Wh(this,e);}[au](e){if(this._pendingPullIntos.length>0){this._pendingPullIntos.peek().bytesFilled=0;}ku(this);const t=this._cancelAlgorithm(e);return jh(this),t}[su](){const e=this._controlledReadableByteStream;if(this._queueTotalSize>0){const t=this._queue.shift();let r;this._queueTotalSize-=t.byteLength,qh(this);try{r=new Uint8Array(t.buffer,t.byteOffset,t.byteLength);}catch(e){return Lc(e)}return Nc($c(r,!1,e._reader._forAuthorCode))}const t=this._autoAllocateChunkSize;if(void 0!==t){let e;try{e=new ArrayBuffer(t);}catch(e){return Lc(e)}const r={buffer:e,byteOffset:0,byteLength:t,bytesFilled:0,elementSize:1,ctor:Uint8Array,readerType:"default"};this._pendingPullIntos.push(r);}const r=cu(e);return Rh(this),r}}function Kh(e){return !!Pc(e)&&!!Object.prototype.hasOwnProperty.call(e,"_controlledReadableByteStream")}function Dh(e){return !!Pc(e)&&!!Object.prototype.hasOwnProperty.call(e,"_associatedReadableByteStreamController")}function Rh(e){!1!==function(e){const t=e._controlledReadableByteStream;if("readable"!==t._state)return !1;if(!0===e._closeRequested)return !1;if(!1===e._started)return !1;if(!0===du(t)&&hu(t)>0)return !0;if(!0===Xh(t)&&$h(t)>0)return !0;if(Hh(e)>0)return !0;return !1}(e)&&(!0!==e._pulling?(e._pulling=!0,Wc(e._pullAlgorithm(),()=>{e._pulling=!1,!0===e._pullAgain&&(e._pullAgain=!1,Rh(e));},t=>{Wh(e,t);})):e._pullAgain=!0);}function Ih(e,t){let r=!1;"closed"===e._state&&(r=!0);const i=Uh(t);"default"===t.readerType?uu(e,i,r):function(e,t,r){const i=e._reader;i._readIntoRequests.shift()._resolve($c(t,r,i._forAuthorCode));}(e,i,r);}function Uh(e){const t=e.bytesFilled,r=e.elementSize;return new e.ctor(e.buffer,e.byteOffset,t/r)}function Bh(e,t,r,i){e._queue.push({buffer:t,byteOffset:r,byteLength:i}),e._queueTotalSize+=i;}function Th(e,t){const r=t.elementSize,i=t.bytesFilled-t.bytesFilled%r,n=Math.min(e._queueTotalSize,t.byteLength-t.bytesFilled),a=t.bytesFilled+n,s=a-a%r;let o=n,c=!1;s>i&&(o=s-t.bytesFilled,c=!0);const u=e._queue;for(;o>0;){const r=u.peek(),i=Math.min(o,r.byteLength),n=t.byteOffset+t.bytesFilled;h=t.buffer,d=n,f=r.buffer,l=r.byteOffset,p=i,new Uint8Array(h).set(new Uint8Array(f,l,p),d),r.byteLength===i?u.shift():(r.byteOffset+=i,r.byteLength-=i),e._queueTotalSize-=i,zh(e,i,t),o-=i;}var h,d,f,l,p;return c}function zh(e,t,r){Fh(e),r.bytesFilled+=t;}function qh(e){0===e._queueTotalSize&&!0===e._closeRequested?(jh(e),od(e._controlledReadableByteStream)):Rh(e);}function Fh(e){void 0!==e._byobRequest&&(e._byobRequest._associatedReadableByteStreamController=void 0,e._byobRequest._view=void 0,e._byobRequest=void 0);}function Oh(e){for(;e._pendingPullIntos.length>0;){if(0===e._queueTotalSize)return;const t=e._pendingPullIntos.peek();!0===Th(e,t)&&(Lh(e),Ih(e._controlledReadableByteStream,t));}}function Nh(e,t){const r=e._pendingPullIntos.peek();if("closed"===e._controlledReadableByteStream._state){if(0!==t)throw new TypeError("bytesWritten must be 0 when calling respond() on a closed stream");!function(e,t){t.buffer=t.buffer;const r=e._controlledReadableByteStream;if(!0===Xh(r))for(;$h(r)>0;){Ih(r,Lh(e));}}(e,r);}else !function(e,t,r){if(r.bytesFilled+t>r.byteLength)throw new RangeError("bytesWritten out of range");if(zh(e,t,r),r.bytesFilled<r.elementSize)return;Lh(e);const i=r.bytesFilled%r.elementSize;if(i>0){const t=r.byteOffset+r.bytesFilled,n=r.buffer.slice(t-i,t);Bh(e,n,0,n.byteLength);}r.buffer=r.buffer,r.bytesFilled-=i,Ih(e._controlledReadableByteStream,r),Oh(e);}(e,t,r);Rh(e);}function Lh(e){const t=e._pendingPullIntos.shift();return Fh(e),t}function jh(e){e._pullAlgorithm=void 0,e._cancelAlgorithm=void 0;}function Wh(e,t){const r=e._controlledReadableByteStream;"readable"===r._state&&(!function(e){Fh(e),e._pendingPullIntos=new Yc;}(e),ku(e),jh(e),cd(r,t));}function Hh(e){const t=e._controlledReadableByteStream._state;return "errored"===t?null:"closed"===t?0:e._strategyHWM-e._queueTotalSize}function Gh(e,t,r){const i=Object.create(Ch.prototype);const n=Dc(t,"pull",0,[i]),a=Dc(t,"cancel",1,[]);let s=t.autoAllocateChunkSize;if(void 0!==s&&(s=Number(s),!1===Ph(s)||s<=0))throw new RangeError("autoAllocateChunkSize must be a positive integer");!function(e,t,r,i,n,a,s){t._controlledReadableByteStream=e,t._pullAgain=!1,t._pulling=!1,t._byobRequest=void 0,t._queue=t._queueTotalSize=void 0,ku(t),t._closeRequested=!1,t._started=!1,t._strategyHWM=Uc(a),t._pullAlgorithm=i,t._cancelAlgorithm=n,t._autoAllocateChunkSize=s,t._pendingPullIntos=new Yc,e._readableStreamController=t,Wc(Nc(r()),()=>{t._started=!0,Rh(t);},e=>{Wh(t,e);});}(e,i,(function(){return Rc(t,"start",[i])}),n,a,r,s);}function Vh(e){return new TypeError(`ReadableStreamBYOBRequest.prototype.${e} can only be used on a ReadableStreamBYOBRequest`)}function Zh(e){return new TypeError(`ReadableByteStreamController.prototype.${e} can only be used on a ReadableByteStreamController`)}function Yh(e){return Oc((t,r)=>{const i={_resolve:t,_reject:r};e._reader._readIntoRequests.push(i);})}function $h(e){return e._reader._readIntoRequests.length}function Xh(e){const t=e._reader;return void 0!==t&&!!Qh(t)}class Jh{constructor(e){if(!nd(e))throw new TypeError("ReadableStreamBYOBReader can only be constructed with a ReadableStream instance given a byte source");if(!1===Kh(e._readableStreamController))throw new TypeError("Cannot construct a ReadableStreamBYOBReader for a stream not constructed with a byte source");if(ad(e))throw new TypeError("This stream has already been locked for exclusive reading by another reader");Xc(this,e),this._readIntoRequests=new Yc;}get closed(){return Qh(this)?this._closedPromise:Lc(ed("closed"))}cancel(e){return Qh(this)?void 0===this._ownerReadableStream?Lc(eu("cancel")):Jc(this,e):Lc(ed("cancel"))}read(e){return Qh(this)?void 0===this._ownerReadableStream?Lc(eu("read from")):ArrayBuffer.isView(e)?(e.buffer,0===e.byteLength?Lc(new TypeError("view must have non-zero byteLength")):function(e,t){const r=e._ownerReadableStream;if(r._disturbed=!0,"errored"===r._state)return Lc(r._storedError);return function(e,t){const r=e._controlledReadableByteStream;let i=1;t.constructor!==DataView&&(i=t.constructor.BYTES_PER_ELEMENT);const n=t.constructor,a={buffer:t.buffer,byteOffset:t.byteOffset,byteLength:t.byteLength,bytesFilled:0,elementSize:i,ctor:n,readerType:"byob"};if(e._pendingPullIntos.length>0)return e._pendingPullIntos.push(a),Yh(r);if("closed"===r._state){return Nc($c(new n(a.buffer,a.byteOffset,0),!0,r._reader._forAuthorCode))}if(e._queueTotalSize>0){if(!0===Th(e,a)){const t=Uh(a);return qh(e),Nc($c(t,!1,r._reader._forAuthorCode))}if(!0===e._closeRequested){const t=new TypeError("Insufficient bytes to fill elements in the given buffer");return Wh(e,t),Lc(t)}}e._pendingPullIntos.push(a);const s=Yh(r);return Rh(e),s}(r._readableStreamController,t)}(this,e)):Lc(new TypeError("view must be an array buffer view")):Lc(ed("read"))}releaseLock(){if(!Qh(this))throw ed("releaseLock");if(void 0!==this._ownerReadableStream){if(this._readIntoRequests.length>0)throw new TypeError("Tried to release a reader lock when that reader has pending read() calls un-settled");Qc(this);}}}function Qh(e){return !!Pc(e)&&!!Object.prototype.hasOwnProperty.call(e,"_readIntoRequests")}function ed(e){return new TypeError(`ReadableStreamBYOBReader.prototype.${e} can only be used on a ReadableStreamBYOBReader`)}class td{constructor(e={},t={}){id(this);const r=t.size;let i=t.highWaterMark;const n=e.type;if("bytes"===n+""){if(void 0!==r)throw new RangeError("The strategy for a byte stream cannot have a size function");void 0===i&&(i=0),i=Uc(i),Gh(this,e,i);}else {if(void 0!==n)throw new RangeError("Invalid type is specified");{const t=Bc(r);void 0===i&&(i=1),i=Uc(i),function(e,t,r,i){const n=Object.create(yh.prototype),a=Dc(t,"pull",0,[n]),s=Dc(t,"cancel",1,[]);Eh(e,n,(function(){return Rc(t,"start",[n])}),a,s,r,i);}(this,e,i,t);}}}get locked(){if(!1===nd(this))throw ud("locked");return ad(this)}cancel(e){return !1===nd(this)?Lc(ud("cancel")):!0===ad(this)?Lc(new TypeError("Cannot cancel a stream that already has a reader")):sd(this,e)}getReader({mode:e}={}){if(!1===nd(this))throw ud("getReader");if(void 0===e)return ou(this,!0);if("byob"===(e+=""))return function(e,t=!1){const r=new Jh(e);return r._forAuthorCode=t,r}(this,!0);throw new RangeError("Invalid mode is specified")}pipeThrough({writable:e,readable:t},{preventClose:r,preventAbort:i,preventCancel:n,signal:a}={}){if(!1===nd(this))throw ud("pipeThrough");if(!1===Mu(e))throw new TypeError("writable argument to pipeThrough must be a WritableStream");if(!1===nd(t))throw new TypeError("readable argument to pipeThrough must be a ReadableStream");if(r=!!r,i=!!i,n=!!n,void 0!==a&&!dh(a))throw new TypeError("ReadableStream.prototype.pipeThrough's signal option must be an AbortSignal");if(!0===ad(this))throw new TypeError("ReadableStream.prototype.pipeThrough cannot be used on a locked ReadableStream");if(!0===Cu(e))throw new TypeError("ReadableStream.prototype.pipeThrough cannot be used on a locked WritableStream");return Zc(ph(this,e,r,i,n,a)),t}pipeTo(e,{preventClose:t,preventAbort:r,preventCancel:i,signal:n}={}){return !1===nd(this)?Lc(ud("pipeTo")):!1===Mu(e)?Lc(new TypeError("ReadableStream.prototype.pipeTo's first argument must be a WritableStream")):(t=!!t,r=!!r,i=!!i,void 0===n||dh(n)?!0===ad(this)?Lc(new TypeError("ReadableStream.prototype.pipeTo cannot be used on a locked ReadableStream")):!0===Cu(e)?Lc(new TypeError("ReadableStream.prototype.pipeTo cannot be used on a locked WritableStream")):ph(this,e,t,r,i,n):Lc(new TypeError("ReadableStream.prototype.pipeTo's signal option must be an AbortSignal")))}tee(){if(!1===nd(this))throw ud("tee");const e=function(e,t){const r=ou(e);let i,n,a,s,o,c=!1,u=!1,h=!1;const d=Oc(e=>{o=e;});function f(){if(!0===c)return Nc(void 0);return c=!0,Zc(Vc(pu(r),e=>{if(c=!1,!0===e.done)return !1===u&&vh(a._readableStreamController),void(!1===h&&vh(s._readableStreamController));const t=e.value,r=t,i=t;!1===u&&_h(a._readableStreamController,r),!1===h&&_h(s._readableStreamController,i);})),Nc(void 0)}function l(){}return a=rd(l,f,(function(t){if(u=!0,i=t,!0===h){const t=Mc([i,n]),r=sd(e,t);o(r);}return d})),s=rd(l,f,(function(t){if(h=!0,n=t,!0===u){const t=Mc([i,n]),r=sd(e,t);o(r);}return d})),Gc(r._closedPromise,e=>{kh(a._readableStreamController,e),kh(s._readableStreamController,e);}),[a,s]}(this);return Mc(e)}getIterator({preventCancel:e=!1}={}){if(!1===nd(this))throw ud("getIterator");return function(e,t=!1){const r=ou(e),i=Object.create(mu);return i._asyncIteratorReader=r,i._preventCancel=!!t,i}(this,e)}}function rd(e,t,r,i=1,n=(()=>1)){const a=Object.create(td.prototype);return id(a),Eh(a,Object.create(yh.prototype),e,t,r,i,n),a}function id(e){e._state="readable",e._reader=void 0,e._storedError=void 0,e._disturbed=!1;}function nd(e){return !!Pc(e)&&!!Object.prototype.hasOwnProperty.call(e,"_readableStreamController")}function ad(e){return void 0!==e._reader}function sd(e,t){if(e._disturbed=!0,"closed"===e._state)return Nc(void 0);if("errored"===e._state)return Lc(e._storedError);return od(e),Vc(e._readableStreamController[au](t),Sc)}function od(e){e._state="closed";const t=e._reader;void 0!==t&&(lu(t)&&(t._readRequests.forEach(e=>{e._resolve($c(void 0,!0,t._forAuthorCode));}),t._readRequests=new Yc),nu(t));}function cd(e,t){e._state="errored",e._storedError=t;const r=e._reader;void 0!==r&&(lu(r)?(r._readRequests.forEach(e=>{e._reject(t);}),r._readRequests=new Yc):(r._readIntoRequests.forEach(e=>{e._reject(t);}),r._readIntoRequests=new Yc),iu(r,t));}function ud(e){return new TypeError(`ReadableStream.prototype.${e} can only be used on a ReadableStream`)}"symbol"==typeof Ac.asyncIterator&&Object.defineProperty(td.prototype,Ac.asyncIterator,{value:td.prototype.getIterator,enumerable:!1,writable:!0,configurable:!0});function hd(e){return !!Pc(e)&&!!Object.prototype.hasOwnProperty.call(e,"_transformStreamController")}function dd(e,t){kh(e._readable._readableStreamController,t),fd(e,t);}function fd(e,t){bd(e._transformStreamController),$u(e._writable._writableStreamController,t),!0===e._backpressure&&ld(e,!1);}function ld(e,t){void 0!==e._backpressureChangePromise&&e._backpressureChangePromise_resolve(),e._backpressureChangePromise=Oc(t=>{e._backpressureChangePromise_resolve=t;}),e._backpressure=t;}class pd{constructor(){throw new TypeError("TransformStreamDefaultController instances cannot be created directly")}get desiredSize(){if(!1===yd(this))throw wd("desiredSize");return Ah(this._controlledTransformStream._readable._readableStreamController)}enqueue(e){if(!1===yd(this))throw wd("enqueue");md(this,e);}error(e){if(!1===yd(this))throw wd("error");var t;t=e,dd(this._controlledTransformStream,t);}terminate(){if(!1===yd(this))throw wd("terminate");!function(e){const t=e._controlledTransformStream,r=t._readable._readableStreamController;!0===Sh(r)&&vh(r);fd(t,new TypeError("TransformStream terminated"));}(this);}}function yd(e){return !!Pc(e)&&!!Object.prototype.hasOwnProperty.call(e,"_controlledTransformStream")}function bd(e){e._transformAlgorithm=void 0,e._flushAlgorithm=void 0;}function md(e,t){const r=e._controlledTransformStream,i=r._readable._readableStreamController;if(!1===Sh(i))throw new TypeError("Readable side is not in a state that permits enqueue");try{_h(i,t);}catch(e){throw fd(r,e),r._readable._storedError}(function(e){return !0!==gh(e)})(i)!==r._backpressure&&ld(r,!0);}function gd(e,t){return Vc(e._transformAlgorithm(t),void 0,t=>{throw dd(e._controlledTransformStream,t),t})}function wd(e){return new TypeError(`TransformStreamDefaultController.prototype.${e} can only be used on a TransformStreamDefaultController`)}function vd(e){return new TypeError(`TransformStream.prototype.${e} can only be used on a TransformStream`)}var _d=/*#__PURE__*/Object.freeze({__proto__:null,ByteLengthQueuingStrategy:class{constructor({highWaterMark:e}){this.highWaterMark=e;}size(e){return e.byteLength}},CountQueuingStrategy:class{constructor({highWaterMark:e}){this.highWaterMark=e;}size(){return 1}},ReadableStream:td,TransformStream:class{constructor(e={},t={},r={}){const i=t.size;let n=t.highWaterMark;const a=r.size;let s=r.highWaterMark;if(void 0!==e.writableType)throw new RangeError("Invalid writable type specified");const o=Bc(i);if(void 0===n&&(n=1),n=Uc(n),void 0!==e.readableType)throw new RangeError("Invalid readable type specified");const c=Bc(a);let u;void 0===s&&(s=0),s=Uc(s),function(e,t,r,i,n,a){function s(){return t}e._writable=function(e,t,r,i,n=1,a=(()=>1)){const s=Object.create(Eu.prototype);return Pu(s),Gu(s,Object.create(Hu.prototype),e,t,r,i,n,a),s}(s,(function(t){return function(e,t){const r=e._transformStreamController;if(!0===e._backpressure){return Vc(e._backpressureChangePromise,()=>{const i=e._writable;if("erroring"===i._state)throw i._storedError;return gd(r,t)})}return gd(r,t)}(e,t)}),(function(){return function(e){const t=e._readable,r=e._transformStreamController,i=r._flushAlgorithm();return bd(r),Vc(i,()=>{if("errored"===t._state)throw t._storedError;const e=t._readableStreamController;!0===Sh(e)&&vh(e);},r=>{throw dd(e,r),t._storedError})}(e)}),(function(t){return function(e,t){return dd(e,t),Nc(void 0)}(e,t)}),r,i),e._readable=rd(s,(function(){return function(e){return ld(e,!1),e._backpressureChangePromise}(e)}),(function(t){return fd(e,t),Nc(void 0)}),n,a),e._backpressure=void 0,e._backpressureChangePromise=void 0,e._backpressureChangePromise_resolve=void 0,ld(e,!0),e._transformStreamController=void 0;}(this,Oc(e=>{u=e;}),n,o,s,c),function(e,t){const r=Object.create(pd.prototype);let i=e=>{try{return md(r,e),Nc(void 0)}catch(e){return Lc(e)}};const n=t.transform;if(void 0!==n){if("function"!=typeof n)throw new TypeError("transform is not a method");i=e=>Ic(n,t,[e,r]);}const a=Dc(t,"flush",0,[r]);!function(e,t,r,i){t._controlledTransformStream=e,e._transformStreamController=t,t._transformAlgorithm=r,t._flushAlgorithm=i;}(e,r,i,a);}(this,e);const h=Rc(e,"start",[this._transformStreamController]);u(h);}get readable(){if(!1===hd(this))throw vd("readable");return this._readable}get writable(){if(!1===hd(this))throw vd("writable");return this._writable}},WritableStream:Eu}),kd=function(e,t){return (kd=Object.setPrototypeOf||{__proto__:[]}instanceof Array&&function(e,t){e.__proto__=t;}||function(e,t){for(var r in t)t.hasOwnProperty(r)&&(e[r]=t[r]);})(e,t)};
    /*! *****************************************************************************
    Copyright (c) Microsoft Corporation. All rights reserved.
    Licensed under the Apache License, Version 2.0 (the "License"); you may not use
    this file except in compliance with the License. You may obtain a copy of the
    License at http://www.apache.org/licenses/LICENSE-2.0

    THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
    KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
    WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
    MERCHANTABLITY OR NON-INFRINGEMENT.

    See the Apache Version 2.0 License for specific language governing permissions
    and limitations under the License.
    ***************************************************************************** */function Ad(e,t){function r(){this.constructor=e;}kd(e,t),e.prototype=null===t?Object.create(t):(r.prototype=t.prototype,new r);}function Sd(e){if(!e)throw new TypeError("Assertion failed")}function Ed(){}function xd(e){return "object"==typeof e&&null!==e||"function"==typeof e}function Pd(e){if("function"!=typeof e)return !1;var t=!1;try{new e({start:function(){t=!0;}});}catch(e){}return t}function Md(e){return !!xd(e)&&"function"==typeof e.getReader}function Cd(e){return !!xd(e)&&"function"==typeof e.getWriter}function Kd(e){return !!xd(e)&&(!!Md(e.readable)&&!!Cd(e.writable))}function Dd(e){try{return e.getReader({mode:"byob"}).releaseLock(),!0}catch(e){return !1}}function Rd(e,t){var r=(void 0===t?{}:t).type;return Sd(Md(e)),Sd(!1===e.locked),"bytes"===(r=Id(r))?new zd(e):new Bd(e)}function Id(e){var t=e+"";if("bytes"===t)return t;if(void 0===e)return e;throw new RangeError("Invalid type is specified")}var Ud=function(){function e(e){this._underlyingReader=void 0,this._readerMode=void 0,this._readableStreamController=void 0,this._pendingRead=void 0,this._underlyingStream=e,this._attachDefaultReader();}return e.prototype.start=function(e){this._readableStreamController=e;},e.prototype.cancel=function(e){return Sd(void 0!==this._underlyingReader),this._underlyingReader.cancel(e)},e.prototype._attachDefaultReader=function(){if("default"!==this._readerMode){this._detachReader();var e=this._underlyingStream.getReader();this._readerMode="default",this._attachReader(e);}},e.prototype._attachReader=function(e){var t=this;Sd(void 0===this._underlyingReader),this._underlyingReader=e;var r=this._underlyingReader.closed;r&&r.then((function(){return t._finishPendingRead()})).then((function(){e===t._underlyingReader&&t._readableStreamController.close();}),(function(r){e===t._underlyingReader&&t._readableStreamController.error(r);})).catch(Ed);},e.prototype._detachReader=function(){void 0!==this._underlyingReader&&(this._underlyingReader.releaseLock(),this._underlyingReader=void 0,this._readerMode=void 0);},e.prototype._pullWithDefaultReader=function(){var e=this;this._attachDefaultReader();var t=this._underlyingReader.read().then((function(t){var r=e._readableStreamController;t.done?e._tryClose():r.enqueue(t.value);}));return this._setPendingRead(t),t},e.prototype._tryClose=function(){try{this._readableStreamController.close();}catch(e){}},e.prototype._setPendingRead=function(e){var t,r=this,i=function(){r._pendingRead===t&&(r._pendingRead=void 0);};this._pendingRead=t=e.then(i,i);},e.prototype._finishPendingRead=function(){var e=this;if(this._pendingRead){var t=function(){return e._finishPendingRead()};return this._pendingRead.then(t,t)}},e}(),Bd=function(e){function t(){return null!==e&&e.apply(this,arguments)||this}return Ad(t,e),t.prototype.pull=function(){return this._pullWithDefaultReader()},t}(Ud);function Td(e){return new Uint8Array(e.buffer,e.byteOffset,e.byteLength)}var zd=function(e){function t(t){var r=this,i=Dd(t);return (r=e.call(this,t)||this)._supportsByob=i,r}return Ad(t,e),Object.defineProperty(t.prototype,"type",{get:function(){return "bytes"},enumerable:!0,configurable:!0}),t.prototype._attachByobReader=function(){if("byob"!==this._readerMode){Sd(this._supportsByob),this._detachReader();var e=this._underlyingStream.getReader({mode:"byob"});this._readerMode="byob",this._attachReader(e);}},t.prototype.pull=function(){if(this._supportsByob){var e=this._readableStreamController.byobRequest;if(void 0!==e)return this._pullWithByobRequest(e)}return this._pullWithDefaultReader()},t.prototype._pullWithByobRequest=function(e){var t=this;this._attachByobReader();var r=new Uint8Array(e.view.byteLength),i=this._underlyingReader.read(r).then((function(r){var i,n,a;t._readableStreamController,r.done?(t._tryClose(),e.respond(0)):(i=r.value,n=e.view,a=Td(i),Td(n).set(a,0),e.respond(r.value.byteLength));}));return this._setPendingRead(i),i},t}(Ud);function qd(e){Sd(Cd(e)),Sd(!1===e.locked);var t=e.getWriter();return new Fd(t)}var Fd=function(){function e(e){var t=this;this._writableStreamController=void 0,this._pendingWrite=void 0,this._state="writable",this._storedError=void 0,this._underlyingWriter=e,this._errorPromise=new Promise((function(e,r){t._errorPromiseReject=r;})),this._errorPromise.catch(Ed);}return e.prototype.start=function(e){var t=this;this._writableStreamController=e,this._underlyingWriter.closed.then((function(){t._state="closed";})).catch((function(e){return t._finishErroring(e)}));},e.prototype.write=function(e){var t=this,r=this._underlyingWriter;if(null===r.desiredSize)return r.ready;var i=r.write(e);i.catch((function(e){return t._finishErroring(e)})),r.ready.catch((function(e){return t._startErroring(e)}));var n=Promise.race([i,this._errorPromise]);return this._setPendingWrite(n),n},e.prototype.close=function(){var e=this;return void 0===this._pendingWrite?this._underlyingWriter.close():this._finishPendingWrite().then((function(){return e.close()}))},e.prototype.abort=function(e){if("errored"!==this._state)return this._underlyingWriter.abort(e)},e.prototype._setPendingWrite=function(e){var t,r=this,i=function(){r._pendingWrite===t&&(r._pendingWrite=void 0);};this._pendingWrite=t=e.then(i,i);},e.prototype._finishPendingWrite=function(){var e=this;if(void 0===this._pendingWrite)return Promise.resolve();var t=function(){return e._finishPendingWrite()};return this._pendingWrite.then(t,t)},e.prototype._startErroring=function(e){var t=this;if("writable"===this._state){this._state="erroring",this._storedError=e;var r=function(){return t._finishErroring(e)};void 0===this._pendingWrite?r():this._finishPendingWrite().then(r,r),this._writableStreamController.error(e);}},e.prototype._finishErroring=function(e){"writable"===this._state&&this._startErroring(e),"erroring"===this._state&&(this._state="errored",this._errorPromiseReject(this._storedError));},e}();function Od(e){Sd(Kd(e));var t=e.readable,r=e.writable;Sd(!1===t.locked),Sd(!1===r.locked);var i,n=t.getReader();try{i=r.getWriter();}catch(e){throw n.releaseLock(),e}return new Nd(n,i)}var Nd=function(){function e(e,t){var r=this;this._transformStreamController=void 0,this._onRead=function(e){if(!e.done)return r._transformStreamController.enqueue(e.value),r._reader.read().then(r._onRead)},this._onError=function(e){r._flushReject(e),r._transformStreamController.error(e),r._reader.cancel(e).catch(Ed),r._writer.abort(e).catch(Ed);},this._onTerminate=function(){r._flushResolve(),r._transformStreamController.terminate();var e=new TypeError("TransformStream terminated");r._writer.abort(e).catch(Ed);},this._reader=e,this._writer=t,this._flushPromise=new Promise((function(e,t){r._flushResolve=e,r._flushReject=t;}));}return e.prototype.start=function(e){this._transformStreamController=e,this._reader.read().then(this._onRead).then(this._onTerminate,this._onError);var t=this._reader.closed;t&&t.then(this._onTerminate,this._onError);},e.prototype.transform=function(e){return this._writer.write(e)},e.prototype.flush=function(){var e=this;return this._writer.close().then((function(){return e._flushPromise}))},e}(),Ld=/*#__PURE__*/Object.freeze({__proto__:null,createReadableStreamWrapper:function(e){Sd(function(e){return !!Pd(e)&&!!Md(new e)}(e));var t=function(e){try{return new e({type:"bytes"}),!0}catch(e){return !1}}(e);return function(r,i){var n=(void 0===i?{}:i).type;if("bytes"!==(n=Id(n))||t||(n=void 0),r.constructor===e&&("bytes"!==n||Dd(r)))return r;var a=Rd(r,{type:n});return new e(a)}},createTransformStreamWrapper:function(e){return Sd(function(e){return !!Pd(e)&&!!Kd(new e)}(e)),function(t){if(t.constructor===e)return t;var r=Od(t);return new e(r)}},createWrappingReadableSource:Rd,createWrappingTransformer:Od,createWrappingWritableSink:qd,createWritableStreamWrapper:function(e){return Sd(function(e){return !!Pd(e)&&!!Cd(new e)}(e)),function(t){if(t.constructor===e)return t;var r=qd(t);return new e(r)}}}),jd=rt((function(e){!function(e,t){function r(e,t){if(!e)throw Error(t||"Assertion failed")}function i(e,t){e.super_=t;var r=function(){};r.prototype=t.prototype,e.prototype=new r,e.prototype.constructor=e;}function n(e,t,r){if(n.isBN(e))return e;this.negative=0,this.words=null,this.length=0,this.red=null,null!==e&&("le"!==t&&"be"!==t||(r=t,t=10),this._init(e||0,t||10,r||"be"));}var a;"object"==typeof e?e.exports=n:t.BN=n,n.BN=n,n.wordSize=26;try{a=void 0;}catch(e){}function s(e,t,r){for(var i=0,n=Math.min(e.length,r),a=t;a<n;a++){var s=e.charCodeAt(a)-48;i<<=4,i|=s>=49&&s<=54?s-49+10:s>=17&&s<=22?s-17+10:15&s;}return i}function o(e,t,r,i){for(var n=0,a=Math.min(e.length,r),s=t;s<a;s++){var o=e.charCodeAt(s)-48;n*=i,n+=o>=49?o-49+10:o>=17?o-17+10:o;}return n}n.isBN=function(e){return e instanceof n||null!==e&&"object"==typeof e&&e.constructor.wordSize===n.wordSize&&Array.isArray(e.words)},n.max=function(e,t){return e.cmp(t)>0?e:t},n.min=function(e,t){return e.cmp(t)<0?e:t},n.prototype._init=function(e,t,i){if("number"==typeof e)return this._initNumber(e,t,i);if("object"==typeof e)return this._initArray(e,t,i);"hex"===t&&(t=16),r(t===(0|t)&&t>=2&&t<=36);var n=0;"-"===(e=e.toString().replace(/\s+/g,""))[0]&&n++,16===t?this._parseHex(e,n):this._parseBase(e,t,n),"-"===e[0]&&(this.negative=1),this.strip(),"le"===i&&this._initArray(this.toArray(),t,i);},n.prototype._initNumber=function(e,t,i){e<0&&(this.negative=1,e=-e),e<67108864?(this.words=[67108863&e],this.length=1):e<4503599627370496?(this.words=[67108863&e,e/67108864&67108863],this.length=2):(r(e<9007199254740992),this.words=[67108863&e,e/67108864&67108863,1],this.length=3),"le"===i&&this._initArray(this.toArray(),t,i);},n.prototype._initArray=function(e,t,i){if(r("number"==typeof e.length),e.length<=0)return this.words=[0],this.length=1,this;this.length=Math.ceil(e.length/3),this.words=Array(this.length);for(var n=0;n<this.length;n++)this.words[n]=0;var a,s,o=0;if("be"===i)for(n=e.length-1,a=0;n>=0;n-=3)s=e[n]|e[n-1]<<8|e[n-2]<<16,this.words[a]|=s<<o&67108863,this.words[a+1]=s>>>26-o&67108863,(o+=24)>=26&&(o-=26,a++);else if("le"===i)for(n=0,a=0;n<e.length;n+=3)s=e[n]|e[n+1]<<8|e[n+2]<<16,this.words[a]|=s<<o&67108863,this.words[a+1]=s>>>26-o&67108863,(o+=24)>=26&&(o-=26,a++);return this.strip()},n.prototype._parseHex=function(e,t){this.length=Math.ceil((e.length-t)/6),this.words=Array(this.length);for(var r=0;r<this.length;r++)this.words[r]=0;var i,n,a=0;for(r=e.length-6,i=0;r>=t;r-=6)n=s(e,r,r+6),this.words[i]|=n<<a&67108863,this.words[i+1]|=n>>>26-a&4194303,(a+=24)>=26&&(a-=26,i++);r+6!==t&&(n=s(e,t,r+6),this.words[i]|=n<<a&67108863,this.words[i+1]|=n>>>26-a&4194303),this.strip();},n.prototype._parseBase=function(e,t,r){this.words=[0],this.length=1;for(var i=0,n=1;n<=67108863;n*=t)i++;i--,n=n/t|0;for(var a=e.length-r,s=a%i,c=Math.min(a,a-s)+r,u=0,h=r;h<c;h+=i)u=o(e,h,h+i,t),this.imuln(n),this.words[0]+u<67108864?this.words[0]+=u:this._iaddn(u);if(0!==s){var d=1;for(u=o(e,h,e.length,t),h=0;h<s;h++)d*=t;this.imuln(d),this.words[0]+u<67108864?this.words[0]+=u:this._iaddn(u);}},n.prototype.copy=function(e){e.words=Array(this.length);for(var t=0;t<this.length;t++)e.words[t]=this.words[t];e.length=this.length,e.negative=this.negative,e.red=this.red;},n.prototype.clone=function(){var e=new n(null);return this.copy(e),e},n.prototype._expand=function(e){for(;this.length<e;)this.words[this.length++]=0;return this},n.prototype.strip=function(){for(;this.length>1&&0===this.words[this.length-1];)this.length--;return this._normSign()},n.prototype._normSign=function(){return 1===this.length&&0===this.words[0]&&(this.negative=0),this},n.prototype.inspect=function(){return (this.red?"<BN-R: ":"<BN: ")+this.toString(16)+">"};var c=["","0","00","000","0000","00000","000000","0000000","00000000","000000000","0000000000","00000000000","000000000000","0000000000000","00000000000000","000000000000000","0000000000000000","00000000000000000","000000000000000000","0000000000000000000","00000000000000000000","000000000000000000000","0000000000000000000000","00000000000000000000000","000000000000000000000000","0000000000000000000000000"],u=[0,0,25,16,12,11,10,9,8,8,7,7,7,7,6,6,6,6,6,6,6,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5],h=[0,0,33554432,43046721,16777216,48828125,60466176,40353607,16777216,43046721,1e7,19487171,35831808,62748517,7529536,11390625,16777216,24137569,34012224,47045881,64e6,4084101,5153632,6436343,7962624,9765625,11881376,14348907,17210368,20511149,243e5,28629151,33554432,39135393,45435424,52521875,60466176];function d(e,t,r){r.negative=t.negative^e.negative;var i=e.length+t.length|0;r.length=i,i=i-1|0;var n=0|e.words[0],a=0|t.words[0],s=n*a,o=67108863&s,c=s/67108864|0;r.words[0]=o;for(var u=1;u<i;u++){for(var h=c>>>26,d=67108863&c,f=Math.min(u,t.length-1),l=Math.max(0,u-e.length+1);l<=f;l++){var p=u-l|0;h+=(s=(n=0|e.words[p])*(a=0|t.words[l])+d)/67108864|0,d=67108863&s;}r.words[u]=0|d,c=0|h;}return 0!==c?r.words[u]=0|c:r.length--,r.strip()}n.prototype.toString=function(e,t){var i;if(t=0|t||1,16===(e=e||10)||"hex"===e){i="";for(var n=0,a=0,s=0;s<this.length;s++){var o=this.words[s],d=(16777215&(o<<n|a)).toString(16);i=0!==(a=o>>>24-n&16777215)||s!==this.length-1?c[6-d.length]+d+i:d+i,(n+=2)>=26&&(n-=26,s--);}for(0!==a&&(i=a.toString(16)+i);i.length%t!=0;)i="0"+i;return 0!==this.negative&&(i="-"+i),i}if(e===(0|e)&&e>=2&&e<=36){var f=u[e],l=h[e];i="";var p=this.clone();for(p.negative=0;!p.isZero();){var y=p.modn(l).toString(e);i=(p=p.idivn(l)).isZero()?y+i:c[f-y.length]+y+i;}for(this.isZero()&&(i="0"+i);i.length%t!=0;)i="0"+i;return 0!==this.negative&&(i="-"+i),i}r(!1,"Base should be between 2 and 36");},n.prototype.toNumber=function(){var e=this.words[0];return 2===this.length?e+=67108864*this.words[1]:3===this.length&&1===this.words[2]?e+=4503599627370496+67108864*this.words[1]:this.length>2&&r(!1,"Number can only safely store up to 53 bits"),0!==this.negative?-e:e},n.prototype.toJSON=function(){return this.toString(16)},n.prototype.toBuffer=function(e,t){return r(void 0!==a),this.toArrayLike(a,e,t)},n.prototype.toArray=function(e,t){return this.toArrayLike(Array,e,t)},n.prototype.toArrayLike=function(e,t,i){var n=this.byteLength(),a=i||Math.max(1,n);r(n<=a,"byte array longer than desired length"),r(a>0,"Requested array length <= 0"),this.strip();var s,o,c="le"===t,u=new e(a),h=this.clone();if(c){for(o=0;!h.isZero();o++)s=h.andln(255),h.iushrn(8),u[o]=s;for(;o<a;o++)u[o]=0;}else {for(o=0;o<a-n;o++)u[o]=0;for(o=0;!h.isZero();o++)s=h.andln(255),h.iushrn(8),u[a-o-1]=s;}return u},n.prototype._countBits=Math.clz32?function(e){return 32-Math.clz32(e)}:function(e){var t=e,r=0;return t>=4096&&(r+=13,t>>>=13),t>=64&&(r+=7,t>>>=7),t>=8&&(r+=4,t>>>=4),t>=2&&(r+=2,t>>>=2),r+t},n.prototype._zeroBits=function(e){if(0===e)return 26;var t=e,r=0;return 0==(8191&t)&&(r+=13,t>>>=13),0==(127&t)&&(r+=7,t>>>=7),0==(15&t)&&(r+=4,t>>>=4),0==(3&t)&&(r+=2,t>>>=2),0==(1&t)&&r++,r},n.prototype.bitLength=function(){var e=this.words[this.length-1],t=this._countBits(e);return 26*(this.length-1)+t},n.prototype.zeroBits=function(){if(this.isZero())return 0;for(var e=0,t=0;t<this.length;t++){var r=this._zeroBits(this.words[t]);if(e+=r,26!==r)break}return e},n.prototype.byteLength=function(){return Math.ceil(this.bitLength()/8)},n.prototype.toTwos=function(e){return 0!==this.negative?this.abs().inotn(e).iaddn(1):this.clone()},n.prototype.fromTwos=function(e){return this.testn(e-1)?this.notn(e).iaddn(1).ineg():this.clone()},n.prototype.isNeg=function(){return 0!==this.negative},n.prototype.neg=function(){return this.clone().ineg()},n.prototype.ineg=function(){return this.isZero()||(this.negative^=1),this},n.prototype.iuor=function(e){for(;this.length<e.length;)this.words[this.length++]=0;for(var t=0;t<e.length;t++)this.words[t]=this.words[t]|e.words[t];return this.strip()},n.prototype.ior=function(e){return r(0==(this.negative|e.negative)),this.iuor(e)},n.prototype.or=function(e){return this.length>e.length?this.clone().ior(e):e.clone().ior(this)},n.prototype.uor=function(e){return this.length>e.length?this.clone().iuor(e):e.clone().iuor(this)},n.prototype.iuand=function(e){var t;t=this.length>e.length?e:this;for(var r=0;r<t.length;r++)this.words[r]=this.words[r]&e.words[r];return this.length=t.length,this.strip()},n.prototype.iand=function(e){return r(0==(this.negative|e.negative)),this.iuand(e)},n.prototype.and=function(e){return this.length>e.length?this.clone().iand(e):e.clone().iand(this)},n.prototype.uand=function(e){return this.length>e.length?this.clone().iuand(e):e.clone().iuand(this)},n.prototype.iuxor=function(e){var t,r;this.length>e.length?(t=this,r=e):(t=e,r=this);for(var i=0;i<r.length;i++)this.words[i]=t.words[i]^r.words[i];if(this!==t)for(;i<t.length;i++)this.words[i]=t.words[i];return this.length=t.length,this.strip()},n.prototype.ixor=function(e){return r(0==(this.negative|e.negative)),this.iuxor(e)},n.prototype.xor=function(e){return this.length>e.length?this.clone().ixor(e):e.clone().ixor(this)},n.prototype.uxor=function(e){return this.length>e.length?this.clone().iuxor(e):e.clone().iuxor(this)},n.prototype.inotn=function(e){r("number"==typeof e&&e>=0);var t=0|Math.ceil(e/26),i=e%26;this._expand(t),i>0&&t--;for(var n=0;n<t;n++)this.words[n]=67108863&~this.words[n];return i>0&&(this.words[n]=~this.words[n]&67108863>>26-i),this.strip()},n.prototype.notn=function(e){return this.clone().inotn(e)},n.prototype.setn=function(e,t){r("number"==typeof e&&e>=0);var i=e/26|0,n=e%26;return this._expand(i+1),this.words[i]=t?this.words[i]|1<<n:this.words[i]&~(1<<n),this.strip()},n.prototype.iadd=function(e){var t,r,i;if(0!==this.negative&&0===e.negative)return this.negative=0,t=this.isub(e),this.negative^=1,this._normSign();if(0===this.negative&&0!==e.negative)return e.negative=0,t=this.isub(e),e.negative=1,t._normSign();this.length>e.length?(r=this,i=e):(r=e,i=this);for(var n=0,a=0;a<i.length;a++)t=(0|r.words[a])+(0|i.words[a])+n,this.words[a]=67108863&t,n=t>>>26;for(;0!==n&&a<r.length;a++)t=(0|r.words[a])+n,this.words[a]=67108863&t,n=t>>>26;if(this.length=r.length,0!==n)this.words[this.length]=n,this.length++;else if(r!==this)for(;a<r.length;a++)this.words[a]=r.words[a];return this},n.prototype.add=function(e){var t;return 0!==e.negative&&0===this.negative?(e.negative=0,t=this.sub(e),e.negative^=1,t):0===e.negative&&0!==this.negative?(this.negative=0,t=e.sub(this),this.negative=1,t):this.length>e.length?this.clone().iadd(e):e.clone().iadd(this)},n.prototype.isub=function(e){if(0!==e.negative){e.negative=0;var t=this.iadd(e);return e.negative=1,t._normSign()}if(0!==this.negative)return this.negative=0,this.iadd(e),this.negative=1,this._normSign();var r,i,n=this.cmp(e);if(0===n)return this.negative=0,this.length=1,this.words[0]=0,this;n>0?(r=this,i=e):(r=e,i=this);for(var a=0,s=0;s<i.length;s++)a=(t=(0|r.words[s])-(0|i.words[s])+a)>>26,this.words[s]=67108863&t;for(;0!==a&&s<r.length;s++)a=(t=(0|r.words[s])+a)>>26,this.words[s]=67108863&t;if(0===a&&s<r.length&&r!==this)for(;s<r.length;s++)this.words[s]=r.words[s];return this.length=Math.max(this.length,s),r!==this&&(this.negative=1),this.strip()},n.prototype.sub=function(e){return this.clone().isub(e)};var f=function(e,t,r){var i,n,a,s=e.words,o=t.words,c=r.words,u=0,h=0|s[0],d=8191&h,f=h>>>13,l=0|s[1],p=8191&l,y=l>>>13,b=0|s[2],m=8191&b,g=b>>>13,w=0|s[3],v=8191&w,_=w>>>13,k=0|s[4],A=8191&k,S=k>>>13,E=0|s[5],x=8191&E,P=E>>>13,M=0|s[6],C=8191&M,K=M>>>13,D=0|s[7],R=8191&D,I=D>>>13,U=0|s[8],B=8191&U,T=U>>>13,z=0|s[9],q=8191&z,F=z>>>13,O=0|o[0],N=8191&O,L=O>>>13,j=0|o[1],W=8191&j,H=j>>>13,G=0|o[2],V=8191&G,Z=G>>>13,Y=0|o[3],$=8191&Y,X=Y>>>13,J=0|o[4],Q=8191&J,ee=J>>>13,te=0|o[5],re=8191&te,ie=te>>>13,ne=0|o[6],ae=8191&ne,se=ne>>>13,oe=0|o[7],ce=8191&oe,ue=oe>>>13,he=0|o[8],de=8191&he,fe=he>>>13,le=0|o[9],pe=8191&le,ye=le>>>13;r.negative=e.negative^t.negative,r.length=19;var be=(u+(i=Math.imul(d,N))|0)+((8191&(n=(n=Math.imul(d,L))+Math.imul(f,N)|0))<<13)|0;u=((a=Math.imul(f,L))+(n>>>13)|0)+(be>>>26)|0,be&=67108863,i=Math.imul(p,N),n=(n=Math.imul(p,L))+Math.imul(y,N)|0,a=Math.imul(y,L);var me=(u+(i=i+Math.imul(d,W)|0)|0)+((8191&(n=(n=n+Math.imul(d,H)|0)+Math.imul(f,W)|0))<<13)|0;u=((a=a+Math.imul(f,H)|0)+(n>>>13)|0)+(me>>>26)|0,me&=67108863,i=Math.imul(m,N),n=(n=Math.imul(m,L))+Math.imul(g,N)|0,a=Math.imul(g,L),i=i+Math.imul(p,W)|0,n=(n=n+Math.imul(p,H)|0)+Math.imul(y,W)|0,a=a+Math.imul(y,H)|0;var ge=(u+(i=i+Math.imul(d,V)|0)|0)+((8191&(n=(n=n+Math.imul(d,Z)|0)+Math.imul(f,V)|0))<<13)|0;u=((a=a+Math.imul(f,Z)|0)+(n>>>13)|0)+(ge>>>26)|0,ge&=67108863,i=Math.imul(v,N),n=(n=Math.imul(v,L))+Math.imul(_,N)|0,a=Math.imul(_,L),i=i+Math.imul(m,W)|0,n=(n=n+Math.imul(m,H)|0)+Math.imul(g,W)|0,a=a+Math.imul(g,H)|0,i=i+Math.imul(p,V)|0,n=(n=n+Math.imul(p,Z)|0)+Math.imul(y,V)|0,a=a+Math.imul(y,Z)|0;var we=(u+(i=i+Math.imul(d,$)|0)|0)+((8191&(n=(n=n+Math.imul(d,X)|0)+Math.imul(f,$)|0))<<13)|0;u=((a=a+Math.imul(f,X)|0)+(n>>>13)|0)+(we>>>26)|0,we&=67108863,i=Math.imul(A,N),n=(n=Math.imul(A,L))+Math.imul(S,N)|0,a=Math.imul(S,L),i=i+Math.imul(v,W)|0,n=(n=n+Math.imul(v,H)|0)+Math.imul(_,W)|0,a=a+Math.imul(_,H)|0,i=i+Math.imul(m,V)|0,n=(n=n+Math.imul(m,Z)|0)+Math.imul(g,V)|0,a=a+Math.imul(g,Z)|0,i=i+Math.imul(p,$)|0,n=(n=n+Math.imul(p,X)|0)+Math.imul(y,$)|0,a=a+Math.imul(y,X)|0;var ve=(u+(i=i+Math.imul(d,Q)|0)|0)+((8191&(n=(n=n+Math.imul(d,ee)|0)+Math.imul(f,Q)|0))<<13)|0;u=((a=a+Math.imul(f,ee)|0)+(n>>>13)|0)+(ve>>>26)|0,ve&=67108863,i=Math.imul(x,N),n=(n=Math.imul(x,L))+Math.imul(P,N)|0,a=Math.imul(P,L),i=i+Math.imul(A,W)|0,n=(n=n+Math.imul(A,H)|0)+Math.imul(S,W)|0,a=a+Math.imul(S,H)|0,i=i+Math.imul(v,V)|0,n=(n=n+Math.imul(v,Z)|0)+Math.imul(_,V)|0,a=a+Math.imul(_,Z)|0,i=i+Math.imul(m,$)|0,n=(n=n+Math.imul(m,X)|0)+Math.imul(g,$)|0,a=a+Math.imul(g,X)|0,i=i+Math.imul(p,Q)|0,n=(n=n+Math.imul(p,ee)|0)+Math.imul(y,Q)|0,a=a+Math.imul(y,ee)|0;var _e=(u+(i=i+Math.imul(d,re)|0)|0)+((8191&(n=(n=n+Math.imul(d,ie)|0)+Math.imul(f,re)|0))<<13)|0;u=((a=a+Math.imul(f,ie)|0)+(n>>>13)|0)+(_e>>>26)|0,_e&=67108863,i=Math.imul(C,N),n=(n=Math.imul(C,L))+Math.imul(K,N)|0,a=Math.imul(K,L),i=i+Math.imul(x,W)|0,n=(n=n+Math.imul(x,H)|0)+Math.imul(P,W)|0,a=a+Math.imul(P,H)|0,i=i+Math.imul(A,V)|0,n=(n=n+Math.imul(A,Z)|0)+Math.imul(S,V)|0,a=a+Math.imul(S,Z)|0,i=i+Math.imul(v,$)|0,n=(n=n+Math.imul(v,X)|0)+Math.imul(_,$)|0,a=a+Math.imul(_,X)|0,i=i+Math.imul(m,Q)|0,n=(n=n+Math.imul(m,ee)|0)+Math.imul(g,Q)|0,a=a+Math.imul(g,ee)|0,i=i+Math.imul(p,re)|0,n=(n=n+Math.imul(p,ie)|0)+Math.imul(y,re)|0,a=a+Math.imul(y,ie)|0;var ke=(u+(i=i+Math.imul(d,ae)|0)|0)+((8191&(n=(n=n+Math.imul(d,se)|0)+Math.imul(f,ae)|0))<<13)|0;u=((a=a+Math.imul(f,se)|0)+(n>>>13)|0)+(ke>>>26)|0,ke&=67108863,i=Math.imul(R,N),n=(n=Math.imul(R,L))+Math.imul(I,N)|0,a=Math.imul(I,L),i=i+Math.imul(C,W)|0,n=(n=n+Math.imul(C,H)|0)+Math.imul(K,W)|0,a=a+Math.imul(K,H)|0,i=i+Math.imul(x,V)|0,n=(n=n+Math.imul(x,Z)|0)+Math.imul(P,V)|0,a=a+Math.imul(P,Z)|0,i=i+Math.imul(A,$)|0,n=(n=n+Math.imul(A,X)|0)+Math.imul(S,$)|0,a=a+Math.imul(S,X)|0,i=i+Math.imul(v,Q)|0,n=(n=n+Math.imul(v,ee)|0)+Math.imul(_,Q)|0,a=a+Math.imul(_,ee)|0,i=i+Math.imul(m,re)|0,n=(n=n+Math.imul(m,ie)|0)+Math.imul(g,re)|0,a=a+Math.imul(g,ie)|0,i=i+Math.imul(p,ae)|0,n=(n=n+Math.imul(p,se)|0)+Math.imul(y,ae)|0,a=a+Math.imul(y,se)|0;var Ae=(u+(i=i+Math.imul(d,ce)|0)|0)+((8191&(n=(n=n+Math.imul(d,ue)|0)+Math.imul(f,ce)|0))<<13)|0;u=((a=a+Math.imul(f,ue)|0)+(n>>>13)|0)+(Ae>>>26)|0,Ae&=67108863,i=Math.imul(B,N),n=(n=Math.imul(B,L))+Math.imul(T,N)|0,a=Math.imul(T,L),i=i+Math.imul(R,W)|0,n=(n=n+Math.imul(R,H)|0)+Math.imul(I,W)|0,a=a+Math.imul(I,H)|0,i=i+Math.imul(C,V)|0,n=(n=n+Math.imul(C,Z)|0)+Math.imul(K,V)|0,a=a+Math.imul(K,Z)|0,i=i+Math.imul(x,$)|0,n=(n=n+Math.imul(x,X)|0)+Math.imul(P,$)|0,a=a+Math.imul(P,X)|0,i=i+Math.imul(A,Q)|0,n=(n=n+Math.imul(A,ee)|0)+Math.imul(S,Q)|0,a=a+Math.imul(S,ee)|0,i=i+Math.imul(v,re)|0,n=(n=n+Math.imul(v,ie)|0)+Math.imul(_,re)|0,a=a+Math.imul(_,ie)|0,i=i+Math.imul(m,ae)|0,n=(n=n+Math.imul(m,se)|0)+Math.imul(g,ae)|0,a=a+Math.imul(g,se)|0,i=i+Math.imul(p,ce)|0,n=(n=n+Math.imul(p,ue)|0)+Math.imul(y,ce)|0,a=a+Math.imul(y,ue)|0;var Se=(u+(i=i+Math.imul(d,de)|0)|0)+((8191&(n=(n=n+Math.imul(d,fe)|0)+Math.imul(f,de)|0))<<13)|0;u=((a=a+Math.imul(f,fe)|0)+(n>>>13)|0)+(Se>>>26)|0,Se&=67108863,i=Math.imul(q,N),n=(n=Math.imul(q,L))+Math.imul(F,N)|0,a=Math.imul(F,L),i=i+Math.imul(B,W)|0,n=(n=n+Math.imul(B,H)|0)+Math.imul(T,W)|0,a=a+Math.imul(T,H)|0,i=i+Math.imul(R,V)|0,n=(n=n+Math.imul(R,Z)|0)+Math.imul(I,V)|0,a=a+Math.imul(I,Z)|0,i=i+Math.imul(C,$)|0,n=(n=n+Math.imul(C,X)|0)+Math.imul(K,$)|0,a=a+Math.imul(K,X)|0,i=i+Math.imul(x,Q)|0,n=(n=n+Math.imul(x,ee)|0)+Math.imul(P,Q)|0,a=a+Math.imul(P,ee)|0,i=i+Math.imul(A,re)|0,n=(n=n+Math.imul(A,ie)|0)+Math.imul(S,re)|0,a=a+Math.imul(S,ie)|0,i=i+Math.imul(v,ae)|0,n=(n=n+Math.imul(v,se)|0)+Math.imul(_,ae)|0,a=a+Math.imul(_,se)|0,i=i+Math.imul(m,ce)|0,n=(n=n+Math.imul(m,ue)|0)+Math.imul(g,ce)|0,a=a+Math.imul(g,ue)|0,i=i+Math.imul(p,de)|0,n=(n=n+Math.imul(p,fe)|0)+Math.imul(y,de)|0,a=a+Math.imul(y,fe)|0;var Ee=(u+(i=i+Math.imul(d,pe)|0)|0)+((8191&(n=(n=n+Math.imul(d,ye)|0)+Math.imul(f,pe)|0))<<13)|0;u=((a=a+Math.imul(f,ye)|0)+(n>>>13)|0)+(Ee>>>26)|0,Ee&=67108863,i=Math.imul(q,W),n=(n=Math.imul(q,H))+Math.imul(F,W)|0,a=Math.imul(F,H),i=i+Math.imul(B,V)|0,n=(n=n+Math.imul(B,Z)|0)+Math.imul(T,V)|0,a=a+Math.imul(T,Z)|0,i=i+Math.imul(R,$)|0,n=(n=n+Math.imul(R,X)|0)+Math.imul(I,$)|0,a=a+Math.imul(I,X)|0,i=i+Math.imul(C,Q)|0,n=(n=n+Math.imul(C,ee)|0)+Math.imul(K,Q)|0,a=a+Math.imul(K,ee)|0,i=i+Math.imul(x,re)|0,n=(n=n+Math.imul(x,ie)|0)+Math.imul(P,re)|0,a=a+Math.imul(P,ie)|0,i=i+Math.imul(A,ae)|0,n=(n=n+Math.imul(A,se)|0)+Math.imul(S,ae)|0,a=a+Math.imul(S,se)|0,i=i+Math.imul(v,ce)|0,n=(n=n+Math.imul(v,ue)|0)+Math.imul(_,ce)|0,a=a+Math.imul(_,ue)|0,i=i+Math.imul(m,de)|0,n=(n=n+Math.imul(m,fe)|0)+Math.imul(g,de)|0,a=a+Math.imul(g,fe)|0;var xe=(u+(i=i+Math.imul(p,pe)|0)|0)+((8191&(n=(n=n+Math.imul(p,ye)|0)+Math.imul(y,pe)|0))<<13)|0;u=((a=a+Math.imul(y,ye)|0)+(n>>>13)|0)+(xe>>>26)|0,xe&=67108863,i=Math.imul(q,V),n=(n=Math.imul(q,Z))+Math.imul(F,V)|0,a=Math.imul(F,Z),i=i+Math.imul(B,$)|0,n=(n=n+Math.imul(B,X)|0)+Math.imul(T,$)|0,a=a+Math.imul(T,X)|0,i=i+Math.imul(R,Q)|0,n=(n=n+Math.imul(R,ee)|0)+Math.imul(I,Q)|0,a=a+Math.imul(I,ee)|0,i=i+Math.imul(C,re)|0,n=(n=n+Math.imul(C,ie)|0)+Math.imul(K,re)|0,a=a+Math.imul(K,ie)|0,i=i+Math.imul(x,ae)|0,n=(n=n+Math.imul(x,se)|0)+Math.imul(P,ae)|0,a=a+Math.imul(P,se)|0,i=i+Math.imul(A,ce)|0,n=(n=n+Math.imul(A,ue)|0)+Math.imul(S,ce)|0,a=a+Math.imul(S,ue)|0,i=i+Math.imul(v,de)|0,n=(n=n+Math.imul(v,fe)|0)+Math.imul(_,de)|0,a=a+Math.imul(_,fe)|0;var Pe=(u+(i=i+Math.imul(m,pe)|0)|0)+((8191&(n=(n=n+Math.imul(m,ye)|0)+Math.imul(g,pe)|0))<<13)|0;u=((a=a+Math.imul(g,ye)|0)+(n>>>13)|0)+(Pe>>>26)|0,Pe&=67108863,i=Math.imul(q,$),n=(n=Math.imul(q,X))+Math.imul(F,$)|0,a=Math.imul(F,X),i=i+Math.imul(B,Q)|0,n=(n=n+Math.imul(B,ee)|0)+Math.imul(T,Q)|0,a=a+Math.imul(T,ee)|0,i=i+Math.imul(R,re)|0,n=(n=n+Math.imul(R,ie)|0)+Math.imul(I,re)|0,a=a+Math.imul(I,ie)|0,i=i+Math.imul(C,ae)|0,n=(n=n+Math.imul(C,se)|0)+Math.imul(K,ae)|0,a=a+Math.imul(K,se)|0,i=i+Math.imul(x,ce)|0,n=(n=n+Math.imul(x,ue)|0)+Math.imul(P,ce)|0,a=a+Math.imul(P,ue)|0,i=i+Math.imul(A,de)|0,n=(n=n+Math.imul(A,fe)|0)+Math.imul(S,de)|0,a=a+Math.imul(S,fe)|0;var Me=(u+(i=i+Math.imul(v,pe)|0)|0)+((8191&(n=(n=n+Math.imul(v,ye)|0)+Math.imul(_,pe)|0))<<13)|0;u=((a=a+Math.imul(_,ye)|0)+(n>>>13)|0)+(Me>>>26)|0,Me&=67108863,i=Math.imul(q,Q),n=(n=Math.imul(q,ee))+Math.imul(F,Q)|0,a=Math.imul(F,ee),i=i+Math.imul(B,re)|0,n=(n=n+Math.imul(B,ie)|0)+Math.imul(T,re)|0,a=a+Math.imul(T,ie)|0,i=i+Math.imul(R,ae)|0,n=(n=n+Math.imul(R,se)|0)+Math.imul(I,ae)|0,a=a+Math.imul(I,se)|0,i=i+Math.imul(C,ce)|0,n=(n=n+Math.imul(C,ue)|0)+Math.imul(K,ce)|0,a=a+Math.imul(K,ue)|0,i=i+Math.imul(x,de)|0,n=(n=n+Math.imul(x,fe)|0)+Math.imul(P,de)|0,a=a+Math.imul(P,fe)|0;var Ce=(u+(i=i+Math.imul(A,pe)|0)|0)+((8191&(n=(n=n+Math.imul(A,ye)|0)+Math.imul(S,pe)|0))<<13)|0;u=((a=a+Math.imul(S,ye)|0)+(n>>>13)|0)+(Ce>>>26)|0,Ce&=67108863,i=Math.imul(q,re),n=(n=Math.imul(q,ie))+Math.imul(F,re)|0,a=Math.imul(F,ie),i=i+Math.imul(B,ae)|0,n=(n=n+Math.imul(B,se)|0)+Math.imul(T,ae)|0,a=a+Math.imul(T,se)|0,i=i+Math.imul(R,ce)|0,n=(n=n+Math.imul(R,ue)|0)+Math.imul(I,ce)|0,a=a+Math.imul(I,ue)|0,i=i+Math.imul(C,de)|0,n=(n=n+Math.imul(C,fe)|0)+Math.imul(K,de)|0,a=a+Math.imul(K,fe)|0;var Ke=(u+(i=i+Math.imul(x,pe)|0)|0)+((8191&(n=(n=n+Math.imul(x,ye)|0)+Math.imul(P,pe)|0))<<13)|0;u=((a=a+Math.imul(P,ye)|0)+(n>>>13)|0)+(Ke>>>26)|0,Ke&=67108863,i=Math.imul(q,ae),n=(n=Math.imul(q,se))+Math.imul(F,ae)|0,a=Math.imul(F,se),i=i+Math.imul(B,ce)|0,n=(n=n+Math.imul(B,ue)|0)+Math.imul(T,ce)|0,a=a+Math.imul(T,ue)|0,i=i+Math.imul(R,de)|0,n=(n=n+Math.imul(R,fe)|0)+Math.imul(I,de)|0,a=a+Math.imul(I,fe)|0;var De=(u+(i=i+Math.imul(C,pe)|0)|0)+((8191&(n=(n=n+Math.imul(C,ye)|0)+Math.imul(K,pe)|0))<<13)|0;u=((a=a+Math.imul(K,ye)|0)+(n>>>13)|0)+(De>>>26)|0,De&=67108863,i=Math.imul(q,ce),n=(n=Math.imul(q,ue))+Math.imul(F,ce)|0,a=Math.imul(F,ue),i=i+Math.imul(B,de)|0,n=(n=n+Math.imul(B,fe)|0)+Math.imul(T,de)|0,a=a+Math.imul(T,fe)|0;var Re=(u+(i=i+Math.imul(R,pe)|0)|0)+((8191&(n=(n=n+Math.imul(R,ye)|0)+Math.imul(I,pe)|0))<<13)|0;u=((a=a+Math.imul(I,ye)|0)+(n>>>13)|0)+(Re>>>26)|0,Re&=67108863,i=Math.imul(q,de),n=(n=Math.imul(q,fe))+Math.imul(F,de)|0,a=Math.imul(F,fe);var Ie=(u+(i=i+Math.imul(B,pe)|0)|0)+((8191&(n=(n=n+Math.imul(B,ye)|0)+Math.imul(T,pe)|0))<<13)|0;u=((a=a+Math.imul(T,ye)|0)+(n>>>13)|0)+(Ie>>>26)|0,Ie&=67108863;var Ue=(u+(i=Math.imul(q,pe))|0)+((8191&(n=(n=Math.imul(q,ye))+Math.imul(F,pe)|0))<<13)|0;return u=((a=Math.imul(F,ye))+(n>>>13)|0)+(Ue>>>26)|0,Ue&=67108863,c[0]=be,c[1]=me,c[2]=ge,c[3]=we,c[4]=ve,c[5]=_e,c[6]=ke,c[7]=Ae,c[8]=Se,c[9]=Ee,c[10]=xe,c[11]=Pe,c[12]=Me,c[13]=Ce,c[14]=Ke,c[15]=De,c[16]=Re,c[17]=Ie,c[18]=Ue,0!==u&&(c[19]=u,r.length++),r};function l(e,t,r){return (new p).mulp(e,t,r)}function p(e,t){this.x=e,this.y=t;}Math.imul||(f=d),n.prototype.mulTo=function(e,t){var r=this.length+e.length;return 10===this.length&&10===e.length?f(this,e,t):r<63?d(this,e,t):r<1024?function(e,t,r){r.negative=t.negative^e.negative,r.length=e.length+t.length;for(var i=0,n=0,a=0;a<r.length-1;a++){var s=n;n=0;for(var o=67108863&i,c=Math.min(a,t.length-1),u=Math.max(0,a-e.length+1);u<=c;u++){var h=a-u,d=(0|e.words[h])*(0|t.words[u]),f=67108863&d;o=67108863&(f=f+o|0),n+=(s=(s=s+(d/67108864|0)|0)+(f>>>26)|0)>>>26,s&=67108863;}r.words[a]=o,i=s,s=n;}return 0!==i?r.words[a]=i:r.length--,r.strip()}(this,e,t):l(this,e,t)},p.prototype.makeRBT=function(e){for(var t=Array(e),r=n.prototype._countBits(e)-1,i=0;i<e;i++)t[i]=this.revBin(i,r,e);return t},p.prototype.revBin=function(e,t,r){if(0===e||e===r-1)return e;for(var i=0,n=0;n<t;n++)i|=(1&e)<<t-n-1,e>>=1;return i},p.prototype.permute=function(e,t,r,i,n,a){for(var s=0;s<a;s++)i[s]=t[e[s]],n[s]=r[e[s]];},p.prototype.transform=function(e,t,r,i,n,a){this.permute(a,e,t,r,i,n);for(var s=1;s<n;s<<=1)for(var o=s<<1,c=Math.cos(2*Math.PI/o),u=Math.sin(2*Math.PI/o),h=0;h<n;h+=o)for(var d=c,f=u,l=0;l<s;l++){var p=r[h+l],y=i[h+l],b=r[h+l+s],m=i[h+l+s],g=d*b-f*m;m=d*m+f*b,b=g,r[h+l]=p+b,i[h+l]=y+m,r[h+l+s]=p-b,i[h+l+s]=y-m,l!==o&&(g=c*d-u*f,f=c*f+u*d,d=g);}},p.prototype.guessLen13b=function(e,t){var r=1|Math.max(t,e),i=1&r,n=0;for(r=r/2|0;r;r>>>=1)n++;return 1<<n+1+i},p.prototype.conjugate=function(e,t,r){if(!(r<=1))for(var i=0;i<r/2;i++){var n=e[i];e[i]=e[r-i-1],e[r-i-1]=n,n=t[i],t[i]=-t[r-i-1],t[r-i-1]=-n;}},p.prototype.normalize13b=function(e,t){for(var r=0,i=0;i<t/2;i++){var n=8192*Math.round(e[2*i+1]/t)+Math.round(e[2*i]/t)+r;e[i]=67108863&n,r=n<67108864?0:n/67108864|0;}return e},p.prototype.convert13b=function(e,t,i,n){for(var a=0,s=0;s<t;s++)a+=0|e[s],i[2*s]=8191&a,a>>>=13,i[2*s+1]=8191&a,a>>>=13;for(s=2*t;s<n;++s)i[s]=0;r(0===a),r(0==(-8192&a));},p.prototype.stub=function(e){for(var t=Array(e),r=0;r<e;r++)t[r]=0;return t},p.prototype.mulp=function(e,t,r){var i=2*this.guessLen13b(e.length,t.length),n=this.makeRBT(i),a=this.stub(i),s=Array(i),o=Array(i),c=Array(i),u=Array(i),h=Array(i),d=Array(i),f=r.words;f.length=i,this.convert13b(e.words,e.length,s,i),this.convert13b(t.words,t.length,u,i),this.transform(s,a,o,c,i,n),this.transform(u,a,h,d,i,n);for(var l=0;l<i;l++){var p=o[l]*h[l]-c[l]*d[l];c[l]=o[l]*d[l]+c[l]*h[l],o[l]=p;}return this.conjugate(o,c,i),this.transform(o,c,f,a,i,n),this.conjugate(f,a,i),this.normalize13b(f,i),r.negative=e.negative^t.negative,r.length=e.length+t.length,r.strip()},n.prototype.mul=function(e){var t=new n(null);return t.words=Array(this.length+e.length),this.mulTo(e,t)},n.prototype.mulf=function(e){var t=new n(null);return t.words=Array(this.length+e.length),l(this,e,t)},n.prototype.imul=function(e){return this.clone().mulTo(e,this)},n.prototype.imuln=function(e){r("number"==typeof e),r(e<67108864);for(var t=0,i=0;i<this.length;i++){var n=(0|this.words[i])*e,a=(67108863&n)+(67108863&t);t>>=26,t+=n/67108864|0,t+=a>>>26,this.words[i]=67108863&a;}return 0!==t&&(this.words[i]=t,this.length++),this},n.prototype.muln=function(e){return this.clone().imuln(e)},n.prototype.sqr=function(){return this.mul(this)},n.prototype.isqr=function(){return this.imul(this.clone())},n.prototype.pow=function(e){var t=function(e){for(var t=Array(e.bitLength()),r=0;r<t.length;r++){var i=r/26|0,n=r%26;t[r]=(e.words[i]&1<<n)>>>n;}return t}(e);if(0===t.length)return new n(1);for(var r=this,i=0;i<t.length&&0===t[i];i++,r=r.sqr());if(++i<t.length)for(var a=r.sqr();i<t.length;i++,a=a.sqr())0!==t[i]&&(r=r.mul(a));return r},n.prototype.iushln=function(e){r("number"==typeof e&&e>=0);var t,i=e%26,n=(e-i)/26,a=67108863>>>26-i<<26-i;if(0!==i){var s=0;for(t=0;t<this.length;t++){var o=this.words[t]&a,c=(0|this.words[t])-o<<i;this.words[t]=c|s,s=o>>>26-i;}s&&(this.words[t]=s,this.length++);}if(0!==n){for(t=this.length-1;t>=0;t--)this.words[t+n]=this.words[t];for(t=0;t<n;t++)this.words[t]=0;this.length+=n;}return this.strip()},n.prototype.ishln=function(e){return r(0===this.negative),this.iushln(e)},n.prototype.iushrn=function(e,t,i){var n;r("number"==typeof e&&e>=0),n=t?(t-t%26)/26:0;var a=e%26,s=Math.min((e-a)/26,this.length),o=67108863^67108863>>>a<<a,c=i;if(n=Math.max(0,n-=s),c){for(var u=0;u<s;u++)c.words[u]=this.words[u];c.length=s;}if(0===s);else if(this.length>s)for(this.length-=s,u=0;u<this.length;u++)this.words[u]=this.words[u+s];else this.words[0]=0,this.length=1;var h=0;for(u=this.length-1;u>=0&&(0!==h||u>=n);u--){var d=0|this.words[u];this.words[u]=h<<26-a|d>>>a,h=d&o;}return c&&0!==h&&(c.words[c.length++]=h),0===this.length&&(this.words[0]=0,this.length=1),this.strip()},n.prototype.ishrn=function(e,t,i){return r(0===this.negative),this.iushrn(e,t,i)},n.prototype.shln=function(e){return this.clone().ishln(e)},n.prototype.ushln=function(e){return this.clone().iushln(e)},n.prototype.shrn=function(e){return this.clone().ishrn(e)},n.prototype.ushrn=function(e){return this.clone().iushrn(e)},n.prototype.testn=function(e){r("number"==typeof e&&e>=0);var t=e%26,i=(e-t)/26,n=1<<t;return !(this.length<=i)&&!!(this.words[i]&n)},n.prototype.imaskn=function(e){r("number"==typeof e&&e>=0);var t=e%26,i=(e-t)/26;if(r(0===this.negative,"imaskn works only with positive numbers"),this.length<=i)return this;if(0!==t&&i++,this.length=Math.min(i,this.length),0!==t){var n=67108863^67108863>>>t<<t;this.words[this.length-1]&=n;}return this.strip()},n.prototype.maskn=function(e){return this.clone().imaskn(e)},n.prototype.iaddn=function(e){return r("number"==typeof e),r(e<67108864),e<0?this.isubn(-e):0!==this.negative?1===this.length&&(0|this.words[0])<e?(this.words[0]=e-(0|this.words[0]),this.negative=0,this):(this.negative=0,this.isubn(e),this.negative=1,this):this._iaddn(e)},n.prototype._iaddn=function(e){this.words[0]+=e;for(var t=0;t<this.length&&this.words[t]>=67108864;t++)this.words[t]-=67108864,t===this.length-1?this.words[t+1]=1:this.words[t+1]++;return this.length=Math.max(this.length,t+1),this},n.prototype.isubn=function(e){if(r("number"==typeof e),r(e<67108864),e<0)return this.iaddn(-e);if(0!==this.negative)return this.negative=0,this.iaddn(e),this.negative=1,this;if(this.words[0]-=e,1===this.length&&this.words[0]<0)this.words[0]=-this.words[0],this.negative=1;else for(var t=0;t<this.length&&this.words[t]<0;t++)this.words[t]+=67108864,this.words[t+1]-=1;return this.strip()},n.prototype.addn=function(e){return this.clone().iaddn(e)},n.prototype.subn=function(e){return this.clone().isubn(e)},n.prototype.iabs=function(){return this.negative=0,this},n.prototype.abs=function(){return this.clone().iabs()},n.prototype._ishlnsubmul=function(e,t,i){var n,a,s=e.length+i;this._expand(s);var o=0;for(n=0;n<e.length;n++){a=(0|this.words[n+i])+o;var c=(0|e.words[n])*t;o=((a-=67108863&c)>>26)-(c/67108864|0),this.words[n+i]=67108863&a;}for(;n<this.length-i;n++)o=(a=(0|this.words[n+i])+o)>>26,this.words[n+i]=67108863&a;if(0===o)return this.strip();for(r(-1===o),o=0,n=0;n<this.length;n++)o=(a=-(0|this.words[n])+o)>>26,this.words[n]=67108863&a;return this.negative=1,this.strip()},n.prototype._wordDiv=function(e,t){var r=(this.length,e.length),i=this.clone(),a=e,s=0|a.words[a.length-1];0!==(r=26-this._countBits(s))&&(a=a.ushln(r),i.iushln(r),s=0|a.words[a.length-1]);var o,c=i.length-a.length;if("mod"!==t){(o=new n(null)).length=c+1,o.words=Array(o.length);for(var u=0;u<o.length;u++)o.words[u]=0;}var h=i.clone()._ishlnsubmul(a,1,c);0===h.negative&&(i=h,o&&(o.words[c]=1));for(var d=c-1;d>=0;d--){var f=67108864*(0|i.words[a.length+d])+(0|i.words[a.length+d-1]);for(f=Math.min(f/s|0,67108863),i._ishlnsubmul(a,f,d);0!==i.negative;)f--,i.negative=0,i._ishlnsubmul(a,1,d),i.isZero()||(i.negative^=1);o&&(o.words[d]=f);}return o&&o.strip(),i.strip(),"div"!==t&&0!==r&&i.iushrn(r),{div:o||null,mod:i}},n.prototype.divmod=function(e,t,i){return r(!e.isZero()),this.isZero()?{div:new n(0),mod:new n(0)}:0!==this.negative&&0===e.negative?(o=this.neg().divmod(e,t),"mod"!==t&&(a=o.div.neg()),"div"!==t&&(s=o.mod.neg(),i&&0!==s.negative&&s.iadd(e)),{div:a,mod:s}):0===this.negative&&0!==e.negative?(o=this.divmod(e.neg(),t),"mod"!==t&&(a=o.div.neg()),{div:a,mod:o.mod}):0!=(this.negative&e.negative)?(o=this.neg().divmod(e.neg(),t),"div"!==t&&(s=o.mod.neg(),i&&0!==s.negative&&s.isub(e)),{div:o.div,mod:s}):e.length>this.length||this.cmp(e)<0?{div:new n(0),mod:this}:1===e.length?"div"===t?{div:this.divn(e.words[0]),mod:null}:"mod"===t?{div:null,mod:new n(this.modn(e.words[0]))}:{div:this.divn(e.words[0]),mod:new n(this.modn(e.words[0]))}:this._wordDiv(e,t);var a,s,o;},n.prototype.div=function(e){return this.divmod(e,"div",!1).div},n.prototype.mod=function(e){return this.divmod(e,"mod",!1).mod},n.prototype.umod=function(e){return this.divmod(e,"mod",!0).mod},n.prototype.divRound=function(e){var t=this.divmod(e);if(t.mod.isZero())return t.div;var r=0!==t.div.negative?t.mod.isub(e):t.mod,i=e.ushrn(1),n=e.andln(1),a=r.cmp(i);return a<0||1===n&&0===a?t.div:0!==t.div.negative?t.div.isubn(1):t.div.iaddn(1)},n.prototype.modn=function(e){r(e<=67108863);for(var t=(1<<26)%e,i=0,n=this.length-1;n>=0;n--)i=(t*i+(0|this.words[n]))%e;return i},n.prototype.idivn=function(e){r(e<=67108863);for(var t=0,i=this.length-1;i>=0;i--){var n=(0|this.words[i])+67108864*t;this.words[i]=n/e|0,t=n%e;}return this.strip()},n.prototype.divn=function(e){return this.clone().idivn(e)},n.prototype.egcd=function(e){r(0===e.negative),r(!e.isZero());var t=this,i=e.clone();t=0!==t.negative?t.umod(e):t.clone();for(var a=new n(1),s=new n(0),o=new n(0),c=new n(1),u=0;t.isEven()&&i.isEven();)t.iushrn(1),i.iushrn(1),++u;for(var h=i.clone(),d=t.clone();!t.isZero();){for(var f=0,l=1;0==(t.words[0]&l)&&f<26;++f,l<<=1);if(f>0)for(t.iushrn(f);f-- >0;)(a.isOdd()||s.isOdd())&&(a.iadd(h),s.isub(d)),a.iushrn(1),s.iushrn(1);for(var p=0,y=1;0==(i.words[0]&y)&&p<26;++p,y<<=1);if(p>0)for(i.iushrn(p);p-- >0;)(o.isOdd()||c.isOdd())&&(o.iadd(h),c.isub(d)),o.iushrn(1),c.iushrn(1);t.cmp(i)>=0?(t.isub(i),a.isub(o),s.isub(c)):(i.isub(t),o.isub(a),c.isub(s));}return {a:o,b:c,gcd:i.iushln(u)}},n.prototype._invmp=function(e){r(0===e.negative),r(!e.isZero());var t=this,i=e.clone();t=0!==t.negative?t.umod(e):t.clone();for(var a,s=new n(1),o=new n(0),c=i.clone();t.cmpn(1)>0&&i.cmpn(1)>0;){for(var u=0,h=1;0==(t.words[0]&h)&&u<26;++u,h<<=1);if(u>0)for(t.iushrn(u);u-- >0;)s.isOdd()&&s.iadd(c),s.iushrn(1);for(var d=0,f=1;0==(i.words[0]&f)&&d<26;++d,f<<=1);if(d>0)for(i.iushrn(d);d-- >0;)o.isOdd()&&o.iadd(c),o.iushrn(1);t.cmp(i)>=0?(t.isub(i),s.isub(o)):(i.isub(t),o.isub(s));}return (a=0===t.cmpn(1)?s:o).cmpn(0)<0&&a.iadd(e),a},n.prototype.gcd=function(e){if(this.isZero())return e.abs();if(e.isZero())return this.abs();var t=this.clone(),r=e.clone();t.negative=0,r.negative=0;for(var i=0;t.isEven()&&r.isEven();i++)t.iushrn(1),r.iushrn(1);for(;;){for(;t.isEven();)t.iushrn(1);for(;r.isEven();)r.iushrn(1);var n=t.cmp(r);if(n<0){var a=t;t=r,r=a;}else if(0===n||0===r.cmpn(1))break;t.isub(r);}return r.iushln(i)},n.prototype.invm=function(e){return this.egcd(e).a.umod(e)},n.prototype.isEven=function(){return 0==(1&this.words[0])},n.prototype.isOdd=function(){return 1==(1&this.words[0])},n.prototype.andln=function(e){return this.words[0]&e},n.prototype.bincn=function(e){r("number"==typeof e);var t=e%26,i=(e-t)/26,n=1<<t;if(this.length<=i)return this._expand(i+1),this.words[i]|=n,this;for(var a=n,s=i;0!==a&&s<this.length;s++){var o=0|this.words[s];a=(o+=a)>>>26,o&=67108863,this.words[s]=o;}return 0!==a&&(this.words[s]=a,this.length++),this},n.prototype.isZero=function(){return 1===this.length&&0===this.words[0]},n.prototype.cmpn=function(e){var t,i=e<0;if(0!==this.negative&&!i)return -1;if(0===this.negative&&i)return 1;if(this.strip(),this.length>1)t=1;else {i&&(e=-e),r(e<=67108863,"Number is too big");var n=0|this.words[0];t=n===e?0:n<e?-1:1;}return 0!==this.negative?0|-t:t},n.prototype.cmp=function(e){if(0!==this.negative&&0===e.negative)return -1;if(0===this.negative&&0!==e.negative)return 1;var t=this.ucmp(e);return 0!==this.negative?0|-t:t},n.prototype.ucmp=function(e){if(this.length>e.length)return 1;if(this.length<e.length)return -1;for(var t=0,r=this.length-1;r>=0;r--){var i=0|this.words[r],n=0|e.words[r];if(i!==n){i<n?t=-1:i>n&&(t=1);break}}return t},n.prototype.gtn=function(e){return 1===this.cmpn(e)},n.prototype.gt=function(e){return 1===this.cmp(e)},n.prototype.gten=function(e){return this.cmpn(e)>=0},n.prototype.gte=function(e){return this.cmp(e)>=0},n.prototype.ltn=function(e){return -1===this.cmpn(e)},n.prototype.lt=function(e){return -1===this.cmp(e)},n.prototype.lten=function(e){return this.cmpn(e)<=0},n.prototype.lte=function(e){return this.cmp(e)<=0},n.prototype.eqn=function(e){return 0===this.cmpn(e)},n.prototype.eq=function(e){return 0===this.cmp(e)},n.red=function(e){return new _(e)},n.prototype.toRed=function(e){return r(!this.red,"Already a number in reduction context"),r(0===this.negative,"red works only with positives"),e.convertTo(this)._forceRed(e)},n.prototype.fromRed=function(){return r(this.red,"fromRed works only with numbers in reduction context"),this.red.convertFrom(this)},n.prototype._forceRed=function(e){return this.red=e,this},n.prototype.forceRed=function(e){return r(!this.red,"Already a number in reduction context"),this._forceRed(e)},n.prototype.redAdd=function(e){return r(this.red,"redAdd works only with red numbers"),this.red.add(this,e)},n.prototype.redIAdd=function(e){return r(this.red,"redIAdd works only with red numbers"),this.red.iadd(this,e)},n.prototype.redSub=function(e){return r(this.red,"redSub works only with red numbers"),this.red.sub(this,e)},n.prototype.redISub=function(e){return r(this.red,"redISub works only with red numbers"),this.red.isub(this,e)},n.prototype.redShl=function(e){return r(this.red,"redShl works only with red numbers"),this.red.shl(this,e)},n.prototype.redMul=function(e){return r(this.red,"redMul works only with red numbers"),this.red._verify2(this,e),this.red.mul(this,e)},n.prototype.redIMul=function(e){return r(this.red,"redMul works only with red numbers"),this.red._verify2(this,e),this.red.imul(this,e)},n.prototype.redSqr=function(){return r(this.red,"redSqr works only with red numbers"),this.red._verify1(this),this.red.sqr(this)},n.prototype.redISqr=function(){return r(this.red,"redISqr works only with red numbers"),this.red._verify1(this),this.red.isqr(this)},n.prototype.redSqrt=function(){return r(this.red,"redSqrt works only with red numbers"),this.red._verify1(this),this.red.sqrt(this)},n.prototype.redInvm=function(){return r(this.red,"redInvm works only with red numbers"),this.red._verify1(this),this.red.invm(this)},n.prototype.redNeg=function(){return r(this.red,"redNeg works only with red numbers"),this.red._verify1(this),this.red.neg(this)},n.prototype.redPow=function(e){return r(this.red&&!e.red,"redPow(normalNum)"),this.red._verify1(this),this.red.pow(this,e)};var y={k256:null,p224:null,p192:null,p25519:null};function b(e,t){this.name=e,this.p=new n(t,16),this.n=this.p.bitLength(),this.k=new n(1).iushln(this.n).isub(this.p),this.tmp=this._tmp();}function m(){b.call(this,"k256","ffffffff ffffffff ffffffff ffffffff ffffffff ffffffff fffffffe fffffc2f");}function g(){b.call(this,"p224","ffffffff ffffffff ffffffff ffffffff 00000000 00000000 00000001");}function w(){b.call(this,"p192","ffffffff ffffffff ffffffff fffffffe ffffffff ffffffff");}function v(){b.call(this,"25519","7fffffffffffffff ffffffffffffffff ffffffffffffffff ffffffffffffffed");}function _(e){if("string"==typeof e){var t=n._prime(e);this.m=t.p,this.prime=t;}else r(e.gtn(1),"modulus must be greater than 1"),this.m=e,this.prime=null;}function k(e){_.call(this,e),this.shift=this.m.bitLength(),this.shift%26!=0&&(this.shift+=26-this.shift%26),this.r=new n(1).iushln(this.shift),this.r2=this.imod(this.r.sqr()),this.rinv=this.r._invmp(this.m),this.minv=this.rinv.mul(this.r).isubn(1).div(this.m),this.minv=this.minv.umod(this.r),this.minv=this.r.sub(this.minv);}b.prototype._tmp=function(){var e=new n(null);return e.words=Array(Math.ceil(this.n/13)),e},b.prototype.ireduce=function(e){var t,r=e;do{this.split(r,this.tmp),t=(r=(r=this.imulK(r)).iadd(this.tmp)).bitLength();}while(t>this.n);var i=t<this.n?-1:r.ucmp(this.p);return 0===i?(r.words[0]=0,r.length=1):i>0?r.isub(this.p):r.strip(),r},b.prototype.split=function(e,t){e.iushrn(this.n,0,t);},b.prototype.imulK=function(e){return e.imul(this.k)},i(m,b),m.prototype.split=function(e,t){for(var r=Math.min(e.length,9),i=0;i<r;i++)t.words[i]=e.words[i];if(t.length=r,e.length<=9)return e.words[0]=0,void(e.length=1);var n=e.words[9];for(t.words[t.length++]=4194303&n,i=10;i<e.length;i++){var a=0|e.words[i];e.words[i-10]=(4194303&a)<<4|n>>>22,n=a;}n>>>=22,e.words[i-10]=n,0===n&&e.length>10?e.length-=10:e.length-=9;},m.prototype.imulK=function(e){e.words[e.length]=0,e.words[e.length+1]=0,e.length+=2;for(var t=0,r=0;r<e.length;r++){var i=0|e.words[r];t+=977*i,e.words[r]=67108863&t,t=64*i+(t/67108864|0);}return 0===e.words[e.length-1]&&(e.length--,0===e.words[e.length-1]&&e.length--),e},i(g,b),i(w,b),i(v,b),v.prototype.imulK=function(e){for(var t=0,r=0;r<e.length;r++){var i=19*(0|e.words[r])+t,n=67108863&i;i>>>=26,e.words[r]=n,t=i;}return 0!==t&&(e.words[e.length++]=t),e},n._prime=function(e){if(y[e])return y[e];var t;if("k256"===e)t=new m;else if("p224"===e)t=new g;else if("p192"===e)t=new w;else {if("p25519"!==e)throw Error("Unknown prime "+e);t=new v;}return y[e]=t,t},_.prototype._verify1=function(e){r(0===e.negative,"red works only with positives"),r(e.red,"red works only with red numbers");},_.prototype._verify2=function(e,t){r(0==(e.negative|t.negative),"red works only with positives"),r(e.red&&e.red===t.red,"red works only with red numbers");},_.prototype.imod=function(e){return this.prime?this.prime.ireduce(e)._forceRed(this):e.umod(this.m)._forceRed(this)},_.prototype.neg=function(e){return e.isZero()?e.clone():this.m.sub(e)._forceRed(this)},_.prototype.add=function(e,t){this._verify2(e,t);var r=e.add(t);return r.cmp(this.m)>=0&&r.isub(this.m),r._forceRed(this)},_.prototype.iadd=function(e,t){this._verify2(e,t);var r=e.iadd(t);return r.cmp(this.m)>=0&&r.isub(this.m),r},_.prototype.sub=function(e,t){this._verify2(e,t);var r=e.sub(t);return r.cmpn(0)<0&&r.iadd(this.m),r._forceRed(this)},_.prototype.isub=function(e,t){this._verify2(e,t);var r=e.isub(t);return r.cmpn(0)<0&&r.iadd(this.m),r},_.prototype.shl=function(e,t){return this._verify1(e),this.imod(e.ushln(t))},_.prototype.imul=function(e,t){return this._verify2(e,t),this.imod(e.imul(t))},_.prototype.mul=function(e,t){return this._verify2(e,t),this.imod(e.mul(t))},_.prototype.isqr=function(e){return this.imul(e,e.clone())},_.prototype.sqr=function(e){return this.mul(e,e)},_.prototype.sqrt=function(e){if(e.isZero())return e.clone();var t=this.m.andln(3);if(r(t%2==1),3===t){var i=this.m.add(new n(1)).iushrn(2);return this.pow(e,i)}for(var a=this.m.subn(1),s=0;!a.isZero()&&0===a.andln(1);)s++,a.iushrn(1);r(!a.isZero());var o=new n(1).toRed(this),c=o.redNeg(),u=this.m.subn(1).iushrn(1),h=this.m.bitLength();for(h=new n(2*h*h).toRed(this);0!==this.pow(h,u).cmp(c);)h.redIAdd(c);for(var d=this.pow(h,a),f=this.pow(e,a.addn(1).iushrn(1)),l=this.pow(e,a),p=s;0!==l.cmp(o);){for(var y=l,b=0;0!==y.cmp(o);b++)y=y.redSqr();r(b<p);var m=this.pow(d,new n(1).iushln(p-b-1));f=f.redMul(m),d=m.redSqr(),l=l.redMul(d),p=b;}return f},_.prototype.invm=function(e){var t=e._invmp(this.m);return 0!==t.negative?(t.negative=0,this.imod(t).redNeg()):this.imod(t)},_.prototype.pow=function(e,t){if(t.isZero())return new n(1).toRed(this);if(0===t.cmpn(1))return e.clone();var r=Array(16);r[0]=new n(1).toRed(this),r[1]=e;for(var i=2;i<r.length;i++)r[i]=this.mul(r[i-1],e);var a=r[0],s=0,o=0,c=t.bitLength()%26;for(0===c&&(c=26),i=t.length-1;i>=0;i--){for(var u=t.words[i],h=c-1;h>=0;h--){var d=u>>h&1;a!==r[0]&&(a=this.sqr(a)),0!==d||0!==s?(s<<=1,s|=d,(4===++o||0===i&&0===h)&&(a=this.mul(a,r[s]),o=0,s=0)):o=0;}c=26;}return a},_.prototype.convertTo=function(e){var t=e.umod(this.m);return t===e?t.clone():t},_.prototype.convertFrom=function(e){var t=e.clone();return t.red=null,t},n.mont=function(e){return new k(e)},i(k,_),k.prototype.convertTo=function(e){return this.imod(e.ushln(this.shift))},k.prototype.convertFrom=function(e){var t=this.imod(e.mul(this.rinv));return t.red=null,t},k.prototype.imul=function(e,t){if(e.isZero()||t.isZero())return e.words[0]=0,e.length=1,e;var r=e.imul(t),i=r.maskn(this.shift).mul(this.minv).imaskn(this.shift).mul(this.m),n=r.isub(i).iushrn(this.shift),a=n;return n.cmp(this.m)>=0?a=n.isub(this.m):n.cmpn(0)<0&&(a=n.iadd(this.m)),a._forceRed(this)},k.prototype.mul=function(e,t){if(e.isZero()||t.isZero())return new n(0)._forceRed(this);var r=e.mul(t),i=r.maskn(this.shift).mul(this.minv).imaskn(this.shift).mul(this.m),a=r.isub(i).iushrn(this.shift),s=a;return a.cmp(this.m)>=0?s=a.isub(this.m):a.cmpn(0)<0&&(s=a.iadd(this.m)),s._forceRed(this)},k.prototype.invm=function(e){return this.imod(e._invmp(this.m).mul(this.r2))._forceRed(this)};}(e,tt);})),Wd=/*#__PURE__*/Object.freeze({__proto__:null,default:jd,__moduleExports:jd});class Hd{constructor(e){if(void 0===e)throw Error("Invalid BigInteger input");this.value=new jd(e);}clone(){const e=new Hd(null);return this.value.copy(e.value),e}iinc(){return this.value.iadd(new jd(1)),this}inc(){return this.clone().iinc()}idec(){return this.value.isub(new jd(1)),this}dec(){return this.clone().idec()}iadd(e){return this.value.iadd(e.value),this}add(e){return this.clone().iadd(e)}isub(e){return this.value.isub(e.value),this}sub(e){return this.clone().isub(e)}imul(e){return this.value.imul(e.value),this}mul(e){return this.clone().imul(e)}imod(e){return this.value=this.value.umod(e.value),this}mod(e){return this.clone().imod(e)}modExp(e,t){const r=t.isEven()?jd.red(t.value):jd.mont(t.value),i=this.clone();return i.value=i.value.toRed(r).redPow(e.value).fromRed(),i}modInv(e){if(!this.gcd(e).isOne())throw Error("Inverse does not exist");return new Hd(this.value.invm(e.value))}gcd(e){return new Hd(this.value.gcd(e.value))}ileftShift(e){return this.value.ishln(e.value.toNumber()),this}leftShift(e){return this.clone().ileftShift(e)}irightShift(e){return this.value.ishrn(e.value.toNumber()),this}rightShift(e){return this.clone().irightShift(e)}equal(e){return this.value.eq(e.value)}lt(e){return this.value.lt(e.value)}lte(e){return this.value.lte(e.value)}gt(e){return this.value.gt(e.value)}gte(e){return this.value.gte(e.value)}isZero(){return this.value.isZero()}isOne(){return this.value.eq(new jd(1))}isNegative(){return this.value.isNeg()}isEven(){return this.value.isEven()}abs(){const e=this.clone();return e.value=e.value.abs(),e}toString(){return this.value.toString()}toNumber(){return this.value.toNumber()}getBit(e){return this.value.testn(e)?1:0}bitLength(){return this.value.bitLength()}byteLength(){return this.value.byteLength()}toUint8Array(e="be",t){return this.value.toArrayLike(Uint8Array,e,t)}}var Gd,Vd=/*#__PURE__*/Object.freeze({__proto__:null,default:Hd}),Zd=rt((function(e,t){var r=t;function i(e){return 1===e.length?"0"+e:e}function n(e){for(var t="",r=0;r<e.length;r++)t+=i(e[r].toString(16));return t}r.toArray=function(e,t){if(Array.isArray(e))return e.slice();if(!e)return [];var r=[];if("string"!=typeof e){for(var i=0;i<e.length;i++)r[i]=0|e[i];return r}if("hex"===t){(e=e.replace(/[^a-z0-9]+/gi,"")).length%2!=0&&(e="0"+e);for(i=0;i<e.length;i+=2)r.push(parseInt(e[i]+e[i+1],16));}else for(i=0;i<e.length;i++){var n=e.charCodeAt(i),a=n>>8,s=255&n;a?r.push(a,s):r.push(s);}return r},r.zero2=i,r.toHex=n,r.encode=function(e,t){return "hex"===t?n(e):e};})),Yd=rt((function(e,t){var r=t;r.assert=Qe,r.toArray=Zd.toArray,r.zero2=Zd.zero2,r.toHex=Zd.toHex,r.encode=Zd.encode,r.getNAF=function(e,t){for(var r=[],i=1<<t+1,n=e.clone();n.cmpn(1)>=0;){var a;if(n.isOdd()){var s=n.andln(i-1);a=s>(i>>1)-1?(i>>1)-s:s,n.isubn(a);}else a=0;r.push(a);for(var o=0!==n.cmpn(0)&&0===n.andln(i-1)?t+1:1,c=1;c<o;c++)r.push(0);n.iushrn(o);}return r},r.getJSF=function(e,t){var r=[[],[]];e=e.clone(),t=t.clone();for(var i=0,n=0;e.cmpn(-i)>0||t.cmpn(-n)>0;){var a,s,o,c=e.andln(3)+i&3,u=t.andln(3)+n&3;if(3===c&&(c=-1),3===u&&(u=-1),0==(1&c))a=0;else a=3!==(o=e.andln(7)+i&7)&&5!==o||2!==u?c:-c;if(r[0].push(a),0==(1&u))s=0;else s=3!==(o=t.andln(7)+n&7)&&5!==o||2!==c?u:-u;r[1].push(s),2*i===a+1&&(i=1-i),2*n===s+1&&(n=1-n),e.iushrn(1),t.iushrn(1);}return r},r.cachedProperty=function(e,t,r){var i="_"+t;e.prototype[t]=function(){return void 0!==this[i]?this[i]:this[i]=r.call(this)};},r.parseBytes=function(e){return "string"==typeof e?r.toArray(e,"hex"):e},r.intFromLE=function(e){return new jd(e,"hex","le")};})),$d=function(e){return Gd||(Gd=new Xd(null)),Gd.generate(e)};function Xd(e){this.rand=e;}var Jd=Xd;if(Xd.prototype.generate=function(e){return this._rand(e)},Xd.prototype._rand=function(e){if(this.rand.getBytes)return this.rand.getBytes(e);for(var t=new Uint8Array(e),r=0;r<t.length;r++)t[r]=this.rand.getByte();return t},"object"==typeof self)self.crypto&&self.crypto.getRandomValues?Xd.prototype._rand=function(e){var t=new Uint8Array(e);return self.crypto.getRandomValues(t),t}:self.msCrypto&&self.msCrypto.getRandomValues?Xd.prototype._rand=function(e){var t=new Uint8Array(e);return self.msCrypto.getRandomValues(t),t}:"object"==typeof window&&(Xd.prototype._rand=function(){throw Error("Not implemented yet")});else try{if("function"!=typeof(void 0).randomBytes)throw Error("Not supported");Xd.prototype._rand=function(e){return (void 0).randomBytes(e)};}catch(e){}$d.Rand=Jd;var Qd=Yd.getNAF,ef=Yd.getJSF,tf=Yd.assert;function rf(e,t){this.type=e,this.p=new jd(t.p,16),this.red=t.prime?jd.red(t.prime):jd.mont(this.p),this.zero=new jd(0).toRed(this.red),this.one=new jd(1).toRed(this.red),this.two=new jd(2).toRed(this.red),this.n=t.n&&new jd(t.n,16),this.g=t.g&&this.pointFromJSON(t.g,t.gRed),this._wnafT1=[,,,,],this._wnafT2=[,,,,],this._wnafT3=[,,,,],this._wnafT4=[,,,,];var r=this.n&&this.p.div(this.n);!r||r.cmpn(100)>0?this.redN=null:(this._maxwellTrick=!0,this.redN=this.n.toRed(this.red));}var nf=rf;function af(e,t){this.curve=e,this.type=t,this.precomputed=null;}rf.prototype.point=function(){throw Error("Not implemented")},rf.prototype.validate=function(){throw Error("Not implemented")},rf.prototype._fixedNafMul=function(e,t){tf(e.precomputed);var r=e._getDoubles(),i=Qd(t,1),n=(1<<r.step+1)-(r.step%2==0?2:1);n/=3;for(var a=[],s=0;s<i.length;s+=r.step){var o=0;for(t=s+r.step-1;t>=s;t--)o=(o<<1)+i[t];a.push(o);}for(var c=this.jpoint(null,null,null),u=this.jpoint(null,null,null),h=n;h>0;h--){for(s=0;s<a.length;s++){(o=a[s])===h?u=u.mixedAdd(r.points[s]):o===-h&&(u=u.mixedAdd(r.points[s].neg()));}c=c.add(u);}return c.toP()},rf.prototype._wnafMul=function(e,t){var r=4,i=e._getNAFPoints(r);r=i.wnd;for(var n=i.points,a=Qd(t,r),s=this.jpoint(null,null,null),o=a.length-1;o>=0;o--){for(t=0;o>=0&&0===a[o];o--)t++;if(o>=0&&t++,s=s.dblp(t),o<0)break;var c=a[o];tf(0!==c),s="affine"===e.type?c>0?s.mixedAdd(n[c-1>>1]):s.mixedAdd(n[-c-1>>1].neg()):c>0?s.add(n[c-1>>1]):s.add(n[-c-1>>1].neg());}return "affine"===e.type?s.toP():s},rf.prototype._wnafMulAdd=function(e,t,r,i,n){for(var a=this._wnafT1,s=this._wnafT2,o=this._wnafT3,c=0,u=0;u<i;u++){var h=(A=t[u])._getNAFPoints(e);a[u]=h.wnd,s[u]=h.points;}for(u=i-1;u>=1;u-=2){var d=u-1,f=u;if(1===a[d]&&1===a[f]){var l=[t[d],null,null,t[f]];0===t[d].y.cmp(t[f].y)?(l[1]=t[d].add(t[f]),l[2]=t[d].toJ().mixedAdd(t[f].neg())):0===t[d].y.cmp(t[f].y.redNeg())?(l[1]=t[d].toJ().mixedAdd(t[f]),l[2]=t[d].add(t[f].neg())):(l[1]=t[d].toJ().mixedAdd(t[f]),l[2]=t[d].toJ().mixedAdd(t[f].neg()));var p=[-3,-1,-5,-7,0,7,5,1,3],y=ef(r[d],r[f]);c=Math.max(y[0].length,c),o[d]=Array(c),o[f]=Array(c);for(var b=0;b<c;b++){var m=0|y[0][b],g=0|y[1][b];o[d][b]=p[3*(m+1)+(g+1)],o[f][b]=0,s[d]=l;}}else o[d]=Qd(r[d],a[d]),o[f]=Qd(r[f],a[f]),c=Math.max(o[d].length,c),c=Math.max(o[f].length,c);}var w=this.jpoint(null,null,null),v=this._wnafT4;for(u=c;u>=0;u--){for(var _=0;u>=0;){var k=!0;for(b=0;b<i;b++)v[b]=0|o[b][u],0!==v[b]&&(k=!1);if(!k)break;_++,u--;}if(u>=0&&_++,w=w.dblp(_),u<0)break;for(b=0;b<i;b++){var A,S=v[b];0!==S&&(S>0?A=s[b][S-1>>1]:S<0&&(A=s[b][-S-1>>1].neg()),w="affine"===A.type?w.mixedAdd(A):w.add(A));}}for(u=0;u<i;u++)s[u]=null;return n?w:w.toP()},rf.BasePoint=af,af.prototype.eq=function(){throw Error("Not implemented")},af.prototype.validate=function(){return this.curve.validate(this)},rf.prototype.decodePoint=function(e,t){e=Yd.toArray(e,t);var r=this.p.byteLength();if((4===e[0]||6===e[0]||7===e[0])&&e.length-1==2*r)return 6===e[0]?tf(e[e.length-1]%2==0):7===e[0]&&tf(e[e.length-1]%2==1),this.point(e.slice(1,1+r),e.slice(1+r,1+2*r));if((2===e[0]||3===e[0])&&e.length-1===r)return this.pointFromX(e.slice(1,1+r),3===e[0]);throw Error("Unknown point format")},af.prototype.encodeCompressed=function(e){return this.encode(e,!0)},af.prototype._encode=function(e){var t=this.curve.p.byteLength(),r=this.getX().toArray("be",t);return e?[this.getY().isEven()?2:3].concat(r):[4].concat(r,this.getY().toArray("be",t))},af.prototype.encode=function(e,t){return Yd.encode(this._encode(t),e)},af.prototype.precompute=function(e){if(this.precomputed)return this;var t={doubles:null,naf:null,beta:null};return t.naf=this._getNAFPoints(8),t.doubles=this._getDoubles(4,e),t.beta=this._getBeta(),this.precomputed=t,this},af.prototype._hasDoubles=function(e){if(!this.precomputed)return !1;var t=this.precomputed.doubles;return !!t&&t.points.length>=Math.ceil((e.bitLength()+1)/t.step)},af.prototype._getDoubles=function(e,t){if(this.precomputed&&this.precomputed.doubles)return this.precomputed.doubles;for(var r=[this],i=this,n=0;n<t;n+=e){for(var a=0;a<e;a++)i=i.dbl();r.push(i);}return {step:e,points:r}},af.prototype._getNAFPoints=function(e){if(this.precomputed&&this.precomputed.naf)return this.precomputed.naf;for(var t=[this],r=(1<<e)-1,i=1===r?null:this.dbl(),n=1;n<r;n++)t[n]=t[n-1].add(i);return {wnd:e,points:t}},af.prototype._getBeta=function(){return null},af.prototype.dblp=function(e){for(var t=this,r=0;r<e;r++)t=t.dbl();return t};var sf=Yd.assert;function of(e){nf.call(this,"short",e),this.a=new jd(e.a,16).toRed(this.red),this.b=new jd(e.b,16).toRed(this.red),this.tinv=this.two.redInvm(),this.zeroA=0===this.a.fromRed().cmpn(0),this.threeA=0===this.a.fromRed().sub(this.p).cmpn(-3),this.endo=this._getEndomorphism(e),this._endoWnafT1=[,,,,],this._endoWnafT2=[,,,,];}it(of,nf);var cf=of;function uf(e,t,r,i){nf.BasePoint.call(this,e,"affine"),null===t&&null===r?(this.x=null,this.y=null,this.inf=!0):(this.x=new jd(t,16),this.y=new jd(r,16),i&&(this.x.forceRed(this.curve.red),this.y.forceRed(this.curve.red)),this.x.red||(this.x=this.x.toRed(this.curve.red)),this.y.red||(this.y=this.y.toRed(this.curve.red)),this.inf=!1);}function hf(e,t,r,i){nf.BasePoint.call(this,e,"jacobian"),null===t&&null===r&&null===i?(this.x=this.curve.one,this.y=this.curve.one,this.z=new jd(0)):(this.x=new jd(t,16),this.y=new jd(r,16),this.z=new jd(i,16)),this.x.red||(this.x=this.x.toRed(this.curve.red)),this.y.red||(this.y=this.y.toRed(this.curve.red)),this.z.red||(this.z=this.z.toRed(this.curve.red)),this.zOne=this.z===this.curve.one;}function df(e){nf.call(this,"mont",e),this.a=new jd(e.a,16).toRed(this.red),this.b=new jd(e.b,16).toRed(this.red),this.i4=new jd(4).toRed(this.red).redInvm(),this.two=new jd(2).toRed(this.red),this.a24=this.i4.redMul(this.a.redAdd(this.two));}of.prototype._getEndomorphism=function(e){if(this.zeroA&&this.g&&this.n&&1===this.p.modn(3)){var t,r;if(e.beta)t=new jd(e.beta,16).toRed(this.red);else {var i=this._getEndoRoots(this.p);t=(t=i[0].cmp(i[1])<0?i[0]:i[1]).toRed(this.red);}if(e.lambda)r=new jd(e.lambda,16);else {var n=this._getEndoRoots(this.n);0===this.g.mul(n[0]).x.cmp(this.g.x.redMul(t))?r=n[0]:(r=n[1],sf(0===this.g.mul(r).x.cmp(this.g.x.redMul(t))));}return {beta:t,lambda:r,basis:e.basis?e.basis.map((function(e){return {a:new jd(e.a,16),b:new jd(e.b,16)}})):this._getEndoBasis(r)}}},of.prototype._getEndoRoots=function(e){var t=e===this.p?this.red:jd.mont(e),r=new jd(2).toRed(t).redInvm(),i=r.redNeg(),n=new jd(3).toRed(t).redNeg().redSqrt().redMul(r);return [i.redAdd(n).fromRed(),i.redSub(n).fromRed()]},of.prototype._getEndoBasis=function(e){for(var t,r,i,n,a,s,o,c,u,h=this.n.ushrn(Math.floor(this.n.bitLength()/2)),d=e,f=this.n.clone(),l=new jd(1),p=new jd(0),y=new jd(0),b=new jd(1),m=0;0!==d.cmpn(0);){var g=f.div(d);c=f.sub(g.mul(d)),u=y.sub(g.mul(l));var w=b.sub(g.mul(p));if(!i&&c.cmp(h)<0)t=o.neg(),r=l,i=c.neg(),n=u;else if(i&&2==++m)break;o=c,f=d,d=c,y=l,l=u,b=p,p=w;}a=c.neg(),s=u;var v=i.sqr().add(n.sqr());return a.sqr().add(s.sqr()).cmp(v)>=0&&(a=t,s=r),i.negative&&(i=i.neg(),n=n.neg()),a.negative&&(a=a.neg(),s=s.neg()),[{a:i,b:n},{a,b:s}]},of.prototype._endoSplit=function(e){var t=this.endo.basis,r=t[0],i=t[1],n=i.b.mul(e).divRound(this.n),a=r.b.neg().mul(e).divRound(this.n),s=n.mul(r.a),o=a.mul(i.a),c=n.mul(r.b),u=a.mul(i.b);return {k1:e.sub(s).sub(o),k2:c.add(u).neg()}},of.prototype.pointFromX=function(e,t){(e=new jd(e,16)).red||(e=e.toRed(this.red));var r=e.redSqr().redMul(e).redIAdd(e.redMul(this.a)).redIAdd(this.b),i=r.redSqrt();if(0!==i.redSqr().redSub(r).cmp(this.zero))throw Error("invalid point");var n=i.fromRed().isOdd();return (t&&!n||!t&&n)&&(i=i.redNeg()),this.point(e,i)},of.prototype.validate=function(e){if(e.inf)return !0;var t=e.x,r=e.y,i=this.a.redMul(t),n=t.redSqr().redMul(t).redIAdd(i).redIAdd(this.b);return 0===r.redSqr().redISub(n).cmpn(0)},of.prototype._endoWnafMulAdd=function(e,t,r){for(var i=this._endoWnafT1,n=this._endoWnafT2,a=0;a<e.length;a++){var s=this._endoSplit(t[a]),o=e[a],c=o._getBeta();s.k1.negative&&(s.k1.ineg(),o=o.neg(!0)),s.k2.negative&&(s.k2.ineg(),c=c.neg(!0)),i[2*a]=o,i[2*a+1]=c,n[2*a]=s.k1,n[2*a+1]=s.k2;}for(var u=this._wnafMulAdd(1,i,n,2*a,r),h=0;h<2*a;h++)i[h]=null,n[h]=null;return u},it(uf,nf.BasePoint),of.prototype.point=function(e,t,r){return new uf(this,e,t,r)},of.prototype.pointFromJSON=function(e,t){return uf.fromJSON(this,e,t)},uf.prototype._getBeta=function(){if(this.curve.endo){var e=this.precomputed;if(e&&e.beta)return e.beta;var t=this.curve.point(this.x.redMul(this.curve.endo.beta),this.y);if(e){var r=this.curve,i=function(e){return r.point(e.x.redMul(r.endo.beta),e.y)};e.beta=t,t.precomputed={beta:null,naf:e.naf&&{wnd:e.naf.wnd,points:e.naf.points.map(i)},doubles:e.doubles&&{step:e.doubles.step,points:e.doubles.points.map(i)}};}return t}},uf.prototype.toJSON=function(){return this.precomputed?[this.x,this.y,this.precomputed&&{doubles:this.precomputed.doubles&&{step:this.precomputed.doubles.step,points:this.precomputed.doubles.points.slice(1)},naf:this.precomputed.naf&&{wnd:this.precomputed.naf.wnd,points:this.precomputed.naf.points.slice(1)}}]:[this.x,this.y]},uf.fromJSON=function(e,t,r){"string"==typeof t&&(t=JSON.parse(t));var i=e.point(t[0],t[1],r);if(!t[2])return i;function n(t){return e.point(t[0],t[1],r)}var a=t[2];return i.precomputed={beta:null,doubles:a.doubles&&{step:a.doubles.step,points:[i].concat(a.doubles.points.map(n))},naf:a.naf&&{wnd:a.naf.wnd,points:[i].concat(a.naf.points.map(n))}},i},uf.prototype.inspect=function(){return this.isInfinity()?"<EC Point Infinity>":"<EC Point x: "+this.x.fromRed().toString(16,2)+" y: "+this.y.fromRed().toString(16,2)+">"},uf.prototype.isInfinity=function(){return this.inf},uf.prototype.add=function(e){if(this.inf)return e;if(e.inf)return this;if(this.eq(e))return this.dbl();if(this.neg().eq(e))return this.curve.point(null,null);if(0===this.x.cmp(e.x))return this.curve.point(null,null);var t=this.y.redSub(e.y);0!==t.cmpn(0)&&(t=t.redMul(this.x.redSub(e.x).redInvm()));var r=t.redSqr().redISub(this.x).redISub(e.x),i=t.redMul(this.x.redSub(r)).redISub(this.y);return this.curve.point(r,i)},uf.prototype.dbl=function(){if(this.inf)return this;var e=this.y.redAdd(this.y);if(0===e.cmpn(0))return this.curve.point(null,null);var t=this.curve.a,r=this.x.redSqr(),i=e.redInvm(),n=r.redAdd(r).redIAdd(r).redIAdd(t).redMul(i),a=n.redSqr().redISub(this.x.redAdd(this.x)),s=n.redMul(this.x.redSub(a)).redISub(this.y);return this.curve.point(a,s)},uf.prototype.getX=function(){return this.x.fromRed()},uf.prototype.getY=function(){return this.y.fromRed()},uf.prototype.mul=function(e){return e=new jd(e,16),this.isInfinity()?this:this._hasDoubles(e)?this.curve._fixedNafMul(this,e):this.curve.endo?this.curve._endoWnafMulAdd([this],[e]):this.curve._wnafMul(this,e)},uf.prototype.mulAdd=function(e,t,r){var i=[this,t],n=[e,r];return this.curve.endo?this.curve._endoWnafMulAdd(i,n):this.curve._wnafMulAdd(1,i,n,2)},uf.prototype.jmulAdd=function(e,t,r){var i=[this,t],n=[e,r];return this.curve.endo?this.curve._endoWnafMulAdd(i,n,!0):this.curve._wnafMulAdd(1,i,n,2,!0)},uf.prototype.eq=function(e){return this===e||this.inf===e.inf&&(this.inf||0===this.x.cmp(e.x)&&0===this.y.cmp(e.y))},uf.prototype.neg=function(e){if(this.inf)return this;var t=this.curve.point(this.x,this.y.redNeg());if(e&&this.precomputed){var r=this.precomputed,i=function(e){return e.neg()};t.precomputed={naf:r.naf&&{wnd:r.naf.wnd,points:r.naf.points.map(i)},doubles:r.doubles&&{step:r.doubles.step,points:r.doubles.points.map(i)}};}return t},uf.prototype.toJ=function(){return this.inf?this.curve.jpoint(null,null,null):this.curve.jpoint(this.x,this.y,this.curve.one)},it(hf,nf.BasePoint),of.prototype.jpoint=function(e,t,r){return new hf(this,e,t,r)},hf.prototype.toP=function(){if(this.isInfinity())return this.curve.point(null,null);var e=this.z.redInvm(),t=e.redSqr(),r=this.x.redMul(t),i=this.y.redMul(t).redMul(e);return this.curve.point(r,i)},hf.prototype.neg=function(){return this.curve.jpoint(this.x,this.y.redNeg(),this.z)},hf.prototype.add=function(e){if(this.isInfinity())return e;if(e.isInfinity())return this;var t=e.z.redSqr(),r=this.z.redSqr(),i=this.x.redMul(t),n=e.x.redMul(r),a=this.y.redMul(t.redMul(e.z)),s=e.y.redMul(r.redMul(this.z)),o=i.redSub(n),c=a.redSub(s);if(0===o.cmpn(0))return 0!==c.cmpn(0)?this.curve.jpoint(null,null,null):this.dbl();var u=o.redSqr(),h=u.redMul(o),d=i.redMul(u),f=c.redSqr().redIAdd(h).redISub(d).redISub(d),l=c.redMul(d.redISub(f)).redISub(a.redMul(h)),p=this.z.redMul(e.z).redMul(o);return this.curve.jpoint(f,l,p)},hf.prototype.mixedAdd=function(e){if(this.isInfinity())return e.toJ();if(e.isInfinity())return this;var t=this.z.redSqr(),r=this.x,i=e.x.redMul(t),n=this.y,a=e.y.redMul(t).redMul(this.z),s=r.redSub(i),o=n.redSub(a);if(0===s.cmpn(0))return 0!==o.cmpn(0)?this.curve.jpoint(null,null,null):this.dbl();var c=s.redSqr(),u=c.redMul(s),h=r.redMul(c),d=o.redSqr().redIAdd(u).redISub(h).redISub(h),f=o.redMul(h.redISub(d)).redISub(n.redMul(u)),l=this.z.redMul(s);return this.curve.jpoint(d,f,l)},hf.prototype.dblp=function(e){if(0===e)return this;if(this.isInfinity())return this;if(!e)return this.dbl();if(this.curve.zeroA||this.curve.threeA){for(var t=this,r=0;r<e;r++)t=t.dbl();return t}var i=this.curve.a,n=this.curve.tinv,a=this.x,s=this.y,o=this.z,c=o.redSqr().redSqr(),u=s.redAdd(s);for(r=0;r<e;r++){var h=a.redSqr(),d=u.redSqr(),f=d.redSqr(),l=h.redAdd(h).redIAdd(h).redIAdd(i.redMul(c)),p=a.redMul(d),y=l.redSqr().redISub(p.redAdd(p)),b=p.redISub(y),m=l.redMul(b);m=m.redIAdd(m).redISub(f);var g=u.redMul(o);r+1<e&&(c=c.redMul(f)),a=y,o=g,u=m;}return this.curve.jpoint(a,u.redMul(n),o)},hf.prototype.dbl=function(){return this.isInfinity()?this:this.curve.zeroA?this._zeroDbl():this.curve.threeA?this._threeDbl():this._dbl()},hf.prototype._zeroDbl=function(){var e,t,r;if(this.zOne){var i=this.x.redSqr(),n=this.y.redSqr(),a=n.redSqr(),s=this.x.redAdd(n).redSqr().redISub(i).redISub(a);s=s.redIAdd(s);var o=i.redAdd(i).redIAdd(i),c=o.redSqr().redISub(s).redISub(s),u=a.redIAdd(a);u=(u=u.redIAdd(u)).redIAdd(u),e=c,t=o.redMul(s.redISub(c)).redISub(u),r=this.y.redAdd(this.y);}else {var h=this.x.redSqr(),d=this.y.redSqr(),f=d.redSqr(),l=this.x.redAdd(d).redSqr().redISub(h).redISub(f);l=l.redIAdd(l);var p=h.redAdd(h).redIAdd(h),y=p.redSqr(),b=f.redIAdd(f);b=(b=b.redIAdd(b)).redIAdd(b),e=y.redISub(l).redISub(l),t=p.redMul(l.redISub(e)).redISub(b),r=(r=this.y.redMul(this.z)).redIAdd(r);}return this.curve.jpoint(e,t,r)},hf.prototype._threeDbl=function(){var e,t,r;if(this.zOne){var i=this.x.redSqr(),n=this.y.redSqr(),a=n.redSqr(),s=this.x.redAdd(n).redSqr().redISub(i).redISub(a);s=s.redIAdd(s);var o=i.redAdd(i).redIAdd(i).redIAdd(this.curve.a),c=o.redSqr().redISub(s).redISub(s);e=c;var u=a.redIAdd(a);u=(u=u.redIAdd(u)).redIAdd(u),t=o.redMul(s.redISub(c)).redISub(u),r=this.y.redAdd(this.y);}else {var h=this.z.redSqr(),d=this.y.redSqr(),f=this.x.redMul(d),l=this.x.redSub(h).redMul(this.x.redAdd(h));l=l.redAdd(l).redIAdd(l);var p=f.redIAdd(f),y=(p=p.redIAdd(p)).redAdd(p);e=l.redSqr().redISub(y),r=this.y.redAdd(this.z).redSqr().redISub(d).redISub(h);var b=d.redSqr();b=(b=(b=b.redIAdd(b)).redIAdd(b)).redIAdd(b),t=l.redMul(p.redISub(e)).redISub(b);}return this.curve.jpoint(e,t,r)},hf.prototype._dbl=function(){var e=this.curve.a,t=this.x,r=this.y,i=this.z,n=i.redSqr().redSqr(),a=t.redSqr(),s=r.redSqr(),o=a.redAdd(a).redIAdd(a).redIAdd(e.redMul(n)),c=t.redAdd(t),u=(c=c.redIAdd(c)).redMul(s),h=o.redSqr().redISub(u.redAdd(u)),d=u.redISub(h),f=s.redSqr();f=(f=(f=f.redIAdd(f)).redIAdd(f)).redIAdd(f);var l=o.redMul(d).redISub(f),p=r.redAdd(r).redMul(i);return this.curve.jpoint(h,l,p)},hf.prototype.trpl=function(){if(!this.curve.zeroA)return this.dbl().add(this);var e=this.x.redSqr(),t=this.y.redSqr(),r=this.z.redSqr(),i=t.redSqr(),n=e.redAdd(e).redIAdd(e),a=n.redSqr(),s=this.x.redAdd(t).redSqr().redISub(e).redISub(i),o=(s=(s=(s=s.redIAdd(s)).redAdd(s).redIAdd(s)).redISub(a)).redSqr(),c=i.redIAdd(i);c=(c=(c=c.redIAdd(c)).redIAdd(c)).redIAdd(c);var u=n.redIAdd(s).redSqr().redISub(a).redISub(o).redISub(c),h=t.redMul(u);h=(h=h.redIAdd(h)).redIAdd(h);var d=this.x.redMul(o).redISub(h);d=(d=d.redIAdd(d)).redIAdd(d);var f=this.y.redMul(u.redMul(c.redISub(u)).redISub(s.redMul(o)));f=(f=(f=f.redIAdd(f)).redIAdd(f)).redIAdd(f);var l=this.z.redAdd(s).redSqr().redISub(r).redISub(o);return this.curve.jpoint(d,f,l)},hf.prototype.mul=function(e,t){return e=new jd(e,t),this.curve._wnafMul(this,e)},hf.prototype.eq=function(e){if("affine"===e.type)return this.eq(e.toJ());if(this===e)return !0;var t=this.z.redSqr(),r=e.z.redSqr();if(0!==this.x.redMul(r).redISub(e.x.redMul(t)).cmpn(0))return !1;var i=t.redMul(this.z),n=r.redMul(e.z);return 0===this.y.redMul(n).redISub(e.y.redMul(i)).cmpn(0)},hf.prototype.eqXToP=function(e){var t=this.z.redSqr(),r=e.toRed(this.curve.red).redMul(t);if(0===this.x.cmp(r))return !0;for(var i=e.clone(),n=this.curve.redN.redMul(t);;){if(i.iadd(this.curve.n),i.cmp(this.curve.p)>=0)return !1;if(r.redIAdd(n),0===this.x.cmp(r))return !0}},hf.prototype.inspect=function(){return this.isInfinity()?"<EC JPoint Infinity>":"<EC JPoint x: "+this.x.toString(16,2)+" y: "+this.y.toString(16,2)+" z: "+this.z.toString(16,2)+">"},hf.prototype.isInfinity=function(){return 0===this.z.cmpn(0)},it(df,nf);var ff=df;function lf(e,t,r){nf.BasePoint.call(this,e,"projective"),null===t&&null===r?(this.x=this.curve.one,this.z=this.curve.zero):(this.x=new jd(t,16),this.z=new jd(r,16),this.x.red||(this.x=this.x.toRed(this.curve.red)),this.z.red||(this.z=this.z.toRed(this.curve.red)));}df.prototype.validate=function(e){var t=e.normalize().x,r=t.redSqr(),i=r.redMul(t).redAdd(r.redMul(this.a)).redAdd(t);return 0===i.redSqrt().redSqr().cmp(i)},it(lf,nf.BasePoint),df.prototype.decodePoint=function(e,t){if(33===(e=Yd.toArray(e,t)).length&&64===e[0]&&(e=e.slice(1,33).reverse()),32!==e.length)throw Error("Unknown point compression format");return this.point(e,1)},df.prototype.point=function(e,t){return new lf(this,e,t)},df.prototype.pointFromJSON=function(e){return lf.fromJSON(this,e)},lf.prototype.precompute=function(){},lf.prototype._encode=function(e){var t=this.curve.p.byteLength();return e?[64].concat(this.getX().toArray("le",t)):this.getX().toArray("be",t)},lf.fromJSON=function(e,t){return new lf(e,t[0],t[1]||e.one)},lf.prototype.inspect=function(){return this.isInfinity()?"<EC Point Infinity>":"<EC Point x: "+this.x.fromRed().toString(16,2)+" z: "+this.z.fromRed().toString(16,2)+">"},lf.prototype.isInfinity=function(){return 0===this.z.cmpn(0)},lf.prototype.dbl=function(){var e=this.x.redAdd(this.z).redSqr(),t=this.x.redSub(this.z).redSqr(),r=e.redSub(t),i=e.redMul(t),n=r.redMul(t.redAdd(this.curve.a24.redMul(r)));return this.curve.point(i,n)},lf.prototype.add=function(){throw Error("Not supported on Montgomery curve")},lf.prototype.diffAdd=function(e,t){var r=this.x.redAdd(this.z),i=this.x.redSub(this.z),n=e.x.redAdd(e.z),a=e.x.redSub(e.z).redMul(r),s=n.redMul(i),o=t.z.redMul(a.redAdd(s).redSqr()),c=t.x.redMul(a.redISub(s).redSqr());return this.curve.point(o,c)},lf.prototype.mul=function(e){for(var t=(e=new jd(e,16)).clone(),r=this,i=this.curve.point(null,null),n=[];0!==t.cmpn(0);t.iushrn(1))n.push(t.andln(1));for(var a=n.length-1;a>=0;a--)0===n[a]?(r=r.diffAdd(i,this),i=i.dbl()):(i=r.diffAdd(i,this),r=r.dbl());return i},lf.prototype.mulAdd=function(){throw Error("Not supported on Montgomery curve")},lf.prototype.jumlAdd=function(){throw Error("Not supported on Montgomery curve")},lf.prototype.eq=function(e){return 0===this.getX().cmp(e.getX())},lf.prototype.normalize=function(){return this.x=this.x.redMul(this.z.redInvm()),this.z=this.curve.one,this},lf.prototype.getX=function(){return this.normalize(),this.x.fromRed()};var pf=Yd.assert;function yf(e){this.twisted=1!=(0|e.a),this.mOneA=this.twisted&&-1==(0|e.a),this.extended=this.mOneA,nf.call(this,"edwards",e),this.a=new jd(e.a,16).umod(this.red.m),this.a=this.a.toRed(this.red),this.c=new jd(e.c,16).toRed(this.red),this.c2=this.c.redSqr(),this.d=new jd(e.d,16).toRed(this.red),this.dd=this.d.redAdd(this.d),pf(!this.twisted||0===this.c.fromRed().cmpn(1)),this.oneC=1==(0|e.c);}it(yf,nf);var bf=yf;function mf(e,t,r,i,n){nf.BasePoint.call(this,e,"projective"),null===t&&null===r&&null===i?(this.x=this.curve.zero,this.y=this.curve.one,this.z=this.curve.one,this.t=this.curve.zero,this.zOne=!0):(this.x=new jd(t,16),this.y=new jd(r,16),this.z=i?new jd(i,16):this.curve.one,this.t=n&&new jd(n,16),this.x.red||(this.x=this.x.toRed(this.curve.red)),this.y.red||(this.y=this.y.toRed(this.curve.red)),this.z.red||(this.z=this.z.toRed(this.curve.red)),this.t&&!this.t.red&&(this.t=this.t.toRed(this.curve.red)),this.zOne=this.z===this.curve.one,this.curve.extended&&!this.t&&(this.t=this.x.redMul(this.y),this.zOne||(this.t=this.t.redMul(this.z.redInvm()))));}yf.prototype._mulA=function(e){return this.mOneA?e.redNeg():this.a.redMul(e)},yf.prototype._mulC=function(e){return this.oneC?e:this.c.redMul(e)},yf.prototype.jpoint=function(e,t,r,i){return this.point(e,t,r,i)},yf.prototype.pointFromX=function(e,t){(e=new jd(e,16)).red||(e=e.toRed(this.red));var r=e.redSqr(),i=this.c2.redSub(this.a.redMul(r)),n=this.one.redSub(this.c2.redMul(this.d).redMul(r)),a=i.redMul(n.redInvm()),s=a.redSqrt();if(0!==s.redSqr().redSub(a).cmp(this.zero))throw Error("invalid point");var o=s.fromRed().isOdd();return (t&&!o||!t&&o)&&(s=s.redNeg()),this.point(e,s)},yf.prototype.pointFromY=function(e,t){(e=new jd(e,16)).red||(e=e.toRed(this.red));var r=e.redSqr(),i=r.redSub(this.c2),n=r.redMul(this.d).redMul(this.c2).redSub(this.a),a=i.redMul(n.redInvm());if(0===a.cmp(this.zero)){if(t)throw Error("invalid point");return this.point(this.zero,e)}var s=a.redSqrt();if(0!==s.redSqr().redSub(a).cmp(this.zero))throw Error("invalid point");return s.fromRed().isOdd()!==t&&(s=s.redNeg()),this.point(s,e)},yf.prototype.validate=function(e){if(e.isInfinity())return !0;e.normalize();var t=e.x.redSqr(),r=e.y.redSqr(),i=t.redMul(this.a).redAdd(r),n=this.c2.redMul(this.one.redAdd(this.d.redMul(t).redMul(r)));return 0===i.cmp(n)},it(mf,nf.BasePoint),yf.prototype.pointFromJSON=function(e){return mf.fromJSON(this,e)},yf.prototype.point=function(e,t,r,i){return new mf(this,e,t,r,i)},mf.fromJSON=function(e,t){return new mf(e,t[0],t[1],t[2])},mf.prototype.inspect=function(){return this.isInfinity()?"<EC Point Infinity>":"<EC Point x: "+this.x.fromRed().toString(16,2)+" y: "+this.y.fromRed().toString(16,2)+" z: "+this.z.fromRed().toString(16,2)+">"},mf.prototype.isInfinity=function(){return 0===this.x.cmpn(0)&&(0===this.y.cmp(this.z)||this.zOne&&0===this.y.cmp(this.curve.c))},mf.prototype._extDbl=function(){var e=this.x.redSqr(),t=this.y.redSqr(),r=this.z.redSqr();r=r.redIAdd(r);var i=this.curve._mulA(e),n=this.x.redAdd(this.y).redSqr().redISub(e).redISub(t),a=i.redAdd(t),s=a.redSub(r),o=i.redSub(t),c=n.redMul(s),u=a.redMul(o),h=n.redMul(o),d=s.redMul(a);return this.curve.point(c,u,d,h)},mf.prototype._projDbl=function(){var e,t,r,i=this.x.redAdd(this.y).redSqr(),n=this.x.redSqr(),a=this.y.redSqr();if(this.curve.twisted){var s=(u=this.curve._mulA(n)).redAdd(a);if(this.zOne)e=i.redSub(n).redSub(a).redMul(s.redSub(this.curve.two)),t=s.redMul(u.redSub(a)),r=s.redSqr().redSub(s).redSub(s);else {var o=this.z.redSqr(),c=s.redSub(o).redISub(o);e=i.redSub(n).redISub(a).redMul(c),t=s.redMul(u.redSub(a)),r=s.redMul(c);}}else {var u=n.redAdd(a);o=this.curve._mulC(this.z).redSqr(),c=u.redSub(o).redSub(o);e=this.curve._mulC(i.redISub(u)).redMul(c),t=this.curve._mulC(u).redMul(n.redISub(a)),r=u.redMul(c);}return this.curve.point(e,t,r)},mf.prototype.dbl=function(){return this.isInfinity()?this:this.curve.extended?this._extDbl():this._projDbl()},mf.prototype._extAdd=function(e){var t=this.y.redSub(this.x).redMul(e.y.redSub(e.x)),r=this.y.redAdd(this.x).redMul(e.y.redAdd(e.x)),i=this.t.redMul(this.curve.dd).redMul(e.t),n=this.z.redMul(e.z.redAdd(e.z)),a=r.redSub(t),s=n.redSub(i),o=n.redAdd(i),c=r.redAdd(t),u=a.redMul(s),h=o.redMul(c),d=a.redMul(c),f=s.redMul(o);return this.curve.point(u,h,f,d)},mf.prototype._projAdd=function(e){var t,r,i=this.z.redMul(e.z),n=i.redSqr(),a=this.x.redMul(e.x),s=this.y.redMul(e.y),o=this.curve.d.redMul(a).redMul(s),c=n.redSub(o),u=n.redAdd(o),h=this.x.redAdd(this.y).redMul(e.x.redAdd(e.y)).redISub(a).redISub(s),d=i.redMul(c).redMul(h);return this.curve.twisted?(t=i.redMul(u).redMul(s.redSub(this.curve._mulA(a))),r=c.redMul(u)):(t=i.redMul(u).redMul(s.redSub(a)),r=this.curve._mulC(c).redMul(u)),this.curve.point(d,t,r)},mf.prototype.add=function(e){return this.isInfinity()?e:e.isInfinity()?this:this.curve.extended?this._extAdd(e):this._projAdd(e)},mf.prototype.mul=function(e){return this._hasDoubles(e)?this.curve._fixedNafMul(this,e):this.curve._wnafMul(this,e)},mf.prototype.mulAdd=function(e,t,r){return this.curve._wnafMulAdd(1,[this,t],[e,r],2,!1)},mf.prototype.jmulAdd=function(e,t,r){return this.curve._wnafMulAdd(1,[this,t],[e,r],2,!0)},mf.prototype.normalize=function(){if(this.zOne)return this;var e=this.z.redInvm();return this.x=this.x.redMul(e),this.y=this.y.redMul(e),this.t&&(this.t=this.t.redMul(e)),this.z=this.curve.one,this.zOne=!0,this},mf.prototype.neg=function(){return this.curve.point(this.x.redNeg(),this.y,this.z,this.t&&this.t.redNeg())},mf.prototype.getX=function(){return this.normalize(),this.x.fromRed()},mf.prototype.getY=function(){return this.normalize(),this.y.fromRed()},mf.prototype.eq=function(e){return this===e||0===this.getX().cmp(e.getX())&&0===this.getY().cmp(e.getY())},mf.prototype.eqXToP=function(e){var t=e.toRed(this.curve.red).redMul(this.z);if(0===this.x.cmp(t))return !0;for(var r=e.clone(),i=this.curve.redN.redMul(this.z);;){if(r.iadd(this.curve.n),r.cmp(this.curve.p)>=0)return !1;if(t.redIAdd(i),0===this.x.cmp(t))return !0}},mf.prototype.toP=mf.prototype.normalize,mf.prototype.mixedAdd=mf.prototype.add;var gf=rt((function(e,t){var r=t;r.base=nf,r.short=cf,r.mont=ff,r.edwards=bf;})),wf=ot.rotl32,vf=ot.sum32,_f=ot.sum32_5,kf=yt.ft_1,Af=ht.BlockHash,Sf=[1518500249,1859775393,2400959708,3395469782];function Ef(){if(!(this instanceof Ef))return new Ef;Af.call(this),this.h=[1732584193,4023233417,2562383102,271733878,3285377520],this.W=Array(80);}ot.inherits(Ef,Af);var xf=Ef;Ef.blockSize=512,Ef.outSize=160,Ef.hmacStrength=80,Ef.padLength=64,Ef.prototype._update=function(e,t){for(var r=this.W,i=0;i<16;i++)r[i]=e[t+i];for(;i<r.length;i++)r[i]=wf(r[i-3]^r[i-8]^r[i-14]^r[i-16],1);var n=this.h[0],a=this.h[1],s=this.h[2],o=this.h[3],c=this.h[4];for(i=0;i<r.length;i++){var u=~~(i/20),h=_f(wf(n,5),kf(u,a,s,o),c,r[i],Sf[u]);c=o,o=s,s=wf(a,30),a=n,n=h;}this.h[0]=vf(this.h[0],n),this.h[1]=vf(this.h[1],a),this.h[2]=vf(this.h[2],s),this.h[3]=vf(this.h[3],o),this.h[4]=vf(this.h[4],c);},Ef.prototype._digest=function(e){return "hex"===e?ot.toHex32(this.h,"big"):ot.split32(this.h,"big")};var Pf={sha1:xf,sha224:Kt,sha256:Mt,sha384:ar,sha512:Ht};function Mf(e,t,r){if(!(this instanceof Mf))return new Mf(e,t,r);this.Hash=e,this.blockSize=e.blockSize/8,this.outSize=e.outSize/8,this.inner=null,this.outer=null,this._init(ot.toArray(t,r));}var Cf=Mf;Mf.prototype._init=function(e){e.length>this.blockSize&&(e=(new this.Hash).update(e).digest()),Qe(e.length<=this.blockSize);for(var t=e.length;t<this.blockSize;t++)e.push(0);for(t=0;t<e.length;t++)e[t]^=54;for(this.inner=(new this.Hash).update(e),t=0;t<e.length;t++)e[t]^=106;this.outer=(new this.Hash).update(e);},Mf.prototype.update=function(e,t){return this.inner.update(e,t),this},Mf.prototype.digest=function(e){return this.outer.update(this.inner.digest()),this.outer.digest(e)};var Kf=rt((function(e,t){var r=t;r.utils=ot,r.common=ht,r.sha=Pf,r.ripemd=vr,r.hmac=Cf,r.sha1=r.sha.sha1,r.sha256=r.sha.sha256,r.sha224=r.sha.sha224,r.sha384=r.sha.sha384,r.sha512=r.sha.sha512,r.ripemd160=r.ripemd.ripemd160;})),Df={doubles:{step:4,points:[["e60fce93b59e9ec53011aabc21c23e97b2a31369b87a5ae9c44ee89e2a6dec0a","f7e3507399e595929db99f34f57937101296891e44d23f0be1f32cce69616821"],["8282263212c609d9ea2a6e3e172de238d8c39cabd5ac1ca10646e23fd5f51508","11f8a8098557dfe45e8256e830b60ace62d613ac2f7b17bed31b6eaff6e26caf"],["175e159f728b865a72f99cc6c6fc846de0b93833fd2222ed73fce5b551e5b739","d3506e0d9e3c79eba4ef97a51ff71f5eacb5955add24345c6efa6ffee9fed695"],["363d90d447b00c9c99ceac05b6262ee053441c7e55552ffe526bad8f83ff4640","4e273adfc732221953b445397f3363145b9a89008199ecb62003c7f3bee9de9"],["8b4b5f165df3c2be8c6244b5b745638843e4a781a15bcd1b69f79a55dffdf80c","4aad0a6f68d308b4b3fbd7813ab0da04f9e336546162ee56b3eff0c65fd4fd36"],["723cbaa6e5db996d6bf771c00bd548c7b700dbffa6c0e77bcb6115925232fcda","96e867b5595cc498a921137488824d6e2660a0653779494801dc069d9eb39f5f"],["eebfa4d493bebf98ba5feec812c2d3b50947961237a919839a533eca0e7dd7fa","5d9a8ca3970ef0f269ee7edaf178089d9ae4cdc3a711f712ddfd4fdae1de8999"],["100f44da696e71672791d0a09b7bde459f1215a29b3c03bfefd7835b39a48db0","cdd9e13192a00b772ec8f3300c090666b7ff4a18ff5195ac0fbd5cd62bc65a09"],["e1031be262c7ed1b1dc9227a4a04c017a77f8d4464f3b3852c8acde6e534fd2d","9d7061928940405e6bb6a4176597535af292dd419e1ced79a44f18f29456a00d"],["feea6cae46d55b530ac2839f143bd7ec5cf8b266a41d6af52d5e688d9094696d","e57c6b6c97dce1bab06e4e12bf3ecd5c981c8957cc41442d3155debf18090088"],["da67a91d91049cdcb367be4be6ffca3cfeed657d808583de33fa978bc1ec6cb1","9bacaa35481642bc41f463f7ec9780e5dec7adc508f740a17e9ea8e27a68be1d"],["53904faa0b334cdda6e000935ef22151ec08d0f7bb11069f57545ccc1a37b7c0","5bc087d0bc80106d88c9eccac20d3c1c13999981e14434699dcb096b022771c8"],["8e7bcd0bd35983a7719cca7764ca906779b53a043a9b8bcaeff959f43ad86047","10b7770b2a3da4b3940310420ca9514579e88e2e47fd68b3ea10047e8460372a"],["385eed34c1cdff21e6d0818689b81bde71a7f4f18397e6690a841e1599c43862","283bebc3e8ea23f56701de19e9ebf4576b304eec2086dc8cc0458fe5542e5453"],["6f9d9b803ecf191637c73a4413dfa180fddf84a5947fbc9c606ed86c3fac3a7","7c80c68e603059ba69b8e2a30e45c4d47ea4dd2f5c281002d86890603a842160"],["3322d401243c4e2582a2147c104d6ecbf774d163db0f5e5313b7e0e742d0e6bd","56e70797e9664ef5bfb019bc4ddaf9b72805f63ea2873af624f3a2e96c28b2a0"],["85672c7d2de0b7da2bd1770d89665868741b3f9af7643397721d74d28134ab83","7c481b9b5b43b2eb6374049bfa62c2e5e77f17fcc5298f44c8e3094f790313a6"],["948bf809b1988a46b06c9f1919413b10f9226c60f668832ffd959af60c82a0a","53a562856dcb6646dc6b74c5d1c3418c6d4dff08c97cd2bed4cb7f88d8c8e589"],["6260ce7f461801c34f067ce0f02873a8f1b0e44dfc69752accecd819f38fd8e8","bc2da82b6fa5b571a7f09049776a1ef7ecd292238051c198c1a84e95b2b4ae17"],["e5037de0afc1d8d43d8348414bbf4103043ec8f575bfdc432953cc8d2037fa2d","4571534baa94d3b5f9f98d09fb990bddbd5f5b03ec481f10e0e5dc841d755bda"],["e06372b0f4a207adf5ea905e8f1771b4e7e8dbd1c6a6c5b725866a0ae4fce725","7a908974bce18cfe12a27bb2ad5a488cd7484a7787104870b27034f94eee31dd"],["213c7a715cd5d45358d0bbf9dc0ce02204b10bdde2a3f58540ad6908d0559754","4b6dad0b5ae462507013ad06245ba190bb4850f5f36a7eeddff2c27534b458f2"],["4e7c272a7af4b34e8dbb9352a5419a87e2838c70adc62cddf0cc3a3b08fbd53c","17749c766c9d0b18e16fd09f6def681b530b9614bff7dd33e0b3941817dcaae6"],["fea74e3dbe778b1b10f238ad61686aa5c76e3db2be43057632427e2840fb27b6","6e0568db9b0b13297cf674deccb6af93126b596b973f7b77701d3db7f23cb96f"],["76e64113f677cf0e10a2570d599968d31544e179b760432952c02a4417bdde39","c90ddf8dee4e95cf577066d70681f0d35e2a33d2b56d2032b4b1752d1901ac01"],["c738c56b03b2abe1e8281baa743f8f9a8f7cc643df26cbee3ab150242bcbb891","893fb578951ad2537f718f2eacbfbbbb82314eef7880cfe917e735d9699a84c3"],["d895626548b65b81e264c7637c972877d1d72e5f3a925014372e9f6588f6c14b","febfaa38f2bc7eae728ec60818c340eb03428d632bb067e179363ed75d7d991f"],["b8da94032a957518eb0f6433571e8761ceffc73693e84edd49150a564f676e03","2804dfa44805a1e4d7c99cc9762808b092cc584d95ff3b511488e4e74efdf6e7"],["e80fea14441fb33a7d8adab9475d7fab2019effb5156a792f1a11778e3c0df5d","eed1de7f638e00771e89768ca3ca94472d155e80af322ea9fcb4291b6ac9ec78"],["a301697bdfcd704313ba48e51d567543f2a182031efd6915ddc07bbcc4e16070","7370f91cfb67e4f5081809fa25d40f9b1735dbf7c0a11a130c0d1a041e177ea1"],["90ad85b389d6b936463f9d0512678de208cc330b11307fffab7ac63e3fb04ed4","e507a3620a38261affdcbd9427222b839aefabe1582894d991d4d48cb6ef150"],["8f68b9d2f63b5f339239c1ad981f162ee88c5678723ea3351b7b444c9ec4c0da","662a9f2dba063986de1d90c2b6be215dbbea2cfe95510bfdf23cbf79501fff82"],["e4f3fb0176af85d65ff99ff9198c36091f48e86503681e3e6686fd5053231e11","1e63633ad0ef4f1c1661a6d0ea02b7286cc7e74ec951d1c9822c38576feb73bc"],["8c00fa9b18ebf331eb961537a45a4266c7034f2f0d4e1d0716fb6eae20eae29e","efa47267fea521a1a9dc343a3736c974c2fadafa81e36c54e7d2a4c66702414b"],["e7a26ce69dd4829f3e10cec0a9e98ed3143d084f308b92c0997fddfc60cb3e41","2a758e300fa7984b471b006a1aafbb18d0a6b2c0420e83e20e8a9421cf2cfd51"],["b6459e0ee3662ec8d23540c223bcbdc571cbcb967d79424f3cf29eb3de6b80ef","67c876d06f3e06de1dadf16e5661db3c4b3ae6d48e35b2ff30bf0b61a71ba45"],["d68a80c8280bb840793234aa118f06231d6f1fc67e73c5a5deda0f5b496943e8","db8ba9fff4b586d00c4b1f9177b0e28b5b0e7b8f7845295a294c84266b133120"],["324aed7df65c804252dc0270907a30b09612aeb973449cea4095980fc28d3d5d","648a365774b61f2ff130c0c35aec1f4f19213b0c7e332843967224af96ab7c84"],["4df9c14919cde61f6d51dfdbe5fee5dceec4143ba8d1ca888e8bd373fd054c96","35ec51092d8728050974c23a1d85d4b5d506cdc288490192ebac06cad10d5d"],["9c3919a84a474870faed8a9c1cc66021523489054d7f0308cbfc99c8ac1f98cd","ddb84f0f4a4ddd57584f044bf260e641905326f76c64c8e6be7e5e03d4fc599d"],["6057170b1dd12fdf8de05f281d8e06bb91e1493a8b91d4cc5a21382120a959e5","9a1af0b26a6a4807add9a2daf71df262465152bc3ee24c65e899be932385a2a8"],["a576df8e23a08411421439a4518da31880cef0fba7d4df12b1a6973eecb94266","40a6bf20e76640b2c92b97afe58cd82c432e10a7f514d9f3ee8be11ae1b28ec8"],["7778a78c28dec3e30a05fe9629de8c38bb30d1f5cf9a3a208f763889be58ad71","34626d9ab5a5b22ff7098e12f2ff580087b38411ff24ac563b513fc1fd9f43ac"],["928955ee637a84463729fd30e7afd2ed5f96274e5ad7e5cb09eda9c06d903ac","c25621003d3f42a827b78a13093a95eeac3d26efa8a8d83fc5180e935bcd091f"],["85d0fef3ec6db109399064f3a0e3b2855645b4a907ad354527aae75163d82751","1f03648413a38c0be29d496e582cf5663e8751e96877331582c237a24eb1f962"],["ff2b0dce97eece97c1c9b6041798b85dfdfb6d8882da20308f5404824526087e","493d13fef524ba188af4c4dc54d07936c7b7ed6fb90e2ceb2c951e01f0c29907"],["827fbbe4b1e880ea9ed2b2e6301b212b57f1ee148cd6dd28780e5e2cf856e241","c60f9c923c727b0b71bef2c67d1d12687ff7a63186903166d605b68baec293ec"],["eaa649f21f51bdbae7be4ae34ce6e5217a58fdce7f47f9aa7f3b58fa2120e2b3","be3279ed5bbbb03ac69a80f89879aa5a01a6b965f13f7e59d47a5305ba5ad93d"],["e4a42d43c5cf169d9391df6decf42ee541b6d8f0c9a137401e23632dda34d24f","4d9f92e716d1c73526fc99ccfb8ad34ce886eedfa8d8e4f13a7f7131deba9414"],["1ec80fef360cbdd954160fadab352b6b92b53576a88fea4947173b9d4300bf19","aeefe93756b5340d2f3a4958a7abbf5e0146e77f6295a07b671cdc1cc107cefd"],["146a778c04670c2f91b00af4680dfa8bce3490717d58ba889ddb5928366642be","b318e0ec3354028add669827f9d4b2870aaa971d2f7e5ed1d0b297483d83efd0"],["fa50c0f61d22e5f07e3acebb1aa07b128d0012209a28b9776d76a8793180eef9","6b84c6922397eba9b72cd2872281a68a5e683293a57a213b38cd8d7d3f4f2811"],["da1d61d0ca721a11b1a5bf6b7d88e8421a288ab5d5bba5220e53d32b5f067ec2","8157f55a7c99306c79c0766161c91e2966a73899d279b48a655fba0f1ad836f1"],["a8e282ff0c9706907215ff98e8fd416615311de0446f1e062a73b0610d064e13","7f97355b8db81c09abfb7f3c5b2515888b679a3e50dd6bd6cef7c73111f4cc0c"],["174a53b9c9a285872d39e56e6913cab15d59b1fa512508c022f382de8319497c","ccc9dc37abfc9c1657b4155f2c47f9e6646b3a1d8cb9854383da13ac079afa73"],["959396981943785c3d3e57edf5018cdbe039e730e4918b3d884fdff09475b7ba","2e7e552888c331dd8ba0386a4b9cd6849c653f64c8709385e9b8abf87524f2fd"],["d2a63a50ae401e56d645a1153b109a8fcca0a43d561fba2dbb51340c9d82b151","e82d86fb6443fcb7565aee58b2948220a70f750af484ca52d4142174dcf89405"],["64587e2335471eb890ee7896d7cfdc866bacbdbd3839317b3436f9b45617e073","d99fcdd5bf6902e2ae96dd6447c299a185b90a39133aeab358299e5e9faf6589"],["8481bde0e4e4d885b3a546d3e549de042f0aa6cea250e7fd358d6c86dd45e458","38ee7b8cba5404dd84a25bf39cecb2ca900a79c42b262e556d64b1b59779057e"],["13464a57a78102aa62b6979ae817f4637ffcfed3c4b1ce30bcd6303f6caf666b","69be159004614580ef7e433453ccb0ca48f300a81d0942e13f495a907f6ecc27"],["bc4a9df5b713fe2e9aef430bcc1dc97a0cd9ccede2f28588cada3a0d2d83f366","d3a81ca6e785c06383937adf4b798caa6e8a9fbfa547b16d758d666581f33c1"],["8c28a97bf8298bc0d23d8c749452a32e694b65e30a9472a3954ab30fe5324caa","40a30463a3305193378fedf31f7cc0eb7ae784f0451cb9459e71dc73cbef9482"],["8ea9666139527a8c1dd94ce4f071fd23c8b350c5a4bb33748c4ba111faccae0","620efabbc8ee2782e24e7c0cfb95c5d735b783be9cf0f8e955af34a30e62b945"],["dd3625faef5ba06074669716bbd3788d89bdde815959968092f76cc4eb9a9787","7a188fa3520e30d461da2501045731ca941461982883395937f68d00c644a573"],["f710d79d9eb962297e4f6232b40e8f7feb2bc63814614d692c12de752408221e","ea98e67232d3b3295d3b535532115ccac8612c721851617526ae47a9c77bfc82"]]},naf:{wnd:7,points:[["f9308a019258c31049344f85f89d5229b531c845836f99b08601f113bce036f9","388f7b0f632de8140fe337e62a37f3566500a99934c2231b6cb9fd7584b8e672"],["2f8bde4d1a07209355b4a7250a5c5128e88b84bddc619ab7cba8d569b240efe4","d8ac222636e5e3d6d4dba9dda6c9c426f788271bab0d6840dca87d3aa6ac62d6"],["5cbdf0646e5db4eaa398f365f2ea7a0e3d419b7e0330e39ce92bddedcac4f9bc","6aebca40ba255960a3178d6d861a54dba813d0b813fde7b5a5082628087264da"],["acd484e2f0c7f65309ad178a9f559abde09796974c57e714c35f110dfc27ccbe","cc338921b0a7d9fd64380971763b61e9add888a4375f8e0f05cc262ac64f9c37"],["774ae7f858a9411e5ef4246b70c65aac5649980be5c17891bbec17895da008cb","d984a032eb6b5e190243dd56d7b7b365372db1e2dff9d6a8301d74c9c953c61b"],["f28773c2d975288bc7d1d205c3748651b075fbc6610e58cddeeddf8f19405aa8","ab0902e8d880a89758212eb65cdaf473a1a06da521fa91f29b5cb52db03ed81"],["d7924d4f7d43ea965a465ae3095ff41131e5946f3c85f79e44adbcf8e27e080e","581e2872a86c72a683842ec228cc6defea40af2bd896d3a5c504dc9ff6a26b58"],["defdea4cdb677750a420fee807eacf21eb9898ae79b9768766e4faa04a2d4a34","4211ab0694635168e997b0ead2a93daeced1f4a04a95c0f6cfb199f69e56eb77"],["2b4ea0a797a443d293ef5cff444f4979f06acfebd7e86d277475656138385b6c","85e89bc037945d93b343083b5a1c86131a01f60c50269763b570c854e5c09b7a"],["352bbf4a4cdd12564f93fa332ce333301d9ad40271f8107181340aef25be59d5","321eb4075348f534d59c18259dda3e1f4a1b3b2e71b1039c67bd3d8bcf81998c"],["2fa2104d6b38d11b0230010559879124e42ab8dfeff5ff29dc9cdadd4ecacc3f","2de1068295dd865b64569335bd5dd80181d70ecfc882648423ba76b532b7d67"],["9248279b09b4d68dab21a9b066edda83263c3d84e09572e269ca0cd7f5453714","73016f7bf234aade5d1aa71bdea2b1ff3fc0de2a887912ffe54a32ce97cb3402"],["daed4f2be3a8bf278e70132fb0beb7522f570e144bf615c07e996d443dee8729","a69dce4a7d6c98e8d4a1aca87ef8d7003f83c230f3afa726ab40e52290be1c55"],["c44d12c7065d812e8acf28d7cbb19f9011ecd9e9fdf281b0e6a3b5e87d22e7db","2119a460ce326cdc76c45926c982fdac0e106e861edf61c5a039063f0e0e6482"],["6a245bf6dc698504c89a20cfded60853152b695336c28063b61c65cbd269e6b4","e022cf42c2bd4a708b3f5126f16a24ad8b33ba48d0423b6efd5e6348100d8a82"],["1697ffa6fd9de627c077e3d2fe541084ce13300b0bec1146f95ae57f0d0bd6a5","b9c398f186806f5d27561506e4557433a2cf15009e498ae7adee9d63d01b2396"],["605bdb019981718b986d0f07e834cb0d9deb8360ffb7f61df982345ef27a7479","2972d2de4f8d20681a78d93ec96fe23c26bfae84fb14db43b01e1e9056b8c49"],["62d14dab4150bf497402fdc45a215e10dcb01c354959b10cfe31c7e9d87ff33d","80fc06bd8cc5b01098088a1950eed0db01aa132967ab472235f5642483b25eaf"],["80c60ad0040f27dade5b4b06c408e56b2c50e9f56b9b8b425e555c2f86308b6f","1c38303f1cc5c30f26e66bad7fe72f70a65eed4cbe7024eb1aa01f56430bd57a"],["7a9375ad6167ad54aa74c6348cc54d344cc5dc9487d847049d5eabb0fa03c8fb","d0e3fa9eca8726909559e0d79269046bdc59ea10c70ce2b02d499ec224dc7f7"],["d528ecd9b696b54c907a9ed045447a79bb408ec39b68df504bb51f459bc3ffc9","eecf41253136e5f99966f21881fd656ebc4345405c520dbc063465b521409933"],["49370a4b5f43412ea25f514e8ecdad05266115e4a7ecb1387231808f8b45963","758f3f41afd6ed428b3081b0512fd62a54c3f3afbb5b6764b653052a12949c9a"],["77f230936ee88cbbd73df930d64702ef881d811e0e1498e2f1c13eb1fc345d74","958ef42a7886b6400a08266e9ba1b37896c95330d97077cbbe8eb3c7671c60d6"],["f2dac991cc4ce4b9ea44887e5c7c0bce58c80074ab9d4dbaeb28531b7739f530","e0dedc9b3b2f8dad4da1f32dec2531df9eb5fbeb0598e4fd1a117dba703a3c37"],["463b3d9f662621fb1b4be8fbbe2520125a216cdfc9dae3debcba4850c690d45b","5ed430d78c296c3543114306dd8622d7c622e27c970a1de31cb377b01af7307e"],["f16f804244e46e2a09232d4aff3b59976b98fac14328a2d1a32496b49998f247","cedabd9b82203f7e13d206fcdf4e33d92a6c53c26e5cce26d6579962c4e31df6"],["caf754272dc84563b0352b7a14311af55d245315ace27c65369e15f7151d41d1","cb474660ef35f5f2a41b643fa5e460575f4fa9b7962232a5c32f908318a04476"],["2600ca4b282cb986f85d0f1709979d8b44a09c07cb86d7c124497bc86f082120","4119b88753c15bd6a693b03fcddbb45d5ac6be74ab5f0ef44b0be9475a7e4b40"],["7635ca72d7e8432c338ec53cd12220bc01c48685e24f7dc8c602a7746998e435","91b649609489d613d1d5e590f78e6d74ecfc061d57048bad9e76f302c5b9c61"],["754e3239f325570cdbbf4a87deee8a66b7f2b33479d468fbc1a50743bf56cc18","673fb86e5bda30fb3cd0ed304ea49a023ee33d0197a695d0c5d98093c536683"],["e3e6bd1071a1e96aff57859c82d570f0330800661d1c952f9fe2694691d9b9e8","59c9e0bba394e76f40c0aa58379a3cb6a5a2283993e90c4167002af4920e37f5"],["186b483d056a033826ae73d88f732985c4ccb1f32ba35f4b4cc47fdcf04aa6eb","3b952d32c67cf77e2e17446e204180ab21fb8090895138b4a4a797f86e80888b"],["df9d70a6b9876ce544c98561f4be4f725442e6d2b737d9c91a8321724ce0963f","55eb2dafd84d6ccd5f862b785dc39d4ab157222720ef9da217b8c45cf2ba2417"],["5edd5cc23c51e87a497ca815d5dce0f8ab52554f849ed8995de64c5f34ce7143","efae9c8dbc14130661e8cec030c89ad0c13c66c0d17a2905cdc706ab7399a868"],["290798c2b6476830da12fe02287e9e777aa3fba1c355b17a722d362f84614fba","e38da76dcd440621988d00bcf79af25d5b29c094db2a23146d003afd41943e7a"],["af3c423a95d9f5b3054754efa150ac39cd29552fe360257362dfdecef4053b45","f98a3fd831eb2b749a93b0e6f35cfb40c8cd5aa667a15581bc2feded498fd9c6"],["766dbb24d134e745cccaa28c99bf274906bb66b26dcf98df8d2fed50d884249a","744b1152eacbe5e38dcc887980da38b897584a65fa06cedd2c924f97cbac5996"],["59dbf46f8c94759ba21277c33784f41645f7b44f6c596a58ce92e666191abe3e","c534ad44175fbc300f4ea6ce648309a042ce739a7919798cd85e216c4a307f6e"],["f13ada95103c4537305e691e74e9a4a8dd647e711a95e73cb62dc6018cfd87b8","e13817b44ee14de663bf4bc808341f326949e21a6a75c2570778419bdaf5733d"],["7754b4fa0e8aced06d4167a2c59cca4cda1869c06ebadfb6488550015a88522c","30e93e864e669d82224b967c3020b8fa8d1e4e350b6cbcc537a48b57841163a2"],["948dcadf5990e048aa3874d46abef9d701858f95de8041d2a6828c99e2262519","e491a42537f6e597d5d28a3224b1bc25df9154efbd2ef1d2cbba2cae5347d57e"],["7962414450c76c1689c7b48f8202ec37fb224cf5ac0bfa1570328a8a3d7c77ab","100b610ec4ffb4760d5c1fc133ef6f6b12507a051f04ac5760afa5b29db83437"],["3514087834964b54b15b160644d915485a16977225b8847bb0dd085137ec47ca","ef0afbb2056205448e1652c48e8127fc6039e77c15c2378b7e7d15a0de293311"],["d3cc30ad6b483e4bc79ce2c9dd8bc54993e947eb8df787b442943d3f7b527eaf","8b378a22d827278d89c5e9be8f9508ae3c2ad46290358630afb34db04eede0a4"],["1624d84780732860ce1c78fcbfefe08b2b29823db913f6493975ba0ff4847610","68651cf9b6da903e0914448c6cd9d4ca896878f5282be4c8cc06e2a404078575"],["733ce80da955a8a26902c95633e62a985192474b5af207da6df7b4fd5fc61cd4","f5435a2bd2badf7d485a4d8b8db9fcce3e1ef8e0201e4578c54673bc1dc5ea1d"],["15d9441254945064cf1a1c33bbd3b49f8966c5092171e699ef258dfab81c045c","d56eb30b69463e7234f5137b73b84177434800bacebfc685fc37bbe9efe4070d"],["a1d0fcf2ec9de675b612136e5ce70d271c21417c9d2b8aaaac138599d0717940","edd77f50bcb5a3cab2e90737309667f2641462a54070f3d519212d39c197a629"],["e22fbe15c0af8ccc5780c0735f84dbe9a790badee8245c06c7ca37331cb36980","a855babad5cd60c88b430a69f53a1a7a38289154964799be43d06d77d31da06"],["311091dd9860e8e20ee13473c1155f5f69635e394704eaa74009452246cfa9b3","66db656f87d1f04fffd1f04788c06830871ec5a64feee685bd80f0b1286d8374"],["34c1fd04d301be89b31c0442d3e6ac24883928b45a9340781867d4232ec2dbdf","9414685e97b1b5954bd46f730174136d57f1ceeb487443dc5321857ba73abee"],["f219ea5d6b54701c1c14de5b557eb42a8d13f3abbcd08affcc2a5e6b049b8d63","4cb95957e83d40b0f73af4544cccf6b1f4b08d3c07b27fb8d8c2962a400766d1"],["d7b8740f74a8fbaab1f683db8f45de26543a5490bca627087236912469a0b448","fa77968128d9c92ee1010f337ad4717eff15db5ed3c049b3411e0315eaa4593b"],["32d31c222f8f6f0ef86f7c98d3a3335ead5bcd32abdd94289fe4d3091aa824bf","5f3032f5892156e39ccd3d7915b9e1da2e6dac9e6f26e961118d14b8462e1661"],["7461f371914ab32671045a155d9831ea8793d77cd59592c4340f86cbc18347b5","8ec0ba238b96bec0cbdddcae0aa442542eee1ff50c986ea6b39847b3cc092ff6"],["ee079adb1df1860074356a25aa38206a6d716b2c3e67453d287698bad7b2b2d6","8dc2412aafe3be5c4c5f37e0ecc5f9f6a446989af04c4e25ebaac479ec1c8c1e"],["16ec93e447ec83f0467b18302ee620f7e65de331874c9dc72bfd8616ba9da6b5","5e4631150e62fb40d0e8c2a7ca5804a39d58186a50e497139626778e25b0674d"],["eaa5f980c245f6f038978290afa70b6bd8855897f98b6aa485b96065d537bd99","f65f5d3e292c2e0819a528391c994624d784869d7e6ea67fb18041024edc07dc"],["78c9407544ac132692ee1910a02439958ae04877151342ea96c4b6b35a49f51","f3e0319169eb9b85d5404795539a5e68fa1fbd583c064d2462b675f194a3ddb4"],["494f4be219a1a77016dcd838431aea0001cdc8ae7a6fc688726578d9702857a5","42242a969283a5f339ba7f075e36ba2af925ce30d767ed6e55f4b031880d562c"],["a598a8030da6d86c6bc7f2f5144ea549d28211ea58faa70ebf4c1e665c1fe9b5","204b5d6f84822c307e4b4a7140737aec23fc63b65b35f86a10026dbd2d864e6b"],["c41916365abb2b5d09192f5f2dbeafec208f020f12570a184dbadc3e58595997","4f14351d0087efa49d245b328984989d5caf9450f34bfc0ed16e96b58fa9913"],["841d6063a586fa475a724604da03bc5b92a2e0d2e0a36acfe4c73a5514742881","73867f59c0659e81904f9a1c7543698e62562d6744c169ce7a36de01a8d6154"],["5e95bb399a6971d376026947f89bde2f282b33810928be4ded112ac4d70e20d5","39f23f366809085beebfc71181313775a99c9aed7d8ba38b161384c746012865"],["36e4641a53948fd476c39f8a99fd974e5ec07564b5315d8bf99471bca0ef2f66","d2424b1b1abe4eb8164227b085c9aa9456ea13493fd563e06fd51cf5694c78fc"],["336581ea7bfbbb290c191a2f507a41cf5643842170e914faeab27c2c579f726","ead12168595fe1be99252129b6e56b3391f7ab1410cd1e0ef3dcdcabd2fda224"],["8ab89816dadfd6b6a1f2634fcf00ec8403781025ed6890c4849742706bd43ede","6fdcef09f2f6d0a044e654aef624136f503d459c3e89845858a47a9129cdd24e"],["1e33f1a746c9c5778133344d9299fcaa20b0938e8acff2544bb40284b8c5fb94","60660257dd11b3aa9c8ed618d24edff2306d320f1d03010e33a7d2057f3b3b6"],["85b7c1dcb3cec1b7ee7f30ded79dd20a0ed1f4cc18cbcfcfa410361fd8f08f31","3d98a9cdd026dd43f39048f25a8847f4fcafad1895d7a633c6fed3c35e999511"],["29df9fbd8d9e46509275f4b125d6d45d7fbe9a3b878a7af872a2800661ac5f51","b4c4fe99c775a606e2d8862179139ffda61dc861c019e55cd2876eb2a27d84b"],["a0b1cae06b0a847a3fea6e671aaf8adfdfe58ca2f768105c8082b2e449fce252","ae434102edde0958ec4b19d917a6a28e6b72da1834aff0e650f049503a296cf2"],["4e8ceafb9b3e9a136dc7ff67e840295b499dfb3b2133e4ba113f2e4c0e121e5","cf2174118c8b6d7a4b48f6d534ce5c79422c086a63460502b827ce62a326683c"],["d24a44e047e19b6f5afb81c7ca2f69080a5076689a010919f42725c2b789a33b","6fb8d5591b466f8fc63db50f1c0f1c69013f996887b8244d2cdec417afea8fa3"],["ea01606a7a6c9cdd249fdfcfacb99584001edd28abbab77b5104e98e8e3b35d4","322af4908c7312b0cfbfe369f7a7b3cdb7d4494bc2823700cfd652188a3ea98d"],["af8addbf2b661c8a6c6328655eb96651252007d8c5ea31be4ad196de8ce2131f","6749e67c029b85f52a034eafd096836b2520818680e26ac8f3dfbcdb71749700"],["e3ae1974566ca06cc516d47e0fb165a674a3dabcfca15e722f0e3450f45889","2aeabe7e4531510116217f07bf4d07300de97e4874f81f533420a72eeb0bd6a4"],["591ee355313d99721cf6993ffed1e3e301993ff3ed258802075ea8ced397e246","b0ea558a113c30bea60fc4775460c7901ff0b053d25ca2bdeee98f1a4be5d196"],["11396d55fda54c49f19aa97318d8da61fa8584e47b084945077cf03255b52984","998c74a8cd45ac01289d5833a7beb4744ff536b01b257be4c5767bea93ea57a4"],["3c5d2a1ba39c5a1790000738c9e0c40b8dcdfd5468754b6405540157e017aa7a","b2284279995a34e2f9d4de7396fc18b80f9b8b9fdd270f6661f79ca4c81bd257"],["cc8704b8a60a0defa3a99a7299f2e9c3fbc395afb04ac078425ef8a1793cc030","bdd46039feed17881d1e0862db347f8cf395b74fc4bcdc4e940b74e3ac1f1b13"],["c533e4f7ea8555aacd9777ac5cad29b97dd4defccc53ee7ea204119b2889b197","6f0a256bc5efdf429a2fb6242f1a43a2d9b925bb4a4b3a26bb8e0f45eb596096"],["c14f8f2ccb27d6f109f6d08d03cc96a69ba8c34eec07bbcf566d48e33da6593","c359d6923bb398f7fd4473e16fe1c28475b740dd098075e6c0e8649113dc3a38"],["a6cbc3046bc6a450bac24789fa17115a4c9739ed75f8f21ce441f72e0b90e6ef","21ae7f4680e889bb130619e2c0f95a360ceb573c70603139862afd617fa9b9f"],["347d6d9a02c48927ebfb86c1359b1caf130a3c0267d11ce6344b39f99d43cc38","60ea7f61a353524d1c987f6ecec92f086d565ab687870cb12689ff1e31c74448"],["da6545d2181db8d983f7dcb375ef5866d47c67b1bf31c8cf855ef7437b72656a","49b96715ab6878a79e78f07ce5680c5d6673051b4935bd897fea824b77dc208a"],["c40747cc9d012cb1a13b8148309c6de7ec25d6945d657146b9d5994b8feb1111","5ca560753be2a12fc6de6caf2cb489565db936156b9514e1bb5e83037e0fa2d4"],["4e42c8ec82c99798ccf3a610be870e78338c7f713348bd34c8203ef4037f3502","7571d74ee5e0fb92a7a8b33a07783341a5492144cc54bcc40a94473693606437"],["3775ab7089bc6af823aba2e1af70b236d251cadb0c86743287522a1b3b0dedea","be52d107bcfa09d8bcb9736a828cfa7fac8db17bf7a76a2c42ad961409018cf7"],["cee31cbf7e34ec379d94fb814d3d775ad954595d1314ba8846959e3e82f74e26","8fd64a14c06b589c26b947ae2bcf6bfa0149ef0be14ed4d80f448a01c43b1c6d"],["b4f9eaea09b6917619f6ea6a4eb5464efddb58fd45b1ebefcdc1a01d08b47986","39e5c9925b5a54b07433a4f18c61726f8bb131c012ca542eb24a8ac07200682a"],["d4263dfc3d2df923a0179a48966d30ce84e2515afc3dccc1b77907792ebcc60e","62dfaf07a0f78feb30e30d6295853ce189e127760ad6cf7fae164e122a208d54"],["48457524820fa65a4f8d35eb6930857c0032acc0a4a2de422233eeda897612c4","25a748ab367979d98733c38a1fa1c2e7dc6cc07db2d60a9ae7a76aaa49bd0f77"],["dfeeef1881101f2cb11644f3a2afdfc2045e19919152923f367a1767c11cceda","ecfb7056cf1de042f9420bab396793c0c390bde74b4bbdff16a83ae09a9a7517"],["6d7ef6b17543f8373c573f44e1f389835d89bcbc6062ced36c82df83b8fae859","cd450ec335438986dfefa10c57fea9bcc521a0959b2d80bbf74b190dca712d10"],["e75605d59102a5a2684500d3b991f2e3f3c88b93225547035af25af66e04541f","f5c54754a8f71ee540b9b48728473e314f729ac5308b06938360990e2bfad125"],["eb98660f4c4dfaa06a2be453d5020bc99a0c2e60abe388457dd43fefb1ed620c","6cb9a8876d9cb8520609af3add26cd20a0a7cd8a9411131ce85f44100099223e"],["13e87b027d8514d35939f2e6892b19922154596941888336dc3563e3b8dba942","fef5a3c68059a6dec5d624114bf1e91aac2b9da568d6abeb2570d55646b8adf1"],["ee163026e9fd6fe017c38f06a5be6fc125424b371ce2708e7bf4491691e5764a","1acb250f255dd61c43d94ccc670d0f58f49ae3fa15b96623e5430da0ad6c62b2"],["b268f5ef9ad51e4d78de3a750c2dc89b1e626d43505867999932e5db33af3d80","5f310d4b3c99b9ebb19f77d41c1dee018cf0d34fd4191614003e945a1216e423"],["ff07f3118a9df035e9fad85eb6c7bfe42b02f01ca99ceea3bf7ffdba93c4750d","438136d603e858a3a5c440c38eccbaddc1d2942114e2eddd4740d098ced1f0d8"],["8d8b9855c7c052a34146fd20ffb658bea4b9f69e0d825ebec16e8c3ce2b526a1","cdb559eedc2d79f926baf44fb84ea4d44bcf50fee51d7ceb30e2e7f463036758"],["52db0b5384dfbf05bfa9d472d7ae26dfe4b851ceca91b1eba54263180da32b63","c3b997d050ee5d423ebaf66a6db9f57b3180c902875679de924b69d84a7b375"],["e62f9490d3d51da6395efd24e80919cc7d0f29c3f3fa48c6fff543becbd43352","6d89ad7ba4876b0b22c2ca280c682862f342c8591f1daf5170e07bfd9ccafa7d"],["7f30ea2476b399b4957509c88f77d0191afa2ff5cb7b14fd6d8e7d65aaab1193","ca5ef7d4b231c94c3b15389a5f6311e9daff7bb67b103e9880ef4bff637acaec"],["5098ff1e1d9f14fb46a210fada6c903fef0fb7b4a1dd1d9ac60a0361800b7a00","9731141d81fc8f8084d37c6e7542006b3ee1b40d60dfe5362a5b132fd17ddc0"],["32b78c7de9ee512a72895be6b9cbefa6e2f3c4ccce445c96b9f2c81e2778ad58","ee1849f513df71e32efc3896ee28260c73bb80547ae2275ba497237794c8753c"],["e2cb74fddc8e9fbcd076eef2a7c72b0ce37d50f08269dfc074b581550547a4f7","d3aa2ed71c9dd2247a62df062736eb0baddea9e36122d2be8641abcb005cc4a4"],["8438447566d4d7bedadc299496ab357426009a35f235cb141be0d99cd10ae3a8","c4e1020916980a4da5d01ac5e6ad330734ef0d7906631c4f2390426b2edd791f"],["4162d488b89402039b584c6fc6c308870587d9c46f660b878ab65c82c711d67e","67163e903236289f776f22c25fb8a3afc1732f2b84b4e95dbda47ae5a0852649"],["3fad3fa84caf0f34f0f89bfd2dcf54fc175d767aec3e50684f3ba4a4bf5f683d","cd1bc7cb6cc407bb2f0ca647c718a730cf71872e7d0d2a53fa20efcdfe61826"],["674f2600a3007a00568c1a7ce05d0816c1fb84bf1370798f1c69532faeb1a86b","299d21f9413f33b3edf43b257004580b70db57da0b182259e09eecc69e0d38a5"],["d32f4da54ade74abb81b815ad1fb3b263d82d6c692714bcff87d29bd5ee9f08f","f9429e738b8e53b968e99016c059707782e14f4535359d582fc416910b3eea87"],["30e4e670435385556e593657135845d36fbb6931f72b08cb1ed954f1e3ce3ff6","462f9bce619898638499350113bbc9b10a878d35da70740dc695a559eb88db7b"],["be2062003c51cc3004682904330e4dee7f3dcd10b01e580bf1971b04d4cad297","62188bc49d61e5428573d48a74e1c655b1c61090905682a0d5558ed72dccb9bc"],["93144423ace3451ed29e0fb9ac2af211cb6e84a601df5993c419859fff5df04a","7c10dfb164c3425f5c71a3f9d7992038f1065224f72bb9d1d902a6d13037b47c"],["b015f8044f5fcbdcf21ca26d6c34fb8197829205c7b7d2a7cb66418c157b112c","ab8c1e086d04e813744a655b2df8d5f83b3cdc6faa3088c1d3aea1454e3a1d5f"],["d5e9e1da649d97d89e4868117a465a3a4f8a18de57a140d36b3f2af341a21b52","4cb04437f391ed73111a13cc1d4dd0db1693465c2240480d8955e8592f27447a"],["d3ae41047dd7ca065dbf8ed77b992439983005cd72e16d6f996a5316d36966bb","bd1aeb21ad22ebb22a10f0303417c6d964f8cdd7df0aca614b10dc14d125ac46"],["463e2763d885f958fc66cdd22800f0a487197d0a82e377b49f80af87c897b065","bfefacdb0e5d0fd7df3a311a94de062b26b80c61fbc97508b79992671ef7ca7f"],["7985fdfd127c0567c6f53ec1bb63ec3158e597c40bfe747c83cddfc910641917","603c12daf3d9862ef2b25fe1de289aed24ed291e0ec6708703a5bd567f32ed03"],["74a1ad6b5f76e39db2dd249410eac7f99e74c59cb83d2d0ed5ff1543da7703e9","cc6157ef18c9c63cd6193d83631bbea0093e0968942e8c33d5737fd790e0db08"],["30682a50703375f602d416664ba19b7fc9bab42c72747463a71d0896b22f6da3","553e04f6b018b4fa6c8f39e7f311d3176290d0e0f19ca73f17714d9977a22ff8"],["9e2158f0d7c0d5f26c3791efefa79597654e7a2b2464f52b1ee6c1347769ef57","712fcdd1b9053f09003a3481fa7762e9ffd7c8ef35a38509e2fbf2629008373"],["176e26989a43c9cfeba4029c202538c28172e566e3c4fce7322857f3be327d66","ed8cc9d04b29eb877d270b4878dc43c19aefd31f4eee09ee7b47834c1fa4b1c3"],["75d46efea3771e6e68abb89a13ad747ecf1892393dfc4f1b7004788c50374da8","9852390a99507679fd0b86fd2b39a868d7efc22151346e1a3ca4726586a6bed8"],["809a20c67d64900ffb698c4c825f6d5f2310fb0451c869345b7319f645605721","9e994980d9917e22b76b061927fa04143d096ccc54963e6a5ebfa5f3f8e286c1"],["1b38903a43f7f114ed4500b4eac7083fdefece1cf29c63528d563446f972c180","4036edc931a60ae889353f77fd53de4a2708b26b6f5da72ad3394119daf408f9"]]}},Rf=rt((function(e,t){var r,i=t,n=Yd.assert;function a(e){if("short"===e.type)this.curve=new gf.short(e);else if("edwards"===e.type)this.curve=new gf.edwards(e);else {if("mont"!==e.type)throw Error("Unknown curve type.");this.curve=new gf.mont(e);}this.g=this.curve.g,this.n=this.curve.n,this.hash=e.hash,n(this.g.validate(),"Invalid curve"),n(this.g.mul(this.n).isInfinity(),"Invalid curve, n*G != O");}function s(e,t){Object.defineProperty(i,e,{configurable:!0,enumerable:!0,get:function(){var r=new a(t);return Object.defineProperty(i,e,{configurable:!0,enumerable:!0,value:r}),r}});}i.PresetCurve=a,s("p192",{type:"short",prime:"p192",p:"ffffffff ffffffff ffffffff fffffffe ffffffff ffffffff",a:"ffffffff ffffffff ffffffff fffffffe ffffffff fffffffc",b:"64210519 e59c80e7 0fa7e9ab 72243049 feb8deec c146b9b1",n:"ffffffff ffffffff ffffffff 99def836 146bc9b1 b4d22831",hash:Kf.sha256,gRed:!1,g:["188da80e b03090f6 7cbf20eb 43a18800 f4ff0afd 82ff1012","07192b95 ffc8da78 631011ed 6b24cdd5 73f977a1 1e794811"]}),s("p224",{type:"short",prime:"p224",p:"ffffffff ffffffff ffffffff ffffffff 00000000 00000000 00000001",a:"ffffffff ffffffff ffffffff fffffffe ffffffff ffffffff fffffffe",b:"b4050a85 0c04b3ab f5413256 5044b0b7 d7bfd8ba 270b3943 2355ffb4",n:"ffffffff ffffffff ffffffff ffff16a2 e0b8f03e 13dd2945 5c5c2a3d",hash:Kf.sha256,gRed:!1,g:["b70e0cbd 6bb4bf7f 321390b9 4a03c1d3 56c21122 343280d6 115c1d21","bd376388 b5f723fb 4c22dfe6 cd4375a0 5a074764 44d58199 85007e34"]}),s("p256",{type:"short",prime:null,p:"ffffffff 00000001 00000000 00000000 00000000 ffffffff ffffffff ffffffff",a:"ffffffff 00000001 00000000 00000000 00000000 ffffffff ffffffff fffffffc",b:"5ac635d8 aa3a93e7 b3ebbd55 769886bc 651d06b0 cc53b0f6 3bce3c3e 27d2604b",n:"ffffffff 00000000 ffffffff ffffffff bce6faad a7179e84 f3b9cac2 fc632551",hash:Kf.sha256,gRed:!1,g:["6b17d1f2 e12c4247 f8bce6e5 63a440f2 77037d81 2deb33a0 f4a13945 d898c296","4fe342e2 fe1a7f9b 8ee7eb4a 7c0f9e16 2bce3357 6b315ece cbb64068 37bf51f5"]}),s("p384",{type:"short",prime:null,p:"ffffffff ffffffff ffffffff ffffffff ffffffff ffffffff ffffffff fffffffe ffffffff 00000000 00000000 ffffffff",a:"ffffffff ffffffff ffffffff ffffffff ffffffff ffffffff ffffffff fffffffe ffffffff 00000000 00000000 fffffffc",b:"b3312fa7 e23ee7e4 988e056b e3f82d19 181d9c6e fe814112 0314088f 5013875a c656398d 8a2ed19d 2a85c8ed d3ec2aef",n:"ffffffff ffffffff ffffffff ffffffff ffffffff ffffffff c7634d81 f4372ddf 581a0db2 48b0a77a ecec196a ccc52973",hash:Kf.sha384,gRed:!1,g:["aa87ca22 be8b0537 8eb1c71e f320ad74 6e1d3b62 8ba79b98 59f741e0 82542a38 5502f25d bf55296c 3a545e38 72760ab7","3617de4a 96262c6f 5d9e98bf 9292dc29 f8f41dbd 289a147c e9da3113 b5f0b8c0 0a60b1ce 1d7e819d 7a431d7c 90ea0e5f"]}),s("p521",{type:"short",prime:null,p:"000001ff ffffffff ffffffff ffffffff ffffffff ffffffff ffffffff ffffffff ffffffff ffffffff ffffffff ffffffff ffffffff ffffffff ffffffff ffffffff ffffffff",a:"000001ff ffffffff ffffffff ffffffff ffffffff ffffffff ffffffff ffffffff ffffffff ffffffff ffffffff ffffffff ffffffff ffffffff ffffffff ffffffff fffffffc",b:"00000051 953eb961 8e1c9a1f 929a21a0 b68540ee a2da725b 99b315f3 b8b48991 8ef109e1 56193951 ec7e937b 1652c0bd 3bb1bf07 3573df88 3d2c34f1 ef451fd4 6b503f00",n:"000001ff ffffffff ffffffff ffffffff ffffffff ffffffff ffffffff ffffffff fffffffa 51868783 bf2f966b 7fcc0148 f709a5d0 3bb5c9b8 899c47ae bb6fb71e 91386409",hash:Kf.sha512,gRed:!1,g:["000000c6 858e06b7 0404e9cd 9e3ecb66 2395b442 9c648139 053fb521 f828af60 6b4d3dba a14b5e77 efe75928 fe1dc127 a2ffa8de 3348b3c1 856a429b f97e7e31 c2e5bd66","00000118 39296a78 9a3bc004 5c8a5fb4 2c7d1bd9 98f54449 579b4468 17afbd17 273e662c 97ee7299 5ef42640 c550b901 3fad0761 353c7086 a272c240 88be9476 9fd16650"]}),s("curve25519",{type:"mont",prime:"p25519",p:"7fffffffffffffff ffffffffffffffff ffffffffffffffff ffffffffffffffed",a:"76d06",b:"1",n:"1000000000000000 0000000000000000 14def9dea2f79cd6 5812631a5cf5d3ed",cofactor:"8",hash:Kf.sha256,gRed:!1,g:["9"]}),s("ed25519",{type:"edwards",prime:"p25519",p:"7fffffffffffffff ffffffffffffffff ffffffffffffffff ffffffffffffffed",a:"-1",c:"1",d:"52036cee2b6ffe73 8cc740797779e898 00700a4d4141d8ab 75eb4dca135978a3",n:"1000000000000000 0000000000000000 14def9dea2f79cd6 5812631a5cf5d3ed",cofactor:"8",hash:Kf.sha256,gRed:!1,g:["216936d3cd6e53fec0a4e231fdd6dc5c692cc7609525a7b2c9562d608f25d51a","6666666666666666666666666666666666666666666666666666666666666658"]}),s("brainpoolP256r1",{type:"short",prime:null,p:"A9FB57DB A1EEA9BC 3E660A90 9D838D72 6E3BF623 D5262028 2013481D 1F6E5377",a:"7D5A0975 FC2C3057 EEF67530 417AFFE7 FB8055C1 26DC5C6C E94A4B44 F330B5D9",b:"26DC5C6C E94A4B44 F330B5D9 BBD77CBF 95841629 5CF7E1CE 6BCCDC18 FF8C07B6",n:"A9FB57DB A1EEA9BC 3E660A90 9D838D71 8C397AA3 B561A6F7 901E0E82 974856A7",hash:Kf.sha256,gRed:!1,g:["8BD2AEB9CB7E57CB2C4B482FFC81B7AFB9DE27E1E3BD23C23A4453BD9ACE3262","547EF835C3DAC4FD97F8461A14611DC9C27745132DED8E545C1D54C72F046997"]}),s("brainpoolP384r1",{type:"short",prime:null,p:"8CB91E82 A3386D28 0F5D6F7E 50E641DF 152F7109 ED5456B4 12B1DA19 7FB71123ACD3A729 901D1A71 87470013 3107EC53",a:"7BC382C6 3D8C150C 3C72080A CE05AFA0 C2BEA28E 4FB22787 139165EF BA91F90F8AA5814A 503AD4EB 04A8C7DD 22CE2826",b:"04A8C7DD 22CE2826 8B39B554 16F0447C 2FB77DE1 07DCD2A6 2E880EA5 3EEB62D57CB43902 95DBC994 3AB78696 FA504C11",n:"8CB91E82 A3386D28 0F5D6F7E 50E641DF 152F7109 ED5456B3 1F166E6C AC0425A7CF3AB6AF 6B7FC310 3B883202 E9046565",hash:Kf.sha384,gRed:!1,g:["1D1C64F068CF45FFA2A63A81B7C13F6B8847A3E77EF14FE3DB7FCAFE0CBD10E8E826E03436D646AAEF87B2E247D4AF1E","8ABE1D7520F9C2A45CB1EB8E95CFD55262B70B29FEEC5864E19C054FF99129280E4646217791811142820341263C5315"]}),s("brainpoolP512r1",{type:"short",prime:null,p:"AADD9DB8 DBE9C48B 3FD4E6AE 33C9FC07 CB308DB3 B3C9D20E D6639CCA 703308717D4D9B00 9BC66842 AECDA12A E6A380E6 2881FF2F 2D82C685 28AA6056 583A48F3",a:"7830A331 8B603B89 E2327145 AC234CC5 94CBDD8D 3DF91610 A83441CA EA9863BC2DED5D5A A8253AA1 0A2EF1C9 8B9AC8B5 7F1117A7 2BF2C7B9 E7C1AC4D 77FC94CA",b:"3DF91610 A83441CA EA9863BC 2DED5D5A A8253AA1 0A2EF1C9 8B9AC8B5 7F1117A72BF2C7B9 E7C1AC4D 77FC94CA DC083E67 984050B7 5EBAE5DD 2809BD63 8016F723",n:"AADD9DB8 DBE9C48B 3FD4E6AE 33C9FC07 CB308DB3 B3C9D20E D6639CCA 70330870553E5C41 4CA92619 41866119 7FAC1047 1DB1D381 085DDADD B5879682 9CA90069",hash:Kf.sha512,gRed:!1,g:["81AEE4BDD82ED9645A21322E9C4C6A9385ED9F70B5D916C1B43B62EEF4D0098EFF3B1F78E2D0D48D50D1687B93B97D5F7C6D5047406A5E688B352209BCB9F822","7DDE385D566332ECC0EABFA9CF7822FDF209F70024A57B1AA000C55B881F8111B2DCDE494A5F485E5BCA4BD88A2763AED1CA2B2FA8F0540678CD1E0F3AD80892"]});try{r=Df;}catch(e){r=void 0;}s("secp256k1",{type:"short",prime:"k256",p:"ffffffff ffffffff ffffffff ffffffff ffffffff ffffffff fffffffe fffffc2f",a:"0",b:"7",n:"ffffffff ffffffff ffffffff fffffffe baaedce6 af48a03b bfd25e8c d0364141",h:"1",hash:Kf.sha256,beta:"7ae96a2b657c07106e64479eac3434e99cf0497512f58995c1396c28719501ee",lambda:"5363ad4cc05c30e0a5261c028812645a122e22ea20816678df02967c1b23bd72",basis:[{a:"3086d221a7d46bcde86c90e49284eb15",b:"-e4437ed6010e88286f547fa90abfe4c3"},{a:"114ca50f7a8e2f3f657c1108d9d44cfd8",b:"3086d221a7d46bcde86c90e49284eb15"}],gRed:!1,g:["79be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798","483ada7726a3c4655da4fbfc0e1108a8fd17b448a68554199c47d08ffb10d4b8",r]});}));function If(e){if(!(this instanceof If))return new If(e);this.hash=e.hash,this.predResist=!!e.predResist,this.outLen=this.hash.outSize,this.minEntropy=e.minEntropy||this.hash.hmacStrength,this._reseed=null,this.reseedInterval=null,this.K=null,this.V=null;var t=Zd.toArray(e.entropy,e.entropyEnc||"hex"),r=Zd.toArray(e.nonce,e.nonceEnc||"hex"),i=Zd.toArray(e.pers,e.persEnc||"hex");Qe(t.length>=this.minEntropy/8,"Not enough entropy. Minimum is: "+this.minEntropy+" bits"),this._init(t,r,i);}var Uf=If;If.prototype._init=function(e,t,r){var i=e.concat(t).concat(r);this.K=Array(this.outLen/8),this.V=Array(this.outLen/8);for(var n=0;n<this.V.length;n++)this.K[n]=0,this.V[n]=1;this._update(i),this._reseed=1,this.reseedInterval=281474976710656;},If.prototype._hmac=function(){return new Kf.hmac(this.hash,this.K)},If.prototype._update=function(e){var t=this._hmac().update(this.V).update([0]);e&&(t=t.update(e)),this.K=t.digest(),this.V=this._hmac().update(this.V).digest(),e&&(this.K=this._hmac().update(this.V).update([1]).update(e).digest(),this.V=this._hmac().update(this.V).digest());},If.prototype.reseed=function(e,t,r,i){"string"!=typeof t&&(i=r,r=t,t=null),e=Zd.toArray(e,t),r=Zd.toArray(r,i),Qe(e.length>=this.minEntropy/8,"Not enough entropy. Minimum is: "+this.minEntropy+" bits"),this._update(e.concat(r||[])),this._reseed=1;},If.prototype.generate=function(e,t,r,i){if(this._reseed>this.reseedInterval)throw Error("Reseed is required");"string"!=typeof t&&(i=r,r=t,t=null),r&&(r=Zd.toArray(r,i||"hex"),this._update(r));for(var n=[];n.length<e;)this.V=this._hmac().update(this.V).digest(),n=n.concat(this.V);var a=n.slice(0,e);return this._update(r),this._reseed++,Zd.encode(a,t)};var Bf=Yd.assert;function Tf(e,t){this.ec=e,this.priv=null,this.pub=null,t.priv&&this._importPrivate(t.priv,t.privEnc),t.pub&&this._importPublic(t.pub,t.pubEnc);}var zf=Tf;Tf.fromPublic=function(e,t,r){return t instanceof Tf?t:new Tf(e,{pub:t,pubEnc:r})},Tf.fromPrivate=function(e,t,r){return t instanceof Tf?t:new Tf(e,{priv:t,privEnc:r})},Tf.prototype.validate=function(){var e=this.getPublic();return e.isInfinity()?{result:!1,reason:"Invalid public key"}:e.validate()?e.mul(this.ec.curve.n).isInfinity()?{result:!0,reason:null}:{result:!1,reason:"Public key * N != O"}:{result:!1,reason:"Public key is not a point"}},Tf.prototype.getPublic=function(e,t){return this.pub||(this.pub=this.ec.g.mul(this.priv)),e?this.pub.encode(e,t):this.pub},Tf.prototype.getPrivate=function(e){return "hex"===e?this.priv.toString(16,2):this.priv},Tf.prototype._importPrivate=function(e,t){if(this.priv=new jd(e,t||16),"mont"===this.ec.curve.type){var r=this.ec.curve.one,i=r.ushln(252).sub(r).ushln(3);this.priv=this.priv.or(r.ushln(254)),this.priv=this.priv.and(i);}else this.priv=this.priv.umod(this.ec.curve.n);},Tf.prototype._importPublic=function(e,t){if(e.x||e.y)return "mont"===this.ec.curve.type?Bf(e.x,"Need x coordinate"):"short"!==this.ec.curve.type&&"edwards"!==this.ec.curve.type||Bf(e.x&&e.y,"Need both x and y coordinate"),void(this.pub=this.ec.curve.point(e.x,e.y));this.pub=this.ec.curve.decodePoint(e,t);},Tf.prototype.derive=function(e){return e.mul(this.priv).getX()},Tf.prototype.sign=function(e,t,r){return this.ec.sign(e,this,t,r)},Tf.prototype.verify=function(e,t){return this.ec.verify(e,t,this)},Tf.prototype.inspect=function(){return "<Key priv: "+(this.priv&&this.priv.toString(16,2))+" pub: "+(this.pub&&this.pub.inspect())+" >"};var qf=Yd.assert;function Ff(e,t){if(e instanceof Ff)return e;this._importDER(e,t)||(qf(e.r&&e.s,"Signature without r or s"),this.r=new jd(e.r,16),this.s=new jd(e.s,16),void 0===e.recoveryParam?this.recoveryParam=null:this.recoveryParam=e.recoveryParam);}var Of=Ff;function Nf(){this.place=0;}function Lf(e,t){var r=e[t.place++];if(!(128&r))return r;for(var i=15&r,n=0,a=0,s=t.place;a<i;a++,s++)n<<=8,n|=e[s];return t.place=s,n}function jf(e){for(var t=0,r=e.length-1;!e[t]&&!(128&e[t+1])&&t<r;)t++;return 0===t?e:e.slice(t)}function Wf(e,t){if(t<128)e.push(t);else {var r=1+(Math.log(t)/Math.LN2>>>3);for(e.push(128|r);--r;)e.push(t>>>(r<<3)&255);e.push(t);}}Ff.prototype._importDER=function(e,t){e=Yd.toArray(e,t);var r=new Nf;if(48!==e[r.place++])return !1;if(Lf(e,r)+r.place!==e.length)return !1;if(2!==e[r.place++])return !1;var i=Lf(e,r),n=e.slice(r.place,i+r.place);if(r.place+=i,2!==e[r.place++])return !1;var a=Lf(e,r);if(e.length!==a+r.place)return !1;var s=e.slice(r.place,a+r.place);return 0===n[0]&&128&n[1]&&(n=n.slice(1)),0===s[0]&&128&s[1]&&(s=s.slice(1)),this.r=new jd(n),this.s=new jd(s),this.recoveryParam=null,!0},Ff.prototype.toDER=function(e){var t=this.r.toArray(),r=this.s.toArray();for(128&t[0]&&(t=[0].concat(t)),128&r[0]&&(r=[0].concat(r)),t=jf(t),r=jf(r);!(r[0]||128&r[1]);)r=r.slice(1);var i=[2];Wf(i,t.length),(i=i.concat(t)).push(2),Wf(i,r.length);var n=i.concat(r),a=[48];return Wf(a,n.length),a=a.concat(n),Yd.encode(a,e)};var Hf=Yd.assert;function Gf(e){if(!(this instanceof Gf))return new Gf(e);"string"==typeof e&&(Hf(Rf.hasOwnProperty(e),"Unknown curve "+e),e=Rf[e]),e instanceof Rf.PresetCurve&&(e={curve:e}),this.curve=e.curve.curve,this.n=this.curve.n,this.nh=this.n.ushrn(1),this.g=this.curve.g,this.g=e.curve.g,this.g.precompute(e.curve.n.bitLength()+1),this.hash=e.hash||e.curve.hash;}var Vf=Gf;Gf.prototype.keyPair=function(e){return new zf(this,e)},Gf.prototype.keyFromPrivate=function(e,t){return zf.fromPrivate(this,e,t)},Gf.prototype.keyFromPublic=function(e,t){return zf.fromPublic(this,e,t)},Gf.prototype.genKeyPair=function(e){e||(e={});var t=new Uf({hash:this.hash,pers:e.pers,persEnc:e.persEnc||"utf8",entropy:e.entropy||$d(this.hash.hmacStrength),entropyEnc:e.entropy&&e.entropyEnc||"utf8",nonce:this.n.toArray()});if("mont"===this.curve.type){var r=new jd(t.generate(32));return this.keyFromPrivate(r)}for(var i=this.n.byteLength(),n=this.n.sub(new jd(2));;){if(!((r=new jd(t.generate(i))).cmp(n)>0))return r.iaddn(1),this.keyFromPrivate(r)}},Gf.prototype._truncateToN=function(e,t,r){var i=(r=r||8*e.byteLength())-this.n.bitLength();return i>0&&(e=e.ushrn(i)),!t&&e.cmp(this.n)>=0?e.sub(this.n):e},Gf.prototype.truncateMsg=function(e){var t;return e instanceof Uint8Array?(t=8*e.byteLength,e=this._truncateToN(new jd(e,16),!1,t)):"string"==typeof e?(t=4*e.length,e=this._truncateToN(new jd(e,16),!1,t)):e=this._truncateToN(new jd(e,16)),e},Gf.prototype.sign=function(e,t,r,i){"object"==typeof r&&(i=r,r=null),i||(i={}),t=this.keyFromPrivate(t,r),e=this.truncateMsg(e);for(var n=this.n.byteLength(),a=t.getPrivate().toArray("be",n),s=e.toArray("be",n),o=new Uf({hash:this.hash,entropy:a,nonce:s,pers:i.pers,persEnc:i.persEnc||"utf8"}),c=this.n.sub(new jd(1)),u=0;;u++){var h=i.k?i.k(u):new jd(o.generate(this.n.byteLength()));if(!((h=this._truncateToN(h,!0)).cmpn(1)<=0||h.cmp(c)>=0)){var d=this.g.mul(h);if(!d.isInfinity()){var f=d.getX(),l=f.umod(this.n);if(0!==l.cmpn(0)){var p=h.invm(this.n).mul(l.mul(t.getPrivate()).iadd(e));if(0!==(p=p.umod(this.n)).cmpn(0)){var y=(d.getY().isOdd()?1:0)|(0!==f.cmp(l)?2:0);return i.canonical&&p.cmp(this.nh)>0&&(p=this.n.sub(p),y^=1),new Of({r:l,s:p,recoveryParam:y})}}}}}},Gf.prototype.verify=function(e,t,r,i){return r=this.keyFromPublic(r,i),t=new Of(t,"hex"),this._verify(this.truncateMsg(e),t,r)||this._verify(this._truncateToN(new jd(e,16)),t,r)},Gf.prototype._verify=function(e,t,r){var i=t.r,n=t.s;if(i.cmpn(1)<0||i.cmp(this.n)>=0)return !1;if(n.cmpn(1)<0||n.cmp(this.n)>=0)return !1;var a,s=n.invm(this.n),o=s.mul(e).umod(this.n),c=s.mul(i).umod(this.n);return this.curve._maxwellTrick?!(a=this.g.jmulAdd(o,r.getPublic(),c)).isInfinity()&&a.eqXToP(i):!(a=this.g.mulAdd(o,r.getPublic(),c)).isInfinity()&&0===a.getX().umod(this.n).cmp(i)},Gf.prototype.recoverPubKey=function(e,t,r,i){Hf((3&r)===r,"The recovery param is more than two bits"),t=new Of(t,i);var n=this.n,a=new jd(e),s=t.r,o=t.s,c=1&r,u=r>>1;if(s.cmp(this.curve.p.umod(this.curve.n))>=0&&u)throw Error("Unable to find sencond key candinate");s=u?this.curve.pointFromX(s.add(this.curve.n),c):this.curve.pointFromX(s,c);var h=t.r.invm(n),d=n.sub(a).mul(h).umod(n),f=o.mul(h).umod(n);return this.g.mulAdd(d,s,f)},Gf.prototype.getKeyRecoveryParam=function(e,t,r,i){if(null!==(t=new Of(t,i)).recoveryParam)return t.recoveryParam;for(var n=0;n<4;n++){var a;try{a=this.recoverPubKey(e,t,n);}catch(e){continue}if(a.eq(r))return n}throw Error("Unable to find valid recovery factor")};var Zf=Yd.assert,Yf=Yd.parseBytes,$f=Yd.cachedProperty;function Xf(e,t){if(this.eddsa=e,t.hasOwnProperty("secret")&&(this._secret=Yf(t.secret)),e.isPoint(t.pub))this._pub=t.pub;else if(this._pubBytes=Yf(t.pub),this._pubBytes&&33===this._pubBytes.length&&64===this._pubBytes[0]&&(this._pubBytes=this._pubBytes.slice(1,33)),this._pubBytes&&32!==this._pubBytes.length)throw Error("Unknown point compression format")}Xf.fromPublic=function(e,t){return t instanceof Xf?t:new Xf(e,{pub:t})},Xf.fromSecret=function(e,t){return t instanceof Xf?t:new Xf(e,{secret:t})},Xf.prototype.secret=function(){return this._secret},$f(Xf,"pubBytes",(function(){return this.eddsa.encodePoint(this.pub())})),$f(Xf,"pub",(function(){return this._pubBytes?this.eddsa.decodePoint(this._pubBytes):this.eddsa.g.mul(this.priv())})),$f(Xf,"privBytes",(function(){var e=this.eddsa,t=this.hash(),r=e.encodingLength-1,i=t.slice(0,e.encodingLength);return i[0]&=248,i[r]&=127,i[r]|=64,i})),$f(Xf,"priv",(function(){return this.eddsa.decodeInt(this.privBytes())})),$f(Xf,"hash",(function(){return this.eddsa.hash().update(this.secret()).digest()})),$f(Xf,"messagePrefix",(function(){return this.hash().slice(this.eddsa.encodingLength)})),Xf.prototype.sign=function(e){return Zf(this._secret,"KeyPair can only verify"),this.eddsa.sign(e,this)},Xf.prototype.verify=function(e,t){return this.eddsa.verify(e,t,this)},Xf.prototype.getSecret=function(e){return Zf(this._secret,"KeyPair is public only"),Yd.encode(this.secret(),e)},Xf.prototype.getPublic=function(e,t){return Yd.encode((t?[64]:[]).concat(this.pubBytes()),e)};var Jf=Xf,Qf=Yd.assert,el=Yd.cachedProperty,tl=Yd.parseBytes;function rl(e,t){this.eddsa=e,"object"!=typeof t&&(t=tl(t)),Array.isArray(t)&&(t={R:t.slice(0,e.encodingLength),S:t.slice(e.encodingLength)}),Qf(t.R&&t.S,"Signature without R or S"),e.isPoint(t.R)&&(this._R=t.R),t.S instanceof jd&&(this._S=t.S),this._Rencoded=Array.isArray(t.R)?t.R:t.Rencoded,this._Sencoded=Array.isArray(t.S)?t.S:t.Sencoded;}el(rl,"S",(function(){return this.eddsa.decodeInt(this.Sencoded())})),el(rl,"R",(function(){return this.eddsa.decodePoint(this.Rencoded())})),el(rl,"Rencoded",(function(){return this.eddsa.encodePoint(this.R())})),el(rl,"Sencoded",(function(){return this.eddsa.encodeInt(this.S())})),rl.prototype.toBytes=function(){return this.Rencoded().concat(this.Sencoded())},rl.prototype.toHex=function(){return Yd.encode(this.toBytes(),"hex").toUpperCase()};var il=rl,nl=Yd.assert,al=Yd.parseBytes;function sl(e){if(nl("ed25519"===e,"only tested with ed25519 so far"),!(this instanceof sl))return new sl(e);e=Rf[e].curve;this.curve=e,this.g=e.g,this.g.precompute(e.n.bitLength()+1),this.pointClass=e.point().constructor,this.encodingLength=Math.ceil(e.n.bitLength()/8),this.hash=Kf.sha512;}var ol=sl;sl.prototype.sign=function(e,t){e=al(e);var r=this.keyFromSecret(t),i=this.hashInt(r.messagePrefix(),e),n=this.g.mul(i),a=this.encodePoint(n),s=this.hashInt(a,r.pubBytes(),e).mul(r.priv()),o=i.add(s).umod(this.curve.n);return this.makeSignature({R:n,S:o,Rencoded:a})},sl.prototype.verify=function(e,t,r){e=al(e),t=this.makeSignature(t);var i=this.keyFromPublic(r),n=this.hashInt(t.Rencoded(),i.pubBytes(),e),a=this.g.mul(t.S());return t.R().add(i.pub().mul(n)).eq(a)},sl.prototype.hashInt=function(){for(var e=this.hash(),t=0;t<arguments.length;t++)e.update(arguments[t]);return Yd.intFromLE(e.digest()).umod(this.curve.n)},sl.prototype.keyPair=function(e){return new Jf(this,e)},sl.prototype.keyFromPublic=function(e){return Jf.fromPublic(this,e)},sl.prototype.keyFromSecret=function(e){return Jf.fromSecret(this,e)},sl.prototype.genKeyPair=function(e){e||(e={});var t=new Uf({hash:this.hash,pers:e.pers,persEnc:e.persEnc||"utf8",entropy:e.entropy||$d(this.hash.hmacStrength),entropyEnc:e.entropy&&e.entropyEnc||"utf8",nonce:this.curve.n.toArray()});return this.keyFromSecret(t.generate(32))},sl.prototype.makeSignature=function(e){return e instanceof il?e:new il(this,e)},sl.prototype.encodePoint=function(e){var t=e.getY().toArray("le",this.encodingLength);return t[this.encodingLength-1]|=e.getX().isOdd()?128:0,t},sl.prototype.decodePoint=function(e){var t=(e=Yd.parseBytes(e)).length-1,r=e.slice(0,t).concat(-129&e[t]),i=0!=(128&e[t]),n=Yd.intFromLE(r);return this.curve.pointFromY(n,i)},sl.prototype.encodeInt=function(e){return e.toArray("le",this.encodingLength)},sl.prototype.decodeInt=function(e){return Yd.intFromLE(e)},sl.prototype.isPoint=function(e){return e instanceof this.pointClass};var cl=rt((function(e,t){var r=t;r.utils=Yd,r.rand=$d,r.curve=gf,r.curves=Rf,r.ec=Vf,r.eddsa=ol;})),ul=/*#__PURE__*/Object.freeze({__proto__:null,default:cl,__moduleExports:cl});

    /* src/components/Footer.svelte generated by Svelte v3.32.3 */
    const file = "src/components/Footer.svelte";

    function create_fragment(ctx) {
    	let footer;
    	let div0;
    	let span0;
    	let t1;
    	let a0;
    	let t3;
    	let span1;
    	let t5;
    	let a1;
    	let t7;
    	let div3;
    	let div1;
    	let span2;
    	let t9;
    	let div2;
    	let object;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			footer = element("footer");
    			div0 = element("div");
    			span0 = element("span");
    			span0.textContent = "email";
    			t1 = space();
    			a0 = element("a");
    			a0.textContent = "click to reveal";
    			t3 = space();
    			span1 = element("span");
    			span1.textContent = "pgp";
    			t5 = space();
    			a1 = element("a");
    			a1.textContent = "66D8 3E03 39D3 A010";
    			t7 = space();
    			div3 = element("div");
    			div1 = element("div");
    			span2 = element("span");
    			span2.textContent = "This frog marks the end of the page.";
    			t9 = space();
    			div2 = element("div");
    			object = element("object");
    			attr_dev(span0, "class", "svelte-ldnj96");
    			add_location(span0, file, 97, 4, 5083);
    			attr_dev(a0, "href", "./");
    			attr_dev(a0, "class", "svelte-ldnj96");
    			add_location(a0, file, 98, 4, 5107);
    			attr_dev(span1, "class", "svelte-ldnj96");
    			add_location(span1, file, 99, 4, 5160);
    			attr_dev(a1, "href", "https://keybase.io/nicksahler");
    			attr_dev(a1, "class", "svelte-ldnj96");
    			add_location(a1, file, 100, 4, 5181);
    			attr_dev(div0, "class", "contact svelte-ldnj96");
    			add_location(div0, file, 96, 2, 5057);
    			attr_dev(span2, "class", "svelte-ldnj96");
    			add_location(span2, file, 103, 26, 5300);
    			attr_dev(div1, "class", "overflow svelte-ldnj96");
    			add_location(div1, file, 103, 4, 5278);
    			attr_dev(object, "title", "Frog");
    			attr_dev(object, "class", "frog svelte-ldnj96");
    			attr_dev(object, "data", "./frog.svg");
    			attr_dev(object, "type", "image/svg+xml");
    			add_location(object, file, 105, 6, 5393);
    			attr_dev(div2, "class", "frog-wrapper svelte-ldnj96");
    			add_location(div2, file, 104, 4, 5360);
    			attr_dev(div3, "class", "end svelte-ldnj96");
    			add_location(div3, file, 102, 2, 5256);
    			attr_dev(footer, "class", "full-width subgrid svelte-ldnj96");
    			add_location(footer, file, 95, 0, 5019);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, footer, anchor);
    			append_dev(footer, div0);
    			append_dev(div0, span0);
    			append_dev(div0, t1);
    			append_dev(div0, a0);
    			append_dev(div0, t3);
    			append_dev(div0, span1);
    			append_dev(div0, t5);
    			append_dev(div0, a1);
    			append_dev(footer, t7);
    			append_dev(footer, div3);
    			append_dev(div3, div1);
    			append_dev(div1, span2);
    			append_dev(div3, t9);
    			append_dev(div3, div2);
    			append_dev(div2, object);

    			if (!mounted) {
    				dispose = listen_dev(a0, "click", /*load*/ ctx[0], false, false, false);
    				mounted = true;
    			}
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(footer);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Footer", slots, []);

    	const armoredKey = `
-----BEGIN PGP PUBLIC KEY BLOCK-----

mQINBFMum5cBEACqMHtCmgg7Sfw2VdQnS2zEplHlHWvN2hdnQsYw0bOx2GjE7eQl
pi9hEPJVKbZcvWm0CLXKb1JlUnxrsbt5CF68xre4bBPQOGnt4LO/bUPw5UxVjzyE
dBJjCKjsLOJzoBRTG1RTzeuRlT26dJLBQh6mmT0JSOCmAOrKpwZkK/hy4tBnT4Hh
yTFc+oCLAwktW6Os/Q/UD4/QUeVkouzbb5PbBCcg4wezAN2pFnCDqLEMeb0bYrIu
C7HVTmDIOv5SPNeFcus7LLAh+KIlDHk+K1ZJfa8pys0f9F0+NtmWxe7nWDBjF+b6
Hp2FQgh3QRy4eGv3gM0mYcLzuWR6Iim4RJjUufE8eN2BZddYQ9C6xB0MCpITOVge
Z4B7hQ5aRdY27+blkj+PoED8ahDkP2/13w7+8Y030LmcWMSw9z1u32D/YJZpgMum
0LwMydSjKYcK2X0ayNAz4gGPaZfuavHRgBG2e+gCvCQgqRtEDq23y+x3NsrnEq3u
TZ5mc0R91z3GOGNRQ4s9TRWJkWpn89lCVGITU6hxsvzkvBtp7I7KY6qUmtaArGHm
o1POCWgLmokMZbXOuPRWx2t8uYAp4UaFkd3c0NwvrwSe4VmNg+RbmJU1sgzrXYtB
bMlzzEiGSo+cgy1NukrL415FJlKQ2xWz1vmIPUEC9Umb8bPXMz7yCJxkJQARAQAB
tC1rZXliYXNlLmlvL25pY2tzYWhsZXIgPG5pY2tzYWhsZXJAa2V5YmFzZS5pbz6J
Ai0EEwEKABcFAlMum5cCGy8DCwkHAxUKCAIeAQIXgAAKCRBm2D4DOdOgEMHgEACj
M8CtCuGp3Y4/pIMl8KjtsBOsFLEdp1EnzxvIUHCTisjdOxK5Qbt6Qy9QmMSldYHo
/qq3K3sG5n01J/3pvnM6Y0Dzc4z7s/GWIcnco9ZQnabFAJYBIplItSDACd7xdCem
/Hk0aBKje5WIGGPeYBaiBsw+JrKAKasZVJ1t+B402gFmi0XgORSdMgQVLY15THGV
0OpzZaSgMlvgv5IcY2ZgEdisOmczDRVToiQPloFWSumYQPh8dp8RcesWn8/rS/jr
3xH3LMCdaCT5XcOMNWMaKmZ7JDwMyBc8H3XXv5PcZV+r0npEAOuzF0opkHgR1kzn
y/6ujFPOJLIo8DU1Y42DttIbfyu8GtqaLWpxmjbKctk6pwGikbFqQQMWKve/A2k+
vYODP1pNGJTJNKp9DBOd9fvU46R3FYQAaJJwbspZyIpLVqcQXfUnf9rakn4gAIYy
GNKNosnzFuu0S3A0d+9K/ONGpzgTq8yQjEPRpGuYgNEbLBj1y8PLwcOFanKxHiga
jvnp4GWteuycSGIwxuPbDYOHGVS7q8TvJoOyeeI8/CDnvVuh+/0dGtULPi8xPPeV
+RR5i3u3oQCXXYNlAHd7CmKu3+/TatIsPJZuBeBbaALoglwzkrzAsiy6tzb7mLw+
v7L1gpRKftOOhXX2IqGsluOgWYaIXFSWiK9VvqZUCLRCTmljayBTYWhsZXIgKEdp
dGh1YiBBZGRyZXNzKSA8bmlja3NhaGxlckB1c2Vycy5ub3JlcGx5LmdpdGh1Yi5j
b20+iQJOBBMBCAA4FiEEw0pkxdSt1f/T8wE9Ztg+AznToBAFAl5lO5ECGy8FCwkI
BwIGFQoJCAsCBBYCAwECHgECF4AACgkQZtg+AznToBB41g//ScpQvxlKwUdXyJdd
r3h+SYhnT4JuaW3i6fi7MdPzJy2EyzcGYTM+E+m/L/c6d0JkLhH3K5ksKRiYK0Ij
cTbrc9jj6NEZQnOAUeDb/QYMwwaYq78zEXQ1A1yGDHcJHv61P16SvTEdptN3BrIO
Cps0RWpMC0v98Go9NOyOvb4lRglfcsSnzFN/vYIfu5i1+f7uUF4MbmOrnqrQkeKn
n/oYo36iPdg1q0Rm3KRTKsdcNFlGwgPGvnZ/wvwAlaYlODnNB52sRhJGLrkKAu4P
QO2rF1kq4FnoSIJe1l5IGj+eVR91PbZVftZfZsAZs0Tbuz9fZJvdHLWRLhRNv3pn
4yKI+WmOqhGZT7QhqJrhSMn8pN0OICOq771CTCmMRQYrjDXfDO0pczuqeTTFnuBS
rEO7AnUvW5qgHaJwXdIbkSlZCwSrBMBD6VeauEbcoVrTC8AtPjOn5YbJiX5GJuCU
2oEGKMI7I+flhNeOI5/Wn+8FGcie+MEkUp6MGHqB0p0+0PDMnmT9pH8VoJ1V5Oxd
N+JR7SXcZh6Oom1tdlnQoF+WAV6bVYvtIzARB4HLUcnk7wxRUNn9A4otCz8fIbkc
c9CEXCewTYRs3MNfFvMNBR0jadexnPYgypEg7Pzy1od78DCjeviT63uGp8LCrKMY
MgFF+WSomkbJZCeBrr0SkKvzswi5AQ0EUy6blwEIALdeViVu/B23Nwr6H+tyIu1+
ZtaHFKWH/uxfu5Z0GeIgsm2eZvjXLvp/UoehdvFw9UA6LcWfQuGlUpSDDXhZhyYt
LaIQUlqh6qqGhJH3dlCTatIkj1vKwNArW4ep7t7bWbzFUNnxf3GPlXz3VBDufGXO
D7XXIopnzWv9NZ9+W4rMNfUUAKKZUVqSYno8tzBtB5G+/Kn71d/rYsE1CmSpfIZg
v8p9C13D2J7GqE63LYt1Yk6ZA423gJCs3Rf8aLRGJzkE1a9GfnFWi+lObUmR/LRu
M3GfC62ao/Ay7VKW554GNvFHoDk+qzjcWADSyXWVx2+uuopLZ8cnrq7f4Fp0cAMA
EQEAAYkDRAQYAQoADwUCUy6blwUJDwmcAAIbLgEpCRBm2D4DOdOgEMBdIAQZAQoA
BgUCUy6blwAKCRCg7cKPadxfjxWkCACMZRG0l0NLcMU1tXHiZbtcgToQ1EjO1pXs
f/v8B+XSpwo6lJ2XaVWOrn7PeiPduihPXO7lw3uhnqPvdrgzv8MkJaKuwUvXEzkv
5eNxq8k/2ojYjbpAdmbb79dam2AmTvn4L1PtcnqTHgltniHtiCRHe5K4AeHGJhnS
MtcdQMudhT8eXrJ5OWoB2hSpxJvp7Y276aEmjH6U8m5C2o3tmDCJM/cOZ5LeuSSM
snqZEKG8Q8ZE/uliMsxiwc2W9sjprHCYta09QnlE/9N302Il28SMizJbwx/CowQ9
xISOFZe5PUha4PCyUgaguVweZtXVtL2g9uC6670Ml/OR25oG0LEXDn0P/3cRnFSc
lqvJl4W/swt2wbTLnTeurbdzuvP/zeVCDKnL+TVZVg1hPtIEK4bHHjF+YQVESlOj
7Qr78M697Dd9rHXuYsaSOIvqKCmBdUNHMVsOpPQOLROaerJlyy/jFNr9a+cDglmD
u+6QgsfI+Jj25VFshLUuR4d4R6+CXI+MxKdzvmX6N2SCVbewalvUe7JlqkMcd67z
O1AVoEPi2DfvP3rF3kuN7H1eCfYYEKML5RB5BxhpMZrnjBiXmw5PuCt2Z41xBSO2
ymL5P16IM8M0ZOl3uWMjeGDKNbzSEaQqJnwYbQDovamZ8Yz0cab66bpm+ess8WTf
zBgd1/TT2LX3c498LpyyGW5UWqp0miTp0i+tQFaGfweScnq+vF6eVcgMPNh7H8H+
IcnG2ziJ3Jm1LczeQGDYD4D+9RrZPam7dBAqo1O0Sg2NRkZCS0AX+NWcCGFlvwBM
mijxHF6qRKMZHOrICqykEVzhmIwm1d5tU9iHaqbb+08bLeXR5uP1Qflj2I4AyOVH
ThA3gS5FnoS5TNfFRqg5/4iBg3F65P0Cvfv5jClUOb83Hf+Zwr27F/1+Dz0DcP0p
8QV6A78n+tRa6j0edAoCaSF0hxEWwsDlHoOUbma8ij7I/HTK2k/1ueLRkM9yjjd0
Wa3ugGOxPxAsrJaWsWDBA6lC+qLp1CO7en1X
=Rsrt
-----END PGP PUBLIC KEY BLOCK-----`;

    	const armoredMessage = `
-----BEGIN PGP MESSAGE-----

xA0DAAgBoO3Cj2ncX48By+F0AOIAAAAA5G1haWx0bzpuaWNrQHNhaGziZXIuY+Bv
AMLAXAQAAQgAEAUCYK7RUgkQoO3Cj2ncX48AAMwTCAAgO8XSHnjDgtUCS8JR2IJO
Ql7pTxsiYmdsTNKdBQyStRnV1K8NS17zkbGa+Re0Ic6T027Xp1xQdKRqzT6VHmyj
NKpAtupwHFPq+y/NlXapDKc6VXxNb4ZKyQz2QQNFkWCKE9DA5yaMpBWXRjHcR4B8
aU+ObL1tluWCRr4Uc5u5rFmvSKvVTMoHJ4P+zOajr2+k2GY+SkbIsGhjDvJ3kVEr
Sd2ixgARV0Y1x2QGqncvsmIJzwJw7FskOewFRAxDUjvTI265ztTZdIDt7y63Nkaa
C3d333sCzULrfvlzflJrBovspINrajpdF4UpnTYCxz5Vjsxw3+fxxzrhMudj30Ns
=qy7m
-----END PGP MESSAGE-----`;

    	const load = async e => {
    		e.preventDefault();
    		const publicKey = await jo({ armoredKey });
    		const message = await Xo({ armoredMessage });
    		const signature = await dc({ message, publicKeys: publicKey });
    		const text = signature.data.trim();
    		e.target.href = text;
    		e.target.innerText = text.split(":")[1];
    	};

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Footer> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		readKey: jo,
    		readMessage: Xo,
    		decrypt: uc,
    		verify: dc,
    		armoredKey,
    		armoredMessage,
    		load
    	});

    	return [load];
    }

    class Footer extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Footer",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    /* src/components/Header.svelte generated by Svelte v3.32.3 */

    const file$1 = "src/components/Header.svelte";

    function create_fragment$1(ctx) {
    	let header;
    	let p;
    	let strong;
    	let t1;
    	let a0;
    	let t3;
    	let a1;
    	let t5;
    	let a2;
    	let t7;
    	let a3;
    	let t9;

    	const block = {
    		c: function create() {
    			header = element("header");
    			p = element("p");
    			strong = element("strong");
    			strong.textContent = "Nick Sahler";
    			t1 = text(" is a ");
    			a0 = element("a");
    			a0.textContent = "machine learning engineer";
    			t3 = text(" at ");
    			a1 = element("a");
    			a1.textContent = "Squarespace";
    			t5 = text(", and is helping organize ");
    			a2 = element("a");
    			a2.textContent = "Natives in Tech";
    			t7 = text(" as a contributor and board member. In his free time he advocates for ");
    			a3 = element("a");
    			a3.textContent = "Indigenous language preservation";
    			t9 = text(".");
    			add_location(strong, file$1, 1, 5, 42);
    			attr_dev(a0, "class", "jiggle svelte-wndjxd");
    			attr_dev(a0, "href", "#");
    			add_location(a0, file$1, 1, 39, 76);
    			attr_dev(a1, "class", "jiggle svelte-wndjxd");
    			attr_dev(a1, "href", "https://squarespace.com");
    			add_location(a1, file$1, 1, 99, 136);
    			attr_dev(a2, "class", "jiggle svelte-wndjxd");
    			attr_dev(a2, "href", "https://nativesintech.org/");
    			add_location(a2, file$1, 1, 189, 226);
    			attr_dev(a3, "class", "jiggle svelte-wndjxd");
    			attr_dev(a3, "href", "#indigenous");
    			add_location(a3, file$1, 1, 330, 367);
    			attr_dev(p, "class", "svelte-wndjxd");
    			add_location(p, file$1, 1, 2, 39);
    			attr_dev(header, "class", "description subgrid svelte-wndjxd");
    			add_location(header, file$1, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, header, anchor);
    			append_dev(header, p);
    			append_dev(p, strong);
    			append_dev(p, t1);
    			append_dev(p, a0);
    			append_dev(p, t3);
    			append_dev(p, a1);
    			append_dev(p, t5);
    			append_dev(p, a2);
    			append_dev(p, t7);
    			append_dev(p, a3);
    			append_dev(p, t9);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(header);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Header", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Header> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class Header extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Header",
    			options,
    			id: create_fragment$1.name
    		});
    	}
    }

    /* src/components/Project.svelte generated by Svelte v3.32.3 */

    const file$2 = "src/components/Project.svelte";

    // (16:4) {#if info}
    function create_if_block_1(ctx) {
    	let p;

    	const block = {
    		c: function create() {
    			p = element("p");
    			add_location(p, file$2, 15, 14, 310);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    			p.innerHTML = /*info*/ ctx[2];
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*info*/ 4) p.innerHTML = /*info*/ ctx[2];		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(16:4) {#if info}",
    		ctx
    	});

    	return block;
    }

    // (19:2) {#if !wide }
    function create_if_block(ctx) {
    	let img;
    	let img_src_value;

    	const block = {
    		c: function create() {
    			img = element("img");
    			attr_dev(img, "class", "thumbnail svelte-1eytp0f");
    			if (img.src !== (img_src_value = /*image*/ ctx[4].src)) attr_dev(img, "src", img_src_value);
    			add_location(img, file$2, 19, 4, 375);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, img, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*image*/ 16 && img.src !== (img_src_value = /*image*/ ctx[4].src)) {
    				attr_dev(img, "src", img_src_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(img);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(19:2) {#if !wide }",
    		ctx
    	});

    	return block;
    }

    function create_fragment$2(ctx) {
    	let a;
    	let time;
    	let t0;
    	let div;
    	let span;
    	let t1;
    	let t2;
    	let t3;
    	let t4;
    	let current;
    	let if_block0 = /*info*/ ctx[2] && create_if_block_1(ctx);
    	const default_slot_template = /*#slots*/ ctx[8].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[7], null);
    	let if_block1 = !/*wide*/ ctx[5] && create_if_block(ctx);

    	const block = {
    		c: function create() {
    			a = element("a");
    			time = element("time");
    			t0 = space();
    			div = element("div");
    			span = element("span");
    			t1 = text(/*title*/ ctx[1]);
    			t2 = space();
    			if (if_block0) if_block0.c();
    			t3 = space();
    			if (default_slot) default_slot.c();
    			t4 = space();
    			if (if_block1) if_block1.c();
    			attr_dev(time, "class", "svelte-1eytp0f");
    			add_location(time, file$2, 12, 2, 199);
    			attr_dev(span, "class", "title svelte-1eytp0f");
    			add_location(span, file$2, 14, 4, 261);
    			attr_dev(div, "class", "info svelte-1eytp0f");
    			toggle_class(div, "wide", /*wide*/ ctx[5]);
    			add_location(div, file$2, 13, 2, 227);
    			attr_dev(a, "href", /*url*/ ctx[0]);
    			attr_dev(a, "class", "example subgrid svelte-1eytp0f");
    			add_location(a, file$2, 11, 0, 157);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, a, anchor);
    			append_dev(a, time);
    			time.innerHTML = /*date*/ ctx[3];
    			append_dev(a, t0);
    			append_dev(a, div);
    			append_dev(div, span);
    			append_dev(span, t1);
    			append_dev(div, t2);
    			if (if_block0) if_block0.m(div, null);
    			append_dev(div, t3);

    			if (default_slot) {
    				default_slot.m(div, null);
    			}

    			append_dev(a, t4);
    			if (if_block1) if_block1.m(a, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (!current || dirty & /*date*/ 8) time.innerHTML = /*date*/ ctx[3];			if (!current || dirty & /*title*/ 2) set_data_dev(t1, /*title*/ ctx[1]);

    			if (/*info*/ ctx[2]) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);
    				} else {
    					if_block0 = create_if_block_1(ctx);
    					if_block0.c();
    					if_block0.m(div, t3);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 128) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[7], dirty, null, null);
    				}
    			}

    			if (dirty & /*wide*/ 32) {
    				toggle_class(div, "wide", /*wide*/ ctx[5]);
    			}

    			if (!/*wide*/ ctx[5]) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);
    				} else {
    					if_block1 = create_if_block(ctx);
    					if_block1.c();
    					if_block1.m(a, null);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}

    			if (!current || dirty & /*url*/ 1) {
    				attr_dev(a, "href", /*url*/ ctx[0]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(a);
    			if (if_block0) if_block0.d();
    			if (default_slot) default_slot.d(detaching);
    			if (if_block1) if_block1.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let wide;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Project", slots, ['default']);
    	let { url } = $$props;
    	let { title } = $$props;
    	let { info } = $$props;
    	let { date } = $$props;
    	let { image } = $$props;
    	let { hide } = $$props;
    	const writable_props = ["url", "title", "info", "date", "image", "hide"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Project> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("url" in $$props) $$invalidate(0, url = $$props.url);
    		if ("title" in $$props) $$invalidate(1, title = $$props.title);
    		if ("info" in $$props) $$invalidate(2, info = $$props.info);
    		if ("date" in $$props) $$invalidate(3, date = $$props.date);
    		if ("image" in $$props) $$invalidate(4, image = $$props.image);
    		if ("hide" in $$props) $$invalidate(6, hide = $$props.hide);
    		if ("$$scope" in $$props) $$invalidate(7, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		url,
    		title,
    		info,
    		date,
    		image,
    		hide,
    		wide
    	});

    	$$self.$inject_state = $$props => {
    		if ("url" in $$props) $$invalidate(0, url = $$props.url);
    		if ("title" in $$props) $$invalidate(1, title = $$props.title);
    		if ("info" in $$props) $$invalidate(2, info = $$props.info);
    		if ("date" in $$props) $$invalidate(3, date = $$props.date);
    		if ("image" in $$props) $$invalidate(4, image = $$props.image);
    		if ("hide" in $$props) $$invalidate(6, hide = $$props.hide);
    		if ("wide" in $$props) $$invalidate(5, wide = $$props.wide);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*hide, image*/ 80) {
    			$$invalidate(5, wide = hide || !image);
    		}
    	};

    	return [url, title, info, date, image, wide, hide, $$scope, slots];
    }

    class Project extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$2, create_fragment$2, safe_not_equal, {
    			url: 0,
    			title: 1,
    			info: 2,
    			date: 3,
    			image: 4,
    			hide: 6
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Project",
    			options,
    			id: create_fragment$2.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*url*/ ctx[0] === undefined && !("url" in props)) {
    			console.warn("<Project> was created without expected prop 'url'");
    		}

    		if (/*title*/ ctx[1] === undefined && !("title" in props)) {
    			console.warn("<Project> was created without expected prop 'title'");
    		}

    		if (/*info*/ ctx[2] === undefined && !("info" in props)) {
    			console.warn("<Project> was created without expected prop 'info'");
    		}

    		if (/*date*/ ctx[3] === undefined && !("date" in props)) {
    			console.warn("<Project> was created without expected prop 'date'");
    		}

    		if (/*image*/ ctx[4] === undefined && !("image" in props)) {
    			console.warn("<Project> was created without expected prop 'image'");
    		}

    		if (/*hide*/ ctx[6] === undefined && !("hide" in props)) {
    			console.warn("<Project> was created without expected prop 'hide'");
    		}
    	}

    	get url() {
    		throw new Error("<Project>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set url(value) {
    		throw new Error("<Project>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get title() {
    		throw new Error("<Project>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set title(value) {
    		throw new Error("<Project>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get info() {
    		throw new Error("<Project>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set info(value) {
    		throw new Error("<Project>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get date() {
    		throw new Error("<Project>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set date(value) {
    		throw new Error("<Project>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get image() {
    		throw new Error("<Project>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set image(value) {
    		throw new Error("<Project>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get hide() {
    		throw new Error("<Project>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set hide(value) {
    		throw new Error("<Project>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    const subscriber_queue = [];
    /**
     * Creates a `Readable` store that allows reading by subscription.
     * @param value initial value
     * @param {StartStopNotifier}start start and stop notifications for subscriptions
     */
    function readable(value, start) {
        return {
            subscribe: writable(value, start).subscribe
        };
    }
    /**
     * Create a `Writable` store that allows both updating and reading by subscription.
     * @param {*=}value initial value
     * @param {StartStopNotifier=}start start and stop notifications for subscriptions
     */
    function writable(value, start = noop) {
        let stop;
        const subscribers = [];
        function set(new_value) {
            if (safe_not_equal(value, new_value)) {
                value = new_value;
                if (stop) { // store is ready
                    const run_queue = !subscriber_queue.length;
                    for (let i = 0; i < subscribers.length; i += 1) {
                        const s = subscribers[i];
                        s[1]();
                        subscriber_queue.push(s, value);
                    }
                    if (run_queue) {
                        for (let i = 0; i < subscriber_queue.length; i += 2) {
                            subscriber_queue[i][0](subscriber_queue[i + 1]);
                        }
                        subscriber_queue.length = 0;
                    }
                }
            }
        }
        function update(fn) {
            set(fn(value));
        }
        function subscribe(run, invalidate = noop) {
            const subscriber = [run, invalidate];
            subscribers.push(subscriber);
            if (subscribers.length === 1) {
                stop = start(set) || noop;
            }
            run(value);
            return () => {
                const index = subscribers.indexOf(subscriber);
                if (index !== -1) {
                    subscribers.splice(index, 1);
                }
                if (subscribers.length === 0) {
                    stop();
                    stop = null;
                }
            };
        }
        return { set, update, subscribe };
    }
    function derived(stores, fn, initial_value) {
        const single = !Array.isArray(stores);
        const stores_array = single
            ? [stores]
            : stores;
        const auto = fn.length < 2;
        return readable(initial_value, (set) => {
            let inited = false;
            const values = [];
            let pending = 0;
            let cleanup = noop;
            const sync = () => {
                if (pending) {
                    return;
                }
                cleanup();
                const result = fn(single ? values[0] : values, set);
                if (auto) {
                    set(result);
                }
                else {
                    cleanup = is_function(result) ? result : noop;
                }
            };
            const unsubscribers = stores_array.map((store, i) => subscribe(store, (value) => {
                values[i] = value;
                pending &= ~(1 << i);
                if (inited) {
                    sync();
                }
            }, () => {
                pending |= (1 << i);
            }));
            inited = true;
            sync();
            return function stop() {
                run_all(unsubscribers);
                cleanup();
            };
        });
    }

    const LOCATION = {};
    const ROUTER = {};

    /**
     * Adapted from https://github.com/reach/router/blob/b60e6dd781d5d3a4bdaaf4de665649c0f6a7e78d/src/lib/history.js
     *
     * https://github.com/reach/router/blob/master/LICENSE
     * */

    function getLocation(source) {
      return {
        ...source.location,
        state: source.history.state,
        key: (source.history.state && source.history.state.key) || "initial"
      };
    }

    function createHistory(source, options) {
      const listeners = [];
      let location = getLocation(source);

      return {
        get location() {
          return location;
        },

        listen(listener) {
          listeners.push(listener);

          const popstateListener = () => {
            location = getLocation(source);
            listener({ location, action: "POP" });
          };

          source.addEventListener("popstate", popstateListener);

          return () => {
            source.removeEventListener("popstate", popstateListener);

            const index = listeners.indexOf(listener);
            listeners.splice(index, 1);
          };
        },

        navigate(to, { state, replace = false } = {}) {
          state = { ...state, key: Date.now() + "" };
          // try...catch iOS Safari limits to 100 pushState calls
          try {
            if (replace) {
              source.history.replaceState(state, null, to);
            } else {
              source.history.pushState(state, null, to);
            }
          } catch (e) {
            source.location[replace ? "replace" : "assign"](to);
          }

          location = getLocation(source);
          listeners.forEach(listener => listener({ location, action: "PUSH" }));
        }
      };
    }

    // Stores history entries in memory for testing or other platforms like Native
    function createMemorySource(initialPathname = "/") {
      let index = 0;
      const stack = [{ pathname: initialPathname, search: "" }];
      const states = [];

      return {
        get location() {
          return stack[index];
        },
        addEventListener(name, fn) {},
        removeEventListener(name, fn) {},
        history: {
          get entries() {
            return stack;
          },
          get index() {
            return index;
          },
          get state() {
            return states[index];
          },
          pushState(state, _, uri) {
            const [pathname, search = ""] = uri.split("?");
            index++;
            stack.push({ pathname, search });
            states.push(state);
          },
          replaceState(state, _, uri) {
            const [pathname, search = ""] = uri.split("?");
            stack[index] = { pathname, search };
            states[index] = state;
          }
        }
      };
    }

    // Global history uses window.history as the source if available,
    // otherwise a memory history
    const canUseDOM = Boolean(
      typeof window !== "undefined" &&
        window.document &&
        window.document.createElement
    );
    const globalHistory = createHistory(canUseDOM ? window : createMemorySource());
    const { navigate } = globalHistory;

    /**
     * Adapted from https://github.com/reach/router/blob/b60e6dd781d5d3a4bdaaf4de665649c0f6a7e78d/src/lib/utils.js
     *
     * https://github.com/reach/router/blob/master/LICENSE
     * */

    const paramRe = /^:(.+)/;

    const SEGMENT_POINTS = 4;
    const STATIC_POINTS = 3;
    const DYNAMIC_POINTS = 2;
    const SPLAT_PENALTY = 1;
    const ROOT_POINTS = 1;

    /**
     * Check if `string` starts with `search`
     * @param {string} string
     * @param {string} search
     * @return {boolean}
     */
    function startsWith(string, search) {
      return string.substr(0, search.length) === search;
    }

    /**
     * Check if `segment` is a root segment
     * @param {string} segment
     * @return {boolean}
     */
    function isRootSegment(segment) {
      return segment === "";
    }

    /**
     * Check if `segment` is a dynamic segment
     * @param {string} segment
     * @return {boolean}
     */
    function isDynamic(segment) {
      return paramRe.test(segment);
    }

    /**
     * Check if `segment` is a splat
     * @param {string} segment
     * @return {boolean}
     */
    function isSplat(segment) {
      return segment[0] === "*";
    }

    /**
     * Split up the URI into segments delimited by `/`
     * @param {string} uri
     * @return {string[]}
     */
    function segmentize(uri) {
      return (
        uri
          // Strip starting/ending `/`
          .replace(/(^\/+|\/+$)/g, "")
          .split("/")
      );
    }

    /**
     * Strip `str` of potential start and end `/`
     * @param {string} str
     * @return {string}
     */
    function stripSlashes(str) {
      return str.replace(/(^\/+|\/+$)/g, "");
    }

    /**
     * Score a route depending on how its individual segments look
     * @param {object} route
     * @param {number} index
     * @return {object}
     */
    function rankRoute(route, index) {
      const score = route.default
        ? 0
        : segmentize(route.path).reduce((score, segment) => {
            score += SEGMENT_POINTS;

            if (isRootSegment(segment)) {
              score += ROOT_POINTS;
            } else if (isDynamic(segment)) {
              score += DYNAMIC_POINTS;
            } else if (isSplat(segment)) {
              score -= SEGMENT_POINTS + SPLAT_PENALTY;
            } else {
              score += STATIC_POINTS;
            }

            return score;
          }, 0);

      return { route, score, index };
    }

    /**
     * Give a score to all routes and sort them on that
     * @param {object[]} routes
     * @return {object[]}
     */
    function rankRoutes(routes) {
      return (
        routes
          .map(rankRoute)
          // If two routes have the exact same score, we go by index instead
          .sort((a, b) =>
            a.score < b.score ? 1 : a.score > b.score ? -1 : a.index - b.index
          )
      );
    }

    /**
     * Ranks and picks the best route to match. Each segment gets the highest
     * amount of points, then the type of segment gets an additional amount of
     * points where
     *
     *  static > dynamic > splat > root
     *
     * This way we don't have to worry about the order of our routes, let the
     * computers do it.
     *
     * A route looks like this
     *
     *  { path, default, value }
     *
     * And a returned match looks like:
     *
     *  { route, params, uri }
     *
     * @param {object[]} routes
     * @param {string} uri
     * @return {?object}
     */
    function pick(routes, uri) {
      let match;
      let default_;

      const [uriPathname] = uri.split("?");
      const uriSegments = segmentize(uriPathname);
      const isRootUri = uriSegments[0] === "";
      const ranked = rankRoutes(routes);

      for (let i = 0, l = ranked.length; i < l; i++) {
        const route = ranked[i].route;
        let missed = false;

        if (route.default) {
          default_ = {
            route,
            params: {},
            uri
          };
          continue;
        }

        const routeSegments = segmentize(route.path);
        const params = {};
        const max = Math.max(uriSegments.length, routeSegments.length);
        let index = 0;

        for (; index < max; index++) {
          const routeSegment = routeSegments[index];
          const uriSegment = uriSegments[index];

          if (routeSegment !== undefined && isSplat(routeSegment)) {
            // Hit a splat, just grab the rest, and return a match
            // uri:   /files/documents/work
            // route: /files/* or /files/*splatname
            const splatName = routeSegment === "*" ? "*" : routeSegment.slice(1);

            params[splatName] = uriSegments
              .slice(index)
              .map(decodeURIComponent)
              .join("/");
            break;
          }

          if (uriSegment === undefined) {
            // URI is shorter than the route, no match
            // uri:   /users
            // route: /users/:userId
            missed = true;
            break;
          }

          let dynamicMatch = paramRe.exec(routeSegment);

          if (dynamicMatch && !isRootUri) {
            const value = decodeURIComponent(uriSegment);
            params[dynamicMatch[1]] = value;
          } else if (routeSegment !== uriSegment) {
            // Current segments don't match, not dynamic, not splat, so no match
            // uri:   /users/123/settings
            // route: /users/:id/profile
            missed = true;
            break;
          }
        }

        if (!missed) {
          match = {
            route,
            params,
            uri: "/" + uriSegments.slice(0, index).join("/")
          };
          break;
        }
      }

      return match || default_ || null;
    }

    /**
     * Check if the `path` matches the `uri`.
     * @param {string} path
     * @param {string} uri
     * @return {?object}
     */
    function match(route, uri) {
      return pick([route], uri);
    }

    /**
     * Add the query to the pathname if a query is given
     * @param {string} pathname
     * @param {string} [query]
     * @return {string}
     */
    function addQuery(pathname, query) {
      return pathname + (query ? `?${query}` : "");
    }

    /**
     * Resolve URIs as though every path is a directory, no files. Relative URIs
     * in the browser can feel awkward because not only can you be "in a directory",
     * you can be "at a file", too. For example:
     *
     *  browserSpecResolve('foo', '/bar/') => /bar/foo
     *  browserSpecResolve('foo', '/bar') => /foo
     *
     * But on the command line of a file system, it's not as complicated. You can't
     * `cd` from a file, only directories. This way, links have to know less about
     * their current path. To go deeper you can do this:
     *
     *  <Link to="deeper"/>
     *  // instead of
     *  <Link to=`{${props.uri}/deeper}`/>
     *
     * Just like `cd`, if you want to go deeper from the command line, you do this:
     *
     *  cd deeper
     *  # not
     *  cd $(pwd)/deeper
     *
     * By treating every path as a directory, linking to relative paths should
     * require less contextual information and (fingers crossed) be more intuitive.
     * @param {string} to
     * @param {string} base
     * @return {string}
     */
    function resolve(to, base) {
      // /foo/bar, /baz/qux => /foo/bar
      if (startsWith(to, "/")) {
        return to;
      }

      const [toPathname, toQuery] = to.split("?");
      const [basePathname] = base.split("?");
      const toSegments = segmentize(toPathname);
      const baseSegments = segmentize(basePathname);

      // ?a=b, /users?b=c => /users?a=b
      if (toSegments[0] === "") {
        return addQuery(basePathname, toQuery);
      }

      // profile, /users/789 => /users/789/profile
      if (!startsWith(toSegments[0], ".")) {
        const pathname = baseSegments.concat(toSegments).join("/");

        return addQuery((basePathname === "/" ? "" : "/") + pathname, toQuery);
      }

      // ./       , /users/123 => /users/123
      // ../      , /users/123 => /users
      // ../..    , /users/123 => /
      // ../../one, /a/b/c/d   => /a/b/one
      // .././one , /a/b/c/d   => /a/b/c/one
      const allSegments = baseSegments.concat(toSegments);
      const segments = [];

      allSegments.forEach(segment => {
        if (segment === "..") {
          segments.pop();
        } else if (segment !== ".") {
          segments.push(segment);
        }
      });

      return addQuery("/" + segments.join("/"), toQuery);
    }

    /**
     * Combines the `basepath` and the `path` into one path.
     * @param {string} basepath
     * @param {string} path
     */
    function combinePaths(basepath, path) {
      return `${stripSlashes(
    path === "/" ? basepath : `${stripSlashes(basepath)}/${stripSlashes(path)}`
  )}/`;
    }

    /**
     * Decides whether a given `event` should result in a navigation or not.
     * @param {object} event
     */
    function shouldNavigate(event) {
      return (
        !event.defaultPrevented &&
        event.button === 0 &&
        !(event.metaKey || event.altKey || event.ctrlKey || event.shiftKey)
      );
    }

    function hostMatches(anchor) {
      const host = location.host;
      return (
        anchor.host == host ||
        // svelte seems to kill anchor.host value in ie11, so fall back to checking href
        anchor.href.indexOf(`https://${host}`) === 0 ||
        anchor.href.indexOf(`http://${host}`) === 0
      )
    }

    /* node_modules/svelte-routing/src/Router.svelte generated by Svelte v3.32.3 */

    function create_fragment$3(ctx) {
    	let current;
    	const default_slot_template = /*#slots*/ ctx[9].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[8], null);

    	const block = {
    		c: function create() {
    			if (default_slot) default_slot.c();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (default_slot) {
    				default_slot.m(target, anchor);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 256) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[8], dirty, null, null);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let $base;
    	let $location;
    	let $routes;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Router", slots, ['default']);
    	let { basepath = "/" } = $$props;
    	let { url = null } = $$props;
    	const locationContext = getContext(LOCATION);
    	const routerContext = getContext(ROUTER);
    	const routes = writable([]);
    	validate_store(routes, "routes");
    	component_subscribe($$self, routes, value => $$invalidate(7, $routes = value));
    	const activeRoute = writable(null);
    	let hasActiveRoute = false; // Used in SSR to synchronously set that a Route is active.

    	// If locationContext is not set, this is the topmost Router in the tree.
    	// If the `url` prop is given we force the location to it.
    	const location = locationContext || writable(url ? { pathname: url } : globalHistory.location);

    	validate_store(location, "location");
    	component_subscribe($$self, location, value => $$invalidate(6, $location = value));

    	// If routerContext is set, the routerBase of the parent Router
    	// will be the base for this Router's descendants.
    	// If routerContext is not set, the path and resolved uri will both
    	// have the value of the basepath prop.
    	const base = routerContext
    	? routerContext.routerBase
    	: writable({ path: basepath, uri: basepath });

    	validate_store(base, "base");
    	component_subscribe($$self, base, value => $$invalidate(5, $base = value));

    	const routerBase = derived([base, activeRoute], ([base, activeRoute]) => {
    		// If there is no activeRoute, the routerBase will be identical to the base.
    		if (activeRoute === null) {
    			return base;
    		}

    		const { path: basepath } = base;
    		const { route, uri } = activeRoute;

    		// Remove the potential /* or /*splatname from
    		// the end of the child Routes relative paths.
    		const path = route.default
    		? basepath
    		: route.path.replace(/\*.*$/, "");

    		return { path, uri };
    	});

    	function registerRoute(route) {
    		const { path: basepath } = $base;
    		let { path } = route;

    		// We store the original path in the _path property so we can reuse
    		// it when the basepath changes. The only thing that matters is that
    		// the route reference is intact, so mutation is fine.
    		route._path = path;

    		route.path = combinePaths(basepath, path);

    		if (typeof window === "undefined") {
    			// In SSR we should set the activeRoute immediately if it is a match.
    			// If there are more Routes being registered after a match is found,
    			// we just skip them.
    			if (hasActiveRoute) {
    				return;
    			}

    			const matchingRoute = match(route, $location.pathname);

    			if (matchingRoute) {
    				activeRoute.set(matchingRoute);
    				hasActiveRoute = true;
    			}
    		} else {
    			routes.update(rs => {
    				rs.push(route);
    				return rs;
    			});
    		}
    	}

    	function unregisterRoute(route) {
    		routes.update(rs => {
    			const index = rs.indexOf(route);
    			rs.splice(index, 1);
    			return rs;
    		});
    	}

    	if (!locationContext) {
    		// The topmost Router in the tree is responsible for updating
    		// the location store and supplying it through context.
    		onMount(() => {
    			const unlisten = globalHistory.listen(history => {
    				location.set(history.location);
    			});

    			return unlisten;
    		});

    		setContext(LOCATION, location);
    	}

    	setContext(ROUTER, {
    		activeRoute,
    		base,
    		routerBase,
    		registerRoute,
    		unregisterRoute
    	});

    	const writable_props = ["basepath", "url"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Router> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("basepath" in $$props) $$invalidate(3, basepath = $$props.basepath);
    		if ("url" in $$props) $$invalidate(4, url = $$props.url);
    		if ("$$scope" in $$props) $$invalidate(8, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		getContext,
    		setContext,
    		onMount,
    		writable,
    		derived,
    		LOCATION,
    		ROUTER,
    		globalHistory,
    		pick,
    		match,
    		stripSlashes,
    		combinePaths,
    		basepath,
    		url,
    		locationContext,
    		routerContext,
    		routes,
    		activeRoute,
    		hasActiveRoute,
    		location,
    		base,
    		routerBase,
    		registerRoute,
    		unregisterRoute,
    		$base,
    		$location,
    		$routes
    	});

    	$$self.$inject_state = $$props => {
    		if ("basepath" in $$props) $$invalidate(3, basepath = $$props.basepath);
    		if ("url" in $$props) $$invalidate(4, url = $$props.url);
    		if ("hasActiveRoute" in $$props) hasActiveRoute = $$props.hasActiveRoute;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*$base*/ 32) {
    			// This reactive statement will update all the Routes' path when
    			// the basepath changes.
    			{
    				const { path: basepath } = $base;

    				routes.update(rs => {
    					rs.forEach(r => r.path = combinePaths(basepath, r._path));
    					return rs;
    				});
    			}
    		}

    		if ($$self.$$.dirty & /*$routes, $location*/ 192) {
    			// This reactive statement will be run when the Router is created
    			// when there are no Routes and then again the following tick, so it
    			// will not find an active Route in SSR and in the browser it will only
    			// pick an active Route after all Routes have been registered.
    			{
    				const bestMatch = pick($routes, $location.pathname);
    				activeRoute.set(bestMatch);
    			}
    		}
    	};

    	return [
    		routes,
    		location,
    		base,
    		basepath,
    		url,
    		$base,
    		$location,
    		$routes,
    		$$scope,
    		slots
    	];
    }

    class Router extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, { basepath: 3, url: 4 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Router",
    			options,
    			id: create_fragment$3.name
    		});
    	}

    	get basepath() {
    		throw new Error("<Router>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set basepath(value) {
    		throw new Error("<Router>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get url() {
    		throw new Error("<Router>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set url(value) {
    		throw new Error("<Router>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules/svelte-routing/src/Route.svelte generated by Svelte v3.32.3 */

    const get_default_slot_changes = dirty => ({
    	params: dirty & /*routeParams*/ 4,
    	location: dirty & /*$location*/ 16
    });

    const get_default_slot_context = ctx => ({
    	params: /*routeParams*/ ctx[2],
    	location: /*$location*/ ctx[4]
    });

    // (40:0) {#if $activeRoute !== null && $activeRoute.route === route}
    function create_if_block$1(ctx) {
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	const if_block_creators = [create_if_block_1$1, create_else_block];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*component*/ ctx[0] !== null) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if_blocks[current_block_type_index].m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				} else {
    					if_block.p(ctx, dirty);
    				}

    				transition_in(if_block, 1);
    				if_block.m(if_block_anchor.parentNode, if_block_anchor);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if_blocks[current_block_type_index].d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(40:0) {#if $activeRoute !== null && $activeRoute.route === route}",
    		ctx
    	});

    	return block;
    }

    // (43:2) {:else}
    function create_else_block(ctx) {
    	let current;
    	const default_slot_template = /*#slots*/ ctx[10].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[9], get_default_slot_context);

    	const block = {
    		c: function create() {
    			if (default_slot) default_slot.c();
    		},
    		m: function mount(target, anchor) {
    			if (default_slot) {
    				default_slot.m(target, anchor);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope, routeParams, $location*/ 532) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[9], dirty, get_default_slot_changes, get_default_slot_context);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(43:2) {:else}",
    		ctx
    	});

    	return block;
    }

    // (41:2) {#if component !== null}
    function create_if_block_1$1(ctx) {
    	let switch_instance;
    	let switch_instance_anchor;
    	let current;

    	const switch_instance_spread_levels = [
    		{ location: /*$location*/ ctx[4] },
    		/*routeParams*/ ctx[2],
    		/*routeProps*/ ctx[3]
    	];

    	var switch_value = /*component*/ ctx[0];

    	function switch_props(ctx) {
    		let switch_instance_props = {};

    		for (let i = 0; i < switch_instance_spread_levels.length; i += 1) {
    			switch_instance_props = assign(switch_instance_props, switch_instance_spread_levels[i]);
    		}

    		return {
    			props: switch_instance_props,
    			$$inline: true
    		};
    	}

    	if (switch_value) {
    		switch_instance = new switch_value(switch_props());
    	}

    	const block = {
    		c: function create() {
    			if (switch_instance) create_component(switch_instance.$$.fragment);
    			switch_instance_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (switch_instance) {
    				mount_component(switch_instance, target, anchor);
    			}

    			insert_dev(target, switch_instance_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const switch_instance_changes = (dirty & /*$location, routeParams, routeProps*/ 28)
    			? get_spread_update(switch_instance_spread_levels, [
    					dirty & /*$location*/ 16 && { location: /*$location*/ ctx[4] },
    					dirty & /*routeParams*/ 4 && get_spread_object(/*routeParams*/ ctx[2]),
    					dirty & /*routeProps*/ 8 && get_spread_object(/*routeProps*/ ctx[3])
    				])
    			: {};

    			if (switch_value !== (switch_value = /*component*/ ctx[0])) {
    				if (switch_instance) {
    					group_outros();
    					const old_component = switch_instance;

    					transition_out(old_component.$$.fragment, 1, 0, () => {
    						destroy_component(old_component, 1);
    					});

    					check_outros();
    				}

    				if (switch_value) {
    					switch_instance = new switch_value(switch_props());
    					create_component(switch_instance.$$.fragment);
    					transition_in(switch_instance.$$.fragment, 1);
    					mount_component(switch_instance, switch_instance_anchor.parentNode, switch_instance_anchor);
    				} else {
    					switch_instance = null;
    				}
    			} else if (switch_value) {
    				switch_instance.$set(switch_instance_changes);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			if (switch_instance) transition_in(switch_instance.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(switch_instance_anchor);
    			if (switch_instance) destroy_component(switch_instance, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$1.name,
    		type: "if",
    		source: "(41:2) {#if component !== null}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$4(ctx) {
    	let if_block_anchor;
    	let current;
    	let if_block = /*$activeRoute*/ ctx[1] !== null && /*$activeRoute*/ ctx[1].route === /*route*/ ctx[7] && create_if_block$1(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*$activeRoute*/ ctx[1] !== null && /*$activeRoute*/ ctx[1].route === /*route*/ ctx[7]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*$activeRoute*/ 2) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block$1(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$4($$self, $$props, $$invalidate) {
    	let $activeRoute;
    	let $location;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Route", slots, ['default']);
    	let { path = "" } = $$props;
    	let { component = null } = $$props;
    	const { registerRoute, unregisterRoute, activeRoute } = getContext(ROUTER);
    	validate_store(activeRoute, "activeRoute");
    	component_subscribe($$self, activeRoute, value => $$invalidate(1, $activeRoute = value));
    	const location = getContext(LOCATION);
    	validate_store(location, "location");
    	component_subscribe($$self, location, value => $$invalidate(4, $location = value));

    	const route = {
    		path,
    		// If no path prop is given, this Route will act as the default Route
    		// that is rendered if no other Route in the Router is a match.
    		default: path === ""
    	};

    	let routeParams = {};
    	let routeProps = {};
    	registerRoute(route);

    	// There is no need to unregister Routes in SSR since it will all be
    	// thrown away anyway.
    	if (typeof window !== "undefined") {
    		onDestroy(() => {
    			unregisterRoute(route);
    		});
    	}

    	$$self.$$set = $$new_props => {
    		$$invalidate(13, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
    		if ("path" in $$new_props) $$invalidate(8, path = $$new_props.path);
    		if ("component" in $$new_props) $$invalidate(0, component = $$new_props.component);
    		if ("$$scope" in $$new_props) $$invalidate(9, $$scope = $$new_props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		getContext,
    		onDestroy,
    		ROUTER,
    		LOCATION,
    		path,
    		component,
    		registerRoute,
    		unregisterRoute,
    		activeRoute,
    		location,
    		route,
    		routeParams,
    		routeProps,
    		$activeRoute,
    		$location
    	});

    	$$self.$inject_state = $$new_props => {
    		$$invalidate(13, $$props = assign(assign({}, $$props), $$new_props));
    		if ("path" in $$props) $$invalidate(8, path = $$new_props.path);
    		if ("component" in $$props) $$invalidate(0, component = $$new_props.component);
    		if ("routeParams" in $$props) $$invalidate(2, routeParams = $$new_props.routeParams);
    		if ("routeProps" in $$props) $$invalidate(3, routeProps = $$new_props.routeProps);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*$activeRoute*/ 2) {
    			if ($activeRoute && $activeRoute.route === route) {
    				$$invalidate(2, routeParams = $activeRoute.params);
    			}
    		}

    		{
    			const { path, component, ...rest } = $$props;
    			$$invalidate(3, routeProps = rest);
    		}
    	};

    	$$props = exclude_internal_props($$props);

    	return [
    		component,
    		$activeRoute,
    		routeParams,
    		routeProps,
    		$location,
    		activeRoute,
    		location,
    		route,
    		path,
    		$$scope,
    		slots
    	];
    }

    class Route extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, { path: 8, component: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Route",
    			options,
    			id: create_fragment$4.name
    		});
    	}

    	get path() {
    		throw new Error("<Route>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set path(value) {
    		throw new Error("<Route>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get component() {
    		throw new Error("<Route>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set component(value) {
    		throw new Error("<Route>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules/svelte-routing/src/Link.svelte generated by Svelte v3.32.3 */
    const file$3 = "node_modules/svelte-routing/src/Link.svelte";

    function create_fragment$5(ctx) {
    	let a;
    	let current;
    	let mounted;
    	let dispose;
    	const default_slot_template = /*#slots*/ ctx[16].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[15], null);

    	let a_levels = [
    		{ href: /*href*/ ctx[0] },
    		{ "aria-current": /*ariaCurrent*/ ctx[2] },
    		/*props*/ ctx[1],
    		/*$$restProps*/ ctx[6]
    	];

    	let a_data = {};

    	for (let i = 0; i < a_levels.length; i += 1) {
    		a_data = assign(a_data, a_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			a = element("a");
    			if (default_slot) default_slot.c();
    			set_attributes(a, a_data);
    			add_location(a, file$3, 40, 0, 1249);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, a, anchor);

    			if (default_slot) {
    				default_slot.m(a, null);
    			}

    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(a, "click", /*onClick*/ ctx[5], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 32768) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[15], dirty, null, null);
    				}
    			}

    			set_attributes(a, a_data = get_spread_update(a_levels, [
    				(!current || dirty & /*href*/ 1) && { href: /*href*/ ctx[0] },
    				(!current || dirty & /*ariaCurrent*/ 4) && { "aria-current": /*ariaCurrent*/ ctx[2] },
    				dirty & /*props*/ 2 && /*props*/ ctx[1],
    				dirty & /*$$restProps*/ 64 && /*$$restProps*/ ctx[6]
    			]));
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(a);
    			if (default_slot) default_slot.d(detaching);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$5.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$5($$self, $$props, $$invalidate) {
    	let ariaCurrent;
    	const omit_props_names = ["to","replace","state","getProps"];
    	let $$restProps = compute_rest_props($$props, omit_props_names);
    	let $base;
    	let $location;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Link", slots, ['default']);
    	let { to = "#" } = $$props;
    	let { replace = false } = $$props;
    	let { state = {} } = $$props;
    	let { getProps = () => ({}) } = $$props;
    	const { base } = getContext(ROUTER);
    	validate_store(base, "base");
    	component_subscribe($$self, base, value => $$invalidate(13, $base = value));
    	const location = getContext(LOCATION);
    	validate_store(location, "location");
    	component_subscribe($$self, location, value => $$invalidate(14, $location = value));
    	const dispatch = createEventDispatcher();
    	let href, isPartiallyCurrent, isCurrent, props;

    	function onClick(event) {
    		dispatch("click", event);

    		if (shouldNavigate(event)) {
    			event.preventDefault();

    			// Don't push another entry to the history stack when the user
    			// clicks on a Link to the page they are currently on.
    			const shouldReplace = $location.pathname === href || replace;

    			navigate(href, { state, replace: shouldReplace });
    		}
    	}

    	$$self.$$set = $$new_props => {
    		$$props = assign(assign({}, $$props), exclude_internal_props($$new_props));
    		$$invalidate(6, $$restProps = compute_rest_props($$props, omit_props_names));
    		if ("to" in $$new_props) $$invalidate(7, to = $$new_props.to);
    		if ("replace" in $$new_props) $$invalidate(8, replace = $$new_props.replace);
    		if ("state" in $$new_props) $$invalidate(9, state = $$new_props.state);
    		if ("getProps" in $$new_props) $$invalidate(10, getProps = $$new_props.getProps);
    		if ("$$scope" in $$new_props) $$invalidate(15, $$scope = $$new_props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		getContext,
    		createEventDispatcher,
    		ROUTER,
    		LOCATION,
    		navigate,
    		startsWith,
    		resolve,
    		shouldNavigate,
    		to,
    		replace,
    		state,
    		getProps,
    		base,
    		location,
    		dispatch,
    		href,
    		isPartiallyCurrent,
    		isCurrent,
    		props,
    		onClick,
    		$base,
    		$location,
    		ariaCurrent
    	});

    	$$self.$inject_state = $$new_props => {
    		if ("to" in $$props) $$invalidate(7, to = $$new_props.to);
    		if ("replace" in $$props) $$invalidate(8, replace = $$new_props.replace);
    		if ("state" in $$props) $$invalidate(9, state = $$new_props.state);
    		if ("getProps" in $$props) $$invalidate(10, getProps = $$new_props.getProps);
    		if ("href" in $$props) $$invalidate(0, href = $$new_props.href);
    		if ("isPartiallyCurrent" in $$props) $$invalidate(11, isPartiallyCurrent = $$new_props.isPartiallyCurrent);
    		if ("isCurrent" in $$props) $$invalidate(12, isCurrent = $$new_props.isCurrent);
    		if ("props" in $$props) $$invalidate(1, props = $$new_props.props);
    		if ("ariaCurrent" in $$props) $$invalidate(2, ariaCurrent = $$new_props.ariaCurrent);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*to, $base*/ 8320) {
    			$$invalidate(0, href = to === "/" ? $base.uri : resolve(to, $base.uri));
    		}

    		if ($$self.$$.dirty & /*$location, href*/ 16385) {
    			$$invalidate(11, isPartiallyCurrent = startsWith($location.pathname, href));
    		}

    		if ($$self.$$.dirty & /*href, $location*/ 16385) {
    			$$invalidate(12, isCurrent = href === $location.pathname);
    		}

    		if ($$self.$$.dirty & /*isCurrent*/ 4096) {
    			$$invalidate(2, ariaCurrent = isCurrent ? "page" : undefined);
    		}

    		if ($$self.$$.dirty & /*getProps, $location, href, isPartiallyCurrent, isCurrent*/ 23553) {
    			$$invalidate(1, props = getProps({
    				location: $location,
    				href,
    				isPartiallyCurrent,
    				isCurrent
    			}));
    		}
    	};

    	return [
    		href,
    		props,
    		ariaCurrent,
    		base,
    		location,
    		onClick,
    		$$restProps,
    		to,
    		replace,
    		state,
    		getProps,
    		isPartiallyCurrent,
    		isCurrent,
    		$base,
    		$location,
    		$$scope,
    		slots
    	];
    }

    class Link extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$5, create_fragment$5, safe_not_equal, {
    			to: 7,
    			replace: 8,
    			state: 9,
    			getProps: 10
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Link",
    			options,
    			id: create_fragment$5.name
    		});
    	}

    	get to() {
    		throw new Error("<Link>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set to(value) {
    		throw new Error("<Link>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get replace() {
    		throw new Error("<Link>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set replace(value) {
    		throw new Error("<Link>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get state() {
    		throw new Error("<Link>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set state(value) {
    		throw new Error("<Link>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get getProps() {
    		throw new Error("<Link>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set getProps(value) {
    		throw new Error("<Link>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /**
     * A link action that can be added to <a href=""> tags rather
     * than using the <Link> component.
     *
     * Example:
     * ```html
     * <a href="/post/{postId}" use:link>{post.title}</a>
     * ```
     */
    function link(node) {
      function onClick(event) {
        const anchor = event.currentTarget;

        if (
          anchor.target === "" &&
          hostMatches(anchor) &&
          shouldNavigate(event)
        ) {
          event.preventDefault();
          navigate(anchor.pathname + anchor.search, { replace: anchor.hasAttribute("replace") });
        }
      }

      node.addEventListener("click", onClick);

      return {
        destroy() {
          node.removeEventListener("click", onClick);
        }
      };
    }

    /* src/components/SectionHeader.svelte generated by Svelte v3.32.3 */
    const file$4 = "src/components/SectionHeader.svelte";

    function create_fragment$6(ctx) {
    	let div;
    	let a;
    	let t0;
    	let t1;
    	let span;
    	let t2;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div = element("div");
    			a = element("a");
    			t0 = text(/*title*/ ctx[1]);
    			t1 = space();
    			span = element("span");
    			t2 = text(/*icon*/ ctx[0]);
    			attr_dev(a, "href", /*_href*/ ctx[4]);
    			attr_dev(a, "class", "title full-width svelte-1kbnx4j");
    			toggle_class(a, "underline", !!/*href*/ ctx[2]);
    			add_location(a, file$4, 12, 2, 270);
    			attr_dev(span, "class", "hint svelte-1kbnx4j");
    			add_location(span, file$4, 19, 2, 381);
    			attr_dev(div, "class", "header full-width subgrid svelte-1kbnx4j");
    			attr_dev(div, "id", /*anchor*/ ctx[3]);
    			add_location(div, file$4, 11, 0, 207);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, a);
    			append_dev(a, t0);
    			append_dev(div, t1);
    			append_dev(div, span);
    			append_dev(span, t2);

    			if (!mounted) {
    				dispose = [
    					action_destroyer(link.call(null, a)),
    					listen_dev(div, "click", /*click_handler*/ ctx[5], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*title*/ 2) set_data_dev(t0, /*title*/ ctx[1]);

    			if (dirty & /*_href*/ 16) {
    				attr_dev(a, "href", /*_href*/ ctx[4]);
    			}

    			if (dirty & /*href*/ 4) {
    				toggle_class(a, "underline", !!/*href*/ ctx[2]);
    			}

    			if (dirty & /*icon*/ 1) set_data_dev(t2, /*icon*/ ctx[0]);

    			if (dirty & /*anchor*/ 8) {
    				attr_dev(div, "id", /*anchor*/ ctx[3]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$6.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$6($$self, $$props, $$invalidate) {
    	let anchor;
    	let _href;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("SectionHeader", slots, []);
    	let { icon } = $$props;
    	let { title } = $$props;
    	let { href } = $$props;
    	const writable_props = ["icon", "title", "href"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<SectionHeader> was created with unknown prop '${key}'`);
    	});

    	function click_handler(event) {
    		bubble($$self, event);
    	}

    	$$self.$$set = $$props => {
    		if ("icon" in $$props) $$invalidate(0, icon = $$props.icon);
    		if ("title" in $$props) $$invalidate(1, title = $$props.title);
    		if ("href" in $$props) $$invalidate(2, href = $$props.href);
    	};

    	$$self.$capture_state = () => ({ link, icon, title, href, anchor, _href });

    	$$self.$inject_state = $$props => {
    		if ("icon" in $$props) $$invalidate(0, icon = $$props.icon);
    		if ("title" in $$props) $$invalidate(1, title = $$props.title);
    		if ("href" in $$props) $$invalidate(2, href = $$props.href);
    		if ("anchor" in $$props) $$invalidate(3, anchor = $$props.anchor);
    		if ("_href" in $$props) $$invalidate(4, _href = $$props._href);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*title*/ 2) {
    			$$invalidate(3, anchor = `#${title.toLowerCase().replace(/\s/g, "-")}`);
    		}

    		if ($$self.$$.dirty & /*href, anchor*/ 12) {
    			$$invalidate(4, _href = href || anchor);
    		}
    	};

    	return [icon, title, href, anchor, _href, click_handler];
    }

    class SectionHeader extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$6, create_fragment$6, safe_not_equal, { icon: 0, title: 1, href: 2 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "SectionHeader",
    			options,
    			id: create_fragment$6.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*icon*/ ctx[0] === undefined && !("icon" in props)) {
    			console.warn("<SectionHeader> was created without expected prop 'icon'");
    		}

    		if (/*title*/ ctx[1] === undefined && !("title" in props)) {
    			console.warn("<SectionHeader> was created without expected prop 'title'");
    		}

    		if (/*href*/ ctx[2] === undefined && !("href" in props)) {
    			console.warn("<SectionHeader> was created without expected prop 'href'");
    		}
    	}

    	get icon() {
    		throw new Error("<SectionHeader>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set icon(value) {
    		throw new Error("<SectionHeader>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get title() {
    		throw new Error("<SectionHeader>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set title(value) {
    		throw new Error("<SectionHeader>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get href() {
    		throw new Error("<SectionHeader>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set href(value) {
    		throw new Error("<SectionHeader>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    var project_sections = [
    	{
    		title: "Indigenous Language Preservation",
    		projects: [
    			{
    				url: "https://www.unicode.org/L2/L2018/18047-mayan-presentation.pdf",
    				title: "Ncodex",
    				info: "Built database infrastructure to aid in the encoding of the Mayan written language to promote modern usage.",
    				date: "2019 Jan – 2021",
    				image: {
    					src: "./assets/ncodex.jpg"
    				}
    			}
    		]
    	},
    	{
    		title: "Web Development",
    		projects: [
    			{
    				url: "https://bathsmusic.net/",
    				title: "Baths (bathsmusic.net)",
    				info: "Homepage for the artist Baths",
    				date: "2019 Nov",
    				image: {
    					src: "./assets/baths-756.jpg"
    				}
    			},
    			{
    				url: "https://squarespace.com",
    				title: "Squarespace.com",
    				info: "Worked on the Squarespace Frontsite.",
    				date: "2017 – 2018",
    				image: {
    					src: "./assets/squarespace.jpg"
    				}
    			},
    			{
    				url: "https://www.squarespace.com/about/timeline",
    				title: "Squarespace Timeline",
    				info: "A timeline of the company's progress.",
    				date: "2017 Nov",
    				image: {
    					src: "./assets/squarespace-timeline.jpg"
    				}
    			}
    		]
    	},
    	{
    		title: "Information Security",
    		projects: [
    			{
    				url: "https://www.techradar.com/news/united-nations-suffers-major-data-breach",
    				title: "United Nations suffers major data breach",
    				info: "&ldquo;100k United Nations Environmental Programme employees had their data exposed online&rdquo; &mdash; Techradar",
    				date: "2021 Jan 11"
    			},
    			{
    				url: "https://securityledger.com/2020/12/neopets-is-still-a-thing-and-its-exposing-sensitive-data/",
    				title: "Neopets Data Breach",
    				info: "&ldquo;Update: Neopets Is Still A Thing And Its Exposing Sensitive Data&rdquo; &mdash; Security Ledger",
    				date: "2020 Dec 28"
    			},
    			{
    				url: "https://securityledger.com/2020/11/exploitable-flaw-in-npm-private-ip-app-lurks-everywhere-anywhere/",
    				title: "CVE-2020-28360: npm private-ip SSRF Bypass (IP Phone Home)",
    				info: "&ldquo;Exploitable Flaw in NPM Private IP App Lurks Everywhere, Anywhere&mdash; Security Ledger",
    				date: "2020 Nov 24"
    			}
    		]
    	},
    	{
    		title: "Reading List",
    		href: "/reading-list"
    	}
    ];

    /* src/pages/Home.svelte generated by Svelte v3.32.3 */
    const file$5 = "src/pages/Home.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[3] = list[i].title;
    	child_ctx[4] = list[i].projects;
    	child_ctx[5] = list[i].href;
    	child_ctx[6] = list[i].hide;
    	child_ctx[8] = i;
    	return child_ctx;
    }

    function get_each_context_1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[9] = list[i];
    	return child_ctx;
    }

    // (28:4) {#if !hide && projects }
    function create_if_block$2(ctx) {
    	let each_1_anchor;
    	let current;
    	let each_value_1 = /*projects*/ ctx[4];
    	validate_each_argument(each_value_1);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks[i] = create_each_block_1(get_each_context_1(ctx, each_value_1, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, each_1_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*project_sections*/ 1) {
    				each_value_1 = /*projects*/ ctx[4];
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1(ctx, each_value_1, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block_1(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
    					}
    				}

    				group_outros();

    				for (i = each_value_1.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value_1.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(each_1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$2.name,
    		type: "if",
    		source: "(28:4) {#if !hide && projects }",
    		ctx
    	});

    	return block;
    }

    // (29:6) {#each projects as project}
    function create_each_block_1(ctx) {
    	let project;
    	let current;
    	const project_spread_levels = [/*project*/ ctx[9]];
    	let project_props = {};

    	for (let i = 0; i < project_spread_levels.length; i += 1) {
    		project_props = assign(project_props, project_spread_levels[i]);
    	}

    	project = new Project({ props: project_props, $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(project.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(project, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const project_changes = (dirty & /*project_sections*/ 1)
    			? get_spread_update(project_spread_levels, [get_spread_object(/*project*/ ctx[9])])
    			: {};

    			project.$set(project_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(project.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(project.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(project, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1.name,
    		type: "each",
    		source: "(29:6) {#each projects as project}",
    		ctx
    	});

    	return block;
    }

    // (22:2) {#each project_sections as { title, projects, href, hide }
    function create_each_block(ctx) {
    	let sectionheader;
    	let t;
    	let if_block_anchor;
    	let current;

    	const sectionheader_spread_levels = [
    		{
    			icon: /*icon*/ ctx[2](/*href*/ ctx[5], /*hide*/ ctx[6])
    		},
    		{
    			title: /*title*/ ctx[3],
    			href: /*href*/ ctx[5]
    		}
    	];

    	let sectionheader_props = {};

    	for (let i = 0; i < sectionheader_spread_levels.length; i += 1) {
    		sectionheader_props = assign(sectionheader_props, sectionheader_spread_levels[i]);
    	}

    	sectionheader = new SectionHeader({
    			props: sectionheader_props,
    			$$inline: true
    		});

    	sectionheader.$on("click", /*toggle*/ ctx[1].bind(null, /*i*/ ctx[8]));
    	let if_block = !/*hide*/ ctx[6] && /*projects*/ ctx[4] && create_if_block$2(ctx);

    	const block = {
    		c: function create() {
    			create_component(sectionheader.$$.fragment);
    			t = space();
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			mount_component(sectionheader, target, anchor);
    			insert_dev(target, t, anchor);
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const sectionheader_changes = (dirty & /*icon, project_sections*/ 5)
    			? get_spread_update(sectionheader_spread_levels, [
    					{
    						icon: /*icon*/ ctx[2](/*href*/ ctx[5], /*hide*/ ctx[6])
    					},
    					dirty & /*project_sections*/ 1 && {
    						title: /*title*/ ctx[3],
    						href: /*href*/ ctx[5]
    					}
    				])
    			: {};

    			sectionheader.$set(sectionheader_changes);

    			if (!/*hide*/ ctx[6] && /*projects*/ ctx[4]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*project_sections*/ 1) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block$2(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(sectionheader.$$.fragment, local);
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(sectionheader.$$.fragment, local);
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(sectionheader, detaching);
    			if (detaching) detach_dev(t);
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(22:2) {#each project_sections as { title, projects, href, hide }",
    		ctx
    	});

    	return block;
    }

    function create_fragment$7(ctx) {
    	let header;
    	let t0;
    	let main;
    	let t1;
    	let footer;
    	let current;
    	header = new Header({ $$inline: true });
    	let each_value = /*project_sections*/ ctx[0];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	footer = new Footer({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(header.$$.fragment);
    			t0 = space();
    			main = element("main");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t1 = space();
    			create_component(footer.$$.fragment);
    			attr_dev(main, "class", "full-width subgrid svelte-sr8fq4");
    			add_location(main, file$5, 20, 0, 518);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(header, target, anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, main, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(main, null);
    			}

    			insert_dev(target, t1, anchor);
    			mount_component(footer, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*project_sections, icon, toggle*/ 7) {
    				each_value = /*project_sections*/ ctx[0];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(main, null);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(header.$$.fragment, local);

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			transition_in(footer.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(header.$$.fragment, local);
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			transition_out(footer.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(header, detaching);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(main);
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(t1);
    			destroy_component(footer, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$7.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$7($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Home", slots, []);

    	const toggle = (section, e) => {
    		$$invalidate(0, project_sections[section].hide = !project_sections[section].hide, project_sections);
    	};

    	const icon = (href, hide) => {
    		return href ? "→" : !!hide ? "⊕" : "⊗";
    	};

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Home> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		Footer,
    		Header,
    		Project,
    		SectionHeader,
    		project_sections,
    		toggle,
    		icon
    	});

    	return [project_sections, toggle, icon];
    }

    class Home extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$7, create_fragment$7, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Home",
    			options,
    			id: create_fragment$7.name
    		});
    	}
    }

    /* src/pages/Reading.svelte generated by Svelte v3.32.3 */

    function create_fragment$8(ctx) {
    	let sectionheader0;
    	let t0;
    	let sectionheader1;
    	let t1;
    	let project;
    	let current;

    	sectionheader0 = new SectionHeader({
    			props: { title: "Home", icon: "←", href: "/" },
    			$$inline: true
    		});

    	sectionheader1 = new SectionHeader({
    			props: { title: "Reading List", icon: "↓" },
    			$$inline: true
    		});

    	project = new Project({
    			props: {
    				title: "A New Program for Graphic Design",
    				date: "2020 Nov 25",
    				info: "Three semesters worth of miscellaneous design wisdom. Meant to be a textbook, still fun to read casually.",
    				image: {
    					src: "https://i.gr-assets.com/images/S/compressed.photo.goodreads.com/books/1568586059l/51572616._SX318_SY475_.jpg"
    				},
    				url: "https://www.goodreads.com/book/show/51572616-a-new-program-for-graphic-design"
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(sectionheader0.$$.fragment);
    			t0 = space();
    			create_component(sectionheader1.$$.fragment);
    			t1 = space();
    			create_component(project.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(sectionheader0, target, anchor);
    			insert_dev(target, t0, anchor);
    			mount_component(sectionheader1, target, anchor);
    			insert_dev(target, t1, anchor);
    			mount_component(project, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(sectionheader0.$$.fragment, local);
    			transition_in(sectionheader1.$$.fragment, local);
    			transition_in(project.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(sectionheader0.$$.fragment, local);
    			transition_out(sectionheader1.$$.fragment, local);
    			transition_out(project.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(sectionheader0, detaching);
    			if (detaching) detach_dev(t0);
    			destroy_component(sectionheader1, detaching);
    			if (detaching) detach_dev(t1);
    			destroy_component(project, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$8.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$8($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Reading", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Reading> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ Project, SectionHeader });
    	return [];
    }

    class Reading extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$8, create_fragment$8, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Reading",
    			options,
    			id: create_fragment$8.name
    		});
    	}
    }

    /* src/App.svelte generated by Svelte v3.32.3 */
    const file$6 = "src/App.svelte";

    // (8:0) <Router url={url}>
    function create_default_slot(ctx) {
    	let div;
    	let route0;
    	let t;
    	let route1;
    	let current;

    	route0 = new Route({
    			props: { path: "/", component: Home },
    			$$inline: true
    		});

    	route1 = new Route({
    			props: {
    				path: "/reading-list",
    				component: Reading
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(route0.$$.fragment);
    			t = space();
    			create_component(route1.$$.fragment);
    			attr_dev(div, "class", "wrapper svelte-14xs0rn");
    			add_location(div, file$6, 8, 0, 204);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(route0, div, null);
    			append_dev(div, t);
    			mount_component(route1, div, null);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(route0.$$.fragment, local);
    			transition_in(route1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(route0.$$.fragment, local);
    			transition_out(route1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(route0);
    			destroy_component(route1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot.name,
    		type: "slot",
    		source: "(8:0) <Router url={url}>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$9(ctx) {
    	let router;
    	let current;

    	router = new Router({
    			props: {
    				url: /*url*/ ctx[0],
    				$$slots: { default: [create_default_slot] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(router.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(router, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const router_changes = {};
    			if (dirty & /*url*/ 1) router_changes.url = /*url*/ ctx[0];

    			if (dirty & /*$$scope*/ 2) {
    				router_changes.$$scope = { dirty, ctx };
    			}

    			router.$set(router_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(router.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(router.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(router, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$9.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$9($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("App", slots, []);
    	let { url = "" } = $$props;
    	const writable_props = ["url"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("url" in $$props) $$invalidate(0, url = $$props.url);
    	};

    	$$self.$capture_state = () => ({ Home, Reading, Router, Link, Route, url });

    	$$self.$inject_state = $$props => {
    		if ("url" in $$props) $$invalidate(0, url = $$props.url);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [url];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$9, create_fragment$9, safe_not_equal, { url: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment$9.name
    		});
    	}

    	get url() {
    		throw new Error("<App>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set url(value) {
    		throw new Error("<App>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    const app = new App({ target: document.body });

    return app;

}());
//# sourceMappingURL=bundle.js.map

import { objectTypeError, objectKeyError, targetError } from './stateErrors';
import _ from 'lodash';

class StateManager {
  constructor(initialState, action) {
    this.initialState = initialState;
    this.action = action;
  }

  merge(array) {
    let mergedState = { ...this.initialState };

    if (_.isEmpty(array)) console.warn('No merge items provided, state unchanged.');

    array.forEach(item => {
      const { key: stateKey, payload, method: stateUpdateMethod } = item;
      const method = _.toLower(stateUpdateMethod);

      if (method === 'add' || method === 'update') {
        mergedState = { ...mergedState, [stateKey]: payload };
      }

      if (method === 'remove') {
        // eslint-disable-next-line no-unused-vars
        const { [stateKey]: value, ...withoutKey } = mergedState;
        mergedState = { ...withoutKey };
      }
    });

    return mergedState;
  }

  get(stateKey, stringOrIndex) {
    const target = this.initialState[stateKey];
    const isArr = _.isArray(target);
    const isObj = _.isObject(target);
    const targetValid = target !== undefined;

    if (!targetValid) {
      console.warn('Could not get value from state, provided state key name does not exist.');
    }

    if (targetValid && (isArr || isObj)) {
      const validStringIndex = target[stringOrIndex];

      if (stringOrIndex && !validStringIndex) {
        isArr ? objectKeyError(true, stringOrIndex, target) : targetError('get');
        return target[stringOrIndex];
      }

      if (validStringIndex) return target[stringOrIndex];
    }

    return target;
  }

  addArr(stateKey, payload) {
    const target = this.initialState[stateKey];
    const updatedArr = [ ...target, payload ];

    return {
      ...this.initialState,
      [stateKey]: updatedArr,
    };
  }

  addObj(stateKey, payload) {
    const target = this.initialState[stateKey];

    if (_.isObject(payload) && !_.isArray(payload)) {
      if (_.isEmpty(payload)) {
        console.warn('Empty object, state unchanged.');
        return { ...this.initialState };
      }

      return {
        ...this.initialState,
        [stateKey]: {
          ...this.initialState[stateKey],
          ...payload,
        },
      };
    }

    objectTypeError(payload, target);
    return { ...this.initialState };
  }

  add(stateKey, payload) {
    const workingState = { ...this.initialState };
    const target = workingState[stateKey];
    const isArr = _.isArray(target);
    const isObj = _.isObject(target);
    const payloadValid = payload !== undefined;

    if (stateKey && payloadValid) {
      if (isArr) return this.addArr(stateKey, payload);
      if (isObj) return this.addObj(stateKey, payload);

      return {
        ...this.initialState,
        [stateKey]: payload,
      };
    }

    return { ...this.initialState };
  }

  updateArr(stateKey, payload, stringOrIndex) {
    const target = this.initialState[stateKey];
    const isArr = _.isArray(target);
    const index = stringOrIndex;
    const indexValid = stringOrIndex >= 0 && stringOrIndex <= target?.length;

    if (indexValid) {
      const updatedArr = target.map((item, i) => {
        if (i === index) return payload;
        return item;
      });

      return {
        ...this.initialState,
        [stateKey]: updatedArr,
      };
    }

    if (!indexValid && index === undefined) {
      return {
        ...this.initialState,
        [stateKey]: payload,
      };
    }

    objectKeyError(isArr, index, target);
    return { ...this.initialState };
  }

  updateObj(stateKey, payload, stringOrIndex) {
    const target = this.initialState[stateKey];
    const isArr = _.isArray(target);
    const key = stringOrIndex;
    const validKey = typeof key === 'string' && (target[key] !== undefined);

    if (validKey) {
      return {
        ...this.initialState,
        [stateKey]: {
          ...this.initialState[stateKey],
          [key]: payload,
        },
      };
    }

    if (!key) {
      return {
        ...this.initialState,
        [stateKey]: payload,
      };
    }

    objectKeyError(isArr, key, target);
    return { ...this.initialState };
  }

  update(stateKey, payload, stringOrIndex) {
    const workingState = { ...this.initialState };
    const target = workingState[stateKey];
    const isArr = _.isArray(target);
    const isObj = _.isObject(target);
    const payloadValid = payload !== undefined;

    if (stateKey && payloadValid) {
      if (!target) return this.add(stateKey, payload);
      if (isArr) return this.updateArr(stateKey, payload, stringOrIndex);
      if (isObj) return this.updateObj(stateKey, payload, stringOrIndex);


      return {
        ...this.initialState,
        [stateKey]: payload,
      };
    }

    return { ...this.initialState };
  }

  removeArr(stateKey, stringOrIndex, rest) {
    const target = this.initialState[stateKey];
    const isArr = _.isArray(target);
    const index = stringOrIndex;
    const indexValid = typeof index === 'number' && index >= 0 && index < target.length;

    if (indexValid) {
      const updatedArr = target.filter((item, i) => i !== index);

      return {
        ...this.initialState,
        [stateKey]: updatedArr,
      };
    }

    if (!indexValid && index === undefined) return { ...rest };

    objectKeyError(isArr, index, target);
    return { ...this.initialState };
  }

  removeObj(stateKey, stringOrIndex, rest) {
    const target = this.initialState[stateKey];
    const isArr = _.isArray(target);
    const key = stringOrIndex;
    const validKey = typeof key === 'string' && Object.prototype.hasOwnProperty.call(target, key);

    if (validKey) {
      // eslint-disable-next-line no-unused-vars
      const { [key]: value, ...localRest } = target;

      return {
        ...this.initialState,
        [stateKey]: { ...localRest },
      };
    }

    if (!key) return { ...rest };

    objectKeyError(isArr, key, target);
    return { ...this.initialState };
  }

  remove(stateKey, stringOrIndex) {
    const workingState = { ...this.initialState };
    const target = workingState[stateKey];
    const isArr = _.isArray(target);
    const isObj = _.isObject(target);

    if (stateKey) {
      // eslint-disable-next-line no-unused-vars
      const { [stateKey]: value, ...rest } = this.initialState;

      if (!target) targetError('remove');
      if (isArr) return this.removeArr(stateKey, stringOrIndex, rest);
      if (isObj) return this.removeObj(stateKey, stringOrIndex, rest);

      return { ...rest };
    }

    return { ...this.initialState };
  }
}

export default StateManager;
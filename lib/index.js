"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.startChain = exports.ValidationChainer = void 0;
/**
 * A class to make the chaining possible. Use the startChain function to start chaining.
 */
class ValidationChainer {
    constructor(objToValidate) {
        this._callstackArray = [];
        this._objToValidate = objToValidate;
    }
    /**
     * Selects a property to start checking. All following validate, sanitize, ensure calls will be on this property until the next check call.
     *
     * @param propertyKey - The property to use.
     * @returns The validation chainer (this object) to chain.
     */
    check(propertyKey) {
        const callFunc = () => __awaiter(this, void 0, void 0, function* () {
            this._currentObjProps = {
                propertyKey,
            };
            return true;
        });
        this._callstackArray.push([callFunc]);
        return this;
    }
    /**
     * Takes in a function to check if the property was valid and shows the message in the errors when not.
     * It will stop checking the selected property if it failed.
     *
     * @param func - A function that takes the selected property value and returns whether or not the property was valid. It can be a promise.
     * @param message - The message to show in the errors when the property fails validation.
     * @returns The validation chainer (this object) to chain.
     */
    validate(func, message = "") {
        const callFunc = () => __awaiter(this, void 0, void 0, function* () {
            const propertyKey = this._currentObjProps.propertyKey;
            const propertyValue = this._objToValidate[propertyKey];
            const success = yield func(propertyValue);
            this._currentObjProps.message = message;
            return success;
        });
        this._callstackArray[this._callstackArray.length - 1].push(callFunc);
        return this;
    }
    /**
     * Replaces the property value with whatever the function returns.
     *
     * @param func - A function that takes the selected property value and returns the replaced value. It can be a promise.
     * @returns The validation chainer (this object) to chain.
     */
    sanitize(func) {
        const callFunc = () => __awaiter(this, void 0, void 0, function* () {
            const propertyKey = this._currentObjProps.propertyKey;
            const propertyValue = this._objToValidate[propertyKey];
            const result = yield func(propertyValue);
            this._objToValidate[propertyKey] = result;
            return true;
        });
        this._callstackArray[this._callstackArray.length - 1].push(callFunc);
        return this;
    }
    /**
     * Takes in a previously checked property and fails the selected property if that property had failed.
     *
     * @param propertyKey - The property to check if it had failed
     * @param message - The message to show in the errors when it failed. Leave this blank to use the failed property's message.
     * @returns The validation chainer (this object) to chain.
     */
    ensure(propertyKey, message) {
        const callFunc = () => __awaiter(this, void 0, void 0, function* () {
            if (this.errors == null)
                return true;
            for (const error of this.errors) {
                if (error.property == propertyKey) {
                    this._currentObjProps.message = message !== null && message !== void 0 ? message : error.message;
                    return false;
                }
            }
            return true;
        });
        this._callstackArray[this._callstackArray.length - 1].push(callFunc);
        return this;
    }
    /**
     * The function to call at the end of the chain.
     * This will start executing the validate, sanitize and or ensure calls.
     *
     * @returns A promise that resolves to an array of ValidationErrors. It's a promise because the validation functions might contain promises.
     */
    pack() {
        return __awaiter(this, void 0, void 0, function* () {
            this.errors = [];
            for (const callstack of this._callstackArray) {
                for (let i = 0; i < callstack.length; i++) {
                    const success = yield callstack[i]();
                    if (!success && this._currentObjProps.message != null) {
                        this.errors.push({
                            property: this._currentObjProps.propertyKey,
                            message: this._currentObjProps.message,
                        });
                        break;
                    }
                }
            }
            return this.errors;
        });
    }
}
exports.ValidationChainer = ValidationChainer;
/**
 * Use this function to start the chain.
 *
 * @param objToValidate - The object containing the properties to validate.
 * @returns A ValidationChainer instance to chain.
 */
function startChain(objToValidate) {
    return new ValidationChainer(objToValidate);
}
exports.startChain = startChain;
//# sourceMappingURL=index.js.map
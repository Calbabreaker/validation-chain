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
class ValidationChainer {
    constructor(objToValidate) {
        this._callStackArray = [];
        this._objToValidate = objToValidate;
    }
    check(propertyKey) {
        this._callStackArray.push([
            () => {
                this._currentObjData = {
                    propertyKey,
                    value: this._objToValidate[propertyKey],
                };
                return true;
            },
        ]);
        return this;
    }
    // fails if the input function returns false
    // if a something fails then the property getting validated will no longer keep on getting validated
    validate(func, message = "") {
        this._callStackArray[this._callStackArray.length - 1].push(() => __awaiter(this, void 0, void 0, function* () {
            const success = yield func(this._currentObjData.value);
            this._currentObjData.message = message;
            return success;
        }));
        return this;
    }
    // replaces the property value with whatever the function returns
    sanitize(func) {
        this._callStackArray[this._callStackArray.length - 1].push(() => __awaiter(this, void 0, void 0, function* () {
            this._currentObjData.value = yield func(this._currentObjData.value);
            return true;
        }));
        return this;
    }
    // fails if the property previously checked property has failed
    // leave message empty to use the fail property message
    ensureProperty(propertyKey, message) {
        this._callStackArray[this._callStackArray.length - 1].push(() => {
            if (this.errors != null) {
                for (const error of this.errors) {
                    if (error.property == propertyKey) {
                        this._currentObjData.message = message !== null && message !== void 0 ? message : error.message;
                        return false;
                    }
                }
            }
            return true;
        });
        return this;
    }
    pack() {
        return __awaiter(this, void 0, void 0, function* () {
            this.errors = [];
            for (const callStack of this._callStackArray) {
                for (let i = 0; i < callStack.length; i++) {
                    const success = yield callStack[i]();
                    if (!success) {
                        if (this._currentObjData.message != null) {
                            this.errors.push({
                                property: this._currentObjData.propertyKey,
                                message: this._currentObjData.message,
                            });
                        }
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
 * Usage:
 * const errors = await validateChain(user)
 *      .check("username")
 *      .validate((value) => value.length > 0, "Field Empty")
 *      .sanitize((value) => value.toLowerCase())
 *
 *      ...
 *
 *      .pack();
 *
 * if (errors.length > 0)
 *      // do stuff
 */
function startChain(objToValidate) {
    return new ValidationChainer(objToValidate);
}
exports.startChain = startChain;
//# sourceMappingURL=index.js.map
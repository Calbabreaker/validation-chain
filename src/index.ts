/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * A interface that ValidationChainer uses to show all the errors.
 */
export interface ValidationError {
    property: string;
    message: string;
}

/**
 * A class to make the chaining possible. Use the startChain function to start chaining.
 */
export class ValidationChainer<ObjType> {
    private _objToValidate: ObjType;
    private _callstackArray: (() => Promise<boolean> | boolean)[][] = [];
    private _currentObjProps: {
        propertyKey: keyof ObjType;
        message?: string;
    };

    errors?: ValidationError[];

    constructor(objToValidate: ObjType) {
        this._objToValidate = objToValidate;
    }

    /**
     * Selects a property to start checking. All following validate, sanitize, ensure calls will be on this property.
     *
     * @param propertyKey - The property to use.
     * @returns The validation chainer (this object) to chain.
     */
    check(propertyKey: keyof ObjType): ValidationChainer<ObjType> {
        const callFunc = async () => {
            this._currentObjProps = {
                propertyKey,
            };

            return true;
        };

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
    validate<T = any>(
        func: (value: T) => Promise<boolean> | boolean,
        message = ""
    ): ValidationChainer<ObjType> {
        const callFunc = async () => {
            const propertyKey = this._currentObjProps.propertyKey;
            const propertyValue = (this._objToValidate[propertyKey] as unknown) as T;

            const success = await func(propertyValue);

            this._currentObjProps.message = message;
            return success;
        };

        this._callstackArray[this._callstackArray.length - 1].push(callFunc);
        return this;
    }

    /**
     * Replaces the property value with whatever the function returns.
     *
     * @param func - A function that takes the selected property value and returns the replaced value. It can be a promise.
     * @returns The validation chainer (this object) to chain.
     */
    sanitize<T = any>(func: (value: T) => Promise<T> | T): ValidationChainer<ObjType> {
        const callFunc = async () => {
            const propertyKey = this._currentObjProps.propertyKey;
            const propertyValue = (this._objToValidate[propertyKey] as unknown) as T;

            const result = await func(propertyValue);
            this._objToValidate[propertyKey] = (result as unknown) as ObjType[keyof ObjType];

            return true;
        };

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
    ensure(propertyKey: keyof ObjType, message?: string): ValidationChainer<ObjType> {
        const callFunc = async () => {
            if (this.errors == null) return true;

            for (const error of this.errors) {
                if (error.property == (propertyKey as string)) {
                    this._currentObjProps.message = message ?? error.message;
                    return false;
                }
            }

            return true;
        };

        this._callstackArray[this._callstackArray.length - 1].push(callFunc);
        return this;
    }

    /**
     * The function to call at the end of the chain.
     * This is will start executing the functions in the callstacks.
     *
     * @returns A promise that resolves to an array of ValidationErrors. It's a promise because the validation functions might contain promises.
     */
    async pack(): Promise<ValidationError[]> {
        this.errors = [];
        for (const callstack of this._callstackArray) {
            for (let i = 0; i < callstack.length; i++) {
                const success = await callstack[i]();

                if (!success && this._currentObjProps.message != null) {
                    this.errors.push({
                        property: this._currentObjProps.propertyKey as string,
                        message: this._currentObjProps.message,
                    });

                    break;
                }
            }
        }

        return this.errors;
    }
}

/**
 * Use this function to start the chain.
 *
 * @param objToValidate - The object containing the properties to validate.
 * @returns A ValidationChainer instance to chain.
 */
export function startChain<ObjType>(objToValidate: ObjType): ValidationChainer<ObjType> {
    return new ValidationChainer(objToValidate);
}

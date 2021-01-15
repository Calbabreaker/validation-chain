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
     * Starts a new validation call stack with the property.
     *
     * @param propertyKey - The property to use.
     * @returns The validation chainer (this object) to chain.
     */
    check(propertyKey: keyof ObjType): ValidationChainer<ObjType> {
        this._callstackArray.push([
            () => {
                this._currentObjProps = {
                    propertyKey,
                };

                return true;
            },
        ]);

        return this;
    }

    /**
     * Takes in a function to check if the property was valid and shows the message in the errors when not.
     * It will stop the current validation call stack if it failed.
     *
     * @param func - A function that returns whether or not the property was valid. It can be a promise.
     * @param message - The message to show in the errors when the property fails validation.
     * @returns The validation chainer (this object) to chain.
     */
    validate<T = never>(
        func: (value: T) => Promise<boolean> | boolean,
        message = ""
    ): ValidationChainer<ObjType> {
        this._callstackArray[this._callstackArray.length - 1].push(async () => {
            const propertyKey = this._currentObjProps.propertyKey;
            const success = await func((this._objToValidate[propertyKey] as never) as T);

            this._currentObjProps.message = message;
            return success;
        });

        return this;
    }

    /**
     * Replaces the property value with whatever the function returns.
     *
     * @param func - A function to replace the property value. It can be a promise.
     * @returns The validation chainer (this object) to chain.
     */
    sanitize<T = never>(func: (value: T) => Promise<T> | T): ValidationChainer<ObjType> {
        this._callstackArray[this._callstackArray.length - 1].push(async () => {
            const propertyKey = this._currentObjProps.propertyKey;
            this._objToValidate[propertyKey] = ((await func(
                (this._objToValidate[propertyKey] as never) as T
            )) as never) as ObjType[keyof ObjType];

            return true;
        });

        return this;
    }

    /**
     * Fails the property if the previously checked property that is passed in has failed.
     *
     * @param propertyKey - The property to check
     * @param message - The message to show in the errors when it failed. Leave this blank to use the failed property's message.
     * @returns The validation chainer (this object) to chain.
     */
    ensureProperty(propertyKey: keyof ObjType, message?: string): ValidationChainer<ObjType> {
        this._callstackArray[this._callstackArray.length - 1].push(() => {
            if (this.errors != null) {
                for (const error of this.errors) {
                    if (error.property == (propertyKey as string)) {
                        this._currentObjProps.message = message ?? error.message;
                        return false;
                    }
                }
            }

            return true;
        });

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

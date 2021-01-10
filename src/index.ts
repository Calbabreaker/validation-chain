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
    private _callStackArray: (() => Promise<boolean> | boolean)[][] = [];
    private _currentObjData: {
        propertyKey: keyof ObjType;
        message?: string;
        value: any;
    };

    errors?: ValidationError[];

    constructor(objToValidate: ObjType) {
        this._objToValidate = objToValidate;
    }

    /**
     * Starts a new validation call stack with the property.
     *
     * @param propertyKey - The property to use.
     * @returns The valdation chainer to chain.
     */
    check(propertyKey: keyof ObjType): ValidationChainer<ObjType> {
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

    /**
     * Takes in a function to check if the property was valid and shows the message in the errors when not.
     * It will stop the current validation call stack if it failed.
     *
     * @param func A function that returns whether or not the property was valid. It can be a promise.
     * @param message The message to show in the errors when the property fails validation.
     * @returns The valdation chainer to chain.
     */
    validate(
        func: (value: any) => Promise<boolean> | boolean,
        message: string = ""
    ): ValidationChainer<ObjType> {
        this._callStackArray[this._callStackArray.length - 1].push(async () => {
            const success = await func(this._currentObjData.value);
            this._currentObjData.message = message;
            return success;
        });

        return this;
    }

    /**
     * Replaces the property value with whatever the function returns.
     *
     * @param func A function to replace the property value. It can be a promise.
     * @returns The valdation chainer to chain.
     */
    sanitize(func: (value: any) => Promise<any> | any): ValidationChainer<ObjType> {
        this._callStackArray[this._callStackArray.length - 1].push(async () => {
            this._currentObjData.value = await func(this._currentObjData.value);
            return true;
        });

        return this;
    }

    /**
     * Fails the property if the previously checked property that is passed in has failed.
     *
     * @param propertyKey The property to check
     * @param message The message to show in the errors when it failed. Leave this blank to use the failed property's message.
     * @returns The valdation chainer to chain.
     */
    ensureProperty(propertyKey: keyof ObjType, message?: string): ValidationChainer<ObjType> {
        this._callStackArray[this._callStackArray.length - 1].push(() => {
            if (this.errors != null) {
                for (const error of this.errors) {
                    if (error.property == (propertyKey as string)) {
                        this._currentObjData.message = message ?? error.message;
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
     * @returns An array of ValidationErrors.
     */
    async pack(): Promise<ValidationError[]> {
        this.errors = [];
        for (const callStack of this._callStackArray) {
            for (let i = 0; i < callStack.length; i++) {
                const success = await callStack[i]();
                if (!success) {
                    if (this._currentObjData.message != null) {
                        this.errors.push({
                            property: this._currentObjData.propertyKey as string,
                            message: this._currentObjData.message,
                        });
                    }

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

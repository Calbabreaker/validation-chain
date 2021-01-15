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
export declare class ValidationChainer<ObjType> {
    private _objToValidate;
    private _callstackArray;
    private _currentObjProps;
    errors?: ValidationError[];
    constructor(objToValidate: ObjType);
    /**
     * Selects a property to start checking. All following validate, sanitize, ensure calls will be on this property until the next check call.
     *
     * @param propertyKey - The property to use.
     * @returns The validation chainer (this object) to chain.
     */
    check(propertyKey: keyof ObjType): ValidationChainer<ObjType>;
    /**
     * Takes in a function to check if the property was valid and shows the message in the errors when not.
     * It will stop checking the selected property if it failed.
     *
     * @param func - A function that takes the selected property value and returns whether or not the property was valid. It can be a promise.
     * @param message - The message to show in the errors when the property fails validation.
     * @returns The validation chainer (this object) to chain.
     */
    validate<T = any>(func: (value: T) => Promise<boolean> | boolean, message?: string): ValidationChainer<ObjType>;
    /**
     * Replaces the property value with whatever the function returns.
     *
     * @param func - A function that takes the selected property value and returns the replaced value. It can be a promise.
     * @returns The validation chainer (this object) to chain.
     */
    sanitize<T = any>(func: (value: T) => Promise<T> | T): ValidationChainer<ObjType>;
    /**
     * Takes in a previously checked property and fails the selected property if that property had failed.
     *
     * @param propertyKey - The property to check if it had failed
     * @param message - The message to show in the errors when it failed. Leave this blank to use the failed property's message.
     * @returns The validation chainer (this object) to chain.
     */
    ensure(propertyKey: keyof ObjType, message?: string): ValidationChainer<ObjType>;
    /**
     * The function to call at the end of the chain.
     * This will start executing the validate, sanitize and or ensure calls.
     *
     * @returns A promise that resolves to an array of ValidationErrors. It's a promise because the validation functions might contain promises.
     */
    pack(): Promise<ValidationError[]>;
}
/**
 * Use this function to start the chain.
 *
 * @param objToValidate - The object containing the properties to validate.
 * @returns A ValidationChainer instance to chain.
 */
export declare function startChain<ObjType>(objToValidate: ObjType): ValidationChainer<ObjType>;
//# sourceMappingURL=index.d.ts.map
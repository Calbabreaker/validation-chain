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
    private _callStackArray;
    private _currentObjData;
    errors?: ValidationError[];
    constructor(objToValidate: ObjType);
    /**
     * Starts a new validation call stack with the property.
     *
     * @param propertyKey - The property to use.
     * @returns The valdation chainer to chain.
     */
    check(propertyKey: keyof ObjType): ValidationChainer<ObjType>;
    /**
     * Takes in a function to check if the property was valid and shows the message in the errors when not.
     * It will stop the current validation call stack if it failed.
     *
     * @param func A function that returns whether or not the property was valid. It can be a promise.
     * @param message The message to show in the errors when the property fails validation.
     * @returns The valdation chainer to chain.
     */
    validate(func: (value: any) => Promise<boolean> | boolean, message?: string): ValidationChainer<ObjType>;
    /**
     * Replaces the property value with whatever the function returns.
     *
     * @param func A function to replace the property value. It can be a promise.
     * @returns The valdation chainer to chain.
     */
    sanitize(func: (value: any) => Promise<any> | any): ValidationChainer<ObjType>;
    /**
     * Fails the property if the previously checked property that is passed in has failed.
     *
     * @param propertyKey The property to check
     * @param message The message to show in the errors when it failed. Leave this blank to use the failed property's message.
     * @returns The valdation chainer to chain.
     */
    ensureProperty(propertyKey: keyof ObjType, message?: string): ValidationChainer<ObjType>;
    /**
     * The function to call at the end of the chain.
     * This is will start executing the functions in the callstacks.
     *
     * @returns An array of ValidationErrors.
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
export interface ValidationError {
    property: string;
    message: string;
}
export declare class ValidationChainer<ObjType> {
    private _objToValidate;
    private _callStackArray;
    private _currentObjData;
    errors?: ValidationError[];
    constructor(objToValidate: ObjType);
    check(propertyKey: keyof ObjType): ValidationChainer<ObjType>;
    validate(func: (value: any) => Promise<boolean> | boolean, message?: string): ValidationChainer<ObjType>;
    sanitize(func: (value: any) => Promise<any> | any): ValidationChainer<ObjType>;
    ensureProperty(propertyKey: keyof ObjType, message?: string): ValidationChainer<ObjType>;
    pack(): Promise<ValidationError[]>;
}
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
export declare function startChain<ObjType>(objToValidate: ObjType): ValidationChainer<ObjType>;
//# sourceMappingURL=index.d.ts.map
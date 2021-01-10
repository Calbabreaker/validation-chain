export interface ValidationError {
    property: string;
    message: string;
}
export declare class ValidationChain<ObjType> {
    private _objToValidate;
    private _callStackArray;
    private _currentObjData;
    errors?: ValidationError[];
    constructor(objToValidate: ObjType);
    check(propertyKey: keyof ObjType): ValidationChain<ObjType>;
    validate(func: (value: any) => Promise<boolean> | boolean, message?: string): ValidationChain<ObjType>;
    sanitize(func: (value: any) => Promise<any> | any): ValidationChain<ObjType>;
    ensureProperty(propertyKey: keyof ObjType, message?: string): ValidationChain<ObjType>;
    pack(): Promise<ValidationError[]>;
}
export declare function validateChain<ObjType>(objToValidate: ObjType): ValidationChain<ObjType>;
//# sourceMappingURL=index.d.ts.map
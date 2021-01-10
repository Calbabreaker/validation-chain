export interface ValidationError {
    property: string;
    message: string;
}

export class ValidationChain<ObjType> {
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

    check(propertyKey: keyof ObjType): ValidationChain<ObjType> {
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
    validate(
        func: (value: any) => Promise<boolean> | boolean,
        message: string = ""
    ): ValidationChain<ObjType> {
        this._callStackArray[this._callStackArray.length - 1].push(async () => {
            const success = await func(this._currentObjData.value);
            this._currentObjData.message = message;
            return success;
        });

        return this;
    }

    // replaces the property value with whatever the function returns
    sanitize(func: (value: any) => Promise<any> | any): ValidationChain<ObjType> {
        this._callStackArray[this._callStackArray.length - 1].push(async () => {
            this._currentObjData.value = await func(this._currentObjData.value);
            return true;
        });

        return this;
    }

    // fails if the property previously checked property has failed
    // leave message empty to use the fail property message
    ensureProperty(propertyKey: keyof ObjType, message?: string): ValidationChain<ObjType> {
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
export function validateChain<ObjType>(objToValidate: ObjType): ValidationChain<ObjType> {
    return new ValidationChain(objToValidate);
}

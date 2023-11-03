import {ITimeTableItem} from "./models";

export interface IClinic{
    uid: string,
    name: string
}
export interface ISpecialty{
    uid: string,
    name: string,
}
export interface IEmployee{
    uid: string,
    name: string,
}
export interface IService{
    uid: string,
    name: string,
    duration: number
}

export enum ETextFields{
    name = "name",
    middleName = "middleName",
    surname = "surname",
    phone = "phone",
    email = "email",
    comment = "comment",
}
export type ITextFields = {
    [key in ETextFields]: string;
};

export interface ISelectedParams{
    dateTime:   ITimeTableItem,
    employee:   IEmployee,
    clinic:     IClinic,
    services:    IService[],
    specialty:  ISpecialty,
    textFields: ITextFields
}

export interface ISelectionSetterParams{
    dateTime?:   ITimeTableItem,
    employee?:   IEmployee,
    clinic?:     IClinic,
    services?:    IService[],
    specialty?:  ISpecialty,
    textFields?: ITextFields
}
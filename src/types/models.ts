import {ETextFields, IService} from "./selectedData";

export interface IOneCClinic{
    uid: string,
    name: string,
}

export interface IOneCEmployee{
    name:       string,
    surname:    string,
    middleName: string,
    clinic:     string,
    clinicUid:  string,
    inSchedule: boolean,
    specialties: {
        [key: string]: {
            name: string
        }
    },
    services: {
        [key: string]: {
            title: string,
            personalDuration?: string | number
        }
    }
}

export interface IOneCNomenclature{
    name:           string,
    typeOfItem:     string,
    duration:       number,
    specialty:      string,
    specialtyUid:   string,
    artNumber:      string,
    isAnalysis:     boolean,
    isMedicalCheck: boolean,
    VAT:            string,
    success:        boolean,
    prices: {
        [key: string]: {
            priceList:  string,
            price:      string
        }
    }
}

export interface ITimeTableItem{
    date: string,
    timeBegin: string,
    timeEnd: string,
    formattedDate: string,
    formattedTimeBegin: string,
    formattedTimeEnd: string,
    typeOfTimeUid?: string,
}

export interface ITimeTable{
    free: ITimeTableItem[],
    busy: ITimeTableItem[],
    freeNotFormatted: ITimeTableItem[],
}

export interface IScheduleItem{
    clinicUid:          string,
    duration:           string,
    durationInSeconds:  number,
    name:               string,
    refUid:             string,
    specialty:          string,
    timetable:          ITimeTable,
}

export interface IOneCdata{
    clinics: IOneCClinic[],
    employees: {
        [key: string]: IOneCEmployee
    },
    nomenclature: {
        [key: string]: IOneCNomenclature
    },
    schedule: IScheduleItem[],
    error?:         string,
    defaultError?:  string
}

export interface ICalendarProps{
    scheduleItems: {
        [key: string]: ITimeTableItem[]
    },
    disabled: boolean
}

export interface ITextInputProps{
    required?: boolean,
    name: ETextFields,
    label: string,
    multiline?: boolean,
}

export interface IOrderParams{
    clinicUid:  string,
    clinicName: string,
    specialty: string,
    refUid:     string,
    doctorName: string,
    services:   IService[],
    orderDate:  string,
    timeBegin:  string,
    timeEnd:    string,
    name:       string,
    surname:    string,
    middleName: string,
    phone:      string,
    email?:     string,
    comment?:   string,
    address?:   string,
    clientUid?: string,
    orderUid?:  string,
}

export interface IResponse{
    success: boolean,
    error?: string,
    defaultError?: string
}
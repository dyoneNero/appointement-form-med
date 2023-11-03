import {IOneCClinic, IOneCdata, IOrderParams} from "../types/models";
import {makeAutoObservable} from "mobx";
import demoData from "./demoData";
import appState from "./AppState";
import {IEmployee, IService, ISpecialty} from "../types/selectedData";
import {IResponse} from "../types/models";

class OneCDataState {

    private requestParams = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json;charset=utf-8',
        },
        body: '',
    }

    private data: IOneCdata = {
        clinics:        [],
        employees:      {},
        nomenclature:   {},
        schedule:       [],
    }


    constructor() {
        makeAutoObservable(this, {
            makeResponse: false,
            getNameByUid: false,
            getServiceByUid: false,
        })
    }

    get oneCData() {
        return this.data;
    }
    set oneCData(data: IOneCdata){
        this.data = data;
    }

    public async loadData(): Promise<IResponse>{
        if (appState.isDemoMode){
            this.oneCData = demoData;
            return new Promise(
                (resolve) => setTimeout(
                    () => resolve(this.makeResponse(true)
                    ), 3000
                )
            )
        }
        try{
            const data: IOneCdata = await this.getAppointmentData();

            if (data && data.error){
                return this.makeResponse(false, data.error);
            }else{
                if (data.clinics.length > 0){
                    if (Object.keys(data.nomenclature).length > 0){
                        if (Object.keys(data.employees).length > 0){
                            if (data.schedule.length > 0){
                                this.oneCData = data;
                                return this.makeResponse(true);
                            }
                            else{
                                return this.makeResponse(false,"Schedule not found");
                            }
                        }else{
                            return this.makeResponse(false,"Employees not found");
                        }
                    }else{
                        return this.makeResponse(false,"Nomenclature not found");
                    }
                }else{
                    return this.makeResponse(false,"Clinics not found");
                }
            }
        }
        catch (e) {
            return this.makeResponse(false,`${e}`);
        }
    }

    private async getAppointmentData(): Promise<IOneCdata> {
        try {
            const response = await fetch("https://medprak.ru/wp-widjet/examples/index.php", this.requestParams);
            if (response.ok) {

                const text = await response.text();
                const data: IOneCdata = JSON.parse(text.replace(/^<pre>|<\/pre>$/g, ''));
                if (data.hasOwnProperty("defaultError")){
                    console.error("Default error - " + data.defaultError)
                }

                return data.hasOwnProperty("error") ? Promise.reject(data.error) : Promise.resolve(data);
            }else{
                return Promise.reject(`Get data error. Status code ${response.status}`);
            }
        } catch(e) {
            return Promise.reject(`${e}`);
        }
    }

    get specialtiesList(): Array<ISpecialty> {
        const specialtiesList: ISpecialty[] = [];
        if(Object.keys(this.data.employees).length > 0)
        {
            for (let uid in this.data.employees)
            {
                if (!this.data.employees.hasOwnProperty(uid)){
                    throw new Error("Employee uid not found on specialties render");
                }
                const clinicCondition = (appState.selected.clinic.uid === this.data.employees[uid].clinicUid);
                let canRender = true;
                if(appState.isStrictCheckingOfRelations){
                    canRender = clinicCondition;
                    if (appState.isShowDoctorsWithoutDepartment){
                        canRender = clinicCondition || !this.data.employees[uid].clinicUid;
                    }
                }

                if (canRender && (Object.keys(this.data.employees[uid]['specialties']).length > 0))
                {
                    const specialties = this.data.employees[uid]['specialties'];
                    for (let specialtyUid in specialties)
                    {
                        if (specialties.hasOwnProperty(specialtyUid)){
                            const alreadyRendered = specialtiesList.find(spec => spec.uid === specialtyUid);
                            if (!alreadyRendered){
                                specialtiesList.push({
                                    uid: specialtyUid,
                                    name: specialties[specialtyUid].name,
                                });
                            }
                        }
                    }
                }
            }
            if (specialtiesList.length === 0){
                specialtiesList.push({
                    uid: '',
                    name: 'В выбранной клинике не найдено направлений деятельности',
                });
            }
        }
        return specialtiesList;
    }

    get employeesList(): Array<IEmployee>{
        const employeesList: IEmployee[] = [];

        if(Object.keys(this.data.employees).length > 0) {
            for (let uid in this.data.employees)
            {
                if (this.data.employees.hasOwnProperty(uid))
                {


                    const selectedSpecialty = appState.selected.specialty.uid;
                    const selectedClinic = appState.selected.clinic.uid;
                    const specialtyCondition = this.data.employees[uid]['specialties'].hasOwnProperty(selectedSpecialty);
                    const clinicCondition = selectedClinic === this.data.employees[uid].clinicUid;

                    let canRender = specialtyCondition;

                    if(appState.isStrictCheckingOfRelations){
                        if (appState.isShowDoctorsWithoutDepartment){
                            canRender = (specialtyCondition && !this.data.employees[uid].clinicUid)
                                ||
                                (specialtyCondition && clinicCondition);
                        }
                        else
                        {
                            canRender = specialtyCondition && clinicCondition;
                        }
                    }

                    //!!update
                    if (canRender)
                    {
                        if (!appState.isSelectDoctorBeforeService)
                        {
                            let canDoctorDoSelectedServices: boolean = true;

                            if (appState.selected.services.length > 0){
                                appState.selected.services.forEach((service:IService) => {
                                    if (!this.data.employees[uid].services.hasOwnProperty(service.uid)){
                                        canDoctorDoSelectedServices = false;
                                    }
                                })
                            }
                            else{
                                canDoctorDoSelectedServices = false;
                            }

                            if (!canDoctorDoSelectedServices){
                                continue;
                            }
                        }
                        employeesList.push({
                            uid: uid,
                            name: `${this.data.employees[uid].surname} ${this.data.employees[uid].name} ${this.data.employees[uid].middleName}`
                        });
                    }
                }
            }
        }

        if (employeesList.length === 0){
            employeesList.push({
                uid: '',
                name: 'К сожалению, по выбранным параметрам на ближайшее время нет свободных специалистов',
            });
        }
        return employeesList;
    }

    get servicesList(): Array<IService>{
        const servicesList: IService[] = [];

        if(Object.keys(this.data.nomenclature).length > 0)
        {
            for (let uid in this.data.nomenclature)
            {
                if (!this.data.nomenclature.hasOwnProperty(uid)){
                    throw new Error("Employee uid not found on specialties render");
                }

                const SelectedSpec = appState.selected.specialty.uid;
                let renderCondition = (appState.selected.specialty.uid
                    === this.data.nomenclature[uid].specialtyUid);

                if (appState.isSelectDoctorBeforeService){
                    const selectedEmployeeUid = appState.selected.employee.uid;
                    renderCondition = renderCondition && selectedEmployeeUid.length > 0
                        && this.data.employees[selectedEmployeeUid].services.hasOwnProperty(uid);
                }

                if (renderCondition)
                {
                    const selectedClinic = appState.selected.clinic.uid;

                    let price = 0;
                    if (this.data.nomenclature[uid]['prices'].hasOwnProperty(selectedClinic)){
                        price = Number((this.data.nomenclature[uid]['prices'][selectedClinic]['price']).replace(/\s+/g, ''));
                    }
                    
                    //!!update
                    if(this.data.nomenclature[uid].success){
                        servicesList.push({
                            uid: uid,
                            name: `${this.data.nomenclature[uid].name} ${price>0 ? price+"₽" : ""}`,
                            duration: this.data.nomenclature[uid].duration
                        });
                    }
                }
            }
        }

        if (servicesList.length === 0){
            servicesList.push({
                uid: '',
                name: 'К сожалению, по выбранным параметрам нет подходящих услуг',
                duration: 0
            });
        }
        return servicesList;
    }

    public async sendOrder (params: IOrderParams): Promise<IResponse> {
        if (appState.isDemoMode){
            return new Promise(
                (resolve) => setTimeout(
                    () => resolve(this.makeResponse(true)
                    ), 3000
                )
            )
        }
        try {
            this.requestParams.body = JSON.stringify(params);
            const response = await fetch("https://medprak.ru/wp-widjet/request/CreateRequest.php", this.requestParams);

            if (response.ok)
            {
                //--
                //!update
                const spamSuccess = true
                //--

                const result = await response.json();

                if (result.error)
                {
                    if (result.hasOwnProperty("defaultError")){
                        console.error(result.defaultError);
                    }
                    return this.makeResponse(false, result.error);
                }
                else if(result.success)
                {
                    params["email"] ? await this.sendToEmail(params) : void(0);
                    return this.makeResponse(true);
                }
                else
                {
                    return this.makeResponse(false, 'Can not decode server response.');
                }
            }
            else
            {
                return this.makeResponse(false, 'Can not connect to 1c. Status code - ' + response.status);
            }
        }
        catch(e) {
            return this.makeResponse(false, `${e}`);
        }
    }

    private async sendToEmail (params: IOrderParams) {
        this.requestParams.body = JSON.stringify(params);
        await fetch("/umc-api/email/send", this.requestParams);
    }

    public makeResponse(success: boolean, error: string = ''): IResponse
    {
        const response: IResponse = {success: success};
        if (error.length > 0){
            response.error = error;
        }
        return response;
    }

    getNameByUid(key: string, uid: string){
        switch (key) {
            case 'clinics':
                let clinic = this.data.clinics.find((item: IOneCClinic) => item.uid === uid);
                if (clinic && clinic.hasOwnProperty('name')){
                    return clinic.name;
                }
                return '';
            case 'specialties':
                let specialty = this.specialtiesList.find((item: ISpecialty) => item.uid === uid);
                if (specialty && specialty.hasOwnProperty('name')){
                    return specialty.name;
                }
                return '';
            case 'employees':
                return `${this.data.employees[uid]?.surname} ${this.data.employees[uid]?.name} ${this.data.employees[uid]?.middleName}`;
            case 'services':
                return this.data.nomenclature[uid]?.name;
            default:
                // @ts-ignore
                return this.data[key][uid]?.name;
        }
    }

    getServiceByUid(uid: string){
        return this.data.nomenclature[uid];
    }
}

export default new OneCDataState();
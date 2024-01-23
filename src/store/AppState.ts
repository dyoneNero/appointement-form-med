import {makeAutoObservable} from "mobx";
import {
    ETextFields,
    ISelectedParams, IService
} from "../types/selectedData";
import dataState from "./OneCDataState";

class AppState {
    constructor() {
        makeAutoObservable(this,{
            checkTextFields: false,
            isServicesAvailable: false
        });
        if (process.env.NODE_ENV === "development"){
            this.DEMO_MODE = false;
        }
    }

    private readonly DEMO_MODE:                     boolean = false;
    private readonly privacyLink:                   string  = "#";
    private readonly useTimeSteps:                  boolean = true;
    private readonly timeStepDurationMinutes:       number	= 20;
    private readonly strictCheckingOfRelations:     boolean	= true;
    private readonly showDoctorsWithoutDepartment:  boolean = true;
    private readonly useMultipleServices:           boolean = true;

    private loading                     = true;
    private needToLoad                  = true;
    private appOpen                     = false;
    private canRender                   = true;
    private selectDoctorBeforeService 	= true;
    private activeStepNumber            = 0;

    //!!update
    private activePopupUid = ""
    private spam = false;

    private selectedValues: ISelectedParams = {
        clinic: {
            uid: '',
            name: '',
        },
        specialty: {
            uid: '',
            name: '',
        },
        services: [],
        employee: {
            uid: '',
            name: '',
        },
        dateTime: {
            date: '',
            timeBegin: '',
            timeEnd: '',
            formattedDate: '',
            formattedTimeBegin: '',
            formattedTimeEnd: '',
        },
        textFields: {
            name: '',
            middleName: '',
            surname: '',
            phone: '',
            email: '',
            comment: ''
        }
    }

    private validTextFields:{[key in ETextFields]:boolean} = {
        name: false,
        middleName: false,
        surname: false,
        phone: false,
        email: true,
        comment: true
    }

    private result: boolean = false;


    get isActivePopupUid() {
        return this.activePopupUid;
    }
    set isActivePopupUid(value: string){
        this.activePopupUid = value;
    }

    get isSpam() {
        return this.spam;
    }
    set isSpam(value: boolean){
        this.spam = value;
    }

    get isLoading() {
        return this.loading;
    }
    set isLoading(value: boolean){
        this.loading = value;
    }

    get isNeedToLoad() {
        return this.needToLoad;
    }
    set isNeedToLoad(value: boolean){
        this.needToLoad = value;
    }

    get isAppOpen() {
        return this.appOpen;
    }
    set isAppOpen(value: boolean){
        this.appOpen = value;
    }

    get isCanRender() {
        return this.canRender;
    }
    set isCanRender(value: boolean){
        this.canRender = value;
    }

    get activeStep(){
        return this.activeStepNumber;
    }
    stepNext = () => {
        this.activeStepNumber++;
    }
    stepBack = () => {
        this.activeStepNumber--;
    }
    set setStep(value: number){
        this.activeStepNumber = value;
    }

    toggleAppointmentForm(open: boolean) {
        if (!open && this.activeStep === 3)
        {
            this.isNeedToLoad = true;
            this.activeStepNumber = 0
            this.setSecondStepToDefaults()
        }
        this.isAppOpen = open;
        //!update
        this.isActivePopupUid = "";
    }

    set validityOfTextFields(val: {[key:string]:boolean}){
        this.validTextFields = {...this.validTextFields, ...val};
    }
    get validityOfTextFields() {
        return this.validTextFields;
    }
    checkTextFields(){
        let allValid = true;
        for (const key in this.validTextFields) {
            if (this.validityOfTextFields[key] === false){
                allValid = false;
                break;
            }
        }
        return allValid;
    }

    get selected(): ISelectedParams {
        return this.selectedValues;
    }
    set selected(selected: any){
        this.selectedValues = {...this.selectedValues, ...selected};
    }
    setSecondStepToDefaults(){
        this.selected = {
            services: [],
            employee: { uid: '', name: '', },
            dateTime: { date: '', timeBegin: '', timeEnd: '', formattedDate: '', formattedTimeBegin: '', formattedTimeEnd: ''}
        }
    }
    isServicesAvailable(): boolean{
        let allAvailable = true;
        for(let i=0; i < this.selectedValues.services.length; i++){
            const available = dataState.servicesList.find(
                (service: IService) => service.uid === this.selectedValues.services[i].uid
            );
            if (!available){
                allAvailable = false;
                break;
            }
        }
        return allAvailable;
    }

    get isSelectDoctorBeforeService(){
        return this.selectDoctorBeforeService;
    }
    set isSelectDoctorBeforeService(value: boolean){
        this.selectDoctorBeforeService = value;
    }

    get appResult() {
        return this.result;
    }
    set appResult(value: boolean){
        this.result = value;
    }

    get isDemoMode() {
        return this.DEMO_MODE;
    }
    get timeStepDuration(){
        return this.timeStepDurationMinutes;
    }
    get isUseTimeSteps(){
        return this.useTimeSteps;
    }
    get isStrictCheckingOfRelations(){
        return this.strictCheckingOfRelations;
    }
    get isShowDoctorsWithoutDepartment(){
        return this.showDoctorsWithoutDepartment;
    }
    get isUseMultipleServices(){
        return this.useMultipleServices;
    }
    get privacyPageUrl(){
        return this.privacyLink;
    }
}

export default new AppState();
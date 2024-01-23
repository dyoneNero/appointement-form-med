import {FC, useEffect} from 'react';
import {
    Box,
    CircularProgress, Dialog, IconButton,
    Step, StepLabel, Stepper,
    Typography,
    useMediaQuery,
    useTheme
} from "@mui/material";
import CloseIcon from '@mui/icons-material/Close';
import SelectionForm from "./SelectionForm/SelectionForm";
import ModeForm from "./ModeForm/ModeForm";
import FinalScreen from "./FinalScreen/FinalScreen";
import ContactForm from "./ContactForm/ContactForm";
import {observer} from "mobx-react-lite";
import appState from "../../store/AppState";
import "./AppointmentForm.css";
import OneCDataState from '../../store/OneCDataState';
import { IClinic, IService } from '../../types/selectedData';


const AppointmentForm:FC = () => {

    const theme = useTheme();
    const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));

    const steps = [
        {id: 'mode',        label: "Филиал и направление"},
        {id: 'selection',   label: "Доктор, услуга, время"},
        {id: 'contact',     label: "Контакты"},
        {id: 'final',       label: "Результат"},
    ];
    
    function getStepContent(step: number) {
        switch (step) {
            case 0:
                return <ModeForm />;
            case 1:
                return <SelectionForm />;
            case 2:
                return <ContactForm />;
            case 3:
                return <FinalScreen />;
            default:
                throw new Error('Unknown step');
        }
    }

    //!!update
    let selectedDefault = {
        clinic: {
            name: "",
            uid: ""
        },
        specialty: {
            name: '', 
            uid: ''
        },
        employee: {
            name: '', 
            uid: '' 
        },
        dateTime: { 
            date:'',
            timeBegin:'',
            timeEnd:'',
            formattedDate:'',
            formattedTimeBegin:'',
            formattedTimeEnd:''
        },
        services: []
    };

    useEffect(() => {
        if(appState.isActivePopupUid != "") {
            appState.isAppOpen = true
            
            if (!appState.isLoading) {

                if (appState.isActivePopupUid == "null") {
                    appState.selected = selectedDefault
                    if(OneCDataState.oneCData.clinics.length == 1) {
                        appState.selected.clinic = OneCDataState.oneCData.clinics[0]
                    }
                    if(appState.activeStep != 0) {
                        appState.setStep = 0
                    }
                    appState.isAppOpen = true
                }
                else if (OneCDataState.getNameByUid('employees', appState.isActivePopupUid) != "undefined undefined undefined") {
                    appState.selected = selectedDefault
        
                    if(OneCDataState.oneCData.clinics.length == 1) {
                        appState.selected.clinic = OneCDataState.oneCData.clinics[0]
                    }

                    const empUid = appState.isActivePopupUid
                    appState.selected.services = []
                    appState.isSelectDoctorBeforeService = true
                    if(appState.activeStep == 0) {
                        appState.stepNext()
                    }
        
                    const employee = OneCDataState.oneCData.employees[empUid]

                    let clinicSelectObj: IClinic = {
                        uid: employee.clinicUid,
                        name: OneCDataState.getNameByUid('clinics', employee.clinicUid)
                    }
            
                    
                    for(var spec in employee.specialties){
                        if(appState.selected.specialty.uid == "" && appState.selected.specialty.name == "") {
                            appState.selected.specialty.uid = spec
                            appState.selected.specialty.name = employee.specialties[spec].name
                        }
                    }

                    appState.selected.clinic = clinicSelectObj
                    appState.selected.employee.uid = empUid
                    appState.selected.employee.name = `${employee.surname} ${employee.middleName} ${employee.name}`

                    appState.isAppOpen = true
                }
                else if (OneCDataState.getNameByUid('services', appState.isActivePopupUid) != undefined) {
                    appState.selected = selectedDefault

                    
                    if(OneCDataState.oneCData.clinics.length == 1) {
                        appState.selected.clinic = OneCDataState.oneCData.clinics[0]
                    }
        
                    const serviceUid = appState.isActivePopupUid
                    appState.isSelectDoctorBeforeService = false
                    if(appState.activeStep == 0) {
                        appState.stepNext()
                    }
        
                    const service = OneCDataState.oneCData.nomenclature[serviceUid]
                    
                    let empUid = ""

                    for (var emp in OneCDataState.oneCData.employees) {
                        for (var servEmp in OneCDataState.oneCData.employees[emp].services) {
                            if(servEmp == serviceUid) {
                                empUid = emp
                            }
                        }
                    }

                    const employee = OneCDataState.oneCData.employees[empUid]

                    let clinicSelectObj: IClinic = {
                        uid: employee.clinicUid,
                        name: OneCDataState.getNameByUid('clinics', employee.clinicUid)
                    }

                    let serviceSelectObj: IService = {
                        uid: "",
                        name: "",
                        duration: 0
                    }

                    for(var spec in employee.specialties){
                        if(appState.selected.specialty.uid == "" && appState.selected.specialty.name == "") {
                            appState.selected.specialty.uid = spec
                            appState.selected.specialty.name = employee.specialties[spec].name
                        }
                    }
            
                    if(appState.selected.services.length == 0) {
                        serviceSelectObj.uid = serviceUid
                        serviceSelectObj.name = service.name
                        serviceSelectObj.duration = service.duration
                        appState.selected.services.push(serviceSelectObj)
                    }

                    appState.selected.clinic = clinicSelectObj
                    appState.selected.employee.uid = empUid
                    appState.selected.employee.name = `${employee.surname} ${employee.middleName} ${employee.name}`
                    
                    appState.isAppOpen = true
                }
                else {
                    throw new Error("Entity not found. Check link your button")
                }
            }
        }
    }, [appState.isActivePopupUid, OneCDataState.oneCData.clinics])
    //!!

    return (
        <Dialog open={appState.isAppOpen}
                onClose={()=>appState.toggleAppointmentForm(false)}
                aria-labelledby={`appointment-form`}
                maxWidth={'md'}
                keepMounted={appState.activeStep !== 3}
                fullScreen={fullScreen}
        >
            <Box sx={{p: { xs: 2, md: 2 } }}>
                <Typography component="h1" variant="h4" align="center">Запись на приём</Typography>
                <IconButton onClick={()=>appState.toggleAppointmentForm(false)}
                            sx={{position: 'absolute', top: '10px', right: '10px'}}
                >
                    <CloseIcon />
                </IconButton>
                <Stepper activeStep={appState.activeStep} sx={{ pt: 2, pb: 1 }}>
                    {steps.map((step) => (
                        step.id === 'final'
                          ? void(0)
                          :   <Step key={step.id}>
                                <StepLabel>{step.label}</StepLabel>
                              </Step>
                    ))}
                </Stepper>
            </Box>

            {getStepContent(appState.activeStep)}

            {appState.isLoading && <Box className={'appointment-loading-screen'}>
                <CircularProgress/>
            </Box>}
        </Dialog>
    );
}

export default observer(AppointmentForm);
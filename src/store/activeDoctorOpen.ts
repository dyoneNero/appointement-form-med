import appState from "./AppState"
import OneCDataState from "./OneCDataState"

//!!!update
const activeDoctorOpen = (employeeUid: string) => {

    const step = appState.activeStep

    if(appState.isCanRender) {
        appState.isSelectDoctorBeforeService = true
        if(step == 0) {
            appState.stepNext()
        }
        appState.isAppOpen = true
        const employee = OneCDataState.oneCData.employees[employeeUid]
        

        appState.selected.clinic.name = employee.clinic
        appState.selected.clinic.uid = employee.clinicUid
        appState.selected.employee.uid = employeeUid
        appState.selected.employee.name = `${employee.surname} ${employee.middleName} ${employee.name}`

        //Проблемы
        for(var spec in employee.specialties){
            appState.selected.specialty.uid = spec
            appState.selected.specialty.name = employee.specialties[spec].name
        }

        console.log(employee)
    }
}

export default activeDoctorOpen
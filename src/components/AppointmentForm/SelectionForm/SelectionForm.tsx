import React, {FC, useEffect, useState} from 'react';
import {
    Box,
    Button,
    DialogContent,
    FormControl,
    InputLabel,
    MenuItem,
    Select,
    Typography
} from "@mui/material";
import appState from "../../../store/AppState";
import dataState from "../../../store/OneCDataState";
import {observer} from "mobx-react-lite";
import Calendar from "../Calendar/Calendar";
import {IEmployee, ISelectionSetterParams, IService} from "../../../types/selectedData";
import {getScheduleItems} from "../Calendar/functions";
import CheckboxesTags from "../../UI/CheckBoxesTags/CheckBoxesTags";
import {toJS} from "mobx";

const SelectionForm: FC = () => {
    const selected = appState.selected;
    const startFromDoctor = appState.isSelectDoctorBeforeService;

    const setDoctor = (e: any) => {
        const newState: ISelectionSetterParams = {
            employee: {
                name: dataState.getNameByUid('employees', e.target.value),
                uid: e.target.value
            },
            dateTime: {
                date: '',
                timeBegin: '',
                timeEnd: '',
                formattedDate: '',
                formattedTimeBegin: '',
                formattedTimeEnd: '',
            }
        };
        if (startFromDoctor){
            newState.services = []
        }
        appState.selected = newState;
    }
    const setService = (value: IService[]) => {
        const newState: ISelectionSetterParams = {
            services: value,
            dateTime: {
                date: '',
                timeBegin: '',
                timeEnd: '',
                formattedDate: '',
                formattedTimeBegin: '',
                formattedTimeEnd: '',
            }
        };
        if (!startFromDoctor){
            newState.employee = {
                name: '',
                uid: ''
            }
        }
        appState.selected = newState;
    }

    const canRenderEmployees = ((selected.services.length > 0) || startFromDoctor);
    const canRenderServices = ((selected.employee.uid.length > 0) || !startFromDoctor);

    const scheduleItems = getScheduleItems();
    const calendarDisabled = !((selected.services.length > 0) && (selected.employee.uid.length > 0));

    const selectedEmployeeAvailable = dataState.employeesList.find(
        (emp: IEmployee) => emp.uid === selected.employee.uid
    );
    const selectedServiceAvailable = appState.isServicesAvailable();

    let sumDuration = 0;
    selected.services.forEach((service: IService) => (sumDuration += service.duration))
    const hours = Math.floor( sumDuration / 3600);
    const minutes = ((sumDuration - hours * 3600) / 60).toFixed(0)
    const durationText = (hours >= 1) ? `${hours}ч. ${minutes}мин.` : `${minutes} минут`


    /*!!update*/
    function randomNumber(min: number, max: number) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    const autoSelectFirstDoctor = () => {
        /*random*/
        if(dataState.employeesList[0].uid != "") {
            let lengthEmployees = dataState.employeesList.length
            
            let randomEmployee = randomNumber(1, lengthEmployees) -  1

            appState.selected.employee.uid = dataState.employeesList[randomEmployee].uid //Работает но с предупреждением MobX
            appState.selected.employee.name = dataState.employeesList[randomEmployee].name
            //console.log(appState.selected.employee)
        }
        else {
            //тут можно ебануть вывод ошибки, если доктора по таким услугам нет
        }
    }

    if(!startFromDoctor){
        autoSelectFirstDoctor()
    }

    return (
        <>
            <DialogContent>
                <Box sx={{display: 'flex', flexDirection: 'column'}}>

                    {
                        /*
                        startFromDoctor? 
                        <FormControl margin={`dense`} fullWidth sx={{order: startFromDoctor?'0':'1'}}>
                            <InputLabel id="employee-select-label">Выберите доктора</InputLabel>
                            <Select labelId="employee-select-label"
                                    id="employee-select"
                                    name={'employee'}
                                    value={selectedEmployeeAvailable ? selected.employee.uid : ''}
                                    label="Выберите доктора"
                                    onChange={setDoctor}
                                    disabled={!canRenderEmployees}
                            >
                                {
                                    canRenderEmployees && dataState.employeesList.map(employee =>
                                        <MenuItem value={employee.uid} key={employee.uid} disabled={!(employee.uid.length > 0)}>
                                            {employee.name}
                                        </MenuItem>)
                                }
                            </Select>
                        </FormControl>
                        :
                        autoSelectFirstDoctor()
                        */
                    }

                    <FormControl margin={`dense`} fullWidth sx={{order: startFromDoctor?'0':'1'}}>
                        <InputLabel id="employee-select-label">Выберите доктора</InputLabel>
                        <Select labelId="employee-select-label"
                                id="employee-select"
                                name={'employee'}
                                value={selectedEmployeeAvailable ? selected.employee.uid : ''}
                                label="Выберите доктора"
                                onChange={setDoctor}
                                disabled={!canRenderEmployees}
                        >
                            {
                                canRenderEmployees && dataState.employeesList.map(employee =>
                                    <MenuItem value={employee.uid} key={employee.uid} disabled={!(employee.uid.length > 0)}>
                                        {employee.name}
                                    </MenuItem>)
                            }
                        </Select>
                    </FormControl>
                    
                    
                    <FormControl  margin={`dense`} fullWidth sx={{order: startFromDoctor?'1':'0'}}>
                        <CheckboxesTags id={'service-select-search'}
                                        options={
                                            canRenderServices
                                                ?
                                                dataState.servicesList.map(service => {
                                                    return {
                                                        name: service.name,
                                                        uid: service.uid,
                                                        duration: service.duration
                                                    };
                                                })
                                                :
                                                []
                                        }
                                        label={'Выберите услуги'}
                                        disabled={!canRenderServices}
                                        value={selectedServiceAvailable ? toJS(selected.services) : []}
                                        valueSetter={setService}
                                        multiple={appState.isUseMultipleServices}
                        />
                    </FormControl>

                    {
                        selected.services.length > 0
                            ?
                            <Typography variant="caption"
                                        display="block"
                                        gutterBottom
                                        sx={{order: startFromDoctor?'1':'0'}}>
                                Длительность выбранных услуг - {`${durationText}`}
                            </Typography>
                            :
                            ''
                    }

                    {/*<FormControl margin={`dense`} fullWidth sx={{order: startFromDoctor?'1':'0'}}>
                        <InputLabel id="service-select-label">Выберите услугу</InputLabel>
                        <Select labelId="service-select-label"
                                id="service-select"
                                name={'service'}
                                value={selectedServiceAvailable ? selected.service.uid : ''}
                                label="Выберите услугу"
                                onChange={setService}
                                disabled={!canRenderServices}
                        >
                            {
                                canRenderServices && dataState.servicesList.map(service =>
                                    <MenuItem value={service.uid}
                                              key={service.uid}
                                              disabled={!(service.uid.length > 0)}
                                              sx={{whiteSpace: 'normal', borderBottom: '1px solid rgba(0,0,0,.1)'}}
                                    >
                                        {service.name}
                                    </MenuItem>)
                            }
                        </Select>
                    </FormControl>*/}
                </Box>

                {
                    scheduleItems.hasOwnProperty('error') && !calendarDisabled
                    ?
                    <Typography variant="caption"  sx={{pb: 2, display: 'block', maxWidth:'500px'}}>
                        {scheduleItems['error']}
                    </Typography>
                    :
                    <Calendar  scheduleItems={scheduleItems}
                               disabled={calendarDisabled}
                    />
                }

                
                <Box sx={{p: 0, display: 'flex', justifyContent: 'flex-end'}}>
                    <Button onClick={appState.stepBack} sx={{mt: 3, ml: 1}}>
                        Назад
                    </Button>
                    <Button
                        variant="contained"
                        onClick={appState.stepNext}
                        sx={{mt: 3, ml: 1}}
                        disabled={!(
                            (selected.services.length > 0)
                            && (selected.employee.uid.length > 0)
                            && (selected.dateTime.timeBegin.length > 0)
                        )}
                    >
                        Далее
                    </Button>
                </Box>
            </DialogContent>
        </>
    );
};

export default observer(SelectionForm);
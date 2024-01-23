import appState from "../../../store/AppState";
import dataState from "../../../store/OneCDataState";
import {IScheduleItem, ITimeTableItem} from "../../../types/models";
import {Stack} from "@mui/material";
import React from "react";
import {IService} from "../../../types/selectedData";
import OneCDataState from "../../../store/OneCDataState";

export function getScheduleItems(){
    const data = dataState.oneCData;
    const selected = appState.selected;
    const scheduleItems: any = {};
    data.schedule.forEach((employeeSchedule: IScheduleItem) => {
        if (
            employeeSchedule.clinicUid === selected.clinic.uid
            && employeeSchedule.refUid === selected.employee.uid
        )
        {
            const selectedEmployee = data.employees[employeeSchedule.refUid];
            let servicesDurationsSum = 0;
            selected.services.forEach((service: IService) => {
                let serviceDuration = Number(service.duration);
                if(selectedEmployee.services.hasOwnProperty(service.uid))
                {
                    if (selectedEmployee.services[service.uid].hasOwnProperty("personalDuration")){
                        const personalDuration = selectedEmployee.services[service.uid]["personalDuration"];
                        serviceDuration = Number(personalDuration) > 0 ? Number(personalDuration) : serviceDuration;
                    }
                }
                servicesDurationsSum += serviceDuration;
            })

            const renderCustomIntervals = (servicesDurationsSum > 0);
            const timeKey = renderCustomIntervals ? "freeNotFormatted" : "free";

            if (employeeSchedule.timetable[timeKey].length)
            {
                let intervals = employeeSchedule.timetable[timeKey];

                if (renderCustomIntervals)
                {
                    const customIntervals = getIntervalsForServiceDuration(intervals, servicesDurationsSum*1000);

                    if (customIntervals.length === 0)
                    {
                        scheduleItems['error'] = `К сожалению, запись на выбранные услуги к данному 
                                                  специалисту невозможна на ближайшее время`;
                        return;
                    }
                    else
                    {
                        intervals = customIntervals;
                    }
                }

                let renderDate: string;
                intervals.forEach((day) => {
                    if (day.date !== renderDate)
                    {
                        scheduleItems[day.date] = [];
                        renderDate = day.date;
                    }

                    scheduleItems[day.date].push(day);
                });
            }else{
                scheduleItems['error'] =`К сожалению, запись на выбранные услуги к данному 
                                                  специалисту невозможна на ближайшее время`;
            }
        }
    });

    if (scheduleItems['error'] === undefined && Object.keys(scheduleItems).length === 0){
        scheduleItems['error'] =`К сожалению, у данного специалиста нет записи в выбранном филиале на ближайшее время`;
    }

    return scheduleItems;
}

const getIntervalsForServiceDuration = (intervals: Array<ITimeTableItem>, serviceDurationMs: number) => {
    const newIntervals: Array<ITimeTableItem> = [];
    intervals.length && intervals.forEach((day: ITimeTableItem) => {
        const timestampTimeBegin = Number(new Date(day.timeBegin));
        const timestampTimeEnd = Number(new Date(day.timeEnd));
        const timeDifference = timestampTimeEnd - timestampTimeBegin;
        const appointmentsCount = Math.floor(timeDifference / serviceDurationMs);
        if (appointmentsCount > 0)
        {
            OneCDataState.oneCData.schedule.forEach((employeeSchedule: IScheduleItem) => {
                if (employeeSchedule.clinicUid === appState.selected.clinic.uid && employeeSchedule.refUid === appState.selected.employee.uid) {
                    if (appState.isUseTimeSteps && employeeSchedule.durationInSeconds != 0) {
                        const dur = employeeSchedule.durationInSeconds / 60;
                        let start   = new Date(timestampTimeBegin);
                        let end     = new Date(timestampTimeBegin + serviceDurationMs);
                        while(end.getTime() <= timestampTimeEnd){
                            newIntervals.push({
                                "date": 				day.date,
                                "timeBegin": 			convertDateToISO(Number(start)),
                                "timeEnd": 				convertDateToISO(Number(end)),
                                "formattedDate": 		convertDateToDisplay(Number(start), false),
                                "formattedTimeBegin": 	convertDateToDisplay(Number(start), true),
                                "formattedTimeEnd": 	convertDateToDisplay(Number(end), true),
                            });
                            start.setMinutes(start.getMinutes() + dur);
                            end.setMinutes(end.getMinutes() + dur);
                        }
                    }
                    else {
                        if (appState.isUseTimeSteps && (serviceDurationMs >= 30*60*1000)) //use timeSteps only for services with duration>=30 minutes
                        {
                            let start   = new Date(timestampTimeBegin);
                            let end     = new Date(timestampTimeBegin + serviceDurationMs);
                            while(end.getTime() <= timestampTimeEnd){
                                newIntervals.push({
                                    "date": 				day.date,
                                    "timeBegin": 			convertDateToISO(Number(start)),
                                    "timeEnd": 				convertDateToISO(Number(end)),
                                    "formattedDate": 		convertDateToDisplay(Number(start), false),
                                    "formattedTimeBegin": 	convertDateToDisplay(Number(start), true),
                                    "formattedTimeEnd": 	convertDateToDisplay(Number(end), true),
                                });
                                start.setMinutes(start.getMinutes() + appState.timeStepDuration);
                                end.setMinutes(end.getMinutes() + appState.timeStepDuration);
                            }
                        }
                        else
                        {
                            for (let i = 0; i < appointmentsCount; i++)
                            {
                                let start = Number(new Date(timestampTimeBegin + (serviceDurationMs * i)));
                                let end = Number(new Date(timestampTimeBegin + (serviceDurationMs * (i+1))));
                                newIntervals.push({
                                    "date": 				day.date,
                                    "timeBegin": 			convertDateToISO(start),
                                    "timeEnd": 				convertDateToISO(end),
                                    "formattedDate": 		convertDateToDisplay(start, false),
                                    "formattedTimeBegin": 	convertDateToDisplay(start, true),
                                    "formattedTimeEnd": 	convertDateToDisplay(end, true),
                                });
                            }
                        }
                    }
                }
            })
        }
    });
    return newIntervals;
}

export const getCalendarColumns = (scheduleItems: { [key:string]:Array<ITimeTableItem> }, handlerClick: any) => {
    const columns = [];
    for(let key in scheduleItems){
        if (scheduleItems.hasOwnProperty(key)){
            columns.push(
                <Stack spacing={1} key={key} sx={{textAlign:'center'}}>
                    <h4 className={'appointment-calendar-column-title'}>
                        {convertDateToDisplay(key)}<br/>
                        <span>{readDateInfo(key).weekDay}</span>
                    </h4>
                    {
                        scheduleItems[key].map((item: ITimeTableItem) => {
                            return(
                                <div  key={`${item.date}${item.timeBegin}`}
                                      className={'appointment-calendar-item'}
                                      data-value={JSON.stringify(item)}
                                      onClick={handlerClick}
                                >{item.formattedTimeBegin}</div>
                            )
                        })
                    }
                </Stack>
            );
        }
    }
    return columns;
}

export const convertDateToISO =  (timestamp:  string | number) => {
    const date = readDateInfo(timestamp);

    return `${date.year}-${date.month}-${date.day}T${date.hours}:${date.minutes}:00`;
}

export const convertDateToDisplay =  (timestamp: number | string, onlyTime: boolean = false) => {
    const date = readDateInfo(timestamp);

    if (onlyTime){
        return `${date.hours}:${date.minutes}`;
    }
    return `${date.day}-${date.month}-${date.year}`;
}

export const readDateInfo = (timestampOrISO: string | number) => {
    const weekDays:{[key: number]: string} = {
        0: "Вс",
        1: "Пн",
        2: "Вт",
        3: "Ср",
        4: "Чт",
        5: "Пт",
        6: "Сб",
    }

    const date = new Date(timestampOrISO);

    let day: string = `${date.getDate()}`;
    if (Number(day)<10) {
        day = `0${day}`;
    }

    let month: string = `${date.getMonth()+1}`;
    if (Number(month)<10) {
        month = `0${month}`;
    }

    let hours: string = `${date.getHours()}`;
    if (Number(hours)<10) {
        hours = `0${hours}`;
    }

    let minutes: string = `${date.getMinutes()}`;
    if (Number(minutes)<10) {
        minutes = `0${minutes}`;
    }

    let seconds: string = `${date.getSeconds()}`;
    if (Number(seconds)<10) {
        seconds = `0${seconds}`;
    }

    return {
        "day": day,
        "month": month,
        "year": date.getFullYear(),
        "hours": hours,
        "minutes": minutes,
        "seconds": seconds,
        "weekDay": weekDays[date.getDay()]
    }
}

export const calendarScrollForward = (scrollerRef: React.MutableRefObject<any>, columnRef: React.MutableRefObject<any>) => {
    const scroller = scrollerRef.current;
    const item = columnRef.current;
    const scrollerWidth = scroller.getBoundingClientRect().width;
    if (item){
        if (scroller.scrollLeft < (scroller.scrollWidth - scrollerWidth - 10)) {
            scroller.scrollBy({ left: scrollerWidth, top: 0, behavior: 'smooth' });
        } else {
            scroller.scrollTo({ left: 0, top: 0, behavior: 'smooth' });
        }
    }
}
export const calendarScrollReward = (scrollerRef: React.MutableRefObject<any>, columnRef: React.MutableRefObject<any>) => {
    const scroller = scrollerRef.current;
    const item = columnRef.current;
    const scrollerWidth = scroller.getBoundingClientRect().width;
    if (item){
        if (scroller.scrollLeft !== 0) {
            scroller.scrollBy({ left: -scrollerWidth, top: 0, behavior: 'smooth' });
        } else {
            scroller.scrollTo({ left: scroller.scrollWidth, top: 0, behavior: 'smooth' });
        }
    }

}
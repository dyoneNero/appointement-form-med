import React, {FC, useState} from 'react';
import {Button, DialogActions, DialogContent, DialogContentText, Link} from "@mui/material";
import {observer} from "mobx-react-lite";
import {IOrderParams, IResponse} from "../../../types/models";
import {ETextFields} from "../../../types/selectedData";
import TextInput from "./TextInput/TextInput";
import appState from "../../../store/AppState";
import dataState from "../../../store/OneCDataState";
import SubmitBtn from "../SubmitBtn/SubmitBtn";

const ContactForm:FC = () => {
    const fields = [
        {name: ETextFields.name,       label: 'Ваше имя',      required: true,  multiline: false},
        {name: ETextFields.middleName, label: 'Ваше Отчество', required: true,  multiline: false},
        {name: ETextFields.surname,    label: 'Ваша фамилия',  required: true,  multiline: false},
        {name: ETextFields.phone,      label: 'Телефон',       required: true,  multiline: false},
        {name: ETextFields.email,      label: 'Email',         required: false, multiline: false},
        {name: ETextFields.comment,    label: 'Комментарий',   required: false, multiline: true},
    ];

    const sendOrder = async() => {
        const selected = appState.selected;
        appState.isLoading = true;
        let orderData: IOrderParams = {
            clinicUid:  selected.clinic.uid,
            clinicName: selected.clinic.name,
            specialty: selected.specialty.name,
            refUid:     selected.employee.uid,
            doctorName: selected.employee.name,
            services:   selected.services,
            orderDate:  selected.dateTime.date,
            timeBegin:  selected.dateTime.timeBegin,
            timeEnd:    selected.dateTime.timeEnd,
            ...selected.textFields,
        }

        dataState.sendOrder(orderData).then((res: IResponse) => {
            if (res && res.success){
                appState.appResult = true;
            }else{
                appState.appResult = false;
                console.error(`Send order error. ${res ? res.error : ''}`);
            }
            appState.isLoading = false;
            appState.stepNext();
        });
    }

    return (
        <DialogContent>
            <Button onClick={appState.stepBack} sx={{mt: -2, ml: 1}}>
                Назад
            </Button>

            {
                fields.map(field => {
                    return (
                        <TextInput key={field.name}
                                   name={field.name}
                                   label={field.label}
                                   required={field.required}
                                   multiline={field.multiline}
                        />
                    );
                })
            }
            <DialogActions sx={{display: 'flex', justifyContent: 'center', mt: '30px'}}>
                <SubmitBtn disabled={!appState.checkTextFields() || appState.isLoading} clickHandler={sendOrder}/>
            </DialogActions>

            <DialogContentText sx={{textAlign:'center'}}>
                <span>Отправляя заявку вы соглашаетесь с </span>
                <Link href={appState.privacyPageUrl}
                      onClick={(e) => e.preventDefault()}
                      target={'_blank'}
                      variant="body2"
                >
                    политикой конфиденциальности
                </Link>
                <span> сайта</span>
            </DialogContentText>
        </DialogContent>
    );
};

export default observer(ContactForm);
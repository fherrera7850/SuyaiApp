import React from 'react'

export default function formatDate(date) {
    var d = new Date(date),
        month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear();

    if (month.length < 2)
        month = '0' + month;
    if (day.length < 2)
        day = '0' + day;

    return [month, day, year].join('-');
}

export const formatDateYYYYMMDD = (date) => {
    var d = new Date(date),
        month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear();

    if (month.length < 2)
        month = '0' + month;
    if (day.length < 2)
        day = '0' + day;

    return [year, month, day].join('-');
}

export const formatDateString = (date, abreviado) => {
    const mesesAbreviados = ["Ene.", "Feb.", "Mar.", "Abr.", "May.", "Jun.", "Jul.", "Ago.", "Sept.", "Oct.", "Nov.", "Dic."]
    const meses = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"]

    let mes = abreviado ? mesesAbreviados[new Date(date).getMonth()] : meses[new Date(date).getMonth()]
    return (
        new Date(date).getDate() +
        " de " +
        mes
        +
        " de "
        + new Date(date).getFullYear()
    )
}

export const formatoMonedaChileno = (value) => {
    let format = value.toFixed(0).replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1.")
    return format
}

export async function fetchWithTimeout(resource, options = {}) {
    const { timeout = 5000 } = options;

    const abortController = new AbortController();
    const id = setTimeout(() => abortController.abort(), timeout);
    const response = await fetch(resource, {
        ...options,
        signal: abortController.signal
    });
    clearTimeout(id);
    return response;
}

export const getUTCDate = () => {
    var date = new Date();
    var dateutc = Date.UTC(date.getUTCFullYear(), date.getUTCMonth(),
        date.getUTCDate(), date.getUTCHours(),
        date.getUTCMinutes(), date.getUTCSeconds());
    return (new Date(dateutc))
}





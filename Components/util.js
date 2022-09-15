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
    let format =value.toFixed(0).replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1.")
    return format
}



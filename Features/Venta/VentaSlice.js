import { createSlice } from "@reduxjs/toolkit";

let initialState = {
    _id: null,
    MedioPago: 0,
    Cliente_id: null,
    Dcto: 0,
    Observacion: null,
    PrecioTotalVenta : 0,
    ModoVenta: "Editando" //Editando - Viendo
}

const VentaSlice = createSlice({
    name: "Venta",
    initialState,
    reducers: {
        setMedioPago: (state, action) => {
            state.MedioPago = action.payload
        },
        setCliente_id: (state, action) => {
            state.Cliente_id = action.payload
        },
        setDcto: (state, action) => {
            state.Dcto = action.payload
        },
        setObservacion: (state, action) => {
            state.Observacion = action.payload
        },
        setPrecioTotalVenta: (state, action) => {
            state.PrecioTotalVenta = action.payload
        },
        setModoVenta: (state, action) => {
            state.ModoVenta = action.payload
        },
        resetV: () => initialState
    }
});

export const { setMedioPago, setCliente_id, setDcto, setObservacion, setPrecioTotalVenta, resetV, setModoVenta } = VentaSlice.actions;
export default VentaSlice.reducer

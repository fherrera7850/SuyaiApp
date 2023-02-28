import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    _id: null,
    Direccion: null, 
    Telefono: null, 
    FechaEntrega: null, 
    FechaEntregaDate: null,
    Nota: null, 
    Estado: null, 
    Venta_id: null, 
}

const PedidoSlice = createSlice({
    name: "Pedido",
    initialState,
    reducers: {
        setDireccion: (state, action) => {
            state.Direccion = action.payload
        },
        setTelefono: (state, action) => {
            state.Telefono = action.payload
        },
        setFechaEntrega: (state, action) => {
            state.FechaEntrega = action.payload
        },
        setNota: (state, action) => {
            state.Nota = action.payload
        },
        setVenta_Id: (state, action) => {
            state.Venta_id = action.payload
        },
        resetP : () => initialState,
        setFechaEntregaDate: (state, action) => {
            state.FechaEntregaDate = action.payload
        }
    }
});

export const { setDireccion, setTelefono, setFechaEntrega, setNota, resetP, setVenta_Id, setFechaEntregaDate } = PedidoSlice.actions;
export default PedidoSlice.reducer

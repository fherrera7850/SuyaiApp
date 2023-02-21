import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    _id: null,
    Direccion: null, 
    Telefono: null, 
    FechaEntrega: null, 
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
        resetP : () => initialState
    }
});

export const { setDireccion, setTelefono, setFechaEntrega, setNota, resetP } = PedidoSlice.actions;
export default PedidoSlice.reducer
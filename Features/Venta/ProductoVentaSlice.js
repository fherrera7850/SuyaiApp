import { createSlice } from "@reduxjs/toolkit";

const initialState = []

const ProductoVentaSlice = createSlice({
  name: "productos",
  initialState,
  reducers: {
    setProductos: (state, action) => {
      return state = [...state, ...action.payload];
    },
    addItem: (state, action) => {
      const { _id, Cantidad } = action.payload;

      const founditem = state.find((item) => item._id === _id);
      if (founditem) {
        founditem.Cantidad = Cantidad + 1;
      }
    },
    removeItem: (state, action) => {
      const { _id, Cantidad } = action.payload;

      const founditem = state.find((item) => item._id === _id);
      if (founditem) {
        founditem.Cantidad = Cantidad - 1;
      }
    },
    resetCantidad: (state, action) => {
      state.forEach(element => {
        element.PrecioVenta = 0
        element.Cantidad = 0
      })
    },
    updateCantidad: (state, action) => {
      const { _id, Cantidad } = action.payload;

      const founditem = state.find((item) => item._id === _id);
      
      if (founditem) {
        founditem.Cantidad = Cantidad;
      }
    },
    updatePreciounitario: (state, action) => {
      const { _id, PrecioVenta } = action.payload;

      const founditem = state.find((item) => item._id === _id);
      if (founditem) {
        founditem.PrecioVenta = PrecioVenta;
      }
    },
    resetPV: () => initialState
  }
});

export const { setProductos, addItem, removeItem, resetCantidad, updateCantidad, updatePreciounitario, resetPV } = ProductoVentaSlice.actions;
export default ProductoVentaSlice.reducer;

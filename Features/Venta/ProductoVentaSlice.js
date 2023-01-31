import { createSlice } from "@reduxjs/toolkit";

const ProductoVentaSlice = createSlice({
  name: "productos",
  initialState: [],
  reducers: {
    setProductos: (state, action) => {
      console.log("state", state)
      //return state.push(action.payload);


      //return [...state, action.payload]
      return state = [...state, ...action.payload]; //warkennob es array vacio
      /* return {
        ...state.productos,
        state: action.payload,
      } */
    }
  },
});

export const { setProductos } = ProductoVentaSlice.actions;
export default ProductoVentaSlice.reducer;

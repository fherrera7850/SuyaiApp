import { configureStore } from "@reduxjs/toolkit";

import ProductoVentaReducer from "../Features/Venta/ProductoVentaSlice";

export const store = configureStore({
  reducer: { productos: ProductoVentaReducer },
});

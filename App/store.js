import { configureStore } from "@reduxjs/toolkit";

import ProductoVentaReducer from "../Features/Venta/ProductoVentaSlice";
import VentaReducer from "../Features/Venta/VentaSlice";
import PedidoReducer from "../Features/Venta/PedidoSlice"

export const store = configureStore({
  reducer: { 
    productos: ProductoVentaReducer,
    Venta: VentaReducer,
    Pedido: PedidoReducer
  }
});

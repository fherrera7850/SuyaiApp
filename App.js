import * as React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { NavigationContainer } from '@react-navigation/native';
import VentaScreen from './Screens/Venta'
import HistorialScreen from './Screens/Historial';
import EstadisticasScreen from './Screens/Estadisticas';
import DetalleVentaScreen from './Screens/DetalleVenta';
import SelectorFechaScreen from './Screens/SelectorFecha';
import VentaOkScreen from './Screens/VentaOk';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

const Drawer = createDrawerNavigator();
const Stack = createNativeStackNavigator();

function Root() {
  return (
    <Drawer.Navigator>
      <Drawer.Screen name="Venta" component={VentaScreen} options={{ headerTitle: "Ingresar Venta", title:"Venta" }} />
      <Drawer.Screen name="Historial" component={HistorialScreen} options={{ headerTitle: "Historial de Ventas", title:"Historial de Ventas" }} />
      <Drawer.Screen options={{ title: 'Estadísticas', headerTitle: "Seleccione Período" }} name="SelectorFecha" component={SelectorFechaScreen} />
      
    </Drawer.Navigator>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Root" component={Root} options={{ headerShown: false }} />
        <Stack.Screen options={{ title: 'Detalle Venta' }} name="DetalleVenta" component={DetalleVentaScreen} />
        <Stack.Screen name="Estadisticas" component={EstadisticasScreen} options={{ headerTitle: "Estadísticas", title:"Estadísticas" }} />
        <Stack.Screen name="VentaOk" component={VentaOkScreen} options={{headerShown: false}} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
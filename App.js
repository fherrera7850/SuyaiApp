import * as React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { NavigationContainer } from '@react-navigation/native';
import VentaScreen from './Screens/Venta'
import HistorialScreen from './Screens/Historial';
import EstadisticasScreen from './Screens/Estadisticas';
import DetalleVentaScreen from './Screens/DetalleVenta';
import SelectorFechaScreen from './Screens/SelectorFecha';
import ClientesScreen from './Screens/Clientes';
import VentaOkScreen from './Screens/VentaOk';
import DetalleEstadisticaScreen from './Screens/DetalleEstadistica'
import ClienteScreen from './Screens/Cliente'
import PuntosScreen from './Screens/Puntos'
import SelectorDireccionClienteScreen from './Screens/SelectorDireccionCliente';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useFonts } from 'expo-font'
import PedidosScreen from './Screens/Pedidos'
import GenerarPedidoScreen from './Screens/GenerarPedido'

const Drawer = createDrawerNavigator();
const Stack = createNativeStackNavigator();

function Root() {
  const [fontsLoaded] = useFonts({
    PromptThin: require("./assets/fonts/Prompt-Thin.ttf"),
    PromptExtraLight: require("./assets/fonts/Prompt-ExtraLight.ttf"),
    PromptLight: require("./assets/fonts/Prompt-Light.ttf"),
    PromptRegular: require("./assets/fonts/Prompt-Regular.ttf"),
    PromptMedium: require("./assets/fonts/Prompt-Medium.ttf"),
    PromptSemiBold: require("./assets/fonts/Prompt-SemiBold.ttf"),
  })

  if (!fontsLoaded) return null

  return (
    <Drawer.Navigator>
      <Drawer.Screen
        name="Venta"
        component={VentaScreen}
        options={
          {
            headerTitle: "Ingresar Venta",
            title: "Ventas",
            headerTitleStyle: {
              fontFamily: "PromptSemiBold"
            },
            drawerLabelStyle: {
              fontFamily: "PromptRegular",
              fontSize: 20
            }
          }} />
      <Drawer.Screen
        name="Pedidos"
        component={PedidosScreen}
        options={
          {
            headerTitle: "Listado de Pedidos",
            title: "Pedidos",
            headerTitleStyle: {
              fontFamily: "PromptSemiBold"
            },
            drawerLabelStyle: {
              fontFamily: "PromptRegular",
              fontSize: 20
            }
          }} />
      <Drawer.Screen
        name="Historial"
        component={HistorialScreen}
        options={
          {
            headerTitle: "Historial de Ventas",
            title: "Historial de Ventas",
            headerTitleStyle: {
              fontFamily: "PromptSemiBold"
            },
            drawerLabelStyle: {
              fontFamily: "PromptRegular",
              fontSize: 20
            }
          }} />
      <Drawer.Screen
        options={
          {
            title: 'Estadísticas',
            headerTitle: "Seleccione Período",
            headerTitleStyle: {
              fontFamily: "PromptSemiBold"
            },
            drawerLabelStyle: {
              fontFamily: "PromptRegular",
              fontSize: 20
            }
          }}
        name="SelectorFecha"
        component={SelectorFechaScreen} />
      <Drawer.Screen
        options={
          {
            title: 'Clientes',
            headerTitle: "Clientes",
            headerTitleStyle: {
              fontFamily: "PromptSemiBold"
            },
            drawerLabelStyle: {
              fontFamily: "PromptRegular",
              fontSize: 20
            }
          }}
        name="Clientes"
        component={ClientesScreen} />

    </Drawer.Navigator>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Root" component={Root} options={{ headerShown: false }} />
        <Stack.Screen options={{ title: 'Detalle Venta', headerTitleStyle: { fontFamily: "PromptSemiBold" } }} name="DetalleVenta" component={DetalleVentaScreen} />
        <Stack.Screen name="Estadisticas" component={EstadisticasScreen} options={{ headerTitle: "Estadísticas", title: "Estadísticas", headerTitleStyle: { fontFamily: "PromptSemiBold" } }} />
        <Stack.Screen name="VentaOk" component={VentaOkScreen} options={{ headerShown: false, headerTitleStyle: { fontFamily: "PromptSemiBold" } }} />
        <Stack.Screen name="DetalleEstadistica" component={DetalleEstadisticaScreen} options={{ headerTitleStyle: { fontFamily: "PromptSemiBold" }, headerTitle: "Detalle", }} />
        <Stack.Screen name="Cliente" component={ClienteScreen} options={{ headerTitleStyle: { fontFamily: "PromptSemiBold" }, headerTitle: "Nuevo Cliente", }} />
        <Stack.Screen name="SelectorDireccionCliente" component={SelectorDireccionClienteScreen} options={{ headerTitleStyle: { fontFamily: "PromptSemiBold" }, headerTitle: "Seleccione Dirección", }} />
        <Stack.Screen name="Puntos" component={PuntosScreen} options={{ headerTitleStyle: { fontFamily: "PromptSemiBold" }, headerTitle: "Puntos", }} />
        <Stack.Screen name="GenerarPedido" component={GenerarPedidoScreen} options={{ headerTitleStyle: { fontFamily: "PromptSemiBold" }, headerTitle: "Completar Pedido", }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
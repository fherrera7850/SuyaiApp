import React, { useState, useLayoutEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ToastAndroid, Alert, Linking } from 'react-native';
import { Agenda, LocaleConfig } from 'react-native-calendars';
import { Avatar, Card, Button } from 'react-native-paper';
import { fetchWithTimeout, formatDateString, formatoMonedaChileno, FormatoWhatsapp } from '../Components/util';
import { REACT_APP_SV } from "@env"
import moment from 'moment';
import * as Clipboard from 'expo-clipboard';
import { useFonts } from 'expo-font'
import { useIsFocused } from "@react-navigation/native";
import ReusableModal, { ModalFooter } from '../Components/ReusableModal';
import Icon from 'react-native-vector-icons/FontAwesome'
import { useDispatch } from 'react-redux';
import { setModoVenta } from '../Features/Venta/VentaSlice';
import { updateCantidad, updatePreciounitario, resetCantidad } from '../Features/Venta/ProductoVentaSlice';
import { setVenta_Id, setDireccion, setTelefono, setFechaEntrega, setNota, setFechaEntregaDate } from '../Features/Venta/PedidoSlice';
import Loader from '../Components/Loader';
import CheckBox from 'expo-checkbox'
import { Chip } from 'react-native-paper';

LocaleConfig.locales['es'] = {
  monthNames: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'],
  monthNamesShort: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sept', 'Oct', 'Nov', 'Dic'],
  dayNames: ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'],
  dayNamesShort: ['Dom', 'Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab']
};

LocaleConfig.defaultLocale = 'es';

const Pedidos = ({ navigation }) => {

  const dispatch = useDispatch();
  const isFocused = useIsFocused();
  const [pedidos, setPedidos] = useState([])
  const [cargando, setCargando] = useState(false)
  const [loading, setLoading] = useState(false)
  const [modalVisible, setModalVisible] = useState(false)

  const [modalConfirmaPedido, setModalConfirmaPedido] = useState(false)
  const [isPaid, setIsPaid] = useState(true);
  const [medioPagoFinal, setMedioPagoFinal] = useState(-1)

  const [pedidoSeleccionado, setPedidoSeleccionado] = useState({})
  const [fontsLoaded] = useFonts({
    PromptThin: require("./../assets/fonts/Prompt-Thin.ttf"),
    PromptExtraLight: require("./../assets/fonts/Prompt-ExtraLight.ttf"),
    PromptLight: require("./../assets/fonts/Prompt-Light.ttf"),
    PromptRegular: require("./../assets/fonts/Prompt-Regular.ttf"),
    PromptMedium: require("./../assets/fonts/Prompt-Medium.ttf"),
    PromptSemiBold: require("./../assets/fonts/Prompt-SemiBold.ttf"),
  })

  useLayoutEffect(() => {
    setPedidos([])
    getPedidos()
  }, [isFocused])

  const getPedidos = async () => {

    const ROPedidos = {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      timeout: 10000
    };

    setCargando(true)
    await fetchWithTimeout(REACT_APP_SV + '/api/pedido', ROPedidos)
      .then(response => response.json())
      .then(json => {
        //Array original
        let ArrayCompleto = json
        let ArrayFinal = {}
        for (var i = 0; i < ArrayCompleto.length; i++) {
          var ArrayPedidosDelDia = ArrayCompleto[i].Pedidos
          var keyName = moment(json[i].FechaEntrega).format("YYYY-MM-DD")
          ArrayFinal[keyName] = ArrayPedidosDelDia
        }

        setPedidos(ArrayFinal)
      })
      .catch(err => {
        Alert.alert("Error: ", "No se han podido cargar los pedidos");
      })
      .finally(() => {
        setCargando(false)
      })
  }

  const ClickPedido = (item) => {
    setPedidoSeleccionado(item)
    setModalVisible(true)
    console.log("🚀 ~ file: Pedidos.js:124 ~ ClickPedido ~ item", item)
  }

  const renderItem = (item) => {
    return (
      <TouchableOpacity style={styles.item} onPress={() => ClickPedido(item)} onLongPress={() => copyToClipboard(item.Direccion ? item.Direccion : "Sin Dirección")}>
        <Card>
          <Card.Content>
            <View style={{ flex: 1, flexDirection: "row" }}>
              <View style={{ flex: 4 }}>
                <Text style={styles.TextNombre}>{item.Nombre ? item.Nombre : "-CLIENTE NO REGISTRADO-"}</Text>
                <Text style={styles.TextDireccion}>{item.Direccion ? item.Direccion : "-DIRECCIÓN NO REGISTRADA-"}</Text>
                {
                  item.Pedido.map((itemPedido, index) => {
                    return <View key={index}>
                      <Text style={styles.TextDetallePedido}>{`${itemPedido.Cantidad} x ${itemPedido.Producto}`}</Text>
                    </View>
                  })
                }
                <Text style={styles.TextDireccion}>{"$ " + formatoMonedaChileno(item.PrecioTotalVenta)}</Text>
              </View>
              <View style={{ flex: 1, justifyContent: "center", alignItems: "flex-end" }}>
                <Avatar.Text size={40} style={{ backgroundColor: item.Estado === "C" ? "#08aa60" : "#feb859" }} label={item.Estado === "C" ? "C" : "P"} />
              </View>
            </View>
          </Card.Content>
        </Card>
      </TouchableOpacity>
    );
  }

  const copyToClipboard = async (text) => {
    await Clipboard.setStringAsync(text);
    ToastAndroid.show('Dirección copiada al portapapeles', ToastAndroid.SHORT)
  }

  const dialCall = (tel) => {

    let phoneNumber = '';

    if (Platform.OS === 'android') {
      phoneNumber = 'tel:${' + tel + '}';
    }
    else {
      phoneNumber = 'telprompt:${' + tel + '}';
    }

    Linking.openURL(phoneNumber);
  }

  const EliminarPedido = async () => {
    let id_pedido = pedidoSeleccionado.Pedido_id

    try {
      setLoading(true);

      // Mostrar mensaje de confirmación al usuario
      Alert.alert(
        "Confirmar Eliminación",
        "¿Estás seguro de que deseas eliminar este pedido?",
        [
          {
            text: "Cancelar",
            style: "cancel",
            onPress: () => {
              setLoading(false)
            }
          },
          {
            text: "Eliminar",
            onPress: async () => {
              var RO = {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                timeout: 10000,
                body: JSON.stringify({ id_pedido })
              };

              let url = REACT_APP_SV + '/api/pedido/EliminarPedido';

              await fetchWithTimeout(url, RO)
                .then(response => {
                  setModalVisible(false)
                  if (response.status === 200) {
                    Alert.alert("Se eliminó el pedido correctamente.");
                  } else {
                    alert("Error al eliminar");
                  }
                  setLoading(false);
                  setPedidos([])
                  getPedidos()
                })
                .catch(error => {
                  setLoading(false);
                  setModalVisible(false);
                  alert("Error al completar el pedido ", error);
                });
            },
          },
        ],
        { cancelable: false }
      );

    } catch (error) {
      setLoading(false);
      setModalVisible(false);
      alert("Error al completar el pedido");
    }
  };

  const ContinuarPedido = () => {
    setModalVisible(false)

    if (pedidoSeleccionado.Estado === "C")
      navigation.navigate("DetalleVenta", { VentaHistorial: pedidoSeleccionado.Venta_id })

    if (pedidoSeleccionado.Estado === "I") {

      dispatch(setModoVenta("EditandoPedido"))

      dispatch(resetCantidad())
      dispatch(setVenta_Id(pedidoSeleccionado.Venta_id))
      dispatch(setDireccion(pedidoSeleccionado.Direccion))
      dispatch(setTelefono(pedidoSeleccionado.Telefono))
      dispatch(setFechaEntrega(formatDateString(moment(pedidoSeleccionado.FechaEntrega).format("YYYY-MM-DD"), true)))
      dispatch(setFechaEntregaDate(moment(pedidoSeleccionado.FechaEntrega).format("yyyy-MM-DD")))
      dispatch(setNota(pedidoSeleccionado.Nota))


      pedidoSeleccionado.Pedido.forEach(element => {
        dispatch(updateCantidad({ _id: element.Producto_id, Cantidad: element.Cantidad }))
        dispatch(updatePreciounitario({ _id: element.Producto_id, PrecioVenta: element.PrecioVenta }))
      })

      navigation.navigate("ModificaProductos")
    }


  }

  const CompletarPedidoRapido = async () => {
    setModalVisible(false)
    setModalConfirmaPedido(true)
    /* try {
      setLoading(true);

      // Mostrar mensaje de confirmación al usuario
      Alert.alert(
        "Confirmar Completar Pedido",
        "¿Estás seguro de que deseas completar este pedido?",
        [
          {
            text: "Cancelar",
            style: "cancel"
          },
          {
            text: "Completar",
            onPress: () => {
              handleCompletarPedido();
            },
          },
        ],
        { cancelable: false }
      );
    } catch (error) {
      setLoading(false);
      setModalVisible(false);
      alert("Error al completar el pedido");
    } */


  }

  const handleCompletarPedido = async () => {
    setLoading(true)
    let id_venta = pedidoSeleccionado.Venta_id
    let pagada = isPaid
    let medio_pago = medioPagoFinal

    var RO = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      timeout: 10000,
      body: JSON.stringify({ id_venta, pagada, medio_pago })
    };

    let url = REACT_APP_SV + '/api/pedido/CompletarPedidoRapido';

    await fetchWithTimeout(url, RO)
      .then(response => {
        setModalVisible(false);
        setModalConfirmaPedido(false)
        if (response.status === 200) {
          Alert.alert("Se completó el pedido correctamente.");
        }
        setLoading(false);
        setPedidos([])
        getPedidos()
      })
      .catch(error => {
        setLoading(false);
        setModalVisible(false);
        alert("Error al completar el pedido");
      });


  }

  const VerVentaPedido = () => {
    setModalVisible(false)
    navigation.navigate("DetalleVenta", { VentaHistorial: pedidoSeleccionado.Venta_id }); dispatch(setModoVenta("Viendo"))
  }

  const RenderBotonesPedido = () => {
    if (pedidoSeleccionado.Estado === "C") {
      return (<View style={{ flexDirection: "row", justifyContent: "flex-end" }}>
        <Button mode="text" color='#2792b2' onPress={() => VerVentaPedido()}>
          Ver Venta
        </Button>

      </View>)
    }
    else {
      return (<View style={{ flexDirection: "row", justifyContent: "flex-end" }}>
        <Button mode="text" color='#ea4239' onPress={() => EliminarPedido()}>
          Eliminar
        </Button>
        <Button mode="text" color='#2792b2' onPress={() => ContinuarPedido()}>
          Editar
        </Button>
        <Button mode="text" color='#1e9a1a' onPress={() => CompletarPedidoRapido()}>
          Completar
        </Button>

      </View>)
    }
  }

  if (!fontsLoaded) return null
  if (loading) return Loader("Completando Pedido...")
  return (
    <View style={styles.container}>

      {/* Modal de confirmación */}
      <ReusableModal
        visible={modalConfirmaPedido}
        closeModal={() => setModalConfirmaPedido(false)}
        headerTitle="Confirmación"
        closeButton={false}
      >
        <View>
          <View style={{ flexDirection: "row", marginBottom: 20 }}>
            <Text style={{ marginEnd: 15, fontFamily: "PromptLight", fontSize: 20 }}>¿El pedido fue pagado?</Text>
            <CheckBox
              value={isPaid}
              onValueChange={(value) => setIsPaid(value)}
              color='#0e25d3' // Cambia el color del checkbox según tu preferencia
              style={{ alignSelf: "center" }}
            />
          </View>
          {/* mediopago */}
          <View style={{ flexDirection: "column", width: '50%', alignSelf: "center" }}>
            <Chip icon="cash" selected={medioPagoFinal === 0} onPress={() => setMedioPagoFinal(0)}>EFECTIVO</Chip>
            <Chip icon="cellphone-check" selected={medioPagoFinal === 1} onPress={() => setMedioPagoFinal(1)}>TRANSFERENCIA</Chip>
            <Chip icon="credit-card" selected={medioPagoFinal === 2} onPress={() => setMedioPagoFinal(2)}>TARJETA</Chip>
          </View>

        </View>

        {/* Footer del modal de confirmación */}
        <ModalFooter>
          <Button mode="text" color='#16a422' onPress={handleCompletarPedido}>
            Confirmar
          </Button>
          <Button mode="text" color='#2792b2' onPress={() => { setModalConfirmaPedido(false); setModalVisible(true) }}>
            Cancelar
          </Button>
        </ModalFooter>
      </ReusableModal>

      <ReusableModal
        visible={modalVisible}
        closeModal={() => setModalVisible(false)}
        headerTitle={`Pedido N° ${pedidoSeleccionado?.Pedido_id}`}
        closeButton={true}
      >
        <View style={styles.viewFormulario}>
          {/* Cliente */}
          <View style={{ flexDirection: "column" }}>
            <View style={{ flexDirection: "row" }}>
              {/* <Text style={styles.TextAtributoPedido}>
                {`Cliente`}
              </Text> */}
              <Icon style={styles.inputIcon} name="user" size={20} color="#000" />
            </View>
            <Text style={styles.textInputFields}>
              {`${pedidoSeleccionado.Nombre ? pedidoSeleccionado.Nombre : "-CLIENTE NO REGISTRADO-"}`}
            </Text>
          </View>

          {/* Direccion */}
          <View style={{ flexDirection: "column" }}>
            <View style={{ flexDirection: "row" }}>
              {/* <Text
                style={styles.TextAtributoPedido}>
                {`Dirección`}
              </Text> */}
              <Icon style={styles.inputIcon} name="map-marker" size={20} color="#000" />
            </View>

            <Text onPress={() => !pedidoSeleccionado.Direccion ? {} : Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${pedidoSeleccionado.Direccion.split(" ").join("+")}`)}
              style={pedidoSeleccionado.Direccion ? styles.TextModalTelefono : styles.textInputFields}
            //selection={{ start: 0, end: 0 }} 
            >
              {`${pedidoSeleccionado.Direccion ? pedidoSeleccionado.Direccion : "-DIRECCIÓN NO REGISTRADA-"}`}
            </Text>
          </View>
          {pedidoSeleccionado.Telefono ? <View style={{ flexDirection: "column" }}>
            <Icon style={styles.inputIcon} name="phone" size={20} color="#000" />
            <Text style={styles.TextModalTelefono}
              onPress={() => dialCall(pedidoSeleccionado.Telefono)}
            >
              {`${pedidoSeleccionado.Telefono}`}
            </Text>
            <TouchableOpacity onPress={() => Linking.openURL(`https://wa.me/${FormatoWhatsapp(pedidoSeleccionado.Telefono)}`)}>
              <Icon style={styles.inputIconWsp} name="whatsapp" size={25} color="green" />
            </TouchableOpacity>

          </View> : <></>}

          {/* Se cambia mostrar Fecha de Entrega por Nota */}
          {pedidoSeleccionado.Nota ? <View style={{ flexDirection: "column" }}>
            <Icon style={styles.inputIcon} name="calendar-o" size={20} color="#000" />
            {/* <Text style={styles.TextAtributoPedido} >
              {`Nota:`}
            </Text> */}
            <Text style={styles.textInputFields} >
              {`${pedidoSeleccionado.Nota}`}
            </Text>
          </View> : <></>}
          {/* <View style={{ flexDirection: "row" }}>
            <Icon style={styles.inputIcon} name="calendar-o" size={20} color="#000" />
            <Text style={styles.textInputFields} >
              {`Fecha Entrega: ${moment(pedidoSeleccionado.FechaEntrega).format("DD-MM-yyyy")}`}
            </Text>
          </View> */}

          <View style={{ marginBottom: 15 }}>
            <View style={{ flexDirection: "row" }}>
              <Icon style={styles.inputIcon} name="shopping-bag" size={20} color="#000" />
              {/* <Text style={styles.textInputFields}>Productos</Text> */}
            </View>

            {
              pedidoSeleccionado ? pedidoSeleccionado?.Pedido?.map((itemPedido, index) => {
                return <View style={{ marginLeft: 25 }} key={index}>
                  <Text style={styles.textDetalleProductosModal}>{`${itemPedido.Cantidad} x ${itemPedido.Producto}`}</Text>
                </View>
              }) : <></>

            }
          </View>

          <View style={{ flexDirection: "row" }}>
            <Text style={styles.textInputFields} >
              {`Total: ${"$ " + formatoMonedaChileno(pedidoSeleccionado.PrecioTotalVenta)}`}
            </Text>
          </View>

        </View>
        <ModalFooter>
          {/* <View style={{ flexDirection: "row", justifyContent: "flex-end" }}>
            <Button mode="text" color='#ea4239' onPress={() => EliminarPedido()}>
              Eliminar
            </Button>
            <Button mode="text" color='#2792b2' onPress={() => ContinuarPedido()}>
              Editar
            </Button>
            <Button mode="text" color='#1e9a1a' onPress={() => CompletarPedidoRapido()}>
              Completar
            </Button>
          </View> */}
          <RenderBotonesPedido />
        </ModalFooter>
      </ReusableModal>
      <Agenda
        items={pedidos}
        // If provided, a standard RefreshControl will be added for "Pull to Refresh" functionality. Make sure to also set the refreshing prop correctly
        onRefresh={() => getPedidos()}
        // Set this true while waiting for new data from a refresh
        refreshing={cargando}
        renderItem={renderItem}
        selected={new Date()}
        minDate={'2023-01-01'}
        renderEmptyData={() => {
          return <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
            <Text style={styles.TextSinPedidos}>No hay pedidos para este día :/</Text>
          </View>
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  item: {
    flex: 1,
    borderRadius: 15,
    padding: 5,
    marginRight: 10,
    //marginTop: 7
  },
  AgendaItem: {
    flex: 1,
    justifyContent: "center",

  },
  TextNombre: {
    fontFamily: "PromptMedium",
    fontSize: 18,
  },
  TextDireccion: {
    fontFamily: "PromptRegular",
    fontSize: 15,
  },
  TextModalTelefono: {
    textDecorationLine: 'underline',
    color: "#00a8a8",
    fontFamily: "PromptLight",
    fontSize: 16,
    //letterSpacing: 1,
    paddingLeft: 10,
    marginBottom: 15,
  },
  TextDetallePedido: {
    fontFamily: "PromptSemiBold",
    fontSize: 13,
    color: "#00BBF2"
  },
  TextAtributoPedido: {
    fontFamily: "PromptSemiBold",
    fontSize: 16,
    paddingLeft: 10,
    marginBottom: 10,
  },
  TextSinPedidos: {
    fontFamily: "PromptMedium",
    fontSize: 16,
    color: "#00BBF2"
  },
  modalBotonActualizar: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 4,
    elevation: 3,
    backgroundColor: '#00a8a8',
    padding: 10
  },
  viewFormulario: {
    padding: 10,
  },
  inputIcon: {
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 5,
    marginLeft: 5,
    alignSelf: "flex-start",
    marginBottom:10
  },
  inputIconWsp: {
    /*  justifyContent: "center",
     alignItems: "center",
     paddingTop: 5, */
    marginLeft: 15
  },
  textInputFields: {
    fontFamily: "PromptLight",
    fontSize: 16,
    //letterSpacing: 1,
    paddingLeft: 10,
    marginBottom: 10,
    //width: "90%",
  },
  textDetalleProductosModal: {
    fontFamily: "PromptLight",
    fontSize: 13,
    //letterSpacing: 1,
    paddingLeft: 10,
    marginBottom: 1,
    //width: "90%",
  },
});

export default Pedidos;
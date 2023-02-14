import React, { useState, useLayoutEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ToastAndroid, Alert, Linking } from 'react-native';
import { Agenda, LocaleConfig } from 'react-native-calendars';
import { Avatar, Card, Button } from 'react-native-paper';
import { fetchWithTimeout, FormatoWhatsapp } from '../Components/util';
import { REACT_APP_SV } from "@env"
import moment from 'moment';
import * as Clipboard from 'expo-clipboard';
import { useFonts } from 'expo-font'
import { useIsFocused } from "@react-navigation/native";
import ReusableModal, { ModalFooter } from '../Components/ReusableModal';
import Icon from 'react-native-vector-icons/FontAwesome'

LocaleConfig.locales['es'] = {
  monthNames: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'],
  monthNamesShort: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sept', 'Oct', 'Nov', 'Dic'],
  dayNames: ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'],
  dayNamesShort: ['Dom', 'Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab']
};

LocaleConfig.defaultLocale = 'es';

const Pedidos = ({ navigation }) => {

  const isFocused = useIsFocused();
  const [pedidos, setPedidos] = useState([])
  const [cargando, setCargando] = useState(false)
  const [modalVisible, setModalVisible] = useState(false)
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

        /* let objEjemplo = {
          '2023-01-16':
            [{
              Nombre: 'Daniela Pezoa',
              Direccion: "Alcantara 2661, Las Condes",
              Etiqueta: "Las Condes",
              Observacion: "Entregar en conserjería",
              Pedido:
                [{
                  Cantidad: 3,
                  Producto: "Recarga 20lt"
                },
                {
                  Cantidad: 1,
                  Producto: "Despacho"
                },
                {
                  Cantidad: 1,
                  Producto: "Disp. USB"
                }]

            },
            {
              Nombre: 'Gustavo Ramirez',
              Direccion: "Dana Ruiz Laplagne 3492, San Bernardo",
              Etiqueta: "San Bernardo",
              Observacion: "Casa",
              Pedido:
                [{
                  Cantidad: 5,
                  Producto: "Recarga 20lt"
                },
                {
                  Cantidad: 1,
                  Producto: "Despacho"
                }]

            }]
        } */

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

  const ContinuarPedido = () => {
    setModalVisible(false)
    if (pedidoSeleccionado.Estado === "C")
      navigation.navigate("DetalleVenta", { VentaHistorial: pedidoSeleccionado.Venta_id })
    if (pedidoSeleccionado.Estado === "I")
      navigation.navigate("DetalleVenta", { VentaPedido: pedidoSeleccionado.Venta_id })
  }

  if (!fontsLoaded) return null
  return (
    <View style={styles.container}>
      <ReusableModal
        visible={modalVisible}
        closeModal={() => setModalVisible(false)}
        headerTitle={`Pedido N° ${pedidoSeleccionado?.Pedido_id}`}
        closeButton={true}
      >
        <View style={styles.viewFormulario}>
          <View style={{ flexDirection: "row" }}>
            <Icon style={styles.inputIcon} name="user" size={20} color="#000" />
            <Text style={styles.textInputFields}>
              {`Cliente: ${pedidoSeleccionado.Nombre ? pedidoSeleccionado.Nombre : "-CLIENTE NO REGISTRADO-"}`}
            </Text>
          </View>
          <View style={{ flexDirection: "row" }}>
            <Icon style={styles.inputIcon} name="map-marker" size={20} color="#000" />
            <Text onPress={() => !pedidoSeleccionado.Direccion ? {} : Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${pedidoSeleccionado.Direccion.split(" ").join("+")}`)}
              style={pedidoSeleccionado.Direccion ? styles.TextModalTelefono : styles.textInputFields}
              selection={{ start: 0, end: 0 }} >
              {`Dirección: ${pedidoSeleccionado.Direccion ? pedidoSeleccionado.Direccion : "-DIRECCIÓN NO REGISTRADA-"}`}
            </Text>
          </View>
          {pedidoSeleccionado.Telefono ? <View style={{ flexDirection: "row" }}>
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

          <View style={{ marginBottom: 15 }}>
            <View style={{ flexDirection: "row" }}>
              <Icon style={styles.inputIcon} name="shopping-bag" size={20} color="#000" />
              <Text style={styles.textInputFields}>Productos</Text>
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
            <Icon style={styles.inputIcon} name="calendar-o" size={20} color="#000" />
            <Text style={styles.textInputFields} >
              {`Fecha Entrega: ${moment(pedidoSeleccionado.FechaEntrega).format("DD-MM-yyyy")}`}
            </Text>
          </View>
        </View>
        <ModalFooter>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Button icon="tune-variant" mode="text" color='#00BBF2' onPress={() => ContinuarPedido()}>
              Editar
            </Button>
            <Button icon="send" mode="text" color='#00BBF2' onPress={() => ContinuarPedido()}>
              Continuar
            </Button>
          </View>

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
    marginLeft: 5
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
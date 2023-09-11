import React, { useState, useLayoutEffect, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ToastAndroid, Alert, Linking, TextInput } from 'react-native';
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
import Loader, { LoaderPequenito } from '../Components/Loader';
import CheckBox from 'expo-checkbox'
import { Chip } from 'react-native-paper';

import { useRef } from 'react';
import BottomSheet from '@gorhom/bottom-sheet';
import cloneDeep from 'lodash.clonedeep';
//import ModalInferior from '../Components/ModalInferior';

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
  const [pedidos, setPedidos] = useState({});
  const [cargando, setCargando] = useState(false)
  const [loading, setLoading] = useState(false)
  const [modalVisible, setModalVisible] = useState(false)

  const [modalConfirmaPedido, setModalConfirmaPedido] = useState(false)
  const [isPaid, setIsPaid] = useState(true);
  const [medioPagoFinal, setMedioPagoFinal] = useState(-1)

  const [completadoPagado, setCompletadoPagado] = useState(true);

  const bottomSheetRef = useRef(null);
  const openBottomSheet = () => {
    if (bottomSheetRef.current) {
      bottomSheetRef.current.expand(); // Abre la BottomSheet
    }
  };

  const [resumenDiario, setResumenDiario] = useState(null)

  const [loadingPequenito, setLoadingPequenito] = useState(false);

  const [modalFiltrosVisible, setModalFiltrosVisible] = useState(false);
  const [filtroCliente, setFiltroCliente] = useState("");
  const [filtroSinPagar, setFiltroSinPagar] = useState(false);
  const [filtroActivo, setFiltroActivo] = useState(false);

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
    getResumenDiario()
  }, [isFocused])

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => {
        return (<View style={{ flexDirection: "row" }}>
          <TouchableOpacity onPress={() => setModalFiltrosVisible(true)}
            style={{
              marginRight: 15,
              paddingRight: 12,
            }}>
            <Icon name='sliders' size={27} color="#00BBF2" />
          </TouchableOpacity>

        </View>)
      }
    })
  }, [navigation])

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

  const getResumenDiario = async () => {
    setCargando(true);

    const ROResumenPedidos = {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      timeout: 10000
    };

    await fetchWithTimeout(REACT_APP_SV + '/api/pedido/ResumenDiario', ROResumenPedidos)
      .then(response => {
        //console.log("🚀 ~ file: Pedidos.js:111 ~ getPedidos ~ response:", response)
        switch (response.status) {
          case 200:
            return response.json();
          case 204:
            Alert.alert("No hay pedidos aun para hoy")
            break;
          default:
            Alert.alert("ERROR: No se ha podido cargar el resumen de hoy")
            break;
        }
        //return response.json(); // Devuelve el resultado del parsing JSON
      })
      .then(json => {
        console.log("🚀 ~ file: Pedidos.js:118 ~ getResumenDiario ~ json:", json);
        setResumenDiario(json);
      })
      .catch(err => {
        console.log("Error: ", "No se ha podido cargar el resumen diario");
      })
      .finally(() => {
        setCargando(false);
      });
  };

  const ClickPedido = (item) => {
    setPedidoSeleccionado(item)
    setCompletadoPagado(item.Pagada === 'S' ? true : false)
    console.log("🚀 ~ file: Pedidos.js:148 ~ ClickPedido ~ item.Pagada:", item.Pagada)
    setModalVisible(true)
    //console.log("🚀 ~ file: Pedidos.js:124 ~ ClickPedido ~ item", item)
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
                  getResumenDiario()
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
        getResumenDiario()
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

  const RenderBotonesFiltros = () => {

    return (<View style={{ flexDirection: "row", justifyContent: "flex-end" }}>
      <Button disabled={!filtroActivo} mode="text" color='#ea4239' onPress={() => QuitarFiltros()}>
        Quitar Filtros
      </Button>
      <Button disabled={filtroCliente.trim() === "" && filtroSinPagar === false} mode="text" color='#2792b2' onPress={() => AplicarFiltros()}>
        Aplicar
      </Button>
    </View>)

  }

  const AplicarFiltros = () => {

    let clonePedidos = cloneDeep(pedidos);
    const filteredData = {};

    for (const fecha in clonePedidos) {
      const pedidosDelDia = clonePedidos[fecha];
      const filteredPedidos = pedidosDelDia.filter(pedido => {
        const nameMatch = pedido && pedido.Nombre && pedido.Nombre.toLowerCase().includes(filtroCliente.toLowerCase());
        const addressMatch = pedido && pedido.Direccion && pedido.Direccion.toLowerCase().includes(filtroCliente.toLowerCase());
        const paymentMatch = filtroSinPagar ? pedido && pedido.Pagada === 'N' : true;

        return (nameMatch || addressMatch) && paymentMatch;
      });

      if (filteredPedidos.length > 0) {
        filteredData[fecha] = filteredPedidos;
      }
    }

    console.log("Datos filtrados:", filteredData);
    setPedidos(filteredData)
    setFiltroActivo(true)
    setModalFiltrosVisible(false)
  };

  const QuitarFiltros = () => {
    getPedidos()
    setFiltroCliente("")
    setFiltroSinPagar(false)
    setFiltroActivo(false)
    setModalFiltrosVisible(false)
  }

  const Tabla = () => {
    return (
      <View style={styles.styledTable}>
        <View style={styles.tableHeader}>
          <Text style={styles.headerText}>Nombre</Text>
          <Text style={styles.headerTextCenter}>Entregados</Text>
          <Text style={styles.headerTextCenter}>Total</Text>
        </View>
        <View style={styles.tableBody}>
          {
            resumenDiario ? resumenDiario.Productos.map((itemResumen, index2) => {
              return <View key={index2} style={styles.tableRow}>
                <Text style={styles.cellText}>{itemResumen.Producto}</Text>
                <Text style={styles.cellTextCenter}>{itemResumen.Entregados}</Text>
                <Text style={styles.cellTextCenter}>{itemResumen.Total}</Text>
              </View>
            }) : <></>


          }

          {/* <View style={styles.tableRow}>
            <Text style={styles.cellText}>Recarga 20 lt</Text>
            <Text style={styles.cellTextCenter}>54</Text>
            <Text style={styles.cellTextCenter}>0</Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={styles.cellText}>Recarga 20 lt</Text>
            <Text style={styles.cellTextCenter}>54</Text>
            <Text style={styles.cellTextCenter}>0</Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={styles.cellText}>Recarga 20 lt</Text>
            <Text style={styles.cellTextCenter}>54</Text>
            <Text style={styles.cellTextCenter}>0</Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={styles.cellText}>Recarga 20 lt</Text>
            <Text style={styles.cellTextCenter}>54</Text>
            <Text style={styles.cellTextCenter}>0</Text>
          </View> */}
          {/* Add more rows as needed */}
        </View>
      </View>
    );
  };

  const marcaCompletadoPagado = async (pagado) => {

    setLoadingPequenito(true) //mustra loader pequeñito
    let id_pedido = pedidoSeleccionado.Pedido_id
    let pagada = pagado ? 'S' : 'N'

    var RO = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      timeout: 10000,
      body: JSON.stringify({ id_pedido, pagada })
    };

    let url = REACT_APP_SV + '/api/pedido/ActualizaPedidoPagado';

    await fetchWithTimeout(url, RO)
      .then(response => {
        if (response.status === 200) {
          setCompletadoPagado(pagado)
          setLoadingPequenito(false); //oculta loader pequeñito

          if (filtroActivo && filtroSinPagar && pagada) {
            console.log("🚀 ~ file: Pedidos.js:532 ~ marcaCompletadoPagado ~ filtroActivo:", filtroActivo)
            // Clona el objeto de pedidos
            let pedidosClonados = cloneDeep(pedidos);

            // Recorre las fechas en el objeto de pedidos
            for (const fecha in pedidosClonados) {
              const pedidosDelDia = pedidosClonados[fecha];

              // Filtra los pedidos para eliminar el pedido por pedidoId
              pedidosClonados[fecha] = pedidosDelDia.filter(pedido => pedido.Pedido_id !== id_pedido);
            }

            // Actualiza el estado con el nuevo objeto de pedidos
            setModalVisible(false)
            setPedidos([])
            setPedidos(pedidosClonados);
          } else {
            setPedidos([])
            getPedidos() //se actualiza los pedidos para que tome la actualizacion de pagado
          }

          ToastAndroid.show('Se actualizó el pago del pedido', ToastAndroid.SHORT)
        }
      })
      .catch(error => {
        console.log("🚀 ~ file: Pedidos.js:552 ~ marcaCompletadoPagado ~ error:", error)
        setLoadingPequenito(false); //oculta loader pequeñito
        alert("Error al actualizar el pago el pedido ", error);
      });


  }



  /* RENDER */

  if (!fontsLoaded) return null
  if (loading) return Loader("Completando Pedido...")
  return (
    <View style={styles.container}>

      {/* Modal de confirmación */}
      <ReusableModal
        visible={modalConfirmaPedido}
        closeModal={() => setModalConfirmaPedido(false)}
        headerTitle="Confirme medio de pago"
        closeButton={false}
      >
        <View>
          {pedidoSeleccionado.Pagada === 'N' ?
            <View style={{ flexDirection: "row", marginBottom: 20 }}>
              <Text style={{ marginEnd: 15, fontFamily: "PromptLight", fontSize: 20 }}>¿El pedido fue pagado?</Text>
              <CheckBox
                value={isPaid}
                onValueChange={(value) => setIsPaid(value)}
                color='#0e25d3' // Cambia el color del checkbox según tu preferencia
                style={{ alignSelf: "center" }}
              />
            </View>
            :
            <></>}

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


      {/* Modal vista pedido seleccionado */}
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
              {`Total:`}
            </Text>
            <Text style={styles.textInputFieldsBold} >
              {`${"$ " + formatoMonedaChileno(pedidoSeleccionado.PrecioTotalVenta)}`}
            </Text>
          </View>

          <View style={{ flexDirection: "row", marginBottom: 20 }}>
            <Text style={{
              paddingLeft: 10,
              marginEnd: 15,
              fontFamily: "PromptLight",
              fontSize: 17,
              alignSelf: "center"
            }}>Pagado</Text>
            <CheckBox
              value={completadoPagado}
              onValueChange={(value) => marcaCompletadoPagado(value)}
              //color='#0e25d3' // Cambia el color del checkbox según tu preferencia
              style={{ alignSelf: "center" }}
              disabled={loadingPequenito}
            />
            {loadingPequenito ? <LoaderPequenito /> : <></>}
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

      {/* Modal filtros */}
      <ReusableModal
        visible={modalFiltrosVisible}
        closeModal={() => setModalFiltrosVisible(false)}
        headerTitle="Filtros"
        closeButton={true}
      >
        <View style={styles.viewFormulario}>
          <View style={{ flexDirection: "row" }}>
            <Text
              style={styles.textInputFields}
            >
              {`Cliente`}
            </Text>
            <TextInput style={styles.textInputFiltroCliente}
              placeholder="Nombre o Direccion"
              value={filtroCliente}
              onChangeText={(text) => setFiltroCliente(text)}
            />
          </View>

          <View style={{ flexDirection: "row", marginBottom: 20 }}>
            <Text style={{
              paddingLeft: 10,
              marginEnd: 15,
              fontFamily: "PromptLight",
              fontSize: 17,
              alignSelf: "center"
            }}>Pendientes de pago</Text>
            <CheckBox
              value={filtroSinPagar}
              onValueChange={(value) => setFiltroSinPagar(value)}
              //color='#0e25d3' // Cambia el color del checkbox según tu preferencia
              style={{ alignSelf: "center" }}
            />
          </View>

        </View>
        <ModalFooter>
          <RenderBotonesFiltros />
        </ModalFooter>
      </ReusableModal>


      {/* Calendario */}
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


      {/* <ModalInferior/> */}
      <TouchableOpacity
        style={styles.floatingButton}
        onPress={openBottomSheet}
        disabled={!resumenDiario}
      >
        <Icon name="bar-chart" size={25} color='white' />
      </TouchableOpacity>

      <BottomSheet
        ref={bottomSheetRef}
        snapPoints={['80%', '50%']}
        index={-1}
        backgroundStyle={styles.bottomSheetBackground}
        enablePanDownToClose={true}
      >
        <View style={styles.bottomSheetContent}>
          <View style={styles.containerBS}>

            <View style={{ minHeight: 50 }}>
              <Text style={styles.textTituloResumenHoy}>
                {`Resumen de hoy`}
              </Text>
            </View>

            <View style={{ flexDirection: "column" }}>
              <View style={{ flexDirection: "row" }}>
                <Icon style={styles.iconItemsBottomsheet} name="shopping-bag" size={17} color="#000" />
                <Text style={styles.textAtributosBottomsheet}>
                  {`Pedidos entregados/total`}
                </Text>
                <Text style={styles.textValorAtributosBottomsheet}>
                  {`${resumenDiario?.CantidadEntregada} / ${resumenDiario?.CantidadPedidos}`}
                </Text>
              </View>

            </View>

            <View style={{ marginBottom: 10 }}>
              <View style={{ flexDirection: "row" }}>
                <Icon style={styles.inputIcon} name="shopping-cart" size={19} color="#000" />
                <Text style={styles.textAtributosBottomsheet}>
                  {`Productos`}
                </Text>
              </View>

              <Tabla />


              {/* {
                resumenDiario?.Productos ? resumenDiario.Productos.map((itemResumen, index2) => {
                  return <View style={{ marginLeft: 25 }} key={index2}>
                    <Text style={styles.textDetalleProductosModal}>{`${itemResumen.Total} x ${itemResumen.Producto}  (${itemResumen.Entregados} entregados)`}</Text>
                  </View>
                }) : <>
                  <Text>No hay productos para mostrar</Text>
                </>

              } */}
            </View>


            <View>
              <View style={{ flexDirection: "row" }}>
                <Icon style={styles.iconItemsBottomsheet} name="money" size={19} color="#000" />
                <Text style={styles.textAtributosBottomsheet}>
                  {`Total:`}
                </Text>
                <Text style={styles.textValorAtributosBottomsheet}>
                  {'$' + formatoMonedaChileno(resumenDiario?.MontoTotal)}
                </Text>
              </View>
            </View>


          </View>
        </View>
      </BottomSheet>
    </View>
  );
}

const styles = StyleSheet.create({

  /* TABLA */

  styledTable: {
    //margin: 25,
    width: '75%', // Adjust this value as needed
    backgroundColor: '#ffffff',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 20,
    shadowOffset: {
      width: 0,
      height: 0,
    },
    alignSelf: "center"
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#00BBF2',
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  headerText: {
    flex: 1,
    paddingBottom: 7,
    paddingLeft: 7,
    fontSize: 16,
    color: '#ffffff',
    fontWeight: 'bold',
  },
  headerTextCenter: {
    flex: 1,
    paddingBottom: 7,
    paddingLeft: 7,
    fontSize: 16,
    color: '#ffffff',
    fontWeight: 'bold',
    textAlign: "center"
  },
  tableBody: {
    borderColor: '#dddddd',
    borderBottomWidth: 1,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomColor: '#dddddd',
    borderBottomWidth: 1,
    backgroundColor: '#f3f3f3',
  },
  activeRow: {
    backgroundColor: '#ffffff',
    borderColor: '#009879',
    borderBottomWidth: 2,
  },
  cellText: {
    flex: 1,
    paddingBottom: 7,
    paddingLeft: 7,
    fontSize: 14,
    color: '#000000',
  },
  cellTextCenter: {
    flex: 1,
    paddingBottom: 7,
    paddingLeft: 7,
    fontSize: 14,
    color: '#000000',
    textAlign: "center"
  },

  /* OTROS */
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
  containerBS: {
    paddingBottom: 10,
  },
  inputIcon: {
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 5,
    marginLeft: 5,
    alignSelf: "flex-start",
    marginBottom: 10
  },
  iconItemsBottomsheet: {
    //justifyContent: "center",
    //alignItems: "center",
    paddingTop: 5,
    marginLeft: 5,
    alignSelf: "center",
    marginBottom: 10
  },
  inputIconWsp: {
    /*  justifyContent: "center",
     alignItems: "center",
     paddingTop: 5, */
    marginLeft: 15
  },
  textInputFields: {
    fontFamily: "PromptLight",
    fontSize: 17,
    //letterSpacing: 1,
    paddingLeft: 10,
    marginBottom: 10,
    //width: "90%",
  },
  textInputFieldsBold: {
    fontFamily: "PromptSemiBold",
    fontSize: 17,
    //letterSpacing: 1,
    paddingLeft: 10,
    marginBottom: 10,
    //width: "90%",
  },
  textInputFiltroCliente: {
    fontFamily: "PromptLight",
    fontSize: 17,
    //letterSpacing: 1,
    paddingLeft: 10,
    marginBottom: 10,
    minWidth: "100%"
  },
  textTituloResumenHoy: {
    fontFamily: "PromptSemiBold",
    fontSize: 24,
    //letterSpacing: 1,
    paddingLeft: 0,
    marginBottom: 15,
    //width: "90%",
  },
  textAtributosBottomsheet: {
    fontFamily: "PromptMedium",
    fontSize: 16,
    //letterSpacing: 1,
    paddingLeft: 10,
    marginBottom: 10,
    //width: "90%",
    alignSelf: "flex-end"
  },
  textValorAtributosBottomsheet: {
    fontFamily: "PromptLight",
    fontSize: 16,
    //letterSpacing: 1,
    marginLeft: 30,
    marginBottom: 10,
    //width: "90%",
    alignSelf: "flex-end"
  },
  textDetalleProductosModal: {
    fontFamily: "PromptLight",
    fontSize: 13,
    //letterSpacing: 1,
    paddingLeft: 10,
    marginBottom: 1,
    //width: "90%",
  },

  floatingButton: {
    position: 'absolute',
    bottom: 20,
    left: 10, // Cambia 'right' a 'left'
    backgroundColor: '#00BBF2',
    padding: 10,
    borderRadius: 25,
    width: 50,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
  },
  bottomSheetBackground: {
    backgroundColor: 'rgba(255, 255, 255, 1)',
  },
  bottomSheetContent: {
    backgroundColor: 'white',
    paddingHorizontal: 15,
    paddingVertical: 10
  },
  bottomSheetText: {
    fontSize: 20,
  },
});

export default Pedidos;
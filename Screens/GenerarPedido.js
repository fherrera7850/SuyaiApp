import { TextInput, View, Text, Image, StyleSheet, TouchableOpacity, Alert, Pressable } from 'react-native'
import Icon from 'react-native-vector-icons/FontAwesome'
import React, { useState, useEffect } from 'react'
import { useFonts } from 'expo-font'
import { REACT_APP_SV } from "@env"
import { fetchWithTimeout, formatDateString, getUTCDate } from "./../Components/util"
import CheckBox from 'expo-checkbox'
import DateTimePickerModal from "react-native-modal-datetime-picker";
import moment from 'moment'
import Loader from '../Components/Loader'
import { useSelector, useDispatch } from 'react-redux'
import { setDireccion, setFechaEntrega, setTelefono, setNota, resetP, setFechaEntregaDate } from '../Features/Venta/PedidoSlice'
import { resetV } from '../Features/Venta/VentaSlice'
import cloneDeep from 'lodash.clonedeep'

const GenerarPedido = ({ route, navigation }) => {

    const dispatch = useDispatch();
    const PedidoRedux = useSelector(state => state.Pedido)
    const VentaRedux = useSelector(state => state.Venta)
    const ProductosRedux = useSelector(state => state.productos)

    const [fontsLoaded] = useFonts({
        PromptThin: require("./../assets/fonts/Prompt-Thin.ttf"),
        PromptExtraLight: require("./../assets/fonts/Prompt-ExtraLight.ttf"),
        PromptLight: require("./../assets/fonts/Prompt-Light.ttf"),
        PromptRegular: require("./../assets/fonts/Prompt-Regular.ttf"),
        PromptMedium: require("./../assets/fonts/Prompt-Medium.ttf"),
        PromptSemiBold: require("./../assets/fonts/Prompt-SemiBold.ttf"),
    })

    const [objCliente, setObjCliente] = useState({})
    const [usarDireccion, setUsarDireccion] = useState(false)
    const [usarTelefono, setUsarTelefono] = useState(false)
    const [usarHoy, setUsarHoy] = useState(false)
    const [usarManana, setUsarManana] = useState(false)

    const [isDatePickerVisible, setDatePickerVisibility] = useState(false)

    const [cargando, setCargando] = useState(false)
    const [cargandoDatos, setCargandoDatos] = useState(false)

    const getCliente = async () => {
        const ROCliente = {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
            timeout: 10000
        };

        await fetchWithTimeout(`${REACT_APP_SV}/api/cliente/${VentaRedux.Cliente_id}`, ROCliente)
            .then(response => response.json())
            .then(json => {

                setObjCliente(json[0])

                if (json[0].direccion) {
                    console.log("tiene direccion", json[0].direccion)
                    setUsarDireccion(true)
                    dispatch(setDireccion((json[0].direccion)))
                }

                if (json[0].telefono) {
                    setUsarTelefono(true)
                    dispatch(setTelefono(json[0].telefono))
                }
            })
            .catch(err => {
                Alert.alert("Error: ", "No se han podido cargar los clientes");
            })
            .finally(() => {
            })
    }

    useEffect(() => {
        if (VentaRedux.Cliente_id && VentaRedux.ModoVenta === "Editando") {
            setCargandoDatos(true)
            getCliente()
            setCargandoDatos(false)
        }
    }, [])

    useEffect(() => {
        if (route.params?.direccionMapa) {
            setCargandoDatos(true)
            dispatch(setDireccion(route.params?.direccionMapa))
            setCargandoDatos(false)
        }

    }, [route.params?.direccionMapa])

    const showDatePicker = () => {
        setDatePickerVisibility(true);
    };

    const hideDatePicker = () => {
        setDatePickerVisibility(false);
    };

    const handleConfirm = (date) => {

        dispatch(setFechaEntrega(formatDateString(moment(date).format("YYYY-MM-DD"), true)))
        //setFechaEntregaDate(moment(date).format("yyyy-MM-DD"))
        dispatch(setFechaEntregaDate(moment(date).format("yyyy-MM-DD")))

        setUsarHoy(false)
        setUsarManana(false)
        hideDatePicker();
    };

    const ChangeDireccion = () => {
        let ClienteTieneDireccion = Boolean(objCliente.direccion)
        let CheckDireccion = !usarDireccion

        if (ClienteTieneDireccion === true && CheckDireccion === true) {
            dispatch(setDireccion(objCliente.direccion))
        }

        if (ClienteTieneDireccion === true && CheckDireccion === false) {
            dispatch(setDireccion(""))
        }

        if (ClienteTieneDireccion === false && CheckDireccion === false) {
            dispatch(setDireccion(objCliente.direccion))
        }

        if (ClienteTieneDireccion === false && CheckDireccion === true) {
            dispatch(setDireccion(""))
        }

        setUsarDireccion(CheckDireccion)
    }

    const ChangeTelefono = () => {
        let ClienteTieneTelefono = Boolean(objCliente.telefono)
        console.log("🚀 ~ file: GenerarPedido.js:121 ~ ChangeTelefono ~ ClienteTieneTelefono", ClienteTieneTelefono)
        let CheckTelefono = !usarTelefono
        console.log("🚀 ~ file: GenerarPedido.js:123 ~ ChangeTelefono ~ CheckTelefono", CheckTelefono)

        if (ClienteTieneTelefono === true && CheckTelefono === true) {
            dispatch(setTelefono(objCliente.telefono))
        }

        if (ClienteTieneTelefono === true && CheckTelefono === false) {
            dispatch(setTelefono(""))
        }

        if (ClienteTieneTelefono === false && CheckTelefono === false) {
            dispatch(setTelefono(objCliente.telefono))
        }

        if (ClienteTieneTelefono === false && CheckTelefono === true) {
            dispatch(setTelefono(""))
        }

        setUsarTelefono(CheckTelefono)
    }

    const ChangeUsarHoy = () => {
        let CheckUsarHoy = !usarHoy

        if (CheckUsarHoy) {
            setUsarManana(false)
            let FechaHoy = moment(horaCliente(new Date())).format("YYYYMMDD")
            dispatch(setFechaEntrega(formatDateString(moment(FechaHoy).format("YYYY-MM-DD"), true)))
            dispatch(setFechaEntregaDate(moment(horaCliente(new Date())).format("yyyy-MM-DD")))
        }
        else {
            dispatch(setFechaEntrega(""))
        }

        setUsarHoy(CheckUsarHoy)
    }

    const ChangeUsarManana = () => {
        let CheckUsarManana = !usarManana

        if (CheckUsarManana) {
            setUsarHoy(false)
            let FechaManana = moment(horaCliente(new Date().setDate(new Date().getDate() + 1))).format("YYYYMMDD")
            dispatch(setFechaEntrega(formatDateString(moment(FechaManana).format("YYYY-MM-DD"), true)))
            dispatch(setFechaEntregaDate(moment(horaCliente(new Date().setDate(new Date().getDate() + 1))).format("yyyy-MM-DD")))
        }
        else {
            dispatch(setFechaEntrega(""))
        }

        setUsarManana(CheckUsarManana)
    }

    const horaCliente = (date) => {
        let dateUTC = new Date(date).toUTCString()
        let fecha = moment(dateUTC).local(true).format("YYYY-MM-DD HH:mm:ss")
        return fecha
    }

    const IngresarPedido = async () => {
        //Venta ProductosVenta Pedido
        if (!PedidoRedux.FechaEntrega) {
            Alert.alert("Error", "Indique Fecha de Entrega del pedido")
            return
        }

        setCargando(true)

        let objProductosFiltrados = cloneDeep(ProductosRedux)
        objProductosFiltrados = objProductosFiltrados.filter((x) => {
            return x.Cantidad > 0;
        });
        console.log("🚀 ~ file: GenerarPedido.js:205 ~ IngresarPedido ~ objProductosFiltrados", objProductosFiltrados)

        let FechaActual = getUTCDate()

        let objVenta = {
            MedioPago: VentaRedux.MedioPago,
            PrecioTotalVenta: VentaRedux.PrecioTotalVenta,
            Cliente_id: VentaRedux.Cliente_id,
            Fecha: FechaActual,
            Dcto: VentaRedux.Dcto,
            Observacion: VentaRedux.Observacion ? VentaRedux.Observacion.trim() : null
        }
        console.log("🚀 ~ file: GenerarPedido.js:218 ~ IngresarPedido ~ objVenta", objVenta)

        let objPedido = {
            Direccion: PedidoRedux.Direccion ? PedidoRedux.Direccion : null,
            Telefono: PedidoRedux.Telefono ? PedidoRedux.Telefono : null,
            FechaEntrega: PedidoRedux.FechaEntregaDate,
            Nota: PedidoRedux.Nota?.trim() === "" ? null : PedidoRedux.Nota?.trim(),
            FechaCreacion: FechaActual,
            Estado: "I",
            Venta_id: PedidoRedux.Venta_id
        }
        console.log("🚀 ~ file: GenerarPedido.js:228 ~ IngresarPedido ~ objPedido", objPedido)

        const ROVenta = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            timeout: 10000,
            body: JSON.stringify({
                Venta: objVenta,
                ProductosVenta: objProductosFiltrados,
                Pedido: objPedido
            })
        };

        let url = REACT_APP_SV + '/api/venta/'
        if (VentaRedux.ModoVenta === "EditandoPedido")
            url = REACT_APP_SV + '/api/pedido/CompletarPedido'
        await fetchWithTimeout(url, ROVenta)
            .then(response => {
                if (response.status === 200) {
                    /* let ptv = cloneDeep(VentaRedux.PrecioTotalVenta)
                    dispatch(resetV())
                    dispatch(resetP())
                    navigation.navigate("VentaOk", { MontoVenta: ptv }) */
                    console.log("SUCCESSSSSSSSSSSSS")
                }
                else {
                    throw new Error("Error")
                }
            })
            .catch(err => {
                setCargando(false)
                Alert.alert(
                    "ERROR  ",
                    `NO HA SIDO POSIBLE REGISTRAR EL PEDIDO: ${err}`,
                    [
                        {
                            text: "Cancelar",
                            onPress: () => console.log("Cancel Pressed"),
                            style: "cancel"
                        },
                        {
                            text: "Reintentar",
                            onPress: () => IngresarPedido(),
                            style: "default"
                        }
                    ]
                )
            })
            .finally(() => {
                setCargando(false)
            })
    }

    if (!fontsLoaded || cargandoDatos) return Loader("Cargando Datos...")
    if (cargando) return Loader("Ingresando Pedido...")
    return (
        <View style={styles.viewPrincipal}>
            <View style={styles.viewFormulario}>

                <View style={{ flexDirection: "row" }}>
                    <Icon style={styles.inputIcon} name="map-marker" size={20} color="#000" />
                    <TextInput style={styles.textInputFieldsFirst}
                        placeholder="Dirección"
                        onFocus={() => navigation.navigate("SelectorDireccionCliente", { Retorno: "GenerarPedido" })}
                        value={PedidoRedux.Direccion}
                        selection={{ start: 0, end: 0 }}
                        editable={!usarDireccion} />

                </View>
                {VentaRedux.ModoVenta === "Editando" ? <View style={{ flexDirection: "row", marginLeft: 35, marginBottom: 25 }}>
                    <CheckBox
                        value={usarDireccion}
                        onValueChange={() => ChangeDireccion()}
                        style={styles.checkbox}
                        disabled={!objCliente.direccion}
                    />
                    <Text style={styles.label}>Usar direccion cliente</Text>
                </View> : <View style={{ flexDirection: "row", height: 30 }}></View>}

                <View style={{ flexDirection: "row" }}>
                    <Icon style={styles.inputIcon} name="phone" size={20} color="#000" />
                    <TextInput style={styles.textInputFieldsTelefono}
                        placeholder="Teléfono"
                        value={PedidoRedux.Telefono ? PedidoRedux.Telefono : ""}
                        onChangeText={(text) => dispatch(setTelefono(text))}
                        editable={!usarTelefono}
                        keyboardType={"phone-pad"} />

                </View>
                {VentaRedux.ModoVenta === "Editando" ? <View style={{ flexDirection: "row", marginLeft: 35, marginBottom: 25 }}>
                    <CheckBox
                        value={usarTelefono}
                        onValueChange={() => ChangeTelefono()}
                        style={styles.checkbox}
                        disabled={!objCliente.telefono}
                    />
                    <Text style={styles.label}>Usar teléfono cliente</Text>

                </View> : <View style={{ flexDirection: "row", height: 30 }}></View>}

                <View>
                    <Pressable style={{ flexDirection: "row" }} onPress={showDatePicker}>
                        <Icon style={styles.inputIcon} name="calendar" size={20} color="#000" />
                        <TextInput style={styles.textInputFieldsFirst}
                            placeholder="Fecha de Entrega"
                            value={PedidoRedux.FechaEntrega}
                            //onChangeText={(text) => setFechaEntrega(text)}
                            editable={false}
                        />
                    </Pressable>
                    <DateTimePickerModal
                        isVisible={isDatePickerVisible}
                        mode="date"
                        onConfirm={handleConfirm}
                        onCancel={hideDatePicker}
                    />
                </View>
                <View style={{ flexDirection: "row", marginLeft: 35, marginBottom: 25 }}>
                    <CheckBox
                        value={usarHoy}
                        onValueChange={() => ChangeUsarHoy()}
                        style={styles.checkbox}
                    />
                    <Text style={styles.label}>Hoy</Text>
                    <CheckBox
                        value={usarManana}
                        onValueChange={() => ChangeUsarManana()}
                        style={styles.checkbox}
                    />
                    <Text style={styles.label}>Mañana</Text>
                </View>
            </View>

            <View style={{ flexDirection: "row" }}>
                <Icon style={styles.inputIcon} name="commenting-o" size={20} color="#000" />
                <TextInput style={styles.textInputFields}
                    placeholder="Nota"
                    value={PedidoRedux.Nota}
                    onChangeText={(text) => dispatch(setNota(text))}
                    multiline
                />
            </View>

            {VentaRedux.ModoVenta === "Editando" ? <View style={styles.viewButtonGuardar}>
                <TouchableOpacity style={styles.buttonGuardar} onPress={() => IngresarPedido()}>
                    <Text style={styles.textButtonGuardar}>Ingresar Pedido</Text>
                </TouchableOpacity>
            </View> : <></>}

            {VentaRedux.ModoVenta === "EditandoPedido" ? <TouchableOpacity style={styles.buttonGuardar} onPress={() => IngresarPedido()}>

                <Text style={styles.textButtonGuardar}>Completar Pedido</Text>
            </TouchableOpacity> : <></>}


        </View>

    )
}

export default GenerarPedido

const styles = StyleSheet.create({
    viewPrincipal: {
        flex: 1,
        backgroundColor: "white",
        paddingTop: 50
    },
    textInputFieldsFirst: {
        borderBottomWidth: 1,
        borderBottomColor: "lightgrey",
        fontFamily: "PromptLight",
        fontSize: 20,
        //letterSpacing: 1,
        paddingLeft: 10,
        width: "80%"
    },
    textInputFieldsTelefono: {
        borderBottomWidth: 1,
        borderBottomColor: "lightgrey",
        fontFamily: "PromptLight",
        fontSize: 20,
        //letterSpacing: 1,
        paddingLeft: 6,
        width: "80%"
    },
    textInputFields: {
        borderBottomWidth: 1,
        borderBottomColor: "lightgrey",
        fontFamily: "PromptLight",
        fontSize: 20,
        //letterSpacing: 1,
        paddingLeft: 10,
        marginBottom: 25,
        width: "80%"
    },
    inputIcon: {
        justifyContent: "center",
        alignItems: "center",
        paddingTop: 5,
        marginLeft: 25
    },
    buttonGuardar: {
        alignItems: 'center',
        justifyContent: 'center',
        //paddingVertical: 12,
        //paddingHorizontal: 32,
        borderRadius: 4,
        elevation: 3,
        backgroundColor: '#00a8a8',
        height: 60,
        marginHorizontal: 5
    },
    textButtonGuardar: {
        fontSize: 20,
        color: 'white',
        fontFamily: "PromptMedium"
    },
    viewButtonGuardar: {
        flex: 2,
        marginTop: 30,
        padding: 20
    },
    checkbox: {
        alignSelf: "center",
    },
    label: {
        margin: 8,
    },
    datePicker: {
        justifyContent: 'center',
        alignItems: 'flex-start',
        width: 320,
        height: 260,
        display: 'flex',
    },
})
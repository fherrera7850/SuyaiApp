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

const GenerarPedido = ({ route, navigation }) => {

    const [fontsLoaded] = useFonts({
        PromptThin: require("./../assets/fonts/Prompt-Thin.ttf"),
        PromptExtraLight: require("./../assets/fonts/Prompt-ExtraLight.ttf"),
        PromptLight: require("./../assets/fonts/Prompt-Light.ttf"),
        PromptRegular: require("./../assets/fonts/Prompt-Regular.ttf"),
        PromptMedium: require("./../assets/fonts/Prompt-Medium.ttf"),
        PromptSemiBold: require("./../assets/fonts/Prompt-SemiBold.ttf"),
    })

    const [cliente, setCliente] = useState({})
    const [usarDireccion, setUsarDireccion] = useState(false)
    const [usarTelefono, setUsarTelefono] = useState(false)
    const [usarHoy, setUsarHoy] = useState(false)
    const [usarManana, setUsarManana] = useState(false)
    const [nuevoPedido, SetNuevoPedido] = useState(route.params?.NuevoPedido)
    const [nota, setNota] = useState("")

    const [isDatePickerVisible, setDatePickerVisibility] = useState(false)
    const [fechaEntrega, setFechaEntrega] = useState("")
    const [fechaEntregaDate, setFechaEntregaDate] = useState(null)

    const [telefono, setTelefono] = useState("")
    const [direccion, setDireccion] = useState(route.params?.direccion)

    const [cargando, setCargando] = useState(false)

    const getCliente = async () => {
        const ROCliente = {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
            timeout: 10000
        };

        await fetchWithTimeout(`${REACT_APP_SV}/api/cliente/${nuevoPedido.Cliente_id}`, ROCliente)
            .then(response => response.json())
            .then(json => {
                setCliente(json[0])
                if (json[0].direccion) {
                    setUsarDireccion(true)
                    setDireccion(json[0].direccion)
                }
                if (json[0].telefono) {
                    setUsarTelefono(true)
                    setTelefono(json[0].telefono)
                }
            })
            .catch(err => {
                Alert.alert("Error: ", "No se han podido cargar los clientes");
            })
    }

    useEffect(() => {
        if (nuevoPedido.Cliente_id) {
            getCliente()
        }
    }, [])

    useEffect(() => {
        setDireccion(route.params?.direccion)

    }, [route.params?.direccion])

    const showDatePicker = () => {
        setDatePickerVisibility(true);
    };

    const hideDatePicker = () => {
        setDatePickerVisibility(false);
    };

    const handleConfirm = (date) => {
        //console.warn("A date has been picked: ", date);
        setFechaEntrega(formatDateString(date, true))
        setFechaEntregaDate(date)
        setUsarHoy(false)
        setUsarManana(false)
        hideDatePicker();
    };

    const ChangeDireccion = () => {
        let ClienteTieneDireccion = Boolean(cliente?.direccion)
        let CheckDireccion = !usarDireccion

        if (ClienteTieneDireccion === true && CheckDireccion === true) {
            setDireccion(cliente.direccion)
        }

        if (ClienteTieneDireccion === true && CheckDireccion === false) {
            setDireccion("")
        }

        if (ClienteTieneDireccion === false && CheckDireccion === false) {
            setDireccion(direccion)
        }

        if (ClienteTieneDireccion === false && CheckDireccion === true) {
            setDireccion("")
        }

        setUsarDireccion(CheckDireccion)
    }

    const ChangeTelefono = () => {
        let ClienteTieneTelefono = Boolean(cliente?.telefono)
        let CheckTelefono = !usarTelefono

        if (ClienteTieneTelefono === true && CheckTelefono === true) {
            setTelefono(cliente.telefono)
        }

        if (ClienteTieneTelefono === true && CheckTelefono === false) {
            setTelefono("")
        }

        if (ClienteTieneTelefono === false && CheckTelefono === false) {
            setTelefono(telefono)
        }

        if (ClienteTieneTelefono === false && CheckTelefono === true) {
            setTelefono("")
        }

        setUsarTelefono(CheckTelefono)
    }

    const ChangeUsarHoy = () => {
        let CheckUsarHoy = !usarHoy

        if (CheckUsarHoy) {
            setUsarManana(false)
            let FechaHoy = moment(horaCliente(new Date())).format("YYYYMMDD")
            setFechaEntrega(formatDateString(moment(FechaHoy).format("YYYY-MM-DD"), true))
            setFechaEntregaDate(moment(horaCliente(new Date())).format("yyyy-MM-DD"))
        }
        else {
            setFechaEntrega("")
        }

        setUsarHoy(CheckUsarHoy)
    }

    const ChangeUsarManana = () => {
        let CheckUsarManana = !usarManana

        if (CheckUsarManana) {
            setUsarHoy(false)
            let FechaManana = moment(horaCliente(new Date().setDate(new Date().getDate() + 1))).format("YYYYMMDD")
            setFechaEntrega(formatDateString(moment(FechaManana).format("YYYY-MM-DD"), true))
            setFechaEntregaDate(moment(horaCliente(new Date().setDate(new Date().getDate() + 1))).format("yyyy-MM-DD"))
        }
        else {
            setFechaEntrega("")
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
        if (!fechaEntregaDate){
            Alert.alert("Error", "Indique Fecha de Entrega del pedido")
            return
        }
            
        setCargando(true)
        let dcto = 0
        if (nuevoPedido.PorcentajeDcto !== "") {
            dcto = (nuevoPedido.PrecioTotalVenta / (1 - (parseInt(nuevoPedido.PorcentajeDcto) / 100))) - nuevoPedido.PrecioTotalVenta
        }
        else if (nuevoPedido.ValorDcto !== "") {
            dcto = parseInt(nuevoPedido.ValorDcto)
        }

        const ROVenta = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            timeout: 10000,
            body: JSON.stringify({
                Venta: {
                    MedioPago: nuevoPedido.MedioPago,
                    PrecioTotalVenta: nuevoPedido.PrecioTotalVenta,
                    Cliente_id: nuevoPedido.Cliente_id,
                    Fecha: getUTCDate(),
                    Dcto: dcto > 0 ? dcto : null,
                    Observacion: nuevoPedido.Observacion.trim() === "" ? null : nuevoPedido.Observacion.trim()
                },
                ProductosVenta: nuevoPedido.Productos,
                Pedido: {
                    Direccion: direccion === undefined ? null : direccion,
                    Telefono: telefono.trim() === "" ? null : telefono.trim(),
                    FechaEntrega: fechaEntregaDate,
                    Nota: nota.trim() === "" ? null : nota.trim(),
                }
            })
        };

        await fetchWithTimeout(REACT_APP_SV + '/api/venta/', ROVenta)
            .then(response => {
                if (response.status === 200) {
                    setCargando(false)
                    navigation.navigate("VentaOk", { MontoVenta: nuevoPedido.PrecioTotalVenta })
                }
                else {
                    setCargando(false)
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
    }

    if (!fontsLoaded) return null
    if (cargando) return Loader("Ingresando Pedido...")
    return (
        <View style={styles.viewPrincipal}>
            <View style={styles.viewFormulario}>

                <View style={{ flexDirection: "row" }}>
                    <Icon style={styles.inputIcon} name="map-marker" size={20} color="#000" />
                    <TextInput style={styles.textInputFieldsFirst}
                        placeholder="Dirección"
                        onFocus={() => navigation.navigate("SelectorDireccionCliente", { Retorno: "GenerarPedido" })}
                        value={direccion ? direccion : ""}
                        selection={{ start: 0, end: 0 }}
                        editable={!usarDireccion} />

                </View>
                <View style={{ flexDirection: "row", marginLeft: 35, marginBottom: 25 }}>
                    <CheckBox
                        value={usarDireccion}
                        onValueChange={() => ChangeDireccion()}
                        style={styles.checkbox}
                        disabled={!cliente?.direccion}
                    />
                    <Text style={styles.label}>Usar direccion cliente</Text>
                </View>
                <View style={{ flexDirection: "row" }}>
                    <Icon style={styles.inputIcon} name="phone" size={20} color="#000" />
                    <TextInput style={styles.textInputFieldsTelefono}
                        placeholder="Teléfono"
                        value={telefono ? telefono : ""}
                        onChangeText={(text) => setTelefono(text)}
                        editable={!usarTelefono}
                        keyboardType={"phone-pad"} />

                </View>
                <View style={{ flexDirection: "row", marginLeft: 35, marginBottom: 25 }}>
                    <CheckBox
                        value={usarTelefono}
                        onValueChange={() => ChangeTelefono()}
                        style={styles.checkbox}
                        disabled={!cliente?.telefono}
                    />
                    <Text style={styles.label}>Usar teléfono cliente</Text>

                </View>
                <View>
                    <Pressable style={{ flexDirection: "row" }} onPress={showDatePicker}>
                        <Icon style={styles.inputIcon} name="calendar" size={20} color="#000" />
                        <TextInput style={styles.textInputFieldsFirst}
                            placeholder="Fecha de Entrega"
                            value={fechaEntrega}
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
                    value={nota}
                    onChangeText={(text) => setNota(text)}
                    multiline
                />
            </View>

            <View style={styles.viewButtonGuardar}>
                <TouchableOpacity style={styles.buttonGuardar} onPress={() => IngresarPedido()}>
                    <Text style={styles.textButtonGuardar}>Ingresar Pedido</Text>
                </TouchableOpacity>
            </View>

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
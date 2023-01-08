import { TextInput, View, Text, Image, StyleSheet, TouchableOpacity, Modal, Pressable } from 'react-native'
import Icon from 'react-native-vector-icons/FontAwesome'
import React, { useState, useEffect } from 'react'
import { useFonts } from 'expo-font'
import Loader from '../Components/Loader'
import { REACT_APP_SV } from "@env"
import { fetchWithTimeout } from "./../Components/util"
import CheckBox from 'expo-checkbox'

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

    const [cargando, setCargando] = useState(false)

    const [fechaEntrega, setFechaEntrega] = useState("")
    const [telefono, setTelefono] = useState("")
    const [direccion, setDireccion] = useState(route.params?.direccion)
    let pdireccion = direccion?.split(",")
    const calle = pdireccion ? pdireccion[0] : null
    const comuna = pdireccion ? pdireccion[pdireccion.length - 2] : null
    const FromDetalleVenta = route.params?.FromDetalleVenta

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
                console.log("🚀 ~ file: GenerarPedido.js:49 ~ getCliente ~ json", json)
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


    const showDatePickerDesde = () => {
        setDatePickerDesde(true);
    };

    const onDateSelectedDesde = (event, value) => {
        //setDatePickerDesde(Platform.OS === 'ios'); // first state update hides datetimepicker
        setDateDesde(value);
        setDateDesdeStr(formatDateString(value, true))
        setDatePickerDesde(false);
    };

    const ChangeDireccion = () => {
        if (usarDireccion) {
            setDireccion(cliente.direccion)
        } else {
            setDireccion("")
        }

    }

    if (!fontsLoaded) return null
    return (
        <View style={styles.viewPrincipal}>
            <View style={styles.viewFormulario}>

                <View style={{ flexDirection: "row" }}>
                    <Icon style={styles.inputIcon} name="map-marker" size={20} color="#000" />
                    <TextInput style={styles.textInputFieldsFirst}
                        placeholder="Dirección"
                        onFocus={() => navigation.navigate("SelectorDireccionCliente", { Retorno: "GenerarPedido" })}
                        value={direccion ? direccion : ""}
                        selection={{ start: 0, end: 0 }} />

                </View>
                <View style={{ flexDirection: "row", marginLeft: 35, marginBottom: 25 }}>
                    <CheckBox
                        value={usarDireccion}
                        onValueChange={() => ChangeDireccion()}
                        style={styles.checkbox}
                        disabled={cliente?.direccion}
                    />
                    <Text style={styles.label}>Usar direccion cliente</Text>
                </View>
                <View style={{ flexDirection: "row" }}>
                    <Icon style={styles.inputIcon} name="phone" size={20} color="#000" />
                    <TextInput style={styles.textInputFieldsTelefono}
                        placeholder="Teléfono"
                        value={telefono ? telefono : ""}
                        onChangeText={(text) => setTelefono(text)} />

                </View>
                <View style={{ flexDirection: "row", marginLeft: 35, marginBottom: 25 }}>
                    <CheckBox
                        value={usarTelefono}
                        onValueChange={setUsarTelefono}
                        style={styles.checkbox}
                    />
                    <Text style={styles.label}>Usar teléfono cliente</Text>

                </View>
                <View style={{ flexDirection: "row" }}>
                    <Icon style={styles.inputIcon} name="calendar" size={20} color="#000" />
                    <TextInput style={styles.textInputFieldsFirst}
                        placeholder="Fecha de Entrega"
                        value={fechaEntrega}
                        onChangeText={(text) => setFechaEntrega(text)} />
                </View>
                <View style={{ flexDirection: "row", marginLeft: 35, marginBottom: 25 }}>
                    <CheckBox
                        value={usarHoy}
                        onValueChange={setUsarHoy}
                        style={styles.checkbox}
                    />
                    <Text style={styles.label}>Hoy</Text>
                    <CheckBox
                        value={usarManana}
                        onValueChange={setUsarManana}
                        style={styles.checkbox}
                    />
                    <Text style={styles.label}>Mañana</Text>
                </View>
            </View>
            <View style={styles.viewButtonGuardar}>
                <TouchableOpacity style={styles.buttonGuardar} onPress={() => addCliente()}>
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
})
import React from 'react'
import { TextInput, View, Text, Image, StyleSheet, TouchableOpacity, Modal, Pressable } from 'react-native'
import Icon from 'react-native-vector-icons/FontAwesome'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import { useFonts } from 'expo-font'
import { useState } from 'react'
import Loader from '../Components/Loader'
import { REACT_APP_SV } from "@env"
import { fetchWithTimeout } from "./../Components/util"
import ReusableModal, { ModalFooter } from '../Components/ReusableModal'
import { useDispatch } from 'react-redux'
import { setCliente_id } from '../Features/Venta/VentaSlice'

const Cliente = ({ navigation, route }) => {

    const dispatch = useDispatch()

    const [nombre, setNombre] = useState("")
    const [objDireccion, setObjDireccion] = useState({})
    const [telefono, setTelefono] = useState("")
    const [email, setEmail] = useState("")
    const [observacion, setObservacion] = useState("")
    const [cargando, setCargando] = useState(false)

    const [modalVisibleClienteOK, setModalVisibleClienteOK] = useState(false)

    const direccion = route.params?.direccionMapa
    console.log("🚀 ~ file: Cliente.js:28 ~ Cliente ~ direccion:", direccion)
    let pdireccion = direccion?.split(",")
    const calle = pdireccion ? pdireccion[0] : null
    const comuna = pdireccion ? pdireccion[pdireccion.length - 2] : null
    const FromDetalleVenta = route.params?.FromDetalleVenta


    const [fontsLoaded] = useFonts({
        PromptThin: require("./../assets/fonts/Prompt-Thin.ttf"),
        PromptExtraLight: require("./../assets/fonts/Prompt-ExtraLight.ttf"),
        PromptLight: require("./../assets/fonts/Prompt-Light.ttf"),
        PromptRegular: require("./../assets/fonts/Prompt-Regular.ttf"),
        PromptMedium: require("./../assets/fonts/Prompt-Medium.ttf"),
        PromptSemiBold: require("./../assets/fonts/Prompt-SemiBold.ttf"),
    })

    //FUNCIONES
    const addCliente = async () => {

        let objCliente = {
            Nombre: nombre.trim(),
            Telefono: telefono?.trim(),
            Direccion: direccion?.trim(),
            Calle: calle?.trim(),
            Comuna: comuna?.trim(),
            Email: email?.trim(),
            Observacion: observacion?.trim()
        }
        console.log(nombre, telefono, direccion, calle, comuna, email, observacion)
        setCargando(true)
        const ROCliente = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            timeout: 5000,
            body: JSON.stringify(objCliente)
        };

        await fetchWithTimeout(REACT_APP_SV + '/api/cliente/', ROCliente)
            .then(response => {
                //console.log("response", response)
                if (response.status === 200) {
                    console.log("RESULTADO INSERCION CLIENTE: ", response)
                    setCargando(false)
                    //navigation.navigate("VentaOk", { ClienteCreado: objCliente })
                    setModalVisibleClienteOK(true)
                }
                else {
                    setCargando(false)
                    throw new Error("Error")
                }
            })
            .catch(err => {
                setCargando(false)
                alert("No se ha podido ingresar el nuevo cliente");
            })
    }

    const limpia = () => {
        setNombre("")
        setTelefono("")
        setEmail("")
        setObservacion("")
        navigation.setParams({ direccion: null })
        setModalVisibleClienteOK(false)
        setObjDireccion({})
    }

    if (!fontsLoaded) return null

    if (cargando) return Loader("Ingresando Cliente")

    return (
        <KeyboardAwareScrollView keyboardShouldPersistTaps="handled">
            <View style={styles.viewPrincipal}>
                {/* Modal Cliente Creado */}
                <ReusableModal
                    visible={modalVisibleClienteOK}
                    closeModal={() => setModalVisibleClienteOK(false)}
                    headerTitle={"Cliente creado exitosamente"}
                    closeButton={false}
                >
                    <View style={{ alignContent: "flex-start" }}>
                        <View style={{ flexDirection: "row", textAlign: "left" }}>
                            <Icon style={styles.iconDetalleCliente} name="user-o" size={18} color="#000" />
                            <Text style={styles.textDetalleClienteModal}>{nombre}</Text>
                        </View>
                        {telefono ? <View style={styles.viewModalDetalleCliente}>
                            <Icon style={styles.iconDetalleCliente} name="phone" size={20} color="#000" />
                            <Text style={styles.textDetalleClienteModal}>{telefono}</Text>
                        </View> : <></>}

                        {direccion ? <View style={styles.viewModalDetalleCliente}>
                            <Icon style={styles.iconDetalleCliente} name="map-marker" size={20} color="#000" />
                            <Text style={styles.textDetalleClienteModal}>{calle.trim() + ", " + comuna.trim()}</Text>
                        </View> : <></>}

                        {email ? <View style={styles.viewModalDetalleCliente}>
                            <Icon style={styles.iconDetalleCliente} name="envelope-o" size={15} color="#000" />
                            <Text style={styles.textDetalleClienteModal}>{email}</Text>
                        </View> : <></>}

                        {observacion ? <View style={styles.viewModalDetalleCliente}>
                            <Icon style={styles.iconDetalleCliente} name="comments" size={15} color="#000" />
                            <Text style={styles.textDetalleClienteModal}>{observacion}</Text>
                        </View> : <></>}
                    </View>


                    <ModalFooter>
                        <View style={{ flexDirection: "row" }}>
                            {!FromDetalleVenta ?
                                <>
                                    <Pressable
                                        style={styles.modalBotonNuevoCliente}
                                        onPress={() => limpia()}>
                                        <Text style={styles.textModalButtonFooter}>Nuevo Cliente</Text>
                                    </Pressable>
                                    <Pressable
                                        style={styles.modalBotonVolver}
                                        onPress={() => navigation.goBack()}>
                                        <Text style={styles.textModalButtonFooter}>Volver</Text>
                                    </Pressable>
                                </>
                                :
                                <Pressable
                                    style={styles.modalBotonVolverVenta}
                                    //onPress={() => {dispatch(setCliente_id());navigation.goBack()}}>
                                    onPress={() => navigation.goBack()}>
                                    <Text style={styles.textModalButtonFooter}>Continuar Venta</Text>
                                </Pressable>
                            }
                        </View>
                    </ModalFooter>
                </ReusableModal>

                <View style={styles.viewImagen}>
                    <Image source={require("./../assets/Images/ThumbImagenPerfil.png")} style={styles.imagePrefil} />
                </View>


                <View style={styles.viewFormulario}>
                    <View style={{ flexDirection: "row" }}>
                        <Icon style={styles.inputIcon} name="user-o" size={20} color="#000" />
                        <TextInput style={styles.textInputFields}
                            placeholder="Nombre*"
                            value={nombre}
                            onChangeText={(text) => setNombre(text)} />
                    </View>
                    <View style={{ flexDirection: "row" }}>
                        <Icon style={styles.inputIcon} name="whatsapp" size={20} color="#000" />
                        <TextInput style={styles.textInputFields}
                            placeholder="Móvil / WhatsApp"
                            keyboardType='phone-pad'
                            value={telefono}
                            onChangeText={(text) => setTelefono(text)} />
                    </View>

                    <View style={{ flexDirection: "row" }}>
                        <Icon style={styles.inputIcon} name="map-marker" size={20} color="#000" />
                        <TextInput style={styles.textInputFields}
                            placeholder="Dirección"
                            onFocus={() => navigation.navigate("SelectorDireccionCliente", { Retorno: "Cliente" })}
                            value={direccion ? direccion : ""}
                            selection={{ start: 0, end: 0 }} />
                    </View>
                    <View style={{ flexDirection: "row" }}>
                        <Icon style={styles.inputIcon} name="envelope-o" size={20} color="#000" />
                        <TextInput style={styles.textInputFields}
                            placeholder="Email"
                            keyboardType='email-address'
                            value={email}
                            onChangeText={(text) => setEmail(text)} />
                    </View>
                    <View style={{ flexDirection: "row" }}>
                        <Icon style={styles.inputIcon} name="commenting-o" size={20} color="#000" />
                        <TextInput style={styles.textInputFields}
                            placeholder="Observacion"
                            value={observacion}
                            onChangeText={(text) => setObservacion(text)} />
                    </View>

                </View>
                <View style={styles.viewButtonGuardar}>
                    <TouchableOpacity style={nombre.trim() === "" ? styles.buttonGuardarDisabled : styles.buttonGuardar} onPress={() => addCliente()} disabled={nombre.trim() === ""}>
                        <Text style={styles.textButtonGuardar}>Guardar</Text>
                    </TouchableOpacity>
                </View>

                {/* <View style={styles.viewButtonGuardar}>
                    <TouchableOpacity style={styles.buttonGuardar} onPress={() => setModalVisible(true)}>
                        <Text style={styles.textButtonGuardar}>Guardar</Text>
                    </TouchableOpacity>
                </View> */}

            </View>
        </KeyboardAwareScrollView>
    )
}

export default Cliente

const styles = StyleSheet.create({
    buttonAplicarModalFooter: {
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 4,
        elevation: 3,
        backgroundColor: '#00a8a8',
        padding: 10
    },
    textButtonModalFooter: {
        color: "white",
        fontFamily: "PromptSemiBold",
        fontSize: 15
    },
    viewPrincipal: {
        flex: 1
    },
    viewImagen: {
        flex: 2,
        backgroundColor: "white",
        alignItems: "center",
        justifyContent: "center",
        marginTop: 30,
        padding: 20,
    },
    imagePrefil: {
        height: 50,
        width: 50
    },
    viewFormulario: {
        flex: 2,
        marginTop: 30,
        padding: 20,
        backgroundColor: "white",
    },
    viewFormularioOpcional: {
        flex: 3,
        marginTop: 30,
        padding: 20,
        backgroundColor: "white",
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
    buttonGuardarDisabled: {
        alignItems: 'center',
        justifyContent: 'center',
        //paddingVertical: 12,
        //paddingHorizontal: 32,
        borderRadius: 4,
        elevation: 3,
        backgroundColor: '#00a8a8',
        height: 60,
        marginHorizontal: 5,
        opacity: 0.5
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
    textOpcionales: {
        fontFamily: "PromptExtraLight",
        fontSize: 16,
        marginBottom: 20
    },
    modalBotonNuevoCliente: {
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 4,
        elevation: 3,
        backgroundColor: '#00a8a8',
        padding: 10
    },
    modalBotonVolverVenta: {
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 4,
        elevation: 3,
        backgroundColor: '#00a8a8',
        padding: 10,
        marginLeft: 10
    },
    modalBotonVolver: {
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 4,
        elevation: 3,
        backgroundColor: '#ffbd59',
        padding: 10,
        marginLeft: 10
    },
    textModalButtonFooter: {
        color: "white",
        fontFamily: "PromptSemiBold",
        fontSize: 15
    },
    textDetalleClienteModal: {
        fontFamily: "PromptLight",
        fontSize: 20,
        marginLeft: 5
    },
    iconDetalleCliente: {
        /* justifyContent: "center",
        alignItems: "center",
        paddingTop: 5,
        marginLeft: 25 */
        alignSelf: "center"
    },
    viewModalDetalleCliente: {
        flexDirection: "row",
        marginTop: 5
    }
})
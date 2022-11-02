import React from 'react'
import { TextInput, View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native'
import Icon from 'react-native-vector-icons/FontAwesome'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import { useFonts } from 'expo-font'
import { useState } from 'react'
import Loader from '../Components/Loader'
import { REACT_APP_SV } from "@env"
import { fetchWithTimeout } from "./../Components/util"

const Cliente = ({ navigation, route }) => {

    const [nombre, setNombre] = useState("")
    const [telefono, setTelefono] = useState("")
    const [email, setEmail] = useState("")
    const [observacion, setObservacion] = useState("")
    const [cargando, setCargando] = useState(false)

    const direccion = route.params?.direccion
    let pdireccion = direccion?.split(",")
    const calle = pdireccion ? pdireccion[0] : ""
    const comuna = pdireccion ? pdireccion[pdireccion.length - 2] : ""


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
        console.log(nombre, telefono, direccion, calle, comuna, email, observacion)
        setCargando(true)
        const ROCliente = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            timeout: 5000,
            body: JSON.stringify({
                Nombre: nombre.trim(),
                Telefono: telefono.trim(),
                Direccion: direccion.trim(),
                Calle: calle.trim(),
                Comuna: comuna.trim(),
                Email: email.trim(),
                Observacion: observacion.trim()
            })
        };

        console.log(REACT_APP_SV + '/api/cliente/')
        await fetchWithTimeout(REACT_APP_SV + '/api/cliente/', ROCliente)
            .then(response => {
                console.log("response.status", response.status)
                if (response.status === 200) {
                    console.log("RESULTADO INSERCION CLIENTE: ", JSON.stringify(response))
                    setCargando(false)
                    alert("se ingreso el cliente")
                }
                else {
                    setCargando(false)
                    throw new Error("Error")
                }
            })
            .catch(err => {
                setCargando(false)
                alert("No se ha podido ingresar la venta");
            })
    }

    if (!fontsLoaded) return null

    if (cargando) return Loader("Ingresando Cliente")

    return (
        <KeyboardAwareScrollView>
            <View style={styles.viewPrincipal}>


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
                            onFocus={() => navigation.navigate("SelectorDireccionCliente")}
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
                    <TouchableOpacity style={styles.buttonGuardar} onPress={() => addCliente()}>
                        <Text style={styles.textButtonGuardar}>Guardar</Text>
                    </TouchableOpacity>
                </View>

            </View>
        </KeyboardAwareScrollView>
    )
}

export default Cliente

const styles = StyleSheet.create({
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
    }
})
import { View, Text, StyleSheet, Pressable, Alert, TouchableOpacity, Modal, TextInput, ScrollView } from 'react-native'
import React, { useState } from 'react'
import { ButtonGroup, Input, Button } from "@rneui/themed";
import { formatoMonedaChileno, getUTCDate } from "../Components/util";
import Loader from "./../Components/Loader"
import { REACT_APP_SV } from "@env"
import { useFonts } from 'expo-font'

const DetallePedido = ({ navigation, route }) => {

    //OPERACIONES
    const Pedido = route.params.pedido.filter((x) => {
        return x.Cantidad > 0;
    });
    let totalTemp = 0;
    Pedido.forEach(element => {
        totalTemp += (element.Precio * element.Cantidad)
    });

    //HOOKS
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [modalVisible, setModalVisible] = useState(false);
    const [valorDcto, setValorDcto] = useState("");
    const [porcentajeDcto, setPorcentajeDcto] = useState("");
    const [PrecioTotal, setPrecioTotal] = useState(totalTemp)
    const [PrecioTotalDcto, setPrecioTotalDcto] = useState(0)
    const [cargandoVenta, setCargandoVenta] = useState(false)
    const [obs, setObs] = useState("")
    const [fontsLoaded] = useFonts({
        PromptThin: require("./../assets/fonts/Prompt-Thin.ttf"),
        PromptExtraLight: require("./../assets/fonts/Prompt-ExtraLight.ttf"),
        PromptLight: require("./../assets/fonts/Prompt-Light.ttf"),
        PromptRegular: require("./../assets/fonts/Prompt-Regular.ttf"),
        PromptMedium: require("./../assets/fonts/Prompt-Medium.ttf"),
        PromptSemiBold: require("./../assets/fonts/Prompt-SemiBold.ttf"),
    })

    //FUNCIONES
    const IngresaVenta = () => {
        setCargandoVenta(true)
        console.log(getUTCDate())
        const ROVenta = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                Venta: {
                    MedioPago: selectedIndex,
                    PrecioTotalVenta: PrecioTotalDcto > 0 ? PrecioTotalDcto : PrecioTotal,
                    Cliente_id: "1",
                    Fecha: getUTCDate(),
                    Dcto: PrecioTotalDcto > 0 ? PrecioTotal - PrecioTotalDcto : 0,
                    Observacion: obs === "" ? null : obs
                },
                ProductosVenta: Pedido
            })
        };

        console.log(REACT_APP_SV + '/api/venta/')
        fetch(REACT_APP_SV + '/api/venta/', ROVenta)
            .then(response => {
                console.log("response.status", response.status)
                if (response.status === 200) {
                    console.log("RESULTADO INSERCION VENTA: ", JSON.stringify(response))
                    setCargandoVenta(false)
                    navigation.navigate("VentaOk", { MontoVenta: PrecioTotalDcto > 0 ? PrecioTotalDcto : PrecioTotal })
                }
                else {
                    setCargandoVenta(false)
                    throw new Error("Error")
                }
            })
            .catch(err => {
                Alert.alert("Error: ", "No se ha podido ingresar la venta");
            })
    }

    const AplicarDcto = () => {
        if (valorDcto !== "" && valorDcto < PrecioTotal) {
            setPrecioTotalDcto(PrecioTotal - valorDcto)
        } else if (porcentajeDcto !== "" && porcentajeDcto < 100) {
            setPrecioTotalDcto(PrecioTotal * (1 - (porcentajeDcto / 100)))
        }

        setModalVisible(false)
    }

    const PrecioAnteriorTachado = () => {
        if (PrecioTotalDcto > 0) {
            return (<View style={{ flexDirection: "row", justifyContent: 'flex-end' }}>
                <Text style={styles.TextoPrecioTotalTachado}>{"$ " + formatoMonedaChileno(PrecioTotal)}</Text>
            </View>)
        }
        else {
            return (<></>)
        }

    }


    {
        if (cargandoVenta || !fontsLoaded) {
            return (Loader("Ingresando Venta..."))
        }
        else {
            return (
                /* Principal */
                <View style={styles.ViewPrincipal}>
                    <Modal
                        animationType="slide"
                        transparent={true}
                        visible={modalVisible}
                        onRequestClose={() => {
                            setModalVisible(!modalVisible);
                        }}
                    >
                        <View style={styles.centeredView}>
                            <View style={styles.modalView}>
                                <View style={{ marginBottom: 10 }}>
                                    <Text style={styles.modalText}>Valor Fijo</Text>
                                    <TextInput keyboardType='number-pad' value={valorDcto} style={{ borderBottomWidth: 0.5, fontFamily:"PromptLight" }} autoFocus={true} placeholder="$" onChangeText={text => { setValorDcto(text); setPorcentajeDcto("") }} />
                                </View>
                                <View style={{ marginBottom: 10 }}>
                                    <Text style={styles.modalText}>Porcentaje</Text>
                                    <TextInput keyboardType='number-pad' value={porcentajeDcto} style={{ borderBottomWidth: 0.5, fontFamily:"PromptLight" }} placeholder="%" onChangeText={text => { setPorcentajeDcto(text); setValorDcto("") }} />
                                </View>
                                <View style={{ marginBottom: 10 }}>
                                    <Pressable style={styles.BotonAplicarDcto} onPress={() => AplicarDcto()}>
                                        <Text style={styles.TextoAplicar}>Aplicar</Text>
                                    </Pressable>
                                </View>
                            </View>
                        </View>


                    </Modal>


                    {/* Detalle Productos */}
                    <View style={{ flex: 3 }}>
                        <ScrollView>
                            {
                                Pedido.map((item, index) => {
                                    return (
                                        <View key={item._id} style={styles.ViewItem}>

                                            <View style={{ flex: 1 }}>
                                                <Text style={styles.TextCantidad}>{item.Cantidad + " x "}</Text>
                                            </View>

                                            <View style={{ flex: 2 }}>
                                                <Text style={styles.TextNombre}>{item.Nombre}</Text>
                                                <Text style={styles.TextPrecioUnitario}>{"$ " + formatoMonedaChileno(item.Precio)}</Text>
                                            </View>
                                            <View style={{ flex: 1, alignItems: "flex-end" }}>
                                                <Text style={styles.TextPrecioSubtotal}>{formatoMonedaChileno(item.Precio * item.Cantidad)}</Text>
                                            </View>
                                        </View>
                                    )
                                })
                            }
                        </ScrollView>

                    </View>

                    {/* total*/}
                    <View style={{ flex: 1, alignItems: "flex-end", marginRight: 10 }}>

                        {PrecioAnteriorTachado()}
                        <View style={{ flexDirection: "row" }}>
                            <Text style={{ fontSize: 25 }}>TOTAL:</Text>

                            <Text style={styles.TextPrecioTotal}>{"$ " + formatoMonedaChileno(PrecioTotalDcto === 0 ? PrecioTotal : PrecioTotalDcto)}</Text>
                        </View>
                        <View style={{ flexDirection: "row" }}>
                            <TouchableOpacity onPress={() => PrecioTotalDcto > 0 ? setPrecioTotalDcto(0) : setModalVisible(true)}>
                                <Text style={styles.TextDcto}>{PrecioTotalDcto === 0 ? "Dar Descuento" : "Quitar Descuento"}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* mediopago */}
                    <View style={{ flex: 1 }}>
                        <ButtonGroup
                            buttons={['EFECTIVO', 'TRANSFERENCIA', 'TARJETA']}
                            selectedIndex={selectedIndex}
                            onPress={(value) => {
                                setSelectedIndex(value);
                            }}
                            containerStyle={{
                                marginBottom: 20,
                                borderColor: "#00a8a8"
                            }}
                            textStyle={{
                                fontFamily: "PromptRegular"
                            }}
                            selectedButtonStyle={{
                                backgroundColor: "#00a8a8"
                            }}
                        />
                    </View>

                    {/* observacion */}
                    <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
                        <Input
                            placeholder="Observación"
                            leftIcon={{ type: 'font-awesome', name: 'comment' }}
                            onChangeText={text => { setObs(text) }}
                            style={{
                                fontFamily: "PromptRegular"
                            }}
                        />
                    </View>

                    {/* BotonFinalizar */}
                    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                        <Pressable disabled={cargandoVenta} style={styles.BotonFinalizar} onPress={() => IngresaVenta()} >
                            <Text style={styles.TextoFinalizar}>Finalizar</Text>
                        </Pressable>
                        
                    </View>
                </View>
            )
        }
    }
}

export default DetallePedido

const styles = StyleSheet.create({
    centeredView: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        marginTop: 22
    },
    modalView: {
        margin: 20,
        backgroundColor: "white",
        borderRadius: 20,
        padding: 35,
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5
    },
    button: {
        borderRadius: 20,
        padding: 10,
        elevation: 2
    },
    buttonOpen: {
        backgroundColor: "#F194FF",
    },
    buttonClose: {
        backgroundColor: "#2196F3",
    },
    textStyle: {
        color: "white",
        fontWeight: "bold",
        textAlign: "center"
    },
    modalText: {
        marginBottom: 15,
        textAlign: "center",
        fontFamily:"PromptRegular"
    }
    ,
    ViewPrincipal: {
        margin: 15,
        flex: 1
    },
    ViewItem: {
        flexDirection: "row",
        borderBottomWidth: 0.5,
        marginHorizontal: 10
    },
    BotonFinalizar: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        paddingHorizontal: 32,
        borderRadius: 4,
        elevation: 7,
        backgroundColor: '#00a8a8',
        height: 60,
        marginHorizontal: 5
    },
    BotonAplicarDcto: {
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 4,
        elevation: 3,
        backgroundColor: '#00a8a8',
        padding: 10
    },
    TextNombre: {
        fontFamily: "PromptRegular",
        fontSize: 18
    },
    TextPrecioUnitario: {
        fontFamily: "PromptLight",
        fontSize: 14,
        color: "gray"
    },
    TextCantidad: {
        fontFamily: "PromptMedium",
        fontSize: 20
    },
    TextPrecioSubtotal: {
        fontFamily: "PromptRegular",
        fontSize: 20
    },
    TextPrecioTotal: {
        fontSize: 25,
        fontFamily: "PromptMedium",
        marginLeft: 5
    },
    TextoPrecioTotalTachado: { 
        fontFamily:"PromptMedium", 
        fontSize: 25, 
        marginLeft: 5, 
        textDecorationLine: "line-through" 
    },
    TextDcto: {
        fontSize: 16,
        textDecorationLine: 'underline',
        color: "#00a8a8",
        fontFamily: "PromptLight"
    },
    TextoAplicar: {
        fontSize: 15,
        color: 'white',
        fontFamily: "PromptSemiBold"
    },
    TextoFinalizar: {
        fontSize: 25,
        letterSpacing: 0.25,
        color: 'white',
        fontFamily: "PromptSemiBold"
    }
})
import { View, Text, StyleSheet, Pressable, Alert, TouchableOpacity, Modal, TextInput, ScrollView } from 'react-native'
import React, { useState } from 'react'
import { ButtonGroup } from "@rneui/themed";
import { formatoMonedaChileno, getUTCDate } from "../Components/util";
import { REACT_APP_SV } from "@env"


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
                    Dcto: PrecioTotalDcto > 0 ? PrecioTotal - PrecioTotalDcto : 0
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
                <Text style={{ fontWeight: "bold", fontSize: 25, marginLeft: 5, textDecorationLine: "line-through" }}>{"$ " + formatoMonedaChileno(PrecioTotal)}</Text>
            </View>)
        }
        else {
            return (<></>)
        }

    }

    return (
        /* Principal */
        <View style={styles.ViewPrincipal}>
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => {
                    Alert.alert("Modal has been closed.");
                    setModalVisible(!modalVisible);
                }}
            >
                <View style={styles.centeredView}>
                    <View style={styles.modalView}>
                        <View style={{ marginBottom: 10 }}>
                            <Text style={styles.modalText}>Valor Fijo</Text>
                            <TextInput keyboardType='number-pad' value={valorDcto} style={{ borderBottomWidth: 0.5 }} autoFocus={true} placeholder="$" onChangeText={text => { setValorDcto(text); setPorcentajeDcto("") }} />
                        </View>
                        <View style={{ marginBottom: 10 }}>
                            <Text style={styles.modalText}>Porcentaje</Text>
                            <TextInput keyboardType='number-pad' value={porcentajeDcto} style={{ borderBottomWidth: 0.5 }} placeholder="%" onChangeText={text => { setPorcentajeDcto(text); setValorDcto("") }} />
                        </View>
                        <View style={{ marginBottom: 10 }}>
                            <Pressable style={styles.BotonAplicarDcto} onPress={() => AplicarDcto()}>
                                <Text style={styles.TextoFinalizar}>Aplicar</Text>
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

                    <Text style={{ fontWeight: "bold", fontSize: 25, marginLeft: 5 }}>{"$ " + formatoMonedaChileno(PrecioTotalDcto === 0 ? PrecioTotal : PrecioTotalDcto)}</Text>
                </View>
                <View style={{ flexDirection: "row" }}>
                    <TouchableOpacity onPress={() => PrecioTotalDcto > 0 ? setPrecioTotalDcto(0) : setModalVisible(true)}>
                        <Text style={{ fontSize: 20, textDecorationLine: 'underline', color: "#00a8a8" }}>{PrecioTotalDcto === 0 ? "Dar Descuento" : "Quitar Descuento"}</Text>
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
                    containerStyle={{ marginBottom: 20, borderColor: "#00a8a8" }}
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
        textAlign: "center"
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
        elevation: 3,
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
        fontSize: 18
    },
    TextPrecioUnitario: {
        fontSize: 14,
        color: "gray"
    },
    TextCantidad: {
        fontWeight: "bold",
        fontSize: 20
    },
    TextPrecioSubtotal: {
        fontSize: 20
    },
    TextPrecioTotal: {
        fontSize: 25,
        fontFamily: "bold"
    },
    TextoFinalizar: {
        fontSize: 16,
        lineHeight: 21,
        fontWeight: 'bold',
        letterSpacing: 0.25,
        color: 'white',
    },
})
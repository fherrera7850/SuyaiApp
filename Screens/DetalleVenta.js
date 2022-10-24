import { View, Text, StyleSheet, Pressable, Alert, TouchableOpacity, TextInput, ScrollView, Modal } from 'react-native'
import React, { useState } from 'react'
import { ButtonGroup, Input } from "@rneui/themed";
import { formatoMonedaChileno, getUTCDate, fetchWithTimeout } from "../Components/util"
import Loader from "./../Components/Loader"
import { REACT_APP_SV } from "@env"
import { useFonts } from 'expo-font'
import Icon from 'react-native-vector-icons/FontAwesome'

const DetallePedido = ({ navigation, route }) => {

    //OPERACIONES
    let TempPedido = route.params.pedido.filter((x) => {
        return x.Cantidad > 0;
    });
    let totalTemp = 0;
    TempPedido.forEach(element => {
        totalTemp += (element.Precio * element.Cantidad)
    });

    const [pedido, setPedido] = useState(TempPedido)

    //HOOKS
    const [modalVisible, setModalVisible] = useState(false)
    const [modalProductoVisible, setModalProductoVisible] = useState(false)

    const [valorDcto, setValorDcto] = useState("")
    const [porcentajeDcto, setPorcentajeDcto] = useState("")
    const [obs, setObs] = useState("")
    const [selectedIndex, setSelectedIndex] = useState(0)
    const [habilitaDescuento, setHabilitaDescuento] = useState(false)

    const [PrecioTotal, setPrecioTotal] = useState(totalTemp)
    const [PrecioTotalDcto, setPrecioTotalDcto] = useState(0)

    const [cargandoVenta, setCargandoVenta] = useState(false)

    const [productoModificar, setProductoModificar] = useState({})
    const [cantidadProductoModificar, setCantidadProductoModificar] = useState("")
    const [precioProductoModificar, setPrecioProductoModificar] = useState("")

    const [fontsLoaded] = useFonts({
        PromptThin: require("./../assets/fonts/Prompt-Thin.ttf"),
        PromptExtraLight: require("./../assets/fonts/Prompt-ExtraLight.ttf"),
        PromptLight: require("./../assets/fonts/Prompt-Light.ttf"),
        PromptRegular: require("./../assets/fonts/Prompt-Regular.ttf"),
        PromptMedium: require("./../assets/fonts/Prompt-Medium.ttf"),
        PromptSemiBold: require("./../assets/fonts/Prompt-SemiBold.ttf"),
    })

    //FUNCIONES
    const IngresaVenta = async () => {
        setCargandoVenta(true)
        console.log(getUTCDate())
        const ROVenta = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            timeout:5000,
            body: JSON.stringify({
                Venta: {
                    MedioPago: selectedIndex,
                    PrecioTotalVenta: PrecioTotalDcto > 0 ? PrecioTotalDcto : PrecioTotal,
                    Cliente_id: "1",
                    Fecha: getUTCDate(),
                    Dcto: PrecioTotalDcto > 0 ? PrecioTotal - PrecioTotalDcto : 0,
                    Observacion: obs.trim() === "" ? null : obs
                },
                ProductosVenta: pedido
            })
        };

        console.log(REACT_APP_SV + '/api/venta/')
        await fetchWithTimeout(REACT_APP_SV + '/api/venta/', ROVenta)
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

    const SeleccionaProductoModificar = (item) => {
        //Solo puede modificar si no hay dcto general aplicado
        if (PrecioTotalDcto === 0) {
            let producto = { ...item }
            setProductoModificar(producto)
            setCantidadProductoModificar(producto.Cantidad.toString())
            setPrecioProductoModificar(producto.Precio.toString())
            setModalProductoVisible(true)
        }
    }

    const ModificarProducto = () => {
        let carro = [...pedido]
        let tmpProductoModificar = { ...productoModificar }
        let totalTemp = 0
        for (const key in carro) {
            if (carro[key]._id === tmpProductoModificar._id) {
                carro[key].Cantidad = cantidadProductoModificar
                carro[key].Precio = precioProductoModificar
            }
            totalTemp += carro[key].Cantidad * carro[key].Precio
        }
        setPrecioTotal(totalTemp)
        setPedido(carro)
        setModalProductoVisible(false)
        setHabilitaDescuento(true)
    }

    const ValidaDescuento = () => {
        return (valorDcto.trim() === "" && porcentajeDcto.trim() === "") ||
            parseInt(porcentajeDcto, 10) >= 100 ||
            valorDcto >= PrecioTotal ||
            isNaN(valorDcto) ||
            isNaN(porcentajeDcto)
    }

    const ValidaModificarProducto = () => {
        return cantidadProductoModificar.trim() === "" ||
            precioProductoModificar.trim() === "" ||
            isNaN(cantidadProductoModificar) ||
            isNaN(precioProductoModificar)
    }


    {
        if (cargandoVenta || !fontsLoaded) {
            return (Loader("Ingresando Venta..."))
        }
        else {
            return (
                /* Principal */
                <View style={styles.ViewPrincipal}>
                    {/* Modal Descuentos */}
                    <Modal
                        animationType="slide"
                        transparent={true}
                        visible={modalVisible}
                        onRequestClose={() => {
                            console.log("Modal has been closed.");
                            setModalVisible(!modalVisible);
                        }}
                    >
                        <View style={styles.centeredView}>
                            {/* MODALVIEW */}
                            <View style={styles.modalView}>

                                {/* HEADER */}
                                <View style={styles.modalHeader}>
                                    <Text style={styles.modalHeaderText}>Aplicar Descuento</Text>
                                    <TouchableOpacity style={{ flex: 1, alignItems: "flex-end" }} onPress={() => setModalVisible(!modalVisible)}>
                                        <Icon name="close" size={20} />
                                    </TouchableOpacity>

                                </View>

                                {/* BODY */}
                                <View style={styles.modalBody}>
                                    <View style={{ justifyContent: "center", alignItems: "center", width: "100%" }}>
                                        <Input
                                            placeholder="Valor Fijo"
                                            leftIcon={{ type: 'font-awesome', name: 'dollar' }}
                                            onChangeText={text => { setValorDcto(text); setPorcentajeDcto("") }}
                                            autoFocus={true}
                                            keyboardType='number-pad'
                                            style={{
                                                fontFamily: "PromptExtraLight",
                                                marginLeft: 10
                                            }}
                                            value={valorDcto}
                                        />
                                        <Input
                                            placeholder="Porcentaje"
                                            leftIcon={{ type: 'font-awesome', name: 'percent' }}
                                            onChangeText={text => { setPorcentajeDcto(text); setValorDcto("") }}
                                            autoFocus={true}
                                            keyboardType='number-pad'
                                            style={{
                                                fontFamily: "PromptExtraLight",
                                                marginLeft: 10
                                            }}
                                            value={porcentajeDcto}
                                        />
                                    </View>

                                </View>

                                {/* FOOTER */}
                                <View style={styles.modalFooter}>
                                    <View style={{ marginBottom: 10 }}>
                                        <Pressable
                                            disabled={ValidaDescuento()}
                                            style={ValidaDescuento() ? styles.modalBotonAplicarDisabled : styles.modalBotonAplicar}
                                            onPress={() => AplicarDcto()}>
                                            <Text style={styles.modalButtonFooter}>Aplicar</Text>
                                        </Pressable>
                                    </View>
                                </View>



                            </View>
                        </View>


                    </Modal>

                    {/* Modal Editar Producto */}
                    <Modal
                        animationType="slide"
                        transparent={true}
                        visible={modalProductoVisible}
                        onRequestClose={() => {
                            console.log("Modal has been closed.");
                            setModalProductoVisible(!modalProductoVisible);
                        }}
                    >
                        <View style={styles.centeredView}>
                            {/* MODALVIEW */}
                            <View style={styles.modalView}>

                                {/* HEADER */}
                                <View style={styles.modalHeader}>
                                    <Text style={styles.modalHeaderText}>{"Ítem: " + productoModificar.Nombre}</Text>
                                    <TouchableOpacity style={{ flex: 1, alignItems: "flex-end" }} onPress={() => setModalProductoVisible(false)}>
                                        <Icon name="close" size={20} />
                                    </TouchableOpacity>
                                </View>

                                {/* BODY */}
                                <View style={styles.modalBody}>
                                    <View style={{ justifyContent: "center", alignItems: "center", width: "100%" }}>
                                        <Input
                                            placeholder="Cantidad"
                                            leftIcon={{ type: 'font-awesome', name: 'shopping-basket' }}
                                            onChangeText={text => { setCantidadProductoModificar(text) }}
                                            autoFocus={true}
                                            keyboardType='number-pad'
                                            style={{
                                                fontFamily: "PromptExtraLight",
                                                marginLeft: 10,
                                                fontSize: 15
                                            }}
                                            value={cantidadProductoModificar}
                                        />
                                        <Input
                                            placeholder="Precio Unitario"
                                            leftIcon={{ type: 'font-awesome', name: 'dollar' }}
                                            onChangeText={text => { setPrecioProductoModificar(text) }}
                                            keyboardType='number-pad'
                                            style={{
                                                fontFamily: "PromptExtraLight",
                                                marginLeft: 10,
                                                fontSize: 15
                                            }}
                                            value={precioProductoModificar}
                                        />
                                    </View>

                                </View>

                                {/* FOOTER */}
                                <View style={styles.modalFooter}>
                                    <View style={{ marginBottom: 10, flexDirection: "row" }}>
                                        <Pressable
                                            disabled={
                                                ValidaModificarProducto()
                                            }
                                            style={
                                                ValidaModificarProducto() ?
                                                    styles.modalBotonAplicarDisabled :
                                                    styles.modalBotonAplicar
                                            }
                                            onPress={() => ModificarProducto()}>
                                            <Text style={styles.modalButtonFooter}>Aplicar</Text>
                                        </Pressable>
                                    </View>
                                </View>



                            </View>
                        </View>


                    </Modal>

                    {/* Detalle Productos */}
                    <View style={{ flex: 3 }}>
                        <ScrollView>
                            {
                                pedido.map((item, index) => {
                                    return (
                                        <Pressable key={item._id} style={styles.ViewItem} onPress={() => SeleccionaProductoModificar(item)}>

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
                                        </Pressable>
                                    )
                                })
                            }
                        </ScrollView>

                    </View>

                    {/* total*/}
                    <View style={{ flex: 1, alignItems: "flex-end", marginRight: 10 }}>

                        {PrecioAnteriorTachado()}
                        <View style={{ flexDirection: "row" }}>
                            <Text style={styles.TextPrecioTotal}>TOTAL:</Text>

                            <Text style={styles.TextPrecioTotal}>{"$ " + formatoMonedaChileno(PrecioTotalDcto === 0 ? PrecioTotal : PrecioTotalDcto)}</Text>
                        </View>
                        <View style={{ flexDirection: "row" }}>
                            <TouchableOpacity
                                onPress={() => PrecioTotalDcto > 0 ? setPrecioTotalDcto(0) : setModalVisible(true)}
                                disabled={habilitaDescuento}>
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
        alignItems: "center"
    },
    modalHeaderText: {
        fontFamily: "PromptSemiBold",
        fontSize: 16,
        flex:2
    },
    modalView: {
        backgroundColor: "white",
        borderRadius: 20,
        padding: 25,
        elevation: 20,
        width: "70%",
    },
    modalHeader: {
        width: "100%",
        alignItems: "flex-end",
        flexDirection: "row",
        paddingBottom: 20
    },
    modalBody: {
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
    },
    modalFooter: {
        justifyContent: "center",
        alignItems: "flex-end",
        width: "100%",
        paddingTop: 20
    },
    modalBotonAplicar: {
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 4,
        elevation: 3,
        backgroundColor: '#00a8a8',
        padding: 10
    },
    modalBotonAplicarDisabled: {
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 4,
        elevation: 3,
        backgroundColor: '#00a8a8',
        padding: 10,
        opacity: 0.5
    },
    modalButtonFooter: {
        color: "white",
        fontFamily: "PromptSemiBold",
        fontSize: 15
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
        fontFamily: "PromptRegular"
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
        fontSize: 18,
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
        fontFamily: "PromptMedium",
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
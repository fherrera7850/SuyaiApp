import React, { useEffect, useState, useis } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, Pressable, Alert, Modal, TextInput } from "react-native";
import { formatoMonedaChileno, fetchWithTimeout } from "../Components/util";
import Loader from "../Components/Loader";
import { REACT_APP_SV } from "@env"
import { useFonts } from 'expo-font'
import Icon from 'react-native-vector-icons/FontAwesome';
import { Input } from "@rneui/themed";
import cloneDeep from 'lodash.clonedeep';
import { useDispatch, useSelector } from 'react-redux';
import { setProductos, addItem, removeItem, resetCantidad, updateCantidad } from "../Features/Venta/ProductoVentaSlice";
import { setDcto, resetV } from "../Features/Venta/VentaSlice";
import { useIsFocused } from '@react-navigation/native';
import CarritoProductos from "../Components/CarritoProductos";

const RealizarPedido = ({ navigation, route, props }) => {

    const styles = StyleSheet.create({
        centeredView: {
            flex: 1,
            justifyContent: "center",
            alignItems: "center"
        },
        modalHeaderText: {
            fontFamily: "PromptSemiBold",
            fontSize: 16
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
        modalButtonFooter: {
            color: "white",
            fontFamily: "PromptSemiBold",
            fontSize: 15
        },
        itemContainer: {
            //flex: 1,
            flexDirection: 'row',
            alignItems: 'center',
            marginLeft: 10,
            marginTop: 10,
            height: 80,
            borderBottomWidth: 0.5,
            borderColor: "gray"
        },
        image: {
            width: 50,
            height: 50,
            borderRadius: 25,
            flex: 0.3,
            resizeMode: 'contain',
        },
        textName: {
            fontSize: 20,
            marginLeft: 10,
            fontWeight: "600",
            fontFamily: "PromptLight"
        },
        textPrecioUnitario:
        {
            fontSize: 16,
            marginLeft: 10,
            color: "gray",
            fontFamily: "PromptLight"
        },
        textPrecio: {
            flex: 0.5,
            alignItems: "flex-end",
            marginRight: 10,
            fontFamily: "PromptRegular"
        },
        BotonSgte: {
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
        BotonLimpiar: {
            alignItems: 'center',
            justifyContent: 'center',
            paddingVertical: 12,
            paddingHorizontal: 32,
            borderRadius: 4,
            elevation: 3,
            backgroundColor: '#ff5757',
            height: 60,
            marginHorizontal: 5
        },
        TextoBotonSgte: {
            fontSize: 20,
            color: 'white',
            fontFamily: "PromptMedium"
        },
        BotonAgregarQuitar: {
            alignItems: 'center',
            justifyContent: 'center',
            paddingHorizontal: 10,
            borderRadius: 4,
            elevation: 3,
            backgroundColor: '#00a8a8',
            height: 30,
            marginHorizontal: 5
        },
        TextoBotonAgregarQuitar: {
            fontSize: 25,
            lineHeight: 26,
            fontWeight: 'bold',
            color: 'white'
        },
        TextCantidad: {
            marginHorizontal: 10,
            color: "#00a8a8",
            fontSize: 16
        }
    });

    const isFocused = useIsFocused();
    const dispatch = useDispatch();
    const ProductosRedux = useSelector((state) => state.productos);
    const VentaRedux = useSelector((state) => state.Venta);

    const [contItem, setContItem] = useState(0)
    const [total, setTotal] = useState(0)
    const [loading, setLoading] = useState(false)
    const [cantidad, setCantidad] = useState("")
    const [itemProducto, setItemProducto] = useState({})

    const [modalVisible, setModalVisible] = useState(false)
    const [fontsLoaded] = useFonts({
        PromptThin: require("./../assets/fonts/Prompt-Thin.ttf"),
        PromptExtraLight: require("./../assets/fonts/Prompt-ExtraLight.ttf"),
        PromptLight: require("./../assets/fonts/Prompt-Light.ttf"),
        PromptRegular: require("./../assets/fonts/Prompt-Regular.ttf"),
        PromptMedium: require("./../assets/fonts/Prompt-Medium.ttf"),
        PromptSemiBold: require("./../assets/fonts/Prompt-SemiBold.ttf"),
    })


    useEffect(() => {
        if (route.params && route.params.Retorno) {
            //console.log(route)
            Limpiar()
        }
        if (route.params && route.params.EditarPedido) {
            //console.log("🚀 ~ file: Venta.js:168 ~ useEffect ~ route.params.EditarPedido", route.params.EditarPedido)
            cargaProductos(route.params.EditarPedido.Productos)
        }
    }, [route.params])

    useEffect(() => {
        cargaProductos()
    }, [])

    useEffect(() => {
        if (VentaRedux?.ModoVenta === "Viendo") {
            console.log("-------------VIENE DE VER UN PEDIDO EN HISTORIAL, SE RESETEA VENTA Y PRODUCTOS------------")
            dispatch(resetV())
            Limpiar()
        }

        if (VentaRedux?.ModoVenta === "EditandoPedido") {
            console.log("EditandoPedido")
            let tt = 0
            let cont = 0;
            ProductosRedux.forEach(element => {
                tt += element.Cantidad * element.Precio
                cont += parseInt(element.Cantidad)
            });
            //console.log("tt", tt)
            setContItem(cont)
            setTotal(tt)
        }


    }, [props, isFocused])

    async function cargaProductos(id_pedido = null) {
        try {
            setLoading(true)
            var RO = {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' },
                timeout: 5000
            };
            var url = REACT_APP_SV + '/api/producto/'
            console.log("🚀 ~ file: Venta.js ~ line 180 ~ cargaProductos ~ url", url)
            await fetchWithTimeout(url, RO)
                .then(response => response.json())
                .then(json => {
                    json.forEach(element => {
                        element.Cantidad = 0,
                            element.PrecioVenta = 0
                    });
                    console.log("USE EFFECT QUE SE EJECUTA 1 VEZ PARA DEJAR LOS PRODUCTOS EN 0")
                    dispatch(setProductos(json))
                    setLoading(false)
                })

        } catch (error) {
            //console.log("🚀 ~ file: Venta.js:206 ~ cargaProductos ~ error", error)
            setLoading(false)
            Alert.alert(
                "ERROR  ",
                "No se han podido cargar los productos" + error,
                [
                    {
                        text: "Cancelar",
                        onPress: () => { console.log("Cancel Pressed"); setLoading(false) },
                        style: "cancel"
                    },
                    {
                        text: "Reintentar",
                        onPress: () => cargaProductos(),
                        style: "default"
                    }
                ]
            )
        }
    }

    const agregarQuitarItem = (item, agregar) => {
        let itemProducto = cloneDeep(item)

        if (agregar) {
            setContItem(contItem + 1)
            let totalTemp = total
            totalTemp += itemProducto.Precio
            setTotal(totalTemp)
            dispatch(addItem(itemProducto))
        } else {
            setContItem(contItem - 1)
            let totalTemp = total
            totalTemp -= itemProducto.Precio
            setTotal(totalTemp)
            dispatch(removeItem(itemProducto))
        }
    }

    const Siguiente = () => {
        navigation.navigate('DetalleVenta')
    }

    const Limpiar = () => {
        dispatch(resetCantidad())
        dispatch(setDcto(0))
        setTotal(0)
        setContItem(0)
        console.log("Limpia")
    }

    const ModificaCantidad = () => {
        let producto = cloneDeep(itemProducto)
        let NuevaCantidad = cloneDeep(cantidad)
        let diferenciaCantidad = NuevaCantidad - producto.Cantidad
        let totalTemp = cloneDeep(total)
        totalTemp += producto.Precio * (diferenciaCantidad)

        /* productos.forEach(element => {
            if (element._id === producto._id) {
                element.Cantidad = NuevaCantidad
            }
        }); */

        setContItem(contItem + diferenciaCantidad)
        setTotal(totalTemp)
        dispatch(updateCantidad({ _id: producto._id, Cantidad: NuevaCantidad }))
        setCantidad("")
        setModalVisible(false)
    }

    {
        if (loading || !fontsLoaded) {

            return (
                Loader("Cargando Productos...")
            )
        } else {
            return (

                <View style={{ flex: 1, backgroundColor: "white" }}>
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
                                    <Text style={styles.modalHeaderText}>Cambiar Cantidad</Text>
                                    <TouchableOpacity style={{ flex: 1, alignItems: "flex-end" }} onPress={() => setModalVisible(!modalVisible)}>
                                        <Icon name="close" size={20} />
                                    </TouchableOpacity>

                                </View>

                                {/* BODY */}
                                <View style={styles.modalBody}>
                                    <View style={{ justifyContent: "center", alignItems: "center", width: "100%" }}>
                                        <Input
                                            placeholder="Cantidad"
                                            leftIcon={{ type: 'font-awesome', name: 'shopping-basket' }}
                                            onChangeText={text => { setCantidad(text) }}
                                            autoFocus={true}
                                            keyboardType='number-pad'
                                            style={{
                                                fontFamily: "PromptExtraLight",
                                                marginLeft: 10
                                            }}
                                        />
                                    </View>

                                </View>

                                {/* FOOTER */}
                                <View style={styles.modalFooter}>
                                    <View style={{ marginBottom: 10 }}>
                                        <Pressable style={styles.modalBotonAplicar} onPress={() => ModificaCantidad()}>
                                            <Text style={styles.modalButtonFooter}>Aplicar</Text>
                                        </Pressable>
                                    </View>
                                </View>



                            </View>
                        </View>


                    </Modal>
                    <View style={{ flex: 5 }}>
                        {/* <ScrollView>
                            {
                                ProductosRedux?.map((item, index) => {
                                    return (
                                        <TouchableOpacity key={index} style={styles.itemContainer} onPress={() => agregarQuitarItem(item, true)}>
                                            <Image
                                                source={require("../assets/Images/bidon.png")}
                                                style={styles.image}
                                            />
                                            <View style={{ flex: 1 }}>
                                                <Text style={styles.textName}>{item.Nombre}</Text>
                                                <Text style={styles.textPrecioUnitario}>{"$" + formatoMonedaChileno(item.Precio)}</Text>
                                            </View>

                                            <View style={styles.textPrecio}>
                                                {item.Cantidad > 0 ?
                                                    <View style={{ flexDirection: "row" }}>
                                                        <Pressable style={styles.BotonAgregarQuitar} onPress={() => agregarQuitarItem(item, false)}>
                                                            <Text style={styles.TextoBotonAgregarQuitar}>
                                                                -
                                                            </Text>
                                                        </Pressable>

                                                        <TouchableOpacity onPress={() => { setModalVisible(true); setItemProducto(item) }}>
                                                            <Text style={styles.TextCantidad}>{item.Cantidad}</Text>
                                                        </TouchableOpacity>


                                                        <Pressable style={styles.BotonAgregarQuitar} onPress={() => agregarQuitarItem(item, true)}>
                                                            <Text style={styles.TextoBotonAgregarQuitar}>
                                                                +
                                                            </Text>
                                                        </Pressable>

                                                    </View>
                                                    :
                                                    <></>
                                                }
                                            </View>

                                        </TouchableOpacity>
                                    )
                                })
                            }
                        </ScrollView> */}
                        <CarritoProductos
                            agregarQuitarItem={agregarQuitarItem}
                            setModalVisible={setModalVisible}
                            setItemProducto={setItemProducto}
                        />
                    </View>
                    <View style={{ flex: 1 }}>
                        {contItem > 1 ?
                            <Pressable style={styles.BotonSgte} onPress={() => Siguiente()} >
                                <Text style={styles.TextoBotonSgte}>{contItem + " Items ($ " + formatoMonedaChileno(total) + ")"}</Text>
                            </Pressable>
                            :
                            <Pressable disabled={contItem === 0} style={styles.BotonSgte} onPress={() => Siguiente()} >
                                <Text style={styles.TextoBotonSgte}>{contItem + " Item ($ " + formatoMonedaChileno(total) + ")"}</Text>
                            </Pressable>
                        }
                        <Pressable style={styles.BotonLimpiar} onPress={() => Limpiar()} >
                            <Text style={styles.TextoBotonSgte}>Limpiar</Text>
                        </Pressable>
                    </View>

                </View>

            );
        }
    }
}

export default RealizarPedido;


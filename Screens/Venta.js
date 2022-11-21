import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, Pressable, Alert, Modal, TextInput } from "react-native";
import { formatoMonedaChileno, fetchWithTimeout } from "../Components/util";
import Loader from "../Components/Loader";
import { REACT_APP_SV } from "@env"
import { useFonts } from 'expo-font'
import Icon from 'react-native-vector-icons/FontAwesome';
import { Input } from "@rneui/themed";
import cloneDeep from 'lodash.clonedeep';

const RealizarPedido = ({ navigation, route }) => {

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

    const [products, setProducts] = useState([])
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
            console.log(route)
            Limpiar()
        }
    }, [route.params])

    useEffect(() => {
        cargaProductos()
    }, [])

    async function cargaProductos() {
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
                        element.Cantidad = 0
                    });
                    console.log("USE EFFECT QUE SE EJECUTA 1 VEZ PARA DEJAR LOS PRODUCTOS EN 0")
                    setProducts(json)
                    setLoading(false)
                })

        } catch (error) {
            setLoading(false)
            Alert.alert(
                "ERROR  ",
                "No se han podido cargar los productos",
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
        let itemProducto = item
        let ArrayProductos = products

        //CONTADOR DE ITEMS
        if (agregar) {
            setContItem(contItem + 1)
            let totalTemp = total
            totalTemp += itemProducto.Precio
            ArrayProductos.forEach(element => {
                if (element._id === itemProducto._id) {
                    element.Cantidad += 1
                }
            })
            setProducts(ArrayProductos)
            setTotal(totalTemp)
        } else {
            setContItem(contItem - 1)
            let totalTemp = total
            totalTemp -= itemProducto.Precio
            ArrayProductos.forEach(element => {
                if (element._id === itemProducto._id) {
                    element.Cantidad -= 1
                }
            })
            setProducts(ArrayProductos)
            setTotal(totalTemp)
        }
    }

    const Siguiente = () => {
        let tmpProducts = cloneDeep(products)
        navigation.navigate('DetalleVenta', { pedido: tmpProducts })
    }

    const Limpiar = () => {
        let ArrayProductos = products
        ArrayProductos.forEach(element => {
            element.Cantidad = 0
        })
        setProducts(ArrayProductos)
        setTotal(0)
        setContItem(0)
        console.log("Limpia")
    }

    const ModificaCantidad = () => {
        let producto = { ...itemProducto }
        let productos = [...products]
        let tmpCantidad = cloneDeep(cantidad)
        let diferenciaCantidad = tmpCantidad - producto.Cantidad
        let totalTemp = cloneDeep(total)
        console.log("🚀 ~ file: Venta.js ~ line 248 ~ ModificaCantidad ~ totalTemp", totalTemp)
        totalTemp += producto.Precio * (diferenciaCantidad)

        productos.forEach(element => {
            if (element._id === producto._id) {
                element.Cantidad = tmpCantidad
            }
        });

        setContItem(contItem + diferenciaCantidad)
        setTotal(totalTemp)
        setProducts(productos)
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

                <View style={{ flex: 1 }}>
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
                        <ScrollView>
                            {
                                products.map((item, index) => {
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
                        </ScrollView>
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


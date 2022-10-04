import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, Pressable, Alert } from "react-native";
import { formatoMonedaChileno, fetchWithTimeout } from "../Components/util";

const RealizarPedido = ({ navigation, route }) => {

    const [products, setProducts] = useState([])
    const [contItem, setContItem] = useState(0)
    const [total, setTotal] = useState(0)
    const [loading, setLoading] = useState(true)

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
            var RO = {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' },
                timeout: 5000
            };
            var url = 'http://192.168.1.114:4000/api/producto/'
            await fetchWithTimeout(url, RO)
                .then(response => response.json())
                .then(json => {
                    json.forEach(element => {
                        element.Cantidad = 0
                    });
                    console.log("USE EFFECT QUE SE EJECUTA 1 VEZ PARA DEJAR LOS PRODUCTOS EN 0", json)
                    setProducts(json)
                    setLoading(false)
                })

        } catch (error) {
            setLoading(false)
            Alert.alert("ERROR", "No se han podido cargar los productos",)
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
        navigation.navigate('DetalleVenta', { pedido: products })
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

    {
        if (loading) {
            return (
                <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                    <Image source={require("./../assets/Images/spin2balls.gif")} />
                    <Text style={{ marginTop: 30, fontSize: 17 }}>Cargando Productos...</Text>
                </View>

            )
        } else {
            return (

                <View style={{ flex: 1 }}>
                    <ScrollView style={styles.scrollView}>
                        {

                            products.map((item, index) => {



                                return (
                                    <TouchableOpacity key={index} style={styles.itemContainer} onPress={() => agregarQuitarItem(item, true)}>
                                        <Image
                                            source={require("../assets/Images/bidon.png")}
                                            style={styles.image}
                                        />
                                        <View style={{ flex: 2 }}>
                                            <Text style={styles.textName}>{item.Nombre}</Text>
                                            <Text style={{ fontSize: 14, marginLeft: 10, color: "gray" }}>{"$" + formatoMonedaChileno(item.Precio)}</Text>
                                        </View>
                                        <View style={styles.textPrecio}>


                                            {item.Cantidad > 0 ?
                                                <View style={{ flexDirection: "row" }}>
                                                    <Pressable style={styles.BotonAgregarQuitar} onPress={() => agregarQuitarItem(item, false)}>
                                                        <Text style={styles.TextoBotonAgregarQuitar}>
                                                            -
                                                        </Text>
                                                    </Pressable>

                                                    <TouchableOpacity>
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
                    <View style={{ flex: 3 }}>
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

const styles = StyleSheet.create({

    itemContainer: {
        flex: 1,
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
        flex: 0.4
    },
    textName: {
        fontSize: 17,
        marginLeft: 10,
        fontWeight: "600",
    },
    textPrecio: {
        flex: 0.5,
        alignItems: "flex-end",
        marginRight: 10
    },
    scrollView: {
        maxHeight: 670,
    },
    BotonSgte: {
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
        fontSize: 16,
        lineHeight: 21,
        fontWeight: 'bold',
        letterSpacing: 0.25,
        color: 'white',
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
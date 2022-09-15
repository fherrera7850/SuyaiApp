import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, Pressable } from "react-native";
import { formatoMonedaChileno } from "../Components/util";

const RealizarPedido = ({ navigation, route }) => {

    //const [products, setProducts] = useState([])
    const [contItem, setContItem] = useState(0)
    const [pedidoNuevo, setPedidoNuevo] = useState([])
    const [total, setTotal] = useState(0)

    useEffect(() => {
        if (route.params && route.params.Retorno) {
            console.log(route)
            setContItem(0)
            setPedidoNuevo([])
            setTotal(0)
        }
    }, [route.params])


    const products = [
        { _id: "630e27835bd572652e271c04", Nombre: 'Recarga 20Lt', Precio: 2000, Cantidad: 0 },
        { _id: "630e27b55bd572652e271c06", Nombre: 'Recarga 10Lt', Precio: 1300, Cantidad: 0 },
        { _id: "630e27e55bd572652e271c08", Nombre: 'Nuevo 20Lt', Precio: 5500, Cantidad: 0 },
        { _id: "630e28175bd572652e271c0a", Nombre: 'Dispensador USB', Precio: 7000, Cantidad: 0 },
        { _id: "630e28485bd572652e271c0c", Nombre: 'Dispensador Electrico', Precio: 50000, Cantidad: 0 }
    ]

    /* const fetchFunctionState = (url, ro, state) => {
        fetch(url, ro).
            then(response => response.json()).
            then((data) => {
                if (state === "products") {
                    setProducts(Cantidad0(data))
                }
                console.log("Response json: /n", data)
            }).
            catch((e) => {
                console.log("Error setting: " + e)
            })
    } */

    /* useEffect(() => {
        var RO = {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
        };
        var url = 'http://192.168.1.114:9000/api/producto/'
        //console.log(ROProductoVenta)
        fetch(url, RO)
            .then(response => response.json())
            .then(json => {
                json.forEach(element => {
                    element.Cantidad = 0
                });
                console.log("USE EFFECT QUE SE EJECUTA 1 VEZ PARA DEJAR LOS PRODUCTOS EN 0", json)
                setProducts(json)
            })
            .catch(err => {
                console.error("ErrorD: ", err);
            })
    }, []) */

    const agregarQuitarItem = (item, agregar) => {
        //CONTADOR DE ITEMS
        if (agregar) {
            setContItem(contItem + 1)
        } else {
            setContItem(contItem - 1)
        }

        //CARRO VACIO AGREGA PRIMER OBJETO AL ARRAY
        if (pedidoNuevo.length === 0) {
            if (agregar) {
                item.Cantidad += 1
            } else {
                item.Cantidad -= 1
                //pedidoNuevo.splice(pedidoNuevo.findIndex(x => x.cantidad === 0), 1);
            }
            setTotal(item.Precio)
            console.log("set total (sin items)", item.Precio)

            setPedidoNuevo(pedidoNuevo.concat(item))
        } else {
            //CARRO CON MISMO PRODUCTO, ACTUALIZA SOLO CANTIDAD y VALOR TOTAL
            var repetido = false
            pedidoNuevo.forEach(element => {
                if (element._id === item._id) {
                    if (agregar) {
                        element.Cantidad += 1
                        element.Precio += item.Precio
                    } else {
                        element.Cantidad -= 1
                        element.Precio -= item.Precio
                        //pedidoNuevo.splice(pedidoNuevo.findIndex(x => x.cantidad === 0), 1);
                    }

                    setPedidoNuevo(pedidoNuevo)
                    repetido = true
                    var totalTemp = 0
                    pedidoNuevo.forEach(element => {
                        totalTemp += element.Precio
                    });
                    setTotal(totalTemp)
                    console.log("set total (ya hay elementos en el carro)", totalTemp)
                    console.log(products)

                }
            });
            //SE AGREGA NUEVO ITEM
            if (!repetido) {
                if (agregar) {
                    item.Cantidad += 1
                } else {
                    item.Cantidad -= 1
                    //pedidoNuevo.splice(pedidoNuevo.findIndex(x => x.cantidad === 0), 1);
                }
                var TempPedido = pedidoNuevo.concat(item)
                setPedidoNuevo(TempPedido)
                var totalTemp = 0
                TempPedido.forEach(element => {
                    totalTemp += element.Precio
                });
                console.log("set total (ya hay elementos en el carro)", totalTemp)
                setTotal(totalTemp)

            }
            //CALCULA TOTAL
            /* var totalTemp = 0
            pedidoNuevo.forEach(element => {
                totalTemp += element.Precio
            });
            setTotal(totalTemp) */
        }
    }

    const Cantidad0 = (json) => {
        let productos = json.forEach(element => {
            element.Cantidad = 0
        })
        return productos
    }

    const Limpiar = () => {

        /* var ro = {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
        } */


        //fetchFunctionState("http://192.168.1.114:9000/api/producto/", ro, "products")
        var RO = {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
        };
        var url = 'http://192.168.1.114:9000/api/producto/'
        //console.log(ROProductoVenta)
        fetch(url, RO)
            .then(response => response.json())
            .then(json => {
                json.forEach(element => {
                    element.Cantidad = 0
                });
                //console.log(json)
                setProducts(json)
                setPedidoNuevo([])
                setTotal(0)
                setContItem(0)

            })
            .catch(err => {
                console.error("Error: ", err);
            })
        console.log("Limpia")
    }

    return (
        <View style={{ flex: 1 }}>
            <ScrollView style={styles.scrollView}>
                {
                    products.map((item, index) => {

                        pedidoNuevo.forEach(element => {
                            if (element._id === item._id) {
                                item.Cantidad = element.Cantidad
                            }
                        });

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
                    <Pressable style={styles.BotonSgte} onPress={() => navigation.navigate('DetalleVenta', { pedido: pedidoNuevo })} >
                        <Text style={styles.TextoBotonSgte}>{contItem + " Items ($ " + formatoMonedaChileno(total) + ")"}</Text>
                    </Pressable>
                    :
                    <Pressable disabled={contItem === 0} style={styles.BotonSgte} onPress={() => navigation.navigate('DetalleVenta', { pedido: pedidoNuevo })} >
                        <Text style={styles.TextoBotonSgte}>{contItem + " Item ($ " + formatoMonedaChileno(total) + ")"}</Text>
                    </Pressable>
                }
                <Pressable style={styles.BotonLimpiar} onPress={() => {
                    setPedidoNuevo([]);
                    setTotal(0);
                    setContItem(0)
                }} >
                    <Text style={styles.TextoBotonSgte}>Limpiar</Text>
                </Pressable>
            </View>

        </View>

    );
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
import { View, Text, StyleSheet, Pressable, Alert, TouchableOpacity } from 'react-native'
import React, { useState } from 'react'
import { ButtonGroup } from "@rneui/themed";
import { formatoMonedaChileno } from "../Components/util";

const DetallePedido = ({ navigation, route }) => {

    const [selectedIndex, setSelectedIndex] = useState(0);

    const Pedido = route.params.pedido.filter((x) => {
        return x.Cantidad > 0;
    });

    let totalTemp = 0;
    Pedido.forEach(element => {
        totalTemp += (element.Precio * element.Cantidad)
    });

    const PrecioTotal = totalTemp
    const CantidadTotal = Pedido.reduce((acc, o) => acc + parseInt(o.Cantidad), 0)

    const IngresaVenta = () => {
        var fecha = new Date()
        //console.log(fecha)
        const ROVenta = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                Venta: {
                    MedioPago: selectedIndex,
                    PrecioTotalVenta: PrecioTotal,
                    Cliente_id: "1",
                    Fecha: fecha,
                    Dcto: 0
                },
                ProductosVenta: Pedido
            })
        };

        fetch('http://192.168.1.114:4000/api/venta/', ROVenta)
            .then(response => {
                console.log("response.status", response.status)
                if (response.status === 200) {
                    console.log("RESULTADO INSERCION VENTA: ", JSON.stringify(response))
                    navigation.navigate("VentaOk", { MontoVenta: PrecioTotal })
                }
                else {
                    throw new Error("Error")
                }
            })
            /* .then(json => {
                console.log("RESULTADO INSERCION VENTA: ", json)
                navigation.navigate("VentaOk", { MontoVenta: PrecioTotal })
            }) */
            .catch(err => {
                Alert.alert("Error: ", err.toString());
            })
    }



    return (
        <View style={styles.ViewPrincipal}>
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
            <View style={{ flex: 1, alignItems: "flex-end", marginRight: 10 }}>
                <View style={{ flexDirection: "row" }}>
                    <Text style={{ fontSize: 25 }}>TOTAL:</Text>
                    <Text style={{ fontWeight: "bold", fontSize: 25, marginLeft: 5 }}>{"$ " + formatoMonedaChileno(PrecioTotal)}</Text>
                </View>
                <View style={{ flexDirection: "row" }}>
                    <TouchableOpacity onPress={() => { }}>
                        <Text style={{ fontSize: 20, textDecorationLine: 'underline', color: "#00a8a8" }}>Dar Descuento</Text>
                    </TouchableOpacity>
                </View>
            </View>
            <View style={{ flex: 2 }}>
                <ButtonGroup
                    buttons={['EFECTIVO', 'TRANSFERENCIA', 'TARJETA']}
                    selectedIndex={selectedIndex}
                    onPress={(value) => {
                        setSelectedIndex(value);
                    }}
                    containerStyle={{ marginBottom: 20, borderColor: "#00a8a8" }}
                />
            </View>
            <View style={{ flex: 2, justifyContent: "center", alignItems: "center" }}>

            </View>
            <View style={{ flex: 2, justifyContent: "center", alignItems: "center" }}>
                <Pressable style={styles.BotonFinalizar} onPress={() => IngresaVenta()} >
                    <Text style={styles.TextoFinalizar}>Finalizar</Text>
                </Pressable>
            </View>
        </View>
    )
}

export default DetallePedido

const styles = StyleSheet.create({

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
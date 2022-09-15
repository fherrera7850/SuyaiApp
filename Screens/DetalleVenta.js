import { View, Text, StyleSheet, Pressable } from 'react-native'
import React, { useState } from 'react'
import { ButtonGroup } from "@rneui/themed";
import { formatoMonedaChileno } from "../Components/util";

const DetallePedido = ({ navigation, route }) => {

    const Pedido = route.params.pedido.filter((x) => {
        return x.Cantidad > 0;
    });

    const PrecioTotal = Pedido.reduce((acc, o) => acc + parseInt(o.Precio), 0)
    const CantidadTotal = Pedido.reduce((acc, o) => acc + parseInt(o.Cantidad), 0)

    const IngresaVenta = () => {
        // POST request using fetch inside useEffect React hook
        var fecha = new Date()
        console.log(fecha)
        const ROVenta = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                MedioPago: selectedIndex,
                PrecioTotalVenta: PrecioTotal,
                Cliente_id: "630e0d765bd572652e271bf3",
                Fecha: fecha
            })
        };

        fetch('http://192.168.1.114:9000/api/venta/', ROVenta)
            .then(response => response.json())
            .then(json => {
                console.log(json)
                Pedido.forEach(element => {
                    var ROProductoVenta = {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            Venta_id: json._id,
                            Producto_id: element._id,
                            Cantidad: element.Cantidad,
                            PrecioVentaProducto: (element.Precio / element.Cantidad)
                        })
                    };
                    //console.log(ROProductoVenta)
                    fetch('http://192.168.1.114:9000/api/productoventa/', ROProductoVenta)
                        .then(response => response.json())
                        .then(json => {
                            console.log(json)
                        })
                        .catch(err => {
                            console.error("Error: ", err);
                        })
                });
                navigation.navigate("VentaOk", { MontoVenta: PrecioTotal })
            })
            .catch(err => {
                console.error("Error: ", err);
            })
    }

    const [selectedIndex, setSelectedIndex] = useState(0);


    console.log(Pedido, PrecioTotal, CantidadTotal)



    return (
        <View style={styles.ViewPrincipal}>
            {
                Pedido.map((item, index) => {
                    var precioUnitario = item.Precio / item.Cantidad
                    return (
                        <View key={item._id} style={styles.ViewItem}>

                            <View style={{ flex: 1 }}>
                                <Text style={styles.TextCantidad}>{item.Cantidad + " x "}</Text>
                            </View>

                            <View style={{ flex: 2 }}>
                                <Text style={styles.TextNombre}>{item.Nombre}</Text>
                                <Text style={styles.TextPrecioUnitario}>{"$ " + formatoMonedaChileno(precioUnitario)}</Text>
                            </View>
                            <View style={{ flex: 1, alignItems: "flex-end" }}>
                                <Text style={styles.TextPrecioSubtotal}>{formatoMonedaChileno(item.Precio)}</Text>
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
            </View>
            <View style={{ flex: 4 }}>
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
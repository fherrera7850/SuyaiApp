import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, Button } from "react-native";
import { formatoMonedaChileno, formatDateString } from "../Components/util";
import { useIsFocused } from "@react-navigation/native";

const Historial = ({ props }) => {

    const isFocused = useIsFocused();
    const [Ventas, SetVentas] = useState([])

    useEffect(() => {
        var RO = {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
        };
        //console.log(ROProductoVenta)
        fetch('http://192.168.1.114:9000/api/ventaspordia/', RO)
            .then(response => response.json())
            .then(json => {
                console.log(json)
                SetVentas(json)
            })
            .catch(err => {
                console.error("Error: ", err);
            })
    }, [props, isFocused])

    const encabezado = (FechaTitulo, NroVentasDia, SumaVentasDia) => {
        return (
            <View>
                <Text style={styles.textName}>{FechaTitulo}</Text>
                <Text>{NroVentasDia + " Ventas - Total: $ " + formatoMonedaChileno(SumaVentasDia)}</Text>
            </View>
        )
    }


    return (
        <View>
            <ScrollView style={styles.scrollView}>

                {Ventas.map((item, index) => {
                    //console.log(item)

                    var FechaHoy = new Date()
                    var FechaAyer = new Date()
                    FechaAyer.setDate(FechaAyer.getDate() - 1)
                    var FechaVenta = new Date(item.FechaVenta)
                    var FechaTitulo = ""

                    if (FechaHoy.toLocaleDateString() === FechaVenta.toLocaleDateString()) {
                        FechaTitulo = "Hoy"
                    }
                    else if (FechaAyer.toLocaleDateString() === FechaVenta.toLocaleDateString()) {
                        FechaTitulo = "Ayer"
                    } else {
                        FechaTitulo = formatDateString(FechaVenta, true);
                    }

                    console.log(FechaTitulo)
                    return (
                        <View key={index}>
                            {encabezado(FechaTitulo, item.NroVentas, item.SumaVentas)}
                            {item.Ventas.map((item2, index2) => {
                                return (
                                    <View key={index2}>
                                        <TouchableOpacity style={styles.itemContainer} onPress={() => { }}>
                                            <View style={{ flex: 2 }}>
                                                <Text style={styles.textName}>$ {formatoMonedaChileno(item2.PrecioTotalVenta, true)}</Text>
                                                <View style={{ flexDirection: "row" }}>
                                                    <Text style={styles.textName}>Cliente: </Text>
                                                    <Text style={{ fontSize: 17 }}>{item2.Cliente_id.Nombre}</Text>
                                                </View>
                                            </View>
                                            <View style={styles.textPrecio}>
                                                <Text>{FechaVenta.getHours() + ":" + FechaVenta.getMinutes()}</Text>
                                            </View>
                                        </TouchableOpacity>
                                    </View>
                                )
                            })}
                        </View>
                    )
                })}

                {/* 

                <Text style={styles.textName}>Ayer</Text>
                <Text>2 Ventas - Total: $87.000</Text>




                <TouchableOpacity style={styles.itemContainer} onPress={() => { }}>
                    <View style={{ flex: 2 }}>
                        <Text style={styles.textName}>$47.000</Text>
                        <View style={{ flexDirection: "row" }}>
                            <Text style={styles.textName}>Cliente: </Text>
                            <Text style={{ fontSize: 17 }}>Carlos Muñoz</Text>
                        </View>
                    </View>
                    <View style={styles.textPrecio}>
                        <Text>19:38</Text>
                    </View>
                </TouchableOpacity>
                <Text style={styles.textFecha}>Ayer</Text>
                <Text>2 Ventas - Total: $87.000</Text>
                <TouchableOpacity style={styles.itemContainer} onPress={() => { }}>
                    <View style={{ flex: 2 }}>
                        <Text style={styles.textName}>$40.000</Text>
                        <View style={{ flexDirection: "row" }}>
                            <Text style={styles.textName}>Cliente: </Text>
                            <Text style={{ fontSize: 17 }}>Juan Perez</Text>
                        </View>
                    </View>
                    <View style={styles.textPrecio}>
                        <Text>20:20</Text>
                    </View>

                </TouchableOpacity>
                <TouchableOpacity style={styles.itemContainer} onPress={() => { }}>
                    <View style={{ flex: 2 }}>
                        <Text style={styles.textName}>$47.000</Text>
                        <View style={{ flexDirection: "row" }}>
                            <Text style={styles.textName}>Cliente: </Text>
                            <Text style={{ fontSize: 17 }}>Carlos Muñoz</Text>
                        </View>
                    </View>
                    <View style={styles.textPrecio}>
                        <Text>19:38</Text>
                    </View>
                </TouchableOpacity> */}
            </ScrollView>

        </View>

    );
}

export default Historial;

const styles = StyleSheet.create({

    itemContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        marginLeft: 10,
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
        fontWeight: "600",
    },
    textFecha: {
        fontSize: 17,
        fontWeight: "600",
        marginTop: 10
    },
    textPrecio: {
        flex: 0.5,
        alignItems: "flex-end",
        marginRight: 10
    },
    textEmail: {
        fontSize: 14,
        marginLeft: 10,
        color: "grey",
    },
    scrollView: {
        margin: 20
    },
    BotonItems: {
        backgroundColor: "green"
    }
});
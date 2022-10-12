import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, Button, Alert } from "react-native";
import { formatoMonedaChileno, formatDateString, fetchWithTimeout } from "../Components/util";
import Loader from "../Components/Loader";
import { useIsFocused } from "@react-navigation/native";
import { REACT_APP_SV } from "@env"
import moment from "moment";

const Historial = ({ props }) => {

    const isFocused = useIsFocused();
    const [Ventas, SetVentas] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        var RO = {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
            timeout: 5000
        };

        /* let date = new Date().toUTCString();
        console.log("UTC Now Date: " + date); // UTC Date: Thu, 27 Jun 2019 07:50:46 GMT

        let localDate = moment(date).local(true).format("YYYY-MM-DD HH:mm:ss");
        console.log("Moment Local Date: " + localDate); // Moment Local Date: 2019-06-27 13:20:46 */

        cargaVentas(REACT_APP_SV + '/api/venta/Historial', RO)

    }, [props, isFocused])

    const horaCliente = (date) => {
        let dateUTC = new Date(date).toUTCString()
        let fecha = moment(dateUTC).local(true).format("YYYY-MM-DD HH:mm:ss")
        //console.log("🚀horaCliente", fecha)
        return fecha
    }

    const cargaVentas = async (url, RO) => {
        try {
            await fetchWithTimeout(url, RO)
                .then(response => response.json())
                .then(json => {
                    //console.log(json)
                    if (!json.ErrorMessage) {
                        SetVentas(json)
                    }
                    setLoading(false)
                })
                /* .catch((e)=>{
                    console.log(e)
                }) */
        } catch (error) {
            setLoading(false)
            Alert.alert("ERROR", "No se ha podido cargar el historial ", error.toString())
        }

    }

    const encabezado = (FechaTitulo, NroVentasDia, SumaVentasDia) => {
        return (
            <View>
                <Text style={styles.textName}>{FechaTitulo}</Text>
                <Text>{NroVentasDia + " Ventas - Total: $ " + formatoMonedaChileno(SumaVentasDia)}</Text>
            </View>
        )
    }

    {
        if (loading) {

            return (
                Loader("Recuperando Ventas...")
            )
        } else if (Ventas.length === 0) {
            return (
                <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                    <Text>No hay ventas para mostrar</Text>
                </View>
            )
        }
        else {
            return (
                <View>
                    <ScrollView style={styles.scrollView}>

                        {Ventas.map((item, index) => {

                            let FechaHoy = moment(horaCliente(new Date())).format("YYYYMMDD")
                            let FechaAyer = moment(horaCliente(new Date().setDate(new Date().getDate() - 1))).format("YYYYMMDD")
                            var FechaVenta = moment(item.FechaVenta).format("YYYYMMDD")

                            var FechaTitulo = ""

                            if (FechaHoy === FechaVenta) {
                                FechaTitulo = "Hoy"
                            }
                            else if (FechaAyer === FechaVenta) {
                                FechaTitulo = "Ayer"
                            } else {
                                FechaTitulo = formatDateString(moment(FechaVenta).format("YYYY-MM-DD"), true);
                                console.log("🚀 ~ file: Historial.js ~ line 106 ~ {Ventas.map ~ FechaVenta", FechaVenta)
                            }
                            /* console.log("FechaVenta", new Date(item.FechaVenta))
                            console.log("FechaTitulo", FechaTitulo) */
                            return (
                                <View key={index}>
                                    {encabezado(FechaTitulo, item.NroVentas, item.SumaVentas)}
                                    {item.Ventas.map((item2, index2) => {

                                        let hora = moment(item2.Fecha).format("HH:mm")
                                        /* console.log("🚀 ~ file: Historial.js ~ line 111 ~ {item.Ventas.map ~ horaOriginal BD", horaOriginal)
                                        console.log("🚀 ~ file: Historial.js ~ line 110 ~ {item.Ventas.map ~ hora", hora)
                                        console.log("🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀") */

                                        return (
                                            <View key={index2}>
                                                <TouchableOpacity style={styles.itemContainer} onPress={() => { }}>
                                                    <View style={{ flex: 2 }}>
                                                        <Text style={styles.textName}>$ {formatoMonedaChileno(item2.PrecioTotalVenta, true)}</Text>
                                                        <View style={{ flexDirection: "row" }}>
                                                            <Text style={styles.textName}>Cliente: </Text>
                                                            <Text style={{ fontSize: 17 }}>{item2.Cliente}</Text>
                                                        </View>
                                                    </View>
                                                    <View style={styles.textPrecio}>
                                                        <Text>{hora}</Text>
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
    }

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
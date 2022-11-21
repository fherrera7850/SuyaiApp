import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from "react-native";
import { formatoMonedaChileno, formatDateString, fetchWithTimeout } from "../Components/util";
import Loader from "../Components/Loader";
import { useIsFocused } from "@react-navigation/native";
import { REACT_APP_SV } from "@env"
import moment from "moment";
import { useFonts } from 'expo-font'
import Icon from 'react-native-vector-icons/FontAwesome'

const Historial = ({ props }) => {

    const isFocused = useIsFocused();
    const [Ventas, SetVentas] = useState([])
    const [loading, setLoading] = useState(true)
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
        setLoading(true)
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
                <Text style={styles.textFecha}>{FechaTitulo}</Text>
                <Text style={styles.textResumen}>{NroVentasDia + " Ventas - Total: $ " + formatoMonedaChileno(SumaVentasDia)}</Text>
            </View>
        )
    }

    {
        if (loading || !fontsLoaded) {

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
                    {/* <Button onPress={() => setModalVisible(true)} title={"Modal"} />

                    <ModalComp modalVisible={modalVisible}>
                        <Text>alsdjaljhfjkdsfksd</Text>
                    </ModalComp> */}

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
                                //FechaTitulo = moment(FechaVenta).format("YYYY-MM-DD")
                                //console.log("🚀 ~ file: Historial.js ~ line 114 ~ {Ventas.map ~ moment(FechaVenta).format(YYYY-MM-DD)", moment(FechaVenta).format("YYYY-MM-DD"))
                            }

                            return (
                                <View key={index}>
                                    {encabezado(FechaTitulo, item.NroVentas, item.SumaVentas)}
                                    {item.Ventas.map((item2, index2) => {

                                        let hora = moment(item2.Fecha).format("HH:mm")
                                        //console.log("🚀 ~ file: Historial.js ~ line 121 ~ obs ~ item", item)
                                        const obs = () => {
                                            if (item2.Observacion) {
                                                return (<View style={{ flexDirection: "row" }}>
                                                    <Text style={styles.textObs}>Obs:</Text>
                                                    <Text style={styles.textObs}>{item2.Observacion}</Text>
                                                </View>)
                                            } else {
                                                return (<></>)
                                            }
                                        }

                                        const IconoMedioPago = () => {
                                            switch (item2.MedioPago) {
                                                case 0:
                                                    return (<Icon name="money" size={18} style={{ alignSelf: "center", marginLeft: 7 }} />);
                                                case 1:
                                                    return (<Icon name="mobile-phone" size={24} style={{ alignSelf: "center", marginLeft: 7 }} />);
                                                case 2:
                                                    return (<Icon name="credit-card" size={16} style={{ alignSelf: "center", marginLeft: 7 }} />);
                                            }
                                        }

                                        return (
                                            <View key={index2}>
                                                <View>
                                                    <TouchableOpacity style={styles.itemContainer} onPress={() => { }}>
                                                        <View style={{ flex: 2 }}>

                                                            <View style={{ flexDirection: "row" }}>
                                                                <Text style={styles.textMontoVentaUnitaria}>$ {formatoMonedaChileno(item2.PrecioTotalVenta, true)}</Text>
                                                                {IconoMedioPago()}
                                                            </View>

                                                            <Text style={styles.textCliente}>{item2.CantidadItems + " items"}</Text>
                                                            {item2.Cliente ?
                                                                <View style={{ flexDirection: "row" }}>
                                                                    <Text style={styles.textCliente}>Cliente: </Text>
                                                                    <Text style={styles.textCliente}>{item2.Cliente}</Text>
                                                                </View> :
                                                                <></>}
                                                            {obs()}
                                                        </View>
                                                        <View style={styles.textPrecio}>
                                                            <Text style={{ fontFamily: "PromptLight" }}>{hora}</Text>
                                                        </View>
                                                    </TouchableOpacity>
                                                </View>

                                            </View>
                                        )
                                    })}
                                </View>
                            )
                        })}


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
        borderBottomWidth: 0.5,
        borderColor: "gray",
        marginLeft: 10,
        height: 90
    },
    image: {
        width: 50,
        height: 50,
        borderRadius: 25,
        flex: 0.4
    },
    textFecha: {
        fontSize: 21,
        //fontWeight: "600",
        fontFamily: "PromptMedium"
    },
    textResumen: {
        fontSize: 13,
        //fontWeight: "600",
        fontFamily: "PromptExtraLight"
    },
    textMontoVentaUnitaria: {
        fontSize: 20,
        //fontWeight: "600",
        fontFamily: "PromptRegular"
    },
    textCliente: {
        fontSize: 16,
        //fontWeight: "600",
        fontFamily: "PromptLight"
    },
    textObs: {
        fontSize: 13,
        fontFamily: "PromptExtraLight"
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
import { View, Text, StyleSheet, ScrollView } from 'react-native'
import React from 'react'
import { formatoMonedaChileno } from '../Components/util'
import { useFonts } from 'expo-font'

const DetalleEstadistica = ({ route }) => {

    const MasVendidos = route.params.MasVendidos
    const MediosDePago = route.params.MediosDePago

    const [fontsLoaded] = useFonts({
        PromptThin: require("./../assets/fonts/Prompt-Thin.ttf"),
        PromptExtraLight: require("./../assets/fonts/Prompt-ExtraLight.ttf"),
        PromptLight: require("./../assets/fonts/Prompt-Light.ttf"),
        PromptRegular: require("./../assets/fonts/Prompt-Regular.ttf"),
        PromptMedium: require("./../assets/fonts/Prompt-Medium.ttf"),
        PromptSemiBold: require("./../assets/fonts/Prompt-SemiBold.ttf"),
    })

    if (!fontsLoaded) return null

    if (MasVendidos) return (
        <View style={styles.ViewPrincipal}>
            <View style={styles.ViewEncabezadoTabla}>
                <Text style={styles.TextEncabezadoOrden}>#</Text>
                <Text style={styles.TextEncabezadoNombre}>Nombre</Text>
                <Text style={styles.TextEncabezadoValor}>Valor</Text>
                <Text style={styles.TextEncabezadoCantidad}>Cantidad</Text>
            </View>
            <ScrollView>
                {MasVendidos.map((item, index) => {
                    return (
                        <View key={index} style={styles.ViewRowTabla}>
                            <Text style={styles.TextEncabezadoOrden}>{index + 1}</Text>
                            <Text style={styles.TextEncabezadoNombre}>{item.nombre}</Text>
                            <Text style={styles.TextEncabezadoValor}>{"$ " + formatoMonedaChileno(item.total)}</Text>
                            <Text style={styles.TextEncabezadoCantidad}>{item.cantidad}</Text>
                        </View>
                    )
                })}
            </ScrollView>
        </View>
    )

    if (MediosDePago) return (
        <View style={styles.ViewPrincipal}>
            <View style={styles.ViewEncabezadoTabla}>
                <Text style={styles.TextEncabezadoOrden}>#</Text>
                <Text style={styles.TextEncabezadoNombre}>Medio De Pago</Text>
                <Text style={styles.TextEncabezadoCantidad}>Cantidad</Text>
            </View>
            <ScrollView>
                {MediosDePago.map((item, index) => {
                    return (
                        <View key={index} style={styles.ViewRowTabla}>
                            <Text style={styles.TextEncabezadoOrden}>{index + 1}</Text>
                            <Text style={styles.TextEncabezadoNombre}>{item.mediopago}</Text>
                            <Text style={styles.TextEncabezadoCantidad}>{item.cantidad}</Text>
                        </View>
                    )
                })}
            </ScrollView>
        </View>
    )
}

export default DetalleEstadistica

const styles = StyleSheet.create({
    ViewPrincipal: {
        flex: 1,
        margin: 5,
        backgroundColor: "white"
    },
    ViewEncabezadoTabla: {
        flexDirection: "row",
        backgroundColor: "#f3f3f3",
        borderBottomWidth: 1,
        elevation: 3,
        height: 50,
        alignItems: "center",
        borderBottomColor: "grey",
        marginBottom: 10
    },
    ViewRowTabla: {
        flexDirection: "row",
        //backgroundColor: "#f3f3f3",
        //borderBottomWidth: 1,
        elevation: 1,
        height: 40,
        alignItems: "center",
        //borderBottomColor: "grey",
        marginBottom: 10
    },
    TextEncabezadoOrden: {
        flex: 0.5,
        textAlign: "left",
        color: "grey",
        fontFamily: "PromptSemiBold",
        marginLeft: 5,
        fontSize: 16
    },
    TextEncabezadoNombre: {
        flex: 2,
        textAlign: "left",
        color: "grey",
        fontFamily: "PromptSemiBold",
        fontSize: 16
    },
    TextEncabezadoValor: {
        flex: 1,
        textAlign: "left",
        color: "grey",
        fontFamily: "PromptSemiBold",
        fontSize: 16
    },
    TextEncabezadoCantidad: {
        flex: 1,
        textAlign: "right",
        color: "grey",
        fontFamily: "PromptSemiBold",
        marginRight: 5,
        fontSize: 16
    },
})
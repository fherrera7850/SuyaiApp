import { View, Text, Image, Pressable, StyleSheet } from 'react-native'
import React from 'react'
import { formatoMonedaChileno } from '../Components/util'

const VentaOk = ({ navigation, route }) => {


    const MontoVenta = route.params.MontoVenta
    console.log(MontoVenta)

    return (
        <View style={{ flex: 1 }}>
            <View style={{ flex: 4, justifyContent: "center", alignItems: "center" }}>
                <Image source={require("./../assets/Images/done.png")} style={{resizeMode: "center"}}/>
                <Text style={styles.TextoListo}>Listo!</Text>
                <Text>{"Monto Venta: $ " + formatoMonedaChileno(MontoVenta)}</Text>
            </View>
            <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                <Pressable style={styles.BotonSgte} onPress={() => navigation.navigate("Venta",{Retorno: true})}>
                    <Text style={styles.TextoBotonSgte}>Nueva Venta</Text>
                </Pressable>
            </View>
        </View>

    )
}

export default VentaOk

const styles = StyleSheet.create({
    BotonSgte: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        paddingHorizontal: 32,
        borderRadius: 4,
        elevation: 3,
        backgroundColor: '#00a8a8',
        height: 60,
        marginHorizontal: 5,
        width: "85%"
    },
    TextoBotonSgte: {
        fontSize: 16,
        lineHeight: 21,
        fontWeight: 'bold',
        letterSpacing: 0.25,
        color: 'white',
    },
    TextoListo:{
        fontSize:25,
        fontStyle: "italic"
    }
})
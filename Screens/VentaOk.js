import { View, Text, Image, Pressable, StyleSheet } from 'react-native'
import React from 'react'
import { formatoMonedaChileno } from '../Components/util'
import { useFonts } from 'expo-font'

const VentaOk = ({ navigation, route }) => {

    const MontoVenta = route.params?.MontoVenta
    const ClienteCreado = route.params?.ClienteCreado
    
    const MensajeOK = () => {
        if(MontoVenta){
            return (<Text style={styles.TextoMontoVenta}>{"Monto Venta: $ " + formatoMonedaChileno(MontoVenta)}</Text>)
        }
        if (ClienteCreado){
            console.log("🚀 ~ file: VentaOk.js ~ line 16 ~ MensajeOK ~ ClienteCreado", ClienteCreado)
            
            return(<Text style={styles.TextoMontoVenta}>Cliente Creado correctamente</Text>)
        }
    }

    console.log(MontoVenta)
    const [fontsLoaded] = useFonts({
        PromptThin: require("./../assets/fonts/Prompt-Thin.ttf"),
        PromptExtraLight: require("./../assets/fonts/Prompt-ExtraLight.ttf"),
        PromptLight: require("./../assets/fonts/Prompt-Light.ttf"),
        PromptRegular: require("./../assets/fonts/Prompt-Regular.ttf"),
        PromptMedium: require("./../assets/fonts/Prompt-Medium.ttf"),
        PromptSemiBold: require("./../assets/fonts/Prompt-SemiBold.ttf"),
    })

    if (!fontsLoaded) return null

    return (
        <View style={{ flex: 1 }}>
            <View style={{ flex: 4, justifyContent: "center", alignItems: "center" }}>
                <Image source={require("./../assets/Images/done.png")} style={{ resizeMode: "center" }} />
                <Text style={styles.TextoListo}>Listo!</Text>
                
                <MensajeOK/>
                
            </View>
            <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                <Pressable style={styles.BotonSgte} onPress={() => navigation.navigate("Venta", { Retorno: true })}>
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
        fontSize: 20,
        color: 'white',
        fontFamily: "PromptSemiBold"
    },
    TextoListo: {
        fontSize: 25,
        //fontStyle: "italic",
        fontFamily: "PromptMedium"
    },
    TextoMontoVenta:
    {
        fontSize: 20,
        fontFamily: "PromptLight"
    }
})
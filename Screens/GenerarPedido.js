import { View, Text } from 'react-native'
import React from 'react'
import MapaAutocomplete from '../Components/MapaAutocomplete'

const GenerarPedido = ({ route }) => {

    console.log(route.params?.NuevoPedido)

    const handleAddress = (direccion) => {
        console.log("🚀 ~ file: GenerarPedido.js ~ line 10 ~ handleAddress ~ direccion", direccion)
    }

    return (
        <View style={{ flex: 1 }}>
            <View style={{ flex: 1 }}>

            </View>
            <View style={{ flex: 1, maxWidth:"80%" }}>
                {/* <MapaAutocomplete handleAddress={direccion => handleAddress(direccion)} /> */}
            </View>
            <View style={{ flex: 1 }}>

            </View>

        </View>

    )
}

export default GenerarPedido
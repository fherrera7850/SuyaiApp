import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import MapView, { Marker } from 'react-native-maps'
import React, { useRef, useState } from 'react'
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import { REACT_APP_GOOGLE_API_KEY } from '@env'

import Constants from 'expo-constants'
import Icon from 'react-native-vector-icons/FontAwesome'
import { useNavigation } from '@react-navigation/native'

const SelectorDireccionCliente = ({route}) => {

    const [positionMarker, setPositionMarker] = useState({
        latitude: -33.444324,
        longitude: -70.653534
    })
    const [marker, setMarker] = useState(false)
    const [direccion, setDireccion] = useState("")
    const mapRef = useRef()
    const navigation = useNavigation()
    const Retorno = route.params?.Retorno
    console.log("🚀 ~ file: SelectorDireccionCliente.js:22 ~ SelectorDireccionCliente ~ route.params?.Retorno", route.params?.Retorno)

    const moveTo = async (pos) => {
        const camera = await mapRef.current?.getCamera()
        if (camera) {
            camera.center = pos
            mapRef.current?.animateCamera(camera, { duration: 1000 })
        }
        setMarker(true)
    }

    return (
        <View style={styles.containerMap}>
            <MapView
                ref={mapRef}
                style={{
                    width: "100%",
                    height: "100%"
                }}
                initialRegion={{
                    latitude: positionMarker.latitude,
                    longitude: positionMarker.longitude,
                    latitudeDelta: 0.06,
                    longitudeDelta: 0.04
                }}
            >
                {marker ? <Marker
                    coordinate={positionMarker}
                /> : <></>}
            </MapView>
            <View style={styles.searchContainer}>
                <GooglePlacesAutocomplete
                    placeholder='Buscar...'
                    fetchDetails
                    styles={{ textInput: styles.input }}
                    onPress={(data, details = null) => {
                        setDireccion(data.description)
                        setPositionMarker({
                            latitude: details.geometry.location.lat,
                            longitude: details.geometry.location.lng
                        });
                        moveTo({
                            latitude: details.geometry.location.lat,
                            longitude: details.geometry.location.lng
                        })
                    }}
                    query={{
                        key: REACT_APP_GOOGLE_API_KEY,
                        language: 'es',
                    }}
                />
                {marker ? <TouchableOpacity style={styles.buttonCheck} onPress={() => navigation.navigate({
                    name: Retorno,
                    params: { direccionMapa: direccion },
                    merge: true,
                })}>
                    <Icon name='check' size={25} color="#00a8a8" />
                </TouchableOpacity> : <></>}

            </View>

        </View>
    )
}

export default SelectorDireccionCliente

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "white",
        //justifyContent:"center"
    },
    containerMap: {
        flex: 1,
        backgroundColor: "#fff",
        alignItems: "center",
        justifyContent: "center",
        //borderBottomWidth: 0,
        //borderBottomColor: "lightgray",
        //maxHeight: "50%"
    },
    searchContainer: {
        position: "absolute", width: "90%", backgroundColor: "white",
        shadowColor: "black",
        shadowOffset: { width: 2, height: 2 },
        shadowOpacity: 0.5,
        shadowRadius: 4,
        elevation: 4,
        padding: 8,
        borderRadius: 8,
        top: Constants.statusBarHeight,
        flexDirection: "row"
    },
    input: {
        borderWidth: 0.5,
        borderColor: "lightgrey"
    },
    buttonCheck: {
        marginHorizontal: 10,
        justifyContent: "center",
    }
})
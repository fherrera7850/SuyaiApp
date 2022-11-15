import { View, Text, ScrollView, Image, TouchableOpacity, StyleSheet, TextInput } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import React, { useEffect, useState } from 'react'
import Icon from 'react-native-vector-icons/FontAwesome'
import { useFonts } from 'expo-font'
import { fetchWithTimeout } from '../Components/util'
import Loader from '../Components/Loader'
import { REACT_APP_SV } from "@env"

const Clientes = () => {

    const navigation = useNavigation()
    const [data, setData] = useState([])
    const [filteredData, setFilteredData] = useState([])
    const [loading, setLoading] = useState(false)
    const [pressBuscar, setPressBuscar] = useState(false)
    const [fontsLoaded] = useFonts({
        PromptThin: require("./../assets/fonts/Prompt-Thin.ttf"),
        PromptExtraLight: require("./../assets/fonts/Prompt-ExtraLight.ttf"),
        PromptLight: require("./../assets/fonts/Prompt-Light.ttf"),
        PromptRegular: require("./../assets/fonts/Prompt-Regular.ttf"),
        PromptMedium: require("./../assets/fonts/Prompt-Medium.ttf"),
        PromptSemiBold: require("./../assets/fonts/Prompt-SemiBold.ttf"),
    })



    useEffect(() => {
        navigation.setOptions({
            headerRight: () => {
                return (<View style={{ flexDirection: "row" }}>
                    <TouchableOpacity onPress={() => navigation.navigate("Cliente")}
                        style={{
                            marginRight: 15,
                            paddingRight: 12,
                        }}>
                        <Icon name='plus' size={27} color="#00a8a8" />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => setPressBuscar(true)}
                        style={{
                            marginRight: 15,
                            paddingRight: 12,
                        }}>
                        <Icon name='search' size={25} color="#00a8a8" />
                    </TouchableOpacity>

                </View>)
            },
            headerTitle: "Clientes (" + data?.length + ")",
            headerTitleStyle: {
                fontSize: 23
            }
        })
    }, [navigation,data])



    useEffect(() => {
        var url = "https://bcknodesuyai-production.up.railway.app" + '/api/cliente/'
        fetchClientes(url)
    }, [])

    const fetchClientes = async (url) => {
        try {
            setLoading(true)
            let RO = {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' },
                timeout: 5000
            }
            await fetchWithTimeout(url, RO)
                .then(response => response.json())
                .then(json => {
                    setData(json)
                    setFilteredData(json)
                    setLoading(false)
                })

        } catch (error) {
            setLoading(false)
            alert("Error al cargar los clientes")
        }
    }

    const BarraBusqueda = () => {
        if (pressBuscar) {
            return (<View style={{ margin: 5, backgroundColor: "transparent" }}>

                <TextInput
                    placeholder="Buscar..."
                    //leftIcon={{ type: 'font-awesome', name: 'search' }}
                    autoFocus={pressBuscar}
                    onChangeText={(text) => searchFilter(text)}
                    style={{
                        fontFamily: "PromptExtraLight",
                        letterSpacing: 1.2,
                        marginHorizontal: 10,
                        margin: 10,
                        fontSize: 15,
                        borderWidth: 0.5,
                        borderRadius: 30,
                        paddingLeft: 10,
                        paddingBottom: 6,
                        borderColor: "lightgrey",
                        backgroundColor: "#ffff",
                        fontSize: 23
                    }}
                />
            </View>)
        }
        else {
            return (<></>)
        }
    }

    const searchFilter = (text) => {
        if (text) {
            const newData = data.filter(item => {
                const itemData = item.nombre ? item.nombre.toUpperCase() : ''.toUpperCase()
                const textData = text.toUpperCase()
                return itemData.indexOf(textData) > -1
            })
            setFilteredData(newData)
        } else {
            setFilteredData(data)
        }
    }


    if (!fontsLoaded || loading) return Loader("Cargando Clientes...")
    return (
        <View>

            {BarraBusqueda()}
            <ScrollView>
                {
                    filteredData.map((item, index) => {
                        return (
                            <TouchableOpacity key={index} style={styles.itemContainer} onPress={() => { }}>
                                <Image
                                    source={require("./../assets/Images/user.png")}
                                    style={styles.image}
                                />
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.textName}>{item.nombre}</Text>
                                    {item.direccion?<Text style={styles.textPrecioUnitario}>{item.calle + ", " + item.comuna}</Text>:<></>}
                                </View>

                            </TouchableOpacity>
                        )
                    })
                }
            </ScrollView>
        </View>

    )
}

export default Clientes

const styles = StyleSheet.create({

    itemContainer: {
        //flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        marginLeft: 10,
        marginTop: 10,
        height: 80,
        borderBottomWidth: 0.5,
        borderColor: "gray"
    },
    image: {
        width: 50,
        height: 50,
        borderRadius: 100,
        flex: 0.3,
        resizeMode:"contain"
    },
    textName: {
        fontSize: 20,
        marginLeft: 10,
        fontWeight: "600",
        fontFamily: "PromptLight"
    },
    textPrecioUnitario:
    {
        fontSize: 16,
        marginLeft: 10,
        color: "gray",
        fontFamily: "PromptLight"
    },
    input: {
        height: 40,
        margin: 12,
        borderWidth: 1,
        padding: 10,
    },
});
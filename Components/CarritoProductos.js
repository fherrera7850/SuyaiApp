import React from 'react'
import { StyleSheet } from 'react-native'
import { Pressable, TouchableOpacity, Image, View, ScrollView, Text } from 'react-native'
import { useSelector } from 'react-redux'
import { formatoMonedaChileno } from './util'

const CarritoProductos = (props) => {

    const ProductosRedux = useSelector((state => state.productos))
    const { agregarQuitarItem, setModalVisible, setItemProducto } = props

    return (
        <ScrollView>
            {
                ProductosRedux?.map((item, index) => {
                    return (

                        <TouchableOpacity key={index} style={styles.itemContainer} onPress={() => agregarQuitarItem(item, true)}>
                            <Image
                                source={require("../assets/Images/bidon.png")}
                                style={styles.image}
                            />
                            <View style={{ flex: 1 }}>
                                <Text style={styles.textName}>{item.Nombre}</Text>
                                <Text style={styles.textPrecioUnitario}>{"$" + formatoMonedaChileno(item.Precio)}</Text>
                            </View>

                            <View style={styles.textPrecio}>
                                {item.Cantidad > 0 ?
                                    <View style={{ flexDirection: "row" }}>
                                        <Pressable style={styles.BotonAgregarQuitar} onPress={() => agregarQuitarItem(item, false)}>
                                            <Text style={styles.TextoBotonAgregarQuitar}>
                                                -
                                            </Text>
                                        </Pressable>

                                        <TouchableOpacity onPress={() => { setModalVisible(true); setItemProducto(item) }}>
                                            <Text style={styles.TextCantidad}>{item.Cantidad}</Text>
                                        </TouchableOpacity>


                                        <Pressable style={styles.BotonAgregarQuitar} onPress={() => agregarQuitarItem(item, true)}>
                                            <Text style={styles.TextoBotonAgregarQuitar}>
                                                +
                                            </Text>
                                        </Pressable>

                                    </View>
                                    :
                                    <></>
                                }
                            </View>

                        </TouchableOpacity>
                    )
                })
            }
        </ScrollView>
    )
}

export default CarritoProductos

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
        borderRadius: 25,
        flex: 0.3,
        resizeMode: 'contain',
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
    textPrecio: {
        flex: 0.5,
        alignItems: "flex-end",
        marginRight: 10,
        fontFamily: "PromptRegular"
    },
    BotonAgregarQuitar: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 10,
        borderRadius: 4,
        elevation: 3,
        backgroundColor: '#00a8a8',
        height: 30,
        marginHorizontal: 5
    },
    TextoBotonAgregarQuitar: {
        fontSize: 25,
        lineHeight: 26,
        fontWeight: 'bold',
        color: 'white'
    },
    TextCantidad: {
        marginHorizontal: 10,
        color: "#00a8a8",
        fontSize: 16
    }
})
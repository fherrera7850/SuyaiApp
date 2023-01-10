import { View, Text, StyleSheet, Pressable, Alert, TouchableOpacity, TextInput, ScrollView, Modal } from 'react-native'
import React, { useState, useEffect } from 'react'
import { ButtonGroup, Input } from "@rneui/themed";
import { formatoMonedaChileno, getUTCDate, fetchWithTimeout, formatDateString } from "../Components/util"
import Loader from "./../Components/Loader"
import { REACT_APP_SV } from "@env"
import { useFonts } from 'expo-font'
import Icon from 'react-native-vector-icons/FontAwesome'
import DropDownPicker from 'react-native-dropdown-picker'
import ReusableModal, { ModalFooter } from '../Components/ReusableModal';
import { useIsFocused } from '@react-navigation/native';
import moment from 'moment';

const DetallePedido = ({ navigation, route, props }) => {

    //HOOKS
    const [pedido, setPedido] = useState([])
    const [modalDescuentosVisible, setModalDescuentosVisible] = useState(false)
    const [modalProductoVisible, setModalProductoVisible] = useState(false)
    const [modalObservacionVisible, setModaObservacionlVisible] = useState(false)

    const [obs, setObs] = useState("")
    const [valorDcto, setValorDcto] = useState("")
    const [porcentajeDcto, setPorcentajeDcto] = useState("")
    const [loadingClientes, setLoadingClientes] = useState(false)

    const [selectedIndex, setSelectedIndex] = useState(0)
    const [habilitaDescuento, setHabilitaDescuento] = useState(false)

    const [vistaVenta, setVistaVenta] = useState(false)
    const [gananciaVenta, setGananciaVenta] = useState(0)

    const isFocused = useIsFocused();

    //DROPDOWN
    const [openDd, setOpenDd] = useState(false);
    const [valueDd, setValueDd] = useState(null);
    const [clientesDd, setClientesDd] = useState([]);
    const [filteredClientesDd, setFilteredClientesDd] = useState([]);

    const [PrecioTotal, setPrecioTotal] = useState(0)
    const [PrecioTotalDcto, setPrecioTotalDcto] = useState(0)

    const [cargandoVenta, setCargandoVenta] = useState(false)

    const [productoModificar, setProductoModificar] = useState({})
    //const [cantidadProductoModificar, setCantidadProductoModificar] = useState("")
    const [precioProductoModificar, setPrecioProductoModificar] = useState("")

    const [fontsLoaded] = useFonts({
        PromptThin: require("./../assets/fonts/Prompt-Thin.ttf"),
        PromptExtraLight: require("./../assets/fonts/Prompt-ExtraLight.ttf"),
        PromptLight: require("./../assets/fonts/Prompt-Light.ttf"),
        PromptRegular: require("./../assets/fonts/Prompt-Regular.ttf"),
        PromptMedium: require("./../assets/fonts/Prompt-Medium.ttf"),
        PromptSemiBold: require("./../assets/fonts/Prompt-SemiBold.ttf"),
    })

    //FUNCIONES

    useEffect(() => {

        //OPERACIONES
        CargaClientes()

        let TempPedido = []
        if (route.params.pedido) {
            TempPedido = route.params.pedido.filter((x) => {
                return x.Cantidad > 0;
            });
            setPedido(TempPedido)
            console.log("🚀 ~ file: DetalleVenta.js:78 ~ useEffect ~ TempPedido", TempPedido)
            let totalTemp = 0;
            TempPedido.forEach(element => {
                totalTemp += (element.Precio * element.Cantidad)
            });
            setPrecioTotal(totalTemp)
        }
        else if (route.params.VentaHistorial) {
            console.log("🚀 ~ file: DetalleVenta.js:23 ~ DetallePedido ~ route.params.VentaHistorial", route.params.VentaHistorial)
            cargaVentaHistorial(route.params.VentaHistorial)
            setVistaVenta(true)
        }



        //Carga clientes luego setea 



    }, [props, isFocused])

    useEffect(() => {
        if (vistaVenta)
            navigation.setOptions({
                headerTitle: `Detalle Venta N°${pedido[0]?._idv}`
            })
    }, [navigation, pedido])

    const CargaClientes = async () => {
        const ROCliente = {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
            timeout: 5000
        };

        await fetchWithTimeout(REACT_APP_SV + '/api/cliente/', ROCliente)
            .then(response => response.json())
            .then(json => {
                setClientesDd(json)
                setFilteredClientesDd(json)
                console.log("🚀 ~ file: DetalleVenta.js ~ line 81 ~ CargaClientes ~ json")
            })
            .catch(err => {
                Alert.alert("Error: ", "No se han podido cargar los clientes");
            })
            .finally(() => {

            })
    }

    const cargaVentaHistorial = async (_id) => {
        const ROVenta = {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
            timeout: 5000
        };

        await fetchWithTimeout(REACT_APP_SV + `/api/venta/${_id}`, ROVenta)
            .then(response => response.json())
            .then(json => {
                setPedido(json)
                setPrecioTotal(json[0].PrecioTotalVenta)
                setValueDd(json[0].Cliente_id)
                let costo = 0
                json.forEach(e => {
                    costo += e.Costo * e.Cantidad
                });
                setGananciaVenta(json[0].PrecioTotalVenta - costo)
            })

            .catch(err => {
                Alert.alert("Error: ", "No se ha podido cargar la venta");
            })
    }

    const handlePressDdCliente = (props) => {
        props.onPress(props);
        setValueDd(props.item._id)
    }

    const IngresaVenta = async () => {
        setCargandoVenta(true)
        //throw new Error("Error")
        const ROVenta = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            timeout: 5000,
            body: JSON.stringify({
                Venta: {
                    MedioPago: selectedIndex,
                    PrecioTotalVenta: PrecioTotalDcto > 0 ? PrecioTotalDcto : PrecioTotal,
                    Cliente_id: valueDd,
                    Fecha: getUTCDate(),
                    Dcto: PrecioTotalDcto > 0 ? PrecioTotal - PrecioTotalDcto : 0,
                    Observacion: obs.trim() === "" ? null : obs
                },
                ProductosVenta: pedido,
                Pedido: null
            })
        };
        console.log("🚀 ~ file: DetalleVenta.js ~ line 115 ~ IngresaVenta ~ ROVenta", ROVenta)

        await fetchWithTimeout(REACT_APP_SV + '/api/venta/', ROVenta)
            .then(response => {
                if (response.status === 200) {
                    setCargandoVenta(false)
                    navigation.navigate("VentaOk", { MontoVenta: PrecioTotalDcto > 0 ? PrecioTotalDcto : PrecioTotal })
                }
                else {
                    setCargandoVenta(false)
                    throw new Error("Error")
                }
            })
            .catch(err => {
                setCargandoVenta(false)
                Alert.alert(
                    "ERROR  ",
                    "NO HA SIDO POSIBLE REGISTRAR LA VENTA",
                    [
                        {
                            text: "Cancelar",
                            onPress: () => console.log("Cancel Pressed"),
                            style: "cancel"
                        },
                        {
                            text: "Reintentar",
                            onPress: () => IngresaVenta(),
                            style: "default"
                        }
                    ]
                )
            })
    }

    const EliminaVenta = () => {

        Alert.alert(
            "Confirmación",
            "¿Desea eliminar esta venta?",
            [
                {
                    text: "Cancelar",
                    onPress: () => console.log("Cancel Pressed"),
                    style: "cancel"
                },
                {
                    text: "Eliminar",
                    onPress: async () => {
                        console.log("OK Pressed")

                        setCargandoVenta(true)
                        const RODelete = {
                            method: 'DELETE',
                            headers: { 'Content-Type': 'application/json' },
                            timeout: 5000
                        };

                        await fetchWithTimeout(REACT_APP_SV + `/api/venta/${pedido[0]?._idv}`, RODelete)
                            .then(response => {
                                if (response.status === 200) {
                                    setCargandoVenta(false)
                                    navigation.navigate("Historial")
                                }
                                else {
                                    setCargandoVenta(false)
                                    throw new Error("Error")
                                }
                            })
                            .catch(err => {
                                setCargandoVenta(false)
                                Alert.alert(
                                    "ERROR  ",
                                    "NO HA SIDO POSIBLE ELIMINAR LA VENTA",
                                    [
                                        {
                                            text: "Cancelar",
                                            onPress: () => console.log("Cancel Pressed"),
                                            style: "cancel"
                                        },
                                        {
                                            text: "Reintentar",
                                            onPress: () => EliminaVenta(),
                                            style: "default"
                                        }
                                    ]
                                )
                            })
                    }
                }
            ]
        );
    }

    const IngresaPedido = async () => {
        const NuevoPedido = {
            MedioPago: selectedIndex,
            PrecioTotalVenta: PrecioTotalDcto > 0 ? PrecioTotalDcto : PrecioTotal,
            Cliente_id: valueDd,
            Fecha: JSON.stringify(getUTCDate()),
            ValorDcto: valorDcto,
            PorcentajeDcto: porcentajeDcto,
            Observacion: obs,
            Pedido: 1,
            Productos: pedido,
        }
        navigation.navigate("GenerarPedido", { NuevoPedido: NuevoPedido })
    }

    const AplicarDcto = () => {
        if (valorDcto !== "" && valorDcto < PrecioTotal) {
            setPrecioTotalDcto(PrecioTotal - valorDcto)
        } else if (porcentajeDcto !== "" && porcentajeDcto < 100) {
            setPrecioTotalDcto(PrecioTotal * (1 - (porcentajeDcto / 100)))
        }

        setModalDescuentosVisible(false)
    }

    const PrecioAnteriorTachado = () => {
        if (PrecioTotalDcto > 0) {
            return (<View style={{ flexDirection: "row", justifyContent: 'flex-end' }}>
                <Text style={styles.TextoPrecioTotalTachado}>{"$ " + formatoMonedaChileno(PrecioTotal)}</Text>
            </View>)
        }
        else {
            return (<></>)
        }

    }

    const SeleccionaProductoModificar = (item) => {
        //Solo puede modificar si no hay dcto general aplicado
        if (PrecioTotalDcto === 0) {
            let producto = { ...item }
            setProductoModificar(producto)
            //setCantidadProductoModificar(producto.Cantidad.toString())
            setPrecioProductoModificar(producto.Precio.toString())
            setModalProductoVisible(true)
        }
    }

    const ModificarProducto = () => {
        let carro = [...pedido]
        let tmpProductoModificar = { ...productoModificar }
        let totalTemp = 0
        for (const key in carro) {
            if (carro[key]._id === tmpProductoModificar._id) {
                //carro[key].Cantidad = cantidadProductoModificar
                carro[key].Precio = precioProductoModificar
            }
            totalTemp += carro[key].Cantidad * carro[key].Precio
        }
        setPrecioTotal(totalTemp)
        setPedido(carro)
        setModalProductoVisible(false)
        setHabilitaDescuento(true)
    }

    const ValidaDescuento = () => {
        return (valorDcto.trim() === "" && porcentajeDcto.trim() === "") ||
            parseInt(porcentajeDcto, 10) >= 100 ||
            valorDcto >= PrecioTotal ||
            isNaN(valorDcto) ||
            isNaN(porcentajeDcto)
    }

    const ValidaModificarProducto = () => {
        return/*  cantidadProductoModificar.trim() === "" || */ precioProductoModificar.trim() === "" ||
            //isNaN(cantidadProductoModificar) ||
            isNaN(precioProductoModificar)
    }

    {
        if (cargandoVenta || !fontsLoaded) {
            return (Loader("Ingresando Venta..."))
        }
        else {
            return (
                /* Principal */
                <View style={{ backgroundColor: "white", flex: 1 }}>
                    <View style={styles.ViewPrincipal}>

                        {/* ReusableModal Descuentos */}
                        <ReusableModal
                            visible={modalDescuentosVisible}
                            closeModal={() => setModalDescuentosVisible(false)}
                            headerTitle={"Aplicar descuento"}
                            closeButton={true}
                        >
                            <View style={{ justifyContent: "center", alignItems: "center", width: "100%" }}>
                                <Input
                                    placeholder="Valor Fijo"
                                    leftIcon={{ type: 'font-awesome', name: 'dollar' }}
                                    onChangeText={text => { setValorDcto(text); setPorcentajeDcto("") }}
                                    autoFocus={true}
                                    keyboardType='number-pad'
                                    style={{
                                        fontFamily: "PromptExtraLight",
                                        marginLeft: 10
                                    }}
                                    value={valorDcto}
                                />
                                <Input
                                    placeholder="Porcentaje"
                                    leftIcon={{ type: 'font-awesome', name: 'percent' }}
                                    onChangeText={text => { setPorcentajeDcto(text); setValorDcto("") }}
                                    autoFocus={true}
                                    keyboardType='number-pad'
                                    style={{
                                        fontFamily: "PromptExtraLight",
                                        marginLeft: 10
                                    }}
                                    value={porcentajeDcto}
                                />
                            </View>
                            <ModalFooter>
                                <Pressable
                                    disabled={ValidaDescuento()}
                                    style={ValidaDescuento() ? styles.modalBotonAplicarDisabled : styles.modalBotonAplicar}
                                    onPress={() => AplicarDcto()}>
                                    <Text style={styles.modalButtonFooter}>Aplicar</Text>
                                </Pressable>
                            </ModalFooter>
                        </ReusableModal>

                        {/* ReusableModal Editar Producto */}
                        <ReusableModal
                            visible={modalProductoVisible}
                            closeModal={() => setModalProductoVisible(false)}
                            headerTitle={"Ítem: " + productoModificar.Nombre}
                            closeButton={true}
                        >
                            <View style={{ justifyContent: "center", alignItems: "center", width: "100%" }}>
                                <Input
                                    placeholder="Precio Unitario"
                                    leftIcon={{ type: 'font-awesome', name: 'dollar' }}
                                    onChangeText={text => { setPrecioProductoModificar(text) }}
                                    keyboardType='number-pad'
                                    style={{
                                        fontFamily: "PromptExtraLight",
                                        marginLeft: 10,
                                        fontSize: 15
                                    }}
                                    value={precioProductoModificar}
                                />
                            </View>
                            <ModalFooter>
                                <Pressable
                                    disabled={
                                        ValidaModificarProducto()
                                    }
                                    style={
                                        ValidaModificarProducto() ?
                                            styles.modalBotonAplicarDisabled :
                                            styles.modalBotonAplicar
                                    }
                                    onPress={() => ModificarProducto()}>
                                    <Text style={styles.modalButtonFooter}>Aplicar</Text>
                                </Pressable>
                            </ModalFooter>
                        </ReusableModal>

                        {/* ReusableModal Añadir Observacion */}
                        <ReusableModal
                            visible={modalObservacionVisible}
                            closeModal={() => setModaObservacionlVisible(false)}
                            headerTitle={"Añadir observación a la venta"}
                            closeButton={true}
                        >
                            <TextInput
                                placeholder="Observaciones"
                                multiline
                                leftIcon={{ type: 'font-awesome', name: 'dollar' }}
                                onChangeText={text => setObs(text)}
                                autoFocus={true}
                                style={{
                                    fontFamily: "PromptExtraLight",
                                    borderWidth: 0.2,
                                    width: "100%",
                                    height: 60,
                                    textAlign: "left",
                                    textAlignVertical: "top"
                                }}
                                value={obs}
                            />
                            <ModalFooter>
                                <Pressable
                                    style={styles.modalBotonAplicar}
                                    onPress={() => setModaObservacionlVisible(false)}>
                                    <Text style={styles.modalButtonFooter}>Aplicar</Text>
                                </Pressable>
                            </ModalFooter>
                        </ReusableModal>

                        {/* Detalle Productos */}
                        <View style={{ flex: 3 }}>
                            <ScrollView>
                                {
                                    pedido.map((item, index) => {
                                        return (
                                            <Pressable disabled={vistaVenta} key={item._id} style={styles.ViewItem} onPress={() => SeleccionaProductoModificar(item)}>

                                                <View style={{ flex: 1 }}>
                                                    <Text style={styles.TextCantidad}>{item.Cantidad + " x "}</Text>
                                                </View>

                                                <View style={{ flex: 2 }}>
                                                    <Text style={styles.TextNombre}>{item.Nombre}</Text>
                                                    <Text style={styles.TextPrecioUnitario}>{"$ " + formatoMonedaChileno(item.Precio)}</Text>
                                                </View>
                                                <View style={{ flex: 1, alignItems: "flex-end" }}>
                                                    <Text style={styles.TextPrecioSubtotal}>{formatoMonedaChileno(item.Precio * item.Cantidad)}</Text>
                                                </View>
                                            </Pressable>
                                        )
                                    })
                                }
                            </ScrollView>

                        </View>

                        {/* total*/}
                        <View style={{ flex: 1, alignItems: "flex-end", marginRight: 10 }}>

                            {PrecioAnteriorTachado()}
                            <View style={{ flexDirection: "row" }}>
                                <Text style={styles.TextPrecioTotal}>TOTAL:</Text>

                                <Text style={styles.TextPrecioTotal}>{"$ " + formatoMonedaChileno(PrecioTotalDcto === 0 ? PrecioTotal : PrecioTotalDcto)}</Text>
                            </View>
                            {/* Si es solo vista no se muestra dar descuento y añadir observacion */}
                            {vistaVenta ?
                                <>
                                    <Text style={styles.TextPrecioUnitario}>Fecha: {moment(pedido[0]?.Fecha).format("DD-MM-yyyy HH:mm")}</Text>
                                    <Text style={styles.TextPrecioUnitario}>Ganancia Venta: ${formatoMonedaChileno(gananciaVenta)}</Text>
                                </> :
                                <>
                                    <View style={{ flexDirection: "row" }}>
                                        <TouchableOpacity
                                            onPress={() => PrecioTotalDcto > 0 ? setPrecioTotalDcto(0) : setModalDescuentosVisible(true)}
                                            disabled={habilitaDescuento}>
                                            <Text style={styles.TextDcto}>{PrecioTotalDcto === 0 ? "Dar Descuento" : "Quitar Descuento"}</Text>
                                        </TouchableOpacity>

                                    </View>
                                    <View>
                                        <TouchableOpacity
                                            onPress={() => setModaObservacionlVisible(true)}>
                                            <Text style={styles.TextDcto}>Añadir Observación</Text>
                                        </TouchableOpacity>
                                    </View>
                                </>}
                        </View>

                        {/* mediopago */}
                        <View style={{ flex: 1 }}>
                            <ButtonGroup
                                disabled={vistaVenta}
                                buttons={['EFECTIVO', 'TRANSFERENCIA', 'TARJETA']}
                                selectedIndex={selectedIndex}
                                onPress={(value) => {
                                    setSelectedIndex(value);
                                }}
                                containerStyle={{
                                    marginBottom: 20,
                                    borderColor: "#00a8a8"
                                }}
                                textStyle={{
                                    fontFamily: "PromptRegular"
                                }}
                                selectedButtonStyle={{
                                    backgroundColor: "#00a8a8"
                                }}
                            />
                        </View>

                        {/* cliente */}
                        <View style={{ flex: 1 }}>
                            <DropDownPicker
                                open={openDd}
                                value={valueDd}
                                items={filteredClientesDd}
                                disabled={vistaVenta}
                                schema={{
                                    label: 'nombre',
                                    value: '_id',
                                    direccion: 'direccion'
                                }}
                                setOpen={setOpenDd}
                                setValue={setValueDd}
                                setItems={setFilteredClientesDd}
                                searchable={true}
                                searchPlaceholder="Nombre o Direccion"
                                placeholder='Seleccione Cliente...'
                                style={{
                                    borderWidth: 0.3
                                }}
                                placeholderStyle={{
                                    fontFamily: "PromptLight"
                                }}
                                textStyle={{
                                    fontFamily: "PromptLight"
                                }}
                                language="ES"
                                dropDownDirection='TOP'
                                renderListItem={(props) => {
                                    return (
                                        <TouchableOpacity
                                            onPress={() => { handlePressDdCliente(props) }}
                                            key={props.item.value}
                                            style={styles.TouchableOpDropdownCliente}>
                                            <Text style={styles.TextNombre}>{props.label}</Text>
                                            <Text style={styles.TextPrecioUnitario}>{props.item.calle + ", " + props.item.comuna}</Text>

                                        </TouchableOpacity>
                                    );
                                }}
                                loading={loadingClientes}
                                disableLocalSearch={true} // required for remote search
                                onChangeSearchText={(text) => {
                                    if (text) {
                                        // Show the loading animation
                                        setLoadingClientes(true)
                                        const newData = clientesDd.filter(item => {
                                            const itemData = `${item.nombre} ${item.direccion}` ? `${item.nombre} ${item.direccion}`.toUpperCase() : ''.toUpperCase()
                                            const textData = text.toUpperCase()
                                            return itemData.indexOf(textData) > -1
                                        })
                                        setLoadingClientes(false)
                                        setFilteredClientesDd(newData)
                                    } else {
                                        setLoadingClientes(false)
                                        setFilteredClientesDd(clientesDd)
                                    }
                                }}
                                onSelectItem={() => setFilteredClientesDd(clientesDd)}
                            />

                            {/* Si es vista no se muestra opcion de nuevo cliente */}

                            {vistaVenta ? <></> : <TouchableOpacity
                                onPress={() => navigation.navigate('Cliente', { FromDetalleVenta: true })}>
                                <Text style={styles.TextNuevoCliente}>Nuevo Cliente</Text>
                            </TouchableOpacity>}

                        </View>


                        {/* BotonesFinalizar */}
                        <View style={{ flex: 1 }}>
                            {/* Si es vista se muestra boton eliminar */}
                            {vistaVenta ? <Pressable style={styles.BotonEliminar} onPress={() => EliminaVenta()} >
                                <View style={{ flexDirection: "row" }}>
                                    <Text style={styles.TextoFinalizar}>Eliminar Venta</Text>
                                    <Icon name='trash' color={"#ffff"} size={25} style={{ alignSelf: "center", marginLeft: 10 }} />
                                </View>
                            </Pressable> :
                                <><Pressable disabled={cargandoVenta} style={styles.BotonFinalizar} onPress={() => IngresaVenta()} >
                                    <View style={{ flexDirection: "row" }}>
                                        <Text style={styles.TextoFinalizar}>Ingresar Venta</Text>
                                        <Icon name='check' color={"#ffff"} size={25} style={{ alignSelf: "center", marginLeft: 5 }} />
                                    </View>
                                </Pressable>
                                    <Pressable style={styles.BotonGenerarPedido} onPress={() => IngresaPedido()} >
                                        <View style={{ flexDirection: "row" }}>
                                            <Text style={styles.TextoFinalizar}>Generar Pedido</Text>
                                            <Icon name='send' color={"#ffff"} size={20} style={{ alignSelf: "center", marginLeft: 5 }} />
                                        </View>
                                    </Pressable></>}

                        </View>
                    </View>
                </View>
            )
        }
    }
}



export default DetallePedido

const styles = StyleSheet.create({
    modalBotonAplicar: {
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 4,
        elevation: 3,
        backgroundColor: '#00a8a8',
        padding: 10
    },
    modalBotonAplicarDisabled: {
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 4,
        elevation: 3,
        backgroundColor: '#00a8a8',
        padding: 10,
        opacity: 0.5
    },
    modalButtonFooter: {
        color: "white",
        fontFamily: "PromptSemiBold",
        fontSize: 15
    },
    textStyle: {
        color: "white",
        fontWeight: "bold",
        textAlign: "center"
    },
    ViewPrincipal: {
        margin: 15,
        flex: 1,
    },
    ViewItem: {
        flexDirection: "row",
        borderBottomWidth: 0.5,
        marginHorizontal: 10
    },
    BotonFinalizar: {
        alignItems: 'center',
        justifyContent: 'center',
        //paddingVertical: 12,
        //paddingHorizontal: 32,
        borderRadius: 4,
        elevation: 3,
        backgroundColor: '#00a8a8',
        //height: 60,
        marginHorizontal: 5
    },
    BotonGenerarPedido: {
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 7,
        borderRadius: 4,
        elevation: 3,
        backgroundColor: '#ffbd59',
        //height: 60,
        marginHorizontal: 5,
        //opacity: 0.5
    },
    BotonEliminar: {
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 4,
        elevation: 3,
        backgroundColor: '#ff5757',
        marginHorizontal: 5
    },
    TextNombre: {
        fontFamily: "PromptRegular",
        fontSize: 18,
    },
    TextPrecioUnitario: {
        fontFamily: "PromptLight",
        fontSize: 14,
        color: "gray"
    },
    TextCantidad: {
        fontFamily: "PromptMedium",
        fontSize: 20
    },
    TextPrecioSubtotal: {
        fontFamily: "PromptRegular",
        fontSize: 20
    },
    TextPrecioTotal: {
        fontSize: 25,
        fontFamily: "PromptMedium",
        marginLeft: 5
    },
    TextoPrecioTotalTachado: {
        fontFamily: "PromptMedium",
        fontSize: 25,
        marginLeft: 5,
        textDecorationLine: "line-through"
    },
    TextDcto: {
        fontSize: 16,
        textDecorationLine: 'underline',
        color: "#00a8a8",
        fontFamily: "PromptLight"
    },
    TextoFinalizar: {
        fontSize: 25,
        letterSpacing: 0.25,
        color: 'white',
        fontFamily: "PromptSemiBold"
    },
    TouchableOpDropdownCliente: {
        padding: 15,
        borderBottomWidth: 0.3,
        borderBottomColor: "lightgrey",

    },
    TextNuevoCliente: {
        fontSize: 16,
        textDecorationLine: 'underline',
        color: "#00a8a8",
        fontFamily: "PromptLight",
        alignSelf: "flex-end"
    },
})
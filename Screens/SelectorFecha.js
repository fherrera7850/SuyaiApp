import React, { useState } from "react";
import { SafeAreaView, StyleSheet, Text, View, TextInput, Pressable } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import Icon from 'react-native-vector-icons/FontAwesome';
import { formatDateString } from "../Components/util";
import { useFonts } from 'expo-font'

const SelectorFecha = ({ navigation }) => {

    const [datePickerDesde, setDatePickerDesde] = useState(false);
    const [dateDesde, setDateDesde] = useState(new Date());
    const [dateDesdeStr, setDateDesdeStr] = useState("");

    const [datePickerHasta, setDatePickerHasta] = useState(false);
    const [dateHasta, setDateHasta] = useState(new Date());
    const [dateHastaStr, setDateHastaStr] = useState(formatDateString(new Date(), true));

    const [fontsLoaded] = useFonts({
        PromptThin: require("./../assets/fonts/Prompt-Thin.ttf"),
        PromptExtraLight: require("./../assets/fonts/Prompt-ExtraLight.ttf"),
        PromptLight: require("./../assets/fonts/Prompt-Light.ttf"),
        PromptRegular: require("./../assets/fonts/Prompt-Regular.ttf"),
        PromptMedium: require("./../assets/fonts/Prompt-Medium.ttf"),
        PromptSemiBold: require("./../assets/fonts/Prompt-SemiBold.ttf"),
    })

    const showDatePickerDesde = () => {
        setDatePickerDesde(true);
    };

    const onDateSelectedDesde = (event, value) => {
        //setDatePickerDesde(Platform.OS === 'ios'); // first state update hides datetimepicker
        setDateDesde(value);
        setDateDesdeStr(formatDateString(value, true))
        setDatePickerDesde(false);
    };

    const showDatePickerHasta = () => {
        setDatePickerHasta(true);
    };

    const onDateSelectedHasta = (event, value) => {
        //setDatePickerHasta(Platform.OS === 'ios'); // first state update hides datetimepicker
        setDateHasta(value);
        setDateHastaStr(formatDateString(value, true))
        setDatePickerHasta(false);
    };

    const AplicaFiltro = () => {
        navigation.navigate("Estadisticas", { fechas: JSON.stringify({ FechaInicio: dateDesde, FechaFin: dateHasta }) })
    }

    if (!fontsLoaded) return null

    return (
        <SafeAreaView style={{ flex: 1 }}>
            <View style={styles.MainContainer}>

                <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <Pressable onPress={showDatePickerDesde}>
                        <TextInput placeholder="Desde" style={styles.InputFecha} editable={false} value={dateDesdeStr} />
                    </Pressable>
                    <Pressable onPress={() => setDateDesdeStr("")}>
                        <Icon name="close" size={25} color="#00a8a8" />
                    </Pressable>
                </View>

                <View style={{ flexDirection: "row", alignItems: "center", marginTop: 30 }}>
                    <Pressable onPress={showDatePickerHasta}>
                        <TextInput placeholder="Hasta" style={styles.InputFecha} editable={false} value={dateHastaStr} />
                    </Pressable>
                    <Pressable onPress={() => setDateHastaStr("")}>
                        <Icon name="close" size={25} color="#00a8a8" />
                    </Pressable>
                </View>



                {/* <Text style={styles.text}>Date = {dateDesde.toLocaleDateString()}</Text> */}

                {datePickerDesde && (
                    <DateTimePicker
                        value={dateDesde}
                        mode={'date'}
                        display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                        is24Hour={true}
                        onChange={onDateSelectedDesde}
                        style={styles.datePicker}
                    />
                )}

                {datePickerHasta && (
                    <DateTimePicker
                        value={dateHasta}
                        mode={'date'}
                        display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                        is24Hour={true}
                        onChange={onDateSelectedHasta}
                        style={styles.datePicker}
                    />
                )}

                {/* {!datePickerDesde && (
                    <View style={{ margin: 10 }}>
                        <Button title="Show Date Picker" color="green" onPress={showDatePickerDesde} />
                    </View>
                )} */}

                <Pressable style={styles.BotonAplicarFiltro} onPress={AplicaFiltro} >
                    <Text style={styles.TextoAplicarFiltro}>Aplicar Filtro</Text>
                </Pressable>
            </View>
        </SafeAreaView>
    );
}

export default SelectorFecha

const styles = StyleSheet.create({

    MainContainer: {
        flex: 1,
        padding: 6,
        alignItems: 'center',
        //backgroundColor: 'white'
    },
    text: {
        fontSize: 25,
        color: 'red',
        padding: 3,
        marginBottom: 10,
        textAlign: 'center'
    },
    InputFecha: {
        borderBottomWidth: 1,
        justifyContent: "center",
        width: 250,
        textAlign: 'center',
        marginTop: 20,
        fontSize: 20,
        fontFamily:"PromptRegular"
    },
    TextoTitulo: {
        fontSize: 25
    },
    BotonAplicarFiltro: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        paddingHorizontal: 32,
        borderRadius: 4,
        elevation: 3,
        backgroundColor: '#00a8a8',
        height: 60,
        marginHorizontal: 5,
        width: "90%",
        marginTop: 100
    },
    TextoAplicarFiltro: {
        fontSize: 20,
        color: 'white',
        fontFamily:"PromptSemiBold"
    },
    // Style for iOS ONLY...
    datePicker: {
        justifyContent: 'center',
        alignItems: 'flex-start',
        width: 320,
        height: 260,
        display: 'flex',
    },

});
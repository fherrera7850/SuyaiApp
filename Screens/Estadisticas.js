import { View, Text, Pressable, StyleSheet, Alert, TouchableHighlight } from 'react-native'
import React, { useEffect, useState } from 'react'
import { formatDateYYYYMMDD, formatDateString, formatoMonedaChileno } from './../Components/util'
import Loader from '../Components/Loader'
import { REACT_APP_SV } from "@env"
import { useFonts } from 'expo-font'

const Estadisticas = ({ navigation, route }) => {

  const fechas = JSON.parse(route.params.fechas)
  const [estadisticas, setEstadisticas] = useState({})
  const [loading, setLoading] = useState(false)
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
      headers: { 'Content-Type': 'application/json' }
    };

    var url = REACT_APP_SV + '/api/venta/estadisticas/' + formatDateYYYYMMDD(fechas.FechaInicio) + '/' + formatDateYYYYMMDD(fechas.FechaFin)

    fetch(url, RO)
      .then(response => response.json())
      .then(json => {
        //console.log("RESPUESTA ESTADISTICAS", json)
        if (json.length > 0) {
          console.log("🚀 ~ file: Estadisticas.js ~ line 25 ~ useEffect ~ json", json[0])
          setEstadisticas(json[0])
          setLoading(false)
        } else {
          throw new Error("Se produjo un error al obtener los datos")
        }
      })
      .catch(err => {
        setLoading(false)
        Alert.alert("ERROR", err.toString())
        console.error("Error: ", err);
      })
  }, [])

  if (!fontsLoaded || loading) return Loader("Cargando Estadísticas")

  return (
    <View style={{ flex: 1, backgroundColor: "white" }}>
      <View style={{ flex: 1, margin: 20 }}>
        <Pressable style={styles.BotonFechas} onPress={() => navigation.navigate("SelectorFecha")}>
          <Text style={styles.TextoFechas}>
            {formatDateString(fechas.FechaInicio)}
          </Text>
          <Text style={styles.TextoFechas}>
            {formatDateString(fechas.FechaFin)}
          </Text>


        </Pressable>

        <View style={{ marginTop: 15 }}>
          <Text style={styles.TextoTitulos}>Facturacion</Text>
          <Text style={styles.TextoSubtitulos}>{"$ " + formatoMonedaChileno(estadisticas.SumaVentas)}</Text>
        </View>

        <View style={{ marginTop: 15 }}>
          <Text style={styles.TextoTitulos}>Ventas</Text>
          <Text style={styles.TextoSubtitulos}>{formatoMonedaChileno(estadisticas.NroVentas)}</Text>
        </View>

        <View style={{ marginTop: 15 }}>
          <Text style={styles.TextoTitulos}>Venta Promedio</Text>
          <Text style={styles.TextoSubtitulos}>{"$ " + formatoMonedaChileno(estadisticas.PromedioVentas)}</Text>
        </View>

        <View style={{ marginTop: 15 }}>
          <Text style={styles.TextoTitulos}>Ganancia</Text>
          <Text style={styles.TextoSubtitulos}>{"$ " + formatoMonedaChileno(estadisticas.GananciaVentas)}</Text>
        </View>

        <Pressable style={{ marginTop: 15 }} onPress={() => navigation.navigate("DetalleEstadistica", { MasVendidos: estadisticas.MasVendidos })}>
          <Text style={styles.TextoTitulos}>Productos Más Vendidos</Text>
          <Text style={styles.TextoSubtitulos}>{estadisticas.MasVendidos ? "#1 " + estadisticas.MasVendidos[0].nombre : ""}</Text>
        </Pressable>

        <Pressable style={{ marginTop: 15 }} onPress={() => navigation.navigate("DetalleEstadistica", { MediosDePago: estadisticas.MediosDePago })}>
          <Text style={styles.TextoTitulos}>Medios de Pago Más Utilizados</Text>
          <Text style={styles.TextoSubtitulos}>{estadisticas.MediosDePago ? "#1 " + estadisticas.MediosDePago[0].mediopago : ""}</Text>
        </Pressable>

      </View>
    </View>
  )
}

export default Estadisticas

const styles = StyleSheet.create(
  {
    TextoFechas: {
      fontSize: 15,
      //fontWeight: "bold",
      color: "grey",
      fontFamily: "PromptRegular"
    },
    TextoTitulos: {
      fontSize: 25,
      //fontWeight: "bold",
      fontFamily: "PromptRegular"
    },
    TextoSubtitulos: {
      fontSize: 25,
      //fontWeight: "bold",
      color: "#00a8a8",
      fontFamily: "PromptRegular"
    },
    BotonFechas: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 12,
      paddingHorizontal: 32,
      borderRadius: 2,
      elevation: 1,
      height: 60,
      marginHorizontal: 20,
      marginTop: 10,
      shadowColor: "black"
    },
  }
)
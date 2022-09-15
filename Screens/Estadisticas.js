import { View, Text, Pressable, StyleSheet } from 'react-native'
import React, { useEffect, useState } from 'react'
import formatDate, { formatDateString, formatoMonedaChileno } from './../Components/util'

const Estadisticas = ({ navigation, route }) => {

  const fechas = JSON.parse(route.params.fechas)
  const [suma, setSuma] = useState(0)
  const [nroVentas, setNroVentas] = useState(0)
  console.log(fechas.FechaInicio)

  useEffect(() => {
    var RO = {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    };

    var url = 'http://192.168.1.114:9000/api/SumaVentasRangoFechas/' + formatDate(fechas.FechaInicio) + '/' + formatDate(fechas.FechaFin)

    fetch(url, RO)
      .then(response => response.json())
      .then(json => {
        console.log(json)
        if (json.length > 0) {
          setSuma(json[0].sum)
          setNroVentas(json[0].count)
        }
      })
      .catch(err => {
        console.error("Error: ", err);
      })
  }, [])

  return (
    <View style={{ flex: 1, margin: 20 }}>
      <Pressable style={styles.BotonFechas} onPress={() => navigation.navigate("SelectorFecha")}>
        <Text>
          {formatDateString(fechas.FechaInicio)}
        </Text>
        <Text>
          {formatDateString(fechas.FechaFin)}
        </Text>


      </Pressable>

      <View style={{ marginTop: 15 }}>
        <Text style={styles.TextoTitulos}>Facturacion</Text>
        <Text style={styles.TextoSubtitulos}>$ {formatoMonedaChileno(suma)}</Text>
      </View>

      <View style={{ marginTop: 15 }}>
        <Text style={styles.TextoTitulos}>Ventas</Text>
        <Text style={styles.TextoSubtitulos}>{formatoMonedaChileno(nroVentas)}</Text>
      </View>

    </View>
  )
}

export default Estadisticas

const styles = StyleSheet.create(
  {
    TextoTitulos: {
      fontSize: 25,
      fontWeight: "bold"
    },
    TextoSubtitulos: {
      fontSize: 25,
      fontWeight: "bold",
      color: "green"
    },
    BotonFechas: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 12,
      paddingHorizontal: 32,
      borderRadius: 4,
      elevation: 2,
      height: 60,
      marginHorizontal: 20,
      marginTop: 10
    },
  }
)
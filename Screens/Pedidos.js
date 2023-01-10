import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, StatusBar } from 'react-native';
import { Agenda, LocaleConfig } from 'react-native-calendars';
import { Card } from 'react-native-paper';

LocaleConfig.locales['es'] = {
  monthNames: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'],
  monthNamesShort: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sept', 'Oct', 'Nov', 'Dic'],
  dayNames: ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'],
  dayNamesShort: ['Dom', 'Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab']
};

LocaleConfig.defaultLocale = 'es';

const timeToString = (time) => {
  const date = new Date(time);
  return date.toISOString().split('T')[0];
}

const Pedidos = () => {
  const [items, setItems] = useState({});

  const loadItems = (day) => {

    setTimeout(() => {
      for (let i = -15; i < 85; i++) {
        const time = day.timestamp + i * 24 * 60 * 60 * 1000;
        const strTime = timeToString(time);

        if (!items[strTime]) {
          items[strTime] = [];

          const numItems = Math.floor(Math.random() * 3 + 1);
          for (let j = 0; j < numItems; j++) {
            items[strTime].push({
              name: 'Item for ' + strTime + ' #' + j,
              height: Math.max(10, Math.floor(Math.random() * 150)),
              day: strTime
            });
          }
        }
      }
      const newItems = {};
      
      Object.keys(items).forEach(key => {
        newItems[key] = items[key];
      });

      const eventos = {
        "2022-10-07": [
          {
            "day": "2022-10-07",
            "height": 50,
            "name": "Item for 2022-10-07 #0",
          },
          {
            "day": "2022-10-07",
            "height": 29,
            "name": "Item for 2022-10-07 #1",
          },
          {
            "day": "2022-10-07",
            "height": 25,
            "name": "Item for 2022-10-07 #2",
          },
        ],
        "2022-10-08": [
          {
            "day": "2022-10-08",
            "height": 19,
            "name": "Item for 2022-10-08 #0",
          },
        ]
      }
      
      setItems(eventos);
      //setItems(newItems);
    }, 1000);
  }

  

  const renderItem = (item) => {
    return (
      <TouchableOpacity style={styles.item}>
        <Card>
          <Card.Content>
            <View>
              <Text>{item.name}</Text>
            </View>
          </Card.Content>
        </Card>
      </TouchableOpacity>
    );
  }

  return (
    <View style={styles.container}>
      <Agenda
        items={items}
        loadItemsForMonth={loadItems}
        selected={'2022-11-22'}
        refreshControl={null}
        showClosingKnob={true}
        refreshing={false}
        renderItem={renderItem}
        firstDay={1}
      />
      <StatusBar />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  item: {
    flex: 1,
    borderRadius: 5,
    padding: 10,
    marginRight: 10,
    marginTop: 17
  },
});

export default Pedidos;
import React from 'react';
import {View, TextInput, TouchableOpacity, Text} from 'react-native';

const FormInput = ({placeholder, ...rest}) => (
  <View style={{padding: 10, margin: 5, borderWidth: 1, borderColor: '#000'}}>
    <TextInput
      {...rest}
      placeholder={placeholder}
      style={{width: 150, height: 30}}
    />
  </View>
);

const FormBtn = ({title}) => (
  <View
    style={{
      backgroundColor: '#e264e5',
      padding: 10,
      width: 170,
      height: 50,
      alignItems: 'center',
      justifyContent: 'center',
      margin: 5,
    }}>
    <TouchableOpacity>
      <Text style={{color: '#fff', fontWeight: 'bold'}}>{title}</Text>
    </TouchableOpacity>
  </View>
);

const Puntos = () => {
  // states
  const [mail, setMail] = React.useState();
  const [pwd, setPwd] = React.useState();

  return (
    <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
      <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
        <FormInput
          placeholder="Email"
          onChangeText={txt => setMail(txt)}
          value={mail}
        />
        <FormInput
          placeholder="Password"
          onChangeText={txt => setPwd(txt)}
          value={pwd}
        />
      </View>
      <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
        <FormBtn title="Register" />
        <FormBtn title="Login" />
      </View>
      <Text>{mail}</Text>
      <Text>{pwd}</Text>
    </View>
  );
};


export default Puntos;
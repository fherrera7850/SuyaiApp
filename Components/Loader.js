import React from 'react'
import { View, Text, Image } from 'react-native'

export default Loader = (msg) => {
    return (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
            <Image source={require("./../assets/Images/spin2balls.gif")} />
            <Text style={{ marginTop: 30, fontSize: 17 }}>{msg}</Text>
        </View>)
}

export const LoaderPequenito = () => {
    return (
            <Image
                //resizeMode='stretch'
                style={{
                    width: 50,
                    height: 50,
                    //resizeMode: 'stretch',
                    //alignSelf: "flex-start",
                    //paddingLeft: 12,
                    marginLeft:20
                }}
                source={require("./../assets/Images/LoaderPequenito4.gif")} />
        )
}
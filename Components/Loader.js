import React from 'react'
import { View, Text, Image } from 'react-native'

const Loader = (msg) => {
    return (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
            <Image source={require("./../assets/Images/spin2balls.gif")} />
            <Text style={{ marginTop: 30, fontSize: 17 }}>{msg}</Text>
        </View>)
}

export default Loader
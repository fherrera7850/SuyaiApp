import { StyleSheet, Modal, View, Text } from 'react-native'
import React from 'react'

export default ModalComp = (props) => {
    console.log("🚀 ~ file: Modal.js ~ line 5 ~ props", props)
    const { children } = props
    return (
        /* <Text>{children}</Text> */
        <Modal
            animationType="slide"
            transparent={true}
            visible={props.modalVisible}
            onRequestClose={() => {
                console.log("Modal has been closed.");
                modalVisible = false;
            }}
        >
            <View style={styles.centeredView}>
                <View style={styles.modalView}>
                    {children}
                </View>
            </View>
        </Modal>
    )
}

const styles = StyleSheet.create({
    centeredView: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        marginTop: 22
    },
    modalView: {
        margin: 20,
        backgroundColor: "white",
        borderRadius: 20,
        padding: 35,
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5
    },
})
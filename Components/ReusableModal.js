import { StyleSheet, View, Text, TouchableOpacity } from 'react-native'
import Icon from 'react-native-vector-icons/FontAwesome'
import React from 'react'
import Modal from "react-native-modal";

export default ReusableModal = (props) => {
    const { children, visible, closeModal, headerTitle, childrenFooter, closeButton } = props

    return (
        <Modal
            //animationType="slide"
            transparent={true}
            hasBackdrop={true}
            backdropOpacity={10}
            backdropColor={"rgba(0, 0, 0, 0.5)"}
            isVisible={visible}
            onRequestClose={() => {
                console.log("Modal has been closed.");
                //closeModal()
            }}
        >
            <View style={styles.centeredView}>
                {/* MODALVIEW */}
                <View style={styles.modalView}>

                    {/* HEADER */}
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalHeaderText}>{headerTitle}</Text>
                        {closeButton ? <TouchableOpacity style={{
                            flex: 1, alignItems: "flex-end",
                            alignSelf: "baseline" //cruz en el top
                        }} onPress={() => closeModal()}>
                            <Icon name="close" size={20} />
                        </TouchableOpacity> : <></>}


                    </View>

                    {/* BODY */}
                    <View style={styles.modalBody}>
                        <View style={
                            {
                                //justifyContent: "center", 
                                //alignItems: "center", 
                                width: "100%"
                            }}>
                            {children}
                        </View>

                    </View>

                    {/* FOOTER */}
                    {childrenFooter}
                </View>
            </View>
        </Modal>
    )
}

export const ModalFooter = (props) => {

    const { children } = props

    return (<View style={styles.modalFooter}>
        <View style={{ marginBottom: 10 }}>
            {children}
        </View>
    </View>)

}

const styles = StyleSheet.create({
    centeredView: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center"
    },
    modalHeaderText: {
        fontFamily: "PromptSemiBold",
        fontSize: 19,
        flex: 2
    },
    modalView: {
        backgroundColor: "white",
        borderRadius: 20,
        padding: 18,
        elevation: 20,
        width: "100%",
    },
    modalHeader: {
        width: "100%",
        alignItems: "flex-end",
        flexDirection: "row",
        paddingBottom: 20
    },
    modalBody: {
        /* justifyContent: "center",
        alignItems: "center", */
        //padding: 5,
    },
    modalFooter: {
        justifyContent: "center",
        alignItems: "flex-end",
        width: "100%",
        marginTop: 20
    }
})
import React, { useRef } from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import BottomSheet from '@gorhom/bottom-sheet';
import Icon from 'react-native-vector-icons/FontAwesome';

const ModalInferior = ({ openBottomSheet }) => {
  const bottomSheetRef = useRef(null);

  const openSheet = () => {
    if (bottomSheetRef.current) {
      bottomSheetRef.current.expand();
    }
  };

  return (
    <View>
      <TouchableOpacity style={styles.floatingButton} onPress={openBottomSheet}>
        <Icon name="bars" size={25} color="white" />
      </TouchableOpacity>

      <BottomSheet
        ref={bottomSheetRef}
        snapPoints={['40%']}
        index={-1}
        backgroundStyle={styles.bottomSheetBackground}
        enablePanDownToClose={true}
      >
        <View style={styles.bottomSheetContent}>
          <Text style={styles.bottomSheetText}>Hola</Text>
        </View>
      </BottomSheet>
    </View>
  );
};

const styles = {
  // Estilos aquí
};

export default ModalInferior;

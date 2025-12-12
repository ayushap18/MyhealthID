import React, { useRef } from 'react';
import { View, StyleSheet } from 'react-native';
import QRCode from 'react-native-qrcode-svg';

const QRCodeGenerator = ({ value, size = 200, logo = null }) => {
  const qrRef = useRef(null);

  return (
    <View style={styles.container}>
      <QRCode
        value={value}
        size={size}
        color="#1A237E"
        backgroundColor="#FFFFFF"
        logo={logo}
        logoSize={size * 0.2}
        logoBackgroundColor="#FFFFFF"
        logoBorderRadius={10}
        getRef={qrRef}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
});

export default QRCodeGenerator;

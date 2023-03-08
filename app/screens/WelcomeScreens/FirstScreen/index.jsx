import React from 'react'
import { Image, StyleSheet, Text, View, ToastAndroid } from 'react-native'

import AppNextButton from '../../../components/AppNextButton'

import { RFPercentage, RFValue } from 'react-native-responsive-fontsize'

import AsyncStorage from '@react-native-async-storage/async-storage';

const FirstScreen = ({ navigation }) => {

  const isLoggedIn = async () => {
    try {
      const value = await AsyncStorage.getItem('isLoggedIn')
      if(value !== null && value === 'true') {
        const userType = await AsyncStorage.getItem('userType')
        if(userType === "NGO")
          navigation.navigate('HomeNGOScreen')
        else
          navigation.navigate('HomeScreen')
      }
    } catch(e) {
      ToastAndroid.show(e.message,ToastAndroid.BOTTOM);
    }
  } 

  isLoggedIn()


  return (
    <View style={styles.container}>
      <Image source={require('../../../../assets/welcome1.png')} />
      <Text style={styles.text}>
        You have two hands one to help yourself, the second to help others.
      </Text>
      <AppNextButton onPress={() => navigation.navigate('SecondScreen')} />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'space-around',
    marginVertical: RFPercentage(10),
  },
  text: {
    fontSize: RFValue(14),
    fontWeight: 'bold',
    paddingHorizontal: RFPercentage(12),
    textAlign: 'center',
  },
})

export default FirstScreen

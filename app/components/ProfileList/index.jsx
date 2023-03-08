import React from 'react'
import { StyleSheet, Text, TouchableWithoutFeedback, ToastAndroid, View } from 'react-native'

import { RFPercentage, RFValue } from 'react-native-responsive-fontsize'

import { AntDesign } from '@expo/vector-icons'
import app from '../../../firebaseConfig'
import { getAuth, signOut } from "firebase/auth";

import AsyncStorage from '@react-native-async-storage/async-storage';

const ProfileList = ({ icon, listTitle, route, navigation, type }) => {

  const handleMenuClick = () => {
    if(type === "list1"){
      navigation.navigate(route)
      return
    }

    if(listTitle === "Log Out"){
      startLogout();
    }
  }
 

  const startLogout = async() => {

    const auth = getAuth(app);
    signOut(auth).then(() => {
      removeCache();
    }).catch((error) => {
      const errorCode = error.code;
      const errorMessage = error.message;
      ToastAndroid.show(errorMessage,ToastAndroid.BOTTOM);
      console.log(error);
    });
  }

  const removeCache = async() => {
    try {
      await AsyncStorage.setItem("isLoggedIn", "false");
      navigation.navigate('FirstScreen')
    } catch (error) {
      const errorCode = error.code;
      const errorMessage = error.message;
      ToastAndroid.show(errorMessage,ToastAndroid.BOTTOM);
      console.log(error);
    }
  }

  return (
    <TouchableWithoutFeedback onPress={() => handleMenuClick()}>
      <View style={styles.container}>
        <View style={styles.icon}>{icon}</View>
        <View style={styles.components}>
          <Text style={styles.title}>{listTitle}</Text>
          <AntDesign name='right' size={24} color='rgb(112, 112, 112)' />
        </View>
      </View>
    </TouchableWithoutFeedback>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    marginVertical: RFPercentage(1),
    width: '90%',
  },
  icon: {
    alignItems: 'center',
    backgroundColor: 'rgb(231, 255, 249)',
    borderRadius: RFValue(12),
    height: RFPercentage(8),
    justifyContent: 'center',
    marginHorizontal: RFPercentage(2),
    width: RFPercentage(8),
  },
  components: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '78%',
  },
  title: {
    color: 'rgb(112, 112, 112)',
    fontSize: RFValue(14),
  },
})

export default ProfileList

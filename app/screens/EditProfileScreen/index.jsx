import React, { useEffect, useState } from 'react'
import { Image, StyleSheet, Text, View, ToastAndroid } from 'react-native'

import AppTextInput from '../../components/AppTextInput'
import AppButton from '../../components/common/AppButton'

import { RFPercentage, RFValue } from 'react-native-responsive-fontsize'


import AsyncStorage from '@react-native-async-storage/async-storage';


import { doc, updateDoc, getFirestore } from "firebase/firestore";
import {app} from '../../../firebaseConfig'


const EditProfileScreen = () => {

  let [user, setUser] = useState({})

  let [userName, setUserName] = useState('')
  let [phone, setPhone] = useState('')

  const setUserDetail = async() => {

    try {
      const userId = await AsyncStorage.getItem("userId");
      const userName = await AsyncStorage.getItem("userName");
      const phone = await AsyncStorage.getItem("phone");
      const userType = await AsyncStorage.getItem("userType");
      const email = await AsyncStorage.getItem("email");
      const userLogo = await AsyncStorage.getItem("userLogo");

      let user = {
        userId,
        email,
        userName,
        phone,
        userType,
        userLogo
      }
      setPhone(phone)
      setUserName(userName)

      setUser(user)
    } catch(e) {
      ToastAndroid.show(e.message,ToastAndroid.BOTTOM);
    }
  }

  useEffect(() => {
    setUserDetail();
  },[])
 
  const persistUserData = async () => {
    try {
      
        await AsyncStorage.setItem("userName", userName);
        await AsyncStorage.setItem("phone", phone);

    } catch (error) {
      const errorCode = error.code;
      const errorMessage = error.message;
      ToastAndroid.show(errorMessage,ToastAndroid.BOTTOM);
      console.log(error);
    }
  }


  const updateUser = async() => {
    
    try {

      const db = getFirestore(app);

      const donationRef = doc(db, 'users', user.userId);

      setUser(user => ({
        ...user,
        userName,
        phone
      }))
  
      updateDoc(donationRef, {userName,phone})
      .then((data) => {
        persistUserData()
        ToastAndroid.show("Profile updated successfull",ToastAndroid.BOTTOM);
        
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        ToastAndroid.show(errorMessage,ToastAndroid.BOTTOM);
      })
    
    } catch(e) {
      ToastAndroid.show(e.message,ToastAndroid.BOTTOM);
    }
    

  }

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Profile</Text>
      <Image source={user.userLogo ? {uri:user.userLogo} : require('../../../assets/request.png')} style={styles.image} />
      <Text style={styles.title}>{user.userName}</Text>
      <Text style={styles.subTitle}>{user.userType === 'NGO' ? 'Non Governmental Organization' : 'Restaurant'}</Text>
     
     <View  style={{ width: '100%' }}>
          <AppTextInput placeholder={user.userName} onChangeText={(value) => setUserName(value)}/>
          <AppTextInput placeholder={user.email} enabled={false}/>
          <AppTextInput placeholder={user.phone}  onChangeText={(value) => setPhone(value)}/>
      </View>
      
      <View style={styles.button}>
        <AppButton title='Save' onPress={() => updateUser()}/>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  heading: {
    fontSize: RFValue(18),
    fontWeight: 'bold',
    marginVertical: RFPercentage(2),
  },
  image: {
    borderRadius: RFValue(50),
    height: RFPercentage(15),
    marginBottom: RFPercentage(3),
    width: RFPercentage(15),
  },
  title: {
    fontSize: RFValue(18),
    fontWeight: '500',
    marginBottom: RFPercentage(1),
    textDecorationLine: 'underline',
  },
  subTitle: {
    color: 'rgb(161, 161, 161)',
    fontSize: RFValue(14),
    marginBottom: RFPercentage(3),
  },
  button: {
    marginTop: RFPercentage(5),
  },
})

export default EditProfileScreen

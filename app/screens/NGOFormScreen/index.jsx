import React, { useState } from 'react'
import { StyleSheet, Text, TextInput, View, ToastAndroid } from 'react-native'

import AppButton from '../../components/common/AppButton'
import AppTextInput from '../../components/AppTextInput'
import ProfileButton from '../../components/common/ProfileButton'

import colors from '../../config/colors'
import { ngoForm } from '../../config/donationForm'

import { RFPercentage, RFValue } from 'react-native-responsive-fontsize'

import { getFirestore,doc, setDoc } from "firebase/firestore";
import {app} from '../../../firebaseConfig'

import AsyncStorage from '@react-native-async-storage/async-storage';

const NGOFormScreen = ({ navigation }) => {


  let [location, setLocation] = useState('')
  let [quantity, setQuantity] = useState('')
  let [desc, setDesc] = useState('')
  let [needBefore, setNeedBefore] = useState('')

  const onTextChange = (type, value) => {

    if(type === 1){
      setQuantity(value);
    } else if(type === 2){
      setLocation(value);
    } else if(type === 3){
      setNeedBefore(value);
    }else if(type === 4){
      setDesc(value);
    }
  }


  const startSubmit = async() =>{
    
    try {
      const userId = await AsyncStorage.getItem('userId')
      const userName = await AsyncStorage.getItem('userName')
      const userLogo = await AsyncStorage.getItem('userLogo')

      const phone = await AsyncStorage.getItem('phone')

      const email = await AsyncStorage.getItem('email')

      if(userId !== null) {
  

        let donationRequest = {
          userId,
          userName,
          quantity,
          location,
          desc,
          needBefore,
          userPhone : phone,
          userEmail : email,
          ts : Date.now() + ""
        }

        if(userLogo !== null)
          donationRequest.userLogo = userLogo

        uploadData(donationRequest);
      }
    } catch(e) {
      ToastAndroid.show(e.message,ToastAndroid.BOTTOM);
    }
    
  }

  const uploadData = async(data) => {

    const db = getFirestore(app);

    const donationRef = doc(db, 'donationRequests', data.ts);

    setDoc(donationRef, data)
    .then((data) => {
      ToastAndroid.show("Added to databse successfully",ToastAndroid.BOTTOM);
      navigation.navigate('HomeNGOScreen')
    })
    .catch((error) => {
      const errorCode = error.code;
      const errorMessage = error.message;
      ToastAndroid.show(errorMessage,ToastAndroid.BOTTOM);
    })
  }



  return (
    <>
      <View style={styles.container}>
        <Text style={styles.heading}>Food Details:</Text>
        {ngoForm.map((item) => (
          <View key={item.id.toString()}>
            <AppTextInput placeholder={item.placeholder} onChangeText={(value) => onTextChange(item.id, value)} />
          </View>
        ))}
        <View style={styles.description}>
          <TextInput
            editable
            multiline
            numberOfLines={4}
            style={styles.textInput}
            placeholder='Description'
            onChangeText={(value) => onTextChange(4, value)} 
          />
        </View>
        <View style={styles.button}>
          <AppButton title='Submit' onPress={() => startSubmit()} />
        </View>
      </View>
      <View style={styles.footer}>
        <ProfileButton navigation={navigation} />
      </View>
    </>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 0.9,
    marginTop: RFPercentage(2),
  },
  heading: {
    fontSize: RFValue(16),
    fontWeight: 'bold',
    margin: RFPercentage(3),
  },
  description: {
    alignItems: 'center',
  },
  textInput: {
    backgroundColor: colors.white,
    borderRadius: RFValue(12),
    marginVertical: RFPercentage(1),
    paddingBottom: RFPercentage(7),
    paddingLeft: RFPercentage(2),
    width: RFPercentage(41),
  },
  button: {
    alignItems: 'center',
    marginTop: RFPercentage(3),
  },
  footer: {
    alignItems: 'flex-end',
    justifyContent: 'flex-end',
    flex: 0.1,
    marginBottom: RFPercentage(2),
    marginRight: RFPercentage(3),
  },
})

export default NGOFormScreen

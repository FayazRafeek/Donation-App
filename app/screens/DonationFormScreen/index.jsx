import React, { useState } from 'react'
import { StyleSheet, Text, TextInput, View, ToastAndroid } from 'react-native'

import AppButton from '../../components/common/AppButton'
import AppTextInput from '../../components/AppTextInput'
import DropdownComponent from '../../components/common/DropdownComponent'
import ProfileButton from '../../components/common/ProfileButton'

import colors from '../../config/colors'
import { donationForm } from '../../config/donationForm'

import { RFPercentage, RFValue } from 'react-native-responsive-fontsize'

import { getFirestore,doc, setDoc } from "firebase/firestore";
import {app} from '../../../firebaseConfig'

import AsyncStorage from '@react-native-async-storage/async-storage';

const DonationFormScreen = ({ navigation }) => {
  const data = [
    { label: 'Yes', value: '1' },
    { label: 'No', value: '2' },
  ]


  let [itemName, setItemName] = useState('')
  let [top, setTop] = useState('')
  let [quantity, setQuantity] = useState('')
  let [address, setAddress] = useState('')
  let [utensil, setUtensils] = useState('')
  const onTextChange = (type, value) => {

    if(type === 1){
      setItemName(value);
    } else if(type === 2){
      setTop(value);
    } else if(type === 3){
      setQuantity(value);
    }else if(type === 4){
      setAddress(value);
    }
  }

  let dropChangeHandler = (value) => {
    setUtensils(value)
  }

  const startSubmit = async() =>{
    
    try {
      const userId = await AsyncStorage.getItem('userId')
      const userName = await AsyncStorage.getItem('userName')
      const userLogo = await AsyncStorage.getItem('userLogo')
      if(userId !== null) {
      
        if(utensil === '1')
          setUtensils("Yes")
        else
          setUtensils("No")

        let donation = {
          userId,
          userName,
          itemName,
          quantity,
          timeOfPreperation : top,
          address,
          utensil,
          ts : Date.now() + ""
        }

        if(userLogo !== null)
          donation.userLogo = userLogo

        console.log(donation);
        uploadData(donation);
      }
    } catch(e) {
      ToastAndroid.show(e.message,ToastAndroid.BOTTOM);
    }
    
  }

  const uploadData = async(data) => {

    const db = getFirestore(app);

    ToastAndroid.show(data.ts,ToastAndroid.BOTTOM);
    const donationRef = doc(db, 'donations', data.ts);

    setDoc(donationRef, data)
    .then((data) => {
      ToastAndroid.show("Added to databse successfull",ToastAndroid.BOTTOM);
      navigation.navigate('HomeScreen')
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
        {donationForm.map((item) => (
          <View key={item.id.toString()}>
            <AppTextInput placeholder={item.placeholder} onChangeText={(value) => onTextChange(item.id,value)}/>
          </View>
        ))}
        <DropdownComponent changeHandler={dropChangeHandler} data={data} placeholder='Utensils' />
        <View style={styles.description}>
          <TextInput
            editable
            multiline
            numberOfLines={4}
            onChangeText={(value) => onTextChange(4,value)}
            style={styles.textInput}
            placeholder='Address'
          />
        </View>
        <View style={styles.button}>
          <AppButton title='Submit' onPress={startSubmit} />
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

export default DonationFormScreen

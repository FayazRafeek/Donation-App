import React, { useEffect, useState } from 'react'
import { Image, Text, StyleSheet, View, TouchableOpacity, ToastAndroid } from 'react-native'

import colors from '../../config/colors'
import { RFPercentage, RFValue } from 'react-native-responsive-fontsize'

import { doc, updateDoc,getDoc, getFirestore } from "firebase/firestore";
import {app} from '../../../firebaseConfig'

import AsyncStorage from '@react-native-async-storage/async-storage';

const Card = ({ item }) => {

  let [userType, setUserType] = useState('');
  let [isUpdated, setIsUpdated] = useState(false)

  let updateInitial = async() => {

    const userType = await AsyncStorage.getItem('userType')

    setUserType(userType)

    if(item.status === 'confirmed'){
      let confirmUser = {
        userId : item.confirmUserId,
        userLogo : item.confirmUserLogo,
        userName : item.confirmUserName,
        phone : item.confirmUserPhone,
        email : item.confirmUserEmail
      }
      setConfirmUser(confirmUser)
      updateConfirmData()
    }
      
  }


  const [confirmUser,setConfirmUser] = useState({})

  const updateConfirmData = async() => {

    if(item.confirmUserId === null) return
    const db = getFirestore(app);
    const userRef = doc(db, 'users', item.confirmUserId);
    getDoc(userRef)
    .then((docSnap) => {
      if (docSnap.exists()) {
        setConfirmUser(docSnap.data())
      } else {
        // doc.data() will be undefined in this case
        ToastAndroid.show("User data dosen't exists, please register to continue.",ToastAndroid.BOTTOM);
      }
    })
    .catch((error) => {
      const errorCode = error.code;
      const errorMessage = error.message;
      ToastAndroid.show(errorMessage,ToastAndroid.BOTTOM);
    })

  }

  useEffect(() => {
    updateInitial()
  },[])

 

  const confirmRequest = async() => {
    
    try {
      const userId = await AsyncStorage.getItem('userId')
      const userName = await AsyncStorage.getItem('userName')
      const userLogo = await AsyncStorage.getItem('userLogo')
      const phone = await AsyncStorage.getItem('phone')
      const email = await AsyncStorage.getItem('email')

      item.status = "confirmed"
      item.confirmUserId = userId;
      item.confirmUserName = userName;
      item.confirmUserLogo = userLogo
      item.confirmUserPhone = phone
      item.confirmUserEmail = email

      const db = getFirestore(app);

      ToastAndroid.show(item.ts,ToastAndroid.BOTTOM);
      const donationRef = doc(db, 'donationRequests', item.ts);
  
      updateDoc(donationRef, item)
      .then((data) => {
        ToastAndroid.show("Confirmed successfully successfull",ToastAndroid.BOTTOM);
        setIsUpdated(!isUpdated)
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
    <>
      <View style={styles.container}>
        <View style={styles.upper}>
          <Image source={item.userLogo !== null ? {uri : item.userLogo} : require('../../../assets/request.png')} style={styles.image} />
          <Text style={styles.header}>{item.title}</Text>
        </View>
        <View style={styles.lower}>
          <View>
            <Text style={{fontSize : RFValue(20)}}>{item.userName}</Text>
            <Text style={styles.element}>Email: {item.userEmail}</Text>
            <Text style={styles.element}>Phone number: {item.userPhone}</Text>
            <Text style={styles.element}>Quantity: {item.quantity}</Text>
            <Text style={styles.element}>Location: {item.location}</Text>
            <Text style={styles.element}>Need Before: {item.needBefore}</Text>
            <Text style={styles.element}>Posted On: {new Intl.DateTimeFormat('en-US', {year: 'numeric', month: '2-digit',day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit'}).format(+item.ts)}</Text>
          </View>
          <View style={styles.description}>
            <Text style={{ fontSize: RFValue(10), fontWeight: 'bold' }}>Description:</Text>
            <Text style={{ fontSize: RFValue(10), marginTop: RFPercentage(1) }}>
              {item.desc}
            </Text>
          </View>
        </View>
      </View>
      {
        item.status === "confirmed" ? 
        <>
         <View style={{ textAlign:'left', backgroundColor:'#f2f2f2',display:'flex',gap: RFValue(10),flexDirection:'row', width: RFPercentage(30), marginTop:RFValue(20), padding:RFValue(5)}}>
            
         <Image source={item.confirmUserLogo !== null ? {uri : confirmUser.userLogo} : require('../../../assets/request.png')} style={{width: RFPercentage(10), height: RFPercentage(10)}} />
          
          <View>
          <Text style={{fontSize : RFValue(10)}}>Accepted by : </Text>
            <Text style={{ fontSize: RFValue(20) }}>
              {confirmUser.userName}
            </Text>
            
            <Text style={{fontSize : RFValue(10)}}>Phone : {confirmUser.phone}</Text>
            <Text style={{fontSize : RFValue(10)}}>Email : {confirmUser.email}</Text>
          </View>

            </View>
        </> : userType === 'NGO' ? '' : 
        <TouchableOpacity>
        <View style={styles.button}>
          <Text style={{ fontWeight: 'bold' }} onPress={() => confirmRequest()}>CONFIRM</Text>
        </View>
      </TouchableOpacity>
      }
     
    </>
  )
}



const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgb(233, 244, 243)',
    borderRadius: RFValue(12),
    elevation: 2,
    height: RFPercentage(70),
    justifyContent: 'space-around',
    paddingHorizontal: RFPercentage(3),
    width: '90%',
  },
  upper: {
    alignItems: 'center',
    height: RFPercentage(25),
    justifyContent: 'space-around',
  },
  lower: {
    height: RFPercentage(40),
    justifyContent: 'space-around',
  },
  image: {
    height: RFPercentage(30),
    width: RFPercentage(50),
  },
  header: {
    fontSize: RFValue(18),
    fontWeight: 'bold',
    paddingHorizontal: RFPercentage(5),
    textAlign: 'center',
    textDecorationLine: 'underline',
  },
  element: {
    fontSize: RFValue(14),
    fontWeight: 'bold',
    marginBottom:RFValue(2)
  },
  description: {
    backgroundColor: colors.white,
    borderRadius: RFValue(10),
    justifyContent: 'space-around',
    paddingLeft: RFPercentage(1),
    paddingRight: RFPercentage(5),
    paddingVertical: RFPercentage(1),
  },
  button: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: RFValue(10),
    height: RFPercentage(3.5),
    justifyContent: 'center',
    marginLeft: RFPercentage(20),
    marginTop: RFPercentage(5),
    width: RFPercentage(17),
  },
})

export default Card

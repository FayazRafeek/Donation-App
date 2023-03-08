import React, { useEffect, useState } from 'react'
import { ScrollView, StyleSheet, Text, ToastAndroid, View } from 'react-native'

import DonationList from '../../components/DonationList'
import ProfileButton from '../../components/common/ProfileButton'

import { homeData, homeSecondData } from '../../config/homeData'

import { RFPercentage, RFValue } from 'react-native-responsive-fontsize'

import { collection, query, orderBy, onSnapshot,getFirestore } from "firebase/firestore";

import AsyncStorage from '@react-native-async-storage/async-storage';
import {app} from '../../../firebaseConfig'

const DonationScreen = ({ navigation }) => {

  const [userDonations, setUserDonations] = useState([])
  const [liveDonations, setLiveDonations] = useState([])

  useEffect(() => {

    fetchDonations();

  },[])

  const fetchDonations = async() => {


    ToastAndroid.show('Loading...',ToastAndroid.BOTTOM)

    const db = getFirestore(app);
    const q = query(collection(db, "donations"), orderBy("ts"));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const donations = [];
      querySnapshot.forEach((doc) => {
        ToastAndroid.show('Data updated',ToastAndroid.BOTTOM)
        donations.push(doc.data());
      });

      splitList(donations)
    });
  }

  let splitList = async(data) => {

    try {
      const userId = await AsyncStorage.getItem('userId')

      let userDonation = []
      let liveDonations = []
      data.forEach((donations) => {
        if(donations.userId === userId)
          userDonation.push(donations)
        else
          liveDonations.push(donations)
      })

      setUserDonations(userDonation)
      setLiveDonations(liveDonations)


      
    } catch(e) {
      ToastAndroid.show(e.message,ToastAndroid.BOTTOM);
    }
  }
  
  return (
    <>
      <ScrollView>
        <View style={styles.container}>
          <Text style={styles.heading}>Live Donations</Text>
          {liveDonations.map((item) => (
            <View key={item.ts} style={{ alignItems: 'center', width: '100%' }}>
              <DonationList
                image={ item.userLogo === null ? require('../../../assets/home.png') : {uri : item.userLogo}}
                header={item.itemName}
                quantity={item.quantity}
                time={item.timeOfPreperation}
                date={item.ts}
                check={false}
              />
            </View>
          ))}
          <Text style={styles.heading}>Your Donations</Text>
          {userDonations.map((item) => (
            <View key={item.ts} style={{ alignItems: 'center', width: '100%' }}>
              <DonationList
                image={ item.userLogo === null ? require('../../../assets/home.png') : {uri : item.userLogo}}
                header={item.itemName}
                quantity={item.quantity}
                time={item.timeOfPreperation}
                date={item.ts}
                check={false}
              />
            </View>
          ))}
        </View>
      </ScrollView>
      <View style={styles.footer}>
        <ProfileButton navigation={navigation} />
      </View>
    </>
  )
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    flex: 0.9,
  },
  heading: {
    fontSize: RFValue(16),
    fontWeight: 'bold',
    marginBottom: RFPercentage(2),
    marginTop: RFPercentage(3),
  },
  footer: {
    alignItems: 'flex-end',
    justifyContent: 'flex-end',
    flex: 0.1,
    marginBottom: RFPercentage(2),
    marginRight: RFPercentage(3),
    marginTop: RFPercentage(10),
  },
})

export default DonationScreen

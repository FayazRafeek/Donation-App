import React, { useEffect, useState } from 'react'
import { FlatList, StyleSheet, Text, View, ScrollView, ToastAndroid } from 'react-native'

import RequestList from '../../components/RequestList'
import ProfileButton from '../../components/common/ProfileButton'
import { requestData } from '../../config/requestData'

import { RFPercentage, RFValue } from 'react-native-responsive-fontsize'


import { collection, query, orderBy, onSnapshot,getFirestore } from "firebase/firestore";

import AsyncStorage from '@react-native-async-storage/async-storage';
import {app} from '../../../firebaseConfig'

const RequestScreen = ({ navigation }) => {

  const [isFetched, setIsFetched] = useState(false);
  const [userDonationReq, setUserDonationReq] = useState([])
  const [allReq, setAllReq] = useState([])

  useEffect(() => {

    fetchDonations();

  },[])

  const fetchDonations = async() => {

    const db = getFirestore(app);
    const q = query(collection(db, "donationRequests"), orderBy("ts"));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const donations = [];
      querySnapshot.forEach((doc) => {
        donations.push(doc.data());
      });


      splitList(donations)
      console.log("Current cities in CA: ", donations);
    });
  }


let splitList = async(data) => {

  try {

    const userType = await AsyncStorage.getItem('userType')
    if(userType === 'Restaurant'){
      setAllReq(data)
      return
    }

    const userId = await AsyncStorage.getItem('userId')

    let userDonation = []
    let liveDonations = []
    data.forEach((donations) => {
      if(donations.userId === userId)
        userDonation.push(donations)
      else
        liveDonations.push(donations)
    })

    setUserDonationReq(userDonation)
    setAllReq(liveDonations)


    
  } catch(e) {
    ToastAndroid.show(e.message,ToastAndroid.BOTTOM);
  }
}


  return (
    <>
    <ScrollView>

      <View style={styles.container}>

        {
          allReq !== null && allReq.length > 0 ?
          <>
           <Text style={styles.heading}>All Donations Requests</Text>

            {
            allReq.map((item => 
              <RequestList
                key={item.ts}
                image={ item.userLogo === null ? require('../../../assets/home.png') : {uri : item.userLogo}} 
                title={item.userName}
                details={item.desc}
                time={item.needBefore}
                onPress={() => navigation.navigate('ConfirmScreen', item)}
              />))
            }
          </> : ''
        }

        {
          userDonationReq !== null && userDonationReq.length > 0 ?
          <>
           <Text style={styles.heading}>Your Donations Requests</Text>

            {
            userDonationReq.map((item => 
              <RequestList
              key={item.ts}
                image={ item.userLogo === null ? require('../../../assets/home.png') : {uri : item.userLogo}}
                title={item.userName}
                details={item.desc}
                time={item.ts}
                onPress={() => navigation.navigate('ConfirmScreen', item)}
              />))
            }
          </> : ''
        }
          
         
        
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
  },
})

export default RequestScreen

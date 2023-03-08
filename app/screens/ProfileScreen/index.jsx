import React, { useState } from 'react'
import { FlatList, Image, StyleSheet, Text, View } from 'react-native'

import ProfileList from '../../components/ProfileList'
import { profileList, profileSecondList } from '../../config/profileList'

import { RFPercentage, RFValue } from 'react-native-responsive-fontsize'


import AsyncStorage from '@react-native-async-storage/async-storage';

const ProfileScreen = ({ navigation }) => {

  let [userName, setUserName] = useState('')
  let [userImage,setUserImage] = useState(null)
  let [userType,setUserType] = useState('')


  const setUserDetail = async() => {

    try {
      const userName = await AsyncStorage.getItem('userName')
      const userLogo = await AsyncStorage.getItem('userLogo')
      const userType = await AsyncStorage.getItem('userType')
      setUserName(userName)
      setUserImage(userLogo)
      setUserType(userType)
    } catch(e) {
      ToastAndroid.show(e.message,ToastAndroid.BOTTOM);
    }
  }

  setUserDetail()

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Profile</Text>
      {
          userImage !== null ? <Image style={{width: 100, height: 100, borderRadius: 12}}  source={{uri : userImage}} />
          : <Image style={{width: 200, height: 200}}  source={require('../../../assets/home.png')} />
        }
      <Text style={styles.title}>{userName}</Text>
      <Text style={styles.subTitle}>{userType === 'NGO' ? 'Non Governmental Organization' : 'Restaurant'}</Text>
      <FlatList
        data={profileList}
        renderItem={({ item }) => (
          <ProfileList
            icon={item.icon}
            listTitle={item.listTitle}
            route={item.route}
            navigation={navigation}
            type="list1"
          />
        )}
        keyExtractor={(item) => item.id}
        style={{ marginBottom: RFPercentage(3) }}
      />
      <FlatList
        data={profileSecondList}
        renderItem={({ item }) => <ProfileList type="list2" icon={item.icon} listTitle={item.listTitle} navigation={navigation}/>}
        keyExtractor={(item) => item.id}
      />
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
})

export default ProfileScreen

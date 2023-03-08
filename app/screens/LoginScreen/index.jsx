import React from 'react'
import { Image, StyleSheet, Text, TouchableOpacity,ToastAndroid, View } from 'react-native'

import AppForm from '../../components/Forms/AppForm'
import AppFormField from '../../components/Forms/AppFormField'
import SubmitButton from '../../components/Forms/SubmitButton'

import { RFPercentage, RFValue } from 'react-native-responsive-fontsize'

import colors from '../../config/colors'

import * as Yup from 'yup'

import {app} from '../../../firebaseConfig'
import { getAuth,signInWithEmailAndPassword } from "firebase/auth";
import { getFirestore,doc, getDoc } from "firebase/firestore";

import AsyncStorage from '@react-native-async-storage/async-storage';


const validationSchema = Yup.object().shape({
  email: Yup.string().email('Please enter valid email').required('Email is required'),
  password: Yup.string()
    .matches(/\w*[a-z]\w*/, 'Password must have a small letter')
    .matches(/\w*[A-Z]\w*/, 'Password must have a capital letter')
    .matches(/\d/, 'Password must have a number')
    .matches(/[!@#$%^&*()\-_"=+{}; :,<.>]/, 'Password must have a special character')
    .min(8, ({ min }) => `Password must be at least ${min} characters`)
    .required('Password is required'),
})


const LoginScreen = ({ navigation }) => {

  const startLogin = async(values) => {

    let email = values.email;
    let password = values.password

    let auth = getAuth(app)
    signInWithEmailAndPassword(auth,email,password)
    .then((data) => {
      if(data.user !== null){
        const userId = data.user.uid;
        ToastAndroid.show("Authentication successfull ",ToastAndroid.BOTTOM);

        fetchUserFromDB(userId);
      }
    })
    .catch((error) => {
      const errorCode = error.code;
      const errorMessage = error.message;
      ToastAndroid.show(errorMessage,ToastAndroid.BOTTOM);
    })

  }

  const fetchUserFromDB = async(userId) => {

    const db = getFirestore(app);
    const userRef = doc(db, 'users', userId);
    getDoc(userRef)
    .then((docSnap) => {
      if (docSnap.exists()) {
        persistUserData(docSnap.data())
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

  const persistUserData = async (user) => {
    try {
      
        await AsyncStorage.setItem("userId", user.userId);
        await AsyncStorage.setItem("userName", user.userName);
        await AsyncStorage.setItem("phone", user.phone);
        await AsyncStorage.setItem("userType", user.userType);
        await AsyncStorage.setItem("email", user.email);
        
        if(user.logoUrl !== null)
          await AsyncStorage.setItem("userLogo", user.logoUrl);

        if(user.userType === 'NGO')
          navigation.navigate('HomeNGOScreen')
        else
        navigation.navigate('HomeScreen')
    } catch (error) {
      const errorCode = error.code;
      const errorMessage = error.message;
      ToastAndroid.show(errorMessage,ToastAndroid.BOTTOM);
      console.log(error);
    }
  }
  
  return (
  <View style={styles.background}>
    <View style={styles.logo}>
      <Image source={require('../../../assets/logo.png')} />
    </View>
    <View style={styles.components}>
      <AppForm
        initialValues={{ email: 'fayaz3@email.com', password: '12345654' }}
        onSubmit={(values) => startLogin(values)}
        // validationSchema={validationSchema}
      >
        <AppFormField
          autoCapitalize='none'
          autoCorrect={false}
          keyboardType='email-address'
          name='email'
          placeholder='Email'
          text='Email'
          textContentType='emailAddress'
        />
        <AppFormField
          autoCapitalize='none'
          autoCorrect={false}
          name='password'
          placeholder='Password'
          secureTextEntry
          text='Password'
          textContentType='password'
        />
        <View style={styles.row}>
          <Text style={styles.phrase}>Forgot Password?</Text>
        </View>
        <View style={styles.loginButton}>
          <SubmitButton title='Login' onPress={() => navigation.navigate('HomeScreen')} />
        </View>
        <TouchableOpacity onPress={() => navigation.navigate('SignupScreen')}>
          <Text style={styles.signup}>Sign Up Instead</Text>
        </TouchableOpacity>
      </AppForm>
    </View>
  </View>
)
  }

const styles = StyleSheet.create({
  background: {
    backgroundColor: colors.background,
    flex: 1,
  },
  logo: {
    alignItems: 'center',
  },
  components: {
    flex: 0.6,
    marginTop: RFPercentage(5),
  },
  row: {
    alignItems: 'center',
    marginHorizontal: 30,
  },
  phrase: {
    fontSize: RFValue(10),
    color: 'rgba(35, 184, 166, 1)',
    marginVertical: RFPercentage(3),
  },
  loginButton: {
    alignItems: 'center',
  },
  signup: {
    color: 'rgba(0, 133, 255, 1)',
    fontWeight: '500',
    marginLeft: 30,
    marginTop: 50,
  },
})

export default LoginScreen

import React, { useState } from 'react'
import { ScrollView, StyleSheet, Text, TouchableOpacity,ToastAndroid, View, Image } from 'react-native'

import AppForm from '../../components/Forms/AppForm'
import AppFormField from '../../components/Forms/AppFormField'
import DropdownComponent from '../../components/common/DropdownComponent'
import SubmitButton from '../../components/Forms/SubmitButton'

import * as Yup from 'yup'

import { RFPercentage, RFValue } from 'react-native-responsive-fontsize'

import colors from '../../config/colors'

import {app, firebase} from '../../../firebaseConfig'
import { getAuth,createUserWithEmailAndPassword } from "firebase/auth";
import { getFirestore,doc, setDoc } from "firebase/firestore";

import * as ImagePicker from 'expo-image-picker';


import AsyncStorage from '@react-native-async-storage/async-storage';


const validationSchema = Yup.object().shape({
  fullName: Yup.string()
    .matches(/(\w.+\s).+/, 'Enter at least 2 names')
    .required('Full name is required'),
  // phoneNumber: Yup.string()
  //   .matches(/^((\+92)?(0092)?(92)?(0)?)(3)([0-9]{9})$/gm, 'Enter a valid phone number')
  //   .required('Phone number is required'),
  email: Yup.string().email('Please enter valid email').required('Email is required'),
  password: Yup.string()
    .matches(/\w*[a-z]\w*/, 'Password must have a small letter')
    .matches(/\w*[A-Z]\w*/, 'Password must have a capital letter')
    .matches(/\d/, 'Password must have a number')
    .matches(/[!@#$%^&*()\-_"=+{}; :,<.>]/, 'Password must have a special character')
    .min(8, ({ min }) => `Password must be at least ${min} characters`)
    .required('Password is required'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password')], 'Passwords do not match')
    .required('Confirm password is required'),
})



const SignUpScreen = ({ navigation }) => {

  const [image, setImage] = useState(null);

  const pickImage = async () => {
    // No permissions request is necessary for launching the image library
    ToastAndroid.show("Clicked image choose",ToastAndroid.BOTTOM)
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    console.log(result);

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const uploadImage = async (user) => {

    const blob = await new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.onload = function() {
        resolve(xhr.response);
      };
      xhr.onerror = function() {
        reject(new TypeError('Network request failed'));
      };
      xhr.responseType = 'blob';
      xhr.open('GET', image, true);
      xhr.send(null);
    })

    const ref = firebase.storage().ref().child('logo/' + user.userId)
    const snapshot = ref.put(blob)

    snapshot.on(firebase.storage.TaskEvent.STATE_CHANGED,
      ()=>{
        ToastAndroid.show("Uplaoding image...", ToastAndroid.BOTTOM)
      },
      (error) => {
        console.log(error)
        ToastAndroid.show("Uplaoding failed", ToastAndroid.BOTTOM)
        ToastAndroid.show(error.message, ToastAndroid.BOTTOM)
        blob.close()
        return 
      },
      () => {
        snapshot.snapshot.ref.getDownloadURL().then((url) => {
          console.log("Download URL: ", url)
          setImage(url)
          user.logoUrl = url;
          createUserInDB(user);
          blob.close()
          return url
        })
      }
      )
  }

  const [userType,setUserType] = useState(null);

  const startSignup = async (values) => {
  
    let email = values.email;
    let password = values.password;
    let userName = values.fullName;
    let phone = values.phoneNumber;
  
    let userTypeValue = "";
    if(userType === null){
      ToastAndroid.show("Select user type from dropdown!",ToastAndroid.BOTTOM);
      return
    }
    if(userType === '1')
      userTypeValue = "NGO"
    else
      userTypeValue = "Restaurant"
  
    const auth = getAuth(app);
    createUserWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      // Signed in 

      if(userCredential.user !== null){
        const userId = userCredential.user.uid;
        ToastAndroid.show("Authentication successfull, creating user account...",ToastAndroid.BOTTOM);
    
        let user = {
          userId,
          email,
          password,
          userName,
          phone,
          userType : userTypeValue
        }

        uploadImage(user);

        
      } else {
        ToastAndroid.show("User null",ToastAndroid.BOTTOM);
      }
    })
    .catch((error) => {
      const errorCode = error.code;
      const errorMessage = error.message;
      ToastAndroid.show(errorMessage,ToastAndroid.BOTTOM);
    });
  }
  
  const createUserInDB = async(user) => {
    const db = getFirestore(app);
    const userRef = doc(db, 'users', user.userId);
    setDoc(userRef, user)
    .then((data) => {
      ToastAndroid.show("Sign up successfull",ToastAndroid.BOTTOM);
      persistUserData(user)
    })
    .catch((error) => {
      const errorCode = error.code;
      const errorMessage = error.message;
      ToastAndroid.show(errorMessage,ToastAndroid.BOTTOM);
    })
  }
  
  const changeUserType = (value)=>{
    setUserType(value);
    ToastAndroid.show("Change to "+ value,ToastAndroid.BOTTOM)
  }

  const persistUserData = async (user) => {
    try {
        await AsyncStorage.setItem("isLoggedIn", "true");
        await AsyncStorage.setItem("userId", user.userId);
        await AsyncStorage.setItem("userName", user.userName);
        await AsyncStorage.setItem("phone", user.phone);
        await AsyncStorage.setItem("email", user.email);
        await AsyncStorage.setItem("userType", user.userType);

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

  const data = [
    { label: 'NGO', value: '1' },
    { label: 'Restaurant', value: '2' },
  ]

  return (
    <ScrollView style={styles.background}>
      <View style={{ alignItems: 'center', marginTop: RFPercentage(2) }}>
        <View style={styles.logo} onPress={() => pickImage()}>
          {image && <Image source={{ uri: image }} style={{ width: 150, height: 150 }} onPress={() => pickImage()}/>}
          {image === null && <Text style={styles.text}  onPress={() => pickImage()}>UPLOAD PHOTO</Text>}
        </View>
        <View style={styles.components}>
          <AppForm
            initialValues={{
              fullName: 'Fayaz Rafeek',
              phoneNumber: '12345676',
              email: 'fayaz@email.com',
              password: 'Fayaz@05012002',
              confirmPassword: 'Fayaz@05012002',
            }}
            onSubmit={startSignup}
            validationSchema={validationSchema}
          >
            <AppFormField text='Name' name='fullName' textContentType='name' placeholder='Name' />
            <AppFormField
              keyboardType='phone-pad'
              name='phoneNumber'
              placeholder='Phone Number'
              text='Contact'
              textContentType='telephoneNumber'
            />
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
            <DropdownComponent data={data} placeholder='Select' name="userType" changeHandler={changeUserType} />
            <View style={styles.signupButton}>
              <SubmitButton title='Sign Up'/>
            </View>
            <TouchableOpacity onPress={() => navigation.navigate('LoginScreen')}>
              <Text style={styles.login}>Sign In Instead</Text>
            </TouchableOpacity>
          </AppForm>
        </View>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  background: {
    backgroundColor: colors.background,
    flex: 1,
  },
  logo: {
    alignItems: 'center',
    backgroundColor: 'rgb(229, 231, 230)',
    borderRadius: 60,
    height: RFPercentage(15),
    justifyContent: 'center',
    width: RFPercentage(15),
  },
  text: {
    fontSize: RFValue(14),
    fontWeight: '500',
    paddingHorizontal: RFPercentage(1),
    textAlign: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
    marginTop: 80,
  },
  components: {
    flex: 0.6,
    marginTop: RFPercentage(5),
    width: '100%',
  },
  signupButton: {
    alignItems: 'center',
    marginBottom: RFPercentage(4),
    marginTop: 15,
  },
  login: {
    color: 'rgba(0, 133, 255, 1)',
    fontWeight: '500',
    marginBottom: 40,
    marginLeft: 30,
    marginTop: 10,
  },
})

export default SignUpScreen

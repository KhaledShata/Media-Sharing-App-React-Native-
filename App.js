import React, { useState } from "react";
import axios from 'axios';
import {
  StyleSheet,
  Text,
  View,
  Button,
} from "react-native";
import {launchImageLibrary} from 'react-native-image-picker';
import * as ImagePicker from 'expo-image-picker';

const options = {
  title: 'Select Image',
  type:'Library', 
  options:{
    mediaType: 'mixed',
    selectionLimit: 1,
    includeBase64: false,
    
  }

};


const App = () =>{

    const handleUpload=async()=>{
      console.log("HIIII");
      const file = await ImagePicker.launchImageLibraryAsync(options);
      console.log(file.assets[0]);
      const formData = new FormData();
      formData.append('file', {
        uri:file.assets[0].uri,
        type:file.assets[0].mimeType,
        name:file.assets[0].fileName,
      })
      let res = await fetch(
        'http://192.168.100.4:3001/upload', 
        {
          method :'post', 
          body:formData, 
          headers:{
          'Content-Type': 'multipart/form-data',
          },
        }
      );
      let responsejson = await res.json();
      console.log("RESPONSE IS " ,responsejson);

    //   axios.post('http://localhost:3001/upload', formData, {
    //   headers: {
    //     'Content-Type': 'multipart/form-data',
    //   },
    // })
    console.log("UPLOAD DONE SUCCESSFULLY");

    }
  
  return (
    <View style={styles.container}>
      <Button title="Upload" onPress={handleUpload} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
export default App;
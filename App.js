import React, { useState,useEffect } from "react";
import axios from 'axios';
import {  StyleSheet,  Text,  View,  Button,ScrollView,Image, SafeAreaView,TextInput} from "react-native";
import {launchImageLibrary} from 'react-native-image-picker';
import * as ImagePicker from 'expo-image-picker';
import { Video } from 'expo-av'; 


const App = () =>{
  const [filesList, setFilesList] = useState([]);
  const [updateFile, setUpdateFile] = useState(null); 

    useEffect(() => {
      fetchFiles(); 
    }, []); 


    const handleUpload=async()=>{
      const file = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        allowsEditing: false, //disable crop after selecting photo
        quality: 0.9,
        base64: false,
      });
      const formData = new FormData();
      formData.append('file', {
        uri:file.assets[0].uri,
        type:file.assets[0].mimeType,
        name:file.assets[0].fileName,
      })
      console.log("URI" , file.assets[0].uri)
      console.log("Type" , file.assets[0].mimeType)
      console.log("Name" , file.assets[0].fileName)

      let res = await fetch(
        'http://192.168.100.4:3001/upload', //localhost raise connection failed
        {
          method :'post', 
          body:formData, 
          headers:{
          'Content-Type': 'multipart/form-data',
          
          },
        }
      )
      .then(() => {
        fetchFiles(); 
      })
      // let responsejson = await res.json();
      // console.log("RESPONSE IS " ,responsejson);
      // console.log("UPLOAD DONE");

    }
    const handleFileUpdate = async (fileId) => {
      const file = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        allowsEditing: false,
        quality: 0.9,
        base64: false,
      });
    
      if (file.cancelled) {
        console.log('File selection was cancelled.');
        return;
      }
    
      const formData = new FormData();
      formData.append('file', {
        uri:file.assets[0].uri,
        type:file.assets[0].mimeType,
        name:file.assets[0].fileName,
      })

      axios.put(`http://192.168.100.4:3001/files/${fileId}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      .then(() => {
        console.log("File updated successfully.");
        fetchFiles(); 
      })
      .catch(err => console.log('Error updating file:', err));
    };
    
    const fetchFiles = () => {
      axios.get('http://192.168.100.4:3001/files')
        .then(res => {
          const files = res.data;
          const detailFetchPromises = files.map(file =>
            axios.get(`http://192.168.100.4:3001/media/${file.gridfsId}`)
              .then(mediaResponse => {
                const { _id, ...mediaDetails } = mediaResponse.data; 
                return {
                  ...file, 
                  ...mediaDetails, 
                };
              })
          );
    
          Promise.all(detailFetchPromises)
            .then(fullFiles => {
              setFilesList(fullFiles);
              console.log("FILES FETCHED " , fullFiles[0]);
            })
            .catch(error => console.error('Error fetching media details:', error));
        })
        .catch(err => console.error('Error fetching files:', err)); 
    };
    
    const handleLike = (fileId) => {
      axios.get(`http://192.168.100.4:3001/files/like/${fileId}`)
      .then(() => {
        fetchFiles(); 
        console.log(fileId);
      })
      .catch(err => console.log(err));
    };
    const handleunLike = (fileId) => {
      axios.get(`http://192.168.100.4:3001/files/unlike/${fileId}`)
      .then(() => {
        fetchFiles(); 
        console.log(fileId);
      })
      .catch(err => console.log(err));
    };

    const handleDelete = (fileId) => {
      axios.delete(`http://192.168.100.4:3001/files/${fileId}`)
      .then(() => {
        console.log("Deleted")
        fetchFiles(); 
        
      })
      .catch(err => console.log(err));
    };
    const renderFile = (file) => {
      const fileType = file.contentType.split('/')[0]; 
      const fileSource = `http://192.168.100.4:3001/files/view/${file._id}?cb=${new Date().getTime()}`;

      if (fileType === 'image') {
        return (
          <View style={styles.fileContainer}>
          <Text style={styles.fileInfo}>{file.filename}</Text>  

            <Image
              source={{ uri: fileSource }}
              style={styles.image}
            />
            <Text style={styles.fileInfo}>{file.numberOfLikes} Likes</Text>
            <View style={styles.buttonContainer}>
              <Button title="Like"   onPress={() => handleLike(file._id)} />
              <Button title="Unlike" onPress={() => handleunLike(file._id)} />
              <Button title="Delete" onPress={() => handleDelete(file._id)} color="red" />
              <Button title="Update" onPress={() => handleFileUpdate(file._id)} color="green" />

            </View>

          </View>
        );
      } else if (fileType === 'video') {
        return (
          <View style={styles.fileContainer}>
            <Text style={styles.fileInfo}>{file.filename}</Text>  

            <Video
              source={{ uri: fileSource }}
              style={styles.video}
              useNativeControls
              resizeMode="contain"
              isLooping
            />
            <Text style={styles.fileInfo}>{file.numberOfLikes} Likes</Text>
            <View style={styles.buttonContainer}>
              <Button title="Like" onPress={() => handleLike(file._id)} />
              <Button title="Unlike" onPress={() => handleunLike(file._id)} />
              <Button title="Delete" onPress={() => handleDelete(file._id)} color="red" />
              <Button title="Update" onPress={() => handleFileUpdate(file._id)} color="green" />
            </View>
          </View>
        );
      }
    };
  
    return (
      <View style={styles.container}>
        <Text style={styles.header}>Media Sharing Platform</Text>
        <Button title="Upload" onPress={handleUpload} />

      <ScrollView style={styles.filesList}>
        {filesList.map((file, index) => (
          <View key={index}>
            {renderFile(file)}
          </View>
        ))}
      </ScrollView>
              
      </View>
    );
    
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 5,
    backgroundColor: '#f0f0f0'
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    marginTop: 20, 
    color: '#000', 
    textAlign: 'center',  
  },
  fileContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    borderColor: 'grey',  
    borderWidth: 2,       
    padding: 10,          
    backgroundColor: '#fff', 
  },
  image:{
      width: 300, 
      height: 300,
      resizeMode:'contain'

  },
  video:{
      width: 300, 
      height: 300,
      resizeMode:'contain'
  },
  fileInfo: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: 10,
  }
});
export default App;
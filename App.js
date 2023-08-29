import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, Button, Image } from 'react-native';
import * as SQLite from 'expo-sqlite';
import * as ImagePicker from 'expo-image-picker';

const db = SQLite.openDatabase('mydb.db');

export default function App() {
  const [imageUri, setImageUri] = useState('');
  const [imageList, setImageList] = useState([]);

  useEffect(() => {
    db.transaction(tx => {
      tx.executeSql(
        'CREATE TABLE IF NOT EXISTS images (id INTEGER PRIMARY KEY AUTOINCREMENT, uri TEXT);'
      );
    });
    fetchImages();
  }, []);

  const fetchImages = () => {
    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM images;',
        [],
        (_, { rows }) => {
          setImageList(rows._array);
        }
      );
    });
  };

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.cancelled) {
      db.transaction(tx => {
        tx.executeSql(
          'INSERT INTO images (uri) VALUES (?);',
          [result.uri],
          () => {
            fetchImages();
          },
          (_, error) => console.error('Error inserting image: ', error)
        );
      });
    }
  };

  return (
    <View style={styles.container}>
      <Button title="Pick Image" onPress={pickImage} />
      <View style={styles.imageContainer}>
        {imageList.map(image => (
          <Image key={image.id} source={{ uri: image.uri }} style={styles.image} />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  imageContainer: {
    marginTop: 20,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  image: {
    width: 100,
    height: 100,
    margin: 10,
  },
});
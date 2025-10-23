import * as ImagePicker from "expo-image-picker";
import { Alert } from "react-native";

export type PickResult = { uri: string } | null;

async function requestCameraPermission(): Promise<boolean> {
  try {
    const res = await ImagePicker.requestCameraPermissionsAsync();
    return !!res.granted;
  } catch (e) {
    return false;
  }
}

async function requestMediaLibraryPermission(): Promise<boolean> {
  try {
    const res = await ImagePicker.requestMediaLibraryPermissionsAsync();
    return !!res.granted;
  } catch (e) {
    return false;
  }
}

export async function pickFromCamera(): Promise<PickResult> {
  const granted = await requestCameraPermission();
  if (!granted) {
    Alert.alert(
      "Permissão Negada",
      "É necessário permitir acesso à câmera para tirar fotos."
    );
    return null;
  }

  try {
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets[0]) {
      return { uri: result.assets[0].uri };
    }
  } catch (error) {
    console.error("Erro ao abrir câmera:", error);
    Alert.alert("Erro", "Não foi possível abrir a câmera.");
  }

  return null;
}

export async function pickFromGallery(): Promise<PickResult> {
  const granted = await requestMediaLibraryPermission();
  if (!granted) {
    Alert.alert(
      "Permissão Negada",
      "É necessário permitir acesso à galeria para escolher fotos."
    );
    return null;
  }

  try {
    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets[0]) {
      return { uri: result.assets[0].uri };
    }
  } catch (error) {
    console.error("Erro ao abrir galeria:", error);
    Alert.alert("Erro", "Não foi possível abrir a galeria.");
  }

  return null;
}

export function showImagePickerOptions(
  onCamera: () => void,
  onGallery: () => void
) {
  Alert.alert("Escolher Foto", "Como deseja adicionar uma foto?", [
    { text: "Cancelar", style: "cancel" },
    { text: "Câmera", onPress: onCamera },
    { text: "Galeria", onPress: onGallery },
  ]);
}

export default { pickFromCamera, pickFromGallery, showImagePickerOptions };

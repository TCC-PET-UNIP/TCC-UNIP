import { View, Text, TextInput, TouchableOpacity, Image } from "react-native";
import { router } from "expo-router";

export default function Register() {
  return (
    <View className="flex-1 items-center justify-center bg-[#B87B56] px-4">
      <View className="w-full max-w-[350px] bg-[#F8F3EC] rounded-2xl p-6 items-center">
        <Text className="text-2xl font-bold text-[#fff] mt-2 mb-4">
          PetHelper
        </Text>
        <View className="w-40 h-40 rounded-full bg-[#B87B56] items-center justify-center -mt-20 mb-4 overflow-hidden border-4 border-[#B87B56]">
          <Image
            source={require("@/assets/images/Dog_Login.png")}
            className="w-36 h-36"
            resizeMode="contain"
          />
        </View>
        <TextInput
          placeholder="Nome"
          placeholderTextColor="#B87B56"
          className="w-full bg-[#F8F3EC] border border-[#B87B56] rounded-lg px-4 py-3 mb-3 text-[#B87B56] font-semibold"
        />
        <TextInput
          placeholder="Email"
          placeholderTextColor="#B87B56"
          className="w-full bg-[#F8F3EC] border border-[#B87B56] rounded-lg px-4 py-3 mb-3 text-[#B87B56] font-semibold"
        />
        <TextInput
          placeholder="Senha"
          placeholderTextColor="#B87B56"
          secureTextEntry
          className="w-full bg-[#F8F3EC] border border-[#B87B56] rounded-lg px-4 py-3 mb-4 text-[#B87B56] font-semibold"
        />
        <TouchableOpacity className="w-full bg-[#8DC6CE] rounded-lg py-3 mb-3">
          <Text className="text-white text-center font-bold text-base">
            CADASTRAR
          </Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.back()}>
          <Text className="text-[#B87B56] font-bold underline text-center">
            Já tem conta? Entrar
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

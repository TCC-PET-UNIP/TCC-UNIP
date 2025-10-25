import { useEffect, useState } from "react";
import { View, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import API_CONFIG, { getAuthData } from "../services/apiConfig";
import "../styles/global.css";
import Login from "../Screens/Login";

export default function App() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const { access } = await getAuthData();
        if (access) router.replace("/home");
        else router.replace("/login");
      } catch {
        router.replace("/login");
      } finally {
        setChecking(false);
      }
    };
    checkSession();
  }, [router]);

  if (checking) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator />
      </View>
    );
  }

  return <Login />;
}

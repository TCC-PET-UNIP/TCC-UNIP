import { useRouter } from "expo-router";
import { useRef, useState } from "react";
import {
  View,
  Text,
  Animated,
  PanResponder,
  Dimensions,
  Image,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import Feather from "@expo/vector-icons/Feather";
import AsyncStorage from "@react-native-async-storage/async-storage";

const SCREEN_WIDTH = Dimensions.get("window").width;
const SWIPE_THRESHOLD = 120;
const SWIPE_OUT_DURATION = 250;

const mockProfiles = [
  {
    id: "1",
    name: "Luna",
    age: 2,
    breed: "Beagle",
    image: require("@/assets/images/Dog_Thor1.jpg"),
  },
  {
    id: "2",
    name: "Simba",
    age: 3,
    breed: "Gato",
    image: require("@/assets/images/Cat.jpg"),
  },
  {
    id: "3",
    name: "Mila",
    age: 1,
    breed: "Poodle",
    image: require("@/assets/images/Dog_Login.png"),
  },
];

export default function Home() {
  const router = useRouter();
  const goToLogin = async () => {
    try {
      await AsyncStorage.clear();
    } catch (err) {
      console.warn("Erro limpando AsyncStorage:", err);
    } finally {
      router.push("/login");
    }
  };

  const [index, setIndex] = useState(0);
  const position = useRef(new Animated.ValueXY()).current;

  // interpolations
  const rotate = position.x.interpolate({
    inputRange: [-SCREEN_WIDTH * 1.5, 0, SCREEN_WIDTH * 1.5],
    outputRange: ["-25deg", "0deg", "25deg"],
    extrapolate: "clamp",
  });

  const likeOpacity = position.x.interpolate({
    inputRange: [0, SWIPE_THRESHOLD],
    outputRange: [0, 1],
    extrapolate: "clamp",
  });

  const nopeOpacity = position.x.interpolate({
    inputRange: [-SWIPE_THRESHOLD, 0],
    outputRange: [1, 0],
    extrapolate: "clamp",
  });

  // PanResponder criado diretamente e mantido em ref
  const panResponderRef = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gesture) => {
        position.setValue({ x: gesture.dx, y: gesture.dy });
      },
      onPanResponderRelease: (_, gesture) => {
        if (gesture.dx > SWIPE_THRESHOLD) {
          forceSwipe("right");
        } else if (gesture.dx < -SWIPE_THRESHOLD) {
          forceSwipe("left");
        } else {
          resetPosition();
        }
      },
    })
  );

  const forceSwipe = (direction: "left" | "right") => {
    const xDest =
      direction === "right" ? SCREEN_WIDTH + 100 : -SCREEN_WIDTH - 100;
    Animated.timing(position, {
      toValue: { x: xDest, y: 0 }, // corrigido: definir x explicitamente e y = 0
      duration: SWIPE_OUT_DURATION,
      useNativeDriver: true,
    }).start(() => onSwipeComplete(direction));
  };

  const onSwipeComplete = (_direction: "left" | "right") => {
    const next = index + 1;
    position.setValue({ x: 0, y: 0 });
    setIndex(next);
  };

  const resetPosition = () => {
    Animated.spring(position, {
      toValue: { x: 0, y: 0 },
      useNativeDriver: true,
      friction: 6,
    }).start();
  };

  const handleReset = () => {
    setIndex(0);
    position.setValue({ x: 0, y: 0 });
  };

  const renderCards = () => {
    if (index >= mockProfiles.length) {
      return (
        <View style={styles.noMore}>
          <Text style={styles.noMoreText}>Sem mais pets por enquanto</Text>
          <TouchableOpacity style={styles.resetBtn} onPress={handleReset}>
            <Text style={styles.resetText}>Reiniciar</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return mockProfiles
      .map((item, i) => {
        if (i < index) return null;

        if (i === index) {
          return (
            <Animated.View
              key={item.id}
              style={[
                styles.card,
                {
                  transform: [
                    { translateX: position.x },
                    { translateY: position.y },
                    { rotate },
                  ],
                },
              ]}
              {...panResponderRef.current.panHandlers}
            >
              <Animated.View
                style={[styles.badge, { left: 20, opacity: nopeOpacity }]}
              >
                <Text style={[styles.badgeText, { color: "#B87B56" }]}>
                  NOPE
                </Text>
              </Animated.View>

              <Animated.View
                style={[styles.badge, { right: 20, opacity: likeOpacity }]}
              >
                <Text style={[styles.badgeText, { color: "#3CB371" }]}>
                  LIKE
                </Text>
              </Animated.View>

              <Image
                source={item.image}
                style={styles.image}
                resizeMode="cover"
              />
              <View style={styles.info}>
                <Text style={styles.name}>
                  {item.name}, {item.age}
                </Text>
                <Text style={styles.breed}>{item.breed}</Text>
              </View>
            </Animated.View>
          );
        }

        return (
          <Animated.View
            key={item.id}
            style={[
              styles.card,
              {
                top: 10 * (i - index),
                transform: [{ scale: 1 - 0.03 * (i - index) }],
              },
            ]}
          >
            <Image
              source={item.image}
              style={styles.image}
              resizeMode="cover"
            />
            <View style={styles.info}>
              <Text style={styles.name}>
                {item.name}, {item.age}
              </Text>
              <Text style={styles.breed}>{item.breed}</Text>
            </View>
          </Animated.View>
        );
      })
      .reverse();
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        onPress={goToLogin}
        style={styles.loginCornerBtn}
        accessibilityLabel="Voltar para login"
        accessibilityRole="button"
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <Feather name="chevron-left" size={22} color="#B87B56" />
      </TouchableOpacity>

      <View style={styles.header}>
        <Text style={styles.headerText}>Adoção</Text>
      </View>

      <View style={styles.deck}>{renderCards()}</View>

      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.actionBtn, { backgroundColor: "#F4A6A6" }]}
          onPress={() => forceSwipe("left")}
        >
          <Feather name="x" size={28} color="#fff" />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionBtn, { backgroundColor: "#8DC6CE" }]}
          onPress={() => forceSwipe("right")}
        >
          <Feather name="heart" size={24} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#B87B56",
    alignItems: "center",
    paddingTop: 40,
  },
  loginCornerBtn: {
    position: "absolute",
    top: 44,
    left: 14,
    zIndex: 999,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#F8F3EC",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 20,
  },
  header: { width: "100%", alignItems: "center", marginBottom: 8 },
  headerText: { color: "#F8F3EC", fontSize: 22, fontWeight: "700" },

  deck: {
    width: "92%",
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    maxWidth: 420,
  },

  card: {
    position: "absolute",
    width: "100%",
    height: 420,
    backgroundColor: "#F8F3EC",
    borderRadius: 22,
    overflow: "hidden",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 6,
  },

  image: { width: "100%", height: 330 },

  info: {
    padding: 12,
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  name: { color: "#ad3434", fontSize: 18, fontWeight: "700" },
  breed: { color: "#6b6b6b", fontSize: 14 },

  badge: {
    position: "absolute",
    top: 18,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: "rgba(255,255,255,0.85)",
    zIndex: 10,
  },
  badgeText: { fontWeight: "800", fontSize: 16 },

  actions: {
    width: "92%",
    maxWidth: 420,
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 28,
  },
  actionBtn: {
    width: 68,
    height: 68,
    borderRadius: 34,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.18,
    shadowRadius: 6,
    elevation: 5,
  },

  noMore: {
    width: "100%",
    height: 420,
    backgroundColor: "#F8F3EC",
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  noMoreText: {
    color: "#ad3434",
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 12,
  },
  resetBtn: {
    backgroundColor: "#8DC6CE",
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 10,
  },
  resetText: { color: "#fff", fontWeight: "700" },
});

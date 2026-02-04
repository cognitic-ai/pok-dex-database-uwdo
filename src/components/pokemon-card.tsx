import { Image } from "expo-image";
import { Link } from "expo-router";
import { Pressable, Text, View } from "react-native";
import * as AC from "@bacons/apple-colors";
import {
  capitalizeFirst,
  formatPokemonId,
  getTypeColor,
} from "@/utils/pokemon-types";

export interface Pokemon {
  id: number;
  name: string;
  types: string[];
  sprite: string;
}

interface PokemonCardProps {
  pokemon: Pokemon;
}

export default function PokemonCard({ pokemon }: PokemonCardProps) {
  const primaryColor = getTypeColor(pokemon.types[0]);

  return (
    <Link href={`/pokemon/${pokemon.id}`} asChild>
      <Pressable>
        {({ pressed }) => (
          <View
            style={{
              backgroundColor: primaryColor,
              borderRadius: 16,
              borderCurve: "continuous",
              padding: 12,
              height: 120,
              flexDirection: "row",
              justifyContent: "space-between",
              overflow: "hidden",
              opacity: pressed ? 0.9 : 1,
              transform: [{ scale: pressed ? 0.98 : 1 }],
            }}
          >
            <View style={{ flex: 1, gap: 6 }}>
              <Text
                style={{
                  color: "rgba(255,255,255,0.7)",
                  fontSize: 12,
                  fontWeight: "600",
                }}
              >
                {formatPokemonId(pokemon.id)}
              </Text>
              <Text
                style={{
                  color: "white",
                  fontSize: 18,
                  fontWeight: "bold",
                }}
              >
                {capitalizeFirst(pokemon.name)}
              </Text>
              <View style={{ flexDirection: "row", gap: 4, flexWrap: "wrap" }}>
                {pokemon.types.map((type) => (
                  <View
                    key={type}
                    style={{
                      backgroundColor: "rgba(255,255,255,0.25)",
                      paddingHorizontal: 8,
                      paddingVertical: 4,
                      borderRadius: 12,
                      borderCurve: "continuous",
                    }}
                  >
                    <Text
                      style={{
                        color: "white",
                        fontSize: 11,
                        fontWeight: "600",
                      }}
                    >
                      {capitalizeFirst(type)}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
            <Image
              source={{ uri: pokemon.sprite }}
              style={{
                width: 96,
                height: 96,
                position: "absolute",
                right: 4,
                bottom: 4,
              }}
              contentFit="contain"
            />
            <View
              style={{
                position: "absolute",
                right: -20,
                bottom: -20,
                width: 120,
                height: 120,
                borderRadius: 60,
                backgroundColor: "rgba(255,255,255,0.1)",
              }}
            />
          </View>
        )}
      </Pressable>
    </Link>
  );
}

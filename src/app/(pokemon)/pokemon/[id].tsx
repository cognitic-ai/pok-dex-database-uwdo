import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  Text,
  View,
} from "react-native";
import { Image } from "expo-image";
import { Stack, useLocalSearchParams } from "expo-router";
import * as AC from "@bacons/apple-colors";
import {
  capitalizeFirst,
  formatPokemonId,
  getTypeColor,
} from "@/utils/pokemon-types";

interface PokemonDetail {
  id: number;
  name: string;
  height: number;
  weight: number;
  types: { type: { name: string } }[];
  stats: { base_stat: number; stat: { name: string } }[];
  abilities: { ability: { name: string }; is_hidden: boolean }[];
  sprites: {
    other: {
      "official-artwork": {
        front_default: string;
      };
    };
  };
}

interface PokemonSpecies {
  flavor_text_entries: {
    flavor_text: string;
    language: { name: string };
  }[];
  genera: {
    genus: string;
    language: { name: string };
  }[];
}

const statLabels: Record<string, string> = {
  hp: "HP",
  attack: "Attack",
  defense: "Defense",
  "special-attack": "Sp. Atk",
  "special-defense": "Sp. Def",
  speed: "Speed",
};

function StatBar({ label, value, color }: { label: string; value: number; color: string }) {
  const maxStat = 255;
  const percentage = (value / maxStat) * 100;

  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
      <Text
        style={{
          color: AC.secondaryLabel,
          fontSize: 13,
          width: 70,
          textAlign: "right",
        }}
      >
        {label}
      </Text>
      <Text
        style={{
          color: AC.label,
          fontSize: 13,
          fontWeight: "600",
          width: 35,
          fontVariant: ["tabular-nums"],
        }}
        selectable
      >
        {value}
      </Text>
      <View
        style={{
          flex: 1,
          height: 6,
          backgroundColor: AC.tertiarySystemFill,
          borderRadius: 3,
          overflow: "hidden",
        }}
      >
        <View
          style={{
            width: `${percentage}%`,
            height: "100%",
            backgroundColor: color,
            borderRadius: 3,
          }}
        />
      </View>
    </View>
  );
}

export default function PokemonDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [pokemon, setPokemon] = useState<PokemonDetail | null>(null);
  const [species, setSpecies] = useState<PokemonSpecies | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [pokemonRes, speciesRes] = await Promise.all([
          fetch(`https://pokeapi.co/api/v2/pokemon/${id}`),
          fetch(`https://pokeapi.co/api/v2/pokemon-species/${id}`),
        ]);
        const [pokemonData, speciesData] = await Promise.all([
          pokemonRes.json(),
          speciesRes.json(),
        ]);
        setPokemon(pokemonData);
        setSpecies(speciesData);
      } catch (error) {
        console.error("Failed to fetch Pokemon details:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [id]);

  if (loading || !pokemon) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: AC.systemBackground,
        }}
      >
        <ActivityIndicator size="large" color={AC.systemRed as string} />
      </View>
    );
  }

  const primaryType = pokemon.types[0].type.name;
  const primaryColor = getTypeColor(primaryType);

  const flavorText = species?.flavor_text_entries
    .find((e) => e.language.name === "en")
    ?.flavor_text.replace(/\f|\n/g, " ");

  const genus = species?.genera.find((g) => g.language.name === "en")?.genus;

  return (
    <>
      <Stack.Screen
        options={{
          title: capitalizeFirst(pokemon.name),
          headerTintColor: "white",
          headerStyle: { backgroundColor: primaryColor },
          headerLargeTitle: false,
          headerTransparent: false,
        }}
      />
      <ScrollView
        style={{ flex: 1, backgroundColor: AC.systemBackground }}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        <View
          style={{
            backgroundColor: primaryColor,
            paddingTop: 8,
            paddingBottom: 32,
            alignItems: "center",
            borderBottomLeftRadius: 32,
            borderBottomRightRadius: 32,
          }}
        >
          <Text
            style={{
              color: "rgba(255,255,255,0.6)",
              fontSize: 14,
              fontWeight: "600",
            }}
          >
            {formatPokemonId(pokemon.id)}
          </Text>
          {genus && (
            <Text
              style={{
                color: "rgba(255,255,255,0.8)",
                fontSize: 14,
                marginTop: 2,
              }}
            >
              {genus}
            </Text>
          )}
          <Image
            source={{
              uri: pokemon.sprites.other["official-artwork"].front_default,
            }}
            style={{ width: 200, height: 200 }}
            contentFit="contain"
          />
          <View style={{ flexDirection: "row", gap: 8, marginTop: 8 }}>
            {pokemon.types.map((t) => (
              <View
                key={t.type.name}
                style={{
                  backgroundColor: "rgba(255,255,255,0.25)",
                  paddingHorizontal: 16,
                  paddingVertical: 6,
                  borderRadius: 16,
                  borderCurve: "continuous",
                }}
              >
                <Text style={{ color: "white", fontWeight: "600" }}>
                  {capitalizeFirst(t.type.name)}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {flavorText && (
          <View style={{ padding: 20 }}>
            <Text
              style={{
                color: AC.secondaryLabel,
                fontSize: 15,
                lineHeight: 22,
                textAlign: "center",
              }}
              selectable
            >
              {flavorText}
            </Text>
          </View>
        )}

        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-around",
            paddingVertical: 16,
            marginHorizontal: 20,
            backgroundColor: AC.secondarySystemBackground,
            borderRadius: 16,
            borderCurve: "continuous",
          }}
        >
          <View style={{ alignItems: "center" }}>
            <Text style={{ color: AC.label, fontSize: 18, fontWeight: "bold" }}>
              {(pokemon.weight / 10).toFixed(1)} kg
            </Text>
            <Text style={{ color: AC.secondaryLabel, fontSize: 13 }}>Weight</Text>
          </View>
          <View
            style={{ width: 1, backgroundColor: AC.separator, height: "100%" }}
          />
          <View style={{ alignItems: "center" }}>
            <Text style={{ color: AC.label, fontSize: 18, fontWeight: "bold" }}>
              {(pokemon.height / 10).toFixed(1)} m
            </Text>
            <Text style={{ color: AC.secondaryLabel, fontSize: 13 }}>Height</Text>
          </View>
        </View>

        <View style={{ padding: 20 }}>
          <Text
            style={{
              color: AC.label,
              fontSize: 18,
              fontWeight: "bold",
              marginBottom: 16,
            }}
          >
            Base Stats
          </Text>
          <View style={{ gap: 12 }}>
            {pokemon.stats.map((stat) => (
              <StatBar
                key={stat.stat.name}
                label={statLabels[stat.stat.name] || stat.stat.name}
                value={stat.base_stat}
                color={primaryColor}
              />
            ))}
          </View>
        </View>

        <View style={{ padding: 20, paddingTop: 0 }}>
          <Text
            style={{
              color: AC.label,
              fontSize: 18,
              fontWeight: "bold",
              marginBottom: 12,
            }}
          >
            Abilities
          </Text>
          <View style={{ gap: 8 }}>
            {pokemon.abilities.map((a) => (
              <View
                key={a.ability.name}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <View
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: primaryColor,
                  }}
                />
                <Text style={{ color: AC.label, fontSize: 15 }}>
                  {capitalizeFirst(a.ability.name.replace("-", " "))}
                </Text>
                {a.is_hidden && (
                  <Text
                    style={{
                      color: AC.tertiaryLabel,
                      fontSize: 12,
                      fontStyle: "italic",
                    }}
                  >
                    (Hidden)
                  </Text>
                )}
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </>
  );
}

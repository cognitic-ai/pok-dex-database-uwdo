import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  Text,
  View,
} from "react-native";
import { useNavigation } from "expo-router";
import * as AC from "@bacons/apple-colors";
import PokemonCard, { Pokemon } from "@/components/pokemon-card";

const POKEMON_LIMIT = 151;

interface PokemonListItem {
  name: string;
  url: string;
}

interface PokemonDetails {
  id: number;
  name: string;
  types: { type: { name: string } }[];
  sprites: {
    other: {
      "official-artwork": {
        front_default: string;
      };
    };
  };
}

export default function PokedexScreen() {
  const [pokemon, setPokemon] = useState<Pokemon[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");
  const navigation = useNavigation();

  useEffect(() => {
    navigation.setOptions({
      headerSearchBarOptions: {
        placeholder: "Search Pokémon",
        onChangeText: (e: { nativeEvent: { text: string } }) => {
          setSearch(e.nativeEvent.text);
        },
        onCancelButtonPress: () => setSearch(""),
      },
    });
  }, [navigation]);

  const fetchPokemon = useCallback(async () => {
    try {
      const response = await fetch(
        `https://pokeapi.co/api/v2/pokemon?limit=${POKEMON_LIMIT}`
      );
      const data = await response.json();

      const detailedPokemon = await Promise.all(
        data.results.map(async (item: PokemonListItem) => {
          const detailRes = await fetch(item.url);
          const detail: PokemonDetails = await detailRes.json();
          return {
            id: detail.id,
            name: detail.name,
            types: detail.types.map((t) => t.type.name),
            sprite: detail.sprites.other["official-artwork"].front_default,
          };
        })
      );

      setPokemon(detailedPokemon);
    } catch (error) {
      console.error("Failed to fetch Pokemon:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchPokemon();
  }, [fetchPokemon]);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    fetchPokemon();
  }, [fetchPokemon]);

  const filteredPokemon = pokemon.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
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
        <Text style={{ color: AC.secondaryLabel, marginTop: 12 }}>
          Loading Pokédex...
        </Text>
      </View>
    );
  }

  return (
    <FlatList
      data={filteredPokemon}
      keyExtractor={(item) => item.id.toString()}
      numColumns={2}
      contentContainerStyle={{ padding: 12, gap: 12 }}
      columnWrapperStyle={{ gap: 12 }}
      contentInsetAdjustmentBehavior="automatic"
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
      }
      renderItem={({ item }) => (
        <View style={{ flex: 1 }}>
          <PokemonCard pokemon={item} />
        </View>
      )}
      ListEmptyComponent={
        <View style={{ padding: 40, alignItems: "center" }}>
          <Text style={{ color: AC.secondaryLabel, fontSize: 16 }}>
            No Pokémon found
          </Text>
        </View>
      }
    />
  );
}

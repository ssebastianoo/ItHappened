import { StatusBar } from "expo-status-bar";
import {
  StyleSheet,
  Text,
  View,
  Pressable,
  TextInput,
  ScrollView,
  RefreshControl,
  SafeAreaView,
} from "react-native";
import { useState, useEffect } from "react";
import Config from "react-native-config";

type Event = {
  id: number;
  date: number;
  name: string;
  description: string;
};

export default function App() {
  const [events, setEvents] = useState<Event[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<null | string>(null);
  const [name, setName] = useState<string>("");
  const [description, setDescription] = useState<string>("");

  async function getEvents() {
    setEvents([]);

    const controller = new AbortController();

    setTimeout(() => {
      controller.abort();
    }, 10000);

    try {
      const response = await fetch(`${Config.API_URL}/events`, {
        signal: controller.signal,
      });
      const data = (await response.json()) as Event[];

      data.sort((a, b) => {
        return a.date < b.date ? 1 : -1;
      });

      setEvents(data);
      setRefreshing(false);
      setError(null);
    } catch (err) {
      setRefreshing(false);
      setError("Something went wrong. Please try again later.");
    }
  }

  function onRefresh() {
    setRefreshing(true);
    getEvents();
  }

  async function createEvent() {
    if (name === "" || description === "") {
      return;
    }

    const controller = new AbortController();
    setTimeout(() => {
      controller.abort();
    }, 10000);

    try {
      const res = await fetch(`${Config.API_URL}/events`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          description,
        }),
      });
      if (res.status === 200 || res.status === 201) {
        getEvents();
        setName("");
        setDescription("");
      }
    } catch (err) {
      setError("Something went wrong. Please try again later.");
    }
  }

  useEffect(() => {
    getEvents();
  }, []);

  return (
    <SafeAreaView
      style={{
        flex: 1,
      }}
    >
      <ScrollView
        style={styles.container}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.create}>
          <TextInput
            style={styles.input}
            placeholder="Name"
            placeholderTextColor="rgba(255,255,255,0.4)"
            onChangeText={(text) => setName(text)}
            value={name}
          />
          <TextInput
            style={styles.input}
            placeholder="Description"
            placeholderTextColor="rgba(255,255,255,0.4)"
            onChangeText={(text) => setDescription(text)}
            onSubmitEditing={createEvent}
            value={description}
          />
          <View style={{ alignItems: "flex-end" }}>
            <Pressable onPress={createEvent}>
              <Text style={styles.button}>Create</Text>
            </Pressable>
          </View>
        </View>
        {error ? (
          <Text style={styles.text}>{error}</Text>
        ) : (
          <View style={styles.events}>
            {events.length >= 1 ? (
              events.map((event) => (
                <View key={event.id} style={styles.event}>
                  <View>
                    <Text style={styles.eventName}>{event.name}</Text>
                    <Text style={styles.eventDate}>
                      {new Date(event.date).toLocaleString()}
                    </Text>
                  </View>
                  <Text style={styles.eventDescription}>
                    {event.description}
                  </Text>
                </View>
              ))
            ) : (
              <Text style={styles.text}>Loading...</Text>
            )}
          </View>
        )}
        <StatusBar style="auto" />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1d1e1f",
    padding: 40,
  },

  text: {
    color: "#ffffff",
  },

  events: {
    flex: 1,
    flexDirection: "column",
    marginTop: 20,
  },

  event: {
    paddingVertical: 20,
    borderBottomColor: "#ffffff",
    borderBottomWidth: 1,
  },

  eventName: {
    color: "#ffffff",
    fontSize: 30,
  },

  eventDescription: {
    color: "#ffffff",
    fontSize: 17,
  },

  eventDate: {
    color: "#ffffff",
    fontSize: 15,
  },

  create: {
    marginTop: 30,
    gap: 5,
  },

  input: {
    backgroundColor: "rgba(0,0,0,0.2)",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 5,
    color: "#ffffff",
    fontSize: 15,
  },

  button: {
    backgroundColor: "rgba(0,0,0,0.2)",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 5,
    color: "#ffffff",
    fontSize: 15,
  },
});

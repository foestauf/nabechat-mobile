import axios from "axios";
import { useEffect, useState } from "react";
import { View, Text } from "react-native";
import EditScreenInfo from "./EditScreenInfo";
import * as Location from "expo-location";

type Thread = {
  _id: number;
  title: string;
  createdAt: string;
  updatedAt: string;
};

export const Threads = ({ location }: { location: Location.LocationObject }) => {
  const [threads, setThreads] = useState<null | Thread[]>(null);
  const [errorMsg, setErrorMsg] = useState<null | string>(null);

  console.log({ location });

  const getThreads = async () => {
    const { latitude, longitude } = location.coords;
    const { data } = await axios.get<Thread[]>(`http://localhost:3000/threads?lat=${latitude}&lng=${longitude}`);
    console.log("thread data", data);
    setThreads(data);
  };

  useEffect(() => {
    getThreads();
  }, [location]);

  return (
    <View>
      <Text>Threads Be Here</Text>
      <View />
      {threads && threads.map((thread) => <Text key={thread._id}>{thread.title}</Text>)}
      <EditScreenInfo path="components/Threads.tsx" />
    </View>
  );
};

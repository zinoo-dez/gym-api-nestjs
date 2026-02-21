import { useEffect, useState } from "react";

import NetInfo from "@react-native-community/netinfo";

export function useOfflineStatus() {
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      const offline = !state.isConnected || !state.isInternetReachable;
      setIsOffline(offline);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  return { isOffline };
}

import { useEffect } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useClerk } from "@clerk/nextjs";

export default function PushNotifications() {
  const { user } = useClerk();
  const userData = useQuery(api.functions.getUser, { clerkId: user?.id }) || null;
  const registerPushSubscription = useMutation(api.functions.registerPushSubscription);

  useEffect(() => {
    if (!userData || !("serviceWorker" in navigator) || !("PushManager" in window)) {
      return;
    }

    const registerServiceWorker = async () => {
      try {
        const registration = await navigator.serviceWorker.register("/sw.js");
        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
        });

        await registerPushSubscription({
          userId: userData._id,
          subscription: {
            endpoint: subscription.endpoint,
            keys: {
              p256dh: arrayBufferToBase64(subscription.getKey("p256dh")!),
              auth: arrayBufferToBase64(subscription.getKey("auth")!),
            },
          },
        });
      } catch (error) {
        console.error(`Failed to register push subscription: ${(error as Error).message}`);
      }
    };

    registerServiceWorker();
  }, [userData, registerPushSubscription]);

  return null;
}

function arrayBufferToBase64(buffer: ArrayBuffer) {
  return btoa(String.fromCharCode(...new Uint8Array(buffer)));
}
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useClerk } from "@clerk/nextjs";
import { useEffect } from "react";

export default function Notifications() {
  const { user } = useClerk();
  const notifications = useQuery(api.functions.getNotifications, { userId: user?.id }) || [];
  const markRead = useMutation(api.functions.markNotificationRead);

  useEffect(() => {
    // Real-time subscription handled by useQuery
  }, [notifications]);

  return (
    <div className="fixed top-4 right-4 w-80 max-h-96 overflow-y-auto bg-white shadow-lg rounded-lg p-4">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Notifications</h3>
      {notifications.length === 0 ? (
        <p className="text-gray-600">No notifications</p>
      ) : (
        <ul>
          {notifications.map((notification) => (
            <li
              key={notification._id}
              className={`p-2 mb-2 rounded ${notification.read ? "bg-gray-100" : "bg-blue-100"}`}
            >
              <p className="text-sm text-gray-700">{notification.message}</p>
              <p className="text-xs text-gray-500">{new Date(notification.createdAt).toLocaleString()}</p>
              {!notification.read && (
                <button
                  onClick={() => markRead({ notificationId: notification._id })}
                  className="text-xs text-blue-600 hover:underline"
                >
                  Mark as read
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
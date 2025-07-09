"use client"

import { SignUp } from "@clerk/nextjs";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useClerk } from "@clerk/nextjs";

export default function RegisterPage() {
  const [role, setRole] = useState<"attendee" | "organizer">("attendee");
  const { client } = useClerk();
  const router = useRouter();

  const handleRoleToggle = async () => {
    const newRole = role === "attendee" ? "organizer" : "attendee";
    setRole(newRole);

    // Update Clerk publicMetadata after sign-up
    if (client?.user) {
      await client.user.update({
        publicMetadata: { role: newRole },
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center">Join [Brand Name]</h1>
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Are you an event organizer?</label>
          <button
            onClick={handleRoleToggle}
            className={`px-4 py-2 rounded ${role === "organizer" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700"}`}
          >
            {role === "organizer" ? "Yes, I'm an organizer" : "No, I'm an attendee"}
          </button>
        </div>
        <SignUp
          afterSignUpUrl={role === "organizer" ? "/b2b/organizer/dashboard" : "/b2c/events"}
          signInUrl="/b2c/sign-in"
        />
      </div>
    </div>
  );
}
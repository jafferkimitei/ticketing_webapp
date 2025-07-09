import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useClerk } from "@clerk/nextjs";

export default function PreferencesPage() {
  const { user } = useClerk();
  const userData = useQuery(api.functions.getUser, { clerkId: user?.id }) || null;
  const updatePreferences = useMutation(api.functions.updateUserPreferences);
  const categories = ["Concert", "Conference", "Workshop", "Festival", "Sports"];
  const locations = ["Nairobi", "Mombasa", "Kisumu", "Eldoret", "Nakuru"];
  const [formData, setFormData] = useState({
    preferredCategories: userData?.preferredCategories || [],
    preferredLocations: userData?.preferredLocations || [],
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updatePreferences({
        userId: userData!._id,
        preferredCategories: formData.preferredCategories,
        preferredLocations: formData.preferredLocations,
      });
      alert("Preferences updated!");
    } catch (error) {
      alert(`Error: ${(error as Error).message}`);
    }
  };

  const toggleSelection = (item: string, type: "category" | "location") => {
    const key = type === "category" ? "preferredCategories" : "preferredLocations";
    const current = formData[key];
    setFormData({
      ...formData,
      [key]: current.includes(item) ? current.filter((i) => i !== item) : [...current, item],
    });
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8 flex flex-col items-center" aria-labelledby="preferences-heading">
      <div className="w-full max-w-md px-4">
        <h1 id="preferences-heading" className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
          Event Preferences
        </h1>
        <form onSubmit={handleSubmit} className="bg-white p-4 sm:p-6 rounded-lg shadow-md">
          <div className="mb-4">
            <label className="block text-gray-700 mb-2" htmlFor="categories">Preferred Categories</label>
            <div id="categories" role="group" aria-label="Select preferred event categories">
              {categories.map((cat) => (
                <label key={cat} className="inline-flex items-center mr-4 mb-2">
                  <input
                    type="checkbox"
                    checked={formData.preferredCategories.includes(cat)}
                    onChange={() => toggleSelection(cat, "category")}
                    className="mr-2"
                    aria-label={`Select ${cat} category`}
                  />
                  {cat}
                </label>
              ))}
            </div>
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2" htmlFor="locations">Preferred Locations</label>
            <div id="locations" role="group" aria-label="Select preferred event locations">
              {locations.map((loc) => (
                <label key={loc} className="inline-flex items-center mr-4 mb-2">
                  <input
                    type="checkbox"
                    checked={formData.preferredLocations.includes(loc)}
                    onChange={() => toggleSelection(loc, "location")}
                    className="mr-2"
                    aria-label={`Select ${loc} location`}
                  />
                  {loc}
                </label>
              ))}
            </div>
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-600"
            aria-label="Save preferences"
          >
            Save Preferences
          </button>
        </form>
      </div>
    </div>
  );
}
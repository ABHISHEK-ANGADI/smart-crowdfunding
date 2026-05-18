import React, { useState } from "react";
import { Lightbulb, Upload, Loader } from "lucide-react";
import toast from "react-hot-toast";

const CreateCampaign = ({ onCreate, isCreating }) => {
  const [formData, setFormData] = useState({
    title: "",
    goal: "",
    duration: "30",
  });
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageCID, setImageCID] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size must be less than 5MB");
      return;
    }

    setSelectedImage(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const uploadImageToPinata = async (file) => {
    try {
      setUploadingImage(true);
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
        method: "POST",
        headers: {
          pinata_api_key: import.meta.env.VITE_PINATA_API_KEY,
          pinata_secret_api_key: import.meta.env.VITE_PINATA_SECRET_API_KEY,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to upload image to Pinata");
      }

      const data = await response.json();
      const cid = data.IpfsHash;
      setImageCID(cid);
      toast.success("Image uploaded to IPFS!");
      return cid;
    } catch (error) {
      console.error("Pinata upload error:", error);
      toast.error("Failed to upload image: " + error.message);
      return null;
    } finally {
      setUploadingImage(false);
    }
  };

  const handleImageUpload = async () => {
    if (!selectedImage) {
      toast.error("Please select an image first");
      return;
    }
    await uploadImageToPinata(selectedImage);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.goal || !formData.duration) return;
    await onCreate(
      formData.title,
      formData.goal,
      parseFloat(formData.duration),
      imageCID
    );
    setFormData({ title: "", goal: "", duration: "30" });
    setSelectedImage(null);
    setImagePreview(null);
    setImageCID("");
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-8 shadow-sm dark:shadow-slate-900/50">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">
          Create New Campaign
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-6">
          Launch your crowdfunding campaign and bring your ideas to life
        </p>

        {/* Gas fee notice */}
        <div className="mb-6 p-4 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-700 rounded-lg flex items-start gap-3">
          <Lightbulb size={18} className="text-indigo-600 mt-0.5 shrink-0" />
          <p className="text-sm text-slate-700 dark:text-slate-200">
            Creating a campaign requires a small gas fee paid to the Ethereum
            network. No platform fees are charged.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Campaign Title */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Campaign Title *
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              placeholder="Enter a compelling title for your campaign"
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Description (optional) */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Description
            </label>
            <textarea
              rows="4"
              placeholder="Describe your campaign, goals, and how funds will be used"
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Description is stored off-chain (demo only)
            </p>
          </div>

          {/* Target Amount & Duration */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Target Amount (ETH) *
              </label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                required
                value={formData.goal}
                onChange={(e) =>
                  setFormData({ ...formData, goal: e.target.value })
                }
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Duration (Days) *
              </label>
              <input
                type="number"
                step="any"
                min="0.001"
                required
                value={formData.duration}
                onChange={(e) =>
                  setFormData({ ...formData, duration: e.target.value })
                }
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Campaign Image */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Campaign Image
            </label>
            <div className="space-y-3">
              {imagePreview && (
                <div className="relative w-full h-48 rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-900">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                  {imageCID && (
                    <div className="absolute inset-0 bg-green-500/20 flex items-center justify-center">
                      <span className="text-white font-medium text-sm bg-green-600 px-3 py-1 rounded">
                        ✓ Uploaded
                      </span>
                    </div>
                  )}
                </div>
              )}
              <div className="flex gap-2">
                <label className="flex-1">
                  <div className="flex items-center justify-center px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 border-dashed rounded-lg cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-900 transition">
                    <Upload size={16} className="mr-2 text-slate-600 dark:text-slate-400" />
                    <span className="text-sm text-slate-600 dark:text-slate-400">
                      Choose image
                    </span>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    disabled={uploadingImage}
                    className="hidden"
                  />
                </label>
                {selectedImage && !imageCID && (
                  <button
                    type="button"
                    onClick={handleImageUpload}
                    disabled={uploadingImage}
                    className="px-4 py-3 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition flex items-center justify-center gap-2"
                  >
                    {uploadingImage ? (
                      <>
                        <Loader size={16} className="animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload size={16} />
                        Upload
                      </>
                    )}
                  </button>
                )}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {imageCID
                  ? `✓ Image uploaded to IPFS: ${imageCID.slice(0, 10)}...`
                  : "Optional: Upload a campaign image (max 5MB)"}
              </p>
            </div>
          </div>

          <button
            type="submit"
            disabled={isCreating}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isCreating ? "Creating..." : "Create Campaign"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateCampaign;
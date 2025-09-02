"use client";
import React, { useEffect } from "react";
import InputGroup from "@/components/FormElements/InputGroup";
import { TextAreaGroup } from "@/components/FormElements/InputGroup/text-area";
import { ShowcaseSection } from "@/components/Layouts/showcase-section";
import { X } from "lucide-react";
import { toast } from "react-hot-toast";

export default function ContactForm() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  const [formData, setFormData] = React.useState<any>({
    siteTitle: "",
    email: "",
    contactNo: "",
    registeredAddress : "",
    officeAddress: "",
    facebook: "",
    instagram: "",
    twitter: "",
    linkedin: "",
    registeredIframe: "",
    officeIframe: "",
  });
  const [selectedLogo, setSelectedLogo] = React.useState<File | null>(null);
  const [clientLogos, setClientLogos] = React.useState<File[]>([]);
  const [existingLogo, setExistingLogo] = React.useState<string | null>(null);
  const [existingClients, setExistingClients] = React.useState<string[]>([]);
  const [error, setError] = React.useState<string>("");

  // ✅ Fetch existing settings
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch(`${apiUrl}/api/site-settings`);
        const json = await res.json();
        if (json.success && json.data) {
          setFormData({
            siteTitle: json.data.siteTitle || "",
            email: json.data.email || "",
            contactNo: json.data.contactNo || "",
            registeredAddress: json.data.registeredAddress || "",
            officeAddress: json.data.officeAddress || "",
            facebook: json.data.facebook || "",
            instagram: json.data.instagram || "",
            twitter: json.data.twitter || "",
            linkedin: json.data.linkedin || "",
            registeredIframe: json.data.registeredIframe || "",
            officeIframe: json.data.officeIframe || "",
          });
          setExistingLogo(json.data.logo || null);
          setExistingClients(json.data.clients || []);
        }
      } catch (err) {
        toast.error("Failed to fetch site settings");
      }
    };
    fetchSettings();
  }, []);

  // ✅ Handle text input change
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // ✅ Handle logo change
  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      setError("Logo file size must be less than 2MB");
      return;
    }
    const validTypes = ["image/jpeg", "image/png", "image/svg+xml"];
    if (!validTypes.includes(file.type)) {
      setError("Please upload a valid image file (PNG, JPG, or SVG)");
      return;
    }
    setSelectedLogo(file);
    setExistingLogo(null); // remove old preview
    setError("");
  };

  // ✅ Handle client logo add
  const handleClientLogoAdd = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (clientLogos.length + files.length + existingClients.length > 10) {
      setError("Maximum 10 client logos allowed");
      return;
    }
    setClientLogos((prev) => [...prev, ...files]);
    setError("");
  };

  const handleDeleteExistingClient = (index: number) => {
    setExistingClients((prev) => prev.filter((_, i) => i !== index));
  };
  const handleDeleteNewClient = (index: number) => {
    setClientLogos((prev) => prev.filter((_, i) => i !== index));
  };

  // ✅ Submit form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const fd = new FormData();
    Object.keys(formData).forEach((key) => {
      if (formData[key]) fd.append(key, formData[key]);
    });

    if (selectedLogo) {
      fd.append("logo", selectedLogo);
    }
    clientLogos.forEach((file) => fd.append("clients", file));

    try {
      const res = await fetch(`${apiUrl}/api/site-settings`, {
        method: "PUT",
        body: fd,
      });
      const json = await res.json();
      if (json.success) {
        toast.success("Settings updated successfully");
        setExistingLogo(json.data.logo);
        setExistingClients(json.data.clients || []);
        setClientLogos([]);
        setSelectedLogo(null);
      } else {
        setError(json.message || "Failed to update");
      }
    } catch (err) {
      toast.error("Server error while saving");
    }
  };

  return (
    <ShowcaseSection title="Site Settings" className="!p-6.5">
      <form onSubmit={handleSubmit}>
        {/* Title, Contact, Email */}
        <InputGroup
          label="Title"
          name="siteTitle"
          type="text"
          value={formData.siteTitle}
          handleChange={handleChange}
          className="mb-4.5"
          placeholder="Enter the Title"
        />
        <div className="mb-4.5 flex flex-col gap-4.5 xl:flex-row">
          <InputGroup
            label="Contact No."
            name="contactNo"
            type="text"
            value={formData.contactNo}
            handleChange={handleChange}
            className="w-full xl:w-1/2"
            placeholder="Enter Contact Number"
          />
          <InputGroup
            label="Email"
            name="email"
            type="email"
            value={formData.email}
            handleChange={handleChange}
            className="xl:w-1/2"
            required
            placeholder="Enter email address"
          />
        </div>

        <InputGroup
          label="Registered Address"
          name="registeredAddress"
          type="text"
          value={formData.registeredAddress}
          handleChange={handleChange}
          className="mb-4.5"
          placeholder="Enter Registered Address"
        />
        
        <InputGroup
          label="Corporate Office Address"
          name="officeAddress"
          type="text"
          value={formData.officeAddress}
          handleChange={handleChange}
          className="mb-4.5"
          placeholder="Enter Office Address"
        />

        {/* Logo Upload */}
        <h3 className="mb-4 font-medium text-black dark:text-white">
          Company Logo
        </h3>
        <div className="mb-6 rounded-xl border p-4">
          {existingLogo && !selectedLogo ? (
            <img
              src={existingLogo}
              alt="Company Logo"
              className="h-24 object-contain"
            />
          ) : selectedLogo ? (
            <img
              src={URL.createObjectURL(selectedLogo)}
              alt="New Logo"
              className="h-24 object-contain"
            />
          ) : (
            <p>No logo uploaded</p>
          )}
          <input type="file" accept="image/*" onChange={handleLogoChange} />
        </div>

        {/* Client Logos */}
        <h3 className="mb-4 font-medium text-black dark:text-white">
          Client Logos
        </h3>
        <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {existingClients.map((url, index) => (
            <div key={index} className="relative">
              <img
                src={url}
                className="h-24 rounded-lg border object-contain p-2"
              />
              <button
                type="button"
                onClick={() => handleDeleteExistingClient(index)}
                className="absolute right-0 top-0 rounded-full bg-red-500 p-1 text-white"
              >
                <X size={16} />
              </button>
            </div>
          ))}
          {clientLogos.map((file, index) => (
            <div key={index} className="relative">
              <img
                src={URL.createObjectURL(file)}
                className="h-24 rounded-lg border object-contain p-2"
              />
              <button
                type="button"
                onClick={() => handleDeleteNewClient(index)}
                className="absolute right-0 top-0 rounded-full bg-red-500 p-1 text-white"
              >
                <X size={16} />
              </button>
            </div>
          ))}
          <div>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleClientLogoAdd}
            />
          </div>
        </div>

        {/* Social Links */}
        <div className="mb-4.5 flex flex-col gap-4.5 xl:flex-row">
          <InputGroup
            label="Facebook Link"
            name="facebook"
            type="text"
            value={formData.facebook}
            handleChange={handleChange}
            className="w-full xl:w-1/2"
            placeholder="Enter Facebook Link"
          />
          <InputGroup
            label="Instagram Link"
            name="instagram"
            type="text"
            value={formData.instagram}
            handleChange={handleChange}
            className="xl:w-1/2"
            placeholder="Enter Instagram Link"
          />
        </div>
        <div className="mb-4.5 flex flex-col gap-4.5 xl:flex-row">
          <InputGroup
            label="Twitter Link"
            name="twitter"
            type="text"
            value={formData.twitter}
            handleChange={handleChange}
            className="w-full xl:w-1/2"
            placeholder="Enter Twitter Link"
          />
          <InputGroup
            label="Linkedin Link"
            name="linkedin"
            type="text"
            value={formData.linkedin}
            handleChange={handleChange}
            className="xl:w-1/2"
            placeholder="Enter Linkedin Link"
          />
        </div>

        <TextAreaGroup
          label="Registered Address Iframe"
          name="registeredIframe"
          value={formData.registeredIframe}
          onChange={handleChange}
        />
        
        <TextAreaGroup
          label="Corporate Office Address Iframe"
          name="officeIframe"
          value={formData.officeIframe}
          onChange={handleChange}
        />
          

        {error && <p className="text-red-500">{error}</p>}

        <button
          type="submit"
          className="mt-6 flex justify-center rounded-lg bg-primary p-[13px] font-medium text-white hover:bg-opacity-90"
        >
          Save Settings
        </button>
      </form>
    </ShowcaseSection>
  );
}

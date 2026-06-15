//This file makes the form where the user enters their PC parts

import { useState } from "react";

function SpecsForm({ onSubmit }) {
  //This stores what the user is typing into the form
  const [formData, setFormData] = useState({
    cpu: "",
    gpu: "",
    ram: "",
    budget: "",
    useCase: "",
    motherboard: "",
    psu: "",
    caseName: "",
    monitorResolution: "",
    targetPrograms: ""
  });

  //This updates the form data whenever the user types or selects something
  function handleChange(event) {
    const { name, value } = event.target;

    setFormData((previousData) => ({
      ...previousData,
      [name]: value
    }));
  }

  //This runs when the user clicks Analyze My PC
  function handleSubmit(event) {
    event.preventDefault();
    onSubmit(formData);
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-lg p-6 space-y-5">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">
          Enter your current PC specs
        </h2>

        <p className="text-slate-600 mt-1">
          Fill in what you know. Some fields are optional because not everyone knows every part.
        </p>
      </div>

      {/* Main form inputs */}
      <div className="grid md:grid-cols-2 gap-4">
        <Input label="CPU" name="cpu" value={formData.cpu} onChange={handleChange} required />

        <Input label="GPU" name="gpu" value={formData.gpu} onChange={handleChange} required />

        <Input label="RAM Amount" name="ram" value={formData.ram} onChange={handleChange} required />

        <Input label="Budget" name="budget" value={formData.budget} onChange={handleChange} required />

        <Select
          label="Main Use Case"
          name="useCase"
          value={formData.useCase}
          onChange={handleChange}
          required
          options={[
            "Gaming",
            "School",
            "CAD",
            "Streaming",
            "Video Editing",
            "General Use",
            "Work",
            "Other"
          ]}
        />

        <Input label="Motherboard" name="motherboard" value={formData.motherboard} onChange={handleChange} />

        <Input label="Power Supply / PSU" name="psu" value={formData.psu} onChange={handleChange} />

        <Input label="Case" name="caseName" value={formData.caseName} onChange={handleChange} />

        <Input label="Monitor Resolution" name="monitorResolution" value={formData.monitorResolution} onChange={handleChange} />

        <Input label="Target Games / Programs" name="targetPrograms" value={formData.targetPrograms} onChange={handleChange} />
      </div>

      {/* This submits the form and updates the results */}
      <button
        type="submit"
        className="w-full bg-blue-600 text-white font-semibold py-3 rounded-xl hover:bg-blue-700 transition"
      >
        Analyze My PC
      </button>
    </form>
  );
}

//This makes a regular text input box
function Input({ label, name, value, onChange, required = false }) {
  return (
    <label className="block">
      <span className="text-sm font-semibold text-slate-700">
        {label} {required && <span className="text-red-500">*</span>}
      </span>

      <input
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        className="mt-1 w-full border border-slate-300 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        placeholder={`Enter ${label.toLowerCase()}`}
      />
    </label>
  );
}

//This makes a dropdown menu instead of a text input
function Select({ label, name, value, onChange, options, required = false }) {
  return (
    <label className="block">
      <span className="text-sm font-semibold text-slate-700">
        {label} {required && <span className="text-red-500">*</span>}
      </span>

      <select
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        className="mt-1 w-full border border-slate-300 rounded-xl px-4 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="" disabled>
          Select {label.toLowerCase()}
        </option>

        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}

export default SpecsForm;
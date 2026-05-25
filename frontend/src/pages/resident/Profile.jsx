// src/pages/resident/Profile.jsx
import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';

const Profile = () => {
  const { user } = useAuth();
  const { residents, updateResident } = useData();

  const [formData, setFormData] = useState({
    fullName: "",
    fatherName: "",
    motherName: "",
    gender: "Male",
    dob: "",
    kebele: "03",
    houseNo: "",
    phone: "",
    idNo: "",
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Find resident record matching logged-in user
  useEffect(() => {
    const foundResident = residents.find(r => 
      r.fullName?.toLowerCase() === (user?.name || "").toLowerCase()
    );

    if (foundResident) {
      setFormData({
        fullName: foundResident.fullName || "",
        fatherName: foundResident.fatherName || "",
        motherName: foundResident.motherName || "",
        gender: foundResident.gender || "Male",
        dob: foundResident.dob || "",
        kebele: foundResident.kebele || "03",
        houseNo: foundResident.houseNo || "",
        phone: foundResident.phone || "",
        idNo: foundResident.idNo || "",
      });
    }
  }, [residents, user]);

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);

    // Find the resident to update
    const residentToUpdate = residents.find(r => 
      r.fullName?.toLowerCase() === formData.fullName.toLowerCase()
    );

    if (residentToUpdate) {
      updateResident(residentToUpdate.id, {
        ...formData,
        lastUpdated: new Date().toISOString()
      });

      setSuccess(true);
      setTimeout(() => setSuccess(false), 2500);
    } else {
      alert("Could not find your record. Please contact the clerk.");
    }

    setLoading(false);
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-2">My Profile</h1>
      <p className="text-gray-600 mb-8">
        Update your information. Changes will be visible to clerks immediately.
      </p>

      <div className="bg-white rounded-2xl shadow p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-1">Full Name</label>
              <input type="text" name="fullName" value={formData.fullName} onChange={handleChange} className="input w-full" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Father's Name</label>
              <input type="text" name="fatherName" value={formData.fatherName} onChange={handleChange} className="input w-full" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Mother's Name</label>
              <input type="text" name="motherName" value={formData.motherName} onChange={handleChange} className="input w-full" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Gender</label>
              <select name="gender" value={formData.gender} onChange={handleChange} className="input w-full">
                <option>Male</option>
                <option>Female</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Date of Birth</label>
              <input type="date" name="dob" value={formData.dob} onChange={handleChange} className="input w-full" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Phone</label>
              <input type="tel" name="phone" value={formData.phone} onChange={handleChange} className="input w-full" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">House No.</label>
              <input type="text" name="houseNo" value={formData.houseNo} onChange={handleChange} className="input w-full" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">ID No.</label>
              <input type="text" name="idNo" value={formData.idNo} onChange={handleChange} className="input w-full" />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-black hover:bg-gray-800 text-white font-semibold py-4 rounded-xl transition"
          >
            {loading ? "Saving Changes..." : "Save Profile Changes"}
          </button>
        </form>

        {success && (
          <div className="mt-6 p-4 bg-green-100 border border-green-400 text-green-800 rounded-xl text-center">
            Profile updated successfully!<br />
            Clerks and administrators will see the latest information.
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
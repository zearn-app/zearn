import React, { useContext, useState, useEffect } from 'react';
import { Layout } from '../components/Layout';
import { UserContext } from '../App';
import { Store } from '../services/store';
import { useNavigate } from 'react-router-dom';
import { useNotification } from '../components/NotificationSystem';

const EditProfile: React.FC = () => {
  const { user, refreshUser } = useContext(UserContext);
  const navigate = useNavigate();
  const { notify } = useNotification();

  const [form, setForm] = useState({
    name: '',
    mobile: '',
    gender: 'Male',
    dob: '',
    district: '',
    state: '',
    country: 'India',
    password: ''
  });

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (user) {
      setForm({
        name: user.name || '',
        mobile: user.mobile || '',
        gender: user.gender || 'Male',
        dob: user.dob || '',
        district: user.district || '',
        state: user.state || '',
        country: user.country || 'India',
        password: ''
      });
    }
  }, [user]);

  if (!user) return null;

  const validatePassword = (password: string) => {
    if (!password) return true; // allow empty (if user doesn't want to change)
    const strongRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return strongRegex.test(password);
  };

  const handleSave = async () => {
    if (form.password && !validatePassword(form.password)) {
      notify(
        'Password must be 8+ chars with uppercase, number & special character',
        'error'
      );
      return;
    }

    setLoading(true);
    try {
      const updateData: any = { ...form };
      if (!form.password) {
        delete updateData.password;
      }

      await Store.updateUser(user.uid, updateData);
      await refreshUser();
      notify('Profile updated', 'success');
      navigate('/profile');
    } catch (e) {
      console.error('Update failed', e);
      notify('Update failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout title="Edit Profile" showBack>
      {/* Back Button */}
      <div className="mb-4">
        <button
          onClick={() => navigate(-1)}
          className="text-sm font-bold text-blue-600"
        >
          ← Back
        </button>
      </div>

      <div className="space-y-4 bg-white p-6 rounded-2xl shadow-sm">
        <div>
          <label className="text-xs font-bold text-gray-500 uppercase ml-1">
            Full Name
          </label>
          <input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full p-3 mt-1 rounded-xl border"
          />
        </div>

        <div>
          <label className="text-xs font-bold text-gray-500 uppercase ml-1">
            Mobile
          </label>
          <input
            value={form.mobile}
            onChange={(e) =>
              setForm({ ...form, mobile: e.target.value.replace(/\D/g, '') })
            }
            className="w-full p-3 mt-1 rounded-xl border"
          />
        </div>

        <div>
          <label className="text-xs font-bold text-gray-500 uppercase ml-1">
            Gender
          </label>
          <select
            value={form.gender}
            onChange={(e) => setForm({ ...form, gender: e.target.value })}
            className="w-full p-3 mt-1 rounded-xl border"
          >
            <option>Male</option>
            <option>Female</option>
            <option>Other</option>
          </select>
        </div>

        <div className="flex space-x-4">
          <div className="flex-1">
            <label className="text-xs font-bold text-gray-500 uppercase ml-1">
              DOB
            </label>
            <input
              type="date"
              value={form.dob}
              onChange={(e) => setForm({ ...form, dob: e.target.value })}
              className="w-full p-3 mt-1 rounded-xl border"
            />
          </div>
          <div className="flex-1">
            <label className="text-xs font-bold text-gray-500 uppercase ml-1">
              District
            </label>
            <input
              value={form.district}
              onChange={(e) => setForm({ ...form, district: e.target.value })}
              className="w-full p-3 mt-1 rounded-xl border"
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-bold text-gray-500 uppercase ml-1">
            State
          </label>
          <input
            value={form.state}
            onChange={(e) => setForm({ ...form, state: e.target.value })}
            className="w-full p-3 mt-1 rounded-xl border"
          />
        </div>

        {/* Password Field */}
        <div>
          <label className="text-xs font-bold text-gray-500 uppercase ml-1">
            New Password
          </label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={form.password}
              onChange={(e) =>
                setForm({ ...form, password: e.target.value })
              }
              placeholder="Leave empty if not changing"
              className="w-full p-3 mt-1 rounded-xl border pr-12"
            />
            <span
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-4 cursor-pointer select-none"
            >
              👁
            </span>
          </div>
        </div>

        <div className="pt-4">
          <button
            onClick={handleSave}
            disabled={loading}
            className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold"
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </Layout>
  );
};

export default EditProfile;

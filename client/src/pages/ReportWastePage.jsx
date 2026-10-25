import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  UploadCloud,
  MapPin,
  AlertTriangle,
  Check,
  X,
  FileText,
  ArrowLeft,
  Sparkles
} from 'lucide-react';
import { reportService } from '../services/api.js';
import { useNotification } from '../context/NotificationContext.jsx';
import { Link } from 'react-router-dom';

export const ReportWastePage = () => {
  const navigate = useNavigate();
  const { toast } = useNotification();

  const [formData, setFormData] = useState({
    title: '',
    category: 'plastic',
    description: '',
    location: '',
    urgency: 'medium'
  });

  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [detectingLocation, setDetectingLocation] = useState(false);

  const categories = [
    { id: 'plastic', label: 'Plastic', desc: 'Bottles, bags, containers' },
    { id: 'paper', label: 'Paper', desc: 'Cardboard boxes, packaging' },
    { id: 'glass', label: 'Glass', desc: 'Bottles, jars, broken glass' },
    { id: 'organic', label: 'Organic', desc: 'Food waste, yard cuttings' },
    { id: 'electronic', label: 'Electronic', desc: 'E-waste, cables, devices' },
    { id: 'mixed', label: 'Mixed', desc: 'General unsorted waste' }
  ];

  const urgencies = [
    { id: 'low', label: 'Low', desc: 'Minor accumulation, non-obstructive' },
    { id: 'medium', label: 'Medium', desc: 'Standard street/park cleanup' },
    { id: 'high', label: 'High', desc: 'Overflowing, odorous, blocking path' },
    { id: 'critical', label: 'Critical', desc: 'Hazardous, broken glass, chemical risk' }
  ];

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError('');
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!['image/jpeg', 'image/png', 'image/webp', 'image/jpg'].includes(file.type)) {
        toast.error('Only JPEG, PNG, and WebP images are supported');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size must be less than 5MB');
        return;
      }
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
  };

  const handleGeolocate = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser');
      return;
    }

    setDetectingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setFormData((prev) => ({
          ...prev,
          location: `GPS: ${latitude.toFixed(5)}, ${longitude.toFixed(5)} (Near current location)`
        }));
        setDetectingLocation(false);
        toast.success('Location detected successfully');
      },
      () => {
        setDetectingLocation(false);
        toast.info('Could not auto-detect location. Please type the address manually.');
      },
      { timeout: 8000 }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.location.trim() || !formData.description.trim()) {
      setError('Please complete all required fields.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const data = new FormData();
      data.append('title', formData.title);
      data.append('category', formData.category);
      data.append('description', formData.description);
      data.append('location', formData.location);
      data.append('urgency', formData.urgency);

      if (selectedFile) {
        data.append('image', selectedFile);
      }

      const res = await reportService.create(data);
      toast.success('Waste report submitted successfully! Status: Pending review.');
      navigate(`/reports/${res.data.report._id}`);
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to submit report';
      setError(msg);
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex items-center gap-3">
        <Link
          to="/reports"
          className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Report Waste Hazard</h1>
          <p className="text-xs text-slate-500">
            Submit a verified waste report to trigger municipal collection and earn reward points.
          </p>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold">
          {error}
        </div>
      )}

      {/* Main Form Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Report Title *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="e.g., Overflowing Plastic Bottles at City Park"
              required
              maxLength={120}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white transition-all"
            />
          </div>

          {/* Waste Category Selection */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Waste Category *
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {categories.map((cat) => (
                <button
                  type="button"
                  key={cat.id}
                  onClick={() => setFormData({ ...formData, category: cat.id })}
                  className={`p-3.5 rounded-2xl border text-left transition-all ${
                    formData.category === cat.id
                      ? 'bg-brand-50/70 border-brand-600 ring-2 ring-brand-500/20'
                      : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-slate-900 capitalize">{cat.label}</span>
                    {formData.category === cat.id && (
                      <Check className="w-4 h-4 text-brand-700" />
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">{cat.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Location with Geolocation Helper */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Location or Street Address *
              </label>
              <button
                type="button"
                onClick={handleGeolocate}
                disabled={detectingLocation}
                className="text-xs font-semibold text-brand-700 hover:text-brand-800 flex items-center gap-1 disabled:opacity-50"
              >
                <MapPin className="w-3.5 h-3.5" />
                <span>{detectingLocation ? 'Detecting GPS...' : 'Use current GPS'}</span>
              </button>
            </div>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleInputChange}
              placeholder="e.g., Riverside Walkway near Bench #12, Greenfield"
              required
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white transition-all"
            />
          </div>

          {/* Urgency Level */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Urgency Level
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {urgencies.map((urg) => (
                <button
                  type="button"
                  key={urg.id}
                  onClick={() => setFormData({ ...formData, urgency: urg.id })}
                  className={`p-3 rounded-xl border text-center transition-all ${
                    formData.urgency === urg.id
                      ? urg.id === 'critical'
                        ? 'bg-rose-50 border-rose-600 text-rose-900 ring-2 ring-rose-500/20'
                        : urg.id === 'high'
                        ? 'bg-amber-50 border-amber-600 text-amber-900 ring-2 ring-amber-500/20'
                        : 'bg-brand-50 border-brand-600 text-brand-900 ring-2 ring-brand-500/20'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:border-slate-300'
                  }`}
                >
                  <p className="text-xs font-bold uppercase tracking-wider">{urg.label}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Detailed Description */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Detailed Description *
            </label>
            <textarea
              name="description"
              rows={4}
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Describe the nature of the waste hazard, volume, estimated bags, or any access difficulties for the collection vehicle."
              required
              maxLength={1000}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white transition-all resize-none"
            ></textarea>
            <p className="text-[11px] text-slate-400 text-right mt-1">
              {formData.description.length} / 1000 characters
            </p>
          </div>

          {/* Photographic Evidence Image Upload */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Photo Evidence (Optional, max 5MB)
            </label>

            {previewUrl ? (
              <div className="relative rounded-2xl overflow-hidden border border-slate-200 max-w-sm">
                <img
                  src={previewUrl}
                  alt="Upload preview"
                  className="w-full h-48 object-cover"
                />
                <button
                  type="button"
                  onClick={handleRemoveFile}
                  className="absolute top-3 right-3 p-1.5 rounded-full bg-slate-900/70 text-white hover:bg-slate-900 transition-colors"
                  aria-label="Remove image"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-200 rounded-2xl cursor-pointer hover:border-brand-500 bg-slate-50/50 hover:bg-brand-50/20 transition-all">
                <UploadCloud className="w-8 h-8 text-brand-600 mb-2" />
                <span className="text-xs font-bold text-slate-700">Click to upload photo evidence</span>
                <span className="text-[11px] text-slate-400 mt-1">PNG, JPG, or WebP up to 5MB</span>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/jpg"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
            )}
          </div>

          {/* Submit Action */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <Link
              to="/reports"
              className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-semibold text-sm hover:bg-slate-50 transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 rounded-xl bg-brand-700 hover:bg-brand-800 disabled:opacity-60 text-white font-bold text-sm shadow-md transition-colors flex items-center gap-2"
            >
              {submitting ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Submit Waste Report</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReportWastePage;

import React, { useState, useEffect } from 'react';
import { User, Calendar, Briefcase, GraduationCap, Coffee, MapPin, Sparkles, X, Check, RotateCcw } from 'lucide-react';

const STATUS_OPTIONS = [
  { id: 'Professional', label: 'Professional', icon: Briefcase, color: '#1a73e8', bg: '#e8f0fe' },
  { id: 'Student', label: 'Student', icon: GraduationCap, color: '#137333', bg: '#e6f4ea' },
  { id: 'Unemployed', label: 'Unemployed', icon: Coffee, color: '#b06000', bg: '#fef7e0' },
];

export default function UserProfileModal({ isOpen, onClose, onSave, onReset, initialProfile }) {
  const [name, setName] = useState(initialProfile?.name || '');
  const [age, setAge] = useState(initialProfile?.age || '');
  const [status, setStatus] = useState(initialProfile?.status || 'Professional');
  const [location, setLocation] = useState(initialProfile?.location || '');
  const [latitude, setLatitude] = useState(initialProfile?.latitude || null);
  const [longitude, setLongitude] = useState(initialProfile?.longitude || null);
  const [isLocating, setIsLocating] = useState(false);
  const [locSuccess, setLocSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialProfile) {
      setName(initialProfile.name || '');
      setAge(initialProfile.age || '');
      setStatus(initialProfile.status || 'Professional');
      setLocation(initialProfile.location || '');
      setLatitude(initialProfile.latitude || null);
      setLongitude(initialProfile.longitude || null);
    }
  }, [initialProfile]);

  if (!isOpen) return null;

  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser.');
      return;
    }

    setIsLocating(true);
    setError('');

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setLatitude(lat);
        setLongitude(lng);
        setIsLocating(false);
        setLocSuccess(true);

        // Try reverse-geocoding via OpenStreetMap Nominatim for human-readable city
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=10`
          );
          if (res.ok) {
            const data = await res.json();
            const city =
              data.address?.city ||
              data.address?.town ||
              data.address?.county ||
              data.address?.state ||
              '';
            const country = data.address?.country || '';
            const detectedStr = [city, country].filter(Boolean).join(', ');
            if (detectedStr) {
              setLocation(detectedStr);
            } else {
              setLocation(`${lat.toFixed(3)}°, ${lng.toFixed(3)}°`);
            }
          } else {
            setLocation(`${lat.toFixed(3)}°, ${lng.toFixed(3)}°`);
          }
        } catch {
          setLocation(`${lat.toFixed(3)}°, ${lng.toFixed(3)}°`);
        }

        setTimeout(() => setLocSuccess(false), 3000);
      },
      (err) => {
        setIsLocating(false);
        console.warn('Geolocation error:', err.message);
        setError('Could not detect location. You can type it manually!');
      },
      { timeout: 8000 }
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please enter your name.');
      return;
    }
    if (!age || parseInt(age, 10) <= 0) {
      setError('Please enter a valid age.');
      return;
    }

    setError('');
    const profile = {
      name: name.trim(),
      age: parseInt(age, 10),
      status,
      location: location.trim(),
      latitude,
      longitude,
      savedAt: Date.now(),
    };

    onSave(profile);
  };

  const handleRestart = () => {
    if (window.confirm('Reset your profile and restart your session? This will clear saved data so you can start fresh with Kindy.')) {
      if (onReset) onReset();
      setName('');
      setAge('');
      setStatus('Professional');
      setLocation('');
      setLatitude(null);
      setLongitude(null);
      setError('');
    }
  };

  const isExisting = Boolean(initialProfile?.name);

  return (
    <div className="profile-modal-backdrop" role="dialog" aria-modal="true">
      <div className="profile-modal-card">
        {/* Close Button (only if user already has a saved profile) */}
        {isExisting && (
          <button
            type="button"
            className="profile-modal-close-btn"
            onClick={onClose}
            title="Close"
          >
            <X size={18} />
          </button>
        )}

        {/* Header */}
        <div className="profile-modal-header">
          <div className="profile-header-icon">
            <Sparkles size={24} className="profile-sparkle-icon" />
          </div>
          <h2 className="profile-modal-title">
            {isExisting ? 'Update Your Profile' : 'Welcome to Kindy! 👋'}
          </h2>
          <p className="profile-modal-subtitle">
            {isExisting
              ? 'Kindy remembers who you are and tailors conversations to you.'
              : "Tell Kindy a little about yourself so he can address you by name and personalize your experience!"}
          </p>
        </div>

        {error && <div className="profile-error-banner">{error}</div>}

        {/* Form */}
        <form onSubmit={handleSubmit} className="profile-form">
          {/* 1. Name */}
          <div className="profile-form-group">
            <label className="profile-field-label" htmlFor="user-name-input">
              <User size={16} />
              <span>What should Kindy call you?</span>
              <span className="required-star">*</span>
            </label>
            <input
              id="user-name-input"
              type="text"
              className="profile-text-input"
              placeholder="Your name or nickname..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
              maxLength={40}
            />
          </div>

          {/* 2. Age */}
          <div className="profile-form-group">
            <label className="profile-field-label" htmlFor="user-age-input">
              <Calendar size={16} />
              <span>Age</span>
              <span className="required-star">*</span>
            </label>
            <input
              id="user-age-input"
              type="number"
              className="profile-text-input"
              placeholder="e.g. 24"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              min={5}
              max={120}
            />
          </div>

          {/* 3. Life Stage / Status */}
          <div className="profile-form-group">
            <label className="profile-field-label">
              <Briefcase size={16} />
              <span>Life Stage / Occupation</span>
              <span className="required-star">*</span>
            </label>
            <div className="status-button-grid">
              {STATUS_OPTIONS.map((opt) => {
                const IconComp = opt.icon;
                const isSelected = status === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    className={`status-select-btn ${isSelected ? 'selected' : ''}`}
                    onClick={() => setStatus(opt.id)}
                    style={
                      isSelected
                        ? {
                            borderColor: opt.color,
                            backgroundColor: opt.bg,
                            color: opt.color,
                            fontWeight: 700,
                          }
                        : {}
                    }
                  >
                    <IconComp size={18} />
                    <span>{opt.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 4. Location (Optional) */}
          <div className="profile-form-group">
            <div className="location-label-row">
              <label className="profile-field-label" htmlFor="user-location-input">
                <MapPin size={16} />
                <span>Location</span>
                <span className="optional-tag">(Optional)</span>
              </label>
              <button
                type="button"
                className={`detect-location-btn ${isLocating ? 'loading' : ''} ${
                  locSuccess ? 'success' : ''
                }`}
                onClick={handleDetectLocation}
                disabled={isLocating}
                title="Click here to automatically detect your location via GPS"
              >
                {locSuccess ? (
                  <>
                    <Check size={14} />
                    <span>Detected!</span>
                  </>
                ) : isLocating ? (
                  <>
                    <span className="detect-radar-dot" />
                    <span>Detecting GPS...</span>
                  </>
                ) : (
                  <>
                    <span className="detect-radar-dot" />
                    <MapPin size={13} className="detect-pin-icon" />
                    <span>Click to Detect</span>
                  </>
                )}
              </button>
            </div>
            <input
              id="user-location-input"
              type="text"
              className="profile-text-input"
              placeholder="e.g. City, State, or Region..."
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
            <span className="location-hint">
              Used to personalize weather, Google Maps search, and local recommendations.
            </span>
          </div>

          {/* Submit & Restart Buttons */}
          <div className="profile-submit-row">
            {isExisting && (
              <button
                type="button"
                className="profile-restart-btn"
                onClick={handleRestart}
                title="Delete saved session and start fresh"
              >
                <RotateCcw size={16} />
                <span>Restart Session</span>
              </button>
            )}
            <button type="submit" className="profile-save-btn">
              <Sparkles size={18} />
              <span>{isExisting ? 'Update Profile' : "Save & Start Talking with Kindy"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}


import React, { useState, useRef } from 'react';
import htm from 'htm';
import { X, Camera } from 'lucide-react';

const html = htm.bind(React.createElement);

export const EditProfileModal = ({ userProfile, onClose }) => {
  const [formData, setFormData] = useState(userProfile);
  const headerInputRef = useRef(null);
  const avatarInputRef = useRef(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = (e, field) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, [field]: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    // Save to localStorage
    localStorage.setItem('haru_tweet_user', JSON.stringify(formData));
    // Dispatch event to update app state
    window.dispatchEvent(new Event('profileUpdated'));
    onClose();
  };

  return html`
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="bg-white w-full max-w-[600px] rounded-2xl h-[90vh] sm:h-[650px] overflow-y-auto relative flex flex-col">
        
        <!-- Header -->
        <div className="flex items-center justify-between px-4 py-3 sticky top-0 bg-white z-10">
            <div className="flex items-center gap-4">
                <button onClick=${onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors text-black">
                    <${X} size=${20} />
                </button>
                <h2 className="text-xl font-bold text-black">Edit Profile</h2>
            </div>
            <button 
                onClick=${handleSave}
                className="bg-black text-white font-bold px-4 py-1.5 rounded-full hover:bg-gray-800 transition-colors"
            >
                Save
            </button>
        </div>

        <!-- Banner Edit -->
        <div className="h-[200px] bg-gray-200 relative group">
            ${formData.headerUrl && html`
                <img src=${formData.headerUrl} className="w-full h-full object-cover opacity-75" />
            `}
            <div className="absolute inset-0 flex items-center justify-center gap-4 bg-black/10">
                <button 
                    onClick=${() => headerInputRef.current.click()}
                    className="p-3 bg-black/50 hover:bg-black/40 rounded-full text-white transition-colors"
                >
                    <${Camera} size=${20} />
                </button>
                <input 
                    type="file" 
                    ref=${headerInputRef} 
                    onChange=${(e) => handleImageUpload(e, 'headerUrl')} 
                    accept="image/*" 
                    className="hidden" 
                />
            </div>
        </div>

        <!-- Avatar Edit -->
        <div className="px-4 relative mb-4">
            <div className="-mt-[12%] w-[25%] min-w-[100px] relative group inline-block">
                <img 
                    src=${formData.avatarUrl} 
                    className="w-28 h-28 rounded-full border-4 border-white object-cover opacity-80" 
                />
                <div className="absolute inset-0 flex items-center justify-center">
                     <button 
                        onClick=${() => avatarInputRef.current.click()}
                        className="p-3 bg-black/50 hover:bg-black/40 rounded-full text-white transition-colors"
                    >
                        <${Camera} size=${20} />
                    </button>
                    <input 
                        type="file" 
                        ref=${avatarInputRef} 
                        onChange=${(e) => handleImageUpload(e, 'avatarUrl')} 
                        accept="image/*" 
                        className="hidden" 
                    />
                </div>
            </div>
        </div>

        <!-- Form Fields -->
        <div className="px-4 pb-10 flex flex-col gap-6">
            <${FloatingInput} 
                label="Name" 
                name="name" 
                value=${formData.name} 
                onChange=${handleChange} 
                maxLength=${50}
            />
             <${FloatingInput} 
                label="Handle (without @)" 
                name="handle" 
                value=${formData.handle.replace('@', '')} 
                onChange=${(e) => {
                    const val = e.target.value.startsWith('@') ? e.target.value : '@' + e.target.value;
                    handleChange({ target: { name: 'handle', value: val }});
                }} 
                prefix="@"
            />
            <div className="border border-gray-300 rounded-md focus-within:ring-2 focus-within:ring-[#1d9bf0] focus-within:border-[#1d9bf0] p-2 relative group">
                <label className="text-xs text-gray-500 group-focus-within:text-[#1d9bf0] block">Bio</label>
                <textarea 
                    name="bio"
                    value=${formData.bio}
                    onChange=${handleChange}
                    className="w-full bg-transparent text-black outline-none mt-1 resize-none"
                    rows=${3}
                ></textarea>
            </div>
             <${FloatingInput} 
                label="Location" 
                name="location" 
                value=${formData.location || ''} 
                onChange=${handleChange} 
            />
            
            <div className="flex gap-4">
                 <${FloatingInput} 
                    label="Following" 
                    name="following" 
                    type="text"
                    inputMode="numeric"
                    value=${formData.following ?? ''} 
                    onChange=${(e) => {
                        const val = e.target.value.replace(/[^0-9]/g, '');
                        handleChange({ target: { name: 'following', value: val }});
                    }} 
                />
                 <${FloatingInput} 
                    label="Followers" 
                    name="followers" 
                    type="text"
                    inputMode="numeric"
                    value=${formData.followers ?? ''} 
                    onChange=${(e) => {
                        const val = e.target.value.replace(/[^0-9]/g, '');
                        handleChange({ target: { name: 'followers', value: val }});
                    }} 
                />
            </div>
        </div>
      </div>
    </div>
  `;
};

const FloatingInput = ({ label, value, onChange, name, type = "text", prefix, maxLength, inputMode }) => html`
    <div className="border border-gray-300 rounded-md focus-within:ring-2 focus-within:ring-[#1d9bf0] focus-within:border-[#1d9bf0] px-3 py-1 relative group">
        <div className="flex justify-between">
            <label className="text-xs text-gray-500 group-focus-within:text-[#1d9bf0]">${label}</label>
            ${maxLength && html`<span className="text-xs text-gray-500 hidden group-focus-within:block">${value.length} / ${maxLength}</span>`}
        </div>
        <div className="flex items-center">
            ${prefix && html`<span className="text-[#1d9bf0] mr-0.5">${prefix}</span>`}
            <input 
                type=${type}
                name=${name}
                value=${value}
                onChange=${onChange}
                className="w-full bg-transparent text-black outline-none py-1"
                maxLength=${maxLength}
                inputMode=${inputMode}
            />
        </div>
    </div>
`;

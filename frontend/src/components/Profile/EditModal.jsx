import React from "react";
import { X, Loader2 } from "lucide-react"; 

const EditModal = ({ isOpen, onClose, title, children, onSave, isLoading }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* overlay blur */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
        onClick={!isLoading ? onClose : null} // disable close pas lagi loading
      />

      {/* modal content */}
      <div className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-[32px] bg-white p-8 shadow-2xl transform transition-all animate-in fade-in zoom-in duration-300">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-gray-800">{title}</h3>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400 disabled:opacity-50"
          >
            <X size={20} />
          </button>
        </div>

        <div className="space-y-4">{children}</div>

        <div className="mt-8 flex gap-3">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 py-3 px-4 rounded-2xl font-bold text-gray-500 bg-gray-100 hover:bg-gray-200 transition-all disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onSave}
            disabled={isLoading}
            className="flex-1 py-3 px-4 rounded-2xl font-bold text-white bg-[#22C55E] hover:bg-[#1eb053] shadow-lg shadow-green-100 transition-all disabled:opacity-70 flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditModal;

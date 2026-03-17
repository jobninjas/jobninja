import React from 'react';
import { Trash2, Loader2 } from 'lucide-react';

const ConfirmDeleteModal = ({
    isOpen,
    onClose,
    onConfirm,
    isDeleting,
    title = "Delete Resume?",
    message = "Are you sure you want to delete this resume? This action cannot be undone."
}) => {
    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4"
            onClick={onClose}
        >
            <div
                className="w-full max-w-md bg-white rounded-[32px] shadow-2xl overflow-hidden p-8 animate-in zoom-in-95 duration-300"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex justify-center mb-6">
                    <div className="p-4 bg-red-50 rounded-2xl">
                        <Trash2 className="w-10 h-10 text-red-500" />
                    </div>
                </div>
                <h2 className="text-2xl font-black text-slate-900 text-center mb-2">{title}</h2>
                <p className="text-slate-500 text-center mb-8 font-medium">{message}</p>

                <div className="grid grid-cols-2 gap-4">
                    <button
                        className="h-12 rounded-xl font-bold text-slate-500 hover:bg-slate-100 transition-colors"
                        onClick={onClose}
                        disabled={isDeleting}
                    >
                        Cancel
                    </button>
                    <button
                        className="h-12 rounded-xl bg-red-500 hover:bg-red-600 text-white font-bold shadow-lg flex items-center justify-center transition-colors"
                        onClick={onConfirm}
                        disabled={isDeleting}
                    >
                        {isDeleting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Delete'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmDeleteModal;

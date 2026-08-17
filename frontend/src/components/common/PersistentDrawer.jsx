import React, { useRef } from 'react';
import { X, Edit3, Check, ArrowLeft } from 'lucide-react';

export default function PersistentDrawer({
    selectedItem,
    onClose,
    isEditing,
    setIsEditing,
    onSave,
    children,
    editFormContent,
    customWidth,
}) {
    // Preserve last selected item in a ref during slide-out animation
    const lastItemRef = useRef(null);

    if (selectedItem) {
        lastItemRef.current = selectedItem;
    }

    const isOpen = Boolean(selectedItem);
    const activeItem = selectedItem || lastItemRef.current;

    if (!activeItem) {
        return null;
    }

    // Standardized responsive width
    const widthClasses = customWidth || 'w-full sm:w-[480px] lg:w-[480px] xl:w-[520px]';

    const handleBackOrCancel = () => {
        if (isEditing) {
            setIsEditing(false);
        } else {
            onClose();
        }
    };

    const handleClose = () => {
        if (setIsEditing) setIsEditing(false);
        onClose();
    };

    return (
        <>
            {/* Backdrop with smooth fade in/out */}
            <div
                onClick={handleClose}
                className={`
                    fixed inset-0 bg-slate-950/40 backdrop-blur-xs z-40
                    transition-opacity duration-300 ease-in-out
                    ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}
                `}
                aria-hidden="true"
            />

            {/* Right Drawer with smooth slide in/out from right */}
            <aside
                className={`
                    ${widthClasses}
                    bg-white border-l border-slate-200 flex flex-col shrink-0 h-full shadow-2xl
                    fixed top-0 right-0 bottom-0 z-50
                    transition-transform duration-300 ease-in-out
                    ${isOpen ? 'translate-x-0' : 'translate-x-full pointer-events-none'}
                `}
            >
                {/* DRAWER COMMAND HEADER */}
                <div className="p-4 border-b border-slate-200 bg-white/95 backdrop-blur-xs flex items-center justify-between sticky top-0 z-10 shrink-0">
                    <div className="flex items-center gap-2 min-w-0">
                        <button
                            onClick={handleBackOrCancel}
                            className="flex items-center gap-1 p-1.5 px-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
                            title={isEditing ? 'Cancel editing and return to view' : 'Close inspection'}
                        >
                            <ArrowLeft className="w-4 h-4" />
                            <span>{isEditing ? 'Cancel Edit' : 'Back'}</span>
                        </button>
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200 truncate">
                            {activeItem?.type}
                        </span>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                        {isEditing ? (
                            <div className="flex items-center gap-1.5">
                                <button
                                    onClick={() => setIsEditing(false)}
                                    className="text-xs font-semibold text-slate-600 hover:bg-slate-100 px-2.5 py-1.5 rounded-xl transition-colors cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={onSave}
                                    className="flex items-center gap-1 text-xs font-bold bg-slate-950 hover:bg-slate-800 text-white px-3.5 py-1.5 rounded-xl transition-all shadow-xs cursor-pointer active:scale-95"
                                >
                                    <Check className="w-3.5 h-3.5" /> Save
                                </button>
                            </div>
                        ) : (
                            editFormContent && (
                                <button
                                    onClick={() => setIsEditing(true)}
                                    className="flex items-center gap-1 text-xs font-bold text-slate-800 hover:text-slate-950 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-xl transition-colors cursor-pointer"
                                >
                                    <Edit3 className="w-3.5 h-3.5" /> Edit
                                </button>
                            )
                        )}
                        <button
                            onClick={handleClose}
                            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                            title="Close Drawer"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* DRAWER SCROLLABLE BODY */}
                <div className="flex-1 p-5 overflow-y-auto space-y-5 text-sm text-slate-700">
                    {isEditing ? (
                        <div className="space-y-5 animate-in fade-in duration-150">
                            {editFormContent}

                            {/* Bottom Edit Action Confirmation Bar */}
                            <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-200">
                                <button
                                    type="button"
                                    onClick={() => setIsEditing(false)}
                                    className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    onClick={onSave}
                                    className="px-4 py-2 text-xs font-bold bg-slate-950 hover:bg-slate-800 text-white rounded-xl shadow-xs transition-all cursor-pointer active:scale-95 flex items-center gap-1.5"
                                >
                                    <Check className="w-3.5 h-3.5" /> Save Changes
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="animate-in fade-in duration-150">{children}</div>
                    )}
                </div>
            </aside>
        </>
    );
}
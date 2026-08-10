import React from 'react';
import { X, Edit3, Check, ArrowLeft, Info, Activity, Sparkles } from 'lucide-react';

export default function PersistentDrawer({
    selectedItem,
    onClose,
    isEditing,
    setIsEditing,
    onSave,
    summaryTitle = "Workspace Summary",
    summaryStats = [],
    children,
    editFormContent,
}) {
    return (
        <div className="w-80 lg:w-96 bg-white border-l border-slate-200 flex flex-col shrink-0 h-full shadow-sm transition-all duration-200">
            {/* LEVEL 3 HEADER: RECORD MODE vs WORKSPACE SUMMARY MODE */}
            {selectedItem ? (
                <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <button
                            onClick={onClose}
                            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors"
                            title="Return to Summary"
                        >
                            <ArrowLeft className="w-4 h-4" />
                        </button>
                        <span className="text-xs font-bold uppercase tracking-wider text-sky-700 bg-sky-50 px-2 py-0.5 rounded-md border border-sky-100">
                            {selectedItem.type}
                        </span>
                    </div>

                    <div className="flex items-center gap-1">
                        {isEditing ? (
                            <button
                                onClick={onSave}
                                className="flex items-center gap-1 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white px-2.5 py-1.5 rounded-lg transition-colors shadow-sm"
                            >
                                <Check className="w-3.5 h-3.5" /> Save
                            </button>
                        ) : (
                            <button
                                onClick={() => setIsEditing(true)}
                                className="flex items-center gap-1 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 px-2 py-1.5 rounded-lg transition-colors"
                            >
                                <Edit3 className="w-3.5 h-3.5" /> Edit
                            </button>
                        )}
                        <button
                            onClick={onClose}
                            className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-lg transition-colors ml-1"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            ) : (
                <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Info className="w-4 h-4 text-slate-500" />
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">{summaryTitle}</h4>
                    </div>
                    <Sparkles className="w-4 h-4 text-amber-500" />
                </div>
            )}

            {/* DRAWER BODY */}
            <div className="flex-1 p-5 overflow-y-auto space-y-6 text-sm text-slate-700">
                {selectedItem ? (
                    isEditing ? (
                        <div className="space-y-4 animate-in fade-in duration-150">{editFormContent}</div>
                    ) : (
                        <div className="space-y-4 animate-in fade-in duration-150">{children}</div>
                    )
                ) : (
                    /* SUMMARY MODE (When no row is selected) */
                    <div className="space-y-6">
                        <div className="bg-sky-50/50 border border-sky-100 rounded-xl p-4">
                            <h5 className="text-xs font-semibold text-sky-900 uppercase tracking-wide mb-1">Quick Tip</h5>
                            <p className="text-xs text-sky-800 leading-relaxed">
                                Click on any property or unit row in the table to inspect details, view linked leases, or edit records directly without leaving this workspace.
                            </p>
                        </div>

                        <div>
                            <h5 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
                                <Activity className="w-3.5 h-3.5" /> Quick Stats
                            </h5>
                            <div className="space-y-2">
                                {summaryStats.map((stat, idx) => (
                                    <div key={idx} className="flex justify-between items-center p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                                        <span className="text-xs font-medium text-slate-500">{stat.label}</span>
                                        <span className="text-xs font-bold text-slate-800">{stat.value}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
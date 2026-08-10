import React from 'react';

export default function TableSkeleton({ rows = 5, cols = 4 }) {
    return (
        <div className="w-full space-y-3 animate-pulse p-4">
            {Array.from({ length: rows }).map((_, rIdx) => (
                <div key={rIdx} className="flex gap-4 items-center border-b border-slate-100 pb-3">
                    {Array.from({ length: cols }).map((_, cIdx) => (
                        <div
                            key={cIdx}
                            className={`h-4 bg-slate-200 rounded ${cIdx === 0 ? 'w-1/3' : 'flex-1'}`}
                        />
                    ))}
                </div>
            ))}
        </div>
    );
}
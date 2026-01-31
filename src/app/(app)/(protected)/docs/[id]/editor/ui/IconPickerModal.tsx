
"use client";

import React, { useState, useMemo } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DynamicIcon, AVAILABLE_ICON_NAMES } from "./DynamicIcon";
import { Search, X } from "lucide-react";

interface IconPickerModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSelect: (iconName: string) => void;
    currentIcon?: string;
}

export function IconPickerModal({
    open,
    onOpenChange,
    onSelect,
    currentIcon,
}: IconPickerModalProps) {
    const [searchQuery, setSearchQuery] = useState("");

    const filteredIcons = useMemo(() => {
        if (!searchQuery.trim()) return AVAILABLE_ICON_NAMES;
        const lowerQuery = searchQuery.toLowerCase();
        return AVAILABLE_ICON_NAMES.filter((name) =>
            name.toLowerCase().includes(lowerQuery)
        );
    }, [searchQuery]);

    const handleSelect = (iconName: string) => {
        onSelect(iconName);
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px] max-h-[80vh] flex flex-col p-0 gap-0 overflow-hidden bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800">
                <DialogHeader className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50">
                    <DialogTitle className="text-lg font-semibold tracking-tight">Select Icon</DialogTitle>
                    <div className="relative mt-2">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-zinc-500" />
                        <Input
                            placeholder="Search icons..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-9 bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800"
                            autoFocus
                        />
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery("")}
                                className="absolute right-2.5 top-2.5 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                    {filteredIcons.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-zinc-500">
                            <Search className="h-8 w-8 mb-3 opacity-50" />
                            <p>No icons found</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-6 sm:grid-cols-8 gap-2">
                            {filteredIcons.map((iconName) => {
                                const isSelected = currentIcon === iconName;
                                return (
                                    <Button
                                        key={iconName}
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => handleSelect(iconName)}
                                        title={iconName}
                                        className={`h-12 w-full rounded-xl transition-all hover:bg-zinc-100 dark:hover:bg-zinc-800 ${isSelected
                                                ? "bg-primary/10 text-primary hover:bg-primary/20 ring-2 ring-primary ring-inset"
                                                : "text-zinc-600 dark:text-zinc-400"
                                            }`}
                                    >
                                        <DynamicIcon name={iconName} size={24} />
                                    </Button>
                                );
                            })}
                        </div>
                    )}
                </div>

                <div className="px-6 py-3 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 text-xs text-zinc-500 flex justify-between">
                    <span>{filteredIcons.length} icons available</span>
                </div>
            </DialogContent>
        </Dialog>
    );
}

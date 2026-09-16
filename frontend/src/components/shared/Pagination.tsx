import React from "react";
import { Button } from "@/components/ui/button";
import { IconChevronLeft, IconChevronRight } from "@tabler/icons-react";

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    className?: string;
}

export function Pagination({
    currentPage,
    totalPages,
    onPageChange,
    className = "",
}: PaginationProps) {
    // Don't render if there's only 1 page (or 0)
    if (totalPages <= 1) return null;

    return (
        <div className={`flex items-center justify-center gap-2 py-4 ${className}`}>
            <Button
                variant="outline"
                size="icon"
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage <= 1}
                className="h-8 w-8"
            >
                <IconChevronLeft className="h-4 w-4" />
                <span className="sr-only">Previous page</span>
            </Button>

            <div className="text-sm font-medium text-muted-foreground">
                Page <span className="text-foreground">{currentPage}</span> of{" "}
                <span className="text-foreground">{totalPages}</span>
            </div>

            <Button
                variant="outline"
                size="icon"
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage >= totalPages}
                className="h-8 w-8"
            >
                <IconChevronRight className="h-4 w-4" />
                <span className="sr-only">Next page</span>
            </Button>
        </div>
    );
}

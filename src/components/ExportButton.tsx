"use client";

import React from "react";
import { BucketItem } from "@/types/bucket";
import toast from "react-hot-toast";

interface ExportButtonProps {
  items: BucketItem[];
}

export default function ExportButton({ items }: ExportButtonProps) {
  const [isExporting, setIsExporting] = React.useState(false);

  const exportAsPDF = async () => {
    setIsExporting(true);
    try {
      const { jsPDF } = await import("jspdf");
      const doc = new jsPDF();

      // Title
      doc.setFontSize(24);
      doc.setTextColor(236, 72, 153);
      doc.text("Our Bucket List", 105, 20, { align: "center" });

      // Subtitle
      doc.setFontSize(10);
      doc.setTextColor(100, 116, 139);
      doc.text(
        `${items.length} dreams | ${items.filter((i) => i.status === "Completed").length} completed`,
        105,
        28,
        { align: "center" },
      );

      let y = 40;
      const lineHeight = 8;
      const pageHeight = 280;

      items.forEach((item, index) => {
        if (y > pageHeight) {
          doc.addPage();
          y = 20;
        }

        // Status indicator
        const statusIcon =
          item.status === "Completed"
            ? "[x]"
            : item.status === "In Progress"
              ? "[-]"
              : "[ ]";

        // Title line
        doc.setFontSize(11);
        doc.setTextColor(30, 41, 59);
        doc.text(`${statusIcon} ${index + 1}. ${item.title}`, 15, y);
        y += lineHeight * 0.7;

        // Details
        doc.setFontSize(8);
        doc.setTextColor(100, 116, 139);
        const details = `${item.category} | ${item.priority} priority${item.target_date ? ` | Target: ${new Date(item.target_date).toLocaleDateString()}` : ""}`;
        doc.text(details, 25, y);
        y += lineHeight * 0.6;

        if (item.description) {
          doc.text(item.description.substring(0, 80), 25, y);
          y += lineHeight * 0.6;
        }

        y += lineHeight * 0.3;
      });

      // Footer
      doc.setFontSize(8);
      doc.setTextColor(148, 163, 184);
      doc.text(`Generated on ${new Date().toLocaleDateString()}`, 105, 290, {
        align: "center",
      });

      doc.save("our-bucket-list.pdf");
      toast.success("PDF exported successfully!");
    } catch {
      toast.error("Failed to export PDF");
    } finally {
      setIsExporting(false);
    }
  };

  const copyShareLink = () => {
    const url = `${window.location.origin}/share`;
    navigator.clipboard
      .writeText(url)
      .then(() => {
        toast.success("Share link copied!");
      })
      .catch(() => {
        toast.error("Could not copy link");
      });
  };

  return (
    <div className="flex gap-2">
      <button
        onClick={exportAsPDF}
        disabled={isExporting || items.length === 0}
        className="btn-secondary text-sm flex items-center gap-2 disabled:opacity-50"
      >
        {isExporting ? (
          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
              fill="none"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        ) : (
          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3"
            />
          </svg>
        )}
        Export PDF
      </button>
      <button
        onClick={copyShareLink}
        className="btn-secondary text-sm flex items-center gap-2"
      >
        <svg
          className="w-4 h-4"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z"
          />
        </svg>
        Share
      </button>
    </div>
  );
}

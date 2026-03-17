"use client";

interface InlineEditableProps {
  value: string;
  onEdit: (value: string) => void;
  tag?: "h1" | "h2" | "h3" | "p" | "span";
  multiline?: boolean;
  className?: string;
  style?: React.CSSProperties;
  editable?: boolean;
}

export function InlineEditable({
  value,
  onEdit,
  tag: Tag = "p",
  multiline = false,
  className = "",
  style = {},
  editable = true,
}: InlineEditableProps) {
  const handleChange = (e: React.FocusEvent<HTMLDivElement>) => {
    const text = e.currentTarget.textContent || "";
    onEdit(text);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (!multiline && e.key === "Enter") {
      e.preventDefault();
      e.currentTarget.blur();
    }
  };

  if (!editable) {
    return (
      <Tag className={className} style={style}>
        {value}
      </Tag>
    );
  }

  return (
    <div
      contentEditable
      suppressContentEditableWarning
      onBlur={handleChange}
      onKeyDown={handleKeyDown}
      className={`outline-none focus:ring-2 focus:ring-offset-2 rounded transition-all ${className}`}
      style={{
        ...style,
        outlineWidth: 0,
      }}
      title="Click to edit"
    >
      {value}
    </div>
  );
}

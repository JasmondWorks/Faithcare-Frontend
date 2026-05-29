import React from "react";
import { Card } from "./card";
import { Search } from "lucide-react";

export default function SearchBar({
  placeholder,
  value,
  onChange,
}: {
  placeholder: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <label className="flex items-center gap-3 border border-border rounded-lg px-4 py-2.5 cursor-pointer hover:border-accent hover:text-accent outline-0 focus-within:ring-1 focus-within:ring-accent focus-within:border-accent focus-within:outline-0 transition-all duration-300 max-w-[450px] bg-white">
      <Search className="text-neutral-500 pointer-events-none size-4.5" />
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className="bg-transparent outline-none text-accent-foreground w-full placeholder:text-neutral-400"
      />
    </label>
  );
}

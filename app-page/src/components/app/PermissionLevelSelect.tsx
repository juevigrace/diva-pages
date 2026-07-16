import { useState } from 'react';

interface PermissionLevelSelectProps {
  pid: string;
  currentLevel: string;
  onLevelChanged: () => void;
}

export default function PermissionLevelSelect({ pid, currentLevel, onLevelChanged }: PermissionLevelSelectProps) {
  const [updating, setUpdating] = useState(false);

  const handleChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    setUpdating(true);
    try {
      const res = await fetch(`/api/permissions/${pid}/level`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ level: e.target.value }),
      });
      if (res.ok) {
        onLevelChanged();
      }
    } finally {
      setUpdating(false);
    }
  };

  return (
    <select
      className="border-border bg-background rounded-md border px-2 py-0.5 text-xs font-medium shadow-sm"
      defaultValue={currentLevel}
      disabled={updating}
      onChange={handleChange}
    >
      <option value="USER">USER</option>
      <option value="MODERATOR">MODERATOR</option>
      <option value="ADMIN">ADMIN</option>
    </select>
  );
}
